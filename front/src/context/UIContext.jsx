import React, { createContext, useContext, useState, useEffect } from "react";

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <UIContext.Provider value={{ loading, setLoading, toast, showToast }}>
      {children}
      <GlobalLoader loading={loading} />
      <GlobalToast toast={toast} />
    </UIContext.Provider>
  );
};

const GlobalLoader = ({ loading }) => {
  if (!loading) return null;
  return (
    <div style={styles.fullLoader}>
      <div style={styles.spinner}></div>
      <div style={{ color: "#fff", marginTop: 15, fontWeight: 600, fontSize: 16 }}>Processing...</div>
    </div>
  );
};

const GlobalToast = ({ toast }) => {
  if (!toast) return null;
  const bg = toast.type === "success" ? "#059669" : "#dc2626";
  return (
    <div style={{ ...styles.toast, background: bg }}>
      {toast.message}
    </div>
  );
};

const styles = {
  toast: { 
    position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', 
    padding: '12px 24px', borderRadius: 8, color: '#fff', fontWeight: 600, 
    fontSize: 14, zIndex: 99999, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', 
    transition: 'all 0.3s ease', animation: 'slideDown 0.3s ease' 
  },
  fullLoader: { 
    position: 'fixed', inset: 0, background: 'rgba(0,43,91,0.7)', 
    backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', 
    alignItems: 'center', justifyContent: 'center', zIndex: 99998 
  },
  spinner: { 
    width: 50, height: 50, border: '4px solid rgba(255,255,255,0.3)', 
    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' 
  }
};

// Global animations
if (typeof document !== "undefined") {
  const styleId = "global-ui-styles";
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.innerText = `
      @keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(styleSheet);
  }
}
