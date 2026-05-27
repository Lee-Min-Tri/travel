import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Table, Spinner, Alert, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap'
import { BASE_URL } from '../../utils/config'

const ManageFAQ = () => {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'khác',
    isPublished: true,
    order: 0
  })

  const fetchFaqs = async () => {
    setLoading(true)
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
        setError(null)
      } else {
        setError(result.message || 'Không thể tải FAQ')
      }
    } catch (err) {
      setError('Lỗi server khi tải FAQ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const toggleModal = () => {
    setModalOpen(!modalOpen)
    if (modalOpen) {
      setEditMode(false)
      setSelectedFaq(null)
      setFormData({ question: '', answer: '', category: 'khác', isPublished: true, order: 0 })
    }
  }

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }))
  }

  const openCreateModal = () => {
    setEditMode(false)
    setSelectedFaq(null)
    setFormData({ question: '', answer: '', category: 'khác', isPublished: true, order: 0 })
    setModalOpen(true)
  }

  const openEditModal = (faq) => {
    setEditMode(true)
    setSelectedFaq(faq)
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'khác',
      isPublished: faq.isPublished ?? true,
      order: faq.order ?? 0
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editMode ? `${BASE_URL}/faqs/${selectedFaq._id}` : `${BASE_URL}/faqs`
    const method = editMode ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const result = await res.json()
      if (!res.ok) {
        return alert(result.message || 'Thao tác không thành công')
      }
      alert(result.message || 'Thao tác thành công')
      toggleModal()
      fetchFaqs()
    } catch (err) {
      alert('Lỗi server khi thực hiện yêu cầu')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa FAQ này?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await res.json()
      if (!res.ok) {
        return alert(result.message || 'Xóa không thành công')
      }
      alert(result.message || 'Xóa thành công')
      fetchFaqs()
    } catch (err) {
      alert('Lỗi server khi xóa FAQ')
    }
  }

  return (
    <section className='mt-5 mb-5'>
      <Container>
        <div className='bg-white rounded shadow-sm p-4'>
          <div className='d-flex align-items-center justify-content-between mb-4'>
            <div>
              <h2 className='fw-bold text-primary'>Quản lý FAQ</h2>
              <p className='text-muted mb-0'>Xem danh sách câu hỏi và chỉnh sửa nội dung sau này.</p>
            </div>
            <Button color='primary' onClick={openCreateModal}>Thêm FAQ mới</Button>
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
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((faq, index) => (
                      <tr key={faq._id}>
                        <td>{index + 1}</td>
                        <td>{faq.question}</td>
                        <td>{faq.category}</td>
                        <td>{faq.isPublished ? 'Có' : 'Không'}</td>
                        <td>
                          <Button color='warning' size='sm' className='me-2' onClick={() => openEditModal(faq)}>Sửa</Button>
                          <Button color='danger' size='sm' onClick={() => handleDelete(faq._id)}>Xóa</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </div>
      </Container>

      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>{editMode ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'}</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for='question'>Câu hỏi</Label>
              <Input type='text' id='question' value={formData.question} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <Label for='answer'>Câu trả lời</Label>
              <Input type='textarea' id='answer' value={formData.answer} onChange={handleChange} required rows='5' />
            </FormGroup>
            <FormGroup>
              <Label for='category'>Danh mục</Label>
              <Input type='select' id='category' value={formData.category} onChange={handleChange}>
                <option value='bảo hiểm'>Bảo hiểm</option>
                <option value='hoàn hủy'>Hoàn hủy</option>
                <option value='an toàn'>An toàn</option>
                <option value='thủ tục'>Thủ tục</option>
                <option value='khác'>Khác</option>
              </Input>
            </FormGroup>
            <FormGroup check className='mb-3'>
              <Label check>
                <Input type='checkbox' id='isPublished' checked={formData.isPublished} onChange={handleChange} />{' '}
                Hiển thị công khai
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for='order'>Thứ tự hiển thị</Label>
              <Input type='number' id='order' value={formData.order} onChange={handleChange} min='0' />
            </FormGroup>
            <Button color='primary' type='submit' className='w-100 mt-3'>Lưu FAQ</Button>
          </Form>
        </ModalBody>
      </Modal>
    </section>
  )
}

export default ManageFAQ
