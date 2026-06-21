import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import ClerkSignUpButton from './components/ClerkSignUpButton';
import { PageContainer } from './components/page-container';

const FEATURES = [
	{ title: 'Write freely', description: 'A clean editor with no distractions.' },
	{ title: 'Stay organized', description: 'All your notes in one private place.' },
	{ title: 'Always private', description: 'Your thoughts belong to you alone.' },
] as const;

function HeroMockup() {
	return (
		<div
			className="relative hidden md:flex items-center justify-center min-h-[320px]"
			aria-hidden="true"
		>
			<div className="absolute top-4 right-8 w-56 rounded-box bg-base-50 border border-base-300 shadow-card p-4 rotate-3">
				<div className="h-2 w-16 rounded-full bg-primary/20 mb-3" />
				<div className="space-y-2">
					<div className="h-2 w-full rounded-full bg-base-200" />
					<div className="h-2 w-4/5 rounded-full bg-base-200" />
					<div className="h-2 w-3/5 rounded-full bg-base-200" />
				</div>
			</div>
			<div className="absolute bottom-8 left-4 w-52 rounded-box bg-base-50 border border-base-300 shadow-card p-4 -rotate-2">
				<div className="h-2 w-12 rounded-full bg-secondary/30 mb-3" />
				<div className="space-y-2">
					<div className="h-2 w-full rounded-full bg-base-200" />
					<div className="h-2 w-2/3 rounded-full bg-base-200" />
				</div>
			</div>
			<div className="w-60 rounded-box bg-base-50 border border-base-300 shadow-card p-5 z-10">
				<div className="h-2.5 w-20 rounded-full bg-primary/30 mb-4" />
				<div className="space-y-2.5">
					<div className="h-2 w-full rounded-full bg-base-200" />
					<div className="h-2 w-full rounded-full bg-base-200" />
					<div className="h-2 w-4/5 rounded-full bg-base-200" />
					<div className="h-2 w-3/5 rounded-full bg-base-200" />
				</div>
			</div>
		</div>
	);
}

export default async function HomePage() {
	const { userId } = await auth();

	return (
		<PageContainer size="wide" className="py-0">
			<section className="rounded-box bg-gradient-to-br from-base-100 via-base-200/40 to-base-100 px-6 py-16 md:px-12 md:py-24">
				<div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
					<div>
						<p className="text-primary text-sm font-medium tracking-wide uppercase mb-4">
							Private notes
						</p>
						<h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 leading-tight">
							Capture ideas in
							<br />
							beautiful, simple notes.
						</h1>
						<p className="text-lg text-base-content/80 mb-10 max-w-md">
							A private place to write, organize, and return to your thoughts — without the clutter.
						</p>
						{userId ? (
							<Link href="/notes" className="btn btn-primary btn-lg">
								Go to your notes
							</Link>
						) : (
							<div className="flex flex-col items-start gap-4">
								<ClerkSignUpButton label="Get started" className="btn btn-primary btn-lg" />
								<p className="text-base-content/70 text-sm">
									Already have an account?{' '}
									<Link href="/sign-in" className="link link-primary">
										Sign in
									</Link>
								</p>
							</div>
						)}
					</div>
					<HeroMockup />
				</div>
			</section>

			<section className="py-16 max-w-5xl mx-auto">
				<ul className="grid sm:grid-cols-3 gap-8">
					{FEATURES.map(feature => (
						<li key={feature.title} className="flex gap-3">
							<span
								className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
								aria-hidden="true"
							/>
							<div>
								<h2 className="font-medium text-base-content mb-1">{feature.title}</h2>
								<p className="text-sm text-base-content/60">{feature.description}</p>
							</div>
						</li>
					))}
				</ul>
			</section>
		</PageContainer>
	);
}
