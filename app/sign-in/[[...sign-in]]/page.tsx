import { SignIn } from '@clerk/nextjs';

export default function Page() {
	return (
		<div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
			<div className="card bg-white border border-base-300 shadow-lg w-full max-w-md">
				<div className="card-body items-center">
					<h1 className="card-title text-xl font-semibold mb-2">Sign in</h1>
					<p className="text-base-content/70 text-sm text-center mb-4">
						Sign in to access your notes
					</p>
					<SignIn fallbackRedirectUrl="/notes" forceRedirectUrl="/notes" />
				</div>
			</div>
		</div>
	);
}
