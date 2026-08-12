export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://vcardeditor.com").replace(/\/$/, "");
export const happyCsvUrl = (process.env.NEXT_PUBLIC_HAPPYCSV_URL || "https://happycsv.com").replace(/\/$/, "");
export const appUrl = (process.env.NEXT_PUBLIC_APP_URL || siteUrl).replace(/\/$/, "");
