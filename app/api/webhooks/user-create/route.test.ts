import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/prisma';
import { userFixture } from '@/tests/fixtures';

const mockVerify = vi.hoisted(() => vi.fn());
vi.mock('svix', async () => {
	const actual = await vi.importActual('svix');
	return {
		...actual,
		Webhook: class extends (actual as any).Webhook {
			verify = mockVerify;
		},
	};
});

vi.mock('next/headers', () => ({
	headers: () => ({
		get: vi.fn().mockImplementation((header: string) => {
			const headerValues: Record<string, string> = {
				'svix-id': 'test-id',
				'svix-timestamp': 'test-timestamp',
				'svix-signature': 'test-signature',
			};
			return headerValues[header];
		}),
	}),
}));

vi.mock('@/prisma', () => ({
	prisma: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn(),
		},
	},
}));

describe('POST /api/webhooks/user-create', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create a new user', async () => {
		// Arrange
		vi.stubEnv('WEBHOOK_SECRET', 'test');

		const clerkPayload = {
			type: 'user.created',
			data: {
				id: 'test_clerk_id',
				email_addresses: [{ email_address: 'test@example.com' }],
				first_name: 'Test',
			},
		};

		const mockCreatedUser = userFixture({
			clerk_id: 'test_clerk_id',
			email: 'test@example.com',
			name: 'Test',
		});
		vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser);
		mockVerify.mockResolvedValue(clerkPayload);

		// Act
		const request = new NextRequest('http://localhost', {
			method: 'POST',
			body: JSON.stringify(clerkPayload),
		});
		const response = await POST(request);
		const responseBody = await response.json();

		// Assert
		expect(response.status).toBe(200);
		expect(responseBody.message).toEqual('User created');
		expect(JSON.stringify(responseBody.user)).toEqual(
			JSON.stringify({
				...mockCreatedUser,
				id: '1', // todo: fix the issues with bigint json serialization
			}),
		);
		expect(prisma.user.create).toHaveBeenCalledWith({
			data: {
				name: 'Test',
				email: 'test@example.com',
				clerk_id: 'test_clerk_id',
			},
		});
	});

	it('should update user email when changed', async () => {
		// Arrange
		vi.stubEnv('WEBHOOK_SECRET', 'test');

		const clerkPayload = {
			type: 'user.updated',
			data: {
				id: 'test_clerk_id',
				email_addresses: [
					{ id: 'email_1', email_address: 'newemail@example.com' },
					{ id: 'email_2', email_address: 'oldemail@example.com' },
				],
				primary_email_address_id: 'email_1',
				first_name: 'Test',
			},
		};

		const existingUser = userFixture({
			clerk_id: 'test_clerk_id',
			email: 'oldemail@example.com',
			name: 'Test',
		});
		const updatedUser = userFixture({
			clerk_id: 'test_clerk_id',
			email: 'newemail@example.com',
			name: 'Test',
			updatedAt: new Date(),
		});

		vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
		vi.mocked(prisma.user.findFirst).mockResolvedValue(null); // No email conflict
		vi.mocked(prisma.user.update).mockResolvedValue(updatedUser);
		mockVerify.mockResolvedValue(clerkPayload);

		// Act
		const request = new NextRequest('http://localhost', {
			method: 'POST',
			body: JSON.stringify(clerkPayload),
		});
		const response = await POST(request);
		const responseBody = await response.json();

		// Assert
		expect(response.status).toBe(200);
		expect(responseBody.message).toEqual('User email updated');
		expect(JSON.stringify(responseBody.user)).toEqual(
			JSON.stringify({
				...updatedUser,
				id: '1', // todo: fix the issues with bigint json serialization
			}),
		);
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { clerk_id: 'test_clerk_id' },
		});
		expect(prisma.user.update).toHaveBeenCalledWith({
			where: { clerk_id: 'test_clerk_id' },
			data: {
				email: 'newemail@example.com',
				updatedAt: expect.any(Date),
			},
		});
	});

	it('should return 404 if user not found', async () => {
		// Arrange
		vi.stubEnv('WEBHOOK_SECRET', 'test');
		const clerkPayload = {
			type: 'user.updated',
			data: {
				id: 'test_clerk_id',
				email_addresses: [{ id: 'email_1', email_address: 'newemail@example.com' }],
				primary_email_address_id: 'email_1',
				first_name: 'Test',
			},
		};
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
		mockVerify.mockResolvedValue(clerkPayload);

		// Act
		const request = new NextRequest('http://localhost', {
			method: 'POST',
			body: JSON.stringify(clerkPayload),
		});
		const response = await POST(request);
		const responseBody = await response.json();

		// Assert
		expect(response.status).toBe(404);
		expect(responseBody.error).toEqual('User not found in database');
	});

	it('should return 400 if email already in use', async () => {
		// Arrange
		vi.stubEnv('WEBHOOK_SECRET', 'test');
		const clerkPayload = {
			type: 'user.updated',
			data: {
				id: 'test_clerk_id',
				email_addresses: [{ id: 'email_1', email_address: 'newemail@example.com' }],
				primary_email_address_id: 'email_1',
				first_name: 'Test',
			},
		};
		const existingUser = userFixture({
			clerk_id: 'test_clerk_id',
			email: 'oldemail@example.com',
			name: 'Test',
		});
		const conflictingUser = userFixture({
			clerk_id: 'other_id',
			email: 'newemail@example.com',
			name: 'Other User',
			id: 2n, // Assuming id is a required field
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
		vi.mocked(prisma.user.findFirst).mockResolvedValue(conflictingUser);
		mockVerify.mockResolvedValue(clerkPayload);

		// Act
		const request = new NextRequest('http://localhost', {
			method: 'POST',
			body: JSON.stringify(clerkPayload),
		});
		const response = await POST(request);
		const responseBody = await response.json();

		// Assert
		expect(response.status).toBe(400);
		expect(responseBody.error).toEqual('Email already in use');
	});
});
