'use strict';

import type ts from "typescript";
import { resolveModuleName as resolveModuleNameUnwrapped } from 'ts-pnp';

type RealResolveModuleName = (
  moduleName: string,
  containingFile: string,
  options: ts.CompilerOptions,
  moduleResolutionHost: ts.ResolvedModuleWithFailedLookupLocations,
) => ts.ResolvedModuleWithFailedLookupLocations

type RealResolveTypeReferenceDirective = (
  moduleName: string,
  containingFile: string,
  options: ts.CompilerOptions,
  moduleResolutionHost: ts.ModuleResolutionHost,
) => ts.ResolvedTypeReferenceDirectiveWithFailedLookupLocations

export const resolveModuleName = (
  typescript: { resolveModuleName: RealResolveModuleName },
  moduleName: string,
  containingFile: string,
  compilerOptions: ts.CompilerOptions,
  resolutionHost: ts.ModuleResolutionHost
) => {
  return resolveModuleNameUnwrapped(
    moduleName,
    containingFile,
    compilerOptions,
    resolutionHost,
    typescript.resolveModuleName
  );
};

exports.resolveTypeReferenceDirective = (
  typescript: { resolveTypeReferenceDirective: RealResolveTypeReferenceDirective },
  moduleName: string,
  containingFile: string,
  compilerOptions: ts.CompilerOptions,
  resolutionHost: ts.ModuleResolutionHost
) => {
  return resolveModuleNameUnwrapped(
    moduleName,
    containingFile,
    compilerOptions,
    resolutionHost,
    typescript.resolveTypeReferenceDirective
  );
};
