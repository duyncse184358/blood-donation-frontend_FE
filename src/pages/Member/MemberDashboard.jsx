import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { User, Heart, Activity, Bell, MailCheck, Clock, AlertCircle } from 'lucide-react';
// Đảm bảo đường dẫn và tên file này chính xác
import './Memberdashboard.css'; 
import ProfileUpdate from './ProfileUpdate';

function MemberDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch notifications for the user
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      const fetchNotifications = async () => {
        setNotifLoading(true);
        setNotifError('');
        try {
          const res = await api.get(`/Notifications/by-user/${user.userId}`);
          setNotifications(res.data);
        } catch (err) {
          console.error("Error fetching notifications:", err);
          setNotifications([]);
          setNotifError('Không thể tải thông báo. Vui lòng thử lại sau.');
        } finally {
          setNotifLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [isAuthenticated, user?.userId]);

  // Debugging logs for Auth state
  useEffect(() => {
    console.log("MemberDashboard Debug: Component rendered.");
    console.log("MemberDashboard Debug: isAuthenticated:", isAuthenticated);
    console.log("MemberDashboard Debug: user object:", user);
    console.log("MemberDashboard Debug: authLoading state:", authLoading);
  }, [user, isAuthenticated, authLoading]);

  // Show loading spinner while authentication state is being determined
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#dc3545' }}>
        Đang tải thông tin người dùng...
      </div>
    );
  }

  // Redirect if not authenticated or not a Member
  if (!isAuthenticated || user?.role?.toLowerCase() !== 'member') {
    console.warn("MemberDashboard: Unauthorized access attempt or incorrect role.");
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
        Bạn không có quyền truy cập trang này.
        <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>Đăng nhập</button>
      </div>
    );
  }

  // Classify notifications
  const emergencyNotifs = notifications.filter(n => n.isEmergency || n.type === 'emergency');
  const normalNotifs = notifications.filter(n => !n.isEmergency && n.type !== 'emergency');
  const unreadNormalNotifsCount = normalNotifs.filter(n => !n.isRead).length;

  return (
    <div className="member-dashboard-wrapper">
      {/* KHÔNG CÒN THẺ <style> TẠI ĐÂY NỮA */}
      <Header />
      <Navbar />
      <main className="container my-5 member-dashboard-main">
        <h1 className="dashboard-header">
          Chào mừng {user?.username || user?.email || 'Thành viên'} đến với Trang tổng quan!
        </h1>

        {/* Notification Cards Section */}
        <div className="row g-4 notification-cards-section">
          {/* Emergency Notification Card */}
          <div className="col-12 col-md-6">
            {notifLoading ? (
              <div className="notification-card-base emergency-notification-card">
                <div className="content">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang tải thông báo khẩn cấp...
                </div>
              </div>
            ) : notifError ? (
              <div className="notification-card-base emergency-notification-card">
                <div className="content">
                  <div className="title">Lỗi tải thông báo</div>
                  <div className="description">{notifError}</div>
                </div>
              </div>
            ) : emergencyNotifs.length > 0 ? (
              <Link to="/notifications?type=emergency" className="notification-card-base emergency-notification-card">
                <div className="icon-wrapper">
                  <AlertCircle />
                </div>
                <div className="content">
                  <div className="title">THÔNG BÁO KHẨN CẤP</div>
                  <div className="description">Có {emergencyNotifs.length} thông báo khẩn cấp mới!</div>
                </div>
                <span className="detail-button">Xem chi tiết</span>
              </Link>
            ) : (
              <div className="notification-card-base emergency-notification-card" style={{ opacity: 0.7 }}>
                <div className="icon-wrapper">
                  <AlertCircle />
                </div>
                <div className="content">
                  <div className="title">THÔNG BÁO KHẨN CẤP</div>
                  <div className="description">Hiện không có thông báo khẩn cấp nào.</div>
                </div>
                <button className="detail-button" onClick={() => navigate('/notifications?type=emergency')}>Xem chi tiết</button>
              </div>
            )}
          </div>

          {/* General Notification Card */}
          <div className="col-12 col-md-6">
            {notifLoading ? (
              <div className="notification-card-base general-notification-card">
                <div className="content">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang tải thông báo chung...
                </div>
              </div>
            ) : notifError ? (
              <div className="notification-card-base general-notification-card">
                <div className="content">
                  <div className="title">Lỗi tải thông báo</div>
                  <div className="description">{notifError}</div>
                </div>
              </div>
            ) : (
              <Link to="/notifications" className="notification-card-base general-notification-card">
                <div className="icon-wrapper">
                  <Bell />
                </div>
                <div className="content">
                  <div className="title">Thông báo</div>
                  <div className="description">Bạn có {unreadNormalNotifsCount} thông báo chưa đọc.</div>
                </div>
                <span className="detail-button">Xem chi tiết</span>
              </Link>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="container feature-card-grid mb-5">
          {/* Using row-cols-md-3 and row-cols-lg-3 for a 2x3 grid layout as per screenshot */}
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-3 g-4">
            {/* Cập nhật hồ sơ cá nhân */}
            <div className="col">
              <Link to="/member/profile" className="feature-card h-100 d-flex flex-column profile">
                <div className="feature-icon-circle">
                  <User />
                </div>
                <h5 className="feature-card-title">Cập nhật hồ sơ cá nhân</h5>
                <p className="feature-card-text flex-grow-1">Quản lý thông tin: nhóm máu, địa chỉ, CCCD, điện thoại, tình trạng sức khỏe.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Đăng ký sẵn sàng hiến máu */}
            <div className="col">
              <Link to="/member/register-donation" className="feature-card h-100 d-flex flex-column donate">
                <div className="feature-icon-circle">
                  <Heart />
                </div>
                <h5 className="feature-card-title">Đăng ký sẵn sàng hiến máu</h5>
                <p className="feature-card-text flex-grow-1">Đăng ký ngày sẵn sàng hiến máu, nhóm máu, thành phần hiến.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Xem lịch sử hiến máu */}
            <div className="col">
              <Link to="/member/donation-history" className="feature-card h-100 d-flex flex-column history">
                <div className="feature-icon-circle">
                  <Activity />
                </div>
                <h5 className="feature-card-title">Xem lịch sử hiến máu</h5>
                <p className="feature-card-text flex-grow-1">Tra cứu các lần hiến máu đã thực hiện, bao gồm kết quả xét nghiệm.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Nhận thông báo khẩn cấp */}
            <div className="col">
              <Link to="/notifications?type=emergency" className="feature-card h-100 d-flex flex-column emergency-notif">
                <div className="feature-icon-circle">
                  <AlertCircle />
                </div>
                <h5 className="feature-card-title">Nhận thông báo khẩn cấp</h5>
                <p className="feature-card-text flex-grow-1">Hệ thống gửi yêu cầu hiến máu khẩn cấp phù hợp (qua App/Email).</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Phản hồi yêu cầu khẩn cấp */}
            <div className="col">
              <Link to="/notifications" className="feature-card h-100 d-flex flex-column respond">
                <div className="feature-icon-circle">
                  <MailCheck />
                </div>
                <h5 className="feature-card-title">Phản hồi yêu cầu khẩn cấp</h5>
                <p className="feature-card-text flex-grow-1">Chấp nhận hoặc từ chối yêu cầu hiến máu khẩn cấp.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Nhận nhắc nhở phục hồi */}
            <div className="col">
              <Link to="/member/reminders" className="feature-card h-100 d-flex flex-column reminder">
                <div className="feature-icon-circle">
                  <Clock />
                </div>
                <h5 className="feature-card-title">Nhận nhắc nhở phục hồi</h5>
                <p className="feature-card-text flex-grow-1">Nhận thông báo khi đủ điều kiện hiến lại máu dựa trên lần hiến gần nhất.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Thay nút "Cập nhật hồ sơ" thành: */}
        <button
          className="btn btn-custom btn-outline-primary w-100"
          onClick={() => setShowProfileModal(true)}
        >
          Cập nhật hồ sơ
        </button>

        {/* Modal hiển thị ProfileUpdate */}
        {showProfileModal && (
          <div className="modal-backdrop-custom">
            <div className="modal-content-custom">
              <button
                className="btn-close-modal"
                onClick={() => setShowProfileModal(false)}
                aria-label="Đóng"
              >×</button>
              <ProfileUpdate />
            </div>
          </div>
        )}

        {/* CSS cho modal */}
        <style>{`
          .modal-backdrop-custom {
            position: fixed;
            z-index: 1050;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-content-custom {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.18);
            padding: 0;
            max-width: 700px;
            width: 95vw;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
          }
          .btn-close-modal {
            position: absolute;
            top: 12px;
            right: 18px;
            background: none;
            border: none;
            font-size: 2rem;
            color: #dc3545;
            cursor: pointer;
            z-index: 10;
          }
        `}</style>
      </main>
      <Footer />
    </div>
  );
}

export default MemberDashboard;