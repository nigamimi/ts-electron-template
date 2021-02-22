import fs from "fs";
import path from "path";

import sass from "sass";

export const compileScss = async (rootPath_: string): Promise<void> => {
    const scsss = (await recursiveReadDir(rootPath_)).filter((filename_) =>
        path.extname(filename_).includes("scss")
    );

    console.log(scsss);

    for (const filename of scsss) {
        const rendered = await sassRenderAsync(filename);
        if (rendered instanceof Error) throw rendered;
        const { root, dir, base, ext, name } = path.parse(filename);
        const destFilename = path.join(dir, name + ".css");
        console.log(`stat: ${rendered.stats}`);
        await fs.promises.writeFile(destFilename, rendered.css);
    }
};

export const recursiveReadDir = async (path_: string): Promise<string[]> => {
    const files = await fs.promises.readdir(path_, { withFileTypes: true });
    const promises = files.map(async (dirent_) => {
        const joined = path.join(path_, dirent_.name);
        if (dirent_.isDirectory()) return recursiveReadDir(joined);
        return joined;
    });

    return (await Promise.all(promises)).flat(1);
};

export const sassRenderAsync = (filename_: string): Promise<sass.SassException | sass.Result> => {
    return new Promise<sass.SassException | sass.Result>((resolve_) => {
        sass.render(
            {
                file: filename_,
            },
            function (err_, result_) {
                if (err_) return resolve_(err_);
                return resolve_(result_);
            }
        );
    });
};

// export formatStatMessage = ()

if (require.main === module) {
    compileScss(path.join(__dirname, "../")).then(
        () => {
            console.log("done");
        },
        (error_) => {
            console.error(error_);
            process.exit(1);
        }
    );
}
