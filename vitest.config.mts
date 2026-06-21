import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Consider migrating the entire app to use vite
// https://www.robinwieruch.de/vite-create-react-app/

// Plugin to transform require('/public/...') to relative paths for testing
const transformPublicRequire = () => {
	const projectRoot = fileURLToPath(new URL('.', import.meta.url));
	return {
		name: 'transform-public-require',
		enforce: 'pre' as const, // Run before other plugins to transform require statements
		transform(code: string, id: string) {
			// Only transform TypeScript/JavaScript files in the app directory
			if (!id.includes('/app/') || (!id.endsWith('.ts') && !id.endsWith('.tsx'))) {
				return;
			}
			
			// Transform require('/public/...') to use relative path from the file's location
			if (code.includes("require('/public/")) {
				const transformed = code.replace(
					/require\('\/public\/([^']+)'\)/g,
					(match, filePath) => {
						const publicPath = path.join(projectRoot, 'public', filePath);
						const fileDir = path.dirname(id);
						let relativePath = path.relative(fileDir, publicPath);
						// Normalize path separators and ensure it starts with ./
						relativePath = relativePath.replace(/\\/g, '/');
						if (!relativePath.startsWith('.')) {
							relativePath = './' + relativePath;
						}
						return `require('${relativePath}')`;
					},
				);
				
				if (transformed !== code) {
					return { code: transformed, map: null };
				}
			}
		},
	};
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [transformPublicRequire(), react()], // Put transform plugin first
	test: {
		setupFiles: './tests/setup.ts',
		environment: 'jsdom',
		globals: true, // automatic imports for describe, it, expect, etc
		coverage: {
			provider: 'v8',
			include: ['app/**/*', 'lib/**/*'],
			exclude: ['**/*.test.{ts,tsx}'],
		},
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('.', import.meta.url)),
			components: fileURLToPath(new URL('./app/components', import.meta.url)), // Resolve components to app/components
			// Resolve /public/ absolute paths to project's public directory
			'/public': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'public'),
		},
	},
});
