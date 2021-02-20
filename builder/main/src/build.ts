// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
    throw err;
});

/*!*************************************************************************************************
                                            IMPORTS
***************************************************************************************************/

import chalk from "chalk";
import fse from "fs-extra";

import webpack from "webpack";
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages";
import {
    measureFileSizesBeforeBuild,
    printFileSizesAfterBuild,
    OpaqueFileSizes,
} from "react-dev-utils/FileSizeReporter";

import printBuildError from "react-dev-utils/printBuildError";

import bfj from "bfj";

import { setEnv } from "./config/env";

// import devConfig from "./config/webpack.config.main.dev";
import prodConfigFactory from "./config/webpack.config.main.prod";
import { PathConfigRelative } from "./config/path_config";

import { getPaths } from "./config/paths";

/*!*************************************************************************************************
                                            CONSTANTS
***************************************************************************************************/

const argv = process.argv.slice(2);
const writeStatsJson = argv.indexOf("--stats") !== -1;

/*!*************************************************************************************************
                                            MAIN
***************************************************************************************************/
export const build = async (
    dotenvPath: string | undefined,
    appDir: string,
    pathsRelative: PathConfigRelative,
    buildDirAbsolute: string
) => {
    console.log(
        chalk.magenta(`webpack version: ${(await import("webpack/package.json")).version}`)
    );

    if (dotenvPath) setEnv(dotenvPath);
    const paths = getPaths(appDir, pathsRelative, buildDirAbsolute);

    try {
        // First, read the current file sizes in build directory.
        // This lets us display how much they changed later.
        const previousFileSizes = await measureFileSizesBeforeBuild(paths.appBuild);

        fse.emptyDirSync(paths.appBuild);
        // Start the webpack build
        try {
            // Generate configuration
            const config = prodConfigFactory(paths);
            const { stats, warnings } = await webpackBuild(config);

            if (writeStatsJson && stats) {
                await bfj
                    .write(paths.appBuild + "/bundle-stats.json", stats.toJson())
                    .catch((error: string) => {
                        throw new Error(error);
                    });
            }

            printMessage(paths, previousFileSizes, stats!, warnings);
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
    return await new Promise<[Error | undefined, webpack.Stats | undefined]>((r) =>
        compiler.run((err, stats) => r([err, stats]))
    );
};

const formatMessage = (err: Error | undefined, stats: webpack.Stats | undefined) => {
    const messages = (() => {
        if (err) {
            if (!err.message) throw err;
            return formatErrorMessage(err);
        } else {
            const statsJson = stats!.toJson({ all: false, warnings: true, errors: true });
            //@ts-ignore 'formatWebpackMessages' uses only warnings and errors as string[]
            return formatWebpackMessages({
                //@ts-ignore
                warnings: statsJson.warnings?.map((warning) => warning.message) ?? [],
                //@ts-ignore
                errors: statsJson.errors?.map((error) => error.message) ?? [],
            });
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
    paths: { appBuild: string },
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
    printFileSizesAfterBuild(stats, previousFileSizes, paths.appBuild);
    console.log();
};
