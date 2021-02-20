// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
    throw err;
});

// no side-effect for importing this mod.
// calling setEnv is doing all the side-effect.
import { setEnv } from "./config/env";

/*!*************************************************************************************************
                                            IMPORTS
***************************************************************************************************/

import path from "path";

import chalk from "chalk";
import fse from "fs-extra";

import webpack from "webpack";
import checkRequiredFiles from "react-dev-utils/checkRequiredFiles";
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages";
import printHostingInstructions from "react-dev-utils/printHostingInstructions";
import {
    measureFileSizesBeforeBuild,
    printFileSizesAfterBuild,
    OpaqueFileSizes,
} from "react-dev-utils/FileSizeReporter";

import printBuildError from "react-dev-utils/printBuildError";

import bfj from "bfj";

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
import { checkBrowsers } from "react-dev-utils/browsersHelper";
import configFactory from "./config/webpack.config";
import { PathConfigRelative } from "./config/path_config";
import { getPaths } from "./config/paths";

/*!*************************************************************************************************
                                            CONSTANTS
***************************************************************************************************/

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const isInteractive = process.stdout.isTTY;

const argv = process.argv.slice(2);
const writeStatsJson = argv.indexOf("--stats") !== -1;

/*!*************************************************************************************************
                                            MAIN
***************************************************************************************************/
export const build = async (
    dotenvPath: string,
    appDir: string,
    pathsRelative: PathConfigRelative,
    buildDirAbsolute?: string,
    homePage?: string
) => {
    setEnv(dotenvPath);
    const paths = getPaths(appDir, pathsRelative, buildDirAbsolute, homePage);

    const useYarn = fse.existsSync(paths.yarnLockFile);
    // Warn and crash if required files are missing
    if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
        process.exit(1);
    }

    try {
        await checkBrowsers(paths.appPath, isInteractive);

        // First, read the current file sizes in build directory.
        // This lets us display how much they changed later.
        const previousFileSizes = await measureFileSizesBeforeBuild(paths.appBuild);

        fse.emptyDirSync(paths.appBuild);
        // Merge with the public folder
        copyPublicFolder(paths);
        // Start the webpack build
        try {
            // Generate configuration
            const config = configFactory("production", paths);
            const { stats, warnings } = await webpackBuild(config);

            if (writeStatsJson) {
                await bfj
                    .write(paths.appBuild + "/bundle-stats.json", stats.toJson())
                    .catch((error: string) => {
                        throw new Error(error);
                    });
            }

            printMessage(config, paths, useYarn, previousFileSizes, stats, warnings);
        } catch (err) {
            if (!(err instanceof Error)) {
                throw new Error("unknown error");
            }
            const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === "true";
            if (tscCompileOnError) {
                console.log(
                    chalk.yellow(
                        "Compiled with the following type errors (you may want to check these before deploying your app):\n"
                    )
                );
                printBuildError(err);
            } else {
                console.log(chalk.red("Failed to compile.\n"));
                printBuildError(err);
                process.exit(1);
            }
        }
    } catch (err) {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    }
};

/*!*************************************************************************************************
                                          FUNCTIONS
***************************************************************************************************/
const copyPublicFolder = (paths: { appPublic: string; appBuild: string; appHtml: string }) => {
    fse.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: (file) => file !== paths.appHtml,
    });
};

const webpackBuild = async (config: webpack.Configuration) => {
    console.log("Creating an optimized production build...");
    const [err, stats] = await webpackCompile(config);

    const messages = formatMessage(err, stats);

    return {
        stats,
        warnings: messages.warnings,
    };
};

const webpackCompile = async (configOrCompiler: webpack.Configuration | webpack.Compiler) => {
    const compiler =
        configOrCompiler instanceof webpack.Compiler ? configOrCompiler : webpack(configOrCompiler);
    return await new Promise<[Error | null, webpack.Stats]>((r) =>
        compiler.run((err, stats) => r([err, stats]))
    );
};

const formatMessage = (err: Error | null, stats: webpack.Stats) => {
    const messages = (() => {
        if (err) {
            if (!err.message) throw err;
            return formatErrorMessage(err);
        } else {
            return formatWebpackMessages(
                stats.toJson({ all: false, warnings: true, errors: true })
            );
        }
    })();

    if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
            messages.errors.length = 1;
        }
        throw new Error(messages.errors.join("\n\n"));
    }
    if (
        process.env.CI &&
        (typeof process.env.CI !== "string" || process.env.CI.toLowerCase() !== "false") &&
        messages.warnings.length
    ) {
        console.log(
            chalk.yellow(
                "\nTreating warnings as errors because process.env.CI = true.\n" +
                    "Most CI servers set it automatically.\n"
            )
        );
        throw new Error(messages.warnings.join("\n\n"));
    }

    return messages;
};
const formatErrorMessage = (err: Error) => {
    let errMessage = err.message;

    // Add additional information for postcss errors
    if (Object.prototype.hasOwnProperty.call(err, "postcssNode")) {
        errMessage +=
            "\nCompileError: Begins at CSS selector " +
            //@ts-ignore
            err["postcssNode"].selector;
    }

    return formatWebpackMessages({
        errors: [errMessage],
        warnings: [],
        _showErrors: true,
        _showWarnings: true,
    });
};

const printMessage = (
    config: webpack.Configuration,
    paths: { appBuild: string; appPackageJson: string; publicUrlOrPath: string },
    useYarn: boolean,
    previousFileSizes: OpaqueFileSizes,
    stats: webpack.Stats,
    warnings: string[]
) => {
    if (warnings.length) {
        console.log(chalk.yellow("Compiled with warnings.\n"));
        console.log(warnings.join("\n\n"));
        console.log(
            "\nSearch for the " +
                chalk.underline(chalk.yellow("keywords")) +
                " to learn more about each warning."
        );
        console.log(
            "To ignore, add " + chalk.cyan("// eslint-disable-next-line") + " to the line before.\n"
        );
    } else {
        console.log(chalk.green("Compiled successfully.\n"));
    }

    console.log("File sizes after gzip:\n");
    printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
    );
    console.log();

    const appPackage = require(paths.appPackageJson);
    const publicUrl = paths.publicUrlOrPath;
    const publicPath = config.output!.publicPath!;
    const buildFolder = path.relative(process.cwd(), paths.appBuild);
    printHostingInstructions(appPackage, publicUrl, publicPath, buildFolder, useYarn);
};
