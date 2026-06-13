async function refreshAdminToken() {
  const refreshToken = localStorage.getItem("adminRefreshToken");

  if (!refreshToken) {
    throw new Error("Admin refresh token is missing");
  }

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: refreshToken }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success || !data.accessToken) {
    throw new Error(data.message || "Unable to refresh admin session");
  }

  localStorage.setItem("adminToken", data.accessToken);
  return data.accessToken;
}

function withAdminAuth(options = {}, token) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function adminFetch(url, options = {}) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin token is missing");
  }

  let res = await fetch(url, withAdminAuth(options, token));

  if (res.status !== 401) {
    return res;
  }

  const refreshedToken = await refreshAdminToken();
  return fetch(url, withAdminAuth(options, refreshedToken));
}
