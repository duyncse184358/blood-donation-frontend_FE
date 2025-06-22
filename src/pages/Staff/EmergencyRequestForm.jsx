import React, { useState, useContext } from 'react';
import api from '../../services/Api';
import { AuthContext } from '../../context/AuthContext';

const BLOOD_TYPES = [
  { id: 1, name: 'A+' }, { id: 2, name: 'A-' },
  { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
  { id: 5, name: 'AB+' }, { id: 6, name: 'AB-' },
  { id: 7, name: 'O+' }, { id: 8, name: 'O-' }
];
const COMPONENTS = [
  { id: 1, name: 'Hồng cầu' },
  { id: 2, name: 'Huyết tương' },
  { id: 3, name: 'Tiểu cầu' },
  { id: 4, name: 'Máu toàn phần' }
];
const PRIORITIES = [
  { value: 'High', label: 'Khẩn cấp' },
  { value: 'Medium', label: 'Cao' },
  { value: 'Low', label: 'Bình thường' }
];

function EmergencyRequestForm() {
  const { user } = useContext(AuthContext); // Lấy userId nếu cần
  const [form, setForm] = useState({
    bloodTypeId: '',
    componentId: '',
    quantityNeededMl: '',
    priority: 'High',
    dueDate: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setLoading(true);
    try {
      // Gửi đúng payload, không cần userId vì BE lấy từ token
      const payload = {
        bloodTypeId: Number(form.bloodTypeId),
        componentId: Number(form.componentId),
        quantityNeededMl: Number(form.quantityNeededMl),
        priority: form.priority,
        dueDate: form.dueDate,
        description: form.description
      };
      await api.post('/EmergencyRequest/create', payload);
      setMsg('Tạo yêu cầu máu khẩn cấp thành công!');
      setForm({
        bloodTypeId: '',
        componentId: '',
        quantityNeededMl: '',
        priority: 'High',
        dueDate: '',
        description: ''
      });
    } catch (error) {
      setErr(
        error?.response?.data?.message ||
        'Tạo yêu cầu thất bại. Vui lòng kiểm tra lại thông tin!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="row g-3" onSubmit={handleSubmit}>
      <h4 className="mb-3">Tạo yêu cầu máu khẩn cấp</h4>
      <div className="col-md-6">
        <label className="form-label">Nhóm máu</label>
        <select className="form-select" name="bloodTypeId" value={form.bloodTypeId} onChange={handleChange} required>
          <option value="">Chọn nhóm máu</option>
          {BLOOD_TYPES.map(bt => (
            <option key={bt.id} value={bt.id}>{bt.name}</option>
          ))}
        </select>
      </div>
{/*       
      <div className="col-md-6">
        <label className="form-label">Thành phần máu</label>
        <select className="form-select" name="componentId" value={form.componentId} onChange={handleChange} required>
          <option value="">Chọn thành phần</option>
          {COMPONENTS.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div> */}

      <div className="col-md-4">
        <label className="form-label">Số lượng cần (ml)</label>
        <input type="number" className="form-control" name="quantityNeededMl" value={form.quantityNeededMl} onChange={handleChange} min={1} required />
      </div>
      <div className="col-md-4">
        <label className="form-label">Mức độ ưu tiên</label>
        <select className="form-select" name="priority" value={form.priority} onChange={handleChange} required>
          {PRIORITIES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      <div className="col-md-4">
        <label className="form-label">Hạn cần máu</label>
        <input type="date" className="form-control" name="dueDate" value={form.dueDate} onChange={handleChange} required />
      </div>
      <div className="col-12">
        <label className="form-label">Mô tả (tùy chọn)</label>
        <textarea className="form-control"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="3"
          placeholder="Nhập mô tả thêm về yêu cầu (nếu có)"
        />
      </div>
      <div className="col-12">
        {err && <div className="alert alert-danger">{err}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}
      </div>
      <div className="col-12">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Tạo yêu cầu'}
        </button>
      </div>
    </form>
  );
}

export default EmergencyRequestForm;