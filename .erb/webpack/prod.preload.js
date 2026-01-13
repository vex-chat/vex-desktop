/**
 * Webpack config for production electron preload script
 *
 * The preload script runs in a privileged context and exposes
 * safe APIs to the renderer via contextBridge.
 */

const path = require("path");

const { EnvironmentPlugin } = require("webpack");
const { merge } = require("webpack-merge");

const CheckNodeEnv = require("../scripts/CheckNodeEnv");

CheckNodeEnv("production");

/** @type {import('webpack').Configuration} */
const preload = {
    target: "electron-preload",
    entry: "./src/preload.ts",
    output: {
        path: path.join(__dirname, "../../src"),
        filename: "preload.js",
    },
    plugins: [
        new EnvironmentPlugin({
            NODE_ENV: "production",
        }),
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
};

module.exports = merge(require("./prod.base"), preload);
