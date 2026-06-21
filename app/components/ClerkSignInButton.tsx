'use client';

import { SignInButton } from '@clerk/nextjs';

export default function ClerkSignInButton() {
	return (
		<SignInButton mode="modal">
			<button type="button" className="btn btn-primary">
				Sign In
			</button>
		</SignInButton>
	);
}
