'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { NoteFormState } from '@/app/server-actions/notes-types';

interface NoteFormProps {
	readonly action: (prevState: NoteFormState, formData: FormData) => Promise<NoteFormState>;
	readonly initialState: NoteFormState;
	readonly submitLabel: string;
	readonly defaultTitle?: string;
	readonly defaultContent?: string;
	readonly showBackLink?: boolean;
}

const titleClassName =
	'w-full text-3xl font-semibold tracking-tight border-0 border-b border-base-300/60 rounded-none px-0 py-2 bg-transparent focus:outline-none focus:border-primary/50 placeholder:text-base-content/30 transition-colors';

const contentClassName =
	'w-full min-h-[55vh] text-base leading-7 border-0 rounded-none px-0 py-4 bg-transparent resize-y focus:outline-none placeholder:text-base-content/30';

export function NoteForm({
	action,
	initialState,
	submitLabel,
	defaultTitle = '',
	defaultContent = '',
	showBackLink = false,
}: NoteFormProps) {
	const [state, formAction, pending] = useActionState(action, initialState);

	return (
		<div className="card bg-base-50 border border-base-300 shadow-sm rounded-box w-full">
			<form action={formAction} className="card-body gap-6 p-6 md:p-8">
				{showBackLink ? (
					<div>
						<Link href="/notes" className="link link-primary text-sm">
							← Notes
						</Link>
					</div>
				) : null}

				<label className="form-control w-full">
					<span className="sr-only">Title</span>
					<input
						name="title"
						defaultValue={defaultTitle}
						className={titleClassName}
						placeholder="Note title"
						required
						data-testid="note-title-input"
					/>
					{state.errors.title ? (
						<span className="text-error text-sm mt-1">{state.errors.title}</span>
					) : null}
				</label>

				<label className="form-control w-full flex-1">
					<span className="sr-only">Content</span>
					<textarea
						name="content"
						defaultValue={defaultContent}
						className={contentClassName}
						placeholder="Start writing…"
						data-testid="note-content-input"
					/>
				</label>

				{state.errors.form ? <p className="text-error text-sm">{state.errors.form}</p> : null}

				<div className="sticky bottom-0 flex gap-2 pt-4 border-t border-base-300/60 bg-base-50">
					<button
						type="submit"
						className="btn btn-primary"
						disabled={pending}
						data-testid="note-submit-button"
					>
						{pending ? 'Saving…' : submitLabel}
					</button>
					{pending ? (
						<span className="btn btn-ghost btn-disabled pointer-events-none">Cancel</span>
					) : (
						<Link href="/notes" className="btn btn-ghost" data-testid="note-cancel-link">
							Cancel
						</Link>
					)}
				</div>
			</form>
		</div>
	);
}
