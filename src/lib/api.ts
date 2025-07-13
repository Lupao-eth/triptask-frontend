const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/backend';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'rider' | 'admin';
}

interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

interface ErrorResponse {
  message: string;
}

/**
 * Set access and refresh tokens in memory
 */
export function setTokens(tokens: { access: string; refresh?: string }) {
  accessToken = tokens.access;
  refreshToken = tokens.refresh || null;
  console.log('🔐 setTokens:', { accessToken, refreshToken });
}

/**
 * Load tokens from localStorage or sessionStorage (called on app init)
 */
export function loadTokensFromStorage() {
  try {
    let storedToken = localStorage.getItem('triptask_token');
    let storedRefresh = localStorage.getItem('triptask_refresh_token');

    if (!storedToken) {
      console.log('📦 loadTokensFromStorage: No tokens in localStorage, trying sessionStorage...');
      storedToken = sessionStorage.getItem('triptask_token');
      storedRefresh = sessionStorage.getItem('triptask_refresh_token');
    }

    console.log('📦 loadTokensFromStorage:', { storedToken, storedRefresh });

    if (storedToken) {
      setTokens({ access: storedToken, refresh: storedRefresh ?? undefined });
    } else {
      console.log('📦 loadTokensFromStorage: No tokens found in either storage');
    }
  } catch (err) {
    console.warn('⚠️ loadTokensFromStorage failed:', err);
  }
}

/**
 * Get current access token in memory
 */
export function getAccessToken(): string | null {
  console.log('🔑 getAccessToken:', accessToken);
  return accessToken;
}

/**
 * Get current refresh token in memory
 */
export function getRefreshToken(): string | null {
  console.log('🔑 getRefreshToken:', refreshToken);
  return refreshToken;
}

/**
 * Clear tokens from memory, localStorage and sessionStorage (logout)
 */
export function logoutUser() {
  accessToken = null;
  refreshToken = null;
  console.log('🚪 logoutUser: tokens cleared from memory');
  try {
    localStorage.removeItem('triptask_token');
    localStorage.removeItem('triptask_refresh_token');
    sessionStorage.removeItem('triptask_token');
    sessionStorage.removeItem('triptask_refresh_token');
    console.log('🚪 logoutUser: tokens cleared from localStorage and sessionStorage');
  } catch (err) {
    console.warn('⚠️ logoutUser storage removal failed:', err);
  }
}

/**
 * Refresh access token using refresh token
 * Returns true if refresh succeeded and updated token, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) {
    console.warn('⚠️ refreshAccessToken: no refreshToken available');
    return false;
  }

  try {
    console.log('🔄 refreshAccessToken: sending refresh request...');
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.warn(`⚠️ refreshAccessToken failed with status ${res.status}`);
      logoutUser();
      return false;
    }

    const data: { token: string } = await res.json();
    console.log('🔄 refreshAccessToken response:', data);

    if (data.token) {
      accessToken = data.token;
      try {
        // Save refreshed token to both storages if exists
        localStorage.setItem('triptask_token', data.token);
        sessionStorage.setItem('triptask_token', data.token);
        console.log('🔄 refreshAccessToken: new token saved to localStorage and sessionStorage');
      } catch (err) {
        console.warn('⚠️ refreshAccessToken storage set failed:', err);
      }
      return true;
    }
  } catch (err) {
    console.error('❌ refreshAccessToken error:', err);
  }

  logoutUser();
  return false;
}

/**
 * Fetch current authenticated user info using Bearer token
 * Retries once if token expired and refresh succeeds
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  let token = getAccessToken();
  if (!token) {
    console.warn('⚠️ getCurrentUser: No access token available');
    return null;
  }

  try {
    console.log('🔍 getCurrentUser: fetching /auth/me with token:', token);
    let res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      console.warn('⚠️ getCurrentUser: 401 Unauthorized, trying to refresh token...');
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        token = getAccessToken();
        console.log('🔍 getCurrentUser: retrying /auth/me with refreshed token:', token);
        res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        console.warn('⚠️ getCurrentUser: token refresh failed');
        return null;
      }
    }

    if (!res.ok) {
      console.warn(`⚠️ getCurrentUser: /auth/me failed with status ${res.status}`);
      return null;
    }

    const data: MeResponse = await res.json();
    console.log('✅ getCurrentUser: user data received:', data.user);
    return data.user || null;
  } catch (err) {
    console.error('❌ getCurrentUser error:', err);
    return null;
  }
}

/**
 * Login user with email and password
 * Stores tokens in memory and optionally in localStorage or sessionStorage (if rememberMe)
 */
export async function loginUser(
  email: string,
  password: string,
  rememberMe = false
): Promise<{ user: AuthUser; token: string; refreshToken?: string }> {
  try {
    console.log('🔐 loginUser: logging in with email:', email);
    const res = await fetch(`${API_BASE}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log('🔐 loginUser response:', data);

    if (!res.ok) {
      const errorMessage =
        typeof data === 'object' && 'message' in data
          ? (data as ErrorResponse).message
          : 'Login failed';
      throw new Error(errorMessage);
    }

    const { token, refreshToken, user } = data as LoginResponse;

    if (!token || !user) {
      throw new Error('Tokens or user data missing from login response');
    }

    setTokens({ access: token, refresh: refreshToken });

    if (rememberMe) {
      try {
        localStorage.setItem('triptask_token', token);
        if (refreshToken) {
          localStorage.setItem('triptask_refresh_token', refreshToken);
        }
        console.log('🔐 loginUser: tokens saved to localStorage');
      } catch (err) {
        console.warn('⚠️ loginUser localStorage set failed:', err);
      }
    } else {
      try {
        sessionStorage.setItem('triptask_token', token);
        if (refreshToken) {
          sessionStorage.setItem('triptask_refresh_token', refreshToken);
        }
        console.log('🔐 loginUser: tokens saved to sessionStorage');
      } catch (err) {
        console.warn('⚠️ loginUser sessionStorage set failed:', err);
      }
    }

    return { user, token, refreshToken };
  } catch (err) {
    console.error('❌ loginUser error:', err);
    throw err;
  }
}
