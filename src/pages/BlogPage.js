// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import * as cheerio from 'cheerio'; // Sử dụng cú pháp import toàn bộ module
// import Header from '../components/Header/Header';
// import Navbar from '../components/Navbar/Navbar';
// import Footer from '../components/Footer/Footer';

// function BlogPage() {
//     const [blogs, setBlogs] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchBlogs = async () => {
//             try {
//                 const response = await axios.get('https://cors-anywhere.herokuapp.com/https://vienhuyethoc.vn/chuyen-muc/tin-tuc/');
//                 console.log('HTML Response:', response.data); // Kiểm tra HTML trả về
//                 const $ = cheerio.load(response.data);

//                 const articles = [];
//                 $('.news-item').each((index, element) => {
//                     const title = $(element).find('.title a').text().trim();
//                     const link = $(element).find('.title a').attr('href');
//                     const date = $(element).find('.date').text().trim();
//                     const desc = $(element).find('.content').text().trim();
//                     const image = $(element).find('.news-img img').attr('src');

//                     articles.push({
//                         title,
//                         date,
//                         desc: desc || 'Không có mô tả.',
//                         link: link.startsWith('http') ? link : `https://vienhuyethoc.vn${link}`,
//                         image: image ? (image.startsWith('http') ? image : `https://vienhuyethoc.vn${image}`) : null,
//                     });
//                 });

//                 console.log('Articles:', articles); // Kiểm tra danh sách bài viết
//                 setBlogs(articles);
//             } catch (err) {
//                 console.error('Lỗi khi tải dữ liệu từ trang web:', err);
//                 setBlogs([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchBlogs();
//     }, []);

//     return (
//         <div className="page-wrapper" style={{ background: "#f8fafc", minHeight: "100vh" }}>
//             <Header />
//             <Navbar />
//             <main className="container py-5">
//                 <h2 className="text-center text-danger mb-4 fw-bold" style={{ fontSize: "2.2rem" }}>📝 Blog - Góc Chia Sẻ</h2>
//                 <p className="text-center lead mb-5 text-secondary">
//                     Nơi tổng hợp các bài viết, câu chuyện, và tin tức về hiến máu.
//                 </p>

//                 {loading ? (
//                     <p className="text-center">Đang tải bài viết...</p>
//                 ) : blogs.length > 0 ? (
//                     <div>
//                         <div className="row g-4">
//                             {blogs.map((blog, idx) => (
//                                 <div className="col-12 col-md-6 col-lg-4" key={idx}>
//                                     <div className="card shadow-sm h-100 border-0 blog-card">
//                                         {blog.image && <img src={blog.image} alt={blog.title} className="card-img-top" />}
//                                         <div className="card-body d-flex flex-column">
//                                             <h5 className="card-title fw-bold mb-2">{blog.title}</h5>
//                                             <p className="card-text text-muted small mb-2">Ngày đăng: {blog.date}</p>
//                                             <p className="card-text flex-grow-1">{blog.desc}</p>
//                                             <a href={blog.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger mt-3 align-self-start">
//                                                 Đọc toàn bộ
//                                             </a>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                         {/* Ghi rõ nguồn tin */}
//                         <p className="text-center text-muted mt-4">
//                             Nguồn: <a href="https://vienhuyethoc.vn/chuyen-muc/tin-tuc/" target="_blank" rel="noopener noreferrer">Viện Huyết Học - Truyền Máu Trung Ương</a>
//                         </p>
//                     </div>
//                 ) : (
//                     <p className="text-center text-muted">Không tìm thấy bài viết nào liên quan.</p>
//                 )}
//             </main>
//             <Footer />
//             <style>{`
//                 .blog-card {
//                     border-radius: 18px;
//                     transition: box-shadow 0.2s, transform 0.2s;
//                 }
//                 .blog-card:hover {
//                     box-shadow: 0 8px 32px rgba(220,53,69,0.13);
//                     transform: translateY(-4px) scale(1.03);
//                 }
//             `}</style>
//         </div>
//     );
// }

// export default BlogPage;

// Code mới sử dụng newAPI
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header/Header';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
               const res = await axios.get('https://newsapi.org/v2/everything', {
  params: {
    q: 'blood donation',
    apiKey: process.env.REACT_APP_NEWS_API_KEY,
    language: 'en', // bỏ 'vi'
    pageSize: 9,
    sortBy: 'publishedAt',
  }
});
console.log("Articles:", res.data.articles);
                const data = res.data.articles.map(article => ({
                    title: article.title,
                    date: new Date(article.publishedAt).toLocaleDateString('vi-VN'),
                    desc: article.description || 'Không có mô tả.',
                    link: article.url
                }));
                setBlogs(data);
            } catch (err) {
                console.error('Lỗi khi tải blog:', err);
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div className="page-wrapper" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <Header />
            <Navbar />
            <main className="container py-5">
                <h2 className="text-center text-danger mb-4 fw-bold" style={{ fontSize: "2.2rem" }}>📝 Blog - Góc Chia Sẻ</h2>
                <p className="text-center lead mb-5 text-secondary">
                    Nơi tổng hợp các bài viết, câu chuyện, và tin tức về hiến máu.
                </p>

                {loading ? (
                    <p className="text-center">Đang tải bài viết...</p>
                ) : blogs.length > 0 ? (
                    <div className="row g-4">
                        {blogs.map((blog, idx) => (
                            <div className="col-12 col-md-6 col-lg-4" key={idx}>
                                <div className="card shadow-sm h-100 border-0 blog-card">
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fw-bold mb-2">{blog.title}</h5>
                                        <p className="card-text text-muted small mb-2">Ngày đăng: {blog.date}</p>
                                        <p className="card-text flex-grow-1">{blog.desc}</p>
                                        <a href={blog.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger mt-3 align-self-start">
                                            Đọc toàn bộ
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted">Không tìm thấy bài viết nào liên quan đến hiến máu.</p>
                )}
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
