module.exports = {
    // GLOBAL CONFIG
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        "plugin:eslint-comments/recommended"
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    settings: {
        react: {
          version: "detect"
        }
    },
    plugins: [],
    overrides: [
        // REACT OVERRIDES
        {
            files: ["*.tsx"],
            extends: [
                'plugin:react/recommended',
            ],
            rules: {
                "react/prop-types": 0,
                "react/display-name": 0,
            },
        }
    ],
};
