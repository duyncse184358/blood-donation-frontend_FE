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
                            <a href="#blood-types" className="list-group-item list-group-item-action">🩸 Các nhóm máu cơ bản</a>
                            <a href="#donation-process" className="list-group-item list-group-item-action">📋 Quy trình hiến máu</a>
                            <a href="#benefits" className="list-group-item list-group-item-action">💝 Lợi ích của việc hiến máu</a>
                            <a href="#requirements" className="list-group-item list-group-item-action">📝 Điều kiện hiến máu</a>
                            <a href="#compatibility" className="list-group-item list-group-item-action">📊 Bảng tương thích nhóm máu</a>
                            <a href="#myths" className="list-group-item list-group-item-action">💡 Hiểu lầm phổ biến</a>
                            <a href="#faq" className="list-group-item list-group-item-action">❓ Câu hỏi thường gặp</a>
                        </div>
                    </aside>
                    {/* Nội dung tài liệu */}
                    <section className="col-md-9">
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="blood-types" className="text-primary mt-2 mb-3 fw-bold d-flex align-items-center">
                                <span className="me-2">🩸</span> Các nhóm máu cơ bản
                            </h3>
                            <p>Có bốn nhóm máu chính: A, B, AB và O. Mỗi nhóm máu có thể là Rh dương (+) hoặc Rh âm (-), tạo thành 8 nhóm máu phổ biến nhất (ví dụ: A+, O-, v.v.).</p>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="p-3 border rounded bg-light">
                                        <h5 className="text-danger">🅾️ Nhóm máu O</h5>
                                        <p className="mb-0">Là nhóm máu phổ biến nhất và là "người hiến máu phổ quát" (O-).</p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 border rounded bg-light">
                                        <h5 className="text-info">🅰️🅱️ Nhóm máu AB</h5>
                                        <p className="mb-0">Là nhóm máu hiếm nhất và là "người nhận máu phổ quát" (AB+).</p>
                                    </div>
                                </div>
                                <div className="col-md-6 mt-3">
                                    <div className="p-3 border rounded bg-light">
                                        <h5 className="text-success">🅰️ Nhóm máu A</h5>
                                        <p className="mb-0">Có thể hiến cho A và AB.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 mt-3">
                                    <div className="p-3 border rounded bg-light">
                                        <h5 className="text-warning">🅱️ Nhóm máu B</h5>
                                        <p className="mb-0">Có thể hiến cho B và AB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="donation-process" className="text-primary mt-2 mb-3 fw-bold d-flex align-items-center">
                                <span className="me-2">📋</span> Quy trình hiến máu
                            </h3>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 border rounded h-100">
                                        <div className="mb-2" style={{fontSize: '2rem'}}>📝</div>
                                        <h5 className="text-primary">Đăng ký</h5>
                                        <p className="mb-0">Điền thông tin cá nhân và lịch sử sức khỏe.</p>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 border rounded h-100">
                                        <div className="mb-2" style={{fontSize: '2rem'}}>🔍</div>
                                        <h5 className="text-success">Khám sàng lọc</h5>
                                        <p className="mb-0">Kiểm tra huyết áp, nhịp tim, nhiệt độ và lượng hemoglobin.</p>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 border rounded h-100">
                                        <div className="mb-2" style={{fontSize: '2rem'}}>🩸</div>
                                        <h5 className="text-danger">Hiến máu</h5>
                                        <p className="mb-0">Quá trình này mất khoảng 10-15 phút.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="text-center p-3 border rounded h-100">
                                        <div className="mb-2" style={{fontSize: '2rem'}}>☕</div>
                                        <h5 className="text-info">Nghỉ ngơi và hồi phục</h5>
                                        <p className="mb-0">Nghỉ ngơi và được phục vụ đồ uống nhẹ.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="text-center p-3 border rounded h-100">
                                        <div className="mb-2" style={{fontSize: '2rem'}}>💊</div>
                                        <h5 className="text-warning">Chăm sóc sau hiến máu</h5>
                                        <p className="mb-0">Nhận hướng dẫn chi tiết.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="benefits" className="text-primary mt-2 mb-3 fw-bold d-flex align-items-center">
                                <span className="me-2">💝</span> Lợi ích của việc hiến máu
                            </h3>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-start p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>❤️</span>
                                        <div>
                                            <h5 className="text-danger mb-1">Cứu sống</h5>
                                            <p className="mb-0">Giúp bệnh nhân cần truyền máu.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-start p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>🏥</span>
                                        <div>
                                            <h5 className="text-success mb-1">Miễn phí kiểm tra sức khỏe</h5>
                                            <p className="mb-0">Kiểm tra nhanh và miễn phí.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-start p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>⚖️</span>
                                        <div>
                                            <h5 className="text-info mb-1">Giảm sắt dư thừa</h5>
                                            <p className="mb-0">Cân bằng lượng sắt trong máu.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-start p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>🔥</span>
                                        <div>
                                            <h5 className="text-warning mb-1">Đốt cháy calo</h5>
                                            <p className="mb-0">Khoảng 650 calo mỗi lần.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="d-flex align-items-start p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>😊</span>
                                        <div>
                                            <h5 className="text-primary mb-1">Tốt cho tâm lý</h5>
                                            <p className="mb-0">Cảm thấy hạnh phúc và có ích.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="requirements" className="text-primary mt-2 mb-3 fw-bold d-flex align-items-center">
                                <span className="me-2">📝</span> Điều kiện hiến máu
                            </h3>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-center p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>🎂</span>
                                        <span>Tuổi từ 18 đến 60.</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-center p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>⚖️</span>
                                        <span>Cân nặng từ 45kg trở lên.</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-center p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>🦠</span>
                                        <span>Không mắc các bệnh lây nhiễm qua đường máu.</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex align-items-center p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>💊</span>
                                        <span>Không sử dụng thuốc kháng sinh trong 7 ngày.</span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="d-flex align-items-center p-3 border rounded bg-light">
                                        <span className="me-3" style={{fontSize: '1.5rem'}}>😴</span>
                                        <span>Ngủ đủ 6 tiếng và ăn nhẹ trước khi hiến.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="compatibility" className="text-primary mt-2 mb-3 fw-bold d-flex align-items-center">
                                <span className="me-2">📊</span> Bảng tương thích nhóm máu
                            </h3>
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
                            <h3 id="myths" className="text-primary mt-2 mb-3 fw-bold d-flex align-items-center">
                                <span className="me-2">💡</span> Hiểu lầm phổ biến về hiến máu
                            </h3>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 border rounded h-100 bg-light">
                                        <div className="mb-2" style={{fontSize: '2rem'}}>😴</div>
                                        <h5 className="text-danger">Hiến máu gây mệt mỏi lâu dài</h5>
                                        <p className="mb-0 text-success"><strong>❌ Không đúng.</strong> Bạn sẽ hồi phục trong vài giờ.</p>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 border rounded h-100 bg-light">
                                        <div className="mb-2" style={{fontSize: '2rem'}}>👴</div>
                                        <h5 className="text-danger">Người cao tuổi không thể hiến máu</h5>
                                        <p className="mb-0 text-success"><strong>❌ Sai.</strong> Nếu đủ điều kiện sức khỏe, vẫn có thể hiến.</p>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="text-center p-3 border rounded h-100 bg-light">
                                        <div className="mb-2" style={{fontSize: '2rem'}}>🔄</div>
                                        <h5 className="text-danger">Hiến máu thường xuyên không tốt</h5>
                                        <p className="mb-0 text-success"><strong>❌ Sai.</strong> Nếu theo đúng thời gian quy định, hiến máu hoàn toàn an toàn.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h3 id="faq" className="text-primary mt-2 mb-3 fw-bold d-flex align-items-center">
                                <span className="me-2">❓</span> Câu hỏi thường gặp
                            </h3>
                            <div className="accordion" id="faqAccordion">
                                <div className="accordion-item mb-3 border rounded">
                                    <div className="accordion-header">
                                        <div className="p-3 bg-light rounded d-flex align-items-center">
                                            <span className="me-3" style={{fontSize: '1.5rem'}}>⏰</span>
                                            <div>
                                                <h5 className="mb-1 text-primary">Bao lâu thì tôi có thể hiến máu lại?</h5>
                                                <p className="mb-0">12 tuần với nam, 16 tuần với nữ.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-3 border rounded">
                                    <div className="accordion-header">
                                        <div className="p-3 bg-light rounded d-flex align-items-center">
                                            <span className="me-3" style={{fontSize: '1.5rem'}}>�</span>
                                            <div>
                                                <h5 className="mb-1 text-primary">Tôi có thể hiến máu khi bị cảm không?</h5>
                                                <p className="mb-0">Không. Bạn cần hoàn toàn khỏe mạnh.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-3 border rounded">
                                    <div className="accordion-header">
                                        <div className="p-3 bg-light rounded d-flex align-items-center">
                                            <span className="me-3" style={{fontSize: '1.5rem'}}>💉</span>
                                            <div>
                                                <h5 className="mb-1 text-primary">Có đau khi hiến máu không?</h5>
                                                <p className="mb-0">Chỉ đau nhẹ lúc kim tiêm vào.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
