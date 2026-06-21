import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClerkUserMenuButton from './ClerkUserMenuButton';
import React from 'react';

// Mock next/image
vi.mock('next/image', () => ({
	default: ({ alt, src }: { alt: string; src: string }) => {
		return <img alt={alt} src={src} />;
	},
}));

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
	SignedIn: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="signed-in">{children}</div>
	),
	SignOutButton: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="sign-out-button">{children}</div>
	),
	UserProfile: () => <div data-testid="user-profile">User Profile Content</div>,
}));

describe('ClerkUserMenuButton', () => {
	const mockProps = {
		userName: 'Test User',
		userImage: '/test-image.jpg',
	};

	it('renders within SignedIn component', () => {
		render(<ClerkUserMenuButton {...mockProps} />);
		expect(screen.getByTestId('signed-in')).toBeInTheDocument();
	});

	it('displays user name in greeting', async () => {
		render(<ClerkUserMenuButton {...mockProps} />);

		// Open the dropdown by clicking the avatar button
		const avatarButton = screen.getByRole('button', { name: /avatar/i });
		fireEvent.click(avatarButton);

		// Wait for the greeting text to appear
		await waitFor(() => expect(screen.getByText(`Hi ${mockProps.userName}!`)).toBeInTheDocument());
	});

	it('renders user avatar image', () => {
		render(<ClerkUserMenuButton {...mockProps} />);
		const avatar = screen.getByAltText('avatar');
		expect(avatar).toBeInTheDocument();
		expect(avatar).toHaveAttribute('src', mockProps.userImage);
	});

	it('opens and closes dropdown when clicking avatar', async () => {
		render(<ClerkUserMenuButton {...mockProps} />);
		const avatarButton = screen.getByRole('button');

		// Click to open dropdown
		fireEvent.click(avatarButton);
		await waitFor(() => screen.getByText(`Hi ${mockProps.userName}!`));

		// Click to close dropdown
		fireEvent.click(avatarButton);
		await waitFor(() =>
			expect(screen.queryByText(`Hi ${mockProps.userName}!`)).not.toBeInTheDocument(),
		);
	});

	it('opens user profile modal when manage account button is clicked', async () => {
		render(<ClerkUserMenuButton {...mockProps} />);
		fireEvent.click(screen.getByRole('button')); // Open dropdown
		fireEvent.click(screen.getByText('Manage your account'));
		await waitFor(() => screen.getByTestId('user-profile'));
		expect(screen.getByTestId('user-profile')).toBeInTheDocument();
	});

	it('closes user profile modal when clicking Close', async () => {
		render(<ClerkUserMenuButton {...mockProps} />);
		fireEvent.click(screen.getByRole('button'));
		fireEvent.click(screen.getByText('Manage your account'));
		await waitFor(() => screen.getByTestId('user-profile'));

		fireEvent.click(screen.getByText('Close'));
		await waitFor(() => expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument());
	});

	it('closes dropdown when clicking outside', async () => {
		render(<ClerkUserMenuButton {...mockProps} />);
		fireEvent.click(screen.getByRole('button')); // Open dropdown
		await waitFor(() => screen.getByText(`Hi ${mockProps.userName}!`));

		fireEvent.mouseDown(document.body); // Simulate clicking outside
		await waitFor(() =>
			expect(screen.queryByText(`Hi ${mockProps.userName}!`)).not.toBeInTheDocument(),
		);
	});
});
