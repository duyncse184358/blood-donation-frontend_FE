// src/services/userService.js
import api from './Api'; // Sử dụng instance đã cấu hình sẵn

// --- USER PROFILE API CALLS ---

/**
 * Lấy thông tin hồ sơ người dùng bằng UserId.
 * @param {string} userId
 * @returns {Promise<object>} UserProfileDto
 */
export const getUserProfileByUserId = async (userId) => {
    try {
        const response = await api.get(`/UserProfile/by-user/${userId}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể lấy thông tin hồ sơ người dùng.';
        console.error('Error fetching user profile:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * Cập nhật thông tin hồ sơ người dùng.
 * @param {string} userId
 * @param {object} updateProfileDto
 * @returns {Promise<object>} UserProfileDto đã cập nhật
 */
export const updateProfile = async (userId, updateProfileDto) => {
    try {
        const response = await api.put(`/UserProfile/by-user/${userId}`, updateProfileDto);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể cập nhật hồ sơ người dùng.';
        console.error('Error updating user profile:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * Tạo hồ sơ người dùng mới.
 * @param {object} createProfileDto
 * @returns {Promise<object>} UserProfileDto đã tạo
 */
export const createUserProfile = async (createProfileDto) => {
    try {
        const response = await api.post('/UserProfile', createProfileDto);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể tạo hồ sơ người dùng.';
        console.error('Error creating user profile:', errorMessage);
        throw new Error(errorMessage);
    }
};

// --- ADMIN: MANAGE USER ACCOUNTS API CALLS ---

/**
 * [ADMIN ONLY] Lấy tất cả người dùng.
 * @returns {Promise<Array<object>>} Danh sách UserDto
 */
export const getAllUsers = async () => {
    try {
        const response = await api.get('/ManageUserAccounts');
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể lấy danh sách người dùng.';
        console.error('Error fetching all users (Admin):', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * [ADMIN ONLY] Lấy người dùng theo ID.
 * @param {string} userId
 * @returns {Promise<object>} UserDto
 */
export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/ManageUserAccounts/${userId}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không tìm thấy người dùng.';
        console.error('Error fetching user by ID (Admin):', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * [ADMIN ONLY] Tạo người dùng mới.
 * @param {object} createUserDto
 * @returns {Promise<object>} UserDto đã tạo
 */
export const createUserByAdmin = async (createUserDto) => {
    try {
        const response = await api.post('/ManageUserAccounts', createUserDto);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể tạo người dùng mới.';
        console.error('Error creating user (Admin):', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * [ADMIN ONLY] Cập nhật thông tin người dùng.
 * @param {string} userId
 * @param {object} updateDto
 * @returns {Promise<object>} UserDto đã cập nhật
 */
export const updateUser = async (userId, updateDto) => {
    try {
        const response = await api.put(`/ManageUserAccounts/${userId}`, updateDto);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể cập nhật người dùng.';
        console.error('Error updating user (Admin):', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * [ADMIN ONLY] Cập nhật vai trò (role) của người dùng.
 * @param {string} userId
 * @param {object} roleDto { roleName: string }
 * @returns {Promise<object>} UserDto với role đã cập nhật
 */
export const updateUserRole = async (userId, roleDto) => {
    try {
        const response = await api.put(`/ManageUserAccounts/${userId}/role`, roleDto);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể cập nhật vai trò người dùng.';
        console.error('Error updating user role (Admin):', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * [ADMIN ONLY] Xóa người dùng.
 * @param {string} userId
 * @returns {Promise<string>} Message thành công
 */
export const deleteUser = async (userId) => {
    try {
        await api.delete(`/ManageUserAccounts/${userId}`);
        return 'User deleted successfully.';
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể xóa người dùng.';
        console.error('Error deleting user (Admin):', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * [ADMIN ONLY] Lấy tất cả vai trò (roles) trong hệ thống.
 * @returns {Promise<Array<object>>} Danh sách RoleDto
 */
export const getAllRoles = async () => {
    try {
        const response = await api.get('/Roles');
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Không thể lấy danh sách vai trò.';
        console.error('Error fetching all roles (Admin):', errorMessage);
        throw new Error(errorMessage);
    }
};