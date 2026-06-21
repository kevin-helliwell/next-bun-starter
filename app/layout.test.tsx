import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing';

vi.mock('next/font/google', () => ({
	Outfit: () => ({
		className: 'mocked-font',
	}),
}));

vi.mock('@clerk/nextjs', () => ({
	ClerkProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="clerk-provider">{children}</div>
	),
}));

vi.mock('./components/Navigation', () => ({
	default: () => <nav data-testid="navigation">Mocked Navigation</nav>,
}));

vi.mock('./components/Footer', () => ({
	Footer: () => <footer data-testid="footer">Mocked Footer</footer>,
}));

import RootLayout from './layout';

describe('RootLayout', () => {
	beforeEach(() => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing';
	});

	it('renders layout shell', async () => {
		const layout = await RootLayout({ children: <div data-testid="child">Child</div> });
		const { getByTestId } = render(layout);

		expect(getByTestId('clerk-provider')).toBeInTheDocument();
		expect(getByTestId('navigation')).toBeInTheDocument();
		expect(getByTestId('child')).toBeInTheDocument();
		expect(getByTestId('footer')).toBeInTheDocument();
	});

	it('throws when Clerk publishable key is missing', async () => {
		delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

		await expect(RootLayout({ children: <div>Test</div> })).rejects.toThrow(
			'Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable',
		);
	});
});
