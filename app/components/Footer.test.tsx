import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
	it('renders footer text', () => {
		render(<Footer />);
		expect(screen.getByText(/Built with Bun, Next.js, Prisma, and Clerk/)).toBeInTheDocument();
	});
});
