import fs from "fs";
import path from "path";

export interface PathConfig {
    dotenv: string;
    appPath: string;
    appBuild: string;
    appEntryPoint: string;
    appPackageJson: string;
    appPreload: string;
    appSrc: string;
    appTsConfig: string;
    yarnLockFile: string;
    appNodeModules: string;
}

export const getPaths = (
    appDir: string,
    pathsRelative: Omit<PathConfig, "appBuild">,
    buildDirRelative: string
): PathConfig => {
    const appDirectoryReal = fs.realpathSync(appDir);
    const resolveApp = (relativePath: string) => path.resolve(appDirectoryReal, relativePath);

    return {
        ...(Object.fromEntries(
            Object.entries(pathsRelative).map(([key, value]) => {
                return [key, resolveApp(value)];
            })
        ) as Omit<PathConfig, "appBuild">),
        appBuild: resolveApp(buildDirRelative),
    };
};
