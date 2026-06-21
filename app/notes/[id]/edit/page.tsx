import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NoteForm } from '@/app/notes/_components/note-form';
import { getNoteForCurrentUser, updateNote } from '@/app/server-actions/notes';
import { emptyFormState } from '@/app/server-actions/notes-types';

interface EditNotePageProps {
	readonly params: Promise<{ id: string }>;
}

export default async function EditNotePage({ params }: EditNotePageProps) {
	const { id } = await params;
	const note = await getNoteForCurrentUser(id);

	if (!note) {
		notFound();
	}

	const boundUpdate = updateNote.bind(null, id);

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">Edit note</h1>
				<Link href="/notes" className="link link-primary text-sm">
					Back to notes
				</Link>
			</div>
			<NoteForm
				action={boundUpdate}
				initialState={emptyFormState}
				submitLabel="Save changes"
				defaultTitle={note.title}
				defaultContent={note.content ?? ''}
			/>
		</div>
	);
}
