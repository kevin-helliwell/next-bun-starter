import { PageContainer } from '@/app/components/page-container';
import { NoteForm } from '@/app/notes/_components/note-form';
import { createNote } from '@/app/server-actions/notes';
import { emptyFormState } from '@/app/server-actions/notes-types';

export default async function NewNotePage() {
	return (
		<PageContainer>
			<NoteForm
				action={createNote}
				initialState={emptyFormState}
				submitLabel="Create note"
				showBackLink
			/>
		</PageContainer>
	);
}
