'use client';

import { SignInButton } from '@clerk/nextjs';

export default function ClerkSignInButton() {
	return (
		<SignInButton mode="redirect" forceRedirectUrl="/notes">
			<button type="button" className="btn btn-primary">
				Sign In
			</button>
		</SignInButton>
	);
}
