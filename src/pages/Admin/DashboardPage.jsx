import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/Api';

const roleIdToName = {
  1: 'Admin',
  2: 'Staff',
  3: 'Member',
};

function DashboardPage() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', roleId: 2, isActive: true });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    roleId: 3,
    isActive: true,
  });
  const [createErrors, setCreateErrors] = useState({});

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ManageUserAccounts');
      setUsers(res.data || []);
    } catch (err) {
      setError('Không thể tải danh sách người dùng.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Admin') {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [isAuthenticated, user]);

  // Xóa tài khoản
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/ManageUserAccounts/${id}`);
      setSuccess('Xóa tài khoản thành công.');
      fetchUsers();
    } catch (err) {
      setError('Xóa tài khoản thất bại.');
    }
  };

  // Mở modal cập nhật
  const handleUpdate = (u) => {
    setEditUser(u);
    setEditForm({
      username: u.username || u.Username || '',
      email: u.email || u.Email || '',
      roleId: u.roleId || u.RoleId || 3,
      isActive: u.isActive ?? u.IsActive ?? true,
    });
    setShowModal(true);
  };

  // Đóng modal cập nhật
  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
    setEditForm({ username: '', email: '', roleId: 2, isActive: true });
  };

  // Xử lý thay đổi form cập nhật
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Xác nhận cập nhật
  const handleConfirmUpdate = async () => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/ManageUserAccounts/${editUser.userId || editUser.UserId || editUser.id}`, {
        username: editForm.username,
        email: editForm.email,
        roleId: Number(editForm.roleId),
        isActive: editForm.isActive,
      });
      setSuccess('Cập nhật tài khoản thành công.');
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setError('Cập nhật tài khoản thất bại.');
    }
  };

  // Mở modal tạo tài khoản mới
  const handleOpenCreateModal = () => {
    setCreateForm({ username: '', email: '', password: '', roleId: 3, isActive: true });
    setCreateErrors({});
    setShowCreateModal(true);
  };

  // Đóng modal tạo tài khoản mới
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateErrors({});
  };

  // Xử lý thay đổi form tạo tài khoản mới
  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Validate form tạo tài khoản
  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.username.trim()) errors.username = 'Tên đăng nhập không được để trống';
    if (!createForm.password || createForm.password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!createForm.email.trim()) errors.email = 'Email không được để trống';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(createForm.email)) errors.email = 'Email không hợp lệ';
    return errors;
  };

  // Xác nhận tạo tài khoản mới
  const handleConfirmCreate = async () => {
    const errors = validateCreateForm();
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError('');
    setSuccess('');
    try {
      await api.post('/ManageUserAccounts', {
        username: createForm.username,
        email: createForm.email,
        password: createForm.password,
        roleId: Number(createForm.roleId),
        isActive: createForm.isActive,
      });
      setSuccess('Tạo tài khoản thành công.');
      handleCloseCreateModal();
      fetchUsers();
    } catch (err) {
      setError('Tạo tài khoản thất bại.');
    }
  };

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <main className="container my-5">
        <div className="alert alert-danger text-center mt-5">
          Bạn không có quyền truy cập trang này.
        </div>
      </main>
    );
  }

  return (
    <main className="container my-5" style={{ minHeight: '80vh' }}>
      <h1 className="text-center mb-4 text-danger">
        <i className="fa-solid fa-gauge-high me-2"></i>
        Trang quản trị hệ thống hiến máu
      </h1>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Danh sách người dùng</h3>
        <button className="btn btn-success" onClick={handleOpenCreateModal}>
          <i className="fa fa-plus me-2"></i> Tạo tài khoản mới
        </button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover bg-white">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th className="text-center">Trạng thái hoạt động</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">Không có người dùng nào.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId || u.UserId || u.id}>
                    <td>{u.userId || u.UserId || u.id}</td>
                    <td>{u.username || u.Username || u.name || u.fullName || '---'}</td>
                    <td>{u.email || u.Email}</td>
                    <td>
                      {roleIdToName[u.roleId || u.RoleId] || u.role || u.Role || '---'}
                    </td>
                    <td className="text-center">
                      {(u.isActive ?? u.IsActive)
                        ? <i className="fa fa-check" style={{ color: 'green', fontWeight: 'bold' }}></i>
                        : <i className="fa fa-times" style={{ color: 'red', fontWeight: 'bold' }}></i>
                      }
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleUpdate(u)}
                      >
                        Cập nhật
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.userId || u.UserId || u.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) }
            </tbody>
          </table>
        </div>
      )}
      {/* Modal cập nhật tài khoản */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: 24, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
          }}>
            <h4>Cập nhật tài khoản</h4>
            <div className="mb-3">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={editForm.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={editForm.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>Vai trò</label>
              <select
                className="form-control"
                name="roleId"
                value={editForm.roleId}
                onChange={handleChange}
              >
                <option value={1}>Admin</option>
                <option value={2}>Staff</option>
                <option value={3}>Member</option>
              </select>
            </div>
            <div className="mb-3">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={editForm.isActive}
                  onChange={handleChange}
                  style={{ marginRight: 8 }}
                />
                Đang hoạt động
              </label>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={handleCloseModal}>Hủy</button>
              <button className="btn btn-primary" onClick={handleConfirmUpdate}>Cập nhật</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal tạo tài khoản mới */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: 24, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
          }}>
            <h4>Tạo tài khoản mới</h4>
            <div className="mb-3">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={createForm.username}
                onChange={handleCreateChange}
              />
              {createErrors.username && <div style={{ color: 'red', fontSize: 13 }}>{createErrors.username}</div>}
            </div>
            <div className="mb-3">
              <label>Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={createForm.password}
                onChange={handleCreateChange}
              />
              {createErrors.password && <div style={{ color: 'red', fontSize: 13 }}>{createErrors.password}</div>}
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={createForm.email}
                onChange={handleCreateChange}
              />
              {createErrors.email && <div style={{ color: 'red', fontSize: 13 }}>{createErrors.email}</div>}
            </div>
            <div className="mb-3">
              <label>Vai trò</label>
              <select
                className="form-control"
                name="roleId"
                value={createForm.roleId}
                onChange={handleCreateChange}
              >
                <option value={1}>Admin</option>
                <option value={2}>Staff</option>
                <option value={3}>Member</option>
              </select>
            </div>
            <div className="mb-3">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={createForm.isActive}
                  onChange={handleCreateChange}
                  style={{ marginRight: 8 }}
                />
                Đang hoạt động
              </label>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={handleCloseCreateModal}>Hủy</button>
              <button className="btn btn-primary" onClick={handleConfirmCreate}>Tạo tài khoản</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DashboardPage;