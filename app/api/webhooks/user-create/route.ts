import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { handleUserWebhook } from './user-webhook-handlers';

async function validateRequest(request: Request, webhookSecret: string): Promise<WebhookEvent> {
	const payloadString = await request.text();
	const headerPayload = await headers();
	const svix_id = headerPayload.get('svix-id');
	const svix_timestamp = headerPayload.get('svix-timestamp');
	const svix_signature = headerPayload.get('svix-signature');

	if (!svix_id || !svix_timestamp || !svix_signature) {
		throw new Error('Error occured -- no svix headers');
	}

	const wh = new Webhook(webhookSecret);
	return wh.verify(payloadString, {
		'svix-id': svix_id,
		'svix-timestamp': svix_timestamp,
		'svix-signature': svix_signature,
	}) as WebhookEvent;
}

export async function POST(request: Request): Promise<NextResponse> {
	const webhookSecret = process.env.WEBHOOK_SECRET ?? '';
	if (!webhookSecret) {
		throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
	}

	let payload: WebhookEvent;
	try {
		payload = await validateRequest(request, webhookSecret);
	} catch (err) {
		console.log(err);
		return NextResponse.json(err, { status: 400 });
	}

	return handleUserWebhook(payload);
}
