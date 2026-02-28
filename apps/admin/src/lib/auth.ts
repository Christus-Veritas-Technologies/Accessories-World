// Session validation utilities
export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find((row) => row.startsWith('adminToken='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

export function clearAuthToken() {
  document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
}

export function redirectToLogin() {
  window.location.href = '/login';
}

export async function validateSession(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) return false;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/api/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      clearAuthToken();
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}
