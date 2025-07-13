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
}

/**
 * Load tokens from localStorage (called on app init)
 */
export function loadTokensFromStorage() {
  try {
    const storedToken = localStorage.getItem('triptask_token');
    const storedRefresh = localStorage.getItem('triptask_refresh_token');
    if (storedToken) {
      setTokens({ access: storedToken, refresh: storedRefresh ?? undefined });
    }
  } catch {
    // localStorage might be unavailable (SSR, private mode)
  }
}

/**
 * Get current access token in memory
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Get current refresh token in memory
 */
export function getRefreshToken(): string | null {
  return refreshToken;
}

/**
 * Clear tokens from memory and localStorage (logout)
 */
export function logoutUser() {
  accessToken = null;
  refreshToken = null;
  try {
    localStorage.removeItem('triptask_token');
    localStorage.removeItem('triptask_refresh_token');
  } catch {}
}

/**
 * Refresh access token using refresh token
 * Returns true if refresh succeeded and updated token, false otherwise
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

    if (!res.ok) {
      logoutUser();
      return false;
    }

    const data: { token: string } = await res.json();

    if (data.token) {
      accessToken = data.token;
      try {
        localStorage.setItem('triptask_token', data.token);
      } catch {}
      return true;
    }
  } catch (err) {
    console.error('❌ Failed to refresh token:', err);
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
 * Login user with email and password
 * Stores tokens in memory and optionally in localStorage (if rememberMe)
 */
export async function loginUser(
  email: string,
  password: string,
  rememberMe = false
): Promise<{ user: AuthUser; token: string; refreshToken?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
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

    if (!token || !user) {
      throw new Error('Tokens or user data missing from login response');
    }

    setTokens({ access: token, refresh: refreshToken });

    if (rememberMe) {
      try {
        localStorage.setItem('triptask_token', token);
        if (refreshToken) localStorage.setItem('triptask_refresh_token', refreshToken);
      } catch {}
    }

    return { user, token, refreshToken };
  } catch (err) {
    console.error('❌ Login error:', err);
    throw err;
  }
}
