"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
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
const env_1 = require("./config/env");
/*!*************************************************************************************************
                                            IMPORTS
***************************************************************************************************/
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const webpack_1 = __importDefault(require("webpack"));
const checkRequiredFiles_1 = __importDefault(require("react-dev-utils/checkRequiredFiles"));
const formatWebpackMessages_1 = __importDefault(require("react-dev-utils/formatWebpackMessages"));
const printHostingInstructions_1 = __importDefault(require("react-dev-utils/printHostingInstructions"));
const FileSizeReporter_1 = require("react-dev-utils/FileSizeReporter");
const printBuildError_1 = __importDefault(require("react-dev-utils/printBuildError"));
const bfj_1 = __importDefault(require("bfj"));
// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const browsersHelper_1 = require("react-dev-utils/browsersHelper");
const webpack_config_1 = __importDefault(require("./config/webpack.config"));
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
const build = async (dotenvPath, appDir, pathsRelative, buildDirRelative) => {
    env_1.setEnv(dotenvPath);
    const { getPaths } = await Promise.resolve().then(() => __importStar(require("./config/paths")));
    const paths = getPaths(appDir, pathsRelative, buildDirRelative);
    const useYarn = fs_extra_1.default.existsSync(paths.yarnLockFile);
    // Warn and crash if required files are missing
    if (!checkRequiredFiles_1.default([paths.appHtml, paths.appIndexJs])) {
        process.exit(1);
    }
    try {
        await browsersHelper_1.checkBrowsers(paths.appPath, isInteractive);
        // First, read the current file sizes in build directory.
        // This lets us display how much they changed later.
        const previousFileSizes = await FileSizeReporter_1.measureFileSizesBeforeBuild(paths.appBuild);
        fs_extra_1.default.emptyDirSync(paths.appBuild);
        // Merge with the public folder
        copyPublicFolder(paths);
        // Start the webpack build
        try {
            // Generate configuration
            const config = webpack_config_1.default("production", paths);
            const { stats, warnings } = await webpackBuild(config);
            if (writeStatsJson) {
                await bfj_1.default
                    .write(paths.appBuild + "/bundle-stats.json", stats.toJson())
                    .catch((error) => {
                    throw new Error(error);
                });
            }
            printMessage(config, paths, useYarn, previousFileSizes, stats, warnings);
        }
        catch (err) {
            if (!(err instanceof Error)) {
                throw new Error("unknown error");
            }
            const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === "true";
            if (tscCompileOnError) {
                console.log(chalk_1.default.yellow("Compiled with the following type errors (you may want to check these before deploying your app):\n"));
                printBuildError_1.default(err);
            }
            else {
                console.log(chalk_1.default.red("Failed to compile.\n"));
                printBuildError_1.default(err);
                process.exit(1);
            }
        }
    }
    catch (err) {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    }
};
exports.build = build;
/*!*************************************************************************************************
                                          FUNCTIONS
***************************************************************************************************/
const copyPublicFolder = (paths) => {
    fs_extra_1.default.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: (file) => file !== paths.appHtml,
    });
};
const webpackBuild = async (config) => {
    console.log("Creating an optimized production build...");
    const [err, stats] = await webpackCompile(config);
    const messages = formatMessage(err, stats);
    return {
        stats,
        warnings: messages.warnings,
    };
};
const webpackCompile = async (configOrCompiler) => {
    const compiler = configOrCompiler instanceof webpack_1.default.Compiler ? configOrCompiler : webpack_1.default(configOrCompiler);
    return await new Promise((r) => compiler.run((err, stats) => r([err, stats])));
};
const formatMessage = (err, stats) => {
    const messages = (() => {
        if (err) {
            if (!err.message)
                throw err;
            return formatErrorMessage(err);
        }
        else {
            return formatWebpackMessages_1.default(stats.toJson({ all: false, warnings: true, errors: true }));
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
    if (process.env.CI &&
        (typeof process.env.CI !== "string" || process.env.CI.toLowerCase() !== "false") &&
        messages.warnings.length) {
        console.log(chalk_1.default.yellow("\nTreating warnings as errors because process.env.CI = true.\n" +
            "Most CI servers set it automatically.\n"));
        throw new Error(messages.warnings.join("\n\n"));
    }
    return messages;
};
const formatErrorMessage = (err) => {
    let errMessage = err.message;
    // Add additional information for postcss errors
    if (Object.prototype.hasOwnProperty.call(err, "postcssNode")) {
        errMessage +=
            "\nCompileError: Begins at CSS selector " +
                //@ts-ignore
                err["postcssNode"].selector;
    }
    return formatWebpackMessages_1.default({
        errors: [errMessage],
        warnings: [],
        _showErrors: true,
        _showWarnings: true,
    });
};
const printMessage = (config, paths, useYarn, previousFileSizes, stats, warnings) => {
    if (warnings.length) {
        console.log(chalk_1.default.yellow("Compiled with warnings.\n"));
        console.log(warnings.join("\n\n"));
        console.log("\nSearch for the " +
            chalk_1.default.underline(chalk_1.default.yellow("keywords")) +
            " to learn more about each warning.");
        console.log("To ignore, add " + chalk_1.default.cyan("// eslint-disable-next-line") + " to the line before.\n");
    }
    else {
        console.log(chalk_1.default.green("Compiled successfully.\n"));
    }
    console.log("File sizes after gzip:\n");
    FileSizeReporter_1.printFileSizesAfterBuild(stats, previousFileSizes, paths.appBuild, WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE);
    console.log();
    const appPackage = require(paths.appPackageJson);
    const publicUrl = paths.publicUrlOrPath;
    const publicPath = config.output.publicPath;
    const buildFolder = path_1.default.relative(process.cwd(), paths.appBuild);
    printHostingInstructions_1.default(appPackage, publicUrl, publicPath, buildFolder, useYarn);
};
