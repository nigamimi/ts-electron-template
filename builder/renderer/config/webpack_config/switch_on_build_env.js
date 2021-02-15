"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSwitchOnBuilEnv = void 0;
const webpack_env_1 = require("./webpack_env");
const buildSwitchOnBuilEnv = (env) => (input) => {
    if (env === webpack_env_1.WebpackEnv.prod)
        return input.prod;
    if (env === webpack_env_1.WebpackEnv.dev)
        return input.dev;
    return input.other;
};
exports.buildSwitchOnBuilEnv = buildSwitchOnBuilEnv;
