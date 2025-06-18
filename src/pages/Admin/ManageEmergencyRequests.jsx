// src/pages/Admin/ManageEmergencyRequests.jsx
import React from 'react';
import Header from '../../components/Shared/Header';
import Navbar from '../../components/Shared/Navbar';
import Footer from '../../components/Shared/Footer';

function ManageEmergencyRequests() {
  return (
    <div className="page-wrapper">
      <Header />
      <Navbar />
      <main className="container my-5">
        <h1 className="text-center mb-4 text-warning">Quản lý Yêu cầu Hiến máu Khẩn cấp</h1>
        <p className="text-center lead">
          Tạo và gửi các thông báo yêu cầu hiến máu khẩn cấp đến các thành viên phù hợp.
        </p>
        <div className="p-4 bg-light rounded shadow-sm mt-4">
          <p>Form tạo yêu cầu khẩn cấp, bao gồm chọn nhóm máu, số lượng, địa điểm, và mức độ ưu tiên.</p>
          <p>Chức năng tìm kiếm thành viên phù hợp theo khoảng cách và nhóm máu, sau đó gửi thông báo đến họ.</p>
          {/* Example: Form for creating an emergency request */}
          {/* <form>
            <div className="mb-3">
              <label htmlFor="bloodType" className="form-label">Nhóm máu cần</label>
              <input type="text" className="form-control" id="bloodType" placeholder="Ví dụ: O+" />
            </div>
            <div className="mb-3">
              <label htmlFor="location" className="form-label">Địa điểm yêu cầu</label>
              <input type="text" className="form-control" id="location" placeholder="Ví dụ: Bệnh viện X" />
            </div>
            <div className="mb-3">
              <label htmlFor="quantity" className="form-label">Số lượng (ml)</label>
              <input type="number" className="form-control" id="quantity" />
            </div>
            <button type="submit" className="btn btn-warning">Tạo và Gửi Thông báo</button>
          </form> */}
        </div>
        <div className="p-4 bg-light rounded shadow-sm mt-4">
            <h5 className="text-warning">Danh sách các yêu cầu khẩn cấp đã gửi và trạng thái phản hồi:</h5>
            <p>Hiển thị danh sách các yêu cầu đã gửi, số người phản hồi, và User ID của Member đã chấp nhận.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ManageEmergencyRequests;
