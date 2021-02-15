"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModules = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import paths from "./paths";
const chalk_1 = __importDefault(require("chalk"));
const resolve_1 = __importDefault(require("resolve"));
/**
 * Get additional module paths based on the baseUrl of a compilerOptions object.
 *
 * @param {Object} options
 */
function getAdditionalModulePaths(options = {}, paths) {
    const baseUrl = options.baseUrl;
    if (!baseUrl) {
        return "";
    }
    const baseUrlResolved = path_1.default.resolve(paths.appPath, baseUrl);
    // We don't need to do anything if `baseUrl` is set to `node_modules`. This is
    // the default behavior.
    if (path_1.default.relative(paths.appNodeModules, baseUrlResolved) === "") {
        return null;
    }
    // Allow the user set the `baseUrl` to `appSrc`.
    if (path_1.default.relative(paths.appSrc, baseUrlResolved) === "") {
        return [paths.appSrc];
    }
    // If the path is equal to the root directory we ignore it here.
    // We don't want to allow importing from the root directly as source files are
    // not transpiled outside of `src`. We do allow importing them with the
    // absolute path (e.g. `src/Components/Button.js`) but we set that up with
    // an alias.
    if (path_1.default.relative(paths.appPath, baseUrlResolved) === "") {
        return null;
    }
    // Otherwise, throw an error.
    throw new Error(chalk_1.default.red.bold("Your project's `baseUrl` can only be set to `src` or `node_modules`." +
        " Create React App does not support other values at this time."));
}
/**
 * Get webpack aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 */
function getWebpackAliases(options = {}, paths) {
    const baseUrl = options.baseUrl;
    if (!baseUrl) {
        return {};
    }
    const baseUrlResolved = path_1.default.resolve(paths.appPath, baseUrl);
    if (path_1.default.relative(paths.appPath, baseUrlResolved) === "") {
        return {
            src: paths.appSrc,
        };
    }
}
/**
 * Get jest aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 */
function getJestAliases(options = {}, paths) {
    const baseUrl = options.baseUrl;
    if (!baseUrl) {
        return {};
    }
    const baseUrlResolved = path_1.default.resolve(paths.appPath, baseUrl);
    if (path_1.default.relative(paths.appPath, baseUrlResolved) === "") {
        return {
            "^src/(.*)$": "<rootDir>/src/$1",
        };
    }
}
function getModules(paths) {
    // Check if TypeScript is setup
    const hasTsConfig = fs_1.default.existsSync(paths.appTsConfig);
    const hasJsConfig = fs_1.default.existsSync(paths.appJsConfig);
    if (hasTsConfig && hasJsConfig) {
        throw new Error("You have both a tsconfig.json and a jsconfig.json. If you are using TypeScript please remove your jsconfig.json file.");
    }
    let config;
    // If there's a tsconfig.json we assume it's a
    // TypeScript project and set up the config
    // based on tsconfig.json
    if (hasTsConfig) {
        const ts = require(resolve_1.default.sync("typescript", {
            basedir: paths.appNodeModules,
        }));
        config = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile).config;
        // Otherwise we'll check if there is jsconfig.json
        // for non TS projects.
    }
    else if (hasJsConfig) {
        config = require(paths.appJsConfig);
    }
    config = config || {};
    const options = config.compilerOptions || {};
    const additionalModulePaths = getAdditionalModulePaths(options, paths);
    return {
        additionalModulePaths: additionalModulePaths,
        webpackAliases: getWebpackAliases(options, paths),
        jestAliases: getJestAliases(options, paths),
        hasTsConfig,
    };
}
exports.getModules = getModules;
