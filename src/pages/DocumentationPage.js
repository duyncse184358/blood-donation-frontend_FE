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
                            <a href="#requirements" className="list-group-item list-group-item-action">4. Điều kiện hiến máu</a>
                            <a href="#compatibility" className="list-group-item list-group-item-action">5. Bảng tương thích nhóm máu</a>
                            <a href="#myths" className="list-group-item list-group-item-action">6. Hiểu lầm phổ biến</a>
                            <a href="#faq" className="list-group-item list-group-item-action">7. Câu hỏi thường gặp</a>
                        </div>
                    </aside>
                    {/* Nội dung tài liệu */}
                    <section className="col-md-9">
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="blood-types" className="text-primary mt-2 mb-3 fw-bold">1. Các nhóm máu cơ bản</h3>
                            <p>Có bốn nhóm máu chính: A, B, AB và O. Mỗi nhóm máu có thể là Rh dương (+) hoặc Rh âm (-), tạo thành 8 nhóm máu phổ biến nhất (ví dụ: A+, O-, v.v.).</p>
                            <ul>
                                <li><strong>Nhóm máu O:</strong> Là nhóm máu phổ biến nhất và là "người hiến máu phổ quát" (O-).</li>
                                <li><strong>Nhóm máu AB:</strong> Là nhóm máu hiếm nhất và là "người nhận máu phổ quát" (AB+).</li>
                                <li><strong>Nhóm máu A:</strong> Có thể hiến cho A và AB.</li>
                                <li><strong>Nhóm máu B:</strong> Có thể hiến cho B và AB.</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="donation-process" className="text-primary mt-2 mb-3 fw-bold">2. Quy trình hiến máu</h3>
                            <ol>
                                <li><strong>Đăng ký:</strong> Điền thông tin cá nhân và lịch sử sức khỏe.</li>
                                <li><strong>Khám sàng lọc:</strong> Kiểm tra huyết áp, nhịp tim, nhiệt độ và lượng hemoglobin.</li>
                                <li><strong>Hiến máu:</strong> Quá trình này mất khoảng 10-15 phút.</li>
                                <li><strong>Nghỉ ngơi và hồi phục:</strong> Nghỉ ngơi và được phục vụ đồ uống nhẹ.</li>
                                <li><strong>Chăm sóc sau hiến máu:</strong> Nhận hướng dẫn chi tiết.</li>
                            </ol>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="benefits" className="text-primary mt-2 mb-3 fw-bold">3. Lợi ích của việc hiến máu</h3>
                            <ul>
                                <li><strong>Cứu sống:</strong> Giúp bệnh nhân cần truyền máu.</li>
                                <li><strong>Miễn phí kiểm tra sức khỏe:</strong> Kiểm tra nhanh và miễn phí.</li>
                                <li><strong>Giảm sắt dư thừa:</strong> Cân bằng lượng sắt trong máu.</li>
                                <li><strong>Đốt cháy calo:</strong> Khoảng 650 calo mỗi lần.</li>
                                <li><strong>Tốt cho tâm lý:</strong> Cảm thấy hạnh phúc và có ích.</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="requirements" className="text-primary mt-2 mb-3 fw-bold">4. Điều kiện hiến máu</h3>
                            <ul>
                                <li>Tuổi từ 18 đến 60.</li>
                                <li>Cân nặng từ 45kg trở lên.</li>
                                <li>Không mắc các bệnh lây nhiễm qua đường máu.</li>
                                <li>Không sử dụng thuốc kháng sinh trong 7 ngày.</li>
                                <li>Ngủ đủ 6 tiếng và ăn nhẹ trước khi hiến.</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="compatibility" className="text-primary mt-2 mb-3 fw-bold">5. Bảng tương thích nhóm máu</h3>
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr className="table-danger">
                                        <th>Người nhận \ Người hiến</th>
                                        <th>O-</th><th>O+</th><th>A-</th><th>A+</th><th>B-</th><th>B+</th><th>AB-</th><th>AB+</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>O-</td><td>✔</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                                    <tr><td>O+</td><td>✔</td><td>✔</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                                    <tr><td>A-</td><td>✔</td><td></td><td>✔</td><td></td><td></td><td></td><td></td><td></td></tr>
                                    <tr><td>A+</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td></td><td></td><td></td><td></td></tr>
                                    <tr><td>B-</td><td>✔</td><td></td><td></td><td></td><td>✔</td><td></td><td></td><td></td></tr>
                                    <tr><td>B+</td><td>✔</td><td>✔</td><td></td><td></td><td>✔</td><td>✔</td><td></td><td></td></tr>
                                    <tr><td>AB-</td><td>✔</td><td></td><td>✔</td><td></td><td>✔</td><td></td><td>✔</td><td></td></tr>
                                    <tr><td>AB+</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="myths" className="text-primary mt-2 mb-3 fw-bold">6. Hiểu lầm phổ biến về hiến máu</h3>
                            <ul>
                                <li><strong>Hiến máu gây mệt mỏi lâu dài:</strong> Không đúng. Bạn sẽ hồi phục trong vài giờ.</li>
                                <li><strong>Người cao tuổi không thể hiến máu:</strong> Nếu đủ điều kiện sức khỏe, vẫn có thể hiến.</li>
                                <li><strong>Hiến máu thường xuyên không tốt:</strong> Nếu theo đúng thời gian quy định, hiến máu hoàn toàn an toàn.</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="faq" className="text-primary mt-2 mb-3 fw-bold">7. Câu hỏi thường gặp</h3>
                            <p><strong>🩸 Bao lâu thì tôi có thể hiến máu lại?</strong> - 12 tuần với nam, 16 tuần với nữ.</p>
                            <p><strong>🩸 Tôi có thể hiến máu khi bị cảm không?</strong> - Không. Bạn cần hoàn toàn khỏe mạnh.</p>
                            <p><strong>🩸 Có đau khi hiến máu không?</strong> - Chỉ đau nhẹ lúc kim tiêm vào.</p>
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
                h3 {
                    scroll-margin-top: 80px;
                }
            `}</style>
        </div>
    );
}

export default DocumentationPage;
