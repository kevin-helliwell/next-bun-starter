import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavLinkItem from './NavLinkItem';
import { vi, expect } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({
	default: ({ href, children }: { href: string; children: React.ReactNode }) => (
		<a href={href}>{children}</a>
	),
}));

describe('NavLinkItem', () => {
	it('renders correctly with given href and children', () => {
		render(<NavLinkItem href="/test">Test Link</NavLinkItem>);

		const listItem = screen.getByRole('listitem');
		expect(listItem).toBeInTheDocument();
		expect(screen.getByText('Test Link')).toBeInTheDocument();
		expect(screen.getByRole('listitem')).toHaveClass('p-2 hover:bg-gray-100 rounded-md');
	});

	it('calls handleClick and blurs active element if inside dropdown', () => {
		render(
			<div className="dropdown">
				<NavLinkItem href="/test">Test Link</NavLinkItem>
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
