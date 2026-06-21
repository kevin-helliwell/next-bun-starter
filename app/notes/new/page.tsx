import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/app/components/page-container';
import { NoteForm } from '@/app/notes/_components/note-form';
import { createNote } from '@/app/server-actions/notes';
import { emptyFormState } from '@/app/server-actions/notes-types';

export default async function NewNotePage() {
	const { userId } = await auth();
	if (!userId) {
		redirect('/sign-in');
	}

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
