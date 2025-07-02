// src/pages/Member/MemberDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar'; // Đảm bảo đường dẫn chính xác đến Navbar của bạn
import Footer from '../../components/Footer/Footer';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import 'bootstrap/dist/css/bootstrap.min.css'; // Đảm bảo Bootstrap CSS được import
import { User, Heart, Activity, Bell, MailCheck, Clock, AlertCircle } from 'lucide-react'; // Đảm bảo đã cài đặt lucide-react: npm install lucide-react
import ProfileUpdate from './CreateProfile'; // Import ProfileUpdate component

// Đảm bảo đường dẫn và tên file này chính xác
import './Memberdashboard.css'; 

function MemberDashboard() {
  // Hooks luôn đặt ở đầu function component
  const { user, isAuthenticated, isMember, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [emergencyNotifs, setEmergencyNotifs] = useState([]);
  const [unreadEmergencyCount, setUnreadEmergencyCount] = useState(0);

  // Fetch notifications for the user
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.userId) { 
      setNotifLoading(false);
      setNotifError('Vui lòng đăng nhập để xem thông báo.');
      return;
    }
    setNotifLoading(true);
    setNotifError('');
    try {
      const res = await api.get(`/Notification/by-user/${user.userId}`);
      setNotifications(res.data || []);
    } catch (err) {
      setNotifications([]);
      setNotifError('Không thể tải thông báo. Vui lòng thử lại sau.');
    } finally {
      setNotifLoading(false);
    }
  }, [isAuthenticated, user?.userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;
    api.get(`/EmergencyNotification/by-user/${user.userId}`)
      .then(res => {
        let list = [];
        if (res && res.data) {
          if (Array.isArray(res.data)) list = res.data;
          else if (Object.keys(res.data).length > 0) list = [res.data];
        }
        setEmergencyNotifs(list);
        // Lọc theo cả hai trường, ưu tiên giống bên EmergencyNotifications.jsx
        const count = list.filter(
          n => (n.responseStatus === 'No Response') ||
               (n.response_status && n.response_status.toLowerCase().replace(/[\s_]/g, '') === 'noresponse')
        ).length;
        setUnreadEmergencyCount(count);
      })
      .catch(() => {
        setEmergencyNotifs([]);
        setUnreadEmergencyCount(0);
      });
  }, [isAuthenticated, user?.userId]);

  // Sau khi đã khai báo hết hook, mới return giao diện
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-danger fs-4">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  if (!isAuthenticated || !isMember) { 
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-danger text-center">
        <h2 className="mb-3">Bạn không có quyền truy cập trang này.</h2>
        <p className="lead">Vui lòng đăng nhập bằng tài khoản thành viên.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>Đăng nhập</button>
      </div>
    );
  }

  // Lấy danh sách thông báo khẩn cấp từ API riêng (CHỈ GỌI 1 LẦN useEffect NÀY)

  // Classify notifications rõ ràng
  const generalNotifs = notifications.filter(
    n => n.type?.toLowerCase() !== 'emergency' && (n.type?.toLowerCase() === 'chung' || n.recipientUserId === 'ALL')
  );
  const personalNotifs = notifications.filter(
    n => n.type?.toLowerCase() !== 'emergency' && n.type?.toLowerCase() !== 'chung' && n.recipientUserId !== 'ALL'
  );
  const unreadGeneralNotifsCount = generalNotifs.filter(n => !n.isRead).length;
  const unreadPersonalNotifsCount = personalNotifs.filter(n => !n.isRead).length;

  return (
    <div className="member-dashboard-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5 member-dashboard-main animate__animated animate__fadeIn">
        <h1 className="dashboard-header animate__animated animate__fadeInDown">
          Chào mừng <span className="text-primary">{user?.username || user?.email || 'Thành viên'}</span> đến với Trang tổng quan!
        </h1>

        {/* Notification Cards Section */}
        <div className="row g-4 mb-5 notification-cards-section">
          {/* Emergency Notification Card */}
          <div className="col-12 col-md-6 animate__animated animate__zoomIn">
            {notifLoading ? (
              <div className="notification-card-base emergency-notification-card d-flex justify-content-center align-items-center">
                <div className="content text-center">
                  <span className="spinner-border spinner-border-sm me-2 text-white"></span>
                  <span className="text-white">Đang tải thông báo khẩn cấp...</span>
                </div>
              </div>
            ) : notifError ? (
              <div className="notification-card-base emergency-notification-card d-flex justify-content-center align-items-center">
                <div className="content text-center">
                  <div className="title text-white">Lỗi tải thông báo</div>
                  <div className="description text-white-75">{notifError}</div>
                </div>
              </div>
            ) : (
              <Link to="/member/emergency-notifications" className="notification-card-base emergency-notification-card position-relative">
                <div className="icon-wrapper">
                  <AlertCircle size={32} />
                  {unreadEmergencyCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: 13, zIndex: 2 }}
                      title={`${unreadEmergencyCount} thông báo khẩn cấp chưa phản hồi`}
                    >
                      {unreadEmergencyCount}
                    </span>
                  )}
                </div>
                <div className="content">
                  <div className="title">THÔNG BÁO KHẨN CẤP</div>
                  <div className="description">
                    {unreadEmergencyCount > 0
                      ? `${unreadEmergencyCount} thông báo khẩn cấp chưa phản hồi`
                      : 'Không có thông báo khẩn cấp chưa phản hồi.'}
                  </div>
                </div>
                <span className="detail-button">Xem chi tiết</span>
              </Link>
            )}
          </div>

          {/* General Notification Card */}
          <div className="col-12 col-md-6 animate__animated animate__zoomIn animate__delay-0-1s">
            {notifLoading ? (
              <div className="notification-card-base general-notification-card d-flex justify-content-center align-items-center">
                <div className="content text-center">
                  <span className="spinner-border spinner-border-sm me-2 text-white"></span>
                  <span className="text-white">Đang tải thông báo...</span>
                </div>
              </div>
            ) : notifError ? (
              <div className="notification-card-base general-notification-card d-flex justify-content-center align-items-center">
                <div className="content text-center">
                  <div className="title text-white">Lỗi tải thông báo</div>
                  <div className="description text-white-75">{notifError}</div>
                </div>
              </div>
            ) : (
              <Link to="/notifications" className="notification-card-base general-notification-card">
                <div className="icon-wrapper">
                  <Bell size={32} />
                </div>
                <div className="content">
                  <div className="title">Thông báo</div>
                  <div className="description">
                    {unreadGeneralNotifsCount + unreadPersonalNotifsCount} thông báo chưa đọc.
                  </div>
                </div>
                <span className="detail-button">Xem chi tiết</span>
              </Link>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="container feature-card-grid mb-5">
          {/* Using row-cols-1 row-cols-md-2 row-cols-lg-3 for responsive grid */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {/* Cập nhật hồ sơ cá nhân */}
            <div className="col animate__animated animate__zoomIn">
              <Link to="/member/profile" className="feature-card h-100 d-flex flex-column profile">
                <div className="feature-icon-circle">
                  <User size={40} /> {/* Điều chỉnh kích thước icon */}
                </div>
                <h5 className="feature-card-title">Cập nhật hồ sơ cá nhân</h5>
                <p className="feature-card-text flex-grow-1">Quản lý thông tin: nhóm máu, địa chỉ, CCCD, điện thoại, tình trạng sức khỏe.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Đăng ký sẵn sàng hiến máu */}
            <div className="col animate__animated animate__zoomIn animate__delay-0-1s">
              <Link to="/member/register-donation" className="feature-card h-100 d-flex flex-column donate">
                <div className="feature-icon-circle">
                  <Heart size={40} />
                </div>
                <h5 className="feature-card-title">Đăng ký sẵn sàng hiến máu</h5>
                <p className="feature-card-text flex-grow-1">Đăng ký ngày sẵn sàng hiến máu, nhóm máu, thành phần hiến.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Xem lịch sử hiến máu */}
            <div className="col animate__animated animate__zoomIn animate__delay-0-2s">
              <Link to="/member/donation-history" className="feature-card h-100 d-flex flex-column history">
                <div className="feature-icon-circle">
                  <Activity size={40} />
                </div>
                <h5 className="feature-card-title">Xem lịch sử hiến máu</h5>
                <p className="feature-card-text flex-grow-1">Tra cứu các lần hiến máu đã thực hiện, bao gồm kết quả xét nghiệm.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Nhận thông báo khẩn cấp */}
            <div className="col animate__animated animate__zoomIn animate__delay-0-3s">
              <Link to="/notifications?type=emergency" className="feature-card h-100 d-flex flex-column emergency-notif">
                <div className="feature-icon-circle">
                  <AlertCircle size={40} />
                </div>
                <h5 className="feature-card-title">Nhận thông báo khẩn cấp</h5>
                <p className="feature-card-text flex-grow-1">Hệ thống gửi yêu cầu hiến máu khẩn cấp phù hợp (qua App/Email).</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Phản hồi yêu cầu khẩn cấp (có thể dẫn đến trang notifications chung hoặc trang chuyên biệt) */}
            <div className="col animate__animated animate__zoomIn animate__delay-0-4s">
              <Link to="/notifications" className="feature-card h-100 d-flex flex-column respond">
                <div className="feature-icon-circle">
                  <MailCheck size={40} />
                </div>
                <h5 className="feature-card-title">Phản hồi yêu cầu khẩn cấp</h5>
                <p className="feature-card-text flex-grow-1">Chấp nhận hoặc từ chối yêu cầu hiến máu khẩn cấp.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
            {/* Nhận nhắc nhở phục hồi */}
            <div className="col animate__animated animate__zoomIn animate__delay-0-5s">
              <Link to="/member/reminders" className="feature-card h-100 d-flex flex-column reminder">
                <div className="feature-icon-circle">
                  <Clock size={40} />
                </div>
                <h5 className="feature-card-title">Nhận nhắc nhở phục hồi</h5>
                <p className="feature-card-text flex-grow-1">Nhận thông báo khi đủ điều kiện hiến lại máu dựa trên lần hiến gần nhất.</p>
                <button className="feature-card-button mt-auto">Truy cập</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Nút "Cập nhật hồ sơ" có thể mở Modal */}
        <div className="text-center mt-5 mb-5 animate__animated animate__fadeIn">
            <button
                className="btn btn-primary btn-lg custom-update-profile-btn"
                onClick={() => setShowProfileModal(true)}
            >
                Cập nhật hồ sơ của tôi
            </button>
        </div>

        {/* Modal hiển thị ProfileUpdate */}
        {showProfileModal && (
          <div className="modal-backdrop-custom animate__animated animate__fadeIn">
            <div className="modal-content-custom animate__animated animate__zoomIn">
              <button
                className="btn-close-modal"
                onClick={() => setShowProfileModal(false)}
                aria-label="Đóng"
              >
                &times; {/* Sử dụng ký tự X đơn giản cho nút đóng */}
              </button>
              <ProfileUpdate /> {/* Component ProfileUpdate sẽ được render ở đây */}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default MemberDashboard;