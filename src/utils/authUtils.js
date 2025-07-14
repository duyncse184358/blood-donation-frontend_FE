// src/services/authService.js
import api from './api'; // Import instance axios đã cấu hình interceptor
import { jwtDecode } from 'jwt-decode';

// --- AUTHENTICATION API CALLS ---

/**
 * Gửi mã OTP đến email để đăng ký.
 * @param {string} email
 * @returns {Promise<string>} Message from API
 */
export const sendOtpForRegistration = async (email) => {
    try {
        const response = await api.post('/Auth/send-otp', { email });
        return response.data.message; // "Mã OTP đã được gửi tới email."
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Gửi OTP thất bại.';
        console.error('Error sending OTP for registration:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * Đăng ký tài khoản mới với OTP.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} confirmPassword
 * @param {string} otpCode
 * @returns {Promise<string>} JWT Token hoặc Message
 */
export const register = async (username, email, password, confirmPassword, otpCode) => {
    try {
        const response = await api.post('/Auth/register', { username, email, password, confirmPassword, otpCode }); 
        // Backend có thể trả về TokenDto { Token: "..." } hoặc Message { Message: "..." }
        // Kiểm tra loại phản hồi để trả về cho phù hợp
        if (response.data && response.data.token) {
            return response.data.token;
        } else if (response.data && response.data.message) {
            return response.data.message;
        }
        throw new Error('Phản hồi đăng ký không chứa token hoặc message.');
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Đăng ký thất bại. Vui lòng kiểm tra thông tin hoặc mã OTP.';
        console.error('Error during registration:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * Đăng nhập người dùng và nhận JWT Token.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} JWT Token
 */
export const login = async (email, password) => {
    try {
        const response = await api.post('/Auth/login', { email, password });
        // API trả về TokenDto { Token: "..." }
        return response.data.token;
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
        console.error('Error during login:', errorMessage);
        throw new Error(errorMessage);
    }
};

// --- RESET PASSWORD API CALLS ---

/**
 * Gửi mã OTP để đặt lại mật khẩu.
 * @param {string} email
 * @returns {Promise<string>} Message from API
 */
export const sendOtpForResetPassword = async (email) => {
    try {
        const response = await api.post('/Auth/forgot-password', { email });
        return response.data.message; // API trả về "OTP sent successfully."
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Gửi OTP thất bại. Email không tồn tại hoặc lỗi hệ thống.';
        console.error('Error sending OTP for password reset:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * Đặt lại mật khẩu bằng OTP.
 * @param {string} email
 * @param {string} otpCode
 * @param {string} newPassword
 * @param {string} confirmNewPassword
 * @returns {Promise<string>} Message from API
 */
export const resetPassword = async (email, otpCode, newPassword, confirmNewPassword) => {
    if (!email || !otpCode || !newPassword || !confirmNewPassword) {
        throw new Error('Tất cả các trường đều bắt buộc.');
    }
    if (newPassword !== confirmNewPassword) {
        throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
    }
    try {
        const response = await api.post('/Auth/reset-password', {
            email,
            otpCode,
            newPassword,
            confirmNewPassword,
        });
        return response.data.message || 'Đặt lại mật khẩu thành công.';
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Đặt lại mật khẩu thất bại. Mã OTP không hợp lệ/hết hạn hoặc lỗi hệ thống.';
        console.error('Error resetting password:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * Giải mã JWT token.
 * @param {string} token - Chuỗi JWT token.
 * @returns {object|null} Payload của token đã giải mã hoặc null nếu giải mã thất bại.
 */
export const decodeToken = (token) => {
    try {
        return jwtDecode(token); 
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

/**
 * Hàm để đăng xuất (xóa token khỏi localStorage).
 */
export const logout = () => {
    localStorage.removeItem('jwtToken');
    window.dispatchEvent(new Event('authChange'));
};

/**
 * Lấy thông tin người dùng hiện tại từ token nếu có.
 * @returns {object|null} Thông tin người dùng đã giải mã hoặc null.
 */
export const getCurrentUser = () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        return jwtDecode(token);
    }
    return null;
};
