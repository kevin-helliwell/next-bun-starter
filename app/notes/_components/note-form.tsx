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
}

export function NoteForm({
	action,
	initialState,
	submitLabel,
	defaultTitle = '',
	defaultContent = '',
}: NoteFormProps) {
	const [state, formAction, pending] = useActionState(action, initialState);

	return (
		<form action={formAction} className="flex flex-col gap-4 max-w-xl">
			<label className="form-control">
				<span className="label-text">Title</span>
				<input name="title" defaultValue={defaultTitle} className="input input-bordered" required />
				{state.errors.title ? (
					<span className="text-error text-sm mt-1">{state.errors.title}</span>
				) : null}
			</label>

			<label className="form-control">
				<span className="label-text">Content</span>
				<textarea
					name="content"
					defaultValue={defaultContent}
					className="textarea textarea-bordered min-h-32"
				/>
			</label>

			{state.errors.form ? <p className="text-error text-sm">{state.errors.form}</p> : null}

			<div className="flex gap-2">
				<button type="submit" className="btn btn-primary" disabled={pending}>
					{pending ? 'Saving…' : submitLabel}
				</button>
				<Link href="/notes" className="btn btn-ghost">
					Cancel
				</Link>
			</div>
		</form>
	);
}
