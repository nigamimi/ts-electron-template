import path from "path";

export const projectRootDir = path.resolve(__dirname, "../");

// basically homepage key should not be set.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const homePage = (require("../package.json").homepage as string | undefined) || "./";

export const rendererPaths = {
    dotenv: ".env",
    path: "renderer",
    build: "renderer/build",
    public: "renderer/public",
    html: "renderer/public/index.html",
    indexJs: "renderer/src/index",
    packageJson: "package.json",
    src: "renderer/src",
    tsConfig: "renderer/tsconfig.json",
    jsConfig: "renderer/jsconfig.json",
    yarnLockFile: "yarn.lock",
    testsSetup: "renderer/src/setupTests",
    proxySetup: "renderer/src/setupProxy.js",
    nodeModules: "node_modules",
    swSrc: "renderer/src/service-worker",
} as const;
