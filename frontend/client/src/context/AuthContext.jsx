import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  isAuth: false,
  userRole: null,
  userName: null,
  userEmail: null,
  userId: null,
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuth: false,
    userRole: null,
    userName: null,
    userEmail: null,
    userId: null,
  });

  useEffect(() => {
    if (window.__INITIAL_DATA__) {
      setAuthState({
        isAuth: Boolean(window.__INITIAL_DATA__.isAuth),
        userRole: window.__INITIAL_DATA__.userRole || null,
        userName: window.__INITIAL_DATA__.userName || null,
        userEmail: window.__INITIAL_DATA__.userEmail || null,
        userId: window.__INITIAL_DATA__.userId || null,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
