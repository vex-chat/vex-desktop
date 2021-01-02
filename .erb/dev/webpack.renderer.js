const { spawn } = require("child_process");
const { join, resolve } = require("path");

const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const {
    LoaderOptionsPlugin,
    DllReferencePlugin,
    NoEmitOnErrorsPlugin,
} = require("webpack");
const { merge } = require("webpack-merge");

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const dllDir = join(__dirname, "../dll");

/** @type {import('webpack').Configuration} */
const renderer = {
    devtool: "eval-source-map",
    entry: [require.resolve("../../src/index.tsx")],
    output: {
        path: join(__dirname, "../../src"),
        libraryTarget: "commonjs2",
        publicPath,
        filename: "renderer.dev.js",
    },
    plugins: [
        new DllReferencePlugin({
            context: dllDir,
            manifest: require(resolve(dllDir, "renderer.json")),
            sourceType: "var",
        }),

        new NoEmitOnErrorsPlugin(),
        new LoaderOptionsPlugin({
            debug: true,
        }),
        new ReactRefreshWebpackPlugin(),
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
    devServer: {
        port,
        publicPath,
        compress: true,
        noInfo: false,
        stats: "errors-only",
        inline: true,
        lazy: false,
        hot: true,
        headers: { "Access-Control-Allow-Origin": "*" },
        contentBase: join(__dirname, "dist"),
        watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
            poll: 100,
        },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false,
        },
        before() {
            console.log("Starting Main Process...");
            spawn("npm", ["run", "start:main"], {
                shell: true,
                env: process.env,
                stdio: "inherit",
            })
                .on("close", (code) => process.exit(code))
                .on("error", (spawnError) => console.error(spawnError));
        },
    },
};

module.exports = merge(require("./webpack.base"), renderer);
