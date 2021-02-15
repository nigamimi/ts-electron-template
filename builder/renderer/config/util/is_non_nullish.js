"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNonNullish = void 0;
const isNonNullish = (input) => {
    if (typeof input === "boolean")
        return true;
    return (input !== null && input !== void 0 ? input : false) !== false;
};
exports.isNonNullish = isNonNullish;
