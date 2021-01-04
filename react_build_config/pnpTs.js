// this source file is derived from "create-react-app@4.0.1" with "yarn eject" command
// for LICENSE of original code, refer to: https://github.com/facebook/create-react-app/blob/v4.0.1/LICENSE

"use strict";

const { resolveModuleName } = require("ts-pnp");

exports.resolveModuleName = (
    typescript,
    moduleName,
    containingFile,
    compilerOptions,
    resolutionHost
) => {
    return resolveModuleName(
        moduleName,
        containingFile,
        compilerOptions,
        resolutionHost,
        typescript.resolveModuleName
    );
};

exports.resolveTypeReferenceDirective = (
    typescript,
    moduleName,
    containingFile,
    compilerOptions,
    resolutionHost
) => {
    return resolveModuleName(
        moduleName,
        containingFile,
        compilerOptions,
        resolutionHost,
        typescript.resolveTypeReferenceDirective
    );
};
