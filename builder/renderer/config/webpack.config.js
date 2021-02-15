"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
//@ts-expect-error
const pnp_webpack_plugin_1 = __importDefault(require("pnp-webpack-plugin"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const optimize_css_assets_webpack_plugin_1 = __importDefault(require("optimize-css-assets-webpack-plugin"));
const postcss_safe_parser_1 = __importDefault(require("postcss-safe-parser"));
const ModuleScopePlugin_1 = __importDefault(require("react-dev-utils/ModuleScopePlugin"));
const modules_1 = require("./modules");
const env_1 = __importDefault(require("./env"));
const webpackDevClientEntry = require.resolve("react-dev-utils/webpackHotDevClient");
const reactRefreshOverlayEntry = require.resolve("react-dev-utils/refreshOverlayInterop");
const module_1 = require("./webpack_config/module");
const plugin_1 = require("./webpack_config/plugin");
const switch_on_build_env_1 = require("./webpack_config/switch_on_build_env");
const webpack_env_1 = require("./webpack_config/webpack_env");
// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
function default_1(webpackEnv, paths) {
    console.log("make sure you are not using this config function for webpack-cli directly");
    const buildEnv = webpackEnv === "development" || webpackEnv === "dev"
        ? webpack_env_1.WebpackEnv.dev
        : webpackEnv === "production" || webpackEnv === "prod"
            ? webpack_env_1.WebpackEnv.prod
            : webpack_env_1.WebpackEnv.other;
    // Get the path to the uncompiled service worker (if it exists).
    const swSrc = paths.swSrc;
    const appPackageJsonName = require(paths.appPackageJson).name;
    // Variable used for enabling profiling in Production
    // passed into alias object. Uses a flag if passed into the build command
    const isEnvProductionProfile = buildEnv !== webpack_env_1.WebpackEnv.prod ? false : process.argv.includes("--profile");
    // Check if TypeScript is setup
    const useTypeScript = fs_1.default.existsSync(paths.appTsConfig);
    // Source maps are resource heavy and can cause out of memory issue for large source files.
    const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
    // Some apps do not need the benefits of saving a web request, so not inlining the chunk
    // makes for a smoother build process.
    const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== "false";
    const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === "true";
    const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === "true";
    const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || "10000");
    const hasJsxRuntime = (() => {
        if (process.env.DISABLE_NEW_JSX_TRANSFORM === "true") {
            return false;
        }
        try {
            require.resolve("react/jsx-runtime");
            return true;
        }
        catch (e) {
            return false;
        }
    })();
    // We will provide `paths.publicUrlOrPath` to our app
    // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
    // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
    // Get environment variables to inject into our app.
    const env = env_1.default(paths.publicUrlOrPath.slice(0, -1));
    const shouldUseReactRefresh = env.raw.FAST_REFRESH;
    const modules = modules_1.getModules(paths);
    const config = createWebpackConfig(buildEnv, env, paths, modules, appPackageJsonName, swSrc, imageInlineSizeLimit, {
        useTypeScript,
        shouldUseSourceMap,
        shouldInlineRuntimeChunk,
        emitErrorsAsWarnings,
        disableESLintPlugin,
        hasJsxRuntime,
        isEnvProductionProfile,
        shouldUseReactRefresh,
    });
    return config;
}
exports.default = default_1;
const createWebpackConfig = (buildEnv, env, paths, modules, appPackageJsonName, swSrc, imageInlineSizeLimit, flags) => {
    var _a;
    // return input value based on build env
    const switchOnEnv = switch_on_build_env_1.buildSwitchOnBuilEnv(buildEnv);
    const isDevBuild = buildEnv === webpack_env_1.WebpackEnv.dev;
    const isProdBuild = buildEnv === webpack_env_1.WebpackEnv.prod;
    const isOtherBuild = buildEnv === webpack_env_1.WebpackEnv.other;
    const { useTypeScript, shouldUseSourceMap, isEnvProductionProfile, shouldUseReactRefresh, } = flags;
    return {
        mode: switchOnEnv({ prod: "production", dev: "development", other: void 0 }),
        // Stop compilation early in production
        bail: isProdBuild,
        devtool: switchOnEnv({
            prod: shouldUseSourceMap && "source-map",
            dev: "cheap-module-source-map",
            other: void 0,
        }),
        // These are the "entry points" to our application.
        // This means they will be the "root" imports that are included in JS bundle.
        entry: isDevBuild && !shouldUseReactRefresh
            ? [
                // Include an alternative client for WebpackDevServer. A client's job is to
                // connect to WebpackDevServer by a socket and get notified about changes.
                // When you save a file, the client will either apply hot updates (in case
                // of CSS changes), or refresh the page (in case of JS changes). When you
                // make a syntax error, this client will display a syntax error overlay.
                // Note: instead of the default WebpackDevServer client, we use a custom one
                // to bring better experience for Create React App users. You can replace
                // the line below with these two lines if you prefer the stock client:
                //
                // require.resolve('webpack-dev-server/client') + '?/',
                // require.resolve('webpack/hot/dev-server'),
                //
                // When using the experimental react-refresh integration,
                // the webpack plugin takes care of injecting the dev client for us.
                webpackDevClientEntry,
                // Finally, this is your app's code:
                paths.appIndexJs,
            ]
            : paths.appIndexJs,
        output: {
            // The build folder.
            path: isProdBuild ? paths.appBuild : void 0,
            // Add /* filename */ comments to generated require()s in the output.
            pathinfo: isDevBuild,
            // There will be one main bundle, and one file per asynchronous chunk.
            // In development, it does not produce real files.
            filename: switchOnEnv({
                prod: "static/js/[name].[contenthash:8].js",
                dev: "static/js/bundle.js",
                other: void 0,
            }),
            // TODO: remove this when upgrading to webpack 5
            futureEmitAssets: true,
            // There are also additional JS chunk files if you use code splitting.
            chunkFilename: switchOnEnv({
                prod: "static/js/[name].[contenthash:8].chunk.js",
                dev: "static/js/[name].chunk.js",
                other: void 0,
            }),
            // webpack uses `publicPath` to determine where the app is being served from.
            // It requires a trailing slash, or the file assets will get an incorrect path.
            // We inferred the "public path" (such as / or /my-project) from homepage.
            publicPath: paths.publicUrlOrPath,
            // Point sourcemap entries to original disk location (format as URL on Windows)
            devtoolModuleFilenameTemplate: switchOnEnv({
                prod: (info) => path_1.default.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, "/"),
                dev: (info) => path_1.default.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
                other: void 0,
            }),
            // Prevents conflicts when multiple webpack runtimes (from different apps)
            // are used on the same page.
            jsonpFunction: `webpackJsonp${appPackageJsonName}`,
            // this defaults to 'window', but by setting it to 'this' then
            // module chunks which are built will work in web workers as well.
            globalObject: "this",
        },
        optimization: {
            minimize: isProdBuild,
            minimizer: [
                // This is only used in production mode
                new terser_webpack_plugin_1.default({
                    terserOptions: {
                        parse: {
                            // We want terser to parse ecma 8 code. However, we don't want it
                            // to apply any minification steps that turns valid ecma 5 code
                            // into invalid ecma 5 code. This is why the 'compress' and 'output'
                            // sections only apply transformations that are ecma 5 safe
                            // https://github.com/facebook/create-react-app/pull/4234
                            ecma: 2017,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            // Disabled because of an issue with Uglify breaking seemingly valid code:
                            // https://github.com/facebook/create-react-app/issues/2376
                            // Pending further investigation:
                            // https://github.com/mishoo/UglifyJS2/issues/2011
                            comparisons: false,
                            // Disabled because of an issue with Terser breaking valid code:
                            // https://github.com/facebook/create-react-app/issues/5250
                            // Pending further investigation:
                            // https://github.com/terser-js/terser/issues/120
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        // Added for profiling in devtools
                        keep_classnames: isEnvProductionProfile,
                        keep_fnames: isEnvProductionProfile,
                        output: {
                            ecma: 5,
                            comments: false,
                            // Turned on because emoji and regex is not minified properly using default
                            // https://github.com/facebook/create-react-app/issues/2488
                            ascii_only: true,
                        },
                    },
                    //@ts-ignore
                    sourceMap: shouldUseSourceMap,
                }),
                // This is only used in production mode
                new optimize_css_assets_webpack_plugin_1.default({
                    cssProcessorOptions: {
                        parser: postcss_safe_parser_1.default,
                        map: shouldUseSourceMap
                            ? {
                                // `inline: false` forces the sourcemap to be output into a
                                // separate file
                                inline: false,
                                // `annotation: true` appends the sourceMappingURL to the end of
                                // the css file, helping the browser find the sourcemap
                                annotation: true,
                            }
                            : false,
                    },
                    cssProcessorPluginOptions: {
                        preset: ["default", { minifyFontValues: { removeQuotes: false } }],
                    },
                }),
            ],
            // Automatically split vendor and commons
            // https://twitter.com/wSokra/status/969633336732905474
            // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
            splitChunks: {
                chunks: "all",
                name: isDevBuild,
            },
            // Keep the runtime chunk separated to enable long term caching
            // https://twitter.com/wSokra/status/969679223278505985
            // https://github.com/facebook/create-react-app/issues/5358
            runtimeChunk: {
                name: (entrypoint) => `runtime-${entrypoint.name}`,
            },
        },
        resolve: {
            // This allows you to set a fallback for where webpack should look for modules.
            // We placed these paths second because we want `node_modules` to "win"
            // if there are any conflicts. This matches Node resolution mechanism.
            // https://github.com/facebook/create-react-app/issues/253
            modules: ["node_modules", paths.appNodeModules].concat(modules.additionalModulePaths || []),
            // These are the reasonable defaults supported by the Node ecosystem.
            // We also include JSX as a common component filename extension to support
            // some tools, although we do not recommend using it, see:
            // https://github.com/facebook/create-react-app/issues/290
            // `web` extension prefixes have been added for better support
            // for React Native Web.
            extensions: paths.moduleFileExtensions
                .map((ext) => `.${ext}`)
                .filter((ext) => useTypeScript || !ext.includes("ts")),
            alias: {
                // Support React Native Web
                // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
                "react-native": "react-native-web",
                // Allows for better profiling with ReactDevTools
                ...(isEnvProductionProfile
                    ? {
                        "react-dom$": "react-dom/profiling",
                        "scheduler/tracing": "scheduler/tracing-profiling",
                    }
                    : {}),
                ...(((_a = modules.webpackAliases) === null || _a === void 0 ? void 0 : _a.src) ? modules.webpackAliases : {}),
            },
            plugins: [
                // Adds support for installing with Plug'n'Play, leading to faster installs and adding
                // guards against forgotten dependencies and such.
                pnp_webpack_plugin_1.default,
                // Prevents users from importing files from outside of src/ (or node_modules/).
                // This often causes confusion because we only process files within src/ with babel.
                // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
                // please link the files into your node_modules/ and let module-resolution kick in.
                // Make sure your source files are compiled, as they will not be processed in any way.
                new ModuleScopePlugin_1.default(paths.appSrc, [
                    paths.appPackageJson,
                    reactRefreshOverlayEntry,
                ]),
            ],
        },
        resolveLoader: {
            plugins: [
                // Also related to Plug'n'Play, but this time it tells webpack to load its loaders
                // from the current package.
                pnp_webpack_plugin_1.default.moduleLoader(module),
            ],
        },
        module: module_1.createModuleSetting(buildEnv, paths, imageInlineSizeLimit, flags),
        plugins: plugin_1.createPluginSetting(buildEnv, paths, env, webpackDevClientEntry, reactRefreshOverlayEntry, swSrc, flags),
        // Some libraries import Node modules but don't use them in the browser.
        // Tell webpack to provide empty mocks for them so importing them works.
        node: {
            module: "empty",
            dgram: "empty",
            dns: "mock",
            fs: "empty",
            http2: "empty",
            net: "empty",
            tls: "empty",
            child_process: "empty",
        },
        // Turn off performance processing because we utilize
        // our own hints via the FileSizeReporter
        performance: false,
    };
};
