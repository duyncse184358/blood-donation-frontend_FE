import React, { useState } from 'react';
import api from '../../services/Api';

const BLOOD_TYPES = [
  { id: 1, name: 'A+' },
  { id: 2, name: 'A-' },
  { id: 3, name: 'B+' },
  { id: 4, name: 'B-' },
  { id: 5, name: 'AB+' },
  { id: 6, name: 'AB-' },
  { id: 7, name: 'O+' },
  { id: 8, name: 'O-' }
];

function DonorSearch() {
  const [bloodTypeId, setBloodTypeId] = useState('');
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setDonors([]);
    try {
      const res = await api.post('/DonorSearch/search', {
        bloodTypeId: Number(bloodTypeId),
        radiusInKm: Number(radius)
      });
      setMessage(res.data.message);
      setDonors(res.data.data || []);
    } catch {
      setMessage('Có lỗi xảy ra khi tìm kiếm.');
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h4>Tìm kiếm người hiến máu phù hợp</h4>
      <form className="row g-3 mb-4" onSubmit={handleSearch}>
        <div className="col-md-4">
          <label className="form-label">Nhóm máu</label>
          <select
            className="form-select"
            value={bloodTypeId}
            onChange={e => setBloodTypeId(e.target.value)}
            required
          >
            <option value="">Chọn nhóm máu...</option>
            {BLOOD_TYPES.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Bán kính (km)</label>
          <input
            type="number"
            className="form-control"
            min={1}
            value={radius}
            onChange={e => setRadius(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </form>
      {message && <div className="alert alert-info">{message}</div>}
      {donors.length > 0 && (
        <div>
          <h5>Kết quả:</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Địa chỉ</th>
                <th>Nhóm máu</th>
                <th>SĐT</th>
                <th>Lần hiến gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {donors.map(d => (
                <tr key={d.profileId}>
                  <td>{d.fullName}</td>
                  <td>{d.dateOfBirth}</td>
                  <td>
                    {d.gender === 1 || d.gender === 'Nam' || d.gender === 'Male'
                      ? 'Nam'
                      : d.gender === 2 || d.gender === 'Nữ' || d.gender === 'Female'
                      ? 'Nữ'
                      : d.gender === 3 || d.gender === 'Khác' || d.gender === 'Other'
                      ? 'Khác'
                      : ''}
                  </td>
                  <td>{d.address}</td>
                  <td>
                    {d.bloodTypeName
                      ? d.bloodTypeName
                      : BLOOD_TYPES.find(b => b.id === d.bloodTypeId)?.name || ''}
                  </td>
                  <td>{d.phoneNumber}</td>
                  <td>{d.lastDonationDate || 'Chưa có dữ liệu'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DonorSearch;