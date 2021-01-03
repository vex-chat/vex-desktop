/**
 * Base webpack config used across prod configs
 */
const path = require("path");

const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const { dependencies } = require("../../src/package.json");

const devtoolsConfig =
    process.env.DEBUG_PROD === "true"
        ? {
              devtool: "source-map",
          }
        : {};

/** @type {import('webpack').Configuration} */
module.exports = {
    ...devtoolsConfig,
    mode: "production",
    externals: [...Object.keys(dependencies || {})],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            },
        ],
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode:
                process.env.OPEN_ANALYZER === "true" ? "server" : "disabled",
            openAnalyzer: process.env.OPEN_ANALYZER === "true",
        }),
    ],
    output: {
        libraryTarget: "commonjs2",
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
        modules: [path.join(__dirname, "../src"), "node_modules"],
    },
};
