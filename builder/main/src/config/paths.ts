import fs from "fs";
import path from "path";

import { PathConfig } from "./path_config";

export const getPaths = (
    appDir: string,
    pathsRelative: Omit<PathConfig, "appBuild">,
    buildDirAbs: string
): PathConfig => {
    const appDirectoryReal = fs.realpathSync(appDir);
    const resolveApp = (relativePath: string) => path.resolve(appDirectoryReal, relativePath);

    return {
        ...(Object.fromEntries(
            Object.entries(pathsRelative).map(([key, value]) => {
                return [key, resolveApp(value)];
            })
        ) as Omit<PathConfig, "appBuild">),
        appBuild: buildDirAbs,
    };
};
