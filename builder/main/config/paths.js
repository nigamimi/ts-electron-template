"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaths = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getPaths = (appDir, pathsRelative, buildDirRelative) => {
    const appDirectoryReal = fs_1.default.realpathSync(appDir);
    const resolveApp = (relativePath) => path_1.default.resolve(appDirectoryReal, relativePath);
    return {
        ...Object.fromEntries(Object.entries(pathsRelative).map(([key, value]) => {
            return [key, resolveApp(value)];
        })),
        appBuild: resolveApp(buildDirRelative),
    };
};
exports.getPaths = getPaths;
