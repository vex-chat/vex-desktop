/**
 * Base webpack config used across other specific configs
 */
const path = require("path");
const webpack = require("webpack");
const { dependencies } = require("../../src/package.json");

module.exports = {
    externals: [...Object.keys(dependencies || {})],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                    },
                },
            },
        ],
    },

    output: {
        path: path.join(__dirname, "../../src"),
        // https://github.com/webpack/webpack/issues/1114
        libraryTarget: "commonjs2",
    },

    /**
     * Determine the array of extensions that should be used to resolve modules.
     */
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
        modules: [path.join(__dirname, "../src"), "node_modules"],
    },

    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: "production",
        }),
    ],
};
