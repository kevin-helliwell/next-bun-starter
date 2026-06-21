import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';
import React from 'react';

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));

vi.mock('./ClerkUserMenuButton', () => ({
	default: ({ userName }: { userName: string; userImage: string }) => (
		<div data-testid="user-menu">User: {userName}</div>
	),
}));

vi.mock('./ClerkSignInButton', () => ({
	default: () => <div data-testid="sign-in">Sign In</div>,
}));

vi.mock('./ClerkSignUpButton', () => ({
	default: () => <div data-testid="sign-up">Sign Up</div>,
}));

vi.mock('./Logo', () => ({
	default: () => <div data-testid="logo-component">Logo</div>,
}));

vi.mock('next/link', () => ({
	default: ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href} data-testid="next-link">
			{children}
		</a>
	),
}));

describe('Navigation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders sign in when unauthenticated', async () => {
		const { auth } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({ userId: null } as never);

		render(await Navigation());

		expect(screen.getByTestId('sign-in')).toBeInTheDocument();
		expect(screen.getByTestId('sign-up')).toBeInTheDocument();
	});

	it('renders user menu and notes link when authenticated', async () => {
		const { auth, currentUser } = await import('@clerk/nextjs/server');
		vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as never);
		vi.mocked(currentUser).mockResolvedValue({
			username: 'testuser',
			firstName: 'Test',
			imageUrl: 'image.jpg',
		} as never);

		render(await Navigation());

		expect(screen.getByTestId('user-menu')).toHaveTextContent('User: testuser');
		expect(screen.getAllByText('Notes').length).toBeGreaterThan(0);
	});
});
