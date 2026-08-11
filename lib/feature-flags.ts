export const isPreviewDeployment = process.env.VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_DEPLOY_ENV === "preview";

export const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
export const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
export const sentryEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true";

