import type { User, Note } from '@/prisma';

export const userFixture = (overrides: Partial<User> = {}): User => {
	const mockUser: User = {
		id: BigInt(1),
		createdAt: new Date(),
		updatedAt: new Date(),
		clerk_id: 'test_clerk_id',
		email: 'test@example.com',
		name: 'Test User',
		image_url: null,
	};
	return {
		...mockUser,
		...overrides,
	};
};

export const noteFixture = (overrides: Partial<Note> = {}): Note => {
	const mockNote: Note = {
		id: BigInt(1),
		title: 'Test note',
		content: 'Test content',
		userId: BigInt(1),
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	return {
		...mockNote,
		...overrides,
	};
};
