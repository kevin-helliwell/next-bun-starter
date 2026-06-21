import type { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { match } from 'ts-pattern';
import { prisma } from '@/prisma';

interface EmailAddress {
	readonly id: string | undefined;
	readonly email_address: string;
}

interface UserAttributes {
	readonly first_name: string | '';
	readonly email_addresses: readonly EmailAddress[];
	readonly primary_email_address_id: string | null;
}

function userResponse<T extends { id: bigint }>(user: T, message: string) {
	return NextResponse.json({
		message,
		user: { ...user, id: user.id.toString() },
	});
}

function getPrimaryEmail(userAttributes: UserAttributes): string | undefined {
	return (
		userAttributes.email_addresses.find(
			email => email.id === userAttributes.primary_email_address_id,
		)?.email_address ?? userAttributes.email_addresses[0]?.email_address
	);
}

async function handleUserCreated(
	clerkId: string,
	attributes: UserAttributes,
): Promise<NextResponse> {
	const userAttributes = attributes;
	const newUser = await prisma.user.create({
		data: {
			name: userAttributes.first_name,
			email: getPrimaryEmail(userAttributes) ?? '',
			clerk_id: clerkId,
		},
	});

	return userResponse(newUser, 'User created');
}

async function handleUserDeleted(clerkId: string): Promise<NextResponse> {
	const deletedUser = await prisma.user.delete({
		where: { clerk_id: clerkId },
	});

	return NextResponse.json({
		message: 'User deleted',
		deletedUser: { ...deletedUser, id: deletedUser.id.toString() },
	});
}

async function handleUserUpdated(
	clerkId: string,
	attributes: UserAttributes,
): Promise<NextResponse> {
	const primaryEmail = getPrimaryEmail(attributes);
	if (!primaryEmail) {
		return NextResponse.json({ error: 'No email address found for user' }, { status: 400 });
	}

	const existingUser = await prisma.user.findUnique({ where: { clerk_id: clerkId } });
	if (!existingUser) {
		return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
	}

	const emailExists = await prisma.user.findFirst({
		where: { email: primaryEmail, clerk_id: { not: clerkId } },
	});
	if (emailExists) {
		return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
	}

	if (existingUser.email === primaryEmail) {
		return NextResponse.json({ message: 'No email update needed' });
	}

	const updatedUser = await prisma.user.update({
		where: { clerk_id: clerkId },
		data: {
			email: primaryEmail,
			updatedAt: new Date(),
		},
	});

	return userResponse(updatedUser, 'User email updated');
}

export async function handleUserWebhook(payload: WebhookEvent): Promise<NextResponse> {
	const { id, ...attributes } = payload.data;
	const clerkId = id as string;
	const userAttributes = attributes as unknown as UserAttributes;

	return match(payload.type)
		.with('user.created', () => handleUserCreated(clerkId, userAttributes))
		.with('user.deleted', () => handleUserDeleted(clerkId))
		.with('user.updated', () => handleUserUpdated(clerkId, userAttributes))
		.otherwise(() => NextResponse.json({ message: 'payload type', payload }));
}
