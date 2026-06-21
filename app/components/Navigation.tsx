'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import ClerkUserMenuButton from './ClerkUserMenuButton';
import ClerkSignInButton from './ClerkSignInButton';
import Logo from './Logo';
import NavLinkItem from './NavLinkItem';

export default async function Navigation() {
	const { userId } = await auth();
	const user = userId ? await currentUser() : null;

	const navLinks = (
		<>
			<NavLinkItem href="/">Home</NavLinkItem>
			{userId ? <NavLinkItem href="/notes">Notes</NavLinkItem> : null}
		</>
	);

	return (
		<header className="h-32 p-2 max-sm:mb-4 relative">
			<div className="absolute top-4 right-2 z-[100]">
				{userId && user ? (
					<ClerkUserMenuButton
						userName={user.username || user.firstName || 'there'}
						userImage={user.imageUrl || ''}
					/>
				) : (
					<ClerkSignInButton />
				)}
			</div>
			<div className="max-[850px]:pt-4 min-[851px]:hidden w-16">
				<Logo />
			</div>
			<div className="navbar bg-white p-0 max-[850px]:block min-[851px]:hidden relative">
				<div className="navbar-start">
					<div className="dropdown inline-block">
						<div tabIndex={0} role="button" className="btn btn-ghost pr-0 max-sm:p-0">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-7 w-7"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h8m-8 6h16"
								/>
							</svg>
						</div>
						<ul
							tabIndex={0}
							className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 z-[100]"
						>
							{navLinks}
						</ul>
					</div>
				</div>
			</div>

			<div className="navbar bg-white p-0 max-[850px]:hidden min-[851px]:block relative">
				<div className="navbar-start">
					<div className="pt-8 min-[851px]:block">
						<Logo />
					</div>
				</div>
				<div className="navbar-center max-[850px]:hidden min-[851px]:inline-flex">
					<ul className="menu menu-horizontal px-1 absolute z-20 top-6 left-[320px] md:left-[360px] lg:left-[400px] xl:left-[calc(50%+10px)] xl:-translate-x-1/2 flex-nowrap gap-1 text-sm">
						{navLinks}
					</ul>
				</div>
			</div>
		</header>
	);
}
