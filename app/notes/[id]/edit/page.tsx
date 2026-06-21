import { notFound } from 'next/navigation';
import { PageContainer } from '@/app/components/page-container';
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
		<PageContainer>
			<NoteForm
				action={boundUpdate}
				initialState={emptyFormState}
				submitLabel="Save changes"
				defaultTitle={note.title}
				defaultContent={note.content ?? ''}
				showBackLink
			/>
		</PageContainer>
	);
}
