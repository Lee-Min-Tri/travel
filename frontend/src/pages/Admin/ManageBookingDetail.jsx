import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import { BASE_URL } from '../../utils/config';
import '../../style/manage-booking-detail.css';

const ManageBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    startLocation: '',
    departureTime: '',
    consultant: { name: '', phone: '' },
    tourGuide: { name: '', phone: '' },
    specialNote: '',
    status: ''
  });

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/booking/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await res.json();
        if (res.ok) {
          setBooking(result.data);
          setFormData({
            startLocation: result.data.startLocation || '',
            departureTime: result.data.departureTime || '',
            consultant: result.data.consultant || { name: '', phone: '' },
            tourGuide: result.data.tourGuide || { name: '', phone: '' },
            specialNote: result.data.specialNote || '',
            status: result.data.status || ''
          });
        } else {
          setError(result.message || 'Không thể tải thông tin booking');
        }
      } catch (err) {
        setError('Lỗi server khi tải booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [id]);

  const handleChange = (e) => {
    const { id: fieldId, value } = e.target;

    if (fieldId.includes('consultant.') || fieldId.includes('tourGuide.')) {
      const [section, field] = fieldId.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldId]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/booking/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess('Cập nhật booking thành công!');
        setBooking(result.data);
        setTimeout(() => navigate('/admin/bookings'), 2000);
      } else {
        setError(result.message || 'Không thể cập nhật booking');
      }
    } catch (err) {
      setError('Lỗi server: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className='mt-5 mb-5'>
        <Container>
          <div className='text-center'>
            <Spinner color='primary' />
            <p>Đang tải thông tin booking...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className='mt-5 mb-5'>
        <Container>
          <Alert color='danger'>{error || 'Không tìm thấy booking'}</Alert>
          <Button color='secondary' onClick={() => navigate('/admin/bookings')}>Quay lại</Button>
        </Container>
      </section>
    );
  }

  return (
    <section className='manage_booking_detail mt-5 mb-5'>
      <Container>
        <div className='bg-white rounded shadow-lg p-4'>
          <h2 className='fw-bold text-primary mb-4'>
            <i className='ri-edit-line me-2'></i>Cập nhật Booking - {booking.fullName}
          </h2>

          {error && <Alert color='danger'>{error}</Alert>}
          {success && <Alert color='success'>{success}</Alert>}

          {/* Customer Info (Read-only) */}
          <div className='customer_info mb-5 p-4 bg-light rounded'>
            <h5 className='fw-bold mb-3'>THÔNG TIN KHÁCH</h5>
            <Row>
              <Col lg='6'>
                <p><strong>Họ tên:</strong> {booking.fullName}</p>
                <p><strong>Email:</strong> {booking.userEmail}</p>
              </Col>
              <Col lg='6'>
                <p><strong>SĐT:</strong> {booking.phone}</p>
                <p><strong>Tour:</strong> {booking.tourName}</p>
              </Col>
            </Row>
          </div>

          {/* Editable Form */}
          <Form onSubmit={handleSubmit}>
            {/* Departure Details */}
            <div className='form_section mb-5'>
              <h5 className='fw-bold text-secondary mb-3'>ĐIỂM ĐÓN & GIỜ KHỞI HÀNH</h5>
              <Row>
                <Col lg='6'>
                  <FormGroup>
                    <Label for='startLocation' className='fw-bold'>
                      Địa điểm đón khách
                    </Label>
                    <Input
                      type='text'
                      id='startLocation'
                      placeholder='VD: Tòa nhà A, Quốc Lộ 1A'
                      value={formData.startLocation}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col lg='6'>
                  <FormGroup>
                    <Label for='departureTime' className='fw-bold'>
                      Giờ khởi hành
                    </Label>
                    <Input
                      type='time'
                      id='departureTime'
                      value={formData.departureTime}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </div>

            {/* Tour Guide Info */}
            <div className='form_section mb-5'>
              <h5 className='fw-bold text-secondary mb-3'>HƯỚNG DẪN VIÊN</h5>
              <Row>
                <Col lg='6'>
                  <FormGroup>
                    <Label for='tourGuide.name' className='fw-bold'>
                      Tên hướng dẫn viên
                    </Label>
                    <Input
                      type='text'
                      id='tourGuide.name'
                      placeholder='Nhập tên HDV'
                      value={formData.tourGuide.name}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col lg='6'>
                  <FormGroup>
                    <Label for='tourGuide.phone' className='fw-bold'>
                      Số điện thoại HDV
                    </Label>
                    <Input
                      type='text'
                      id='tourGuide.phone'
                      placeholder='VD: 0912345678'
                      value={formData.tourGuide.phone}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </div>

            {/* Consultant Info */}
            <div className='form_section mb-5'>
              <h5 className='fw-bold text-secondary mb-3'>NHÂN VIÊN TƯ VẤN</h5>
              <Row>
                <Col lg='6'>
                  <FormGroup>
                    <Label for='consultant.name' className='fw-bold'>
                      Tên nhân viên tư vấn
                    </Label>
                    <Input
                      type='text'
                      id='consultant.name'
                      placeholder='Nhập tên NV'
                      value={formData.consultant.name}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col lg='6'>
                  <FormGroup>
                    <Label for='consultant.phone' className='fw-bold'>
                      Số điện thoại NV
                    </Label>
                    <Input
                      type='text'
                      id='consultant.phone'
                      placeholder='VD: 0912345678'
                      value={formData.consultant.phone}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </div>

            {/* Special Note */}
            <div className='form_section mb-5'>
              <FormGroup>
                <Label for='specialNote' className='fw-bold'>
                  Ghi chú lộ trình / Thỏa thuận riêng
                </Label>
                <Input
                  type='textarea'
                  id='specialNote'
                  placeholder='Nhập ghi chú về những thay đổi lộ trình, yêu cầu đặc biệt...'
                  rows='5'
                  value={formData.specialNote}
                  onChange={handleChange}
                />
              </FormGroup>
            </div>

            {/* Status */}
            <div className='form_section mb-5'>
              <FormGroup>
                <Label for='status' className='fw-bold'>
                  Trạng thái đơn hàng
                </Label>
                <Input
                  type='select'
                  id='status'
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value=''>-- Chọn trạng thái --</option>
                  <option value='Đang chờ liên hệ'>Đang chờ liên hệ</option>
                  <option value='Đã liên hệ'>Đã liên hệ</option>
                  <option value='Đã xác nhận'>Đã xác nhận</option>
                  <option value='Đang tiến hành'>Đang tiến hành</option>
                  <option value='Hoàn thành'>Hoàn thành</option>
                  <option value='Đã hủy'>Đã hủy</option>
                </Input>
              </FormGroup>
            </div>

            {/* Actions */}
            <div className='form_actions d-flex gap-3'>
              <Button
                type='submit'
                color='primary'
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner size='sm' className='me-2' />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className='ri-save-line me-2'></i>Lưu thay đổi
                  </>
                )}
              </Button>
              <Button
                type='button'
                color='secondary'
                outline
                onClick={() => navigate('/admin/bookings')}
              >
                Hủy
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </section>
  );
};

export default ManageBookingDetail;
