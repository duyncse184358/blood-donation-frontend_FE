import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định tab đang active dựa vào pathname
  const getActiveTab = () => {
    if (location.pathname === '/admin/manage-users' || location.pathname === '/admin/dashboard') return 'users';
    if (location.pathname === '/admin/donations') return 'donations';
    if (location.pathname === '/admin/report' || location.pathname === '/admin/Report') return 'statistics';
    if (location.pathname === '/admin/settings') return 'settings';
    return '';
  };

  const activeTab = getActiveTab();

  return (
    <div style={{ background: '#f6f8fa', minHeight: '100vh' }}>
      <Header />
      <Navbar />
      <div style={{ display: 'flex', minHeight: '80vh' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 240,
            background: '#fff',
            borderRight: '1px solid #e0e0e0',
            padding: '32px 16px',
            minHeight: '80vh'
          }}
        >
          <h4 style={{ marginBottom: 32, color: '#e53935' }}>Admin Menu</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
            <li style={{ marginBottom: 18 }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'users' ? '#e53935' : '#333',
                  fontWeight: activeTab === 'users' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/admin/manage-users')}
              >
                <i className="fa fa-users me-2"></i> Quản lý người dùng
              </button>
            </li>
            <li style={{ marginBottom: 18 }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'donations' ? '#e53935' : '#333',
                  fontWeight: activeTab === 'donations' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/admin/donations')}
              >
                <i className="fa fa-tint me-2"></i> Quản lý hiến máu
              </button>
            </li>
            <li style={{ marginBottom: 18 }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'statistics' ? '#e53935' : '#333',
                  fontWeight: activeTab === 'statistics' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/admin/Report')}
              >
                <i className="fa fa-chart-bar me-2"></i> Thống kê
              </button>
            </li>
            <li style={{ marginBottom: 18 }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'settings' ? '#e53935' : '#333',
                  fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/admin/settings')}
              >
                <i className="fa fa-cog me-2"></i> Cài đặt hệ thống
              </button>
            </li>
          </ul>
        </aside>
        {/* Nội dung chính */}
        <main className="container my-5" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
      <Footer />
      {/* Font Awesome CDN nếu chưa có */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div>
  );
}

export default AdminDashboard;