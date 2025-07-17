// src/lib/tokenStore.ts

// In-memory storage for access and refresh tokens
let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Set both access and refresh tokens in memory
 */
export const setTokens = (tokens: { access: string; refresh: string | null | undefined }) => {
  accessToken = tokens.access;
  refreshToken = tokens.refresh ?? null;
  console.log('🔐 setTokens called:', { accessToken, refreshToken });
};

/**
 * Get current access token from memory
 */
export const getAccessToken = (): string | null => {
  console.log('🔑 getAccessToken called, returning:', accessToken);
  return accessToken;
};

/**
 * Get current refresh token from memory
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

/**
 * Load tokens from localStorage or sessionStorage into memory.
 * Tries localStorage first (persistent), then sessionStorage.
 */
export const loadTokensFromStorage = () => {
  try {
    let storedToken = localStorage.getItem('triptask_token');
    let storedRefresh = localStorage.getItem('triptask_refresh_token');

    if (!storedToken || storedToken === 'undefined') {
      console.log('📦 loadTokensFromStorage: No tokens in localStorage, trying sessionStorage...');
      storedToken = sessionStorage.getItem('triptask_token');
      storedRefresh = sessionStorage.getItem('triptask_refresh_token');
    } else {
      console.log('📦 loadTokensFromStorage: Tokens found in localStorage.');
    }

    if (storedToken && storedToken !== 'undefined') {
      setTokens({ access: storedToken, refresh: storedRefresh ?? undefined });
      console.log('📦 loadTokensFromStorage: Tokens loaded into memory.');
    } else {
      console.log('📦 loadTokensFromStorage: No valid tokens found, clearing memory.');
      clearTokens();
    }
  } catch (error) {
    console.warn('⚠️ loadTokensFromStorage: Error reading tokens from storage:', error);
    clearTokens();
  }
};
