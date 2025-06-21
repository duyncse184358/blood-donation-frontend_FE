import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, sendOtpForRegistration } from '../../services/authService';
import LoadingSpinner from '../Shared/LoadingSpinner';
import { Heart } from 'lucide-react'; // Make sure Heart is imported
import '../../styles/Auth.css';
import './../../styles/Register.css'; // Import the new Register.css
import { AuthContext } from '../../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otpCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOtpRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Reset OTP status if re-sending
    setOtpSent(false);
    setCountdown(0);

    try {
      if (!formData.email) {
        throw new Error("Vui lòng nhập địa chỉ email.");
      }
      const responseMessage = await sendOtpForRegistration(formData.email);
      setMessage(responseMessage + " Vui lòng kiểm tra email của bạn.");
      setOtpSent(true);
      setCountdown(300); // 5 phút = 300 giây
    } catch (err) {
      setError(err.message || 'Gửi OTP thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      setMessage('Đăng ký thành công!');
      await login(formData.email, formData.password);
      navigate('/member/profile');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin và OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <Heart size={48} className="lucide-icon" /> {/* Using lucide-icon class */}
            <h2 className="auth-title">Đăng ký thành viên</h2>
            <p className="auth-subtitle">
              {otpSent ? 'Xác minh email của bạn với mã OTP và tạo tài khoản.' : 'Tham gia cộng đồng của chúng tôi để hiến máu cứu người.'}
            </p>
          </div>
          <div className="auth-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={otpSent ? handleSubmitRegistration : handleSendOtpRequest} className="auth-form-body">
              {!otpSent ? (
                // Bước 1: Nhập thông tin và gửi OTP
                <>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Tên người dùng</label>
                    <input
                      type="text"
                      className="form-control" // Keep form-control, but Register.css overrides it
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control" // Keep form-control
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      className="form-control" // Keep form-control
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      className="form-control" // Keep form-control
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? <LoadingSpinner /> : 'Đăng ký và gửi OTP'}
                  </button>
                </>
              ) : (
                // Bước 2: Nhập OTP và hoàn tất đăng ký
                <>
                  <p className="text-center text-muted">Mã OTP đã được gửi đến <strong>{formData.email}</strong>. Vui lòng kiểm tra email của bạn.</p>
                  <div className="mb-3">
                    <label htmlFor="otpCode" className="form-label">Mã OTP</label>
                    <input
                      type="text"
                      className="form-control" // Keep form-control
                      id="otpCode"
                      name="otpCode"
                      value={formData.otpCode}
                      onChange={handleChange}
                      placeholder="Nhập mã OTP"
                      required
                      disabled={loading || countdown === 0}
                    />
                  </div>
                  <div className="otp-countdown-wrapper">
                      <span className={countdown === 0 ? "otp-countdown-text expired" : "otp-countdown-text"}>
                        Mã OTP hết hạn sau: {formatTime(countdown)}
                      </span>
                      <button
                        type="button"
                        className="btn-link-resend-otp"
                        onClick={handleSendOtpRequest}
                        disabled={loading || countdown > 0}
                      >
                        Gửi lại OTP
                      </button>
                  </div>
                  <button type="submit" className="btn btn-success w-100" disabled={loading || countdown === 0}>
                    {loading ? <LoadingSpinner /> : 'Hoàn tất Đăng ký'}
                  </button>
                </>
              )}
            </form>

            <div className="mt-3 text-center">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;