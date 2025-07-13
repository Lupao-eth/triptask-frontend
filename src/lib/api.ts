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
  refreshToken: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

interface ErrorResponse {
  message: string;
}

/**
 * Set access and refresh tokens
 */
export function setTokens(tokens: { access: string; refresh: string }) {
  accessToken = tokens.access;
  refreshToken = tokens.refresh;
}

/**
 * Load tokens from localStorage (on first load)
 */
export function loadTokensFromStorage() {
  const storedToken = localStorage.getItem('triptask_token');
  const storedRefresh = localStorage.getItem('triptask_refresh_token');
  if (storedToken && storedRefresh) {
    setTokens({ access: storedToken, refresh: storedRefresh });
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  return refreshToken;
}

/**
 * Clear both tokens (logout)
 */
export function logoutUser() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('triptask_token');
  localStorage.removeItem('triptask_refresh_token');
}

/**
 * Refresh access token using refreshToken
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data: { token: string } = await res.json();

    if (res.ok && data.token) {
      accessToken = data.token;
      localStorage.setItem('triptask_token', data.token); // 🔐 update localStorage
      return true;
    }
  } catch (err) {
    console.error('❌ Failed to refresh token:', err);
  }

  logoutUser();
  return false;
}

/**
 * Get the current authenticated user using Bearer token
 * Auto-retries once if token is expired and refresh works
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  let token = getAccessToken();
  if (!token) {
    console.warn('⚠️ No access token available');
    return null;
  }

  try {
    let res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        token = getAccessToken();
        res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }

    if (!res.ok) {
      console.warn(`⚠️ /auth/me failed with status ${res.status}`);
      return null;
    }

    const data: MeResponse = await res.json();
    return data.user || null;
  } catch (err) {
    console.error('❌ Error fetching current user:', err);
    return null;
  }
}

/**
 * Login user and store access + refresh tokens
 */
export async function loginUser(
  email: string,
  password: string,
  rememberMe = false
): Promise<{ user: AuthUser; token: string; refreshToken: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage =
        typeof data === 'object' && 'message' in data
          ? (data as ErrorResponse).message
          : 'Login failed';
      throw new Error(errorMessage);
    }

    const { token, refreshToken, user } = data as LoginResponse;

    if (!token || !refreshToken || !user) {
      throw new Error('Tokens or user data missing from login response');
    }

    setTokens({ access: token, refresh: refreshToken });

    if (rememberMe) {
      localStorage.setItem('triptask_token', token);
      localStorage.setItem('triptask_refresh_token', refreshToken);
    }

    return { user, token, refreshToken };
  } catch (err) {
    console.error('❌ Login error:', err);
    throw err;
  }
}
