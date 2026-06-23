'use client';

import { Show, useClerk } from '@clerk/nextjs';
import { useCallback, useRef, useState } from 'react';
import { ClerkUserMenuDropdown } from './clerk-user-menu-dropdown';
import { useCloseOnOutsideClick } from './use-close-on-outside-click';

interface ClerkUserMenuButtonProps {
	readonly userName: string;
	readonly userImage: string;
}

export default function ClerkUserMenuButton({ userName, userImage }: ClerkUserMenuButtonProps) {
	const { openUserProfile } = useClerk();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);

	useCloseOnOutsideClick(dropdownRef, closeDropdown);

	const openManageAccount = () => {
		openUserProfile();
		setIsDropdownOpen(false);
	};

	return (
		<Show when="signed-in">
			<div className="relative" ref={dropdownRef}>
				<ClerkUserMenuDropdown
					userName={userName}
					userImage={userImage}
					isOpen={isDropdownOpen}
					onToggle={() => setIsDropdownOpen(open => !open)}
					onClose={closeDropdown}
					onManageAccount={openManageAccount}
				/>
			</div>
		</Show>
	);
}
