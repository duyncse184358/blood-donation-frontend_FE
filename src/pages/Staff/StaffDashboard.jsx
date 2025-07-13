import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Draggable from 'react-draggable';

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
import api from '../../services/Api';

const TABS = [
  { key: 'emergency', label: 'Tạo yêu cầu máu khẩn cấp', icon: 'fa-solid fa-triangle-exclamation' },
  { key: 'requests', label: 'Quản lý yêu cầu hiến máu', icon: 'fa-solid fa-list-check' },
  { key: 'donation', label: 'Ghi nhận hiến máu thực tế', icon: 'fa-solid fa-droplet' },
  { key: 'inventory', label: 'Quản lý kho máu', icon: 'fa-solid fa-warehouse' },
  { key: 'discard', label: 'Ghi nhận loại bỏ máu', icon: 'fa-solid fa-trash-can' },
  { key: 'search', label: 'Tìm kiếm người hiến phù hợp', icon: 'fa-solid fa-magnifying-glass-location' },
  { key: 'notification', label: 'Quản lý thông báo', icon: 'fa-solid fa-bell' },
 
];

function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('emergency');
  const [modalType, setModalType] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMessage, setEditMessage] = useState('');
  const [discardUnit, setDiscardUnit] = useState(null);
  const [discardEdit, setDiscardEdit] = useState(false);
  const [discardForm, setDiscardForm] = useState({});
  const [discardMsg, setDiscardMsg] = useState('');
  const [discardErr, setDiscardErr] = useState('');

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

  const handleEditUnit = (unit) => {
    setEditUnit(unit);
    setEditForm({ ...unit });
    setEditMessage('');
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(f => ({ ...f, [field]: value }));
  };

  const handleEditSave = async () => {
    try {
      const payload = {
        unitId: editForm.unitId,
        bloodTypeId: editForm.bloodTypeId,
        componentId: editForm.componentId,
        volumeMl: editForm.volumeMl,
        collectionDate: editForm.collectionDate,
        expirationDate: editForm.expirationDate,
        storageLocation: editForm.storageLocation,
        testResults: editForm.testResults,
        status: editForm.status,
        discardReason: editForm.discardReason,
      };
      await api.put(`/BloodUnit/${editForm.unitId}`, payload);

      // Nếu trạng thái là "Separating" và thành phần là "Toàn phần", gọi API tách thành phần máu
      if (
        (editForm.status === 'Separating' || payload.status === 'Separating') &&
        (editForm.componentName === 'Toàn phần' || payload.componentName === 'Toàn phần')
      ) {
        try {
          await api.post(`/BloodUnit/separate/${editForm.unitId}`);
          setEditMessage('Đã tách thành phần máu thành công!');
        } catch (err) {
          setEditMessage('Cập nhật thành công, nhưng tách thành phần máu thất bại!');
        }
      } else {
        setEditMessage('Cập nhật thành công!');
      }

      setEditUnit(null);
      setIsEditModalOpen(false);
      // Có thể reload lại data nếu muốn
    } catch {
      setEditMessage('Cập nhật thất bại!');
    }
  };

  const handleEditClose = () => {
    setEditUnit(null);
    setIsEditModalOpen(false);
    setEditForm({});
    setEditMessage('');
  };

  const handleSelectDiscardUnit = (unit) => {
    setDiscardUnit(unit);
    setDiscardForm(unit);
    setDiscardEdit(false);
    setDiscardMsg('');
    setDiscardErr('');
  };

  const handleDiscardClose = () => {
    setDiscardUnit(null);
    setDiscardEdit(false);
    setDiscardMsg('');
    setDiscardErr('');
  };

  const handleDiscardFormChange = (e) => {
    const { name, value } = e.target;
    setDiscardForm(f => ({ ...f, [name]: value }));
  };

  const handleDiscardUpdate = async (e) => {
    e.preventDefault();
    setDiscardMsg('');
    setDiscardErr('');
    try {
      const payload = {
        donationId: discardForm.donationId,
        bloodTypeId: discardForm.bloodTypeId,
        componentId: discardForm.componentId,
        volumeMl: discardForm.volumeMl,
        collectionDate: discardForm.collectionDate,
        testResults: discardForm.testResults,
        status: discardForm.status,
        discardReason: discardForm.discardReason,
      };
      const res = await api.put(`/BloodUnit/${discardForm.unitId}`, payload);
      setDiscardUnit(res.data);
      setDiscardForm(res.data);
      setDiscardMsg('Cập nhật thành công!');
      setDiscardEdit(false);
      // Có thể reload lại data nếu muốn
    } catch {
      setDiscardErr('Cập nhật thất bại!');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'emergency': return <EmergencyRequestForm />;
      case 'requests': return <DonationRequestManager openModal={openModal} />;
      case 'donation': return <DonationRecordForm />;
      case 'inventory':
        if (modalType === 'inventory') return null;
        return <BloodInventoryManager onEditUnit={handleEditUnit} />;
      case 'discard': return <BloodDiscardForm onSelectUnit={handleSelectDiscardUnit} />;
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
                    onClick={() => {
                      if (!isEditModalOpen) setActiveTab(tab.key);
                    }}
                    type="button"
                    disabled={isEditModalOpen}
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

        {editUnit && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              background: 'rgba(0,0,0,0.2)',
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 1050,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="modal-dialog" style={{ margin: 0 }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sửa đơn vị máu</h5>
                  <button type="button" className="btn-close" onClick={handleEditClose}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2"><b>Mã đơn vị:</b> {editForm.unitId}</div>
                  <div className="mb-2"><b>Nhóm máu:</b> {editForm.bloodTypeName}</div>
                  <div className="mb-2"><b>Thành phần:</b> {editForm.componentName}</div>
                  <div className="mb-2">
                    <b>Thể tích (ml):</b>
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.volumeMl || ''}
                      onChange={e => handleEditFormChange('volumeMl', e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <b>Trạng thái:</b>
                    <select
                      className="form-select"
                      value={editForm.status || ''}
                      onChange={e => handleEditFormChange('status', e.target.value)}
                    >
                      <option value="Available">Có sẵn</option>
                      <option value="Reserved">Đã đặt</option>
                      <option value="Discarded">Đã loại bỏ</option>
                      <option value="Used">Đã sử dụng</option>
                      <option value="Testing">Đang kiểm tra</option>
                      <option value="Separating">Đang tách</option>
                      <option value="Separated">Đã tách</option>
                      <option value="Usable">Có thể sử dụng</option>
                      <option value="Pending">Đang chờ xử lý</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <b>Lý do loại bỏ:</b>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.discardReason || ''}
                      onChange={e => handleEditFormChange('discardReason', e.target.value)}
                    />
                  </div>
                  {/* Nếu trạng thái là Separating và thành phần là Toàn phần, hiển thị hướng dẫn */}
                  {editForm.status === 'Separating' && editForm.componentName === 'Toàn phần' && (
                    <div className="alert alert-info mt-2">
                      Sau khi chuyển sang trạng thái <b>Đang tách</b>, bạn có thể tách thành phần máu tại giao diện kho máu.
                    </div>
                  )}
                  {editMessage && <div className="alert alert-info">{editMessage}</div>}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-success" type="button" onClick={handleEditSave}>Lưu</button>
                  <button className="btn btn-secondary" type="button" onClick={handleEditClose}>Hủy</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {discardUnit && (
          <div className="modal show d-block" tabIndex="-1" style={{
            background: 'rgba(0,0,0,0.2)',
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="modal-dialog" style={{ margin: 0 }}>
              <div className="modal-content">
                {!discardEdit ? (
                  <>
                    <div className="modal-header">
                      <h5 className="modal-title">Chi tiết đơn vị máu quá hạn</h5>
                      <button type="button" className="btn-close" onClick={handleDiscardClose}></button>
                    </div>
                    <div className="modal-body">
                      <div><b>Mã đơn vị:</b> {discardUnit.unitId}</div>
                      <div><b>Nhóm máu:</b> {discardUnit.bloodTypeName}</div>
                      <div><b>Thành phần:</b> {discardUnit.componentName}</div>
                      <div><b>Thể tích (ml):</b> {discardUnit.volumeMl}</div>
                      <div><b>Ngày lấy:</b> {discardUnit.collectionDate}</div>
                      <div><b>Hạn sử dụng:</b> {discardUnit.expirationDate}</div>
                      <div><b>Kết quả xét nghiệm:</b> {discardUnit.testResults}</div>
                      <div><b>Trạng thái:</b> {discardUnit.status}</div>
                      <div><b>Lý do loại bỏ:</b> {discardUnit.discardReason}</div>
                      {discardMsg && <div className="alert alert-success mt-2">{discardMsg}</div>}
                      {discardErr && <div className="alert alert-danger mt-2">{discardErr}</div>}
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-warning" onClick={() => setDiscardEdit(true)}>Cập nhật trạng thái/Lý do</button>
                      <button className="btn btn-secondary" onClick={handleDiscardClose}>Đóng</button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleDiscardUpdate}>
                    <div className="modal-header">
                      <h5 className="modal-title">Cập nhật trạng thái/Lý do loại bỏ</h5>
                      <button type="button" className="btn-close" onClick={handleDiscardClose}></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-2"><b>Trạng thái:</b>
                        <select className="form-select" name="status" value={discardForm.status || ''} onChange={handleDiscardFormChange}>
                          <option value="Available">Có sẵn</option>
                          <option value="Reserved">Đã đặt</option>
                          <option value="Discarded">Đã loại bỏ</option>
                          <option value="Used">Đã sử dụng</option>
                        </select>
                      </div>
                      <div className="mb-2"><b>Lý do loại bỏ:</b>
                        <input type="text" className="form-control" name="discardReason" value={discardForm.discardReason || ''} onChange={handleDiscardFormChange} placeholder="Nhập lý do loại bỏ (nếu có)" />
                      </div>
                      {discardMsg && <div className="alert alert-success mt-2">{discardMsg}</div>}
                      {discardErr && <div className="alert alert-danger mt-2">{discardErr}</div>}
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-success">Lưu thay đổi</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setDiscardEdit(false)}>Hủy</button>
                    </div>
                  </form>
                )}
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
  const [staffNotes, setStaffNotes] = useState(selected.staffNotes || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setErr('');
    setSuccess('');
    try {
      if (selected.onUpdateStatus) {
        selected.onUpdateStatus(status, staffNotes, (err) => {
          setLoading(false);
          if (!err) {
            setSuccess('Cập nhật trạng thái thành công!');
            setTimeout(() => {
              closeModal();
            }, 1500); // Đóng modal sau 1.5 giây để người dùng thấy thông báo thành công
          } else {
            setErr('Cập nhật thất bại! Vui lòng thử lại.');
          }
        });
      }
    } catch (e) {
      setErr('Cập nhật thất bại! Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <form className="modal-body">
      <div className="mb-2"><b>Người hiến:</b> {selected.donorUserName || selected.donorUserId}</div>
      <div className="mb-2"><b>Nhóm máu:</b> {selected.bloodTypeName}</div>
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
            <option value="Pending">Đang Chờ</option>
        </select>
      </div>
      <div className="mb-2">
        <b>Ghi chú của nhân viên:</b>
        <textarea
          className="form-control"
          value={staffNotes}
          onChange={e => setStaffNotes(e.target.value)}
          rows={3}
          placeholder="Nhập ghi chú của nhân viên"
        />
      </div>
      {success && <div className="alert alert-success mb-2">{success}</div>}
      {err && <div className="alert alert-danger mb-2">{err}</div>}
      <div className="modal-footer">
        <button className="btn btn-success" type="button" onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Đang lưu...
            </>
          ) : 'Lưu trạng thái'}
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={closeModal} disabled={loading}>Đóng</button>
      </div>
    </form>
  );
}

export default StaffDashboard;
