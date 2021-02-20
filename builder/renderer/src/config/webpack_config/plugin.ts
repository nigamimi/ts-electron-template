import fs from "fs";
import path from "path";

import webpack from "webpack";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import InlineChunkHtmlPlugin from "react-dev-utils/InlineChunkHtmlPlugin";

import ManifestPlugin from "webpack-manifest-plugin";
import InterpolateHtmlPlugin from "react-dev-utils/InterpolateHtmlPlugin";
import WorkboxWebpackPlugin from "workbox-webpack-plugin";
import WatchMissingNodeModulesPlugin from "react-dev-utils/WatchMissingNodeModulesPlugin";
import ESLintPlugin from "eslint-webpack-plugin";
//@ts-expect-error
import ModuleNotFoundPlugin from "react-dev-utils/ModuleNotFoundPlugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

import type { Formatter } from "fork-ts-checker-webpack-plugin/lib/formatter/Formatter";
const typescriptFormatter = require("react-dev-utils/typescriptFormatter") as Formatter;
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";

import resolve from "resolve";

import type getClientEnvironment from "../env";
import { WebpackEnv } from "./webpack_env";
import { PathConfig } from "../path_config";

interface CreatePluginSettingFlags {
    shouldInlineRuntimeChunk: boolean;
    shouldUseReactRefresh: boolean;
    useTypeScript: boolean;
    disableESLintPlugin: boolean;
    emitErrorsAsWarnings: boolean;
    hasJsxRuntime: boolean;
}
export const createPluginSetting = (
    buildEnv: WebpackEnv,
    paths: PathConfig,
    env: ReturnType<typeof getClientEnvironment>,
    webpackDevClientEntry: string,
    reactRefreshOverlayEntry: string,
    swSrc: string,
    {
        shouldInlineRuntimeChunk,
        shouldUseReactRefresh,
        useTypeScript,
        disableESLintPlugin,
        emitErrorsAsWarnings,
        hasJsxRuntime,
    }: CreatePluginSettingFlags
): webpack.Plugin[] => {
    const isDevBuild = buildEnv === WebpackEnv.dev;
    const isProdBuild = buildEnv === WebpackEnv.prod;
    return [
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
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
            ? new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/])
            : null,
        // Makes some environment variables available in index.html.
        // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
        // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
        // It will be an empty string unless you specify "homepage"
        // in `package.json`, in which case it will be the pathname of that URL.
        new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw as Record<string, string>),
        // This gives some necessary context to module not found errors, such as
        // the requesting resource.
        new ModuleNotFoundPlugin(paths.appPath),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV is set to production
        // during a production build.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack.DefinePlugin(env.stringified),
        // This is necessary to emit hot updates (CSS and Fast Refresh):
        isDevBuild && new webpack.HotModuleReplacementPlugin(),
        // Experimental hot reloading for React .
        // https://github.com/facebook/react/tree/master/packages/react-refresh
        isDevBuild &&
            shouldUseReactRefresh &&
            new ReactRefreshWebpackPlugin({
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
        isDevBuild && new CaseSensitivePathsPlugin(),
        // If you require a missing module and then `npm install` it, you still have
        // to restart the development server for webpack to discover it. This plugin
        // makes the discovery automatic so you don't have to restart.
        // See https://github.com/facebook/create-react-app/issues/186
        isDevBuild && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
        isProdBuild &&
            new MiniCssExtractPlugin({
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
        new ManifestPlugin({
            fileName: "asset-manifest.json",
            publicPath: paths.publicUrlOrPath,
            generate: (seed, files, entrypoints) => {
                const manifestFiles = files.reduce((manifest, file) => {
                    if (file.name) manifest[file.name] = file.path;
                    return manifest;
                }, seed as Record<string, string>);
                const entrypointFiles = entrypoints.main.filter(
                    (fileName) => !fileName.endsWith(".map")
                );

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
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // Generate a service worker script that will precache, and keep up to date,
        // the HTML & assets that are part of the webpack build.
        isProdBuild &&
            fs.existsSync(swSrc) &&
            new WorkboxWebpackPlugin.InjectManifest({
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
            new ForkTsCheckerWebpackPlugin({
                typescript: resolve.sync("typescript", {
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
            new ESLintPlugin({
                // Plugin options
                extensions: ["js", "mjs", "jsx", "ts", "tsx"],
                formatter: require.resolve("react-dev-utils/eslintFormatter"),
                eslintPath: require.resolve("eslint"),
                emitWarning: isDevBuild && emitErrorsAsWarnings,
                context: paths.appSrc,
                cache: true,
                cacheLocation: path.resolve(paths.appNodeModules, ".cache/.eslintcache"),
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
    ].filter((Boolean as unknown) as <T>(input: T | boolean) => input is T);
};
