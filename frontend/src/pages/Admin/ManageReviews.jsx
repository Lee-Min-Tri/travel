import React from 'react'
import { Container, Row, Col, Table, Button, Spinner } from 'reactstrap'
import useFetch from '../../hooks/useFetch'
import { BASE_URL } from '../../utils/config'

const ManageReviews = () => {
  const { data: reviews, loading, error } = useFetch(`${BASE_URL}/review/all`)

  const deleteReviewHandler = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/review/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await res.json()
      if (res.ok) {
        alert(result.message || 'Xóa thành công')
        window.location.reload()
      } else {
        alert(result.message || 'Không thể xóa đánh giá')
      }
    } catch (err) {
      alert('Lỗi server khi xóa đánh giá')
    }
  }

  return (
    <section className='mt-5 mb-5'>
      <Container>
        <Row>
          <Col lg='12' className='mb-4'>
            <h2 className='fw-bold text-primary'>Quản lý Đánh giá</h2>
            <p className='text-muted'>Xem và xóa đánh giá của khách hàng.</p>
          </Col>

          <Col lg='12'>
            <div className='bg-white rounded shadow-sm p-4'>
              {loading && (
                <div className='text-center py-5'>
                  <Spinner color='primary' />
                  <p className='mt-3'>Đang tải đánh giá...</p>
                </div>
              )}

              {error && <div className='alert alert-danger'>{error}</div>}

              {!loading && !error && reviews?.length === 0 && (
                <div className='alert alert-info'>Chưa có đánh giá nào.</div>
              )}

              {!loading && !error && reviews?.length > 0 && (
                <Table responsive striped hover className='mb-0'>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tour</th>
                      <th>Người đánh giá</th>
                      <th>Đánh giá</th>
                      <th>Sao</th>
                      <th>Ngày</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review, index) => (
                      <tr key={review._id || index}>
                        <td>{index + 1}</td>
                        <td>{review.productId?.title || 'Không xác định'}</td>
                        <td>{review.username}</td>
                        <td>{review.reviewText}</td>
                        <td>{review.rating}</td>
                        <td>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <Button color='danger' size='sm' onClick={() => deleteReviewHandler(review._id)}>
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default ManageReviews
