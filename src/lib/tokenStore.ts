// src/lib/tokenStore.ts

let accessToken: string | null = null;
let refreshToken: string | null = null;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

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
  return accessToken;
};

/**
 * Get current refresh token from memory
 */
export const getRefreshToken = (): string | null => {
  return refreshToken;
};

/**
 * Clear both tokens from memory and storage
 */
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  console.log('🚪 clearTokens called, tokens cleared');

  try {
    localStorage.removeItem('triptask_token');
    localStorage.removeItem('triptask_refresh_token');
  } catch {}
  try {
    sessionStorage.removeItem('triptask_token');
    sessionStorage.removeItem('triptask_refresh_token');
  } catch {}
};

/**
 * Load tokens from localStorage or sessionStorage into memory.
 */
export const loadTokensFromStorage = () => {
  try {
    let storedToken = localStorage.getItem('triptask_token');
    let storedRefresh = localStorage.getItem('triptask_refresh_token');

    if (!storedToken || storedToken === 'undefined') {
      console.log('📦 No token in localStorage, trying sessionStorage...');
      storedToken = sessionStorage.getItem('triptask_token');
      storedRefresh = sessionStorage.getItem('triptask_refresh_token');
    } else {
      console.log('📦 Tokens found in localStorage.');
    }

    if (storedToken && storedToken !== 'undefined') {
      setTokens({ access: storedToken, refresh: storedRefresh ?? undefined });
      console.log('📦 Tokens loaded into memory.');
    } else if (storedRefresh && storedRefresh !== 'undefined') {
      console.log('📦 No access token, but refresh token exists. Attempting refresh...');
      attemptTokenRefresh(storedRefresh);
    } else {
      console.log('📦 No valid tokens found, clearing...');
      clearTokens();
    }
  } catch (error) {
    console.warn('⚠️ Error loading tokens:', error);
    clearTokens();
  }
};

/**
 * Attempt to refresh access token using refresh token.
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
    console.log('🔄 Token refreshed successfully:', data);

    setTokens({ access: data.accessToken, refresh: data.refreshToken });

    // Save to the same storage where it came from
    const fromLocal = !!localStorage.getItem('triptask_refresh_token');
    const storage = fromLocal ? localStorage : sessionStorage;

    storage.setItem('triptask_token', data.accessToken);
    storage.setItem('triptask_refresh_token', data.refreshToken);
  } catch (err) {
    console.error('❌ Token refresh failed:', err);
    clearTokens();
  }
};
