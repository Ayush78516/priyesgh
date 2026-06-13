import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  const payloadPart = token?.split(".")?.[1];
  if (!payloadPart) return null;

  const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return JSON.parse(atob(padded));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check User Session
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      try {
        const payload = decodeJwtPayload(userToken);
        if (payload.exp * 1000 > Date.now()) {
          const savedUser = localStorage.getItem("userUserInfo");
          if (savedUser) setUser(JSON.parse(savedUser));
          else setUser({ id: payload.id, role: payload.role });
        }
      } catch (e) { localStorage.removeItem("userToken"); }
    }

    // Check Admin Session
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      try {
        const payload = decodeJwtPayload(adminToken);
        const savedAdmin = localStorage.getItem("adminUserInfo");
        if (savedAdmin) setAdmin({ ...JSON.parse(savedAdmin), role: payload.role });
        else setAdmin({ id: payload.id, role: payload.role });
      } catch (e) {
        // Do not force-remove admin token on decode issues.
        // Keep session until server explicitly rejects it.
        const savedAdmin = localStorage.getItem("adminUserInfo");
        if (savedAdmin) {
          try {
            setAdmin(JSON.parse(savedAdmin));
          } catch (_) {
            // ignore malformed local admin cache
          }
        }
      }
    }
    setLoading(false);
  }, []);

  const login = (token, refreshToken, userInfo, isAdmin = false) => {
    const prefix = isAdmin ? "admin" : "user";
    localStorage.setItem(`${prefix}Token`, token);
    localStorage.setItem(`${prefix}RefreshToken`, refreshToken);
    localStorage.setItem(`${prefix}UserInfo`, JSON.stringify(userInfo));
    
    if (isAdmin) setAdmin(userInfo);
    else setUser(userInfo);
  };

  const logout = (isAdmin = false) => {
    const prefix = isAdmin === true ? "admin" : "user";
    localStorage.removeItem(`${prefix}Token`);
    localStorage.removeItem(`${prefix}RefreshToken`);
    localStorage.removeItem(`${prefix}UserInfo`);
    
    // Also remove unprefixed fallbacks
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("refreshToken");

    if (isAdmin === true) setAdmin(null);
    else setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
