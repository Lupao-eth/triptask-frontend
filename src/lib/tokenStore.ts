// src/lib/tokenStore.ts

let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Set both access and refresh tokens
 */
export const setTokens = (tokens: { access: string; refresh: string }) => {
  accessToken = tokens.access;
  refreshToken = tokens.refresh;
};

/**
 * Get access token
 */
export const getAccessToken = (): string | null => accessToken;

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => refreshToken;

/**
 * Clear both tokens (logout)
 */
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};
