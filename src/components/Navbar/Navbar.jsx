import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { User, LogOut, Settings, Bell, Heart, Edit } from 'lucide-react';
import ProfileUpdate from '../../pages/Member/ProfileUpdate'; // Import component cập nhật hồ sơ

import './Navbar.css';

function Navbar() {
    const { isAuthenticated, logout, user, isAdmin, isStaff, isMember } = useAuth();
    const navigate = useNavigate();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const profileMenuRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsProfileMenuOpen(false);
        navigate('/login');
    };

    const handleViewProfile = () => {
        setIsProfileMenuOpen(false);
        setShowProfileModal(true);
    };

    const handleUpdateProfile = () => {
        setIsProfileMenuOpen(false);
        setShowProfileModal(true);
    };

    const handleViewNotifications = () => {
        // Điều hướng đến trang thông báo
        navigate('/notifications');
    };

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Helper để hiển thị vai trò tiếng Việt
    const getUserRoleDisplay = () => {
        if (!user || !user.role) return '';
        switch (user.role) {
            case 'Member':
                return 'Người hiến máu';
            case 'Admin':
                return 'Quản trị viên';
            case 'Staff':
                return 'Nhân viên';
            default:
                return '';
        }
    };

    return (
        <>
            <nav className="navbar-custom">
                <div className="navbar-container">
                    {/* Brand/Logo Section */}
                    <div className="navbar-brand">
                        <Heart size={24} color="#F8D347" fill="#F8D347" className="brand-icon" />
                        <Link to="/" className="brand-text">Hiến Máu Nhân Ái</Link>
                    </div>

                    {/* Main Navigation Links */}
                    <ul className="nav-links">
                        <li><Link to="/" className="nav-item-link">Trang chủ</Link></li>
                        <li><Link to="/blog" className="nav-item-link">Blog</Link></li>
                        <li><Link to="/docs" className="nav-item-link">Tài liệu hiến máu</Link></li>
                        {isAdmin && (
                            <li><Link to="/admin/dashboard" className="nav-item-link">Dashboard Admin</Link></li>
                        )}
                        {isStaff && (
                            <li><Link to="/staff/dashboard" className="nav-item-link">Dashboard Nhân viên</Link></li>
                        )}
                        {isMember && (
                            <li><Link to="/member/dashboard" className="nav-item-link">Dashboard Thành viên</Link></li>
                        )}
                    </ul>

                    {/* User Actions */}
                    <div className="navbar-actions-right">
                        {isAuthenticated ? (
                            <>
                                {/* Notification Bell */}
                                <button
                                    className="notification-bell-button"
                                    onClick={handleViewNotifications}
                                    aria-label="Thông báo của tôi"
                                >
                                    <Bell size={24} color="#fff" />
                                    <span className="notification-badge">2</span>
                                </button>

                                {/* User Profile Dropdown */}
                                <div
                                    className={`user-profile-wrapper${isProfileMenuOpen ? ' open' : ''}`}
                                    ref={profileMenuRef}
                                >
                                    <button
                                        className="user-profile-button"
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        aria-expanded={isProfileMenuOpen}
                                        aria-label="Menu người dùng"
                                    >
                                        <User size={24} color="#dc3545" fill="#dc3545" className="user-icon" />
                                        <div className="user-info">
                                            <span className="user-name">{user.username || user.email || 'Nguyễn Văn A'}</span>
                                            <span className="user-role">({getUserRoleDisplay()})</span>
                                        </div>
                                    </button>
                                    {isProfileMenuOpen && (
                                        <div className="profile-dropdown-menu">
                                            <button onClick={handleViewProfile} className="dropdown-item">
                                                <Settings size={18} className="me-2" /> Hồ sơ của tôi
                                            </button>
                                            
                                            <button onClick={handleLogout} className="dropdown-item">
                                                <LogOut size={18} className="me-2" /> Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="btn-login">Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </nav>
            {/* Modal cập nhật hồ sơ */}
            {showProfileModal && (
                <div className="modal show fade" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Cập nhật hồ sơ cá nhân</h5>
                                <button type="button" className="btn-close" onClick={() => setShowProfileModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <ProfileUpdate onSuccess={() => setShowProfileModal(false)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;