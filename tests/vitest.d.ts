// extending types for custom vitest matchers (see delete-unused-images.test.ts)
import 'vitest';
import { CustomMatcher } from 'aws-sdk-client-mock-vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
	interface Assertion<T = any> extends CustomMatcher<T>, TestingLibraryMatchers<T, void> {}
	interface AsymmetricMatchersContaining extends CustomMatcher, TestingLibraryMatchers<any, void> {}
}
