// src/pages/Member/DonationHistory.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import { Droplet, Calendar, Ruler, TestTube, CheckCircle, Clock } from 'lucide-react';
import { keyframes } from 'styled-components';
import { translateStatus, translateDate, translateBloodType } from '../../utils/translationUtils';
import TranslatedStatus from '../../components/Shared/TranslatedStatus';


// Animation cho modal
const fadeInModal = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// === ĐỊNH NGHĨA CÁC COMPONENT ĐƯỢC STYLE ===

const DonationHistoryWrapper = styled.div`
  background: #f7f7f7;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
`;

const DonationHistoryMain = styled.main`
  padding: 60px 0;
`;

const DonationHistoryHeader = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #dc3545;
  text-align: center;
  margin-bottom: 45px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 30px;
  }
  @media (max-width: 576px) {
    font-size: 1.8rem;
  }
`;

const InfoMessageBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  font-size: 1.2rem;
  color: #6c757d;
  text-align: center;
  padding: 30px;

  &.error {
    color: #dc3545;
    border: 1px solid #dc3545;
    background-color: #ffebeb;
  }
  &.no-data {
    color: #007bff;
    border: 1px solid #007bff;
    background-color: #e0f0ff;
  }
`;

const DonationCard = styled.div`
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  background: #fff;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  overflow: hidden;
  height: 100%;

  &:hover {
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    transform: translateY(-5px);
  }
`;

const CardBody = styled.div`
  padding: 25px;

  @media (max-width: 576px) {
    padding: 20px;
  }
`;

const CardTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  padding: 18px 0 10px 0;
  border-bottom: 2px solid #f3d6db;
  background: linear-gradient(90deg, #fff 60%, #ffe5ea 100%);
  border-radius: 12px 12px 0 0;

  .icon {
    font-size: 38px;
    color: #dc3545;
    margin-bottom: 6px;
    margin-right: 0;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 6px rgba(220,53,69,0.12));
    @media (max-width: 768px) {
      font-size: 32px;
    }
  }

  h5 {
    font-size: 1.7rem;
    font-weight: 700;
    color: #dc3545;
    margin-bottom: 0;
    letter-spacing: 1px;
    text-shadow: 0 2px 8px rgba(220,53,69,0.08);
    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }
`;

const DetailsList = styled.ul`
  padding-left: 0;
  list-style: none;
  font-size: 1.05rem;
  color: #495057;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ListItem = styled.li`
  padding: 10px 0 2px 0;
  border-bottom: none;
  width: 100%;
  text-align: center;

  strong {
    color: #dc3545;
    font-size: 1.08rem;
    font-weight: 600;
    background: #ffe5ea;
    border-radius: 8px;
    padding: 6px 16px;
    box-shadow: 0 2px 8px rgba(220,53,69,0.07);
    display: inline-block;
    margin-bottom: 4px;
    @media (max-width: 576px) {
      padding: 5px 10px;
      font-size: 1rem;
    }
  }
  .list-icon {
    vertical-align: middle;
    margin-right: 7px;
    color: #dc3545;
    font-size: 1.1em;
  }
`;

const StatusBadge = styled.span`
  padding: .4em .7em;
  border-radius: .5rem;
  font-weight: 500;
  display: inline-block;
  text-transform: capitalize;

  &.bg-success {
    background-color: #28a745;
    color: #fff;
  }
  &.bg-warning {
    background-color: #ffc107;
    color: #343a40;
  }
  &.bg-secondary {
    background-color: #6c757d;
    color: #fff;
  }
`;

// === COMPONENT CHÍNH ===

function DonationHistory() {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);


  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setLoading(false);
      setError('Bạn cần đăng nhập để xem lịch sử hiến máu.');
      return;
    }
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/DonationHistory/by-donor/${user.userId}`);
        setHistory(Array.isArray(response.data) ? response.data : []);
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          setError('Bạn chưa có lịch sử hiến máu nào.');
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setError('Bạn chưa có lịch sử hiến máu nào.');
        } else {
          let msg = 'Đã xảy ra lỗi khi lấy lịch sử hiến máu. Vui lòng thử lại sau.';
          if (err?.message) msg = err.message;
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [isAuthenticated, user?.userId]);

  // Hàm lấy màu badge và chuyển trạng thái sang tiếng Việt
  const getStatusBadgeClass = (status) => {
    if (!status) return 'secondary';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'complete' || s === 'certificated') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'cancelled' || s === 'no show' || s === 'rejected') return 'secondary';
    return 'secondary';
  };

  const getStatusText = (status) => {
    if (!status) return '---';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'complete') return 'Đã hoàn thành';
    if (s === 'certificated') return 'Đã cấp chứng nhận';
     if (s === 'Use') return 'dùng chứng chỉ';
     if (s === 'Used') return 'Đã sử dụng chứng chỉ';
    if (s === 'pending') return 'Đang chờ';
    if (s === 'cancelled') return 'Đã hủy';
    if (s === 'no show') return 'Không đến';
    if (s === 'rejected') return 'Bị từ chối';
    return status;
  };

  const getEligibilityText = (status) => {
    if (!status) return '---';
    if (status.toLowerCase() === 'eligible') return 'Đủ điều kiện';
    if (status.toLowerCase() === 'ineligible') return 'Không đủ điều kiện';
    return status;
  };

  if (loading) {
    return (
      <DonationHistoryWrapper>
        <Header />
        <Navbar />
        <DonationHistoryMain className="container">
          <DonationHistoryHeader>Lịch sử hiến máu của bạn</DonationHistoryHeader>
          <InfoMessageBox>
            Đang tải lịch sử hiến máu...
          </InfoMessageBox>
        </DonationHistoryMain>
        <Footer />
      </DonationHistoryWrapper>
    );
  }

  return (
    <DonationHistoryWrapper>
      <Header />
      <Navbar />
      <DonationHistoryMain className="container">
        <DonationHistoryHeader>Lịch sử hiến máu của bạn</DonationHistoryHeader>

        {error && (
          <InfoMessageBox className={error === 'Bạn chưa có lịch sử hiến máu nào.' ? 'no-data' : 'error'}>
            {error}
          </InfoMessageBox>
        )}

        {!error && history.length > 0 && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {history
              .slice()
              .sort((a, b) => {
                const dateA = a.donationDate ? new Date(a.donationDate) : new Date(0);
                const dateB = b.donationDate ? new Date(b.donationDate) : new Date(0);
                return dateB - dateA;
              })
              .map((item, idx) => {
                return (
                  <div className="col" key={item.donationId || idx}>
                    <DonationCard>
                      <CardBody>
                        <CardTitleGroup>
                          <Droplet className="mr-2 h-5 w-5 text-red-500" />
                          <h5>
                            {item.bloodTypeName || 'Nhóm máu'} {item.rhFactor}
                          </h5>
                        </CardTitleGroup>
                        <DetailsList>
                          <ListItem>
                            <strong><Calendar size={18} className="list-icon" />Ngày hiến:</strong>
                            {item.donationDate ? new Date(item.donationDate).toLocaleDateString('vi-VN') : '---'}
                          </ListItem>
                        </DetailsList>
                        <button className="btn btn-outline-primary btn-sm mt-2 me-2" onClick={() => { setSelectedItem(item); setShowModal(true); }}>Xem chi tiết</button>
                      </CardBody>
                    </DonationCard>
                  </div>
                );
              })}
          </div>
        )}

        {/* Modal xem chi tiết lịch sử hiến máu */}
        {showModal && selectedItem && (
          <StyledModalOverlay onClick={() => setShowModal(false)}>
            <StyledModalDialog onClick={e => e.stopPropagation()}>
              <StyledModalContent>
                <StyledModalHeader>
                  <h5>Chi tiết lịch sử hiến máu</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Đóng"></button>
                </StyledModalHeader>
                <StyledModalBody>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item"><b>Ngày hiến máu:</b> {selectedItem.donationDate ? new Date(selectedItem.donationDate).toLocaleString('vi-VN') : '---'}</li>
                    <li className="list-group-item"><b>Nhóm máu:</b> {selectedItem.bloodTypeName || '---'} {selectedItem.rhFactor || ''}</li>
                    <li className="list-group-item"><b>Thể tích:</b> {selectedItem.quantityMl ? `${selectedItem.quantityMl} ml` : '---'}</li>
                    <li className="list-group-item"><b>Kết quả xét nghiệm:</b> {selectedItem.testingResults || '---'}</li>
                    <li className="list-group-item"><b>Trạng thái đủ điều kiện:</b> {getEligibilityText(selectedItem.eligibilityStatus)}</li>
                    <li className="list-group-item"><b>Trạng thái:</b> {getStatusText(selectedItem.status)}</li>
                    {selectedItem.descriptions && <li className="list-group-item"><b>Ghi chú:</b> {selectedItem.descriptions}</li>}
                  </ul>
                </StyledModalBody>
                <StyledModalFooter>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
                </StyledModalFooter>
              </StyledModalContent>
            </StyledModalDialog>
          </StyledModalOverlay>
        )}

      </DonationHistoryMain>
      <Footer />
    </DonationHistoryWrapper>
  );
}

export default DonationHistory;
// Styled-components cho modal
const StyledModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
`;

const StyledModalDialog = styled.div`
  max-width: 540px;
  width: 100%;
  background: transparent;
  border-radius: 18px;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledModalContent = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(220,53,69,0.15), 0 1.5px 6px rgba(0,0,0,0.08);
  width: 100%;
  overflow: hidden;
  animation: ${fadeInModal} 0.25s;
`;

const StyledModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px 12px 28px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  h5 {
    font-size: 1.35rem;
    font-weight: 700;
    color: #dc3545;
    margin: 0;
  }
  .btn-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #888;
    cursor: pointer;
    padding: 0 0 0 8px;
    transition: color 0.2s;
  }
  .btn-close:hover {
    color: #dc3545;
  }
`;

const StyledModalBody = styled.div`
  padding: 18px 28px;
  background: #fff;
  ul.list-group {
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(220,53,69,0.07);
    background: #fafbfc;
    font-size: 1rem;
  }
  ul.list-group li.list-group-item {
    border: none;
    padding: 10px 0;
    color: #343a40;
  }
  ul.list-group li.list-group-item b {
    color: #dc3545;
    font-weight: 600;
  }
`;

const StyledModalFooter = styled.div`
  padding: 16px 28px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  border-radius: 0 0 18px 18px;
`;