import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
	Sentry.init({
		dsn,
		integrations: [Sentry.replayIntegration()],
		tracesSampleRate: 1,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
		debug: false,
	});
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
