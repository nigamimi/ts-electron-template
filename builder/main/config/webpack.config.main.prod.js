"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
// import path from "path";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_merge_1 = require("webpack-merge");
// import TerserPlugin from "terser-webpack-plugin";
const webpack_config_main_base_1 = __importDefault(require("./webpack.config.main.base"));
exports.default = (paths) => {
    return webpack_merge_1.merge(webpack_config_main_base_1.default(paths), {
        mode: "production",
    });
};
