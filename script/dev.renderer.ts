import path from "path";

import { appDir, buildDirAbsolute, pathsRelative } from "../config/paths.renderer";
import { start } from "create-react-app-builder/dist/start";

void (async () => {
    const dotEnvPath = path.resolve(appDir, pathsRelative.dotenv);
    await start(dotEnvPath, appDir, pathsRelative, buildDirAbsolute);
})();
