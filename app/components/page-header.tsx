import type { ReactNode } from 'react';

interface PageHeaderProps {
	readonly title: string;
	readonly description?: string;
	readonly action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
				{description ? <p className="text-base-content/60 text-sm mt-1">{description}</p> : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}
