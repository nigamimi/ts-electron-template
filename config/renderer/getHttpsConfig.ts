// this source file is derived from "create-react-app@4.0.1" with "yarn eject" command
// for LICENSE of original code, refer to: https://github.com/facebook/create-react-app/blob/v4.0.1/LICENSE

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import chalk from "chalk";
import paths from "./paths";

// Ensure the certificate and key provided are valid and if not
// throw an easy to debug error
interface ValidateKeyAndCertsOption {
    cert: string | Buffer | crypto.RsaPublicKey | crypto.RsaPrivateKey | crypto.KeyObject;
    key: string | Buffer | crypto.RsaPublicKey | crypto.RsaPrivateKey | crypto.KeyObject;
    keyFile: string;
    crtFile: string;
}
function validateKeyAndCerts({ cert, key, keyFile, crtFile }: ValidateKeyAndCertsOption) {
    let encrypted;
    try {
        // publicEncrypt will throw an error with an invalid cert
        encrypted = crypto.publicEncrypt(cert, Buffer.from("test"));
    } catch (err) {
        throw new Error(`The certificate "${chalk.yellow(crtFile)}" is invalid.\n${err.message}`);
    }

    try {
        // privateDecrypt will throw an error with an invalid key
        crypto.privateDecrypt(key, encrypted);
    } catch (err) {
        throw new Error(
            `The certificate key "${chalk.yellow(keyFile)}" is invalid.\n${err.message}`
        );
    }
}

// Read file and throw an error if it doesn't exist
function readEnvFile(file: string, type: string) {
    if (!fs.existsSync(file)) {
        throw new Error(
            `You specified ${chalk.cyan(type)} in your env, but the file "${chalk.yellow(
                file
            )}" can't be found.`
        );
    }
    return fs.readFileSync(file);
}

// Get the https config
// Return cert files if provided in env, otherwise just true or false
function getHttpsConfig() {
    const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
    const isHttps = HTTPS === "true";

    if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
        const crtFile = path.resolve(paths.appPath, SSL_CRT_FILE);
        const keyFile = path.resolve(paths.appPath, SSL_KEY_FILE);
        const config = {
            cert: readEnvFile(crtFile, "SSL_CRT_FILE"),
            key: readEnvFile(keyFile, "SSL_KEY_FILE"),
        };

        validateKeyAndCerts({ ...config, keyFile, crtFile });
        return config;
    }
    return isHttps;
}

export default getHttpsConfig;
