import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as data from './data';
import { prisma } from '@/prisma';
import superjson from 'superjson';

vi.mock('@/prisma', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
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
