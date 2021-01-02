/**
 * Builds the DLL for development electron renderer process
 */
const { join } = require("path");

const { DllPlugin, LoaderOptionsPlugin } = require("webpack");
const { merge } = require("webpack-merge");

const CheckNodeEnv = require("../scripts/CheckNodeEnv");
const rootPackage = require("../../package.json");

const base = require("./webpack.base");

CheckNodeEnv("development");

const dist = join(__dirname, "../dll");

module.exports = merge(base, {
    context: join(__dirname, "../.."),
    devtool: "eval",
    externals: ["fsevents", "crypto-browserify"],
    module: require("./webpack.renderer.js").module,
    entry: {
        renderer: Object.keys(rootPackage.dependencies || {}),
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
});
