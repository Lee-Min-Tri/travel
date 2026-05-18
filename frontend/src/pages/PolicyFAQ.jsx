import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'reactstrap';
import { BASE_URL } from '../utils/config';
import '../style/policy-faq.css';

const PolicyFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'bảo hiểm', label: 'Bảo hiểm' },
    { value: 'hoàn hủy', label: 'Hoàn hủy & Hoàn tiền' },
    { value: 'an toàn', label: 'An toàn & Sức khỏe' },
    { value: 'thủ tục', label: 'Thủ tục & Tài liệu' }
  ];

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const url = selectedCategory === 'all'
          ? `${BASE_URL}/faqs`
          : `${BASE_URL}/faqs/category/${selectedCategory}`;

        const res = await fetch(url);
        const result = await res.json();

        if (res.ok) {
          setFaqs(result.data || []);
        } else {
          setError(result.message || 'Không thể tải FAQ');
        }
      } catch (err) {
        setError('Lỗi server khi tải FAQ');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchFAQs();
  }, [selectedCategory]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className='policy_faq mt-5 mb-5'>
      <Container>
        {/* Header */}
        <div className='faq_header text-center mb-5'>
          <h2 className='fw-bold text-primary mb-3'>
            <i className='ri-question-line me-2'></i>Câu Hỏi Thường Gặp
          </h2>
          <p className='text-muted'>
            Tìm hiểu thêm về chính sách, bảo hiểm, an toàn và các vấn đề khác liên quan đến tour của chúng tôi.
          </p>
        </div>

        {/* Category Filter */}
        <div className='category_filter mb-5'>
          <Row>
            {categories.map((cat) => (
              <Col lg='auto' key={cat.value} className='mb-2'>
                <button
                  className={`category_btn ${selectedCategory === cat.value ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </button>
              </Col>
            ))}
          </Row>
        </div>

        {/* Content */}
        {loading ? (
          <div className='text-center py-5'>
            <Spinner color='primary' />
            <p className='mt-3'>Đang tải câu hỏi...</p>
          </div>
        ) : error ? (
          <Alert color='danger'>{error}</Alert>
        ) : faqs.length === 0 ? (
          <Alert color='warning'>Chưa có câu hỏi nào trong danh mục này.</Alert>
        ) : (
          <div className='faq_list'>
            {faqs.map((faq) => (
              <div
                key={faq._id}
                className={`faq_item ${expandedId === faq._id ? 'expanded' : ''}`}
              >
                <div
                  className='faq_question'
                  onClick={() => toggleExpand(faq._id)}
                  role='button'
                  tabIndex={0}
                >
                  <div className='d-flex align-items-center justify-content-between w-100'>
                    <h5 className='mb-0 flex-grow-1'>
                      <i
                        className={`ri-arrow-${expandedId === faq._id ? 'up' : 'down'}-s-line me-2`}
                        style={{ color: '#df2020' }}
                      ></i>
                      {faq.question}
                    </h5>
                    <span className='category_badge'>{faq.category}</span>
                  </div>
                </div>

                {expandedId === faq._id && (
                  <div className='faq_answer'>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className='info_box mt-5 p-4 bg-light rounded'>
          <Row>
            <Col lg='8'>
              <h5 className='fw-bold mb-2'>
                <i className='ri-information-line me-2 text-primary'></i>
                Còn câu hỏi khác?
              </h5>
              <p className='mb-0'>
                Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, vui lòng liên hệ với đội ngũ hỗ trợ khách hàng của chúng tôi.
                Chúng tôi sẵn sàng giúp bạn 24/7.
              </p>
            </Col>
            <Col lg='4' className='text-lg-end mt-3 mt-lg-0'>
              <a href='mailto:support@tour.com' className='btn btn-primary'>
                <i className='ri-mail-line me-2'></i>Liên hệ ngay
              </a>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  );
};

export default PolicyFAQ;
