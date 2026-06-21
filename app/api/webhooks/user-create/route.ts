import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';

interface UserAttributes {
	first_name: string | '';
	id: string;
	email_addresses: { email_address: string }[];
	primary_email_address_id: string | null;
}

async function validateRequest(request: Request, webhookSecret: string) {
	const payloadString = await request.text();

	const headerPayload = await headers();
	const svix_id = headerPayload.get('svix-id');
	const svix_timestamp = headerPayload.get('svix-timestamp');
	const svix_signature = headerPayload.get('svix-signature');

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		throw new Error('Error occured -- no svix headers');
	}

	const svixHeaders = {
		'svix-id': headerPayload.get('svix-id')!,
		'svix-timestamp': headerPayload.get('svix-timestamp')!,
		'svix-signature': headerPayload.get('svix-signature')!,
	};
	const wh = new Webhook(webhookSecret);
	return wh.verify(payloadString, svixHeaders) as WebhookEvent;
}

export async function POST(request: Request) {
	const webhookSecret = process.env.WEBHOOK_SECRET || ``;
	if (!webhookSecret) {
		throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
	}

	// todo: check out effect.website for a better alternative
	let payload;
	try {
		payload = await validateRequest(request, webhookSecret);
	} catch (err) {
		console.log(err);
		return NextResponse.json(err, { status: 400 });
	}

	const { id, ...attributes } = payload.data;
	console.log(payload);
	// handle the webhook
	const payloadType = payload.type;

	let newUser;

	if (payloadType === 'user.created') {
		//console.log(`User ${id} was ${payloadType}`);

		const userAttributes = attributes as unknown as UserAttributes; // Assertion // todo: use validation instead of casting.

		// here create prisma user
		const userData = {
			name: userAttributes.first_name,
			email: userAttributes.email_addresses[0].email_address,
			clerk_id: id,
		};

		// Create the user using Prisma
		newUser = await prisma.user.create({
			data: userData,
		});

		if (newUser) {
			// Convert BigInt to string
			const stringifiedId = newUser.id.toString();

			return NextResponse.json({
				message: 'User created',
				user: { ...newUser, id: stringifiedId },
			});
		} else {
			console.error('Error creating user: newUser is undefined');
			return NextResponse.json({ error: 'Failed to create user' });
		}
	} else if (payloadType === 'user.deleted') {
		// Convert BigInt to string

		const deletedUser = await prisma.user.delete({
			where: {
				clerk_id: id,
			},
		});

		if (deletedUser) {
			const stringifiedId = deletedUser.id.toString();
			// Return the created user in the response
			return NextResponse.json({
				message: 'User deleted',
				deletedUser: { ...deletedUser, id: stringifiedId },
			});
		} else {
			console.error('Error deleting user');
			return NextResponse.json({ error: 'Failed to delete user' });
		}
	} else if (payloadType === 'user.updated') {
		const userAttributes = attributes as unknown as UserAttributes; // Assertion
		const primaryEmail =
			userAttributes.email_addresses.find(
				(email: any) => email.id === userAttributes.primary_email_address_id,
			)?.email_address || userAttributes.email_addresses[0]?.email_address;
		if (!primaryEmail) {
			return NextResponse.json({ error: 'No email address found for user' }, { status: 400 });
		}

		const existingUser = await prisma.user.findUnique({ where: { clerk_id: id } });
		if (!existingUser) {
			return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
		}

		const emailExists = await prisma.user.findFirst({
			where: { email: primaryEmail, clerk_id: { not: id } },
		});
		if (emailExists) {
			return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
		}

		if (existingUser.email !== primaryEmail) {
			const updatedUser = await prisma.user.update({
				where: { clerk_id: id },
				data: {
					email: primaryEmail,
					updatedAt: new Date(),
				},
			});
			const stringifiedId = updatedUser.id.toString();
			return NextResponse.json({
				message: 'User email updated',
				user: { ...updatedUser, id: stringifiedId },
			});
		}

		return NextResponse.json({ message: 'No email update needed' });
	}
	// below is just for testing purposes, it will log whatever payload was sent via webhook if
	// not user.created or user.deleted
	else {
		return NextResponse.json({ message: 'payload type', payload });
	}
}
