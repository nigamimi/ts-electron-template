"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const path_1 = __importDefault(require("path"));
exports.default = (paths) => {
    return {
        target: "electron-main",
        entry: {
            main: paths.appEntryPoint,
            preload: paths.appPreload,
        },
        output: {
            filename: "[name].js",
            path: paths.appBuild,
            // commonjs2 is module spec for node.js
            // for node.js is extended pure commonjs
            // https://github.com/webpack/webpack/issues/1114
            libraryTarget: "commonjs2",
            chunkFilename: "chunk/[name].chunk.js",
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts)$/,
                    use: {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                            configFile: paths.appTsConfig,
                        },
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        node: {
            __dirname: true,
            __filename: true,
        },
        resolve: {
            extensions: [".ts", ".tsx", ".json"],
            modules: [path_1.default.resolve(__dirname, "../", "node_modules")],
        },
        optimization: {
            splitChunks: {
                chunks: "all",
                name: false,
            },
        },
        performance: false,
    };
};
