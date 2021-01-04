// Keep all expensive linting rules here so then can be forked to ts process during dev. Makes vscode and husky snappy.
module.exports = {
    // lets us use typescript to still submit errors even with babel doing the compilation
    typescript: {
        diagnosticOptions: {
            semantic: true,
            syntactic: true,
        },
        mode: "write-references",
    },
    // don't submit errors to the dev server unless you want the build to fail
    logger: {
        devServer: false,
    },
    eslint: {
        enabled: true,
        files: "./src/**/*.{ts,tsx,js,jsx}",
        // TYPE AWARE CONFIG
        options: {
            baseConfig: {
                extends: [
                    "plugin:import/typescript",
                    "plugin:@typescript-eslint/recommended-requiring-type-checking",
                ],
                settings: {
                    "import/resolver": {
                        typescript: {
                            project: "./tsconfig.json",
                        },
                    },
                },
            },
            parserOptions: {
                ecmaVersion: 12,
                project: "./tsconfig.json",
            },
            rules: {
                // THIS RULE IS INCREDIBLY EXPENSIVE
                "import/no-unresolved": 2,
                // TURN OFF ALL FAILING RULES FOR STRICER TS ESLINT
                "@typescript-eslint/no-unsafe-member-access": 0,
                "@typescript-eslint/no-unsafe-call": 0,
                "@typescript-eslint/no-unsafe-assignment": 0,
                "@typescript-eslint/no-unsafe-return": 0,
                // TURN ON EXTRA TS TYPEAWARE RULES
                "@typescript-eslint/no-confusing-void-expression": 2,
                // TURN OFF SOME ANNOYING RULES
                "@typescript-eslint/no-misused-promises": [
                    "error",
                    {
                        checksVoidReturn: false,
                    },
                ],
            },
        },
    },
};
