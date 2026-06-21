'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { match } from 'ts-pattern';
import * as v from 'valibot';
import superjson from 'superjson';
import { prisma } from '@/prisma';
import { getLocalUserId } from '@/app/lib/data';

const noteSchema = v.object({
	title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
	content: v.optional(v.string()),
});

import type { NoteFormState } from '@/app/server-actions/notes-types';

async function requireLocalUserId(): Promise<bigint> {
	const { userId } = await auth();
	if (!userId) {
		redirect('/sign-in');
	}

	const localUserId = await getLocalUserId(userId);
	if (!localUserId) {
		throw new Error('Local user record not found. Ensure the Clerk webhook is configured.');
	}

	return superjson.parse<bigint>(localUserId);
}

export async function createNote(
	_prevState: NoteFormState,
	formData: FormData,
): Promise<NoteFormState> {
	const parsed = v.safeParse(noteSchema, {
		title: formData.get('title'),
		content: formData.get('content') ?? undefined,
	});

	if (!parsed.success) {
		return match(parsed.issues[0]?.path?.[0]?.key)
			.with('title', () => ({ errors: { title: 'Title is required' } }))
			.otherwise(() => ({ errors: { form: 'Invalid note data' } }));
	}

	try {
		const userId = await requireLocalUserId();
		await prisma.note.create({
			data: {
				title: parsed.output.title,
				content: parsed.output.content ?? null,
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
	const parsed = v.safeParse(noteSchema, {
		title: formData.get('title'),
		content: formData.get('content') ?? undefined,
	});

	if (!parsed.success) {
		return { errors: { title: 'Title is required' } };
	}

	try {
		const userId = await requireLocalUserId();
		const note = await prisma.note.findFirst({
			where: { id: BigInt(noteId), userId },
		});

		if (!note) {
			return { errors: { form: 'Note not found' } };
		}

		await prisma.note.update({
			where: { id: note.id },
			data: {
				title: parsed.output.title,
				content: parsed.output.content ?? null,
			},
		});
	} catch {
		return { errors: { form: 'Failed to update note' } };
	}

	revalidatePath('/notes');
	redirect('/notes');
}

export async function deleteNote(noteId: string): Promise<void> {
	const userId = await requireLocalUserId();
	const note = await prisma.note.findFirst({
		where: { id: BigInt(noteId), userId },
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

	const localUserId = await getLocalUserId(userId);
	if (!localUserId) {
		return [];
	}

	return prisma.note.findMany({
		where: { userId: superjson.parse<bigint>(localUserId) },
		orderBy: { updatedAt: 'desc' },
	});
}

export async function getNoteForCurrentUser(noteId: string) {
	const userId = await requireLocalUserId();
	return prisma.note.findFirst({
		where: { id: BigInt(noteId), userId },
	});
}
