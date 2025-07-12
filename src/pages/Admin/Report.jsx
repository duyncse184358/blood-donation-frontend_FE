import React, { useEffect, useState, useContext } from 'react';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import api from '../../services/Api';
import { AuthContext } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement, TimeScale);

function Report() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [donationHistories, setDonationHistories] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho bộ lọc ngày
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [userRes, historyRes, bloodRes, requestRes] = await Promise.all([
          api.get('/ManageUserAccounts'),
          api.get('/DonationHistory'),
          api.get('/BloodUnit'),
          api.get('/DonationRequest'),
        ]);
        setUsers(userRes.data || []);
        setDonationHistories(historyRes.data || []);
        setBloodUnits(bloodRes.data || []);
        setDonationRequests(requestRes.data || []);
      } catch (err) {
        // handle error if needed
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated && user?.role === 'Admin') {
      fetchAll();
    }
  }, [isAuthenticated, user]);

  // Danh sách tất cả các nhóm máu phổ biến
  const ALL_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Thống kê người dùng theo vai trò
  const userRoleCount = users.reduce((acc, cur) => {
    const role = cur.roleName || cur.RoleName || 'Khác';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  // Thống kê kho máu theo nhóm máu (hiển thị đủ các loại, kể cả loại không có)
  const bloodTypeCount = ALL_BLOOD_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {});
  bloodUnits.forEach(cur => {
    if (cur.bloodTypeName && bloodTypeCount.hasOwnProperty(cur.bloodTypeName)) {
      bloodTypeCount[cur.bloodTypeName] += 1;
    }
  });

  // Thống kê số đơn hiến máu theo trạng thái
  const requestStatusCount = donationRequests.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    return acc;
  }, {});

  // Bộ lọc lịch sử hiến máu theo ngày
  let filteredHistories = donationHistories;
  if (dateRange.from) {
    filteredHistories = filteredHistories.filter(h => new Date(h.donationDate || h.createdAt) >= new Date(dateRange.from));
  }
  if (dateRange.to) {
    filteredHistories = filteredHistories.filter(h => new Date(h.donationDate || h.createdAt) <= new Date(dateRange.to + 'T23:59:59'));
  }

  // Thống kê lịch sử ghi nhận theo ngày (dạng tăng trưởng)
  const historyByDay = {};
  filteredHistories.forEach(h => {
    const date = new Date(h.donationDate || h.createdAt);
    const key = date.toISOString().slice(0, 10); // yyyy-mm-dd
    historyByDay[key] = (historyByDay[key] || 0) + 1;
  });

  // Tạo mảng ngày liên tục trong khoảng lọc để biểu đồ không bị đứt đoạn
  function getDateArray(start, end) {
    const arr = [];
    let dt = new Date(start);
    while (dt <= end) {
      arr.push(dt.toISOString().slice(0, 10));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }
  let dayLabels = Object.keys(historyByDay).sort();
  if (dateRange.from && dateRange.to) {
    dayLabels = getDateArray(new Date(dateRange.from), new Date(dateRange.to));
  } else if (dayLabels.length > 0) {
    dayLabels = getDateArray(new Date(dayLabels[0]), new Date(dayLabels[dayLabels.length - 1]));
  }

  const historyGrowthData = dayLabels.map(day => historyByDay[day] || 0);

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <main className="container my-5">
        <div className="alert alert-danger text-center mt-5">
          Bạn không có quyền truy cập trang này.
        </div>
      </main>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-danger text-center">
        <i className="fa-solid fa-chart-pie me-2"></i>
        Báo cáo tổng hợp hệ thống hiến máu
      </h2>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Đang tải dữ liệu...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Người sử dụng theo vai trò */}
          <div className="col-md-6">
            <div className="card shadow-sm p-3 border-0 rounded-4">
              <div className="d-flex align-items-center mb-3">
                <i className="fa-solid fa-users text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                <h5 className="mb-0 text-primary">Người sử dụng theo vai trò</h5>
              </div>
              <Doughnut
                data={{
                  labels: Object.keys(userRoleCount),
                  datasets: [{
                    data: Object.values(userRoleCount),
                    backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745', '#6c757d'],
                  }]
                }}
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                  },
                }}
              />
              <ul className="mt-3" style={{ fontSize: 15 }}>
                {Object.entries(userRoleCount).map(([role, count]) => (
                  <li key={role}>
                    <b>{role}:</b> {count} người dùng
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                {Object.entries(userRoleCount).map(([role, count]) => (
                  <div key={role} className="mb-3">
                    <h6 className="text-primary">
                      {role} ({count} người dùng):
                    </h6>
                    <ul style={{ paddingLeft: '1.5rem', fontSize: 14 }}>
                      {users
                        .filter(user => user.roleName === role || user.RoleName === role)
                        .map(user => (
                          <li key={user.id || user.userId}>
                            {user.username || user.email || 'Không rõ tên'}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kho máu theo nhóm máu */}
          <div className="col-md-6">
            <div className="card shadow-sm p-3 border-0 rounded-4">
              <div className="d-flex align-items-center mb-3">
                <i className="fa-solid fa-tint text-danger me-2" style={{ fontSize: '1.5rem' }}></i>
                <h5 className="mb-0 text-danger">Kho máu theo nhóm máu</h5>
              </div>
              <Bar
                data={{
                  labels: ALL_BLOOD_TYPES,
                  datasets: [{
                    label: 'Đơn vị máu',
                    data: ALL_BLOOD_TYPES.map(type => bloodTypeCount[type]),
                    backgroundColor: '#dc3545',
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
              <ul className="mt-3" style={{ fontSize: 15 }}>
                {ALL_BLOOD_TYPES.map(type => (
                  <li key={type}><b>Nhóm máu {type}:</b> {bloodTypeCount[type]} đơn vị</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lịch sử ghi nhận hiến máu */}
          <div className="col-md-12">
            <div className="card shadow-sm p-3 border-0 rounded-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <i className="fa-solid fa-calendar-alt text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                  <h5 className="mb-0 text-success">Lịch sử ghi nhận hiến máu theo ngày</h5>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <label className="mb-0">Từ</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    max={dateRange.to || undefined}
                    onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                    className="form-control"
                    style={{ width: 140 }}
                  />
                  <label className="mb-0 ms-2">Đến</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    min={dateRange.from || undefined}
                    onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                    className="form-control"
                    style={{ width: 140 }}
                  />
                  {(dateRange.from || dateRange.to) && (
                    <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => setDateRange({ from: '', to: '' })}>
                      Xóa lọc
                    </button>
                  )}
                </div>
              </div>
              <Line
                data={{
                  labels: dayLabels,
                  datasets: [{
                    label: 'Số lượt hiến máu',
                    data: historyGrowthData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40,167,69,0.1)',
                    tension: 0.2,
                    fill: true,
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: ctx => ` ${ctx.parsed.y} lượt hiến máu`
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: { display: true, text: 'Ngày' },
                      ticks: { autoSkip: true, maxTicksLimit: 14 }
                    },
                    y: {
                      title: { display: true, text: 'Số lượt hiến máu' },
                      beginAtZero: true,
                      precision: 0
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Số đơn hiến máu theo trạng thái */}
          <div className="col-md-6">
            <div className="card shadow-sm p-3 border-0 rounded-4">
              <div className="d-flex align-items-center mb-3">
                <i className="fa-solid fa-file-alt text-warning me-2" style={{ fontSize: '1.5rem' }}></i>
                <h5 className="mb-0 text-warning">Số đơn hiến máu theo trạng thái</h5>
              </div>
              <Pie
                data={{
                  labels: Object.keys(requestStatusCount),
                  datasets: [{
                    data: Object.values(requestStatusCount),
                    backgroundColor: ['#ffc107', '#007bff', '#dc3545', '#28a745', '#6c757d'],
                  }]
                }}
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                  },
                }}
              />
              <ul className="mt-3" style={{ fontSize: 15 }}>
                {Object.entries(requestStatusCount).map(([status, count]) => (
                  <li key={status}><b>{status}:</b> {count} đơn</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="mt-4 text-muted" style={{ fontSize: 15 }}>
        <b>Chú thích:</b> <br />
        - <b>Người sử dụng theo vai trò</b>: Thống kê số lượng tài khoản từng loại quyền trong hệ thống.<br />
        - <b>Kho máu theo nhóm máu</b>: Tổng số đơn vị máu hiện có chia theo từng nhóm máu.<br />
        - <b>Lịch sử ghi nhận hiến máu theo ngày</b>: Số lượt hiến máu được ghi nhận từng ngày, có thể lọc theo khoảng ngày.<br />
        - <b>Số đơn hiến máu theo trạng thái</b>: Thống kê số lượng đơn hiến máu ở từng trạng thái (đang chờ, đã duyệt, đã hoàn thành, v.v).
      </div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div>
  );
}

export default Report;