const developmentEnvironments = ["development", "test"];

const developmentPlugins = [require("react-refresh/babel")];

const productionPlugins = [require("babel-plugin-dev-expression")];

module.exports = (api) => {
    // See docs about api at https://babeljs.io/docs/en/config-files#apicache

    const development = api.env(developmentEnvironments);

    return {
        presets: [
            [
                require("@babel/preset-env"),
                {
                    debug: false,
                    bugfixes: true,
                    shippedProposals: true,
                    useBuiltIns: "usage",
                    corejs: { version: 3 },
                },
            ],
            [
                require("@babel/preset-react"),
                { development, runtime: "automatic" },
            ],
            [
                require("@babel/preset-typescript"),
                { onlyRemoveTypeImports: true },
            ],
        ],
        plugins: [...(development ? developmentPlugins : productionPlugins)],
    };
};
