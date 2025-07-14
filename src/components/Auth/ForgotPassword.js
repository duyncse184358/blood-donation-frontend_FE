import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/Api'; // Import trực tiếp từ Api.js
import LoadingSpinner from '../Shared/LoadingSpinner';
import { Mail, Key } from 'lucide-react';
import '../../styles/Auth.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [step, setStep] = useState(1); // 1: Gửi email, 2: Nhập OTP & Đặt lại mật khẩu

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.post('/resetpassword/send-otp', { email });
            setMessage(response.data.message || 'Mã OTP đã được gửi thành công.');
            setStep(2); // Chuyển sang bước nhập OTP
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra email và thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (newPassword !== confirmNewPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/resetpassword/reset', {
                email,
                otp: otpCode,
                newPassword,
                confirmNewPassword,
            });
            setMessage(response.data.message || 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.');
            setStep(1); // Quay lại bước đầu tiên sau khi đặt lại mật khẩu thành công
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại OTP hoặc thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-container">
            <div className="auth-card-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2 className="auth-title">Quên mật khẩu</h2>
                        <p className="auth-subtitle">
                            {step === 1 ? 'Nhập email của bạn để nhận mã OTP' : 'Nhập mã OTP và mật khẩu mới của bạn'}
                        </p>
                    </div>
                    <div className="auth-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        {message && <div className="alert alert-success">{message}</div>}

                        <form onSubmit={step === 1 ? handleRequestReset : handleResetPassword} className="auth-form-body">
                            {step === 1 ? (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><Mail size={18} /></span>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder="Nhập địa chỉ email của bạn"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? <LoadingSpinner /> : 'Gửi mã OTP'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="otpCode" className="form-label">Mã OTP</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><Key size={18} /></span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="otpCode"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                required
                                                placeholder="Nhập mã OTP nhận được"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="newPassword" className="form-label">Mật khẩu mới</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><Key size={18} /></span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                placeholder="Nhập mật khẩu mới"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmNewPassword" className="form-label">Xác nhận mật khẩu mới</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><Key size={18} /></span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmNewPassword"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                required
                                                placeholder="Xác nhận mật khẩu mới"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? <LoadingSpinner /> : 'Đặt lại mật khẩu'}
                                    </button>
                                </>
                            )}
                        </form>

                        <div className="mt-3 text-center">
                            <Link to="/login">Quay lại Đăng nhập</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ForgotPassword;
