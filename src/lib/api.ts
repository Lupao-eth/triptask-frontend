const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/backend';

let accessToken: string | null = null;
let refreshToken: string | null = null;

const TOKEN_KEY = 'triptask_token';
const REFRESH_TOKEN_KEY = 'triptask_refresh_token';

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

export function setTokens(tokens: { access: string; refresh?: string | null }) {
  if (!tokens.access || tokens.access === 'undefined' || tokens.access === 'null') {
    console.warn('🚫 setTokens: Invalid access token');
    accessToken = null;
    refreshToken = null;
    return;
  }

  accessToken = tokens.access;
  refreshToken = tokens.refresh ?? null;
  console.log('🔐 setTokens:', { accessToken, refreshToken });
}

export function loadTokensFromStorage(): { accessToken: string | null; refreshToken: string | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!token || token === 'undefined' || token === 'null') {
      console.log('📦 loadTokensFromStorage: No valid token');
      accessToken = null;
      refreshToken = null;
      logoutUser();
      return { accessToken: null, refreshToken: null };
    }

    console.log('📦 loadTokensFromStorage: Loaded from localStorage');
    setTokens({ access: token, refresh: refresh ?? null });
    return { accessToken: token, refreshToken: refresh ?? null };
  } catch (err) {
    console.warn('⚠️ loadTokensFromStorage failed:', err);
    accessToken = null;
    refreshToken = null;
    return { accessToken: null, refreshToken: null };
  }
}

export function getAccessToken(): string | null {
  console.log('🔑 getAccessToken:', accessToken);
  return accessToken;
}

export function getRefreshToken(): string | null {
  console.log('🔑 getRefreshToken:', refreshToken);
  return refreshToken;
}

export function logoutUser() {
  accessToken = null;
  refreshToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log('🚪 logoutUser: tokens cleared');
  } catch (err) {
    console.warn('⚠️ logoutUser error:', err);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
    console.warn('⚠️ refreshAccessToken: No refresh token available');
    return false;
  }

  try {
    console.log('🔄 refreshAccessToken: Sending request');
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.warn(`⚠️ refreshAccessToken failed: ${res.status}`);
      logoutUser();
      return false;
    }

    const data: { token: string; refreshToken?: string } = await res.json();
    if (data.token && data.token !== 'undefined') {
      accessToken = data.token;
      localStorage.setItem(TOKEN_KEY, data.token);

      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        refreshToken = data.refreshToken;
      }

      console.log('🔄 refreshAccessToken: Tokens updated');
      return true;
    }
  } catch (err) {
    console.error('❌ refreshAccessToken error:', err);
  }

  logoutUser();
  return false;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  let token = getAccessToken();
  if (!token) {
    console.warn('⚠️ getCurrentUser: No token, trying storage');
    const stored = loadTokensFromStorage();
    token = stored.accessToken;
    if (!token) return null;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      console.warn('⚠️ 401 Unauthorized. Trying refresh...');
      const refreshed = await refreshAccessToken();
      if (!refreshed) return null;

      token = getAccessToken();
      if (!token) return null;

      return await getCurrentUser(); // Retry after refresh
    }

    if (!res.ok) {
      console.warn(`⚠️ getCurrentUser failed: ${res.status}`);
      return null;
    }

    const data: MeResponse = await res.json();
    console.log('✅ getCurrentUser:', data.user);
    return data.user || null;
  } catch (err) {
    console.error('❌ getCurrentUser error:', err);
    return null;
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string; refreshToken?: string }> {
  try {
    console.log('🔐 loginUser: logging in', email);
    const res = await fetch(`${API_BASE}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    if (!token || !user || token === 'undefined') {
      throw new Error('Missing token or user in login response');
    }

    setTokens({ access: token, refresh: refreshToken });

    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    console.log('🧠 loginUser: Tokens saved (persistent)');
    return { user, token, refreshToken };
  } catch (err) {
    console.error('❌ loginUser error:', err);
    throw err;
  }
}
