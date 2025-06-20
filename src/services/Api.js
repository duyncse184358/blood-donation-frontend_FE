import axios from 'axios';

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
    // Nếu lỗi 401 (Unauthorized) và không phải là request login/register,
    // và chưa thử lại (để tránh vòng lặp vô hạn)
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/Auth')) {
      originalRequest._retry = true;
      localStorage.removeItem('jwtToken');
      // Dispatch một event để AuthContext có thể cập nhật trạng thái
      window.dispatchEvent(new Event('authChange')); 
      window.location.href = '/login'; // Điều hướng cứng về trang đăng nhập
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
