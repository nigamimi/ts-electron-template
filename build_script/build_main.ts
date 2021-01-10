/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/naming-convention */
import path from "path";

//@ts-expect-error
import bfj from "bfj";
import chalk from "chalk";
import fsExtra from "fs-extra";
import webpack from "webpack";

import formatWebpackMessages from "react-dev-utils/formatWebpackMessages";
import {
    measureFileSizesBeforeBuild,
    printFileSizesAfterBuild,
    OpaqueFileSizes,
} from "react-dev-utils/FileSizeReporter";

import { mainPaths } from "../config/path_config";

const build = async (config_: webpack.Configuration) => {
    const compiler = webpack(config_);
    return await new Promise<[Error | null, webpack.Stats]>((r_) => {
        compiler.run((err_, stats_) => r_([err_, stats_]));
    });
};

const formErrorMessage = (err_: Error | null, stats_?: webpack.Stats) => {
    const messages = (() => {
        if (err_) {
            if (!err_.message) {
                throw err_;
            }

            return formatWebpackMessages({
                _showErrors: true,
                _showWarnings: true,
                errors: [err_.message],
                warnings: [],
            });
        }
        if (stats_) {
            return formatWebpackMessages(
                stats_.toJson({ all: false, warnings: true, errors: true })
            );
        }
        throw new Error("unknown state");
    })();

    if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
            messages.errors.length = 1;
        }
        throw new Error(messages.errors.join("\n\n"));
    }

    return messages.warnings;
};

void (async () => {
    let config: webpack.Configuration;
    if (process.argv.findIndex((val_) => val_ === "--production") !== -1) {
        console.log("Creating a production build...");
        config = (await import("../config/webpack.config.main.prod")).default;
    } else {
        console.log("Creating a development build...");
        config = (await import("../config/webpack.config.main.dev")).default;
    }

    // measure previous production size.
    const previousFileSizes = await measureFileSizesBeforeBuild(mainPaths.productionDir);
    // clearing out dir.
    fsExtra.emptyDirSync(mainPaths.productionDir);

    const [err, stats] = await build(config);
    const warnings = formErrorMessage(err, stats);

    if (
        process.env.CI &&
        (typeof process.env.CI !== "string" || process.env.CI.toLowerCase() !== "false") &&
        warnings.length
    ) {
        console.log(
            chalk.yellow(
                "\nTreating warnings as errors because process.env.CI = true.\n" +
                    "Most CI servers set it automatically.\n"
            )
        );
        throw new Error(warnings.join("\n\n"));
    }

    await bfj
        .write(path.join(mainPaths.productionDir, "bundle-stats.json"), stats.toJson())
        .catch((error_?: string) => {
            throw new Error(error_);
        });

    if (warnings.length) {
        console.log(chalk.yellow("Compiled with warnings.\n"));
        console.log(warnings.join("\n\n"));
        console.log(
            "\nSearch for the " +
                chalk.underline(chalk.yellow("keywords")) +
                " to learn more about each warning."
        );
        console.log(
            "To ignore, add " + chalk.cyan("// eslint-disable-next-line") + " to the line before.\n"
        );
    } else {
        console.log(chalk.green("Compiled successfully.\n"));
    }

    console.log("File sizes:\n");
    printFileSizesAfterBuild(stats, previousFileSizes, mainPaths.productionDir);
    console.log();
})();
