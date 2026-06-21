import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';
import pluginCypress from 'eslint-plugin-cypress';

export default defineConfig([
	...nextVitals,
	prettier,
	globalIgnores([
		'**/next.config.js',
		'**/prisma/generated/**',
		'**/postcss.config.js',
		'**/eslint.config.mjs',
	]),
	{
		files: ['cypress/**/*.ts', 'cypress/**/*.js'],
		extends: [pluginCypress.configs.recommended],
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.json', './cypress/tsconfig.json'],
			},
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error'],
		},
	},
	{
		files: ['**/*.js', '**/*.mjs'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
	{
		files: ['**/*.test.tsx', '**/*.test.ts'],
		rules: {
			'@next/next/no-img-element': 'off',
		},
	},
]);
