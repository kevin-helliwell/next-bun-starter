'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, MouseEvent } from 'react';

interface NavLinkItemProps {
	href: string;
	children: ReactNode;
}

export default function NavLinkItem({ href, children }: NavLinkItemProps) {
	const pathname = usePathname();
	const isActive =
		pathname !== null && (pathname === href || (href !== '/' && pathname.startsWith(href)));

	const handleClick = (event: MouseEvent<HTMLLIElement>) => {
		// Ensure the event is inside a dropdown
		if (event.currentTarget.closest('.dropdown')) {
			(document.activeElement as HTMLElement)?.blur(); // Blur only if inside a dropdown
		}
	};

	return (
		<li
			onClick={handleClick}
			className={`p-2 hover:bg-base-200 rounded-md ${isActive ? 'bg-primary/10 text-primary' : ''}`}
		>
			<Link href={href} className="block w-full h-full">
				{children}
			</Link>
		</li>
	);
}
