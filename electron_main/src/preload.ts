import { contextBridge, ipcRenderer } from "electron";

export const apiKeyName = "electron_main" as const;
export const methods = {
    someMethod: () =>
        ipcRenderer
            .invoke("some_handler")
            .then((result) => result)
            .catch((err: Error) => err),
} as const;
contextBridge.exposeInMainWorld("electron_main", methods);
