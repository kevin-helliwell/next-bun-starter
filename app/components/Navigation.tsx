import { auth, currentUser } from '@clerk/nextjs/server';
import ClerkSignInButton from './ClerkSignInButton';
import ClerkUserMenuButton from './ClerkUserMenuButton';
import { NavigationBar, NavigationLinks } from './navigation-bars';

export default async function Navigation() {
	const { userId } = await auth();
	const user = userId ? await currentUser() : null;
	const navLinks = <NavigationLinks userId={userId} />;

	return (
		<header>
			<NavigationBar
				navLinks={navLinks}
				authSection={
					userId && user ? (
						<ClerkUserMenuButton
							userName={user.username || user.firstName || 'there'}
							userImage={user.imageUrl || ''}
						/>
					) : (
						<ClerkSignInButton variant="outline" />
					)
				}
			/>
		</header>
	);
}
