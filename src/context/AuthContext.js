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

const TOKEN_TIMEOUT = 60 * 60 * 1000; // 60 phút

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeAndSetUser = (token) => {
    try {
      const decodedToken = jwtDecode(token);

      // Kiểm tra hạn token (exp tính bằng giây, Date.now() tính bằng ms)
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loginTime');
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
      // Lấy trạng thái hoạt động từ token (mặc định true nếu không có)
      const isActive = decodedToken.isActive !== undefined
        ? decodedToken.isActive === true || decodedToken.isActive === 'true'
        : (decodedToken.IsActive !== undefined
            ? decodedToken.IsActive === true || decodedToken.IsActive === 'true'
            : true);

      const userObject = {
        userId: userId,
        username: username,
        email: email,
        role: userRole,
        exp: decodedToken.exp,
        isActive: isActive,
      };

      setIsAuthenticated(true);
      setUser(userObject);
      return userObject;

    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loginTime');
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const loginTime = localStorage.getItem('loginTime');
    if (token && loginTime) {
      // Nếu quá 60 phút kể từ lần đăng nhập cuối cùng, xóa token
      if (Date.now() - Number(loginTime) > TOKEN_TIMEOUT) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loginTime');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        decodeAndSetUser(token);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const token = await authLoginService(email, password);
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('loginTime', Date.now().toString());
      const user = decodeAndSetUser(token);
      return { success: true, user: user };
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loginTime');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loginTime');
    setIsAuthenticated(false);
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';
  const isStaff = user?.role === 'Staff';
  const isMember = user?.role === 'Member' || user?.role === 'member';
  const isUserActive = user?.isActive === true;

  const authContextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    isAdmin,
    isStaff,
    isMember,
    isUserActive,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
