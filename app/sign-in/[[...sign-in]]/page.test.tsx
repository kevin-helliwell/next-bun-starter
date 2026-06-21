import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Page from './page';

// Mock Clerk's SignIn component
vi.mock('@clerk/nextjs', () => ({
	SignIn: () => <div data-testid="clerk-signin">Clerk SignIn Component</div>,
}));

describe('SignIn Page', () => {
	it('renders without crashing', () => {
		render(<Page />);
	});

	it('renders the Clerk SignIn component', () => {
		render(<Page />);
		expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
	});
});
