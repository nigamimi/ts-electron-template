import events from "events";
import fs from "fs";
import path from "path";

const configFilename = path.resolve(__dirname, "../config.json");

import { ElectronApp, ElectronAppPref } from "./electron_app";

import { builtPaths } from "../../config/path_config";

const _loadConfig = async (): Promise<ElectronAppPref | null | Error> => {
    //no-op currently
    return null;
    // if (
    //     !(await fs.promises.access(configFilename, fs.constants.R_OK).then(
    //         () => true,
    //         () => false
    //     ))
    // )
    //     return void 0;
    // try {
    //     const parsed = JSON.parse(await fs.promises.readFile(configFilename, "utf-8"));
    //     if (validateElectronAppConfig(parsed)) return parsed;
    //     return new Error("config file is corrupted.");
    // } catch (err) {
    //     return err as NodeJS.ErrnoException;
    // }
};

void (async () => {
    const electronApp = new ElectronApp();
    const url = new URL(builtPaths.rendererEntryPoint, "file://");
    electronApp.launch({
        entryPointHtml: url.href,
        preload: builtPaths.preload,
    });
})();
