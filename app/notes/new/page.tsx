import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { NoteForm } from '@/app/notes/_components/note-form';
import { createNote } from '@/app/server-actions/notes';
import { emptyFormState } from '@/app/server-actions/notes-types';

export default async function NewNotePage() {
	const { userId } = await auth();
	if (!userId) {
		redirect('/sign-in');
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<h1 className="text-3xl font-bold mb-6">New note</h1>
			<NoteForm action={createNote} initialState={emptyFormState} submitLabel="Create note" />
			<Link href="/notes" className="btn btn-link mt-4 px-0">
				Back to notes
			</Link>
		</div>
	);
}
