import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner } from 'reactstrap';
import { BASE_URL } from '../utils/config';
import BookingTimeline from '../components/Booking/BookingTimeline';
import '../style/booking-detail.css';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handlePrint = () => {
    window.print();
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

  if (error) {
    return (
      <section className='mt-5 mb-5'>
        <Container>
          <div className='alert alert-danger'>{error}</div>
          <Button color='secondary' onClick={() => navigate('/mybooking')}>Quay lại</Button>
        </Container>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className='mt-5 mb-5'>
        <Container>
          <div className='alert alert-warning'>Không tìm thấy booking</div>
          <Button color='secondary' onClick={() => navigate('/mybooking')}>Quay lại</Button>
        </Container>
      </section>
    );
  }

  const childrenUnder7 = Number(booking.childrenUnder7 || 0)
  const children7To12 = Number(booking.children7To12 || 0)
  const adultsCount = Math.max(0, Number(booking.guestSize || 0) - childrenUnder7 - children7To12)
  const totalPrice = Number(booking.totalPrice || 0)

  console.log("Dữ liệu Itinerary nhận được:", booking.tourId?.itinerary);

  return (
    <section className='booking_detail mt-5 mb-5'>
      <Container>
        <div className='e-ticket bg-white rounded shadow-lg p-5'>
          {/* Header */}
          <div className='ticket_header text-center mb-4 pb-3 border-bottom'>
            <h2 className='text-primary fw-bold'>VÉ ĐIỆN TỬ TOUR</h2>
            <p className='text-muted mb-0'>Mã đơn: {booking._id}</p>
          </div>

          {/* Tour & Guest Info */}
          <Row className='mb-5'>
            <Col lg='6'>
              <div className='info_section'>
                <h5 className='fw-bold text-secondary'>THÔNG TIN TOUR</h5>
                <p><strong>Tên tour:</strong> {booking.tourName}</p>
                <p><strong>Ngày khởi hành:</strong> {new Date(booking.bookingAt).toLocaleDateString('vi-VN')}</p>
                <p><strong>Số lượng khách:</strong> {booking.guestSize} người</p>
              </div>
            </Col>
            <Col lg='6'>
              <div className='info_section'>
                <h5 className='fw-bold text-secondary'>THÔNG TIN KHÁCH</h5>
                <p><strong>Họ tên:</strong> {booking.fullName}</p>
                <p><strong>Email:</strong> {booking.userEmail}</p>
                <p><strong>Số điện thoại:</strong> 0{booking.phone}</p>
              </div>
            </Col>
          </Row>

          {/* Departure Details */}
          {booking.startLocation || booking.departureTime ? (
            <Row className='mb-5'>
              <Col lg='6'>
                <div className='info_section'>
                  <h5 className='fw-bold text-secondary'>ĐIỂM ĐÓN & GIỜ KHỞI HÀNH</h5>
                  <p><strong>Địa điểm đón:</strong> {booking.startLocation || 'Chưa xác định'}</p>
                  <p><strong>Giờ khởi hành:</strong> {booking.departureTime || 'Chưa xác định'}</p>
                </div>
              </Col>
              <Col lg='6'>
                <div className='info_section'>
                  <h5 className='fw-bold text-secondary'>GHI CHÚ LỘ TRÌNH</h5>
                  <p>{booking.specialNote || 'Không có ghi chú đặc biệt'}</p>
                </div>
              </Col>
            </Row>
          ) : null}

          {/* Tour Guide & Consultant Info */}
          <Row className='mb-5'>
            {booking.tourGuide && booking.tourGuide.name ? (
              <Col lg='6'>
                <div className='info_section guide_info'>
                  <h5 className='fw-bold text-secondary'>HƯỚNG DẪN VIÊN</h5>
                  <div className='d-flex align-items-center gap-3'>
                    <div>
                      <p className='mb-1'><strong>Tên HDV:</strong> {booking.tourGuide.name}</p>
                      <p className='mb-0'><strong>Liên hệ:</strong> 0{booking.tourGuide.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </Col>
            ) : null}

            {booking.consultant && booking.consultant.name ? (
              <Col lg='6'>
                <div className='info_section consultant_info'>
                  <h5 className='fw-bold text-secondary'>NHÂN VIÊN TƯ VẤN</h5>
                  <div className='d-flex align-items-center gap-3'>
                    <div>
                      <p className='mb-1'><strong>Tên NV:</strong> {booking.consultant.name}</p>
                      <p className='mb-0'><strong>Liên hệ:</strong> 0{booking.consultant.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </Col>
            ) : null}
          </Row>

          {/* Pricing */}
          <div className='pricing_section mb-5 p-3 bg-light rounded'>
            <Row>
              <Col lg='6' className='offset-lg-6'>
                <h5 className='fw-bold mb-3'>CHI TIẾT THANH TOÁN</h5>
                <p className='d-flex justify-content-between'><span>Tổng giá:</span> <strong>{totalPrice.toLocaleString('vi-VN')}đ</strong></p>
                <p className='d-flex justify-content-between'><span>Người lớn:</span> <strong>{adultsCount}</strong></p>
                {childrenUnder7 > 0 && (
                  <p className='d-flex justify-content-between'><span>Trẻ em dưới 7 tuổi:</span> <strong>{childrenUnder7} (Miễn phí)</strong></p>
                )}
                {children7To12 > 0 && (
                  <p className='d-flex justify-content-between'><span>Trẻ em 7-12 tuổi:</span> <strong>{children7To12} (Giảm 50%)</strong></p>
                )}
                <p className='d-flex justify-content-between text-muted'><span>Trạng thái:</span> <strong>{booking.status}</strong></p>
              </Col>
            </Row>
          </div>

          {/* Timeline */}
          <div className='mb-5'>
            <h5 className='fw-bold text-secondary mb-3'>Lộ trình tour</h5>
            {/* Kiểm tra ưu tiên lấy itinerary từ booking trước, nếu không có thì lấy từ tourId */}
            {booking.tourId?.itinerary?.length > 0 || booking.itinerary?.length > 0 ? (
              <BookingTimeline
                itinerary={booking.itinerary?.length > 0 ? booking.itinerary : booking.tourId.itinerary}
              />
            ) : (
              <div className='timeline_empty text-center p-4 bg-light rounded'>
                <p className='text-muted mb-0'>Đang cập nhật lịch trình chi tiết...</p>
              </div>
            )}
          </div>

          {/* Special Request */}
          {booking.specialRequest && (
            <div className='request_section mb-5 p-3 bg-warning bg-opacity-10 rounded'>
              <h5 className='fw-bold'>YÊU CẦU ĐẶC BIỆT</h5>
              <p>{booking.specialRequest}</p>
            </div>
          )}

          {/* Actions */}
          <div className='ticket_actions text-center mt-5 pt-3 border-top'>
            <Button color='primary' className='me-2' onClick={handlePrint}>
              <i className='ri-printer-line me-2'></i>In vé
            </Button>
            <Button color='secondary' outline onClick={() => navigate('/mybooking')}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BookingDetail;
