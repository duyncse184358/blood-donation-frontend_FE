import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

import EmergencyRequestForm from './EmergencyRequestForm';
import DonationRequestManager from './DonationRequestManager';
import DonationRecordForm from './DonationRecordForm';
import BloodInventoryManager from './BloodInventoryManager';
import BloodDiscardForm from './BloodDiscardForm';
import DonorSearch from './DonorSearch';
import NotificationForm from './NotificationForm';
import ProfileUpdate from '../Member/CreateProfile';
import DonationHistoryByRequestModal from './DonationHistoryByRequestModal';
import DonorProfileModal from './DonorProfileModal';

const TABS = [
  { key: 'emergency', label: 'Tạo yêu cầu máu khẩn cấp', icon: 'fa-solid fa-triangle-exclamation' },
  { key: 'requests', label: 'Quản lý yêu cầu hiến máu', icon: 'fa-solid fa-list-check' },
  { key: 'donation', label: 'Ghi nhận hiến máu thực tế', icon: 'fa-solid fa-droplet' },
  { key: 'inventory', label: 'Quản lý kho máu', icon: 'fa-solid fa-warehouse' },
  { key: 'discard', label: 'Ghi nhận loại bỏ máu', icon: 'fa-solid fa-trash-can' },
  { key: 'search', label: 'Tìm kiếm người hiến phù hợp', icon: 'fa-solid fa-magnifying-glass-location' },
  { key: 'notification', label: 'Quản lý thông báo', icon: 'fa-solid fa-bell' },
  { key: 'profile', label: 'Cập nhật hồ sơ cá nhân', icon: 'fa-solid fa-user-pen' }
];

function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('emergency');
  const [modalType, setModalType] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  useEffect(() => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    };
  }, [isAnyModalOpen]);

  const openModal = (type, data) => {
    setModalType(type);
    setSelected(data);
    setIsAnyModalOpen(true);
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
    setIsAnyModalOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'emergency': return <EmergencyRequestForm />;
      case 'requests': return <DonationRequestManager openModal={openModal} />;
      case 'donation': return <DonationRecordForm />;
      case 'inventory':
        if (modalType === 'inventory') return null;
        return <BloodInventoryManager openModal={openModal} />; // Truyền openModal
      case 'discard': return <BloodDiscardForm />;
      case 'search': return <DonorSearch />;
      case 'notification': return <NotificationForm />;
      case 'profile': return <ProfileUpdate />;
      default: return null;
    }
  };

  return (
    <div className="staff-dashboard-wrapper">
      <Header />
      <Navbar />
      <main className="container-fluid px-0">
        <div className="dashboard-header text-center my-4">
          <h1 className="dashboard-title">
            <i className="fa-solid fa-hand-holding-droplet me-2 text-danger"></i>
            Trang quản lý hiến máu <span className="text-danger">- Nhân viên y tế</span>
          </h1>
          <p className="dashboard-desc text-secondary">
            Quản lý, điều phối và hỗ trợ các hoạt động hiến máu một cách nhanh chóng, chính xác và nhân văn.
          </p>
        </div>

        <div className="dashboard-flexbox">
          <aside className="sidebar-nav">
            <ul className="nav flex-column sidebar-menu">
              {TABS.map(tab => (
                <li className="nav-item" key={tab.key}>
                  <button
                    className={`nav-link sidebar-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                  >
                    <i className={`${tab.icon} me-2`}></i>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="dashboard-content card shadow-lg p-4 mb-5">
            {renderTabContent()}
          </section>
        </div>

        {modalType === 'detail' && selected && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            onClick={closeModal}
          >
            <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Ghi nhận thực tế hiến máu</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <DetailEditForm selected={selected} closeModal={closeModal} />
              </div>
            </div>
          </div>
        )}

        {modalType === 'history' && selected && (
          <DonationHistoryByRequestModal requestId={selected.requestId} onClose={closeModal} />
        )}

        {modalType === 'profile' && selected && (
          <DonorProfileModal userId={selected.userId} onClose={closeModal} />
        )}

        {/* Modal inventory */}
        {modalType === 'inventory' && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            onClick={closeModal}
          >
            <div className="modal-dialog modal-xl" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Quản lý kho máu</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <BloodInventoryManager openModal={openModal} />
                </div>
              </div>
            </div>
          </div>
        )}

        {isAnyModalOpen && <div className="modal-backdrop fade show"></div>}
      </main>
      <Footer />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }
        .staff-dashboard-wrapper {
          background: linear-gradient(120deg, #f8f9fa 60%, #ffe5e5 100%);
          min-height: 100vh;
          width: 100vw;
        }
        .dashboard-header {
          margin-bottom: 2rem;
        }
        .dashboard-title {
          font-weight: 700;
          font-size: 2.2rem;
        }
        .dashboard-desc {
          font-size: 1.1rem;
        }
        .dashboard-flexbox {
          display: flex;
          flex-direction: row;
          gap: 24px;
          padding: 0 24px;
        }
        .sidebar-nav {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 12px rgba(220,53,69,0.06);
          min-width: 240px;
          max-width: 280px;
          padding: 18px 0;
          height: fit-content;
        }
        .sidebar-tab-btn {
          width: 100%;
          text-align: left;
          font-size: 1.05rem;
          font-weight: 500;
          color: #dc3545;
          background: none;
          border: none;
          border-radius: 12px;
          margin-bottom: 8px;
          padding: 12px 20px;
        }
        .sidebar-tab-btn.active,
        .sidebar-tab-btn:hover {
          background: linear-gradient(90deg, #dc3545 0%, #ff6f61 100%);
          color: #fff;
        }
        .dashboard-content {
          flex: 1;
          border-radius: 24px;
          background: #fff;
          animation: fadeIn 0.4s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 991px) {
          .dashboard-flexbox { flex-direction: column; gap: 0; }
        }
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
        }
        .modal.show.d-block {
          z-index: 1050;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: auto;
        }
        body.modal-open {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function DetailEditForm({ selected, closeModal }) {
  const [status, setStatus] = useState(selected.status || 'Pending');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setErr('');
    try {
      if (selected.onUpdateStatus) {
        selected.onUpdateStatus(status, (err) => {
          if (!err) closeModal();
          else setErr('Cập nhật thất bại!');
        });
      }
    } catch (e) {
      setErr('Cập nhật thất bại!');
    }
    setLoading(false);
  };

  return (
    <form className="modal-body">
      <div className="mb-2"><b>Người hiến:</b> {selected.donorUserName || selected.donorUserId}</div>
      <div className="mb-2"><b>Nhóm máu:</b> {selected.bloodTypeName}</div>
      <div className="mb-2"><b>Thành phần máu:</b> {selected.componentName}</div>
      <div className="mb-2"><b>Ngày mong muốn hiến:</b> {selected.preferredDate}</div>
      <div className="mb-2"><b>Khung giờ mong muốn:</b> {selected.preferredTimeSlot}</div>
      <div className="mb-2">
        <b>Trạng thái:</b>
        <select
          className="form-select"
          name="status"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
         
          <option value="Accepted">Chấp nhận</option>
          <option value="Rejected">Từ chối</option>
         
        </select>
      </div>
      <div className="mb-2"><b>Ghi chú của nhân viên:</b> {selected.staffNotes}</div>
      {err && <div className="text-danger mb-2">{err}</div>}
      <div className="modal-footer">
        <button className="btn btn-success" type="button" onClick={handleSave} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu trạng thái'}
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={closeModal}>Đóng</button>
      </div>
    </form>
  );
}

export default StaffDashboard;
