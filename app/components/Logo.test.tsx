import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo', () => {
	it('renders app name', () => {
		render(<Logo />);
		expect(screen.getByText('My App')).toBeInTheDocument();
	});
});
