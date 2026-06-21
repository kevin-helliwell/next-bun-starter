import { auth, currentUser } from '@clerk/nextjs/server';
import ClerkSignInButton from './ClerkSignInButton';
import ClerkUserMenuButton from './ClerkUserMenuButton';
import { NavigationBar } from './navigation-bars';

export default async function Navigation() {
	const { userId } = await auth();
	const user = userId ? await currentUser() : null;

	return (
		<header>
			<NavigationBar
				userId={userId}
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
