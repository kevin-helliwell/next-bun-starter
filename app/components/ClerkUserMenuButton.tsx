'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SignOutButton, SignedIn, UserProfile } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function ClerkUserMenuButton({
	userName,
	userImage,
}: {
	userName: string;
	userImage: string;
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
		setIsDropdownOpen(false);
	};

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const closeDropdown = () => {
		setIsDropdownOpen(false);
	};

	const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			setIsModalOpen(false);
		}
	};

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<>
			<SignedIn>
				<div className="relative top-5 mr-3" ref={dropdownRef}>
					<button className="avatar btn btn-circle" data-testid="avatar" onClick={toggleDropdown}>
						<div className="rounded-full w-12 hover:ring hover:ring-blue hover:ring-offset-base-100 hover:ring-offset-2">
							<Image alt="avatar" src={userImage} width={375} height={375} />
						</div>
					</button>

					{isDropdownOpen ? (
						<div className="absolute right-0 mt-2 z-[1000] card card-compact w-64 p-2 shadow-[0px_0px_15px_10px_rgba(0,0,0,0.1)] bg-gray-light text-gray-dark">
							<div className="card-body">
								<h3 className="card-title">Hi {userName}!</h3>
								<button
									className="btn btn-ghost flex flex-col items-start"
									onClick={() => {
										toggleModal();
										closeDropdown();
									}}
								>
									<span className="font-normal">Manage your account</span>
								</button>

								<Link
									className="btn btn-ghost flex flex-col items-start"
									data-testid="notes-link"
									href="/notes"
									onClick={closeDropdown}
								>
									<span className="font-normal">My notes</span>
								</Link>

								<SignOutButton>
									<button
										className="btn btn-ghost flex flex-col items-start"
										onClick={closeDropdown}
									>
										<span className="font-normal">Sign out</span>
									</button>
								</SignOutButton>
							</div>
						</div>
					) : null}
				</div>
			</SignedIn>

			{isModalOpen ? (
				<div className="popup" onClick={handleOutsideClick} role="presentation">
					<div className="popup-inner">
						<UserProfile routing="hash" />
						<button onClick={toggleModal}>Close</button>
					</div>
				</div>
			) : null}
		</>
	);
}
