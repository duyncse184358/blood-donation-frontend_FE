// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as authLoginService } from '../services/authService';

export const AuthContext = createContext();

const roleIdToName = {
  1: 'Admin',
  2: 'Staff',
  3: 'Member',
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeAndSetUser = (token) => {
    try {
      const decodedToken = jwtDecode(token);

      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('jwtToken');
        sessionStorage.removeItem('jwtToken');
        setIsAuthenticated(false);
        setUser(null);
        return null;
      }

      let userRole = decodedToken.role ||
        decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        roleIdToName[decodedToken.roleid] ||
        roleIdToName[decodedToken.RoleId] ||
        'Member';

      const userId = decodedToken.userId || decodedToken.user_id || decodedToken.sub;
      const username = decodedToken.username || decodedToken.unique_name || decodedToken.name || decodedToken.email;
      const email = decodedToken.email;

      const userObject = {
        userId: userId,
        username: username,
        email: email,
        role: userRole,
        exp: decodedToken.exp,
      };

      setIsAuthenticated(true);
      setUser(userObject);
      return userObject;

    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('jwtToken');
      sessionStorage.removeItem('jwtToken');
      return null;
    }
  };

  useEffect(() => {
    // Lấy token ưu tiên sessionStorage, sau đó localStorage
    const token = sessionStorage.getItem('jwtToken') || localStorage.getItem('jwtToken');
    if (token) {
      decodeAndSetUser(token);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);

    // Xóa token khi tắt tab/trình duyệt (không xóa khi reload)
    let timeoutId = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Delay một chút để phân biệt reload và đóng tab
        timeoutId = setTimeout(() => {
          localStorage.removeItem('jwtToken');
          sessionStorage.removeItem('jwtToken');
        }, 500);
      } else if (document.visibilityState === 'visible') {
        // Nếu reload, hủy xóa token
        if (timeoutId) clearTimeout(timeoutId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const token = await authLoginService(email, password);
      localStorage.setItem('jwtToken', token);
      sessionStorage.setItem('jwtToken', token);
      const user = decodeAndSetUser(token);
      return { success: true, user: user };
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('jwtToken');
      sessionStorage.removeItem('jwtToken');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    sessionStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';
  const isStaff = user?.role === 'Staff';
  const isMember = user?.role === 'Member' || user?.role === 'User';

  const authContextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    isAdmin,
    isStaff,
    isMember,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
