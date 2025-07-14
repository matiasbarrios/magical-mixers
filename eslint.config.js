// Requirements
import js from '@eslint/js';
import globals from 'globals';
import eslintPluginImport from 'eslint-plugin-import';
// eslint-disable-next-line import/no-unresolved
import { defineConfig, globalIgnores } from 'eslint/config';


// Exported
export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.js'],
        extends: [
            js.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                process: 'readonly',
            },
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            import: eslintPluginImport,
        },
        rules: {
            "arrow-parens": ["error", "as-needed",
                {
                    requireForBlockBody: true,
                },
            ],
            "comma-dangle": ["error",
                {
                    arrays: "always-multiline",
                    objects: "always-multiline",
                    imports: "always-multiline",
                    exports: "always-multiline",
                    functions: "never",
                },
            ],
            "func-names": ["error", "as-needed"],
            "function-paren-newline": ["error", 
                { 
                    minItems: 5,
                },
            ],
            "func-style": ["warn", "declaration",
                {
                    allowArrowFunctions: true,
                },
            ],
            indent: ['error', 4],
            'import/no-unresolved': 'error',
            'import/named': 'error',
            "linebreak-style": ["error", "unix"],
            "no-nested-ternary": ["warn"],
            "no-param-reassign": ["error",
                {
                    props: false,
                },
            ],
            "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
            "no-restricted-properties": ["warn"],
            "no-underscore-dangle": ["off"],
            "no-undef": ["warn"],
            'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
            "object-shorthand": ["off", "methods"],
            "prefer-regex-literals": ["off"],
            "quote-props": ["error", "as-needed",
                {
                    keywords: false,
                    unnecessary: true,
                    numbers: true,
                },
            ],
            "import/exports-last": ["error"],
            "import/newline-after-import": ["error",
                {
                    count: 2,
                },
            ],
            "import/no-extraneous-dependencies": ["error",
                {
                    packageDir: "./",
                },
            ],
            "import/no-named-as-default": ["warn"],
            "import/order": ["error",
                {
                    "newlines-between": "never",
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                },
            ],
            "import/prefer-default-export": ["off"],
            "import/extensions": ["off"],
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js'],
                },
            },
        },
    },
])
