import path from "path";

// local npm sub mod located at builder/main
import type { PathConfigRelative } from "electron-main-builder/dist/config/path_config";

// abs path to appDir
export const appDir = path.resolve(__dirname, "../electron_main");
export const buildDirAbsolute = path.resolve(__dirname, "../electron_built/main");

export const pathsRelative: PathConfigRelative = {
    dotenv: ".env",
    appPath: ".",
    appEntryPoint: "./src/main.ts",
    appPackageJson: "../package.json",
    appPreload: "./src/preload.ts",
    appSrc: "./src",
    appTsConfig: "./tsconfig.prod.json",
    yarnLockFile: "../yarn.lock",
    appNodeModules: "../node_modules",
};
