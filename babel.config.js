const developmentEnvironments = ["development", "test"];

const developmentPlugins = [];

const productionPlugins = [
    require("babel-plugin-dev-expression"),

    // babel-preset-react-optimize
    require("@babel/plugin-transform-react-constant-elements"),
    require("@babel/plugin-transform-react-inline-elements"),
];

module.exports = (api) => {
    // See docs about api at https://babeljs.io/docs/en/config-files#apicache

    const development = api.env(developmentEnvironments);

    return {
        presets: [
            [require("@babel/preset-env"), { debug: true }],
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
