import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalError from './global-error';
import * as Sentry from '@sentry/nextjs';

// Mock Next.js error component
vi.mock('next/error', () => ({
	default: ({ statusCode }: { statusCode: number }) => (
		<div data-testid="next-error" data-status-code={statusCode}>
			Next.js Error Component
		</div>
	),
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
	captureException: vi.fn(),
}));

describe('GlobalError', () => {
	const mockError = new Error('Test error message');
	const mockCaptureException = vi.mocked(Sentry.captureException);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the HTML structure with body', () => {
		render(<GlobalError error={mockError} />);

		// Check that html and body elements are rendered
		const htmlElement = document.querySelector('html');
		const bodyElement = document.querySelector('body');
		expect(htmlElement).toBeInTheDocument();
		expect(bodyElement).toBeInTheDocument();
	});

	it('renders NextError component with statusCode 0', () => {
		render(<GlobalError error={mockError} />);

		const nextError = screen.getByTestId('next-error');
		expect(nextError).toBeInTheDocument();
		expect(nextError).toHaveAttribute('data-status-code', '0');
	});

	it('calls Sentry.captureException with the error on mount', () => {
		render(<GlobalError error={mockError} />);

		expect(mockCaptureException).toHaveBeenCalledWith(mockError);
		expect(mockCaptureException).toHaveBeenCalledTimes(1);
	});

	it('calls Sentry.captureException when error changes', () => {
		const { rerender } = render(<GlobalError error={mockError} />);

		expect(mockCaptureException).toHaveBeenCalledWith(mockError);
		expect(mockCaptureException).toHaveBeenCalledTimes(1);

		const newError = new Error('New error message');
		rerender(<GlobalError error={newError} />);

		expect(mockCaptureException).toHaveBeenCalledWith(newError);
		expect(mockCaptureException).toHaveBeenCalledTimes(2);
	});

	it('handles error with digest property', () => {
		const errorWithDigest = new Error('Error with digest') as Error & { digest?: string };
		errorWithDigest.digest = 'test-digest-123';

		render(<GlobalError error={errorWithDigest} />);

		expect(mockCaptureException).toHaveBeenCalledWith(errorWithDigest);
		expect(screen.getByTestId('next-error')).toBeInTheDocument();
	});

	it('does not call Sentry.captureException multiple times when error does not change', () => {
		const { rerender } = render(<GlobalError error={mockError} />);

		expect(mockCaptureException).toHaveBeenCalledTimes(1);

		// Rerender with the same error object
		rerender(<GlobalError error={mockError} />);

		// Should still be called only once (useEffect dependency hasn't changed)
		expect(mockCaptureException).toHaveBeenCalledTimes(1);
	});
});
