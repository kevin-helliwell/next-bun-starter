import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavLinkItem from './NavLinkItem';
import { vi, expect } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({
	default: ({
		href,
		children,
		className,
	}: {
		href: string;
		children: React.ReactNode;
		className?: string;
	}) => (
		<a href={href} className={className}>
			{children}
		</a>
	),
}));

vi.mock('next/navigation', () => ({
	usePathname: () => '/',
}));

describe('NavLinkItem', () => {
	it('renders tab variant with active styles when pathname matches', () => {
		render(<NavLinkItem href="/">Home</NavLinkItem>);

		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByRole('link')).toHaveClass('text-primary', 'font-medium', 'border-primary');
	});

	it('renders menu variant with rounded hover styles', () => {
		render(
			<NavLinkItem href="/test" variant="menu">
				Test Link
			</NavLinkItem>,
		);

		expect(screen.getByRole('link')).toHaveClass('rounded-md', 'hover:bg-base-200');
	});

	it('calls handleClick and blurs active element if inside dropdown', () => {
		render(
			<div className="dropdown">
				<NavLinkItem href="/test" variant="menu">
					Test Link
				</NavLinkItem>
			</div>,
		);

		const listItem = screen.getByRole('listitem');
		const mockBlur = vi.fn();
		Object.defineProperty(document, 'activeElement', {
			get: () => ({ blur: mockBlur }),
			configurable: true,
		});

		fireEvent.click(listItem);
		expect(mockBlur).toHaveBeenCalled();
	});

	it('does not blur active element if not inside a dropdown', () => {
		render(<NavLinkItem href="/test">Test Link</NavLinkItem>);

		const listItem = screen.getByRole('listitem');
		const mockBlur = vi.fn();
		Object.defineProperty(document, 'activeElement', {
			get: () => ({ blur: mockBlur }),
			configurable: true,
		});

		fireEvent.click(listItem);
		expect(mockBlur).not.toHaveBeenCalled();
	});
});
