/**
 * Base webpack config used for dev configuration
 */
const { EnvironmentPlugin } = require("webpack");
const { join } = require("path");

const srcPackage = require("../../src/package.json");

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: "development",
    target: "electron-renderer",
    externals: Object.keys(srcPackage.dependencies || {}),
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
        modules: [join(__dirname, "../src"), "node_modules"],
    },
    plugins: [
        new EnvironmentPlugin({
            NODE_ENV: "development",
        }),
    ],
};
