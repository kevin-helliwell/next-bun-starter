import type { ReactNode } from 'react';
import { match } from 'ts-pattern';

interface PageContainerProps {
	readonly children: ReactNode;
	readonly size?: 'narrow' | 'default' | 'wide';
	readonly className?: string;
}

const sizeClassName = (size: PageContainerProps['size']) =>
	match(size)
		.with('narrow', () => 'max-w-2xl')
		.with('wide', () => 'max-w-5xl')
		.with('default', undefined, () => 'max-w-3xl')
		.exhaustive();

export function PageContainer({ children, size = 'default', className = '' }: PageContainerProps) {
	return (
		<div className={`container mx-auto px-4 py-8 ${sizeClassName(size)} ${className}`.trim()}>
			{children}
		</div>
	);
}
