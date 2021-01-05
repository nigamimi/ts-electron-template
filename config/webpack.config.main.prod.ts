/* eslint-disable @typescript-eslint/naming-convention */
// import path from "path";

import type webpack from "webpack";
import { merge } from "webpack-merge";
// import TerserPlugin from "terser-webpack-plugin";

import { baseConfig } from "./webpack.config.main.base";
import { mainPaths } from "./path_config";

const prodConfig: webpack.Configuration = merge(baseConfig, {
    mode: "production",
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
                        configFile: mainPaths.tsConfigProd,
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
});

export default prodConfig;
