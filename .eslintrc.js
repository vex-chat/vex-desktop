module.exports = {
    // GLOBAL CONFIG
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:eslint-comments/recommended"
    ],
    parserOptions: {
        ecmaVersion: 12,
        project: './tsconfig.json'
    },
    settings: {
        react: {
          version: "detect"
        }
    },
    rules: {
        // TURN OFF ALL FAILING RULES FOR STRICER TS ESLINT
        "@typescript-eslint/no-floating-promises": 0,
        "@typescript-eslint/no-misused-promises": 0,
        "@typescript-eslint/no-unsafe-member-access": 0,
        "@typescript-eslint/no-unsafe-call": 0,
        "@typescript-eslint/no-unsafe-assignment": 0,
        "@typescript-eslint/no-unsafe-return": 0
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
