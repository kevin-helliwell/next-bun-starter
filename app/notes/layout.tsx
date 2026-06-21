import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

interface NotesLayoutProps {
	readonly children: ReactNode;
}

export default async function NotesLayout({ children }: NotesLayoutProps) {
	const { userId } = await auth();
	if (!userId) {
		redirect('/sign-in');
	}

	return children;
}
