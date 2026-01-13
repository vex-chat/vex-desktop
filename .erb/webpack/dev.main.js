/**
 * Webpack config for development electron main process
 */

const path = require("path");
const { EnvironmentPlugin } = require("webpack");

const { dependencies } = require("../../src/package.json");

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: "development",
    target: "electron-main",
    devtool: "source-map",
    entry: "./src/main.dev.ts",
    output: {
        path: path.join(__dirname, "../../src"),
        filename: "main.dev.js",
        libraryTarget: "commonjs2",
    },
    externals: [...Object.keys(dependencies || {})],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    plugins: [
        new EnvironmentPlugin({
            NODE_ENV: "development",
            DEBUG_PROD: false,
            START_MINIMIZED: false,
        }),
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
        modules: [path.join(__dirname, "../../src"), "node_modules"],
    },
};
