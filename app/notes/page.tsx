import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { NoteCard } from '@/app/notes/_components/note-card';
import { deleteNote, getNotesForCurrentUser } from '@/app/server-actions/notes';

function formatNoteDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

export default async function NotesPage() {
	const { userId } = await auth();
	if (!userId) {
		redirect('/sign-in');
	}

	const notes = await getNotesForCurrentUser();

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">My Notes</h1>
				<Link href="/notes/new" className="btn btn-primary">
					New note
				</Link>
			</div>

			{notes.length === 0 ? (
				<div className="card bg-white border border-base-300 shadow-sm">
					<div className="card-body items-center text-center">
						<p className="text-base-content/80">No notes yet.</p>
						<div className="card-actions">
							<Link href="/notes/new" className="btn btn-primary">
								Create your first note
							</Link>
						</div>
					</div>
				</div>
			) : (
				<ul className="flex flex-col gap-6">
					{notes.map(note => (
						<NoteCard
							key={note.id.toString()}
							id={note.id.toString()}
							title={note.title}
							content={note.content}
							updatedAtLabel={formatNoteDate(note.updatedAt)}
							deleteAction={deleteNote.bind(null, note.id.toString())}
						/>
					))}
				</ul>
			)}
		</div>
	);
}
