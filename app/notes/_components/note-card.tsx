'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent, MouseEvent } from 'react';

interface NoteCardProps {
	readonly id: string;
	readonly title: string;
	readonly content: string | null;
	readonly updatedAtLabel: string;
	readonly deleteAction: (formData: FormData) => Promise<void>;
}

export function NoteCard({ id, title, content, updatedAtLabel, deleteAction }: NoteCardProps) {
	const router = useRouter();
	const editHref = `/notes/${id}/edit`;

	const handleDelete = (event: FormEvent<HTMLFormElement>) => {
		if (!confirm('Delete this note? This cannot be undone.')) {
			event.preventDefault();
		}
	};

	const handleCardClick = () => {
		router.push(editHref);
	};

	const stopPropagation = (event: MouseEvent) => {
		event.stopPropagation();
	};

	return (
		<li
			className="card bg-base-50 border border-base-300 shadow-sm rounded-box hover:shadow-md hover:-translate-y-px transition-all cursor-pointer"
			onClick={handleCardClick}
			onKeyDown={event => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					handleCardClick();
				}
			}}
			role="link"
			tabIndex={0}
		>
			<div className="card-body py-4 gap-2">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<h2 className="font-medium text-base truncate">{title}</h2>
						{content ? (
							<p className="text-sm text-base-content/60 line-clamp-2 mt-1">{content}</p>
						) : null}
						<p className="text-xs text-base-content/50 mt-2">Updated {updatedAtLabel}</p>
					</div>
					<div className="flex shrink-0 gap-1" onClick={stopPropagation}>
						<Link href={editHref} className="btn btn-ghost btn-sm">
							Edit
						</Link>
						<form action={deleteAction} onSubmit={handleDelete}>
							<button type="submit" className="btn btn-ghost btn-sm text-error hover:bg-error/10">
								Delete
							</button>
						</form>
					</div>
				</div>
			</div>
		</li>
	);
}
