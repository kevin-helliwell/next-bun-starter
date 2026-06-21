'use client';

import { UserProfile } from '@clerk/nextjs';

interface ClerkUserProfileModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
}

export function ClerkUserProfileModal({ isOpen, onClose }: ClerkUserProfileModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
			onClick={event => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
			role="presentation"
		>
			<div className="max-h-[90%] max-w-[90%] overflow-auto rounded-box bg-base-50 p-5 shadow-lg border border-base-300">
				<UserProfile routing="hash" />
				<button type="button" onClick={onClose} className="btn btn-sm btn-ghost mt-4">
					Close
				</button>
			</div>
		</div>
	);
}
