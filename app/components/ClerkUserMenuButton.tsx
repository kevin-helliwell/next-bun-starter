'use client';

import { SignedIn } from '@clerk/nextjs';
import { useCallback, useRef, useState } from 'react';
import { ClerkUserMenuDropdown } from './clerk-user-menu-dropdown';
import { ClerkUserProfileModal } from './clerk-user-profile-modal';
import { useCloseOnOutsideClick } from './use-close-on-outside-click';

interface ClerkUserMenuButtonProps {
	readonly userName: string;
	readonly userImage: string;
}

export default function ClerkUserMenuButton({ userName, userImage }: ClerkUserMenuButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);

	useCloseOnOutsideClick(dropdownRef, closeDropdown);

	const openManageAccount = () => {
		setIsModalOpen(true);
		setIsDropdownOpen(false);
	};

	return (
		<>
			<SignedIn>
				<div className="relative top-5 mr-3" ref={dropdownRef}>
					<ClerkUserMenuDropdown
						userName={userName}
						userImage={userImage}
						isOpen={isDropdownOpen}
						onToggle={() => setIsDropdownOpen(open => !open)}
						onClose={closeDropdown}
						onManageAccount={openManageAccount}
					/>
				</div>
			</SignedIn>

			<ClerkUserProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</>
	);
}
