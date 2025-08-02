import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';

const roleOptions = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Staff' },
  { value: 3, label: 'Member' },
];

function ManageUserAccount() {
  const { user, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    roleId: 3,
    isActive: true,
  });

  // Modal tạo tài khoản mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    roleId: 3,
    isActive: true,
  });
  const [createErrors, setCreateErrors] = useState({});

  // Lấy danh sách tài khoản
  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/ManageUserAccounts');
      setAccounts(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách tài khoản.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setLoading(false);
      setError('Bạn cần đăng nhập để quản lý User.');
      return;
    }
    fetchAccounts();
    // eslint-disable-next-line
  }, [isAuthenticated, user]);

  // Vô hiệu hóa tài khoản
  const handleDeactivate = async (id) => {
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa tài khoản này?')) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/ManageUserAccounts/${id}`, { isActive: false });
      setSuccess('Vô hiệu hóa tài khoản thành công.');
      fetchAccounts();
    } catch (err) {
      setError('Vô hiệu hóa tài khoản thất bại.');
    }
  };

  // Mở modal cập nhật
  const handleOpenEdit = (acc) => {
    setEditAccount(acc);
    setEditForm({
      username: acc.username || acc.name || acc.fullName || '',
      email: acc.email || '',
      roleId: acc.roleId || acc.RoleId || 3,
      isActive: acc.isActive !== undefined ? acc.isActive : true,
    });
    setShowModal(true);
  };

  // Đóng modal cập nhật
  const handleCloseModal = () => {
    setShowModal(false);
    setEditAccount(null);
    setEditForm({ username: '', email: '', roleId: 3, isActive: true });
  };

  // Xử lý thay đổi form cập nhật
  const handleEditChange = (e) => {
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
      await api.put(`/ManageUserAccounts/${editAccount.id}`, {
        username: editForm.username,
        email: editForm.email,
        roleId: Number(editForm.roleId),
        isActive: editForm.isActive,
      });
      setSuccess('Cập nhật tài khoản thành công.');
      handleCloseModal();
      fetchAccounts();
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

  // Xử lý thay đổi form tạo tài khoản
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
    if (!createForm.password || createForm.password.length < 8) errors.password = 'Mật khẩu tối thiểu 8 ký tự';
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
      fetchAccounts();
    } catch (err) {
      // Nếu BE trả về lỗi trùng username (SqlException hoặc message liên quan)
      if (
        typeof err?.response?.data === 'string' &&
        err.response.data.includes('duplicate key')
      ) {
        setCreateErrors(prev => ({
          ...prev,
          username: 'Tên đăng nhập đã tồn tại.'
        }));
        setError('');
        return;
      }
      if (
        err?.response?.data?.message &&
        err.response.data.message.includes('duplicate key')
      ) {
        setCreateErrors(prev => ({
          ...prev,
          username: 'Tên đăng nhập đã tồn tại.'
        }));
        setError('');
        return;
      }
      // Nếu BE trả về lỗi email đã tồn tại
      if (
        typeof err?.response?.data === 'string' &&
        err.response.data.includes('Email')
      ) {
        setCreateErrors(prev => ({
          ...prev,
          email: err.response.data
        }));
        setError('');
        return;
      }
      if (
        err?.response?.data?.message &&
        err.response.data.message.includes('Email')
      ) {
        setCreateErrors(prev => ({
          ...prev,
          email: err.response.data.message
        }));
        setError('');
        return;
      }
      setError('Tạo tài khoản thất bại.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý tài khoản người dùng</h2>
        <button className="btn btn-success" onClick={handleOpenCreateModal}>
          <i className="fa fa-plus me-2"></i> Tạo tài khoản mới
        </button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', background: '#fff' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th className="text-center">Hoạt động</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="6">Không có tài khoản nào.</td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id}>
                  <td>{acc.id}</td>
                  <td>{acc.username || acc.name || acc.fullName || '---'}</td>
                  <td>{acc.email}</td>
                  <td>
                    {roleOptions.find(r => r.value === (acc.roleId || acc.RoleId))?.label || acc.role || '---'}
                  </td>
                  <td className="text-center">
                    {(acc.isActive ?? acc.IsActive)
                      ? <i className="fa fa-check" style={{ color: 'green', fontWeight: 'bold' }}></i>
                      : <i className="fa fa-times" style={{ color: 'red', fontWeight: 'bold' }}></i>
                    }
                  </td>
                  <td>
                    <button
                      style={{ marginRight: 8 }}
                      onClick={() => handleOpenEdit(acc)}
                    >
                      Cập nhật
                    </button>
                    <button onClick={() => handleDeactivate(acc.id)} style={{ color: 'orange' }}>
                      Vô hiệu hóa
                    </button>
                  </td>
                </tr>
              ))
            )};
          </tbody>
        </table>
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
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-3">
              <label>Vai trò</label>
              <select
                className="form-control"
                name="roleId"
                value={editForm.roleId}
                onChange={handleEditChange}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={editForm.isActive}
                  onChange={handleEditChange}
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
              {/* Hiển thị lỗi tổng nếu có liên quan đến username */}
              {error && error.includes('User name') && (
                <div style={{ color: 'red', fontSize: 13 }}>{error}</div>
              )}
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
              <label>Vai trò</label>
              <select
                className="form-control"
                name="roleId"
                value={createForm.roleId}
                onChange={handleCreateChange}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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
              <button className="btn btn-primary" onClick={handleConfirmCreate}>Tạo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUserAccount;