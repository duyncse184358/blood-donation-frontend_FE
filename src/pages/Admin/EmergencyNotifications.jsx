// src/pages/Member/EmergencyNotifications.jsx
import React from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

function EmergencyNotifications() {
  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5">
        <h1 className="text-center mb-4 text-danger">Thông báo Hiến máu Khẩn cấp</h1>
        <p className="text-center lead">
          Bạn có thể phản hồi các yêu cầu hiến máu khẩn cấp tại đây.
        </p>
        <div className="p-4 bg-light rounded shadow-sm mt-4">
          <p>Danh sách các yêu cầu hiến máu khẩn cấp phù hợp với bạn sẽ được hiển thị tại đây.</p>
          <p>Mỗi thông báo sẽ bao gồm thông tin về nhóm máu, vị trí, và mức độ khẩn cấp, cùng với nút "Chấp nhận" hoặc "Từ chối".</p>
          {/* Example: List of emergency notifications */}
          {/* <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title text-danger">Yêu cầu khẩn cấp: Nhóm máu O- tại Bệnh viện X</h5>
              <p className="card-text">Bệnh nhân cần O- gấp. Khoảng cách: 5km. Thời gian còn lại: 2 giờ.</p>
              <button className="btn btn-success me-2">Chấp nhận</button>
              <button className="btn btn-outline-secondary">Từ chối</button>
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title text-danger">Yêu cầu khẩn cấp: Nhóm máu A+ tại Phòng khám Y</h5>
              <p className="card-text">Cần A+ khẩn cấp. Khoảng cách: 12km. Thời gian còn lại: 4 giờ.</p>
              <button className="btn btn-success me-2">Chấp nhận</button>
              <button className="btn btn-outline-secondary">Từ chối</button>
            </div>
          </div> */}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default EmergencyNotifications;
