import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { NoteForm } from '@/app/notes/_components/note-form';
import { emptyFormState } from '@/app/server-actions/notes-types';

const mockFormAction = vi.fn();
const mockUseActionState = vi.fn();

vi.mock('react', async importOriginal => {
	const actual = await importOriginal<typeof import('react')>();
	return {
		...actual,
		useActionState: (...args: Parameters<typeof actual.useActionState>) =>
			mockUseActionState(...args),
	};
});

vi.mock('next/link', () => ({
	default: ({
		href,
		children,
		className,
		...props
	}: {
		href: string;
		children: React.ReactNode;
		className?: string;
	}) => (
		<a href={href} className={className} {...props}>
			{children}
		</a>
	),
}));

describe('NoteForm', () => {
	const action = vi.fn().mockResolvedValue(emptyFormState);

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseActionState.mockReturnValue([emptyFormState, mockFormAction, false]);
	});

	it('renders default values and submit label', () => {
		render(
			<NoteForm
				action={action}
				initialState={emptyFormState}
				submitLabel="Save changes"
				defaultTitle="My title"
				defaultContent="My content"
			/>,
		);

		expect(screen.getByDisplayValue('My title')).toBeInTheDocument();
		expect(screen.getByDisplayValue('My content')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
	});

	it('shows validation errors from action state', () => {
		mockUseActionState.mockReturnValue([
			{ errors: { title: 'Title is required', form: 'Something went wrong' } },
			mockFormAction,
			false,
		]);

		render(<NoteForm action={action} initialState={emptyFormState} submitLabel="Create note" />);

		expect(screen.getByText('Title is required')).toBeInTheDocument();
		expect(screen.getByText('Something went wrong')).toBeInTheDocument();
	});

	it('shows back link when enabled', () => {
		render(
			<NoteForm
				action={action}
				initialState={emptyFormState}
				submitLabel="Create note"
				showBackLink
			/>,
		);

		expect(screen.getByRole('link', { name: '← Notes' })).toHaveAttribute('href', '/notes');
	});

	it('disables cancel link while pending', () => {
		mockUseActionState.mockReturnValue([emptyFormState, mockFormAction, true]);

		render(<NoteForm action={action} initialState={emptyFormState} submitLabel="Create note" />);

		expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
		expect(screen.queryByTestId('note-cancel-link')).not.toBeInTheDocument();
		expect(screen.getByText('Cancel')).toHaveClass('btn-disabled');
	});

	it('submits form fields via form action', async () => {
		const user = userEvent.setup();

		render(<NoteForm action={action} initialState={emptyFormState} submitLabel="Create note" />);

		await user.type(screen.getByTestId('note-title-input'), 'New note');
		await user.type(screen.getByTestId('note-content-input'), 'Note body');
		await user.click(screen.getByTestId('note-submit-button'));

		expect(mockFormAction).toHaveBeenCalled();
	});
});
