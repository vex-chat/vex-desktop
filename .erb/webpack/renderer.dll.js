/**
 * Builds the DLL for development electron renderer process
 */
const { join } = require("path");

const { DllPlugin, LoaderOptionsPlugin } = require("webpack");
const { merge } = require("webpack-merge");

const CheckNodeEnv = require("../scripts/CheckNodeEnv");
CheckNodeEnv("development");

const dist = join(__dirname, "../dll");

/** @type {import('webpack').Configuration} */
const dll = {
    context: join(__dirname, "../.."),
    devtool: "eval",
    externals: ["fsevents", "crypto-browserify"],
    entry: {
        renderer: Object.keys(require("../../package.json").dependencies || {}),
    },
    output: {
        path: dist,
        libraryTarget: "var",
        library: "renderer",
        filename: "[name].dev.dll.js",
    },
    plugins: [
        new DllPlugin({
            path: join(dist, "[name].json"),
            name: "[name]",
        }),
        new LoaderOptionsPlugin({
            debug: true,
            options: {
                context: join(__dirname, "../../src"),
                output: {
                    path: dist,
                },
            },
        }),
    ],
};

module.exports = merge(require("./dev.base"), dll);
