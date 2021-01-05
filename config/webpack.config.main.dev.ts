/* eslint-disable @typescript-eslint/naming-convention */
// import path from "path";

import type webpack from "webpack";
import { merge } from "webpack-merge";

import { baseConfig } from "./webpack.config.main.base";
import { mainPaths } from "./path_config";

const devConfig: webpack.Configuration = merge(baseConfig, {
    mode: "development",
    devtool: "inline-source-map",
    output: {
        chunkFilename: "main_chunk/[name].chunk.js",
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                        configFile: mainPaths.tsConfigDev,
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
});

export default devConfig;
