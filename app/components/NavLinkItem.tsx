'use client';
import Link from 'next/link';
import { ReactNode, MouseEvent } from 'react';

interface NavLinkItemProps {
	href: string;
	children: ReactNode;
}

export default function NavLinkItem({ href, children }: NavLinkItemProps) {
	const handleClick = (event: MouseEvent<HTMLLIElement>) => {
		// Ensure the event is inside a dropdown
		if (event.currentTarget.closest('.dropdown')) {
			(document.activeElement as HTMLElement)?.blur(); // Blur only if inside a dropdown
		}
	};

	return (
		<li onClick={handleClick} className="p-2 hover:bg-gray-100 rounded-md">
			<Link href={href} className="block w-full h-full">
				{children}
			</Link>
		</li>
	);
}
