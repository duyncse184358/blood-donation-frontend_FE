import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../Shared/LoadingSpinner';
import '../../styles/Auth.css';
import './../../styles/Login.css';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../services/Api'; // Thêm dòng này

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await login(email, password);

            console.log('Login Component Debug: User role after successful login:', response.user?.role);

            if (response.user && response.user.role === 'Admin') {
                navigate('/admin/dashboard');
            } else if (response.user && response.user.role === 'Staff') {
                navigate('/staff/dashboard');
            } else if (response.user && response.user.role === 'Member') {
                // Kiểm tra đã có profile chưa
                try {
                    await api.get(`/UserProfile/by-user/${response.user.userId}`);
                    // Nếu có profile, vào dashboard
                    navigate('/member/dashboard');
                } catch {
                    // Nếu chưa có profile, vào trang nhập hồ sơ
                    navigate('/member/profile');
                }
            } else {
                console.warn('Login Component Debug: Unknown role or no specific role match, navigating to home page.');
                navigate('/');
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            setError(errorMessage);
            console.error('Login failed in component:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-container">
            <div className="login-card">
                <div className="login-card-header">
                    <Heart size={60} className="login-heart-icon" />
                    <h3 className="login-brand-text">Hiến Máu Nhân Ái</h3>
                    <h2 className="login-title">Đăng nhập</h2>
                    <p className="login-subtitle">Chào mừng bạn trở lại! Hãy đăng nhập để tiếp tục.</p>
                </div>
                <div className="login-card-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit} className="login-form-body">
                        {/* Email Input Group */}
                        <div className="form-group-input">
                            <label htmlFor="email" className="input-label">Email</label>
                            <div className="input-with-icon">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    className="form-control-custom"
                                    id="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input Group */}
                        <div className="form-group-input">
                            <label htmlFor="password" className="input-label">Mật khẩu</label>
                            <div className="input-with-icon">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"} // Toggle type based on state
                                    className="form-control-custom"
                                    id="password"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="forgot-password-link">
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? <LoadingSpinner /> : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="register-link-container">
                        Chưa có tài khoản? <Link to="/register" className="register-link">Đăng ký ngay</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;