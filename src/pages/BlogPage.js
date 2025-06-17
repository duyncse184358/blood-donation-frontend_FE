import React from 'react';
import Header from '../components/Header/Header';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

function BlogPage() {
    const blogs = [
        {
            title: "Lợi ích của việc hiến máu đối với sức khỏe",
            date: "01/06/2025",
            desc: "Hiến máu không chỉ giúp người khác mà còn mang lại nhiều lợi ích sức khỏe cho chính người hiến.",
            link: "#"
        },
        {
            title: "Giải mã những lầm tưởng về hiến máu",
            date: "28/05/2025",
            desc: "Có rất nhiều quan niệm sai lầm về hiến máu. Bài viết này sẽ giúp bạn hiểu rõ hơn.",
            link: "#"
        },
        // Thêm các bài viết khác nếu muốn
    ];

    return (
        <div className="page-wrapper" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <Header />
            <Navbar />
            <main className="container py-5">
                <h2 className="text-center text-danger mb-4 fw-bold" style={{ fontSize: "2.2rem" }}>📝 Blog - Góc Chia Sẻ</h2>
                <p className="text-center lead mb-5 text-secondary">
                    Nơi tổng hợp các bài viết, câu chuyện, và tin tức về hiến máu.
                </p>
                <div className="row g-4">
                    {blogs.map((blog, idx) => (
                        <div className="col-12 col-md-6 col-lg-4" key={idx}>
                            <div className="card shadow-sm h-100 border-0 blog-card">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bold mb-2">{blog.title}</h5>
                                    <p className="card-text text-muted small mb-2">Ngày đăng: {blog.date}</p>
                                    <p className="card-text flex-grow-1">{blog.desc}</p>
                                    <a href={blog.link} className="btn btn-outline-danger mt-3 align-self-start">Đọc toàn bộ</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
            <style>{`
                .blog-card {
                    border-radius: 18px;
                    transition: box-shadow 0.2s, transform 0.2s;
                }
                .blog-card:hover {
                    box-shadow: 0 8px 32px rgba(220,53,69,0.13);
                    transform: translateY(-4px) scale(1.03);
                }
            `}</style>
        </div>
    );
}

export default BlogPage;
