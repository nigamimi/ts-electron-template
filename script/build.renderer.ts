import path from "path";

import { appDir, buildDirAbsolute, pathsRelative } from "../config/paths.renderer";
import { build } from "create-react-app-builder/dist/build";

import packageJson from "../package.json";

(async () => {
    const dotEnvPath = path.resolve(appDir, pathsRelative.dotenv);
    //@ts-ignore package.json may or may not contain homepage field. should not be an error.
    const homePage = packageJson.homepage ?? "./";
    await build(dotEnvPath, appDir, pathsRelative, buildDirAbsolute, homePage);
})();
