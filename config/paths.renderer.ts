import path from "path";

// local npm sub mod located at builder/renderer
import type { PathConfigRelative } from "create-react-app-builder/dist/config/path_config";

// abs path to appDir
export const appDir = path.resolve(__dirname, "../electron_renderer");
export const buildDirAbsolute = path.resolve(__dirname, "../electron_built/renderer");

export const pathsRelative: PathConfigRelative = {
    dotenv: ".env",
    appPath: ".",
    appPublic: "public",
    appHtml: "public/index.html",
    appIndexJs: "src/index",
    appPackageJson: "../package.json",
    appSrc: "src",
    appTsConfig: "tsconfig.renderer.json",
    appJsConfig: "jsconfig.renderer.json",
    yarnLockFile: "../yarn.lock",
    testsSetup: "src/setupTests",
    proxySetup: "src/setupProxy.ts",
    appNodeModules: "../node_modules",
    swSrc: "src/service-worker",
};
