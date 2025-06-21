// src/pages/Member/DonationHistory.jsx
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import { Droplet, Calendar, Ruler, TestTube, CheckCircle, Clock } from 'lucide-react';
import styled from 'styled-components';

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
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;

  .icon {
    font-size: 32px;
    color: #dc3545;
    margin-right: 15px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  }

  h5 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #343a40;
    margin-bottom: 0;

    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }
`;

const DetailsList = styled.ul`
  padding-left: 0;
  list-style: none;
  font-size: 0.95rem;
  color: #495057;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ListItem = styled.li`
  padding: 6px 0;
  border-bottom: 1px dashed #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: #212529;
    min-width: 120px;
    display: inline-block;

    @media (max-width: 576px) {
      min-width: 100px;
    }
  }
  .list-icon {
    vertical-align: middle;
    margin-right: 5px;
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
      } catch (err) {
        let msg = 'Đã xảy ra lỗi khi lấy lịch sử hiến máu. Vui lòng thử lại sau.';
        if (err?.response?.status === 404) {
          msg = 'Không tìm thấy lịch sử hiến máu cho tài khoản này.';
        } else if (err?.message) {
          msg = err.message;
        }
        setError(msg);
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
    if (s === 'completed' || s === 'complete') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'cancelled' || s === 'no show' || s === 'rejected') return 'secondary';
    return 'secondary';
  };

  const getStatusText = (status) => {
    if (!status) return '---';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'complete') return 'Đã hoàn thành';
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
          <InfoMessageBox className="error">
            {error}
          </InfoMessageBox>
        )}

        {!error && history.length === 0 && (
          <InfoMessageBox className="no-data">
            Bạn chưa có lịch sử hiến máu nào.
          </InfoMessageBox>
        )}

        {!error && history.length > 0 && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {history.map((item, idx) => (
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
                      <ListItem>
                        <strong>
                          <Droplet size={18} className="list-icon" />
                          Thành phần hiến:
                        </strong>
                        {item.componentName || '---'}
                      </ListItem>
                      <ListItem>
                        <strong><Ruler size={18} className="list-icon" />Thể tích:</strong>
                        {item.quantityMl ? `${item.quantityMl} ml` : '---'}
                      </ListItem>
                      <ListItem>
                        <strong><TestTube size={18} className="list-icon" />Kết quả xét nghiệm:</strong>
                        {item.testingResults || '---'}
                      </ListItem>
                      <ListItem>
                        <strong><CheckCircle size={18} className="list-icon" />Trạng thái đủ điều kiện:</strong>
                        {getEligibilityText(item.eligibilityStatus)}
                      </ListItem>
                      <ListItem>
                        <strong><Clock size={18} className="list-icon" />Trạng thái:</strong>
                        <StatusBadge className={`bg-${getStatusBadgeClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </StatusBadge>
                      </ListItem>
                      <ListItem>
                        <strong>Mã đơn hiến máu:</strong> {item.donationRequestId || '---'}
                      </ListItem>
                    </DetailsList>
                    {item.descriptions && <div className="text-muted small mt-2">Ghi chú: {item.descriptions}</div>}
                  </CardBody>
                </DonationCard>
              </div>
            ))}
          </div>
        )}
      </DonationHistoryMain>
      <Footer />
    </DonationHistoryWrapper>
  );
}

export default DonationHistory;