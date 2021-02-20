import path from "path";

export const buildDir = path.resolve(__dirname, "../", "electron_built");
export const preload = path.resolve(buildDir, "main/preload.js");
export const rendererEntryPoint = path.resolve(buildDir, "renderer/index.html");
