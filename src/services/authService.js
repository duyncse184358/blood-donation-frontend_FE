import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Thay đổi URL này để khớp với API của bạn (ví dụ: https://localhost:7080/api)
// Đảm bảo đây là URL chính xác của API Backend của bạn.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:44387/api'; // KIỂM TRA LẠI DÒNG NÀY RẤT QUAN TRỌNG

// Tạo một instance Axios để dễ dàng cấu hình headers (ví dụ: cho Authorization)
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào mỗi request (trừ các request public)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý lỗi response, ví dụ: token hết hạn (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Nếu lỗi 401 (Unauthorized) và không phải request đăng nhập/đăng ký
    if (error.response && error.response.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true; // Đánh dấu đã thử lại
      // Đây là nơi bạn có thể thử làm mới token nếu có refresh token
      // Hoặc đơn giản là chuyển hướng về trang đăng nhập
      console.log('Token hết hạn hoặc không hợp lệ. Đang chuyển hướng đến trang đăng nhập...');
      localStorage.removeItem('jwtToken'); // Xóa token cũ
      // Tránh lặp vô hạn nếu backend liên tục trả 401 cho refresh token
      window.location.href = '/login'; // Điều hướng người dùng về trang đăng nhập
      return Promise.reject(error); // Tiếp tục ném lỗi
    }
    return Promise.reject(error);
  }
);


/**
 * @function register
 * @description Gửi yêu cầu đăng ký người dùng mới.
 * @param {object} userData - Dữ liệu người dùng (username, email, password, confirmPassword).
 * @returns {Promise<object>} Đối tượng chứa token (hoặc message) và user info.
 */
export const register = async (userData) => {
    try {
        const response = await api.post('/Auth/register', userData); // Sửa đường dẫn API nếu cần
        return response.data; // Backend nên trả về token ở đây
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Đăng ký thất bại.';
        console.error('Error registering:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * @function sendOtpForRegistration
 * @description Gửi mã OTP để xác minh email khi đăng ký.
 * @param {string} email - Email cần gửi OTP.
 * @returns {Promise<string>} Message từ API.
 */
export const sendOtpForRegistration = async (email) => {
    try {
        const response = await api.post('/Auth/send-otp', { email });
        return response.data.message; // API trả về message "Mã OTP đã được gửi tới email."
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Gửi OTP thất bại.';
        console.error('Error sending OTP:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * @function login
 * @description Gửi yêu cầu đăng nhập.
 * @param {string} email - Email người dùng.
 * @param {string} password - Mật khẩu người dùng.
 * @returns {Promise<string>} JWT token nếu đăng nhập thành công.
 */
export const login = async (email, password) => { // ĐẢM BẢO export const login
    try {
        const response = await api.post('/Auth/login', { email, password });
        // Backend của bạn nên trả về trực tiếp chuỗi token (hoặc một object có trường 'token')
        // Nếu backend trả về { token: "your_jwt_token" }, thì response.data.token
        // Nếu backend trả về "your_jwt_token" trực tiếp, thì response.data
        return response.data.token || response.data; 
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Email hoặc mật khẩu không đúng.';
        console.error('Error logging in:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * @function requestPasswordReset
 * @description Gửi yêu cầu đặt lại mật khẩu và OTP về email.
 * @param {string} email
 * @returns {Promise<string>} Message from API
 */
export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post('/Auth/forgot-password', { email }); // Sửa đường dẫn API nếu cần
        return response.data.message; // API trả về "Mã OTP đã được gửi về email."
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại.';
        console.error('Error requesting password reset:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * @function resetPassword
 * @description Xác nhận OTP và đặt mật khẩu mới.
 * @param {string} email
 * @param {string} otpCode
 * @param {string} newPassword
 * @param {string} confirmNewPassword
 * @returns {Promise<string>} Message from API
 */
export const resetPassword = async (email, otpCode, newPassword, confirmNewPassword) => {
    try {
        const response = await api.post('/Auth/reset-password', { email, otpCode, newPassword, confirmNewPassword }); // Đã sửa về Auth/reset-password theo AuthController
        return response.data.message; // API trả về "Password reset successful."
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Đặt lại mật khẩu thất bại. Mã OTP không hợp lệ/hết hạn hoặc lỗi hệ thống.';
        console.error('Error resetting password:', errorMessage);
        throw new Error(errorMessage);
    }
};

// Hàm giúp giải mã JWT token (cần thiết để lấy userId và role)
export const decodeToken = (token) => {
    try {
        return jwtDecode(token); 
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

// Hàm để đăng xuất (xóa token khỏi localStorage)
export const logout = () => {
    localStorage.removeItem('jwtToken');
    window.dispatchEvent(new Event('authChange'));
};

// Hàm để lấy thông tin người dùng hiện tại từ token nếu có (sử dụng trong AuthContext và utils)
export const getCurrentUser = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    return decodeToken(token);
};
