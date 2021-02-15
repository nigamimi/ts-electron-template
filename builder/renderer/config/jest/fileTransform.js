"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
const path_1 = __importDefault(require("path"));
const camelcase_1 = __importDefault(require("camelcase"));
// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html
const process = (_src, filename) => {
    const assetFilename = JSON.stringify(path_1.default.basename(filename));
    if (filename.match(/\.svg$/)) {
        // Based on how SVGR generates a component name:
        // https://github.com/smooth-code/svgr/blob/01b194cf967347d43d4cbe6b434404731b87cf27/packages/core/src/state.js#L6
        const pascalCaseFilename = camelcase_1.default(path_1.default.parse(filename).name, {
            pascalCase: true,
        });
        const componentName = `Svg${pascalCaseFilename}`;
        return `const React = require('react');
    module.exports = {
      __esModule: true,
      default: ${assetFilename},
      ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
        return {
          $$typeof: Symbol.for('react.element'),
          type: 'svg',
          ref: ref,
          key: null,
          props: Object.assign({}, props, {
            children: ${assetFilename}
          })
        };
      }),
    };`;
    }
    return `module.exports = ${assetFilename};`;
};
exports.process = process;
exports.default = {
    process: exports.process,
};
