import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import ClerkSignUpButton from './components/ClerkSignUpButton';

export default async function HomePage() {
	const { userId } = await auth();

	return (
		<div className="container mx-auto px-4 py-16 max-w-3xl text-center">
			<h1 className="text-4xl font-bold mb-4">My App</h1>
			<p className="text-lg text-base-content/80 mb-8">
				Capture ideas in simple notes — private to you.
			</p>
			{userId ? (
				<Link href="/notes" className="btn btn-primary btn-lg">
					Go to your notes
				</Link>
			) : (
				<div className="flex flex-col items-center gap-4">
					<ClerkSignUpButton label="Get started" className="btn btn-primary btn-lg" />
					<p className="text-base-content/70">
						Already have an account?{' '}
						<Link href="/sign-in" className="link link-primary">
							Sign in
						</Link>
					</p>
				</div>
			)}
		</div>
	);
}
