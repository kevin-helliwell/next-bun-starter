/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
	serverExternalPackages: ['@prisma/client', 'prisma'],
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
			{
				protocol: 'https',
				hostname: 'img.clerk.com',
			},
		],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	env: {
		NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
	},
};

const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

export default withSentryConfig(nextConfig, {
	org: sentryOrg,
	project: sentryProject,
	silent: true,
	widenClientFileUpload: process.env.CI !== 'true',
	tunnelRoute: '/monitoring',
	disableLogger: true,
	automaticVercelMonitors: true,
});
