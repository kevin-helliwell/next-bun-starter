import type { ReactNode } from 'react';
import Logo from './Logo';
import NavLinkItem from './NavLinkItem';

function MenuIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	);
}

interface NavigationBarProps {
	readonly navLinks: ReactNode;
	readonly authSection: ReactNode;
}

export function NavigationBar({ navLinks, authSection }: NavigationBarProps) {
	return (
		<div className="navbar bg-base-100 border-b border-base-300 px-4 min-h-16">
			<div className="navbar-start gap-1">
				<div className="dropdown min-[851px]:hidden">
					<div
						tabIndex={0}
						role="button"
						className="btn btn-ghost btn-square"
						aria-label="Open menu"
					>
						<MenuIcon />
					</div>
					<ul
						tabIndex={0}
						className="menu menu-sm dropdown-content mt-3 p-2 shadow-lg bg-white border border-base-300 rounded-box w-52 z-[100]"
					>
						{navLinks}
					</ul>
				</div>
				<Logo />
			</div>
			<div className="navbar-center hidden min-[851px]:flex">
				<ul className="menu menu-horizontal gap-1 px-1">{navLinks}</ul>
			</div>
			<div className="navbar-end">{authSection}</div>
		</div>
	);
}

export function NavigationLinks({ userId }: { readonly userId: string | null | undefined }) {
	return (
		<>
			<NavLinkItem href="/">Home</NavLinkItem>
			{userId ? <NavLinkItem href="/notes">Notes</NavLinkItem> : null}
		</>
	);
}
