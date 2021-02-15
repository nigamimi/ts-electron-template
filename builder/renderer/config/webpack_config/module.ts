import getCSSModuleLocalIdent from "react-dev-utils/getCSSModuleLocalIdent";
import type webpack from "webpack";

import { PathConfig } from "../path_config";
import { CssOption, getStyleLoaders } from "./get_style_loader";
import { WebpackEnv } from "./webpack_env";

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

export const buildGetStyleLoaders = (
    env: WebpackEnv,
    shouldUseSourceMapWhenProd: boolean,
    paths: PathConfig
) => (cssOptions: CssOption, preProcessor?: string) =>
    getStyleLoaders(env, shouldUseSourceMapWhenProd, paths, cssOptions, preProcessor);

interface CreateModuleSettingFlags {
    hasJsxRuntime: boolean;
    shouldUseReactRefresh: boolean;
    shouldUseSourceMap: boolean;
}
export const createModuleSetting = (
    buildEnv: WebpackEnv,
    paths: PathConfig,
    imageInlineSizeLimit: number,
    { hasJsxRuntime, shouldUseReactRefresh, shouldUseSourceMap }: CreateModuleSettingFlags
): webpack.Module => {
    const getStyleLoaders = buildGetStyleLoaders(buildEnv, shouldUseSourceMap, paths);
    const isDevBuild = buildEnv === WebpackEnv.dev;
    const isProdBuild = buildEnv === WebpackEnv.prod;
    return {
        strictExportPresence: true,
        rules: [
            // Disable require.ensure as it's not a standard language feature.
            { parser: { requireEnsure: false } },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // TODO: Merge this config once `image/avif` is in the mime-db
                    // https://github.com/jshttp/mime-db
                    {
                        test: [/\.avif$/],
                        loader: require.resolve("url-loader"),
                        options: {
                            limit: imageInlineSizeLimit,
                            mimetype: "image/avif",
                            name: "static/media/[name].[hash:8].[ext]",
                        },
                    },
                    // "url" loader works like "file" loader except that it embeds assets
                    // smaller than specified limit in bytes as data URLs to avoid requests.
                    // A missing `test` is equivalent to a match.
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve("url-loader"),
                        options: {
                            limit: imageInlineSizeLimit,
                            name: "static/media/[name].[hash:8].[ext]",
                        },
                    },
                    // Process application JS with Babel.
                    // The preset includes JSX, Flow, TypeScript, and some ESnext features.
                    {
                        test: /\.(js|mjs|jsx|ts|tsx)$/,
                        include: paths.appSrc,
                        loader: require.resolve("babel-loader"),
                        options: {
                            customize: require.resolve("babel-preset-react-app/webpack-overrides"),
                            presets: [
                                [
                                    require.resolve("babel-preset-react-app"),
                                    {
                                        runtime: hasJsxRuntime ? "automatic" : "classic",
                                    },
                                ],
                            ],

                            plugins: [
                                [
                                    require.resolve("babel-plugin-named-asset-import"),
                                    {
                                        loaderMap: {
                                            svg: {
                                                ReactComponent:
                                                    "@svgr/webpack?-svgo,+titleProp,+ref![path]",
                                            },
                                        },
                                    },
                                ],
                                isDevBuild &&
                                    shouldUseReactRefresh &&
                                    require.resolve("react-refresh/babel"),
                            ].filter((Boolean as unknown) as <T>(input: T | boolean) => input is T),
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,
                            compact: isProdBuild,
                        },
                    },
                    // Process any JS outside of the app with Babel.
                    // Unlike the application JS, we only compile the standard ES features.
                    {
                        test: /\.(js|mjs)$/,
                        exclude: /@babel(?:\/|\\{1,2})runtime/,
                        loader: require.resolve("babel-loader"),
                        options: {
                            babelrc: false,
                            configFile: false,
                            compact: false,
                            presets: [
                                [
                                    require.resolve("babel-preset-react-app/dependencies"),
                                    { helpers: true },
                                ],
                            ],
                            cacheDirectory: true,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,

                            // Babel sourcemaps are needed for debugging into node_modules
                            // code.  Without the options below, debuggers like VSCode
                            // show incorrect code and set breakpoints on the wrong lines.
                            sourceMaps: shouldUseSourceMap,
                            inputSourceMap: shouldUseSourceMap,
                        },
                    },
                    // "postcss" loader applies autoprefixer to our CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    // "style" loader turns CSS into JS modules that inject <style> tags.
                    // In production, we use MiniCSSExtractPlugin to extract that CSS
                    // to a file, but in development "style" loader enables hot editing
                    // of CSS.
                    // By default we support CSS Modules with the extension .module.css
                    {
                        test: cssRegex,
                        exclude: cssModuleRegex,
                        use: getStyleLoaders({
                            importLoaders: 1,
                            sourceMap: isProdBuild ? shouldUseSourceMap : isDevBuild,
                        }),
                        // Don't consider CSS imports dead code even if the
                        // containing package claims to have no side effects.
                        // Remove this when webpack adds a warning or an error for this.
                        // See https://github.com/webpack/webpack/issues/6571
                        sideEffects: true,
                    },
                    // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
                    // using the extension .module.css
                    {
                        test: cssModuleRegex,
                        use: getStyleLoaders({
                            importLoaders: 1,
                            sourceMap: isProdBuild ? shouldUseSourceMap : isDevBuild,
                            modules: {
                                getLocalIdent: getCSSModuleLocalIdent,
                            },
                        }),
                    },
                    // Opt-in support for SASS (using .scss or .sass extensions).
                    // By default we support SASS Modules with the
                    // extensions .module.scss or .module.sass
                    {
                        test: sassRegex,
                        exclude: sassModuleRegex,
                        use: getStyleLoaders(
                            {
                                importLoaders: 3,
                                sourceMap: isProdBuild ? shouldUseSourceMap : isDevBuild,
                            },
                            "sass-loader"
                        ),
                        // Don't consider CSS imports dead code even if the
                        // containing package claims to have no side effects.
                        // Remove this when webpack adds a warning or an error for this.
                        // See https://github.com/webpack/webpack/issues/6571
                        sideEffects: true,
                    },
                    // Adds support for CSS Modules, but using SASS
                    // using the extension .module.scss or .module.sass
                    {
                        test: sassModuleRegex,
                        use: getStyleLoaders(
                            {
                                importLoaders: 3,
                                sourceMap: isProdBuild ? shouldUseSourceMap : isDevBuild,
                                modules: {
                                    getLocalIdent: getCSSModuleLocalIdent,
                                },
                            },
                            "sass-loader"
                        ),
                    },
                    // "file" loader makes sure those assets get served by WebpackDevServer.
                    // When you `import` an asset, you get its (virtual) filename.
                    // In production, they would get copied to the `build` folder.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        loader: require.resolve("file-loader"),
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise be processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                        options: {
                            name: "static/media/[name].[hash:8].[ext]",
                        },
                    },
                    // ** STOP ** Are you adding a new loader?
                    // Make sure to add the new loader(s) before the "file" loader.
                ],
            },
        ],
    };
};
