import MiniCssExtractPlugin from "mini-css-extract-plugin";
import postcssNormalize from "postcss-normalize";
import webpack from "webpack";

import { PathConfig } from "../path_config";
import { isNonNullish } from "../util/is_non_nullish";
import { WebpackEnv } from "./webpack_env";

import { buildSwitchOnBuilEnv } from "./switch_on_build_env";

export interface CssOption {
    importLoaders: number;
    sourceMap: boolean;
    modules?: {
        getLocalIdent: (
            context: webpack.loader.LoaderContext,
            localIdentName: string,
            localName: string,
            options: object
        ) => string;
    };
}
// common function to get style loaders
export const getStyleLoaders = (
    env: WebpackEnv,
    shouldUseSourceMapWhenProd: boolean,
    paths: PathConfig,
    cssOptions: CssOption,
    preProcessor?: string
) => {
    const switchOnBuilEnv = buildSwitchOnBuilEnv(env);

    const shouldUseSourceMap = switchOnBuilEnv({
        prod: shouldUseSourceMapWhenProd,
        dev: true,
        other: false,
    });

    const loaders: webpack.Loader[] = [
        switchOnBuilEnv({
            prod: {
                loader: MiniCssExtractPlugin.loader,
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
                    postcssNormalize(),
                ],
                sourceMap: shouldUseSourceMap,
            },
        },
    ].filter(isNonNullish);

    if (preProcessor) {
        loaders.push(
            {
                loader: require.resolve("resolve-url-loader"),
                options: {
                    sourceMap: shouldUseSourceMap,
                    root: paths.appSrc,
                },
            },
            {
                loader: require.resolve(preProcessor),
                options: {
                    sourceMap: true,
                },
            }
        );
    }

    return loaders;
};
