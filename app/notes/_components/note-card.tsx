'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';

interface NoteCardProps {
	readonly id: string;
	readonly title: string;
	readonly content: string | null;
	readonly updatedAtLabel: string;
	readonly deleteAction: (formData: FormData) => Promise<void>;
}

export function NoteCard({ id, title, content, updatedAtLabel, deleteAction }: NoteCardProps) {
	const editHref = `/notes/${id}/edit`;

	const handleDelete = (event: FormEvent<HTMLFormElement>) => {
		if (!confirm('Delete this note? This cannot be undone.')) {
			event.preventDefault();
		}
	};

	return (
		<li className="card bg-white border border-base-300 shadow-sm hover:shadow-md transition-shadow">
			<Link href={editHref} className="card-body block">
				<h2 className="card-title text-lg">{title}</h2>
				{content ? (
					<p className="whitespace-pre-wrap line-clamp-2 text-base-content/80">{content}</p>
				) : null}
				<p className="text-sm text-base-content/60">Updated {updatedAtLabel}</p>
			</Link>
			<div className="card-actions justify-end px-6 pb-4">
				<Link href={editHref} className="btn btn-ghost">
					Edit
				</Link>
				<form action={deleteAction} onSubmit={handleDelete}>
					<button type="submit" className="btn btn-error btn-outline">
						Delete
					</button>
				</form>
			</div>
		</li>
	);
}
