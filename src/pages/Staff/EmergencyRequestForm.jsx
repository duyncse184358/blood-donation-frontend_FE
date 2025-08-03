import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Api';
import { AuthContext } from '../../context/AuthContext';

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
const PRIORITIES = [
  { value: 'High', label: 'Khẩn cấp' },
  { value: 'Medium', label: 'Cao' },
  { value: 'Low', label: 'Bình thường' }
];

function EmergencyRequestForm() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    bloodTypeId: '',
    componentId: 1, // Luôn gửi 1, không cần cho user chọn
    quantityNeededMl: '',
    priority: 'High',
    dueDate: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setLoading(true);

    // Validate số lượng máu
    if (!form.quantityNeededMl || form.quantityNeededMl <= 0) {
      setErr('Số lượng máu phải lớn hơn 0ml');
      setLoading(false);
      return;
    }
    if (form.quantityNeededMl > 450) {
      setErr('Số lượng máu không được vượt quá 450ml');
      setLoading(false);
      return;
    }

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
        componentId: 1,
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
    <div className="emergency-request-container">
      <form className="emergency-request-form" onSubmit={handleSubmit}>
        <h4 className="form-title">
          <i className="fa-solid fa-droplet text-danger me-2"></i>
          Tạo yêu cầu máu khẩn cấp
        </h4>
        
        <div className="form-row">
          <div className="form-group col-md-6">
            <label className="form-label">Nhóm máu <span className="text-danger">*</span></label>
            <select className="form-select custom-select" name="bloodTypeId" value={form.bloodTypeId} onChange={handleChange} required>
              <option value="">Chọn nhóm máu</option>
              {BLOOD_TYPES.map(bt => (
                <option key={bt.id} value={bt.id}>{bt.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group col-md-6">
            <label className="form-label">Số lượng cần (ml) <span className="text-danger">*</span></label>
            <input 
              type="number" 
              className="form-control custom-input" 
              name="quantityNeededMl" 
              value={form.quantityNeededMl} 
              onChange={handleChange} 
              min={1}
              max={450}
              required 
              placeholder="Nhập số lượng (tối đa 450ml)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label className="form-label">Mức độ ưu tiên <span className="text-danger">*</span></label>
            <select className="form-select custom-select" name="priority" value={form.priority} onChange={handleChange} required>
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group col-md-6">
            <label className="form-label">Hạn cần máu <span className="text-danger">*</span></label>
            <input
              type="datetime-local"
              className="form-control custom-input"
              name="dueDate"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mô tả chi tiết</label>
          <textarea 
            className="form-control custom-textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            placeholder="Nhập mô tả thêm về yêu cầu (nếu có)"
          />
        </div>

        {(err || msg) && (
          <div className="alert-container">
            {err && <div className="alert alert-danger">{err}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/staff/blood-request-management')}
          >
            <i className="fa-solid fa-list-check me-2"></i>
            Quản Lý Đơn Đã Tạo
          </button>
          <button 
            type="submit" 
            className="btn btn-danger" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane me-2"></i>
                Tạo yêu cầu
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .emergency-request-container {
          padding: 2rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
        }

        .emergency-request-form {
          max-width: 900px;
          margin: 0 auto;
        }

        .form-title {
          color: #dc3545;
          font-weight: 600;
          font-size: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f8d7da;
        }

        .form-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .form-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #495057;
        }

        .custom-select,
        .custom-input,
        .custom-textarea {
          border: 1px solid #ced4da;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .custom-select:focus,
        .custom-input:focus,
        .custom-textarea:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        .custom-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .alert-container {
          margin: 1.5rem 0;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e9ecef;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .btn-outline-secondary {
          color: #6c757d;
          border: 1px solid #6c757d;
        }

        .btn-outline-secondary:hover {
          background: #6c757d;
          color: #fff;
        }

        .btn-danger {
          background: #dc3545;
          border: none;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          
          .form-group {
            margin-bottom: 1rem;
          }
          
          .form-actions {
            flex-direction: column-reverse;
            gap: 1rem;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default EmergencyRequestForm;