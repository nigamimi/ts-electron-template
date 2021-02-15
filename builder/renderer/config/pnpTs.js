'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveModuleName = void 0;
const ts_pnp_1 = require("ts-pnp");
const resolveModuleName = (typescript, moduleName, containingFile, compilerOptions, resolutionHost) => {
    return ts_pnp_1.resolveModuleName(moduleName, containingFile, compilerOptions, resolutionHost, typescript.resolveModuleName);
};
exports.resolveModuleName = resolveModuleName;
exports.resolveTypeReferenceDirective = (typescript, moduleName, containingFile, compilerOptions, resolutionHost) => {
    return ts_pnp_1.resolveModuleName(moduleName, containingFile, compilerOptions, resolutionHost, typescript.resolveTypeReferenceDirective);
};
