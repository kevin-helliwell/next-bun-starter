import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as data from './data';
import { prisma } from '@/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import superjson from 'superjson';

vi.mock('@clerk/nextjs/server', () => ({
	clerkClient: vi.fn(),
}));

vi.mock('@/prisma', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			upsert: vi.fn(),
		},
	},
}));

describe('getLocalUserId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns serialized user id when found', async () => {
		const mockUser = { id: BigInt(1) };
		vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

		const result = await data.getLocalUserId('clerk_123');

		expect(result).toBe(superjson.stringify(mockUser.id));
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			select: { id: true },
			where: { clerk_id: 'clerk_123' },
		});
	});

	it('returns empty string when user is not found', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

		const result = await data.getLocalUserId('missing');

		expect(result).toBe('');
	});

	it('returns empty string when clerk id is empty', async () => {
		const result = await data.getLocalUserId('');

		expect(result).toBe('');
		expect(prisma.user.findUnique).not.toHaveBeenCalled();
	});

	it('returns empty string on database error', async () => {
		vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('db error'));
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await data.getLocalUserId('clerk_123');

		expect(result).toBe('');
		consoleSpy.mockRestore();
	});
});

describe('getOrCreateLocalUserId', () => {
	const mockGetUser = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(clerkClient).mockResolvedValue({ users: { getUser: mockGetUser } } as never);
	});

	it('returns existing user id without calling Clerk', async () => {
		const mockUser = { id: BigInt(2) };
		vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

		const result = await data.getOrCreateLocalUserId('clerk_456');

		expect(result).toBe(superjson.stringify(mockUser.id));
		expect(mockGetUser).not.toHaveBeenCalled();
		expect(prisma.user.upsert).not.toHaveBeenCalled();
	});

	it('creates local user from Clerk when missing', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
		mockGetUser.mockResolvedValue({
			firstName: 'Ada',
			username: null,
			imageUrl: 'https://example.com/avatar.png',
			primaryEmailAddress: { emailAddress: 'ada@example.com' },
			emailAddresses: [{ emailAddress: 'ada@example.com' }],
		});
		const created = { id: BigInt(3), clerk_id: 'clerk_new' };
		vi.mocked(prisma.user.upsert).mockResolvedValue(created as never);

		const result = await data.getOrCreateLocalUserId('clerk_new');

		expect(result).toBe(superjson.stringify(created.id));
		expect(prisma.user.upsert).toHaveBeenCalledWith({
			where: { clerk_id: 'clerk_new' },
			create: {
				clerk_id: 'clerk_new',
				email: 'ada@example.com',
				name: 'Ada',
				image_url: 'https://example.com/avatar.png',
			},
			update: {},
		});
	});

	it('returns empty string when clerk id is empty', async () => {
		const result = await data.getOrCreateLocalUserId('');

		expect(result).toBe('');
		expect(prisma.user.findUnique).not.toHaveBeenCalled();
	});

	it('returns empty string when Clerk user has no email', async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
		mockGetUser.mockResolvedValue({
			primaryEmailAddress: null,
			emailAddresses: [],
		});
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await data.getOrCreateLocalUserId('clerk_no_email');

		expect(result).toBe('');
		expect(prisma.user.upsert).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
