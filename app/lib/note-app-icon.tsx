const PRIMARY = '#4f46e5';

interface NoteAppIconProps {
	readonly size: number;
}

export function NoteAppIcon({ size }: NoteAppIconProps) {
	const borderRadius = Math.round(size * 0.18);
	const lineHeight = Math.max(2, Math.round(size * 0.06));
	const gap = Math.max(2, Math.round(size * 0.08));
	const lineWidths = [
		Math.round(size * 0.56),
		Math.round(size * 0.44),
		Math.round(size * 0.32),
	] as const;

	return (
		<div
			style={{
				width: size,
				height: size,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				background: PRIMARY,
				borderRadius,
				gap,
			}}
		>
			{lineWidths.map(width => (
				<div
					key={width}
					style={{
						width,
						height: lineHeight,
						background: '#ffffff',
						borderRadius: lineHeight,
					}}
				/>
			))}
		</div>
	);
}
