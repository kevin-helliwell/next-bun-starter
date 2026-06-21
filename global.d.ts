declare module '*.css';

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

interface AddToCalendarActionConfig {
	name: string;
	description: string;
	location: string;
	startDate: string;
	startTime: string;
	endDate: string;
	endTime: string;
	options: string[];
	lightMode: 'bodyScheme' | 'dark' | 'light';
}

interface Window {
	atcb_action?: (config: AddToCalendarActionConfig, triggerElement?: HTMLElement) => void;
}

declare namespace JSX {
	interface IntrinsicElements {
		'add-to-calendar-button': any;
	}
}
