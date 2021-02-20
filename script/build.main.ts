import { appDir, buildDirAbsolute, pathsRelative } from "../config/paths.main";
import { build } from "electron-main-builder/dist/build";

(async () => {
    await build(void 0, appDir, pathsRelative, buildDirAbsolute);
})();
