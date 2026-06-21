import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export default async function HomePage() {
	const { userId } = await auth();

	return (
		<div className="container mx-auto px-4 py-16 max-w-3xl text-center">
			<h1 className="text-4xl font-bold mb-4">My App</h1>
			<p className="text-lg text-gray-dark mb-8">
				A Bun + Next.js starter with Clerk auth, Prisma, and PostgreSQL.
			</p>
			{userId ? (
				<Link href="/notes" className="btn btn-primary">
					Go to your notes
				</Link>
			) : (
				<p className="text-gray-dark">Sign in to create and manage notes.</p>
			)}
		</div>
	);
}
