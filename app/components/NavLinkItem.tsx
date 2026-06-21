'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { match } from 'ts-pattern';

interface NavLinkItemProps {
	readonly href: string;
	readonly children: ReactNode;
	readonly variant?: 'tab' | 'menu';
}

function getLinkClassName(variant: 'tab' | 'menu', isActive: boolean): string {
	return match({ variant, isActive })
		.with(
			{ variant: 'tab', isActive: true },
			() => 'block px-4 py-2 text-primary font-medium border-b-2 border-primary transition-colors',
		)
		.with(
			{ variant: 'tab', isActive: false },
			() => 'block px-4 py-2 text-base-content/70 hover:text-primary transition-colors',
		)
		.with(
			{ variant: 'menu', isActive: true },
			() => 'block px-4 py-2 rounded-md bg-base-200 text-primary font-medium',
		)
		.with(
			{ variant: 'menu', isActive: false },
			() => 'block px-4 py-2 rounded-md hover:bg-base-200',
		)
		.exhaustive();
}

export default function NavLinkItem({ href, children, variant = 'tab' }: NavLinkItemProps) {
	const pathname = usePathname();
	const isActive =
		pathname !== null && (pathname === href || (href !== '/' && pathname.startsWith(href)));

	const handleClick = (event: MouseEvent<HTMLLIElement>) => {
		if (event.currentTarget.closest('.dropdown')) {
			(document.activeElement as HTMLElement)?.blur();
		}
	};

	return (
		<li onClick={handleClick}>
			<Link href={href} className={getLinkClassName(variant, isActive)}>
				{children}
			</Link>
		</li>
	);
}
