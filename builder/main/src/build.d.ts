import { PathConfigRelative } from "./config/path_config";
/*!*************************************************************************************************
                                            MAIN
***************************************************************************************************/
export declare const build: (dotenvPath: string | undefined, appDir: string, pathsRelative: PathConfigRelative, buildDirAbsolute: string) => Promise<void>;
