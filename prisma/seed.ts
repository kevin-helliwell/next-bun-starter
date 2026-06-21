import { prisma } from '../prisma';

async function main(): Promise<void> {
	const user = await prisma.user.upsert({
		where: { clerk_id: 'demo_clerk_id' },
		update: {},
		create: {
			email: 'demo@example.com',
			name: 'Demo User',
			clerk_id: 'demo_clerk_id',
		},
	});

	await prisma.note.createMany({
		data: [
			{
				title: 'Welcome',
				content: 'This is a sample note from the seed script.',
				userId: user.id,
			},
			{
				title: 'Getting started',
				content: 'Sign in with Clerk to create your own notes.',
				userId: user.id,
			},
		],
		skipDuplicates: true,
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async error => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
