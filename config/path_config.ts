/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from "path";
import packageJsonContent from "../package.json";

import { joinPath, relativeToAbs, RelativeToAbs } from "./util/join_path";

// basically homepage key should not be set.
//@ts-ignore ignoring because of tsc emitting error when key is not defined in imported json.
export const homePage = (packageJsonContent.homepage as string | undefined) || "./";

export const projectRootDir = path.resolve(__dirname, "../");
// production should be dumped to
export const productionDirRelative = "electron_built";
export const productionDir = joinPath(projectRootDir, productionDirRelative);

export const packageJson = joinPath(projectRootDir, "package.json");
export const nodeModules = joinPath(projectRootDir, "node_modules");
export const yarnLockFile = joinPath(projectRootDir, "yarn.lock");
export const dotenv = joinPath(projectRootDir, ".env");

export const moduleFileExtensions = [
    "web.mjs",
    "mjs",
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
];

/* ************************************************************************************************
                                      PATHS FOR MAIN PROCESS
**************************************************************************************************/

const mainDirName = "electron_main";
const mainSourceDir = "src";
const mainPathsRelative = {
    sourceDir: mainSourceDir,
    entryPoint: joinPath(mainSourceDir, "main.ts"),
    tsConfigDev: "tsconfig.dev.json",
    tsConfigProd: "tsconfig.prod.json",
} as const;
const mainProductionFilename = "main.bundle.js";

export const mainPaths = {
    productionDir: joinPath(productionDir, "main"),
    ...relativeToAbs(mainPathsRelative, projectRootDir, mainDirName),
    productionEntryPoint: joinPath(productionDir, "main", mainProductionFilename),
} as const;

/* ************************************************************************************************
                                    PATHS FOR RENDERER PROCESS
**************************************************************************************************/
const rendererDirName = "electron_renderer";

const relativeToRendererDir = {
    public: "public",
    html: "public/index.html",
    indexJs: "src/index",
    src: "src",
    tsConfig: "tsconfig.json",
    jsConfig: "jsconfig.json",
    testsSetup: "src/setupTests",
    proxySetup: "src/setupProxy.js",
    swSrc: "src/service-worker",
} as const;

export const rendererPaths = {
    build: joinPath(productionDirRelative, "renderer"),
    dotenv: ".env",
    path: rendererDirName,
    packageJson: "package.json",
    yarnLockFile: "yarn.lock",
    nodeModules: "node_modules",
    ...relativeToAbs(relativeToRendererDir, rendererDirName),
} as const;

/* ************************************************************************************************
                                    PATHS BETWEEN BUILT
**************************************************************************************************/

export const mainToRendererEntryPoint = path.relative(
    mainPaths.productionEntryPoint,
    path.join(projectRootDir, rendererPaths.build, path.basename(rendererPaths.html))
);
