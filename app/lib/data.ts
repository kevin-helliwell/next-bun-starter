'use server';

import { clerkClient } from '@clerk/nextjs/server';
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

export const getOrCreateLocalUserId = async (clerkId: string): Promise<string> => {
	if (!clerkId) {
		return '';
	}

	try {
		const existing = await prisma.user.findUnique({
			select: { id: true },
			where: { clerk_id: clerkId },
		});
		if (existing) {
			return superjson.stringify(existing.id);
		}

		const client = await clerkClient();
		const clerkUser = await client.users.getUser(clerkId);
		const email =
			clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

		if (!email) {
			console.error('Cannot create local user without email for clerk id:', clerkId);
			return '';
		}

		const user = await prisma.user.upsert({
			where: { clerk_id: clerkId },
			create: {
				clerk_id: clerkId,
				email,
				name: clerkUser.firstName ?? clerkUser.username ?? null,
				image_url: clerkUser.imageUrl ?? null,
			},
			update: {},
		});

		return superjson.stringify(user.id);
	} catch (error) {
		console.error('Error syncing local user:', error);
		return '';
	}
};
