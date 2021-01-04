import path from "path";

export const projectRootDir = path.resolve(__dirname, "../");

// basically homepage key should not be set.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const homePage = (require("../package.json").homepage as string | undefined) || "./";

export const rendererPaths = {
    dotenv: ".env",
    path: "electron_renderer",
    build: "electron_renderer/build",
    public: "electron_renderer/public",
    html: "electron_renderer/public/index.html",
    indexJs: "electron_renderer/src/index",
    packageJson: "package.json",
    src: "electron_renderer/src",
    tsConfig: "electron_renderer/tsconfig.json",
    jsConfig: "electron_renderer/jsconfig.json",
    yarnLockFile: "yarn.lock",
    testsSetup: "electron_renderer/src/setupTests",
    proxySetup: "electron_renderer/src/setupProxy.js",
    nodeModules: "node_modules",
    swSrc: "electron_renderer/src/service-worker",
} as const;
