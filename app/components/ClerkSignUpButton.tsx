'use client';

import { SignUpButton } from '@clerk/nextjs';

export default function ClerkSignUpButton() {
	return (
		<SignUpButton mode="modal">
			<button type="button" className="btn btn-outline btn-primary">
				Sign Up
			</button>
		</SignUpButton>
	);
}
