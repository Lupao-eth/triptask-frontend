// src/lib/tokenStore.ts

// 🧠 In-memory token store
let accessToken: string | null = null;
let refreshToken: string | null = null;

// 🔍 Toggle to enable/disable logging
const ENABLE_LOGS = true;

/**
 * Set both access and refresh tokens in memory
 */
export const setTokens = (tokens: { access: string; refresh?: string | null }) => {
  accessToken = tokens.access;
  refreshToken = tokens.refresh ?? null;
  if (ENABLE_LOGS) {
    console.log('🔐 setTokens:', { accessToken, refreshToken });
  }
};

/**
 * Get access token from memory
 */
export const getAccessToken = (): string | null => {
  if (ENABLE_LOGS) {
    console.log('🔑 getAccessToken →', accessToken);
  }
  return accessToken;
};

/**
 * Get refresh token from memory
 */
export const getRefreshToken = (): string | null => {
  if (ENABLE_LOGS) {
    console.log('🔄 getRefreshToken →', refreshToken);
  }
  return refreshToken;
};

/**
 * Clear tokens from memory
 */
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (ENABLE_LOGS) {
    console.log('🚪 clearTokens: tokens cleared from memory');
  }
};

/**
 * Load tokens from localStorage or sessionStorage into memory
 */
const loadTokensFromStorage = () => {
  try {
    let storedToken = localStorage.getItem('triptask_token');
    let storedRefresh = localStorage.getItem('triptask_refresh_token');

    if (!storedToken || storedToken === 'undefined') {
      if (ENABLE_LOGS) console.log('📦 No token in localStorage, trying sessionStorage...');
      storedToken = sessionStorage.getItem('triptask_token');
      storedRefresh = sessionStorage.getItem('triptask_refresh_token');
    } else {
      if (ENABLE_LOGS) console.log('📦 Found token in localStorage.');
    }

    if (storedToken && storedToken !== 'undefined') {
      setTokens({ access: storedToken, refresh: storedRefresh ?? undefined });
      if (ENABLE_LOGS) console.log('✅ Tokens loaded into memory.');
    } else {
      if (ENABLE_LOGS) console.log('❌ No valid token found. Clearing memory.');
      clearTokens();
    }
  } catch (error) {
    console.warn('⚠️ loadTokensFromStorage: Failed to read tokens from storage', error);
    clearTokens();
  }
};

// 🚀 Auto-load tokens on first import
loadTokensFromStorage();
