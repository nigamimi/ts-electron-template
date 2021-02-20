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

export type PathConfigRelative = Omit<PathConfig, "appBuild">;
