// extends Vitest's expect method with methods from react-testing-library
// source: https://medium.com/@kafkahw/adding-vitest-react-testing-library-to-an-existing-react-project-w-o-vite-97e4aeb2ae2d
import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(context => {
	const testName = context.task.name;
	console.log(`[TEST RUNNING] ${testName}`);
	context.onTestFinished(result => {
		if (result.state === 'pass') {
			console.log(`[TEST PASS] ${testName}`);
		}
	});
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
	cleanup();
});
