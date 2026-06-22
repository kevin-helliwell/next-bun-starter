import { ImageResponse } from 'next/og';
import { NoteAppIcon } from '@/app/lib/note-app-icon';

export const size = {
	width: 180,
	height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
	return new ImageResponse(<NoteAppIcon size={180} />, {
		...size,
	});
}
