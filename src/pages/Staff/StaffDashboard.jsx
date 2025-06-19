import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

// Import các component chức năng staff
import EmergencyRequestForm from './EmergencyRequestForm';
import DonationRequestManager from './DonationRequestManager';
import DonationRecordForm from './DonationRecordForm';
import BloodInventoryManager from './BloodInventoryManager';
import BloodDiscardForm from './BloodDiscardForm';
import DonorSearch from './DonorSearch';
import NotificationForm from './NotificationForm'; // Hiển thị danh sách notification + nút tạo

const TABS = [
  { key: 'emergency', label: 'Tạo yêu cầu máu khẩn cấp', icon: 'fa-solid fa-triangle-exclamation' },
  { key: 'requests', label: 'Quản lý yêu cầu hiến máu', icon: 'fa-solid fa-list-check' },
  { key: 'donation', label: 'Ghi nhận hiến máu thực tế', icon: 'fa-solid fa-droplet' },
  { key: 'inventory', label: 'Quản lý kho máu', icon: 'fa-solid fa-warehouse' },
  { key: 'discard', label: 'Ghi nhận loại bỏ máu', icon: 'fa-solid fa-trash-can' },
  { key: 'search', label: 'Tìm kiếm người hiến phù hợp', icon: 'fa-solid fa-magnifying-glass-location' },
  { key: 'notification', label: 'Quản lý thông báo', icon: 'fa-solid fa-bell' }
];

function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('emergency');

  return (
    <div className="staff-dashboard-wrapper blood-bg">
      <Header />
      <Navbar />
      <main className="container my-5">
        <div className="dashboard-header text-center mb-5">
          <h1 className="dashboard-title">
            <i className="fa-solid fa-hand-holding-droplet me-2 text-danger"></i>
            Trang quản lý hiến máu <span className="text-danger">- Nhân viên y tế</span>
          </h1>
          <p className="dashboard-desc text-secondary">
            Quản lý, điều phối và hỗ trợ các hoạt động hiến máu một cách nhanh chóng, chính xác và nhân văn.
          </p>
        </div>
        <ul className="nav nav-tabs mb-4 justify-content-center dashboard-tabs">
          {TABS.map(tab => (
            <li className="nav-item" key={tab.key}>
              <button
                className={`nav-link dashboard-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                <i className={`${tab.icon} me-2`}></i>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="dashboard-content card shadow-lg p-4 mx-auto mb-5" style={{ borderRadius: 24, maxWidth: 1100, background: '#fff' }}>
          {activeTab === 'emergency' && (
            <section>
              <h4 className="mb-3 text-danger"><i className="fa-solid fa-triangle-exclamation me-2"></i>Tạo yêu cầu máu khẩn cấp</h4>
              <EmergencyRequestForm />
            </section>
          )}

          {activeTab === 'requests' && (
            <section>
              <h4 className="mb-3 text-primary"><i className="fa-solid fa-list-check me-2"></i>Quản lý yêu cầu hiến máu</h4>
              <DonationRequestManager />
            </section>
          )}

          {activeTab === 'donation' && (
            <section>
              <h4 className="mb-3 text-danger"><i className="fa-solid fa-droplet me-2"></i>Ghi nhận hiến máu thực tế</h4>
              <DonationRecordForm />
            </section>
          )}

          {activeTab === 'inventory' && (
            <section>
              <h4 className="mb-3 text-primary"><i className="fa-solid fa-warehouse me-2"></i>Quản lý kho máu</h4>
              <BloodInventoryManager />
            </section>
          )}

          {activeTab === 'discard' && (
            <section>
              <h4 className="mb-3 text-secondary"><i className="fa-solid fa-trash-can me-2"></i>Ghi nhận loại bỏ máu</h4>
              <BloodDiscardForm />
            </section>
          )}

          {activeTab === 'search' && (
            <section>
              <h4 className="mb-3 text-success"><i className="fa-solid fa-magnifying-glass-location me-2"></i>Tìm kiếm người hiến phù hợp</h4>
              <DonorSearch />
            </section>
          )}

          {activeTab === 'notification' && (
            <section>
              <h4 className="mb-3 text-warning"><i className="fa-solid fa-bell me-2"></i>Quản lý thông báo</h4>
              <NotificationForm />
            </section>
          )}
        </div>
      </main>
      <Footer />
      {/* Font Awesome CDN nếu chưa có */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <style>{`
        .blood-bg {
          background: linear-gradient(120deg, #f8f9fa 60%, #ffe5e5 100%);
          min-height: 100vh;
        }
        .dashboard-header {
          margin-bottom: 2.5rem;
        }
        .dashboard-title {
          font-weight: 700;
          font-size: 2.2rem;
          letter-spacing: 1px;
        }
        .dashboard-desc {
          font-size: 1.1rem;
          margin-top: 0.5rem;
        }
        .dashboard-tabs .nav-link {
          font-size: 1.08rem;
          font-weight: 500;
          color: #dc3545;
          background: #fff;
          border: none;
          border-radius: 18px 18px 0 0;
          margin: 0 6px;
          padding: 12px 28px;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(220,53,69,0.04);
        }
        .dashboard-tabs .nav-link.active, .dashboard-tabs .nav-link:hover {
          background: linear-gradient(90deg, #dc3545 0%, #ff6f61 100%);
          color: #fff !important;
          box-shadow: 0 4px 16px rgba(220,53,69,0.13);
        }
        .dashboard-content {
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: none;}
        }
        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-content { padding: 1.2rem; }
          .dashboard-title { font-size: 1.3rem; }
          .dashboard-tabs .nav-link { padding: 10px 10px; font-size: 0.98rem;}
        }
      `}</style>
    </div>
  );
}

export default StaffDashboard;