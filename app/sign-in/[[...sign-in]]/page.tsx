import { SignIn } from '@clerk/nextjs';

export default function Page() {
	return (
		<div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
			<SignIn fallbackRedirectUrl="/notes" forceRedirectUrl="/notes" />
		</div>
	);
}
