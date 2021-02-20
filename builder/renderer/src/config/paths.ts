"use strict";

import path from "path";
import fs from "fs";
import getPublicUrlOrPath from "react-dev-utils/getPublicUrlOrPath";

import { PathConfig } from "./path_config";

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

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn: (str: string) => string, filePath: string) => {
    const extension = moduleFileExtensions.find((extension) =>
        fs.existsSync(resolveFn(`${filePath}.${extension}`))
    );

    if (extension) {
        return resolveFn(`${filePath}.${extension}`);
    }

    return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
export const getPaths = (
    appDir: string,
    pathsRelative: Omit<PathConfig, "appBuild" | "publicUrlOrPath" | "moduleFileExtensions">,
    buildDirAbsolute?: string,
    homepage?: string
): PathConfig => {
    // Make sure any symlinks in the project folder are resolved:
    // https://github.com/facebook/create-react-app/issues/637
    const appDirectoryReal = fs.realpathSync(appDir);
    const resolveApp = (relativePath: string) => path.resolve(appDirectoryReal, relativePath);

    const buildPath = buildDirAbsolute || resolveApp(process.env.BUILD_PATH || "build");

    // We use `PUBLIC_URL` environment variable or "homepage" field to infer
    // "public path" at which the app is served.
    // webpack needs to know it to put the right <script> hrefs into HTML even in
    // single-page apps that may serve index.html for nested URLs like /todos/42.
    // We can't use a relative path in HTML because we don't want to load something
    // like /todos/42/static/js/bundle.7289d.js. We have to know the root.
    const publicUrlOrPath = getPublicUrlOrPath(
        process.env.NODE_ENV === "development",
        homepage,
        process.env.PUBLIC_URL
    );

    return {
        // dotenv: resolveApp(".env"),
        // appPath: resolveApp("."),
        // appBuild: resolveApp(buildPath),
        // appPublic: resolveApp("public"),
        // appHtml: resolveApp("public/index.html"),
        // appIndexJs: resolveModule(resolveApp, "src/index"),
        // appPackageJson: resolveApp("../package.json"),
        // appSrc: resolveApp("src"),
        // appTsConfig: resolveApp("tsconfig.json"),
        // appJsConfig: resolveApp("jsconfig.json"),
        // yarnLockFile: resolveApp("../yarn.lock"),
        // testsSetup: resolveModule(resolveApp, "src/setupTests"),
        // proxySetup: resolveApp("src/setupProxy.js"),
        // appNodeModules: resolveApp("../node_modules"),
        // swSrc: resolveModule(resolveApp, "src/service-worker"),
        ...(Object.fromEntries(
            Object.entries(pathsRelative).map(([key, value]) => {
                return [key, resolveApp(value)];
            })
        ) as Omit<
            PathConfig,
            | "appBuild"
            | "publicUrlOrPath"
            | "moduleFileExtensions"
            | "appIndexJs"
            | "testsSetup"
            | "swSrc"
        >),
        appBuild: buildPath,
        appIndexJs: resolveModule(resolveApp, pathsRelative.appIndexJs),
        testsSetup: resolveModule(resolveApp, pathsRelative.testsSetup),
        swSrc: resolveModule(resolveApp, pathsRelative.swSrc),
        publicUrlOrPath,
        moduleFileExtensions,
    };
};
