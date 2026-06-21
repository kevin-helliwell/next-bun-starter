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
			<h1 className="text-3xl font-bold mb-6">Edit note</h1>
			<NoteForm
				action={boundUpdate}
				initialState={emptyFormState}
				submitLabel="Save changes"
				defaultTitle={note.title}
				defaultContent={note.content ?? ''}
			/>
			<Link href="/notes" className="btn btn-link mt-4 px-0">
				Back to notes
			</Link>
		</div>
	);
}
