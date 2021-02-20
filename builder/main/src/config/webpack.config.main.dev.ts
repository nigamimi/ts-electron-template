/* eslint-disable @typescript-eslint/naming-convention */
// import path from "path";

import type webpack from "webpack";
import { merge } from "webpack-merge";

import baseConfig from "./webpack.config.main.base";
import { PathConfig } from "./path_config";

export default (paths: PathConfig): webpack.Configuration => {
    return merge(baseConfig(paths), {
        mode: "development",
        devtool: "inline-source-map",
    });
};
