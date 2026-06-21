'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { match } from 'ts-pattern';
import * as v from 'valibot';
import superjson from 'superjson';
import { prisma } from '@/prisma';
import { getOrCreateLocalUserId } from '@/app/lib/data';
import type { NoteFormState } from '@/app/server-actions/notes-types';

const noteSchema = v.object({
	title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
	content: v.optional(v.string()),
});

type ParsedNote = {
	readonly title: string;
	readonly content: string | null;
};

function parseNoteFormData(
	formData: FormData,
):
	| { readonly ok: true; readonly data: ParsedNote }
	| { readonly ok: false; readonly state: NoteFormState } {
	const parsed = v.safeParse(noteSchema, {
		title: formData.get('title'),
		content: formData.get('content') ?? undefined,
	});

	if (!parsed.success) {
		return {
			ok: false,
			state: match(parsed.issues[0]?.path?.[0]?.key)
				.with('title', () => ({ errors: { title: 'Title is required' } }))
				.otherwise(() => ({ errors: { form: 'Invalid note data' } })),
		};
	}

	return {
		ok: true,
		data: {
			title: parsed.output.title,
			content: parsed.output.content ?? null,
		},
	};
}

function parseNoteId(noteId: string): bigint | undefined {
	if (!/^\d+$/.test(noteId)) {
		return undefined;
	}

	return BigInt(noteId);
}

async function requireLocalUserId(): Promise<bigint> {
	const { userId } = await auth();
	if (!userId) {
		redirect('/sign-in');
	}

	const localUserId = await getOrCreateLocalUserId(userId);
	if (!localUserId) {
		throw new Error('Could not sync local user record from Clerk.');
	}

	return superjson.parse<bigint>(localUserId);
}

export async function createNote(
	_prevState: NoteFormState,
	formData: FormData,
): Promise<NoteFormState> {
	const parsed = parseNoteFormData(formData);
	if (!parsed.ok) {
		return parsed.state;
	}

	const userId = await requireLocalUserId();

	try {
		await prisma.note.create({
			data: {
				title: parsed.data.title,
				content: parsed.data.content,
				userId,
			},
		});
	} catch {
		return { errors: { form: 'Failed to create note' } };
	}

	revalidatePath('/notes');
	redirect('/notes');
}

export async function updateNote(
	noteId: string,
	_prevState: NoteFormState,
	formData: FormData,
): Promise<NoteFormState> {
	const parsed = parseNoteFormData(formData);
	if (!parsed.ok) {
		return parsed.state;
	}

	const id = parseNoteId(noteId);
	if (id === undefined) {
		return { errors: { form: 'Note not found' } };
	}

	const userId = await requireLocalUserId();

	try {
		const note = await prisma.note.findFirst({
			where: { id, userId },
		});

		if (!note) {
			return { errors: { form: 'Note not found' } };
		}

		await prisma.note.update({
			where: { id: note.id },
			data: {
				title: parsed.data.title,
				content: parsed.data.content,
			},
		});
	} catch {
		return { errors: { form: 'Failed to update note' } };
	}

	revalidatePath('/notes');
	redirect('/notes');
}

export async function deleteNote(noteId: string): Promise<void> {
	const id = parseNoteId(noteId);
	if (id === undefined) {
		throw new Error('Invalid note id');
	}

	const userId = await requireLocalUserId();
	const note = await prisma.note.findFirst({
		where: { id, userId },
	});

	if (!note) {
		throw new Error('Note not found');
	}

	await prisma.note.delete({ where: { id: note.id } });
	revalidatePath('/notes');
}

export async function getNotesForCurrentUser() {
	const { userId } = await auth();
	if (!userId) {
		return [];
	}

	const localUserId = await getOrCreateLocalUserId(userId);
	if (!localUserId) {
		return [];
	}

	return prisma.note.findMany({
		where: { userId: superjson.parse<bigint>(localUserId) },
		orderBy: { updatedAt: 'desc' },
	});
}

export async function getNoteForCurrentUser(noteId: string) {
	const id = parseNoteId(noteId);
	if (id === undefined) {
		notFound();
	}

	const userId = await requireLocalUserId();
	return prisma.note.findFirst({
		where: { id, userId },
	});
}
