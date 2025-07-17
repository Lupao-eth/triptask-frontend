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

export function loadTokensFromStorage(): { token: string | null; refresh: string | null } {
  try {
    let storedToken = localStorage.getItem('triptask_token');
    let storedRefresh = localStorage.getItem('triptask_refresh_token');
    let storageType = 'localStorage';

    if (!storedToken || storedToken === 'undefined' || storedToken === 'null' || storedToken.trim() === '') {
      storedToken = sessionStorage.getItem('triptask_token');
      storedRefresh = sessionStorage.getItem('triptask_refresh_token');
      storageType = 'sessionStorage';
    }

    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
      console.log(`📦 loadTokensFromStorage: Found tokens in ${storageType}`);
      setTokens({ access: storedToken, refresh: storedRefresh ?? null });
      return { token: storedToken, refresh: storedRefresh ?? null };
    } else {
      console.log('📦 loadTokensFromStorage: No valid tokens, clearing memory');
      accessToken = null;
      refreshToken = null;
      return { token: null, refresh: null };
    }
  } catch (err) {
    console.warn('⚠️ loadTokensFromStorage failed:', err);
    accessToken = null;
    refreshToken = null;
    return { token: null, refresh: null };
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
  console.log('🚪 logoutUser: tokens cleared from memory');
  try {
    localStorage.removeItem('triptask_token');
    localStorage.removeItem('triptask_refresh_token');
    sessionStorage.removeItem('triptask_token');
    sessionStorage.removeItem('triptask_refresh_token');
    console.log('🚪 logoutUser: tokens cleared from both storages');
  } catch (err) {
    console.warn('⚠️ logoutUser storage removal failed:', err);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
    console.warn('⚠️ refreshAccessToken: no refreshToken available');
    return false;
  }

  try {
    console.log('🔄 refreshAccessToken: sending refresh request...');
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
    console.log('🔄 refreshAccessToken response:', data);

    if (data.token && data.token !== 'undefined') {
      accessToken = data.token;

      const isInLocal = !!localStorage.getItem('triptask_refresh_token');
      const storage = isInLocal ? localStorage : sessionStorage;

      storage.setItem('triptask_token', data.token);
      if (data.refreshToken) {
        storage.setItem('triptask_refresh_token', data.refreshToken);
        refreshToken = data.refreshToken;
      }

      console.log(`🔄 refreshAccessToken: tokens updated in ${isInLocal ? 'localStorage' : 'sessionStorage'}`);
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
    console.warn('⚠️ getCurrentUser: No access token available');
    return null;
  }

  try {
    console.log('🔍 getCurrentUser: using token', token);
    let res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      console.warn('⚠️ 401 Unauthorized. Trying refresh...');
      const refreshed = await refreshAccessToken();
      if (!refreshed) return null;

      token = getAccessToken();
      if (!token) return null;

      res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
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
  password: string,
  rememberMe = false
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

    if (rememberMe) {
      localStorage.setItem('triptask_token', token);
      if (refreshToken) localStorage.setItem('triptask_refresh_token', refreshToken);
      sessionStorage.removeItem('triptask_token');
      sessionStorage.removeItem('triptask_refresh_token');
      console.log('🧠 loginUser: tokens saved to localStorage');
    } else {
      sessionStorage.setItem('triptask_token', token);
      if (refreshToken) sessionStorage.setItem('triptask_refresh_token', refreshToken);
      localStorage.removeItem('triptask_token');
      localStorage.removeItem('triptask_refresh_token');
      console.log('🧠 loginUser: tokens saved to sessionStorage');
    }

    return { user, token, refreshToken };
  } catch (err) {
    console.error('❌ loginUser error:', err);
    throw err;
  }
}
