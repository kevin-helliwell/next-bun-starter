import { SignIn } from '@clerk/nextjs';
import { PageContainer } from '@/app/components/page-container';

export default function Page() {
	return (
		<PageContainer size="narrow" className="flex min-h-[60vh] items-center justify-center">
			<div className="card bg-base-50 border border-base-300 shadow-sm rounded-box w-full max-w-md">
				<div className="card-body items-center">
					<h1 className="text-2xl font-semibold tracking-tight mb-2">Sign in</h1>
					<p className="text-base-content/70 text-sm text-center mb-4">
						Sign in to access your notes
					</p>
					<SignIn fallbackRedirectUrl="/notes" forceRedirectUrl="/notes" />
				</div>
			</div>
		</PageContainer>
	);
}
