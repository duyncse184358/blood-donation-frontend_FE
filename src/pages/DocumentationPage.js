import React from 'react';
import Header from '../components/Header/Header';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

function DocumentationPage() {
    return (
        <div className="page-wrapper" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <Header />
            <Navbar />
            <main className="container py-5">
                <h2 className="text-center text-danger mb-4 fw-bold" style={{ fontSize: "2.2rem" }}>📚 Tài liệu & Hướng dẫn</h2>
                <p className="text-center lead mb-5 text-secondary">
                    Tất cả thông tin bạn cần biết về hiến máu, quy trình, yêu cầu và các nhóm máu.
                </p>
                <div className="row">
                    {/* Sidebar mục lục */}
                    <aside className="col-md-3 mb-4">
                        <div className="list-group sticky-top" style={{ top: 100 }}>
                            <a href="#blood-types" className="list-group-item list-group-item-action">1. Các nhóm máu cơ bản</a>
                            <a href="#donation-process" className="list-group-item list-group-item-action">2. Quy trình hiến máu</a>
                            <a href="#benefits" className="list-group-item list-group-item-action">3. Lợi ích của việc hiến máu</a>
                        </div>
                    </aside>
                    {/* Nội dung tài liệu */}
                    <section className="col-md-9">
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="blood-types" className="text-primary mt-2 mb-3 fw-bold">1. Các nhóm máu cơ bản</h3>
                            <p>
                                Có bốn nhóm máu chính: A, B, AB và O. Mỗi nhóm máu có thể là Rh dương (+) hoặc Rh âm (-), tạo thành 8 nhóm máu phổ biến nhất (ví dụ: A+, O-, v.v.).
                            </p>
                            <ul>
                                <li><strong>Nhóm máu O:</strong> Là nhóm máu phổ biến nhất và là "người hiến máu phổ quát" (O-).</li>
                                <li><strong>Nhóm máu AB:</strong> Là nhóm máu hiếm nhất và là "người nhận máu phổ quát" (AB+).</li>
                                <li><strong>Nhóm máu A:</strong>...</li>
                                <li><strong>Nhóm máu B:</strong>...</li>
                            </ul>
                            <p>
                                Việc hiểu nhóm máu của bạn rất quan trọng để đảm bảo an toàn trong truyền máu và hiến máu.
                            </p>
                        </div>
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="donation-process" className="text-primary mt-2 mb-3 fw-bold">2. Quy trình hiến máu</h3>
                            <p>
                                Quy trình hiến máu thường mất khoảng 45 phút đến 1 giờ, bao gồm các bước sau:
                            </p>
                            <ol>
                                <li><strong>Đăng ký:</strong> Điền thông tin cá nhân và lịch sử sức khỏe.</li>
                                <li><strong>Khám sàng lọc:</strong> Nhân viên y tế kiểm tra huyết áp, nhịp tim, nhiệt độ và lấy mẫu máu nhỏ để kiểm tra nồng độ hemoglobin.</li>
                                <li><strong>Hiến máu:</strong> Quá trình lấy máu kéo dài khoảng 10-15 phút.</li>
                                <li><strong>Nghỉ ngơi và hồi phục:</strong> Bạn sẽ được yêu cầu nghỉ ngơi 10-15 phút và được phục vụ đồ uống, đồ ăn nhẹ.</li>
                                <li><strong>Chăm sóc sau hiến máu:</strong> Nhận hướng dẫn về cách chăm sóc bản thân sau khi hiến máu.</li>
                            </ol>
                        </div>
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="benefits" className="text-primary mt-2 mb-3 fw-bold">3. Lợi ích của việc hiến máu</h3>
                            <p>
                                Hiến máu mang lại nhiều lợi ích cho cả người nhận và người hiến:
                            </p>
                            <ul>
                                <li><strong>Cứu sống:</strong> Giúp bệnh nhân phẫu thuật, nạn nhân tai nạn, người bệnh ung thư và những người mắc bệnh mãn tính.</li>
                                <li><strong>Kiểm tra sức khỏe miễn phí:</strong> Mỗi lần hiến máu là một lần bạn được kiểm tra sức khỏe tổng quát.</li>
                                <li><strong>Cân bằng sắt trong cơ thể:</strong> Giúp giảm lượng sắt dư thừa, đặc biệt có lợi cho những người có nguy cơ thừa sắt.</li>
                                <li><strong>Đốt cháy calo:</strong> Giúp đốt cháy khoảng 650 calo mỗi lần hiến máu.</li>
                                <li><strong>Cải thiện tâm lý:</strong> Mang lại cảm giác hạnh phúc khi biết mình đã giúp đỡ người khác.</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
            <style>{`
                .list-group-item-action.active, .list-group-item-action:focus, .list-group-item-action:hover {
                    background: #ffeaea;
                    color: #dc3545;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}

export default DocumentationPage;
