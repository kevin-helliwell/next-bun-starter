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

const fieldClassName = 'input input-bordered w-full bg-white';

export function NoteForm({
	action,
	initialState,
	submitLabel,
	defaultTitle = '',
	defaultContent = '',
}: NoteFormProps) {
	const [state, formAction, pending] = useActionState(action, initialState);

	return (
		<div className="card bg-white border border-base-300 shadow-sm max-w-xl">
			<form action={formAction} className="card-body gap-5">
				<label className="form-control w-full">
					<div className="label py-0">
						<span className="label-text font-medium">Title</span>
					</div>
					<input
						name="title"
						defaultValue={defaultTitle}
						className={fieldClassName}
						placeholder="Note title"
						required
					/>
					{state.errors.title ? (
						<span className="text-error text-sm mt-1">{state.errors.title}</span>
					) : null}
				</label>

				<label className="form-control w-full">
					<div className="label py-0">
						<span className="label-text font-medium">Content</span>
					</div>
					<textarea
						name="content"
						defaultValue={defaultContent}
						className="textarea textarea-bordered w-full min-h-40 bg-white"
						placeholder="Write your note…"
					/>
				</label>

				{state.errors.form ? <p className="text-error text-sm">{state.errors.form}</p> : null}

				<div className="card-actions justify-start gap-2 pt-2">
					<button type="submit" className="btn btn-primary" disabled={pending}>
						{pending ? 'Saving…' : submitLabel}
					</button>
					<Link href="/notes" className="btn btn-outline">
						Cancel
					</Link>
				</div>
			</form>
		</div>
	);
}
