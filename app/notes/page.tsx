import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { deleteNote, getNotesForCurrentUser } from '@/app/server-actions/notes';

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
				<div className="card bg-base-100 shadow">
					<div className="card-body items-center text-center">
						<p className="text-gray-dark">No notes yet.</p>
						<div className="card-actions">
							<Link href="/notes/new" className="btn btn-primary">
								Create your first note
							</Link>
						</div>
					</div>
				</div>
			) : (
				<ul className="flex flex-col gap-4">
					{notes.map(note => (
						<li key={note.id.toString()} className="card bg-base-100 shadow">
							<div className="card-body">
								<h2 className="card-title">{note.title}</h2>
								{note.content ? <p className="whitespace-pre-wrap">{note.content}</p> : null}
								<div className="card-actions justify-end">
									<Link href={`/notes/${note.id.toString()}/edit`} className="btn btn-sm btn-ghost">
										Edit
									</Link>
									<form action={deleteNote.bind(null, note.id.toString())}>
										<button type="submit" className="btn btn-sm btn-error btn-outline">
											Delete
										</button>
									</form>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
