// extends Vitest's expect method with methods from react-testing-library
// source: https://medium.com/@kafkahw/adding-vitest-react-testing-library-to-an-existing-react-project-w-o-vite-97e4aeb2ae2d
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
	cleanup();
});
