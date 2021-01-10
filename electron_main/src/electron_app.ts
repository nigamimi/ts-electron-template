import events from "events";
import fs from "fs";
import path from "path";
import url from "url";
import { app, BrowserWindow, dialog } from "electron";

export interface ElectronAppPref {
    entryPointHtml: string;
    preload: string;
}
export function isElectronAppPref(input_: any): input_ is ElectronAppPref {
    return true;
}
export function validateElectronAppConfig(input_: ElectronAppPref): Error | void {
    return;
}

export class ElectronApp {
    mainWindow: BrowserWindow | null;

    constructor() {
        this.mainWindow = null;
    }

    async launch(opt_: ElectronAppPref | Error): Promise<void> {
        if (opt_ instanceof Error) {
            return this._handlePrefError(opt_);
        }

        //wait until electron gets ready
        await _readyPromise();
        const opt = { ...opt_ };

        if (!isElectronAppPref(opt)) {
            //TODO: handle pref corruption!
            return;
        }
        if (validateElectronAppConfig(opt) instanceof Error) {
            //TODO: handle pref mul-formation!
            return;
        }

        this.mainWindow = new BrowserWindow({
            width: 1024,
            height: 640,
            webPreferences: {
                // In Electron 12, the default will be changed to true.
                worldSafeExecuteJavaScript: true,
                // XSS対策としてnodeモジュールをレンダラープロセスで使えなくする
                //default is false so you can omit this line safely.
                nodeIntegration: false,
                // レンダラープロセスに公開するAPIのファイル
                //（Electron 11 から、デフォルト：falseが非推奨となった）
                contextIsolation: true,
                preload: opt.preload,
            },
        });

        this.mainWindow.loadURL(opt.entryPointHtml);

        this.mainWindow.on("closed", () => {
            this.mainWindow = null;
        });
    }

    private _handlePrefError(errro_: Error) {
        //noop here
        //TODO: handle pref load error
    }
}

const _readyPromise = async () => {
    if (!app.isReady()) await app.whenReady();
};
