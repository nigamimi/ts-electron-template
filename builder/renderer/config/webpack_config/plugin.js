"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPluginSetting = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const case_sensitive_paths_webpack_plugin_1 = __importDefault(require("case-sensitive-paths-webpack-plugin"));
const InlineChunkHtmlPlugin_1 = __importDefault(require("react-dev-utils/InlineChunkHtmlPlugin"));
const webpack_manifest_plugin_1 = __importDefault(require("webpack-manifest-plugin"));
const InterpolateHtmlPlugin_1 = __importDefault(require("react-dev-utils/InterpolateHtmlPlugin"));
const workbox_webpack_plugin_1 = __importDefault(require("workbox-webpack-plugin"));
const WatchMissingNodeModulesPlugin_1 = __importDefault(require("react-dev-utils/WatchMissingNodeModulesPlugin"));
const eslint_webpack_plugin_1 = __importDefault(require("eslint-webpack-plugin"));
//@ts-expect-error
const ModuleNotFoundPlugin_1 = __importDefault(require("react-dev-utils/ModuleNotFoundPlugin"));
const fork_ts_checker_webpack_plugin_1 = __importDefault(require("fork-ts-checker-webpack-plugin"));
const typescriptFormatter = require("react-dev-utils/typescriptFormatter");
const react_refresh_webpack_plugin_1 = __importDefault(require("@pmmmwh/react-refresh-webpack-plugin"));
const resolve_1 = __importDefault(require("resolve"));
const webpack_env_1 = require("./webpack_env");
const createPluginSetting = (buildEnv, paths, env, webpackDevClientEntry, reactRefreshOverlayEntry, swSrc, { shouldInlineRuntimeChunk, shouldUseReactRefresh, useTypeScript, disableESLintPlugin, emitErrorsAsWarnings, hasJsxRuntime, }) => {
    const isDevBuild = buildEnv === webpack_env_1.WebpackEnv.dev;
    const isProdBuild = buildEnv === webpack_env_1.WebpackEnv.prod;
    return [
        // Generates an `index.html` file with the <script> injected.
        new html_webpack_plugin_1.default({
            ...{
                inject: true,
                template: paths.appHtml,
            },
            ...(isProdBuild
                ? {
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        keepClosingSlash: true,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true,
                    },
                }
                : void 0),
        }),
        // Inlines the webpack runtime script. This script is too small to warrant
        // a network request.
        // https://github.com/facebook/create-react-app/issues/5358
        isProdBuild && shouldInlineRuntimeChunk
            ? new InlineChunkHtmlPlugin_1.default(html_webpack_plugin_1.default, [/runtime-.+[.]js/])
            : null,
        // Makes some environment variables available in index.html.
        // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
        // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
        // It will be an empty string unless you specify "homepage"
        // in `package.json`, in which case it will be the pathname of that URL.
        new InterpolateHtmlPlugin_1.default(html_webpack_plugin_1.default, env.raw),
        // This gives some necessary context to module not found errors, such as
        // the requesting resource.
        new ModuleNotFoundPlugin_1.default(paths.appPath),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV is set to production
        // during a production build.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack_1.default.DefinePlugin(env.stringified),
        // This is necessary to emit hot updates (CSS and Fast Refresh):
        isDevBuild && new webpack_1.default.HotModuleReplacementPlugin(),
        // Experimental hot reloading for React .
        // https://github.com/facebook/react/tree/master/packages/react-refresh
        isDevBuild &&
            shouldUseReactRefresh &&
            new react_refresh_webpack_plugin_1.default({
                overlay: {
                    entry: webpackDevClientEntry,
                    // The expected exports are slightly different from what the overlay exports,
                    // so an interop is included here to enable feedback on module-level errors.
                    module: reactRefreshOverlayEntry,
                    // Since we ship a custom dev client and overlay integration,
                    // the bundled socket handling logic can be eliminated.
                    sockIntegration: false,
                },
            }),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebook/create-react-app/issues/240
        isDevBuild && new case_sensitive_paths_webpack_plugin_1.default(),
        // If you require a missing module and then `npm install` it, you still have
        // to restart the development server for webpack to discover it. This plugin
        // makes the discovery automatic so you don't have to restart.
        // See https://github.com/facebook/create-react-app/issues/186
        isDevBuild && new WatchMissingNodeModulesPlugin_1.default(paths.appNodeModules),
        isProdBuild &&
            new mini_css_extract_plugin_1.default({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "static/css/[name].[contenthash:8].css",
                chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
            }),
        // Generate an asset manifest file with the following content:
        // - "files" key: Mapping of all asset filenames to their corresponding
        //   output file so that tools can pick it up without having to parse
        //   `index.html`
        // - "entrypoints" key: Array of files which are included in `index.html`,
        //   can be used to reconstruct the HTML if necessary
        new webpack_manifest_plugin_1.default({
            fileName: "asset-manifest.json",
            publicPath: paths.publicUrlOrPath,
            generate: (seed, files, entrypoints) => {
                const manifestFiles = files.reduce((manifest, file) => {
                    if (file.name)
                        manifest[file.name] = file.path;
                    return manifest;
                }, seed);
                const entrypointFiles = entrypoints.main.filter((fileName) => !fileName.endsWith(".map"));
                return {
                    files: manifestFiles,
                    entrypoints: entrypointFiles,
                };
            },
        }),
        // Moment.js is an extremely popular library that bundles large locale files
        // by default due to how webpack interprets its code. This is a practical
        // solution that requires the user to opt into importing specific locales.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // You can remove this if you don't use Moment.js:
        new webpack_1.default.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // Generate a service worker script that will precache, and keep up to date,
        // the HTML & assets that are part of the webpack build.
        isProdBuild &&
            fs_1.default.existsSync(swSrc) &&
            new workbox_webpack_plugin_1.default.InjectManifest({
                swSrc,
                dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
                exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
                // Bump up the default maximum size (2mb) that's precached,
                // to make lazy-loading failure scenarios less likely.
                // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            }),
        // TypeScript type checking
        useTypeScript &&
            new fork_ts_checker_webpack_plugin_1.default({
                typescript: resolve_1.default.sync("typescript", {
                    basedir: paths.appNodeModules,
                }),
                async: isDevBuild,
                checkSyntacticErrors: true,
                resolveModuleNameModule: process.versions.pnp ? `${__dirname}/pnpTs.js` : undefined,
                resolveTypeReferenceDirectiveModule: process.versions.pnp
                    ? `${__dirname}/pnpTs.js`
                    : undefined,
                tsconfig: paths.appTsConfig,
                reportFiles: [
                    // This one is specifically to match during CI tests,
                    // as micromatch doesn't match
                    // '../cra-template-typescript/template/src/App.tsx'
                    // otherwise.
                    "../**/src/**/*.{ts,tsx}",
                    "**/src/**/*.{ts,tsx}",
                    "!**/src/**/__tests__/**",
                    "!**/src/**/?(*.)(spec|test).*",
                    "!**/src/setupProxy.*",
                    "!**/src/setupTests.*",
                ],
                silent: true,
                // The formatter is invoked directly in WebpackDevServerUtils during development
                formatter: isProdBuild ? typescriptFormatter : undefined,
            }),
        !disableESLintPlugin &&
            new eslint_webpack_plugin_1.default({
                // Plugin options
                extensions: ["js", "mjs", "jsx", "ts", "tsx"],
                formatter: require.resolve("react-dev-utils/eslintFormatter"),
                eslintPath: require.resolve("eslint"),
                emitWarning: isDevBuild && emitErrorsAsWarnings,
                context: paths.appSrc,
                cache: true,
                cacheLocation: path_1.default.resolve(paths.appNodeModules, ".cache/.eslintcache"),
                // ESLint class options
                cwd: paths.appPath,
                resolvePluginsRelativeTo: __dirname,
                baseConfig: {
                    extends: [require.resolve("eslint-config-react-app/base")],
                    rules: {
                        ...(!hasJsxRuntime && {
                            "react/react-in-jsx-scope": "error",
                        }),
                    },
                },
            }),
    ].filter(Boolean);
};
exports.createPluginSetting = createPluginSetting;
