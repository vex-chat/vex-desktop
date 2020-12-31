module.exports = {
    // GLOBAL CONFIG
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:eslint-comments/recommended',
        "plugin:prettier/recommended",
        "prettier/@typescript-eslint",
    ],
    plugins: ['import', "simple-import-sort"],
    parserOptions: {
        ecmaVersion: 12,
        project: './tsconfig.json',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        // TURN OFF ALL FAILING RULES FOR STRICER TS ESLINT
        '@typescript-eslint/no-floating-promises': 0,
        '@typescript-eslint/no-misused-promises': 0,
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-return': 0,
        // CYCLICAL DEPENDENCIES BREAK LOCAL
        'import/no-cycle': 2,
        // SIMPLE SORT
        "simple-import-sort/imports": 2,
        "simple-import-sort/exports": 2,
        "sort-imports": 0,
        "import/first": 2,
        "import/newline-after-import": 2,
        "import/no-duplicates": 2,
    },

    overrides: [
        // REACT OVERRIDES
        {
            files: ['*.tsx'],
            extends: ['plugin:react/recommended', "prettier/react"],
            rules: {
                'react/prop-types': 0,
                'react/display-name': 0,
            },
        },
    ],
};
