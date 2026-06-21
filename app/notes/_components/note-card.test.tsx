import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NoteCard } from '@/app/notes/_components/note-card';

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

describe('NoteCard', () => {
	const deleteAction = vi.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders note content and edit links', () => {
		render(
			<NoteCard
				id="42"
				title="Meeting notes"
				content="Discuss roadmap"
				updatedAtLabel="Jun 21, 2026"
				deleteAction={deleteAction}
			/>,
		);

		expect(screen.getByRole('heading', { name: 'Meeting notes' })).toBeInTheDocument();
		expect(screen.getByText('Discuss roadmap')).toBeInTheDocument();
		expect(screen.getByText('Updated Jun 21, 2026')).toBeInTheDocument();
		expect(screen.getAllByRole('link', { name: 'Edit' })).toHaveLength(1);
		expect(screen.getByRole('link', { name: /Meeting notes/ })).toHaveAttribute(
			'href',
			'/notes/42/edit',
		);
	});

	it('does not submit delete when confirm is dismissed', () => {
		vi.stubGlobal(
			'confirm',
			vi.fn(() => false),
		);

		render(
			<NoteCard
				id="1"
				title="Draft"
				content={null}
				updatedAtLabel="Jun 21, 2026"
				deleteAction={deleteAction}
			/>,
		);

		const form = screen.getByTestId('note-delete-button').closest('form');
		expect(form).not.toBeNull();
		fireEvent.submit(form as HTMLFormElement);

		expect(deleteAction).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it('allows delete submit when confirm is accepted', () => {
		const confirmMock = vi.fn(() => true);
		vi.stubGlobal('confirm', confirmMock);

		render(
			<NoteCard
				id="1"
				title="Draft"
				content={null}
				updatedAtLabel="Jun 21, 2026"
				deleteAction={deleteAction}
			/>,
		);

		const form = screen.getByTestId('note-delete-button').closest('form');
		expect(form).not.toBeNull();
		fireEvent.submit(form as HTMLFormElement);

		expect(confirmMock).toHaveBeenCalled();
		vi.unstubAllGlobals();
	});
});
