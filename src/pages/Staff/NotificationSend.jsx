// src/pages/Staff/NotificationSend.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Api';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/Header/Header'; // THÊM Header
import Navbar from '../../components/Navbar/Navbar'; // THÊM Navbar
import Footer from '../../components/Footer/Footer'; // THÊM Footer
// import './NotificationSend.css'; // Tạo NotificationSend.css nếu bạn muốn style riêng biệt

const NOTIFICATION_TYPES = [
    { value: '', label: 'Chọn loại thông báo' },
    { value: 'Chung', label: 'Thông báo chung (gửi tới tất cả)' },
    { value: 'Don', label: 'Thông báo đơn (gửi tới một người dùng)' },
    { value: 'Emergency', label: 'Thông báo khẩn cấp' } 
];

const roleOptions = [
    { value: 'Admin', label: 'Quản trị viên' },
    { value: 'Staff', label: 'Nhân viên' },
    { value: 'Member', label: 'Người hiến máu' },
    { value: 'User', label: 'Người dùng' }, 
];

function UserTable({ users, onSend, sendingUserId, formMessage, notificationType, usersLoading, usersError }) { 
    return (
        <div className="user-table-container table-responsive shadow-sm rounded-lg">
            {usersLoading ? (
                <div className="text-center py-4">
                    <LoadingSpinner />
                    <p className="mt-2">Đang tải danh sách người dùng...</p>
                </div>
            ) : usersError ? (
                <div className="alert alert-danger text-center">{usersError}</div>
            ) : (
                <table className="table table-bordered table-striped table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th className="text-center">Trạng thái</th>
                            <th>Gửi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted py-3">Không có user nào trong hệ thống.</td>
                            </tr>
                        ) : (
                            users.map(u => (
                                <tr key={u.userId}>
                                    <td>{u.userId}</td>
                                    <td>{u.username || u.email || '---'}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        {roleOptions.find(r => r.value.toLowerCase() === (u.role || '').toLowerCase())?.label || u.role || '---'}
                                    </td>
                                    <td className="text-center">
                                        {(u.isActive === true || u.IsActive === true)
                                            ? <i className="fas fa-check-circle" style={{ color: 'green', fontSize: '1.2rem' }}></i> :
                                            <i className="fas fa-times-circle" style={{ color: 'red', fontSize: '1.2rem' }}></i>
                                        }
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-success btn-sm"
                                            disabled={!formMessage || sendingUserId === u.userId || (notificationType !== 'Don' && notificationType !== 'Emergency')}
                                            onClick={() => onSend(u.userId)}
                                        >
                                            {sendingUserId === u.userId ? 'Đang gửi...' : 'Gửi'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function NotificationSend() { 
    const { user, isAdmin, isStaff, isAuthenticated } = useAuth(); 
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ 
        message: '',
        type: '', 
        recipientUserId: '', 
        sentDate: new Date().toISOString().slice(0, 16),
    });
    const [loadingUsers, setLoadingUsers] = useState(false); 
    const [submitting, setSubmitting] = useState(false); 
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); 
    const [fieldErrors, setFieldErrors] = useState({}); 
    const [sendingUserId, setSendingUserId] = useState(''); 
    const [personalSendStatus, setPersonalSendStatus] = useState(''); // MỚI: Trạng thái gửi thông báo cá nhân
    const navigate = useNavigate(); 

    const fetchUsersForSelection = useCallback(async () => {
        if (isAuthenticated && (formData.type === 'Don' || formData.type === 'Emergency')) { 
            setLoadingUsers(true);
            setError('');
            try {
                const res = await api.get('/ManageUserAccounts'); 
                setUsers(res.data || []);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        } else {
            setUsers([]); 
            setLoadingUsers(false);
        }
    }, [formData.type, isAuthenticated]); 

    useEffect(() => {
        fetchUsersForSelection();
    }, [fetchUsersForSelection]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' })); 
        setError(''); 
        setMessage(''); 
        setPersonalSendStatus(''); 
    };

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        setFormData(prev => ({
            ...prev,
            type: selectedType,
            recipientUserId: selectedType === 'Chung' ? 'ALL' : '' 
        }));
        setFieldErrors(prev => ({ ...prev, type: '', recipientUserId: '' })); 
    };

    const validateForm = useCallback(() => {
        const errors = {};
        if (!formData.message.trim()) {
            errors.message = 'Nội dung thông báo không được để trống.';
        }
        if (!formData.type) {
            errors.type = 'Vui lòng chọn loại thông báo.';
        } else if ((formData.type === 'Don' || formData.type === 'Emergency') && !formData.recipientUserId) { 
            errors.recipientUserId = `Vui lòng chọn người nhận cho thông báo ${formData.type === 'Don' ? 'đơn' : 'khẩn cấp'}.`;
        }
        if (formData.sentDate && new Date(formData.sentDate) > new Date()) {
            errors.sentDate = 'Ngày gửi không được trong tương lai.';
        }
        return errors;
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setMessage('');
        setPersonalSendStatus(''); 
        
        const errors = validateForm();
        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            setError('Vui lòng kiểm tra lại các thông tin bị lỗi.');
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                recipientUserId: formData.recipientUserId,
                message: formData.message.trim(),
                type: formData.type.trim(),
                sentDate: formData.sentDate ? new Date(formData.sentDate).toISOString() : null, 
                isRead: false 
            };

            await api.post('/Notification', payload);
            setMessage('Thông báo đã được gửi thành công!');
            setFormData({ 
                message: '',
                type: '', 
                recipientUserId: '', 
                sentDate: new Date().toISOString().slice(0, 16),
            });
            setFieldErrors({}); 
            
            // Điều hướng về trang danh sách thông báo sau khi gửi thành công
            setTimeout(() => navigate('/staff/dashboard'), 1500); 

        } catch (err) {
            console.error("Error sending notification:", err.response || err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); 
            } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Bạn không có quyền gửi thông báo.');
            } else {
                setError('Đã xảy ra lỗi khi gửi thông báo. Vui lòng thử lại.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendToUser = async (userId) => {
        setSendingUserId(userId);
        setPersonalSendStatus(''); 
        setError(''); 
        setMessage(''); 
        
        if (!formData.message.trim()) {
            setPersonalSendStatus('Lỗi: Nội dung thông báo không được để trống.');
            setSendingUserId('');
            return;
        }
        if (formData.type !== 'Don' && formData.type !== 'Emergency') {
            setPersonalSendStatus('Lỗi: Chỉ có thể gửi thông báo cá nhân khi loại là "Đơn" hoặc "Khẩn cấp".');
            setSendingUserId('');
            return;
        }
        
        try {
            const payload = {
                recipientUserId: userId,
                message: formData.message.trim(),
                type: formData.type.trim(), 
                sentDate: formData.sentDate ? new Date(formData.sentDate).toISOString() : null,
                isRead: false
            };
            await api.post('/Notification', payload);
            setPersonalSendStatus(`Đã gửi thông báo cho user ${userId} thành công!`);
        } catch (err) {
            console.error("Error sending personal notification:", err.response || err);
            setPersonalSendStatus(`Gửi thông báo cho user ${userId} thất bại: ${err.response?.data?.message || err.message || 'Lỗi không xác định.'}`);
        } finally {
            setSendingUserId('');
        }
    };

    if (loadingUsers || submitting) { 
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-primary">
                <LoadingSpinner />
                <p className="mt-3">{loadingUsers ? 'Đang tải danh sách người dùng...' : 'Đang gửi thông báo...'}</p>
            </div>
        );
    }

    if (!isAuthenticated || (!isAdmin && !isStaff)) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-danger text-center">
          <h2 className="mb-3">Bạn không có quyền truy cập chức năng này.</h2>
          <p className="lead">Chỉ quản trị viên hoặc nhân viên mới có thể tạo thông báo.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>Đăng nhập</button>
        </div>
      );
    }

    return (
        <div className="page-wrapper">
            <Header />
            <Navbar />
            <main className="container my-5 notification-send-form-main"> 
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/staff/notifications')} // Nút Quay lại
                    >
                        &larr; Quay lại quản lý thông báo
                    </button>
                    <h1 className="mb-0 text-primary">Tạo thông báo mới</h1> {/* SỬA ĐỔI: Chuyển h1 vào đây */}
                    <div></div> {/* Element rỗng để căn chỉnh nếu cần */}
                </div>
                
                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}
                {personalSendStatus && ( 
                    <div className={`alert ${personalSendStatus.startsWith('Đã gửi') ? 'alert-success' : 'alert-danger'} mt-3`}>
                        {personalSendStatus}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="type" className="form-label">Loại thông báo <span style={{color:'red'}}>*</span></label>
                        <select
                            className={`form-select ${fieldErrors.type ? 'is-invalid' : ''}`}
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleTypeChange}
                            disabled={submitting}
                        >
                            {NOTIFICATION_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        {fieldErrors.type && <div className="invalid-feedback">{fieldErrors.type}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="message" className="form-label">Nội dung thông báo <span style={{color:'red'}}>*</span></label>
                        <textarea
                            className={`form-control ${fieldErrors.message ? 'is-invalid' : ''}`}
                            id="message"
                            name="message"
                            rows="4"
                            value={formData.message}
                            onChange={handleChange}
                            disabled={submitting}
                            placeholder="Nhập nội dung thông báo..."
                        ></textarea>
                        {fieldErrors.message && <div className="invalid-feedback">{fieldErrors.message}</div>}
                    </div>
                    
                    <div className="mb-3">
                        <label htmlFor="sentDate" className="form-label">Ngày và giờ gửi</label>
                        <input
                            type="datetime-local"
                            className={`form-control ${fieldErrors.sentDate ? 'is-invalid' : ''}`}
                            id="sentDate"
                            name="sentDate"
                            value={formData.sentDate}
                            onChange={handleChange}
                            disabled={submitting}
                        />
                        {fieldErrors.sentDate && <div className="invalid-feedback">{fieldErrors.sentDate}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-4" disabled={submitting}>
                        {submitting ? 'Đang gửi...' : 'Gửi thông báo (Chung/Theo Loại)'}
                    </button>
                </form>

                {(formData.type === 'Don' || formData.type === 'Emergency') && (
                    <>
                        <h5 className="mt-5 text-center text-secondary">Chọn người dùng cụ thể để gửi thông báo</h5>
                        <div className="mb-3">
                            <label htmlFor="selectRecipientUserId" className="form-label">Chọn người nhận từ danh sách <span style={{color:'red'}}>*</span></label>
                            <select
                                className={`form-select ${fieldErrors.recipientUserId ? 'is-invalid' : ''}`}
                                id="selectRecipientUserId"
                                name="recipientUserId" 
                                value={formData.recipientUserId}
                                onChange={handleChange}
                                disabled={submitting || loadingUsers} 
                            >
                                <option value="">-- Chọn User ID --</option>
                                {loadingUsers ? (
                                    <option value="" disabled>Đang tải danh sách người dùng...</option>
                                ) : users.length === 0 ? (
                                    <option value="" disabled>Không có user nào phù hợp.</option>
                                ) : (
                                    users.map(u => (
                                        <option key={u.userId} value={u.userId}>
                                            {u.username || u.email} ({u.userId}) - {roleOptions.find(r => r.value.toLowerCase() === (u.role || '').toLowerCase())?.label || u.role}
                                        </option>
                                    ))
                                )}
                            </select>
                            {fieldErrors.recipientUserId && <div className="invalid-feedback">{fieldErrors.recipientUserId}</div>}
                        </div>

                        <h5 className="mt-5 text-center text-secondary">Hoặc gửi thông báo tới từng người trong danh sách dưới đây</h5>
                        <UserTable
                            users={users}
                            onSend={handleSendToUser}
                            sendingUserId={sendingUserId}
                            formMessage={formData.message} 
                            notificationType={formData.type} 
                            usersLoading={loadingUsers} 
                            usersError={error} 
                        />
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default NotificationSend;