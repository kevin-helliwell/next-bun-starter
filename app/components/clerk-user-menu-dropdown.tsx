'use client';

import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

interface ClerkUserMenuDropdownProps {
	readonly userName: string;
	readonly userImage: string;
	readonly isOpen: boolean;
	readonly onToggle: () => void;
	readonly onClose: () => void;
	readonly onManageAccount: () => void;
}

export function ClerkUserMenuDropdown({
	userName,
	userImage,
	isOpen,
	onToggle,
	onClose,
	onManageAccount,
}: ClerkUserMenuDropdownProps) {
	return (
		<>
			<button
				type="button"
				className="avatar btn btn-circle"
				data-testid="avatar"
				onClick={onToggle}
			>
				<div className="rounded-full w-12 hover:ring hover:ring-blue hover:ring-offset-base-100 hover:ring-offset-2">
					<Image alt="avatar" src={userImage} width={375} height={375} />
				</div>
			</button>

			{isOpen ? (
				<div className="absolute right-0 mt-2 z-[1000] card card-compact w-64 p-2 shadow-[0px_0px_15px_10px_rgba(0,0,0,0.1)] bg-gray-light text-gray-dark">
					<div className="card-body">
						<h3 className="card-title">Hi {userName}!</h3>
						<button
							type="button"
							className="btn btn-ghost flex flex-col items-start"
							onClick={onManageAccount}
						>
							<span className="font-normal">Manage your account</span>
						</button>

						<Link
							className="btn btn-ghost flex flex-col items-start"
							data-testid="notes-link"
							href="/notes"
							onClick={onClose}
						>
							<span className="font-normal">My notes</span>
						</Link>

						<SignOutButton>
							<button
								type="button"
								className="btn btn-ghost flex flex-col items-start"
								onClick={onClose}
							>
								<span className="font-normal">Sign out</span>
							</button>
						</SignOutButton>
					</div>
				</div>
			) : null}
		</>
	);
}
