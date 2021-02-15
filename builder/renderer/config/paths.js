"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaths = exports.moduleFileExtensions = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getPublicUrlOrPath_1 = __importDefault(require("react-dev-utils/getPublicUrlOrPath"));
exports.moduleFileExtensions = [
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
const resolveModule = (resolveFn, filePath) => {
    const extension = exports.moduleFileExtensions.find((extension) => fs_1.default.existsSync(resolveFn(`${filePath}.${extension}`)));
    if (extension) {
        return resolveFn(`${filePath}.${extension}`);
    }
    return resolveFn(`${filePath}.js`);
};
// config after eject: we're in ./config/
const getPaths = (appDir, pathsRelative, buildDirRelative, homepage) => {
    // Make sure any symlinks in the project folder are resolved:
    // https://github.com/facebook/create-react-app/issues/637
    const appDirectoryReal = fs_1.default.realpathSync(appDir);
    const resolveApp = (relativePath) => path_1.default.resolve(appDirectoryReal, relativePath);
    const buildPath = buildDirRelative || process.env.BUILD_PATH || "build";
    // We use `PUBLIC_URL` environment variable or "homepage" field to infer
    // "public path" at which the app is served.
    // webpack needs to know it to put the right <script> hrefs into HTML even in
    // single-page apps that may serve index.html for nested URLs like /todos/42.
    // We can't use a relative path in HTML because we don't want to load something
    // like /todos/42/static/js/bundle.7289d.js. We have to know the root.
    const publicUrlOrPath = getPublicUrlOrPath_1.default(process.env.NODE_ENV === "development", homepage, process.env.PUBLIC_URL);
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
        ...Object.fromEntries(Object.entries(pathsRelative).map(([key, value]) => {
            return [key, resolveApp(value)];
        })),
        appBuild: resolveApp(buildPath),
        appIndexJs: resolveModule(resolveApp, pathsRelative.appIndexJs),
        testsSetup: resolveModule(resolveApp, pathsRelative.testsSetup),
        swSrc: resolveModule(resolveApp, pathsRelative.swSrc),
        publicUrlOrPath,
        moduleFileExtensions: exports.moduleFileExtensions,
    };
};
exports.getPaths = getPaths;
