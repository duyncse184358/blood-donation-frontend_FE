import React from 'react';
import './Footer.css'; // Import the custom CSS for Footer
import { MapPin, Mail, Phone, Heart } from 'lucide-react'; // Import icons for contact info

function Footer() {
    return (
        <footer className="footer-container">
            <div className="container footer-content">
                <div className="footer-section footer-brand">
                    <Heart size={40} className="footer-heart-icon" />
                    <p className="footer-brand-name">Hệ thống Hiến máu</p>
                    <p className="footer-copyright">&copy; 2025. Mọi quyền được bảo lưu.</p>
                </div>

                <div className="footer-section footer-contact">
                    <h4 className="footer-heading">Liên hệ chúng tôi</h4>
                    <ul className="footer-contact-list">
                        <li>
                            <MapPin size={18} className="contact-icon" />
                            <span className="contact-text">Địa chỉ: Đường Lê Văn Việt, Phường Long Thạnh Mỹ, Quận 9, TP.HCM</span>
                        </li>
                        <li>
                            <Mail size={18} className="contact-icon" />
                            <span className="contact-text">Email: FPT@blooddonation.com</span>
                        </li>
                        <li>
                            <Phone size={18} className="contact-icon" />
                            <span className="contact-text">Điện thoại: 0822332952</span>
                        </li>
                    </ul>
                </div>

                <div className="footer-section footer-links">
                    <h4 className="footer-heading">Nhóm Chúng tôi</h4>
                    <ul className="footer-link-list">
                        <li><a href="/about" className="footer-link">---</a></li>
                        <li><a href="/register-donation" className="footer-link">Lý Gia Khiêm </a></li>
                        <li><a href="/donation-history" className="footer-link">Vũ Bảo Long</a></li>
                        <li><a href="/faq" className="footer-link">Nguyễn Chi Duy</a></li>
                        <li><a href="/privacy-policy" className="footer-link">Võ bá Minh Khôi</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom-bar">
                <p>&copy; 2025 Hệ thống Hiến máu. Được thiết kế bởi [Team 01 - SWP391 - SE1852]</p>
            </div>
        </footer>
    );
}

export default Footer;