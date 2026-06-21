import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./cypress/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				outfit: ['var(--font-outfit)'],
			},
			colors: {
				'gray-light': '#F6F6F6',
				white: '#FFF',
				'gray-dark': '#585858',
				black: '#111111',
				blue: '#017bff',
				green: '#2CC582',
				red: '#FF4757',
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				app: {
					primary: '#017bff',
					secondary: '#2cc582',
					'base-100': '#eff9ff',
				},
			},
		],
	},
};

export default config;
