"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const chalk_1 = __importDefault(require("chalk"));
// Ensure the certificate and key provided are valid and if not
// throw an easy to debug error
function validateKeyAndCerts({ cert, key, keyFile, crtFile, }) {
    let encrypted;
    try {
        // publicEncrypt will throw an error with an invalid cert
        encrypted = crypto_1.default.publicEncrypt(cert, Buffer.from("test"));
    }
    catch (err) {
        throw new Error(`The certificate "${chalk_1.default.yellow(crtFile)}" is invalid.\n${err.message}`);
    }
    try {
        // privateDecrypt will throw an error with an invalid key
        crypto_1.default.privateDecrypt(key, encrypted);
    }
    catch (err) {
        throw new Error(`The certificate key "${chalk_1.default.yellow(keyFile)}" is invalid.\n${err.message}`);
    }
}
// Read file and throw an error if it doesn't exist
function readEnvFile(file, type) {
    if (!fs_1.default.existsSync(file)) {
        throw new Error(`You specified ${chalk_1.default.cyan(type)} in your env, but the file "${chalk_1.default.yellow(file)}" can't be found.`);
    }
    return fs_1.default.readFileSync(file);
}
// Get the https config
// Return cert files if provided in env, otherwise just true or false
function getHttpsConfig(paths) {
    const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
    const isHttps = HTTPS === "true";
    if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
        const crtFile = path_1.default.resolve(paths.appPath, SSL_CRT_FILE);
        const keyFile = path_1.default.resolve(paths.appPath, SSL_KEY_FILE);
        const config = {
            cert: readEnvFile(crtFile, "SSL_CRT_FILE"),
            key: readEnvFile(keyFile, "SSL_KEY_FILE"),
        };
        validateKeyAndCerts({ ...config, keyFile, crtFile });
        return config;
    }
    return isHttps;
}
exports.default = getHttpsConfig;
