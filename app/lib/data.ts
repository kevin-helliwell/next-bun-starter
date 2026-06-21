'use server';

import { prisma } from '@/prisma';
import superjson from 'superjson';

export const getLocalUserId = async (clerkId: string): Promise<string> => {
	if (!clerkId) {
		return '';
	}

	try {
		const user = await prisma.user.findUnique({
			select: { id: true },
			where: { clerk_id: clerkId },
		});
		return user ? superjson.stringify(user.id) : '';
	} catch (error) {
		console.error('Error fetching local user id:', error);
		return '';
	}
};
