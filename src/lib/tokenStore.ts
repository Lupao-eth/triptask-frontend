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
  console.log('🔐 setTokens called:', { accessToken, refreshToken });
};

/**
 * Get current access token from memory
 * @returns access token or null if not set
 */
export const getAccessToken = (): string | null => {
  console.log('🔑 getAccessToken called, returning:', accessToken);
  return accessToken;
};

/**
 * Get current refresh token from memory
 * @returns refresh token or null if not set
 */
export const getRefreshToken = (): string | null => {
  console.log('🔑 getRefreshToken called, returning:', refreshToken);
  return refreshToken;
};

/**
 * Clear both tokens from memory (used on logout)
 */
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  console.log('🚪 clearTokens called, tokens cleared');
};
