// src/lib/tokenStore.ts

// In-memory storage for access and refresh tokens
let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Set both access and refresh tokens in memory
 * @param tokens Object containing access and refresh tokens
 */
export const setTokens = (tokens: { access: string; refresh: string | null }) => {
  accessToken = tokens.access;
  refreshToken = tokens.refresh;
};

/**
 * Get current access token from memory
 * @returns access token or null if not set
 */
export const getAccessToken = (): string | null => accessToken;

/**
 * Get current refresh token from memory
 * @returns refresh token or null if not set
 */
export const getRefreshToken = (): string | null => refreshToken;

/**
 * Clear both tokens from memory (used on logout)
 */
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};
