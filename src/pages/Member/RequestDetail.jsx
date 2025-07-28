// src/pages/Member/RequestDetail.jsx
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useAuth from '../../hooks/useAuth';
import api from '../../services/Api';
import styled from 'styled-components';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const Wrapper = styled.div`
  background: #f7f7f7;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
`;

const Main = styled.main`
  padding: 60px 0;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #dc3545;
  text-align: center;
  margin-bottom: 40px;
`;

const InfoBox = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(220,53,69,0.07);
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 28px;
  font-size: 1.08rem;
  color: #343a40;
`;

const Label = styled.span`
  display: inline-block;
  min-width: 140px;
  font-weight: 600;
  color: #dc3545;
`;

function RequestDetail() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setLoading(false);
      setError('Bạn cần đăng nhập để xem thông tin đăng ký hiến máu.');
      return;
    }
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/DonationRequest/byUser/${user.userId}`);
        setRequests(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        let msg = 'Đã xảy ra lỗi khi lấy thông tin đăng ký hiến máu.';
        if (err?.response?.status === 404) {
          msg = 'Không tìm thấy yêu cầu hiến máu cho tài khoản này.';
        } else if (err?.message) {
          msg = err.message;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [isAuthenticated, user?.userId]);

  return (
    <Wrapper>
      <Header />
      <Navbar />
      <Main className="container">
        <Title>Thông tin đăng ký hiến máu</Title>
        {loading && <InfoBox>Đang tải thông tin...</InfoBox>}
        {error && !loading && <InfoBox style={{ color: '#dc3545' }}>{error}</InfoBox>}
        {!loading && !error && requests.length === 0 && (
          <InfoBox>Không có yêu cầu hiến máu nào cho tài khoản này.</InfoBox>
        )}
        {!loading && !error && requests.length > 0 && (() => {
          // Sắp xếp theo requestDate giảm dần, đơn mới nhất lên đầu
          const sorted = [...requests].sort((a, b) => {
            const dateA = new Date(a.requestDate || 0);
            const dateB = new Date(b.requestDate || 0);
            return dateB - dateA;
          });
          return sorted.map((request, idx) => (
            <InfoBox key={request.requestId || idx} style={{ marginBottom: '32px' }}>
              <div><Label>Nhóm máu:</Label> {request.bloodTypeName || '---'} {request.rhFactor || ''}</div>
              <div><Label>Ngày yêu cầu:</Label> {request.requestDate ? new Date(request.requestDate).toLocaleDateString('vi-VN') : '---'}</div>
              <Button variant="outline-danger" style={{ marginTop: '16px' }} onClick={() => { setSelectedRequest(request); setShowModal(true); }}>
                Xem chi tiết
              </Button>
            </InfoBox>
          ));
        })()}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết yêu cầu hiến máu</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRequest && (
              <div>
                <div><Label>Mã yêu cầu:</Label> {selectedRequest.requestId || '---'}</div>
                <div><Label>Ngày đăng ký:</Label> {selectedRequest.requestDate ? new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN') : '---'}</div>
                <div><Label>Nhóm máu:</Label> {selectedRequest.bloodTypeName || '---'} {selectedRequest.rhFactor || ''}</div>
                <div><Label>Trạng thái:</Label> {
                  selectedRequest.status === 'Pending' ? 'Chờ duyệt' :
                  selectedRequest.status === 'Completed' ? 'Đã hoàn thành' :
                  selectedRequest.status === 'Rejected' ? 'Bị từ chối' :
                  selectedRequest.status === 'Accepted' ? 'Chấp nhận' :
                  selectedRequest.status === 'Cancel' ? 'Từ chối' :
                  selectedRequest.status || '---'
                }</div>
                <div><Label>Ngày hiến máu mong muốn:</Label> {selectedRequest.preferredDate ? new Date(selectedRequest.preferredDate).toLocaleDateString('vi-VN') : '---'}</div>
                <div><Label>Khung giờ mong muốn:</Label> {selectedRequest.preferredTimeSlot || '---'}</div>
                {selectedRequest.notes && <div><Label>Ghi chú:</Label> {selectedRequest.notes}</div>}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      </Main>
      <Footer />
    </Wrapper>
  );
}

export default RequestDetail;
