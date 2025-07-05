// src/pages/Member/Reminders.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';

function Reminders() {
  const { user, isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState(null);
  const [nextEligibleDate, setNextEligibleDate] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      const fetchRemindersAndProfile = async () => {
        setLoading(true);
        setError('');
        try {
          // Lấy thông tin hồ sơ người dùng để tìm ngày hiến máu cuối cùng
          const res = await api.get(`/UserProfile/by-user/${user.userId}`);
          const profileData = res.data;

          if (profileData.lastBloodDonationDate) {
            const lastDate = new Date(profileData.lastBloodDonationDate);
            setLastDonationDate(lastDate);

            // Tính ngày đủ điều kiện hiến máu tiếp theo (sau 3 tháng)
            const nextDate = new Date(lastDate);
            nextDate.setMonth(nextDate.getMonth() + 3);
            setNextEligibleDate(nextDate);
          }

          // Lấy các nhắc nhở từ API backend (theo user)
          const remindersResponse = await api.get(`/DonationReminder/ForUser/${user.userId}`);
          if (Array.isArray(remindersResponse.data)) {
            setReminders(remindersResponse.data);
          } else {
            setReminders([]);
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi tải nhắc nhở.');
        } finally {
          setLoading(false);
        }
      };

      fetchRemindersAndProfile();
    } else if (!isAuthenticated) {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem nhắc nhở.');
    }
  }, [isAuthenticated, user?.userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-wrapper" style={{ background: '#f6f8fa', minHeight: '100vh' }}>
      <Header />
      <Navbar />
      <main className="container my-5">
        <h1 className="text-center mb-4 text-info">Nhắc nhở và Thông tin Hiến máu</h1>
        <p className="text-center lead">
          Cập nhật các thông báo quan trọng và tình trạng đủ điều kiện hiến máu của bạn.
        </p>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm p-4 mb-4">
              <h5 className="card-title text-primary mb-3">Thông tin đủ điều kiện hiến máu</h5>
              {lastDonationDate ? (
                <>
                  <p><strong>Ngày hiến máu gần nhất:</strong> {lastDonationDate.toLocaleDateString('vi-VN')}</p>
                  {nextEligibleDate && (
                    <p><strong>Ngày đủ điều kiện hiến máu tiếp theo:</strong> {nextEligibleDate.toLocaleDateString('vi-VN')}</p>
                  )}
                  {nextEligibleDate && new Date() < nextEligibleDate ? (
                    <div className="alert alert-warning mt-3">
                      Bạn chưa đủ điều kiện hiến máu lại. Vui lòng chờ đến ngày {nextEligibleDate?.toLocaleDateString('vi-VN')}.
                    </div>
                  ) : (
                    <div className="alert alert-success mt-3">
                      Bạn hiện đủ điều kiện để hiến máu! Cảm ơn sự đóng góp của bạn.
                      <br />
                      <a href="/member/register-donation" className="alert-link">Đăng ký hiến máu ngay!</a>
                    </div>
                  )}
                </>
              ) : (
                <div className="alert alert-info">
                  Chúng tôi chưa có thông tin về lần hiến máu gần nhất của bạn. Vui lòng cập nhật hồ sơ hoặc thực hiện lần hiến máu đầu tiên.
                </div>
              )}
            </div>

            <div className="card shadow-sm p-4">
              <h5 className="card-title text-info mb-3">Các nhắc nhở khác</h5>
              {!reminders || reminders.length === 0 ? (
                <div className="alert alert-secondary text-center">
                  Hiện không có nhắc nhở nào.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {reminders.map(reminder => (
                    <li
                      key={reminder.id || reminder.reminderId || Math.random()}
                      className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                    >
                      <div>
                        <span className="fw-semibold">
                          {reminder.message || reminder.ReminderType || 'Nhắc nhở'}
                        </span>
                        {reminder.ReminderType && (
                          <span className="ms-2 badge bg-info text-dark">{reminder.ReminderType}</span>
                        )}
                        {reminder.Via && (
                          <span className="ms-2 badge bg-secondary">{reminder.Via}</span>
                        )}
                      </div>
                      <span className="badge bg-light text-dark mt-2 mt-md-0">
                        {reminder.SentAt
                          ? new Date(reminder.SentAt).toLocaleString('vi-VN')
                          : (reminder.date ? new Date(reminder.date).toLocaleString('vi-VN') : '')
                        }
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        .card {
          border-radius: 16px;
          border: 1px solid #e3e6ea;
          background: #fff;
        }
      `}</style>
    </div>
  );
}

export default Reminders;
