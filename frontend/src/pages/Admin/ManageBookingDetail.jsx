import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../utils/config';
import '../../style/manage-booking-detail.css';

const ManageBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [guides, setGuides] = useState([]);

  const currentUser = user || null;
  const shouldAutoFillConsultant = currentUser && (currentUser.role === 'admin' || currentUser.role === 'nhân viên');
  const currentConsultantInfo = shouldAutoFillConsultant
    ? { name: currentUser.username || currentUser.name || '', phone: currentUser.phone || '' }
    : { name: '', phone: '' };

  const [formData, setFormData] = useState({
    startLocation: '',
    departureTime: '',
    consultant: { name: '', phone: '' },
    tourGuide: { name: '', phone: '' },
    specialNote: '',
    status: '',
    guestSize: 1,
    childrenUnder7: 0,
    children7To12: 0,
    guideId: ''
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
          
          // Auto-fill tourGuide from tour if available
          const tourGuideFromTour = result.data.tourId?.tourGuide || result.data.tourGuide || { name: '', phone: '' };
          const guideIdFromTour = result.data.tourId?.tourGuide?.guideId || result.data.guideId || '';
          
          setFormData({
            startLocation: result.data.startLocation || '',
            departureTime: result.data.departureTime || '',
            consultant: shouldAutoFillConsultant
              ? currentConsultantInfo
              : result.data.consultant || { name: '', phone: '' },
            tourGuide: tourGuideFromTour,
            specialNote: result.data.specialNote || '',
            status: result.data.status || '',
            guestSize: result.data.guestSize || 1,
            childrenUnder7: result.data.childrenUnder7 || 0,
            children7To12: result.data.children7To12 || 0,
            guideId: guideIdFromTour
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

    const fetchGuides = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/users/guides`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await res.json();
        if (res.ok) {
          setGuides(result.data || []);
        }
      } catch (err) {
        console.error('Không thể tải danh sách hướng dẫn viên', err);
      }
    };

    fetchBookingDetail();
    fetchGuides();
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

  const availableGuides = guides.filter(guide => guide.status === 'Đang rảnh' || guide._id === formData.guideId)

  const handleGuideSelection = (e) => {
    const selectedId = e.target.value
    const guide = guides.find(item => item._id === selectedId)
    setFormData(prev => ({
      ...prev,
      guideId: selectedId,
      tourGuide: {
        ...prev.tourGuide,
        name: guide?.username || '',
        phone: guide?.phone || ''
      }
    }))
  }

  const getBookingPriceSummary = () => {
    const price = booking?.tourId?.price || 0
    const guestSizeCount = Number(formData.guestSize || 0)
    const under7 = Number(formData.childrenUnder7 || 0)
    const sevenTo12 = Number(formData.children7To12 || 0)
    const adults = Math.max(0, guestSizeCount - under7 - sevenTo12)

    const adultTotal = adults * price
    const childTotal = sevenTo12 * price * 0.5
    return {
      adults,
      under7,
      sevenTo12,
      total: adultTotal + childTotal
    }
  }

  const bookingSummary = getBookingPriceSummary()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...formData,
      consultant: shouldAutoFillConsultant ? currentConsultantInfo : formData.consultant
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/booking/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
                <Col lg='12'>
                  <FormGroup>
                    <Label for='guideId' className='fw-bold'>
                      Chọn hướng dẫn viên
                    </Label>
                    <Input type='select' id='guideId' value={formData.guideId} onChange={handleGuideSelection}>
                      <option value=''>-- Chọn HDV --</option>
                      {availableGuides.map(guide => (
                        <option key={guide._id} value={guide._id}>
                          {guide.username} ({guide.email}) - {guide.status || 'Không xác định'}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
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

            {/* Voucher / Child Pricing */}
            <div className='form_section mb-5'>
              <h5 className='fw-bold text-secondary mb-3'>ƯU ĐÃI TRẺ EM</h5>
              <Row>
                <Col lg='4'>
                  <FormGroup>
                    <Label for='guestSize' className='fw-bold'>
                      Tổng số khách
                    </Label>
                    <Input
                      type='number'
                      min='1'
                      id='guestSize'
                      value={formData.guestSize}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col lg='4'>
                  <FormGroup>
                    <Label for='childrenUnder7' className='fw-bold'>
                      Trẻ em dưới 7 tuổi (miễn phí)
                    </Label>
                    <Input
                      type='number'
                      min='0'
                      id='childrenUnder7'
                      value={formData.childrenUnder7}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col lg='4'>
                  <FormGroup>
                    <Label for='children7To12' className='fw-bold'>
                      Trẻ em 7-12 tuổi (giảm 50%)
                    </Label>
                    <Input
                      type='number'
                      min='0'
                      id='children7To12'
                      value={formData.children7To12}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col lg='6'>
                  <div className='p-3 bg-light rounded'>
                    <p className='mb-1'><strong>Người lớn:</strong> {bookingSummary.adults}</p>
                    <p className='mb-1'><strong>Trẻ em dưới 7 tuổi:</strong> {bookingSummary.under7}</p>
                    <p className='mb-1'><strong>Trẻ em 7-12 tuổi:</strong> {bookingSummary.sevenTo12}</p>
                    <p className='mb-0'><strong>Giá dự tính:</strong> {Number(bookingSummary.total).toLocaleString('vi-VN')} đ</p>
                  </div>
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
                      disabled={shouldAutoFillConsultant}
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
                      disabled={shouldAutoFillConsultant}
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
