'use client';

import { SignUpButton } from '@clerk/nextjs';

interface ClerkSignUpButtonProps {
	readonly label?: string;
	readonly className?: string;
}

export default function ClerkSignUpButton({
	label = 'Sign Up',
	className = 'btn btn-outline btn-primary',
}: ClerkSignUpButtonProps) {
	return (
		<SignUpButton mode="modal">
			<button type="button" className={className}>
				{label}
			</button>
		</SignUpButton>
	);
}
