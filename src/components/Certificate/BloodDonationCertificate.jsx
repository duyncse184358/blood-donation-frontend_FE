import React, { useRef, useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './BloodDonationCertificate.css';


function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

const BloodDonationCertificate = ({ data, onClose, onProfileNameLoaded }) => {
  const certRef = useRef();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await import('../../services/Api');
        const api = res.default;
        const userId = data?.userId;
        if (userId) {
          const profileRes = await api.get(`/UserProfile/by-user/${userId}`);
          if (!ignore) {
            setProfile(profileRes.data);
            if (profileRes.data && profileRes.data.fullName && typeof onProfileNameLoaded === 'function') {
              onProfileNameLoaded(profileRes.data.fullName);
            }
          }
        }
      } catch {
        if (!ignore) setProfile(null);
      }
      if (!ignore) setLoading(false);
    }
    fetchProfile();
    return () => { ignore = true; };
  }, [data?.userId]);

  // Merge profile and data
  const merged = {
    ...data,
    ...(profile || {}),
  };

  // Map gender to Vietnamese
  function getGenderVN(gender) {
    if (!gender) return '';
    if (gender.toLowerCase() === 'male') return 'Nam';
    if (gender.toLowerCase() === 'female') return 'Nữ';
    return gender;
  }

  return (
    <div className="certificate-modal">
      <div className="certificate-content" ref={certRef}>
        <div className="cert-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontStyle: 'italic', fontSize: 15 }}>Độc lập - Tự do - Hạnh phúc</div>
          <hr style={{ margin: '8px 0' }} />
          <h2 style={{ color: '#b30000', margin: '12px 0', fontSize: '24px', fontWeight: 'bold' }}>
            GIẤY CHỨNG NHẬN HIẾN MÁU TÌNH NGUYỆN
          </h2>
        </div>
        
        <div className="cert-body" style={{ lineHeight: '1.8', fontSize: '16px' }}>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Đơn vị cấp:</b> {merged.organization || 'Hệ thống hỗ trợ hiến máu'}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Họ và tên:</b> {loading ? 'Đang tải...' : (profile?.fullName || 'Không rõ')}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Số điện thoại:</b> {profile?.phoneNumber || profile?.phone || merged.phoneNumber || merged.phone || ''}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>CCCD/CMND:</b> {profile?.idNumber || profile?.cccd || profile?.identityNumber || profile?.cmnd || profile?.citizenId || merged.idNumber || merged.cccd || merged.identityNumber || merged.cmnd || merged.citizenId}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Ngày sinh:</b> {formatDateVN(profile?.birthDate || profile?.dateOfBirth || profile?.dob || merged.birthDate || merged.dateOfBirth || merged.dob)}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Giới tính:</b> {getGenderVN(profile?.gender || merged.gender)}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Địa chỉ:</b> {profile?.address || profile?.homeAddress || profile?.permanentAddress || profile?.currentAddress || merged.address || merged.homeAddress || merged.permanentAddress || merged.currentAddress}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Đã hiến máu tình nguyện tại:</b> {merged.location || 'Đường Lê Văn Việt, Phường Long Thạnh Mỹ, Quận 9, TP.HCM'}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Số lượng:</b> {merged.quantity || merged.quantityMl} ml
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Ngày hiến máu:</b> {formatDateVN(merged.donationDate)}
          </div>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <b>Số chứng nhận:</b> {merged.certificateNo}
          </div>
          {merged.patientName && (
            <div style={{ marginBottom: '8px', textAlign: 'left' }}>
              <b>Người bệnh luôn ghi ơn:</b> {merged.patientName}
            </div>
          )}
        </div>
        <div className="cert-benefit" style={{ 
          margin: '20px 0', 
          background: '#f8f8f8', 
          borderRadius: 8, 
          padding: 16,
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            fontSize: '18px',
            color: '#b30000',
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            HIẾN MÁU CỨU NGƯỜI<br />
            MỘT NGHĨA CỬ CAO ĐẸP
          </div>
          <ol style={{ 
            marginTop: 8, 
            marginBottom: 0, 
            paddingLeft: '20px',
            lineHeight: '1.6',
            fontSize: '14px',
            textAlign: 'left'
          }}>
            <li style={{ marginBottom: '8px' }}>
              Giấy chứng nhận này được trao cho người hiến máu sau mỗi lần hiến máu tình nguyện.
            </li>
            <li style={{ marginBottom: '8px' }}>
              Có giá trị để được truyền máu miễn phí bằng số lượng máu đã hiến, khi bản thân người hiến máu có nhu cầu sử dụng máu tại tất cả các cơ sở y tế công lập trên toàn quốc.
            </li>
            <li style={{ marginBottom: '8px' }}>
              Người hiến máu cần xuất trình Giấy chứng nhận này để làm cơ sở cho các cơ sở y tế thực hiện việc truyền máu miễn phí.
            </li>
            <li style={{ marginBottom: '8px' }}>
              Cơ sở y tế có trách nhiệm kiểm tra, đối chiếu, xác nhận số lượng máu đã truyền miễn phí cho người hiến máu vào giấy chứng nhận.
            </li>
          </ol>
        </div>
        <div className="cert-footer" style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'flex-end', 
          marginTop: 20 
        }}>
          <div style={{ 
            textAlign: 'center', 
            minWidth: 220,
            lineHeight: '1.6'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              TM. Hệ thống hỗ trợ hiến máu
            </div>
            <div style={{ fontStyle: 'italic', margin: '4px 0' }}>
              Quản lý cơ sở y tế
            </div>
            <div style={{ 
              fontWeight: 600, 
              marginTop: '40px',
              fontSize: '16px'
            }}>
              Nguyễn Chi Duy
            </div>
          </div>
        </div>
        <div className="cert-hospital-confirm" style={{ 
          marginTop: 24, 
          borderTop: '1px dashed #aaa', 
          paddingTop: 16 
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '18px',
            textAlign: 'center',
            color: '#b30000',
            marginBottom: '16px'
          }}>
            CHỨNG NHẬN CỦA CƠ SỞ Y TẾ ĐÃ TRUYỀN MÁU
          </div>
          
          <div style={{ 
            marginTop: 12, 
            fontSize: 16,
            lineHeight: '1.8',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '8px' }}>
              {merged.donationDate ? (
                `Ngày ${(() => {
                  const d = new Date(merged.donationDate);
                  return `${d.getDate().toString().padStart(2, '0')} tháng ${(d.getMonth()+1).toString().padStart(2, '0')} năm ${d.getFullYear()}`;
                })()} `
              ) : (
                'Ngày ..... tháng ..... năm ..... '
              )}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <b>Số lượng:</b> {(merged.quantity || merged.quantityMl) ? `${merged.quantity || merged.quantityMl} ml` : '..... ml'}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <b>Nhóm máu:</b> {merged.bloodType ? merged.bloodType : "Không rõ"}
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginTop: 20,
              marginBottom: 16
            }}>
              {/* Đóng dấu SVG */}
              <div style={{ textAlign: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ opacity: 0.85 }}>
                  <circle cx="40" cy="40" r="36" stroke="#b30000" strokeWidth="4" fill="none" />
                  <text x="40" y="46" textAnchor="middle" fill="#b30000" fontSize="16" fontWeight="bold">
                    ĐÓNG DẤU
                  </text>
                </svg>
                <div style={{ 
                  fontSize: '12px', 
                  fontStyle: 'italic',
                  marginTop: '4px',
                  color: '#666'
                }}>
                  Đóng dấu
                </div>
              </div>
              
              {/* Chữ ký SVG */}
              <div style={{ textAlign: 'center' }}>
                <svg width="120" height="60" viewBox="0 0 120 60" style={{ opacity: 0.85 }}>
                  <path d="M10,40 Q40,10 60,40 Q80,70 110,20" stroke="#222" strokeWidth="2" fill="none" />
                  <text x="60" y="55" textAnchor="middle" fill="#222" fontSize="16" fontStyle="italic" fontFamily="cursive">
                    Nguyễn Chi Duy
                  </text>
                </svg>
                <div style={{ 
                  fontSize: '12px', 
                  fontStyle: 'italic',
                  marginTop: '4px',
                  color: '#666'
                }}>
                  Chữ ký
                </div>
              </div>
            </div>
            
            <div style={{ 
              fontStyle: 'italic', 
              textAlign: 'center',
              fontSize: '14px',
              color: '#666',
              marginTop: 12
            }}>
              (Chữ ký, đóng dấu của cơ sở y tế)
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BloodDonationCertificate;