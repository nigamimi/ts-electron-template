/* eslint-disable @typescript-eslint/naming-convention */
import path from "path";

import type webpack from "webpack";

import { mainPaths } from "./path_config";

export const baseConfig: webpack.Configuration = {
    target: "electron-main",
    entry: {
        main: mainPaths.entryPoint,
        preload: mainPaths.preload,
    },
    output: {
        filename: "[name].js",
        path: mainPaths.productionDir,
        // commonjs2 is module spec for node.js
        // for node.js is extended pure commonjs
        // https://github.com/webpack/webpack/issues/1114
        libraryTarget: "commonjs2",
    },
    node: {
        __dirname: true,
        __filename: true,
    },
    resolve: {
        extensions: [".ts", ".tsx", ".json"],
        modules: [path.resolve(__dirname, "../", "node_modules")],
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            name: false,
        },
    },
    performance: false,
};
