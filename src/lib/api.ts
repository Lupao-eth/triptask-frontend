// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function getCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });

    const text = await res.text();
    console.log('📦 Raw /auth/me response (from context):', text);

    if (!res.ok || !text) {
      console.warn('⚠️ /auth/me failed or returned empty');
      return null;
    }

    const data = JSON.parse(text);
    console.log('✅ Parsed /auth/me response:', data);

    return data.user || null;
  } catch (err) {
    console.error('❌ Error fetching current user (from context):', err);
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loginUser(email: string, password: string, rememberMe = false) {
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(loginData.message || 'Login failed');
  }

  // Retry up to 3 times to check session
  for (let i = 0; i < 3; i++) {
    await sleep(300);

    const meRes = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });

    if (meRes.ok) {
      const text = await meRes.text();
      if (text) {
        try {
          const meData = JSON.parse(text);
          if (meData.user) return meData.user;
        } catch (err) {
          console.warn('⚠️ Failed to parse /auth/me retry:', err);
        }
      }
    }
  }

  throw new Error('Login succeeded, but session not established.');
}

export async function logoutUser() {
  return fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
