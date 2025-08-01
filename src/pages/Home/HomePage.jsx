// src/pages/Member/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import useAuth from '../../hooks/useAuth';
import './HomePage.css'; // Import your custom CSS for HomePage

// Import icons from lucide-react
import {
    ShieldCheck,
    CheckCircle,
    Clock,
    HeartPulse,
    Activity,
    Users,
    Smile,
    CalendarDays,
    Syringe,
    Heart,
    ClipboardCheck,
    Hospital,
    Minus // Changed from LineDashed to Minus
} from 'lucide-react';


function HomePage() {
    const { isAuthenticated, isMember } = useAuth();

    return (
        <div className="homepage-wrapper">
            <Header />
            <Navbar />
            <main className="home-content">
                {/* Hero Section */}
                <section className="hero-section text-center text-white d-flex align-items-center justify-content-center">
                    <div className="container">
                        <h1 className="display-4 mb-3">Hiến máu cứu người, Trao sự sống!</h1>
                        <p className="lead mb-4">
                            Mỗi giọt máu cho đi là một cuộc đời ở lại. Hãy tham gia cùng chúng tôi để tạo nên sự khác biệt.
                        </p>
                        <div className="hero-buttons">
                            {isAuthenticated && isMember ? (
                                <Link to="/member/dashboard" className="btn btn-danger btn-lg me-3 hero-cta">Đi tới Trang thành viên</Link>
                            ) : (
                                <Link to="/register" className="btn btn-danger btn-lg me-3 hero-cta">Đăng ký Thành Viên</Link>
                            )}
                            <Link to="/documentation" className="btn btn-outline-light btn-lg hero-cta-secondary">Tìm Hiểu Thêm</Link>
                        </div>
                    </div>
                </section>

                {/* About Us Section - Updated to be more visually appealing */}
                <section className="about-section py-5">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-10 text-center">
                                <h2 className="mb-4 text-dark">Về Chúng Tôi</h2>
                                {/* Decorative elements for the About section title */}
                                <div className="about-decoration mb-5">
                                    <Minus className="about-line-icon" /> {/* Changed to Minus icon */}
                                    <Hospital className="about-main-icon" />
                                    <Minus className="about-line-icon" /> {/* Changed to Minus icon */}
                                </div>
                                {/* Highlight important text parts */}
                                <p className="lead about-text-intro mb-4">
                                    Chúng tôi là Bệnh viện Đa khoa Quốc tế <span className="text-highlight-bold">FPT</span>, một cơ sở y tế hàng đầu cam kết cung cấp dịch vụ chăm sóc sức khỏe chất lượng cao. Với sự hiểu biết sâu sắc về tầm quan trọng của nguồn máu, chúng tôi đã phát triển <span className="text-highlight-primary">hệ thống quản lý hiến máu nội bộ</span> để đảm bảo <span className="text-highlight-primary">nguồn cung cấp máu ổn định và an toàn</span> cho mọi bệnh nhân.
                                </p>
                                <p className="mb-5 about-text-details">
                                    Tại đây, mỗi đơn vị máu hiến tặng đều được <span className="text-highlight-secondary">quản lý chặt chẽ</span>, từ khâu tiếp nhận, xét nghiệm đến lưu trữ và sử dụng. Sứ mệnh của chúng tôi là không chỉ điều trị mà còn <span className="text-highlight-secondary">kêu gọi và tạo điều kiện thuận lợi nhất</span> để cộng đồng cùng chúng tôi <span className="text-highlight-secondary">lan tỏa nghĩa cử cao đẹp</span> của việc hiến máu, góp phần <span className="text-highlight-secondary">cứu sống nhiều sinh mạng</span>.
                                </p>
                                {/* Feature cards below the description */}
                                <div className="row g-4 justify-content-center">
                                    <div className="col-md-4">
                                        <div className="feature-card shadow-sm">
                                            <div className="feature-icon-wrapper">
                                                <ShieldCheck className="feature-icon" />
                                            </div>
                                            <h5 className="feature-title">An Toàn Tuyệt Đối</h5>
                                            <p className="feature-description">
                                                Quy trình hiến máu tuân thủ nghiêm ngặt các tiêu chuẩn y tế quốc tế, đảm bảo an toàn tối đa cho cả người hiến và người nhận.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="feature-card shadow-sm">
                                            <div className="feature-icon-wrapper">
                                                <CheckCircle className="feature-icon" />
                                            </div>
                                            <h5 className="feature-title">Chuyên Nghiệp</h5>
                                            <p className="feature-description">
                                                Đội ngũ y bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại và dịch vụ chăm sóc tận tình trong suốt quá trình hiến máu.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="feature-card shadow-sm">
                                            <div className="feature-icon-wrapper">
                                                <Clock className="feature-icon" />
                                            </div>
                                            <h5 className="feature-title">Phản Ứng Nhanh</h5>
                                            <p className="feature-description">
                                                Hệ thống tiếp nhận và phân phối máu nhanh chóng, hiệu quả, đảm bảo nguồn máu sẵn sàng khi bệnh nhân cần.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Knowledge Section - Start */}
                <section className="knowledge-section py-5">
                    <div className="container">
                        <h2 className="text-center mb-5">Kiến Thức Về Hiến Máu</h2>
                        <div className="process-flow-section">
                            <div className="process-step-col">
                                <div className="process-step shadow-sm">
                                    <div className="step-header">
                                        <div className="step-number-wrapper">
                                            <span className="step-number-text">Bước</span>
                                            <span className="step-number">1</span>
                                        </div>
                                        <div className="step-arrow-wrapper d-none d-md-block">
                                            <svg className="step-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M14 5l7 7-7 7M3 12h18" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="card-body text-center">
                                        <div className="step-icon-wrapper">
                                            <CalendarDays className="step-icon" />
                                        </div>
                                        <h5 className="step-title">Đăng Ký & Kiểm Tra</h5>
                                        <p className="step-description">Điền form đăng ký và kiểm tra sức khỏe ban đầu</p>
                                        <ul className="step-detail-list text-start">
                                            <li><span className="bullet-point"></span> Kiểm tra tuổi (18-60 tuổi)</li>
                                            <li><span className="bullet-point"></span> Cân nặng tối thiểu 45kg</li>
                                            <li><span className="bullet-point"></span> Đo huyết áp và mạch</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="process-step-col">
                                <div className="process-step shadow-sm">
                                    <div className="step-header">
                                        <div className="step-number-wrapper">
                                            <span className="step-number-text">Bước</span>
                                            <span className="step-number">2</span>
                                        </div>
                                        <div className="step-arrow-wrapper d-none d-md-block">
                                            <svg className="step-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M14 5l7 7-7 7M3 12h18" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="card-body text-center">
                                        <div className="step-icon-wrapper">
                                            <Syringe className="step-icon" />
                                        </div>
                                        <h5 className="step-title">Khám Sàng Lọc</h5>
                                        <p className="step-description">Bác sĩ thăm khám và tư vấn chi tiết</p>
                                        <ul className="step-detail-list text-start">
                                            <li><span className="bullet-point"></span> Hỏi tiền sử bệnh</li>
                                            <li><span className="bullet-point"></span> Kiểm tra mức hemoglobin</li>
                                            <li><span className="bullet-point"></span> Tư vấn quy trình hiến máu</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="process-step-col">
                                <div className="process-step shadow-sm">
                                    <div className="step-header">
                                        <div className="step-number-wrapper">
                                            <span className="step-number-text">Bước</span>
                                            <span className="step-number">3</span>
                                        </div>
                                        <div className="step-arrow-wrapper d-none d-md-block">
                                            <svg className="step-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M14 5l7 7-7 7M3 12h18" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="card-body text-center">
                                        <div className="step-icon-wrapper">
                                            <Heart className="step-icon" />
                                        </div>
                                        <h5 className="step-title">Hiến Máu</h5>
                                        <p className="step-description">Thực hiện hiến máu trong môi trường vô trùng</p>
                                        <ul className="step-detail-list text-start">
                                            <li><span className="bullet-point"></span> Thời gian: 8-10 phút</li>
                                            <li><span className="bullet-point"></span> Lượng máu: 350-450ml</li>
                                            <li><span className="bullet-point"></span> An toàn tuyệt đối</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="process-step-col">
                                <div className="process-step shadow-sm">
                                    <div className="step-header">
                                        <div className="step-number-wrapper">
                                            <span className="step-number-text">Bước</span>
                                            <span className="step-number">4</span>
                                        </div>
                                        {/* No arrow for the last step */}
                                    </div>
                                    <div className="card-body text-center">
                                        <div className="step-icon-wrapper">
                                            <ClipboardCheck className="step-icon" />
                                        </div>
                                        <h5 className="step-title">Nghỉ Ngơi & Chăm Sóc</h5>
                                        <p className="step-description">Nghỉ ngơi và chăm sóc sức khỏe sau hiến máu</p>
                                        <ul className="step-detail-list text-start">
                                            <li><span className="bullet-point"></span> Nghỉ ngơi 15-20 phút</li>
                                            <li><span className="bullet-point"></span> Uống nước và ăn nhẹ</li>
                                            <li><span className="bullet-point"></span> Theo dõi sức khỏe</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Blood Types and Benefits Section */}
                        <div className="row g-4 mt-5">
                            <div className="col-md-12">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <h5 className="card-title text-primary mb-4">Thông tin nhóm máu</h5>
                                        <div className="blood-types-grid">
                                            <div className="blood-type-card shadow-sm">
                                                <span className="blood-type-text">O+</span>
                                                <p className="blood-type-detail">Hiến cho: Mọi nhóm Rh+</p>
                                                <p className="blood-type-detail">Nhận từ: O+, O-</p>
                                            </div>
                                            <div className="blood-type-card shadow-sm">
                                                <span className="blood-type-text">O-</span>
                                                <p className="blood-type-detail">Hiến cho: Mọi nhóm</p>
                                                <p className="blood-type-detail">Nhận từ: O-</p>
                                            </div>
                                            <div className="blood-type-card shadow-sm">
                                                <span className="blood-type-text">A+</span>
                                                <p className="blood-type-detail">Hiến cho: A+, AB+</p>
                                                <p className="blood-type-detail">Nhận từ: A+, A-, O+, O-</p>
                                            </div>
                                            <div className="blood-type-card shadow-sm">
                                                <span className="blood-type-text">A-</span>
                                                <p className="blood-type-detail">Hiến cho: A+, A-, AB+, AB-</p>
                                                <p className="blood-type-detail">Nhận từ: A-, O-</p>
                                            </div>
                                            <div className="blood-type-card shadow-sm">
                                                <span className="blood-type-text">B+</span>
                                                <p className="blood-type-detail">Hiến cho: B+, AB+</p>
                                                <p className="blood-type-detail">Nhận từ: B+, B-, O+, O-</p>
                                            </div>
                                            <div className="blood-type-card shadow-sm">
                                                <span className="blood-type-text">B-</span>
                                                <p className="blood-type-detail">Hiến cho: B+, B-, AB+, AB-</p>
                                                <p className="blood-type-detail">Nhận từ: B-, O-</p>
                                            </div>
                                            <div className="blood-type-card shadow-sm">
                                                <span className="blood-type-text">AB+</span>
                                                <p className="blood-type-detail">Hiến cho: AB+</p>
                                                <p className="blood-type-detail">Nhận từ: Mọi nhóm</p>
                                            </div>
                                            <div className="blood-type-card shadow-sm">
                                                <span className="blood-type-text">AB-</span>
                                                <p className="blood-type-detail">Hiến cho: AB+, AB-</p>
                                                <p className="blood-type-detail">Nhận từ: A-, B-, AB-, O-</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12 mt-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <h5 className="card-title text-primary mb-4">Lợi ích của việc hiến máu</h5>
                                        <div className="benefits-grid-section col-md-12">
                                            <div className="benefit-card shadow-sm ">
                                                <div className="benefit-icon-wrapper benefit-icon-heart ">
                                                    <HeartPulse className="benefit-icon" />
                                                </div>
                                                <h5 className="benefit-title">Cải Thiện Sức Khỏe Tim Mạch</h5>
                                                <p className="benefit-description">Hiến máu giúp giảm nguy cơ mắc bệnh tim mạch và đột quỵ bằng cách giảm độ nhớt của máu.</p>
                                            </div>
                                            <div className="benefit-card shadow-sm">
                                                <div className="benefit-icon-wrapper benefit-icon-pulse">
                                                    <Activity className="benefit-icon" />
                                                </div>
                                                <h5 className="benefit-title">Kích Thích Tạo Máu Mới</h5>
                                                <p className="benefit-description">Sau khi hiến máu, cơ thể sẽ tự động sản xuất tế bào máu mới khỏe mạnh hơn.</p>
                                            </div>
                                            <div className="benefit-card shadow-sm">
                                                <div className="benefit-icon-wrapper benefit-icon-check">
                                                    <CheckCircle className="benefit-icon" />
                                                </div>
                                                <h5 className="benefit-title">Kiểm Tra Sức Khỏe Miễn Phí</h5>
                                                <p className="benefit-description">Được kiểm tra sức khỏe tổng quát và xét nghiệm máu miễn phí trước mỗi lần hiến.</p>
                                            </div>
                                            <div className="benefit-card shadow-sm">
                                                <div className="benefit-icon-wrapper benefit-icon-shield">
                                                    <ShieldCheck className="benefit-icon" />
                                                </div>
                                                <h5 className="benefit-title">Tăng Cường Hệ Miễn Dịch</h5>
                                                <p className="benefit-description">Hiến máu định kỳ có thể giúp hệ miễn dịch hoạt động hiệu quả hơn, giảm nguy cơ mắc bệnh.</p>
                                            </div>
                                            <div className="benefit-card shadow-sm">
                                                <div className="benefit-icon-wrapper benefit-icon-users">
                                                    <Users className="benefit-icon" />
                                                </div>
                                                <h5 className="benefit-title">Tăng Tính Cộng Đồng</h5>
                                                <p className="benefit-description">Hiến máu là một hành động cao cả, kết nối bạn với cộng đồng và những người cần giúp đỡ.</p>
                                            </div>
                                            <div className="benefit-card shadow-sm">
                                                <div className="benefit-icon-wrapper benefit-icon-smile">
                                                    <Smile className="benefit-icon" />
                                                </div>
                                                <h5 className="benefit-title">Mang Lại Hạnh Phúc</h5>
                                                <p className="benefit-description">Việc biết rằng bạn đã cứu sống một người mang lại cảm giác mãn nguyện và hạnh phúc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Knowledge Section - End */}

                {/* Blog/Sharing Section */}
                <section className="blog-section py-5 bg-light">
                    <div className="container">
                        <h2 className="text-center mb-5">Góc Chia Sẻ Từ Cộng Đồng</h2>
                        
                        {/* Thêm thông báo */}
                        <p className="text-center text-muted mb-4">
                            Hãy cùng khám phá những câu chuyện truyền cảm hứng từ cộng đồng hiến máu!
                        </p>

                        <div className="row g-4">
                            {/* Hiển thị bài viết từ Blog */}
                            {[
                                {
                                    title: "Người đàn ông hiến máu hơn 100 lần vì 'thử một lần cho biết'",
                                    date: "10/06/2025",
                                    desc: "Anh Nguyễn Văn Hiếu (Hà Nội) bắt đầu hiến máu chỉ để 'thử một lần cho biết' khi còn là sinh viên. Không ngờ, sau lần đầu ấy, anh gắn bó với hoạt động này suốt 12 năm và đã hiến máu 129 lần.",
                                    link: "https://vienhuyethoc.vn/chuyen-cua-nhung-ky-luc-gia-hien-mau-tinh-nguyen/",
                                    image: "/assets/nguyen-van-hieu-129-lan-hien-mau.jpg"
                                },
                                {
                                    title: "Câu chuyện cả gia đình cùng hiến máu",
                                    date: "01/06/2025",
                                    desc: "Gia đình anh Nguyễn Văn Linh (Hoằng Hóa, Thanh Hóa) là 'hạt nhân' tích cực của phong trào hiến máu tại địa phương. Vợ chồng anh chị đều duy trì thói quen hiến máu hàng năm, truyền cảm hứng cho hai con tham gia hiến máu.",
                                    link: "https://baothanhhoa.vn/cau-chuyen-nho-trong-hanh-trinh-do-bai-6-ca-nha-cung-hien-mau-253994.htm",
                                    image: "/assets/gia-dinh-nguyen-van-linh-hien-mau.webp"
                                },
                                {
                                    title: "Hành trình hơn 10 năm hiến máu cứu người của một phụ nữ",
                                    date: "25/05/2025",
                                    desc: "Chị Huỳnh Thị Mỹ An (Hà Nội) bắt đầu hiến máu sau khi chứng kiến bố mình cần truyền máu khi phẫu thuật. Suốt hơn 10 năm qua, chị đều đặn hiến máu, cảm thấy hạnh phúc khi biết giọt máu của mình đã góp phần cứu sống ai đó.",
                                    link: "https://dantri.com.vn/suc-khoe/cau-chuyen-ve-nguoi-phu-nu-hon-10-nam-hien-mau-cuu-nguoi-20210611212833358.htm",
                                    image: "/assets/anhBlog03.webp"
                                }
                            ].map((blog, idx) => (
                                <div className="col-md-6 col-lg-4" key={idx}>
                                    <div className="card h-100 shadow-sm">
                                        <img
                                            src={blog.image}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/400x250/cccccc/333333?text=Blog+Image";
                                            }}
                                            className="card-img-top"
                                            alt={blog.title}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title">{blog.title}</h5>
                                            <p className="card-text text-muted small">Ngày đăng: {blog.date}</p>
                                            <p className="card-text">{blog.desc}</p>
                                            <a href={blog.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                                Đọc thêm
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-5">
                            <Link to="/blog" className="btn btn-outline-danger btn-lg">Xem tất cả bài viết</Link>
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="call-to-action-section py-5 text-center">
                    <div className="container">
                        <h2 className="mb-4 display-5">Bạn đã sẵn sàng trở thành người hùng?</h2>
                        <p className="lead mb-4">
                            Hiến máu không chỉ là một hành động nhân ái, mà còn là cơ hội để bạn tạo nên sự khác biệt.
                        </p>
                        <Link to="/register" className="btn btn-light btn-lg">Đăng Ký Ngay</Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;