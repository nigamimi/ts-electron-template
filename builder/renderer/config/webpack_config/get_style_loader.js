"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyleLoaders = void 0;
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const postcss_normalize_1 = __importDefault(require("postcss-normalize"));
const is_non_nullish_1 = require("../util/is_non_nullish");
const switch_on_build_env_1 = require("./switch_on_build_env");
// common function to get style loaders
const getStyleLoaders = (env, shouldUseSourceMapWhenProd, paths, cssOptions, preProcessor) => {
    const switchOnBuilEnv = switch_on_build_env_1.buildSwitchOnBuilEnv(env);
    const shouldUseSourceMap = switchOnBuilEnv({
        prod: shouldUseSourceMapWhenProd,
        dev: true,
        other: false,
    });
    const loaders = [
        switchOnBuilEnv({
            prod: {
                loader: mini_css_extract_plugin_1.default.loader,
                // css is located in `static/css`, use '../../' to locate index.html folder
                // in production `paths.publicUrlOrPath` can be a relative path
                options: paths.publicUrlOrPath.startsWith(".") ? { publicPath: "../../" } : {},
            },
            dev: require.resolve("style-loader"),
            other: null,
        }),
        {
            loader: require.resolve("css-loader"),
            options: cssOptions,
        },
        {
            // Options for PostCSS as we reference these options twice
            // Adds vendor prefixing based on your specified browser support in
            // package.json
            loader: require.resolve("postcss-loader"),
            options: {
                // Necessary for external CSS imports to work
                // https://github.com/facebook/create-react-app/issues/2677
                ident: "postcss",
                plugins: () => [
                    require("postcss-flexbugs-fixes"),
                    require("postcss-preset-env")({
                        autoprefixer: {
                            flexbox: "no-2009",
                        },
                        stage: 3,
                    }),
                    // Adds PostCSS Normalize as the reset css with default options,
                    // so that it honors browserslist config in package.json
                    // which in turn let's users customize the target behavior as per their needs.
                    postcss_normalize_1.default(),
                ],
                sourceMap: shouldUseSourceMap,
            },
        },
    ].filter(is_non_nullish_1.isNonNullish);
    if (preProcessor) {
        loaders.push({
            loader: require.resolve("resolve-url-loader"),
            options: {
                sourceMap: shouldUseSourceMap,
                root: paths.appSrc,
            },
        }, {
            loader: require.resolve(preProcessor),
            options: {
                sourceMap: true,
            },
        });
    }
    return loaders;
};
exports.getStyleLoaders = getStyleLoaders;
