'use client';

import Link from 'next/link';

interface ClerkSignInButtonProps {
	readonly variant?: 'primary' | 'outline';
}

export default function ClerkSignInButton({ variant = 'primary' }: ClerkSignInButtonProps) {
	const className = variant === 'outline' ? 'btn btn-outline btn-primary' : 'btn btn-primary';

	return (
		<Link href="/sign-in" className={className}>
			Sign In
		</Link>
	);
}
