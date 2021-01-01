const { spawn, execSync } = require("child_process");
const { existsSync } = require("fs");
const { join, resolve  } = require("path");

const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const chalk = require("chalk");
const { LoaderOptionsPlugin, DllReferencePlugin, NoEmitOnErrorsPlugin, EnvironmentPlugin } = require("webpack");

const CheckNodeEnv = require("../scripts/CheckNodeEnv");
const srcPackage = require("../../src/package.json");

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === "production") {
    CheckNodeEnv("development");
}

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const dllDir = join(__dirname, "../dll");
const manifest = resolve(dllDir, "renderer.json");
const requiredByDLLConfig = module.parent.filename.includes(
    "webpack.config.renderer.dev.dll"
);

/**
 * Warn if the DLL is not built
 */
if (
    !requiredByDLLConfig &&
    !(existsSync(dllDir) && existsSync(manifest))
) {
    console.log(
        chalk.black.bgYellow.bold(
            'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"'
        )
    );
    execSync("yarn build-dll");
}

module.exports = {
    devtool: "inline-source-map",
    mode: "development",
    target: "electron-renderer",
    entry: [
        "core-js",
        "regenerator-runtime/runtime",
        require.resolve("../../src/index.tsx"),
    ],
    output: {
        path: join(__dirname, "../../src"), // BASE
        libraryTarget: "commonjs2", // BASE  | https://github.com/webpack/webpack/issues/1114
        publicPath: `http://localhost:${port}/dist/`,
        filename: "renderer.dev.js",
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve("babel-loader"),
                        options: {
                            plugins: [
                                require.resolve("react-refresh/babel"),
                            ].filter(Boolean),
                        },
                    },
                ],
            },
            {
                test: /\.global\.css$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /^((?!\.global).)*\.css$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                localIdentName:
                                    "[name]__[local]__[hash:base64:5]",
                            },
                            sourceMap: true,
                            importLoaders: 1,
                        },
                    },
                ],
            },
            // SASS support - compile all .global.scss files and pipe it to style.css
            {
                test: /\.global\.(scss|sass)$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "sass-loader",
                    },
                ],
            },
            // SASS support - compile all other .scss files and pipe it to style.css
            {
                test: /^((?!\.global).)*\.(scss|sass)$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "@teamsupercell/typings-for-css-modules-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                localIdentName:
                                    "[name]__[local]__[hash:base64:5]",
                            },
                            sourceMap: true,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: "sass-loader",
                    },
                ],
            },
            // WOFF Font
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: "application/font-woff",
                    },
                },
            },
            // WOFF2 Font
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: "application/font-woff",
                    },
                },
            },
            // TTF Font
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: "application/octet-stream",
                    },
                },
            },
            // EOT Font
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: "file-loader",
            },
            // SVG Font
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: "image/svg+xml",
                    },
                },
            },
            // Common Image Formats
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                use: "url-loader",
            },
        ],
    },
    plugins: [
        requiredByDLLConfig
            ? null
            : new DllReferencePlugin({
                  context: dllDir,
                  manifest: require(manifest),
                  sourceType: "var",
              }),

        new NoEmitOnErrorsPlugin(),

        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         *
         * By default, use 'development' as NODE_ENV. This can be overriden with
         * 'staging', for example, by changing the ENV variables in the npm scripts
         */
        new EnvironmentPlugin({
            NODE_ENV: "development",
        }),

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
    externals: Object.keys(srcPackage.dependencies || {}), // BASE,
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"], // BASE
        modules: [join(__dirname, "../src"), "node_modules"] // BASE
    },
};
