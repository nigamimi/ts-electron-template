'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const babel_jest_1 = __importDefault(require("babel-jest"));
const hasJsxRuntime = (() => {
    if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
        return false;
    }
    try {
        require.resolve('react/jsx-runtime');
        return true;
    }
    catch (e) {
        return false;
    }
})();
exports.default = babel_jest_1.default.createTransformer({
    presets: [
        [
            require.resolve('babel-preset-react-app'),
            {
                runtime: hasJsxRuntime ? 'automatic' : 'classic',
            },
        ],
    ],
    babelrc: false,
    configFile: false,
});
