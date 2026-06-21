import { auth, currentUser } from '@clerk/nextjs/server';
import ClerkSignInButton from './ClerkSignInButton';
import ClerkSignUpButton from './ClerkSignUpButton';
import ClerkUserMenuButton from './ClerkUserMenuButton';
import { DesktopNavigationBar, MobileNavigationBar, NavigationLinks } from './navigation-bars';

export default async function Navigation() {
	const { userId } = await auth();
	const user = userId ? await currentUser() : null;
	const navLinks = <NavigationLinks userId={userId} />;

	return (
		<header className="h-32 p-2 max-sm:mb-4 relative">
			<div className="absolute top-4 right-2 z-[100]">
				{userId && user ? (
					<ClerkUserMenuButton
						userName={user.username || user.firstName || 'there'}
						userImage={user.imageUrl || ''}
					/>
				) : (
					<div className="flex gap-2">
						<ClerkSignInButton />
						<ClerkSignUpButton />
					</div>
				)}
			</div>
			<MobileNavigationBar navLinks={navLinks} />
			<DesktopNavigationBar navLinks={navLinks} />
		</header>
	);
}
