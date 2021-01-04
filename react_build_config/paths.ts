// this source file is derived from "create-react-app@4.0.1" with "yarn eject" command

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */

import path from "path";
import fs from "fs";
import getPublicUrlOrPath from "react-dev-utils/getPublicUrlOrPath";

//addition
import { projectRootDir, rendererPaths, homePage } from "../config/path_config";

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(projectRootDir); //modification
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === "development",
    //modification
    homePage,
    process.env.PUBLIC_URL
);

const moduleFileExtensions = [
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
const resolveModule = (resolveFn: (relativePath: string) => string, filePath: string) => {
    const extension = moduleFileExtensions.find((extension) =>
        fs.existsSync(resolveFn(`${filePath}.${extension}`))
    );

    if (extension) {
        return resolveFn(`${filePath}.${extension}`);
    }

    return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
export default {
    //whole this exportation is modification
    dotenv: resolveApp(rendererPaths.dotenv),
    appPath: resolveApp(rendererPaths.path),
    appBuild: resolveApp(rendererPaths.build),
    appPublic: resolveApp(rendererPaths.public),
    appHtml: resolveApp(rendererPaths.html),
    appIndexJs: resolveModule(resolveApp, rendererPaths.indexJs),
    appPackageJson: resolveApp(rendererPaths.packageJson),
    appSrc: resolveApp(rendererPaths.src),
    appTsConfig: resolveApp(rendererPaths.tsConfig),
    appJsConfig: resolveApp(rendererPaths.jsConfig),
    yarnLockFile: resolveApp(rendererPaths.yarnLockFile),
    testsSetup: resolveModule(resolveApp, rendererPaths.testsSetup),
    proxySetup: resolveApp(rendererPaths.proxySetup),
    appNodeModules: resolveApp(rendererPaths.nodeModules),
    swSrc: resolveModule(resolveApp, rendererPaths.swSrc),
    publicUrlOrPath,
    moduleFileExtensions,
};
