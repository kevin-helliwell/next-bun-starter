import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import superjson from 'superjson';
import { getOrCreateLocalUserId } from '@/app/lib/data';
import { prisma } from '@/prisma';
import { noteFixture } from '@/tests/fixtures';
import { emptyFormState } from '@/app/server-actions/notes-types';
import {
	createNote,
	updateNote,
	deleteNote,
	getNotesForCurrentUser,
	getNoteForCurrentUser,
} from '@/app/server-actions/notes';

vi.mock('@clerk/nextjs/server', () => ({
	auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
	redirect: vi.fn((url: string) => {
		throw Object.assign(new Error('NEXT_REDIRECT'), {
			digest: `NEXT_REDIRECT;replace;${url}`,
		});
	}),
	notFound: vi.fn(() => {
		throw Object.assign(new Error('NEXT_NOT_FOUND'), { digest: 'NEXT_NOT_FOUND' });
	}),
}));

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

vi.mock('@/app/lib/data', () => ({
	getOrCreateLocalUserId: vi.fn(),
}));

vi.mock('@/prisma', () => ({
	prisma: {
		note: {
			create: vi.fn(),
			findFirst: vi.fn(),
			findMany: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

const serializedUserId = superjson.stringify(BigInt(1));

function makeFormData(entries: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		formData.set(key, value);
	}
	return formData;
}

describe('createNote', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getOrCreateLocalUserId).mockResolvedValue(serializedUserId);
		vi.mocked(auth).mockResolvedValue({ userId: 'clerk_1' } as never);
	});

	it('returns title error when title is empty', async () => {
		const result = await createNote(emptyFormState, makeFormData({ title: '' }));

		expect(result).toEqual({ errors: { title: 'Title is required' } });
		expect(prisma.note.create).not.toHaveBeenCalled();
	});

	it('redirects unauthenticated users instead of returning form error', async () => {
		vi.mocked(auth).mockResolvedValue({ userId: null } as never);

		await expect(createNote(emptyFormState, makeFormData({ title: 'Hello' }))).rejects.toThrow(
			'NEXT_REDIRECT',
		);
		expect(redirect).toHaveBeenCalledWith('/sign-in');
	});

	it('creates a note and redirects on success', async () => {
		vi.mocked(prisma.note.create).mockResolvedValue(noteFixture() as never);

		await expect(
			createNote(emptyFormState, makeFormData({ title: 'Hello', content: 'Body' })),
		).rejects.toThrow('NEXT_REDIRECT');

		expect(prisma.note.create).toHaveBeenCalledWith({
			data: { title: 'Hello', content: 'Body', userId: BigInt(1) },
		});
		expect(revalidatePath).toHaveBeenCalledWith('/notes');
		expect(redirect).toHaveBeenCalledWith('/notes');
	});

	it('returns form error when database create fails', async () => {
		vi.mocked(prisma.note.create).mockRejectedValue(new Error('db error'));

		const result = await createNote(emptyFormState, makeFormData({ title: 'Hello' }));

		expect(result).toEqual({ errors: { form: 'Failed to create note' } });
	});
});

describe('updateNote', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getOrCreateLocalUserId).mockResolvedValue(serializedUserId);
		vi.mocked(auth).mockResolvedValue({ userId: 'clerk_1' } as never);
	});

	it('returns validation error using shared parser', async () => {
		const result = await updateNote('1', emptyFormState, makeFormData({ title: '' }));

		expect(result).toEqual({ errors: { title: 'Title is required' } });
	});

	it('returns not found for invalid note id', async () => {
		const result = await updateNote('not-a-number', emptyFormState, makeFormData({ title: 'Hi' }));

		expect(result).toEqual({ errors: { form: 'Note not found' } });
		expect(prisma.note.findFirst).not.toHaveBeenCalled();
	});

	it('returns not found when note does not exist', async () => {
		vi.mocked(prisma.note.findFirst).mockResolvedValue(null);

		const result = await updateNote('1', emptyFormState, makeFormData({ title: 'Hi' }));

		expect(result).toEqual({ errors: { form: 'Note not found' } });
	});

	it('updates note and redirects on success', async () => {
		const note = noteFixture();
		vi.mocked(prisma.note.findFirst).mockResolvedValue(note as never);
		vi.mocked(prisma.note.update).mockResolvedValue(note as never);

		await expect(
			updateNote('1', emptyFormState, makeFormData({ title: 'Updated', content: 'New body' })),
		).rejects.toThrow('NEXT_REDIRECT');

		expect(prisma.note.update).toHaveBeenCalledWith({
			where: { id: note.id },
			data: { title: 'Updated', content: 'New body' },
		});
		expect(redirect).toHaveBeenCalledWith('/notes');
	});
});

describe('deleteNote', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getOrCreateLocalUserId).mockResolvedValue(serializedUserId);
		vi.mocked(auth).mockResolvedValue({ userId: 'clerk_1' } as never);
	});

	it('throws for invalid note id', async () => {
		await expect(deleteNote('bad-id')).rejects.toThrow('Invalid note id');
	});

	it('throws when note is not found', async () => {
		vi.mocked(prisma.note.findFirst).mockResolvedValue(null);

		await expect(deleteNote('1')).rejects.toThrow('Note not found');
	});

	it('deletes note and revalidates on success', async () => {
		const note = noteFixture();
		vi.mocked(prisma.note.findFirst).mockResolvedValue(note as never);
		vi.mocked(prisma.note.delete).mockResolvedValue(note as never);

		await deleteNote('1');

		expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: note.id } });
		expect(revalidatePath).toHaveBeenCalledWith('/notes');
	});
});

describe('getNotesForCurrentUser', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns empty array when unauthenticated', async () => {
		vi.mocked(auth).mockResolvedValue({ userId: null } as never);

		const notes = await getNotesForCurrentUser();

		expect(notes).toEqual([]);
	});

	it('returns notes for authenticated user', async () => {
		vi.mocked(auth).mockResolvedValue({ userId: 'clerk_1' } as never);
		vi.mocked(getOrCreateLocalUserId).mockResolvedValue(serializedUserId);
		const notes = [noteFixture()];
		vi.mocked(prisma.note.findMany).mockResolvedValue(notes as never);

		const result = await getNotesForCurrentUser();

		expect(result).toEqual(notes);
		expect(prisma.note.findMany).toHaveBeenCalledWith({
			where: { userId: BigInt(1) },
			orderBy: { updatedAt: 'desc' },
		});
	});
});

describe('getNoteForCurrentUser', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getOrCreateLocalUserId).mockResolvedValue(serializedUserId);
		vi.mocked(auth).mockResolvedValue({ userId: 'clerk_1' } as never);
	});

	it('calls notFound for invalid note id', async () => {
		await expect(getNoteForCurrentUser('abc')).rejects.toThrow('NEXT_NOT_FOUND');
		expect(notFound).toHaveBeenCalled();
	});

	it('returns note when found', async () => {
		const note = noteFixture();
		vi.mocked(prisma.note.findFirst).mockResolvedValue(note as never);

		const result = await getNoteForCurrentUser('1');

		expect(result).toEqual(note);
	});
});
