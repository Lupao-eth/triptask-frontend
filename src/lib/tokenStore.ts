// src/lib/tokenStore.ts

let accessToken: string | null = null;
let refreshToken: string | null = null;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'; // Update as needed

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
 */
export const loadTokensFromStorage = () => {
  try {
    let storedToken = localStorage.getItem('triptask_token');
    let storedRefresh = localStorage.getItem('triptask_refresh_token');

    if (!storedToken || storedToken === 'undefined') {
      console.log('📦 loadTokensFromStorage: No token in localStorage, checking sessionStorage...');
      storedToken = sessionStorage.getItem('triptask_token');
      storedRefresh = sessionStorage.getItem('triptask_refresh_token');
    } else {
      console.log('📦 loadTokensFromStorage: Token found in localStorage.');
    }

    if (storedToken && storedToken !== 'undefined') {
      setTokens({ access: storedToken, refresh: storedRefresh ?? undefined });
      console.log('📦 loadTokensFromStorage: Tokens loaded into memory.');
    } else if (storedRefresh) {
      console.log('📦 No access token but refresh token exists. Attempting refresh...');
      attemptTokenRefresh(storedRefresh);
    } else {
      console.log('📦 loadTokensFromStorage: No valid tokens found, clearing memory.');
      clearTokens();
    }
  } catch (error) {
    console.warn('⚠️ loadTokensFromStorage: Error reading tokens from storage:', error);
    clearTokens();
  }
};

/**
 * Attempt to refresh tokens using refresh token
 */
const attemptTokenRefresh = async (refresh: string) => {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refresh}`,
      },
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    console.log('🔄 Token refreshed:', data);

    setTokens({ access: data.accessToken, refresh: data.refreshToken });

    // Update the correct storage (depends where refresh was found)
    const inLocal = !!localStorage.getItem('triptask_refresh_token');

    const storage = inLocal ? localStorage : sessionStorage;

    storage.setItem('triptask_token', data.accessToken);
    storage.setItem('triptask_refresh_token', data.refreshToken);

  } catch (err) {
    console.error('❌ Token refresh failed:', err);
    clearTokens();
  }
};
