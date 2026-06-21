'use client';

import { useEffect, type RefObject } from 'react';

export function useCloseOnOutsideClick(
	ref: RefObject<HTMLElement | null>,
	onClose: () => void,
): void {
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				onClose();
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [onClose, ref]);
}
