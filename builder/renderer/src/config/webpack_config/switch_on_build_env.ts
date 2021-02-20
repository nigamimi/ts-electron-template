import { WebpackEnv } from "./webpack_env";

export const buildSwitchOnBuilEnv = (env: WebpackEnv) => <T, U, R>(input: {
    prod: T;
    dev: U;
    other: R;
}) => {
    if (env === WebpackEnv.prod) return input.prod;
    if (env === WebpackEnv.dev) return input.dev;
    return input.other;
};
