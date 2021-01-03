/**
 * Webpack config for production electron main process
 */

const path = require("path");

const { EnvironmentPlugin } = require("webpack");
const { merge } = require("webpack-merge");

const CheckNodeEnv = require("../scripts/CheckNodeEnv");
const DeleteSourceMaps = require("../scripts/DeleteSourceMaps");

CheckNodeEnv("production");
DeleteSourceMaps();

/** @type {import('webpack').Configuration} */
const main = {
    target: "electron-main",
    entry: "./src/main.dev.ts",
    output: {
        path: path.join(__dirname, "../../"),
        filename: "./src/main.prod.js",
    },
    plugins: [
        new EnvironmentPlugin({
            NODE_ENV: "production",
            DEBUG_PROD: false,
            START_MINIMIZED: false,
        }),
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
};

module.exports = merge(require("./prod.base"), main);