// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function getCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });

    const text = await res.text();
    console.log('📦 Raw /auth/me response (from context):', text);

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

// ✅ Improved login flow: retry `/auth/me` after login with delay
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

  // 🔁 Retry checking session 3x with delay
  for (let i = 0; i < 3; i++) {
    await sleep(300); // wait 300ms
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });
    const meData = await meRes.json();

    if (meRes.ok && meData.user) {
      return meData.user;
    }
  }

  throw new Error('Login succeeded, but session not established.');
}
