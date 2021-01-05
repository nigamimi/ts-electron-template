import util from "util";

import webpack from "webpack";

void (async () => {
    let config: webpack.Configuration;
    if (process.argv.findIndex((val_) => val_ === "--production") !== -1) {
        console.log("prod env");
        config = (await import("../config/webpack.config.main.prod")).default;
    } else {
        console.log("dev env");
        config = (await import("../config/webpack.config.main.dev")).default;
    }
    console.log("compiling with");
    console.log(util.inspect(config, void 0, Infinity));
    const compiler = webpack(config);
    console.log("webpack compilation: starting");
    console.time("webpack compilation");
    compiler.run((err_, stats_) => {
        console.timeEnd("webpack compilation");
        console.log("webpack compilation: done");
        if (err_) console.error(err_);
        if (stats_) {
            console.log(stats_.toJson({ all: false, warnings: true, errors: true }));
            console.log("successful");
        }
    });
})();
