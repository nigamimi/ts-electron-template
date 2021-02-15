"use strict";
// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/en/webpack.html
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheKey = exports.process = void 0;
const process = () => {
    return "module.exports = {};";
};
exports.process = process;
const getCacheKey = () => {
    // The output is always the same.
    return "cssTransform";
};
exports.getCacheKey = getCacheKey;
exports.default = {
    process: exports.process,
    getCacheKey: exports.getCacheKey,
};
