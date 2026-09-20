/**
 * Use the same-origin API proxy in both dev and production previews.
 * A separately hosted API can be configured explicitly at build time.
 */
const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = configuredApiBase || "/api/v1";
