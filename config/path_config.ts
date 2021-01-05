/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from "path";
type PlaceholderType = string | number | boolean | bigint;

type Join<T extends readonly PlaceholderType[], S extends string> = T extends readonly [
    infer P,
    ...infer R
]
    ? P extends PlaceholderType
        ? [] extends R
            ? P
            : R extends PlaceholderType[]
            ? `${P}${S}${Join<R, S>}`
            : never
        : ""
    : [] extends T
    ? ""
    : string;

const joinPath = <T extends string[]>(...args_: T) => path.join(...args_) as Join<T, "/">;

import packageJson from "../package.json";
// basically homepage key should not be set.
//@ts-ignore ignoring because of tsc emitting error when key is not defined in imported json.
export const homePage = (packageJson.homepage as string | undefined) || "./";

export const projectRootDir = path.resolve(__dirname, "../");
// production should be dumped to
const productionDirRelative = "electron_built";
export const productionDir = joinPath(projectRootDir, productionDirRelative);

/* ************************************************************************************************
                                      PATHS FOR MAIN PROCESS
**************************************************************************************************/

const mainDirName = "electron_main";

const sourceDir = "src";
const mainPathsRelative = {
    sourceDir,
    entryPoint: joinPath(sourceDir, "main.ts"),
    tsConfigDev: "tsconfig.dev.json",
    tsConfigProd: "tsconfig.prod.json",
} as const;

const mainPathsAbs = _relativeToAbs(mainPathsRelative, projectRootDir, mainDirName);

const productionFilename = "main.bundle.js";
const productionEntryPoint = joinPath(productionDir, productionFilename);
export const mainPaths = {
    ...mainPathsAbs,
    productionEntryPoint,
} as const;

/* ************************************************************************************************
                                    PATHS FOR RENDERER PROCESS
**************************************************************************************************/
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

function _relativeToAbs<T extends Record<string, string>, U extends string, R extends string>(
    relativeRecord_: T,
    projectRootDir_: U,
    specificDir_: R
) {
    return Object.fromEntries(
        Object.entries(relativeRecord_).map(([key_, value_]) => {
            return [key_, joinPath(projectRootDir_, specificDir_, value_)];
        })
    ) as {
        [P in keyof T]: Join<[U, R, T[P]], "/">;
    };
}
