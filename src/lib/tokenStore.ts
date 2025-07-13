// src/lib/tokenStore.ts

// In-memory storage for access and refresh tokens
let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Set both access and refresh tokens in memory
 */
export const setTokens = (tokens: { access: string; refresh: string }) => {
  accessToken = tokens.access;
  refreshToken = tokens.refresh;
};

/**
 * Get current access token from memory
 */
export const getAccessToken = (): string | null => accessToken;

/**
 * Get current refresh token from memory
 */
export const getRefreshToken = (): string | null => refreshToken;

/**
 * Clear both tokens from memory (used on logout)
 */
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};
