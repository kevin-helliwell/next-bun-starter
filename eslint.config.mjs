import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    {
        ignores: [
            "**/next.config.js",
            "**/prisma/generated/**",
            "**/.github/actions/**/dist/**",
            "**/postcss.config.js",
            "**/eslint.config.mjs",
            "**/.next/**",
        ],
    },
    ...compat.extends("next/core-web-vitals"),
    ...compat.extends("plugin:cypress/recommended"),
    ...compat.extends("prettier"),
    // TypeScript files with project-aware parser
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            "@typescript-eslint": typescriptEslintEslintPlugin,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },

                project: ["./tsconfig.json", "./cypress/tsconfig.json"],
            },
        },

        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error"],
        },
    },
    // JavaScript files without project-aware parser
    {
        files: ["**/*.js", "**/*.mjs"],
        plugins: {
            "@typescript-eslint": typescriptEslintEslintPlugin,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                // No project option for JS files
            },
        },

        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off", // Disable for JS files
        },
    },
    {
        files: ["**/*.test.tsx", "**/*.test.ts"],

        rules: {
            "@next/next/no-img-element": "off",
        },
    },
];