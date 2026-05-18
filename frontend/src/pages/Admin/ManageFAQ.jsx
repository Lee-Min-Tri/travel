import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Table, Spinner, Alert } from 'reactstrap'
import { BASE_URL } from '../../utils/config'

const ManageFAQ = () => {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/faqs/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const result = await res.json()
        if (res.ok) {
          setFaqs(result.data || [])
        } else {
          setError(result.message || 'Không thể tải FAQ')
        }
      } catch (err) {
        setError('Lỗi server khi tải FAQ')
      } finally {
        setLoading(false)
      }
    }
    fetchFaqs()
  }, [])

  return (
    <section className='mt-5 mb-5'>
      <Container>
        <div className='bg-white rounded shadow-sm p-4'>
          <div className='d-flex align-items-center justify-content-between mb-4'>
            <div>
              <h2 className='fw-bold text-primary'>Quản lý FAQ</h2>
              <p className='text-muted mb-0'>Xem danh sách câu hỏi và chỉnh sửa nội dung sau này.</p>
            </div>
            <Button color='primary'>Thêm FAQ mới</Button>
          </div>

          {loading && (
            <div className='text-center py-5'>
              <Spinner color='primary' />
              <p className='mt-3'>Đang tải FAQ...</p>
            </div>
          )}

          {error && <Alert color='danger'>{error}</Alert>}

          {!loading && !error && (
            <Row>
              <Col>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Câu hỏi</th>
                      <th>Danh mục</th>
                      <th>Hiển thị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((faq, index) => (
                      <tr key={faq._id}>
                        <td>{index + 1}</td>
                        <td>{faq.question}</td>
                        <td>{faq.category}</td>
                        <td>{faq.isPublished ? 'Có' : 'Không'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </div>
      </Container>
    </section>
  )
}

export default ManageFAQ
