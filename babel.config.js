const developmentEnvironments = ["development", "test"];

const developmentPlugins = [require("react-refresh/babel")];

const productionPlugins = [require("babel-plugin-dev-expression")];

module.exports = (api) => {
    // See docs about api at https://babeljs.io/docs/en/config-files#apicache

    const development = api.env(developmentEnvironments);

    return {
        presets: [
            [require("@babel/preset-env"), { debug: false }],
            [require("@babel/preset-react"), { development }],
            require("@babel/preset-typescript"),
        ],
        plugins: [
            [
                require("@babel/plugin-proposal-class-properties"),
                { loose: true },
            ],
            ...(development ? developmentPlugins : productionPlugins),
        ],
    };
};
