import './global.css';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import Navigation from './components/Navigation';
import { Outfit } from 'next/font/google';
import { Footer } from './components/Footer';

export const metadata = {
	title: 'My App',
	description: 'A Bun + Next.js starter with Clerk auth and Prisma.',
};

export const dynamic = 'force-dynamic';

const outfit = Outfit({
	subsets: ['latin'],
	variable: '--font-outfit',
});

interface RootLayoutProps {
	children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
	const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

	if (!publishableKey) {
		throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
	}

	return (
		<html lang="en" className={outfit.className} suppressHydrationWarning>
			<body className="p-0 flex flex-col min-h-screen">
				<ClerkProvider
					publishableKey={publishableKey}
					signInUrl="/sign-in"
					signUpForceRedirectUrl="/notes"
				>
					<Navigation />
					<main className="flex-grow">{children}</main>
					<Footer />
				</ClerkProvider>
			</body>
		</html>
	);
}
