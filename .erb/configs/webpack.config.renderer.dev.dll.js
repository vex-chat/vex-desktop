/**
 * Builds the DLL for development electron renderer process
 */
const webpack = require("webpack");

const { join } = require("path");

const CheckNodeEnv = require("../scripts/CheckNodeEnv");
const srcPackage = require("../../src/package.json");
const rootPackage = require("../../package.json");

CheckNodeEnv("development");

const dist = join(__dirname, "../dll");

module.exports = {
    context: join(__dirname, "../.."),
    devtool: "eval",
    mode: "development",
    target: "electron-renderer",
    externals: [
        ...Object.keys(srcPackage.dependencies || {}), // BASE
        "fsevents",
        "crypto-browserify",
    ],
    /**
     * Use `module` from `webpack.config.renderer.dev.js`
     */
    module: require("./webpack.config.renderer.dev.js").module,
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
        new webpack.DllPlugin({
            path: join(dist, "[name].json"),
            name: "[name]",
        }),

        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         */
        new webpack.EnvironmentPlugin({
            NODE_ENV: "development",
        }),

        new webpack.LoaderOptionsPlugin({
            debug: true,
            options: {
                context: join(__dirname, "../../src"),
                output: {
                    path: dist,
                },
            },
        }),
    ],
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"], // BASE
        modules: [join(__dirname, "../src"), "node_modules"], // BASE
    },
};
