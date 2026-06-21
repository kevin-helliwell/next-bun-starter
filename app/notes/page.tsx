import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/app/components/page-container';
import { PageHeader } from '@/app/components/page-header';
import { NoteCard } from '@/app/notes/_components/note-card';
import { deleteNote, getNotesForCurrentUser } from '@/app/server-actions/notes';

function formatNoteDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

function noteCountLabel(count: number): string {
	return count === 1 ? '1 note' : `${count} notes`;
}

export default async function NotesPage() {
	const { userId } = await auth();
	if (!userId) {
		redirect('/sign-in');
	}

	const notes = await getNotesForCurrentUser();

	return (
		<PageContainer>
			<PageHeader
				title="Notes"
				description={notes.length > 0 ? noteCountLabel(notes.length) : undefined}
				action={
					<Link href="/notes/new" className="btn btn-primary">
						New note
					</Link>
				}
			/>

			{notes.length === 0 ? (
				<div className="card bg-base-50 border border-base-300 shadow-sm rounded-box max-w-md mx-auto text-center">
					<div className="card-body items-center py-12">
						<div
							className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2"
							aria-hidden="true"
						>
							<div className="h-6 w-5 rounded-sm border-2 border-primary/40" />
						</div>
						<h2 className="text-lg font-medium">No notes yet</h2>
						<p className="text-base-content/60 text-sm mb-2">
							Create your first note to start capturing ideas.
						</p>
						<Link href="/notes/new" className="btn btn-primary">
							Create your first note
						</Link>
					</div>
				</div>
			) : (
				<ul className="flex flex-col gap-3">
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
		</PageContainer>
	);
}
