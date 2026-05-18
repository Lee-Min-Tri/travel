import React, { useState } from 'react';
import { Container, Row, Col, Table, Input, Button, FormGroup, Label } from 'reactstrap';
import useFetch from '../../hooks/useFetch';
import { BASE_URL } from '../../utils/config';

const Dashboard = () => {
   const { data: bookings, loading, error } = useFetch(`${BASE_URL}/booking`);

   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');

   const totalBookings = bookings?.length || 0;
   const totalRevenue = bookings?.reduce((sum, item) => {
      return item.status === 'Đã thanh toán' ? sum + (item.totalPrice || 0) : sum;
   }, 0) || 0;
   const canceledBookings = bookings?.filter(item => item.status === 'Đã hủy' || item.status === 'cancelled').length || 0;
   const cancelRate = totalBookings ? Math.round((canceledBookings / totalBookings) * 100) : 0;

   const filterBookingByDate = (booking) => {
      if (!booking.bookingAt) return false;
      if (!startDate && !endDate) return true;
      const bookingTime = new Date(booking.bookingAt).setHours(0,0,0,0);
      const fromTime = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
      const toTime = endDate ? new Date(endDate).setHours(23,59,59,999) : null;
      if (fromTime !== null && bookingTime < fromTime) return false;
      if (toTime !== null && bookingTime > toTime) return false;
      return true;
   };

   const filteredBookings = bookings?.filter(filterBookingByDate) || [];
   const filteredRevenue = filteredBookings?.reduce((sum, item) => {
      return item.status === 'Đã thanh toán' ? sum + (item.totalPrice || 0) : sum;
   }, 0) || 0;
   const filteredCount = filteredBookings?.length || 0;
   const filteredCanceled = filteredBookings?.filter(item => item.status === 'Đã hủy' || item.status === 'cancelled').length || 0;

   const resetFilters = () => {
      setStartDate('');
      setEndDate('');
   };

   return (
      <section className='mt-5 mb-5'>
         <Container>
            <Row>
               <Col lg='12' className='mb-4'>
                  <h2 className='text-primary fw-bold'>Bảng điều khiển Admin</h2>
                  <p className='text-muted'>Tổng quan đơn hàng và doanh thu hệ thống.</p>
               </Col>

               <Col lg='4' md='6' className='mb-3'>
                  <div className='p-4 bg-white rounded shadow-sm'>
                     <h5 className='mb-3'>Tổng booking</h5>
                     <h3>{totalBookings}</h3>
                  </div>
               </Col>
               <Col lg='4' md='6' className='mb-3'>
                  <div className='p-4 bg-white rounded shadow-sm'>
                     <h5 className='mb-3'>Doanh thu</h5>
                     <h3>{totalRevenue.toLocaleString('vi-VN')} đ</h3>
                  </div>
               </Col>
               <Col lg='12' className='mb-4'>
                  <div className='bg-white rounded shadow-sm p-4'>
                     <h5 className='mb-4'>Lọc doanh thu theo ngày/tháng/năm</h5>
                     <Row className='align-items-end gy-3'>
                        <Col md='4'>
                           <FormGroup>
                              <Label for='startDate'>Từ ngày</Label>
                              <Input
                                 type='date'
                                 id='startDate'
                                 value={startDate}
                                 onChange={(e) => setStartDate(e.target.value)}
                              />
                           </FormGroup>
                        </Col>
                        <Col md='4'>
                           <FormGroup>
                              <Label for='endDate'>Đến ngày</Label>
                              <Input
                                 type='date'
                                 id='endDate'
                                 value={endDate}
                                 onChange={(e) => setEndDate(e.target.value)}
                              />
                           </FormGroup>
                        </Col>
                        <Col md='4' className='d-flex gap-2'>
                           <Button color='primary' onClick={resetFilters}>Xóa lọc</Button>
                        </Col>
                     </Row>

                     <Row className='mt-4'>
                        <Col md='4' className='mb-3'>
                           <div className='p-3 bg-light rounded'>
                              <h6>Tổng booking</h6>
                              <p className='fs-4 mb-0'>{filteredCount}</p>
                           </div>
                        </Col>
                        <Col md='4' className='mb-3'>
                           <div className='p-3 bg-light rounded'>
                              <h6>Doanh thu</h6>
                              <p className='fs-4 mb-0'>{filteredRevenue.toLocaleString('vi-VN')} đ</p>
                           </div>
                        </Col>
                        <Col md='4' className='mb-3'>
                           <div className='p-3 bg-light rounded'>
                              <h6>Hủy đặt</h6>
                              <p className='fs-4 mb-0'>{filteredCanceled}</p>
                           </div>
                        </Col>
                     </Row>
                  </div>
               </Col>

               <Col lg='12' className='mt-4'>
                  <div className='bg-white rounded shadow-sm p-4'>
                     <h5 className='mb-4'>Danh sách booking mới</h5>
                     <Table striped responsive>
                        <thead>
                           <tr>
                              <th>Người đặt</th>
                              <th>Tour</th>
                              <th>Ngày</th>
                              <th>Giá</th>
                              <th>Trạng thái</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading && (
                              <tr>
                                 <td colSpan='5'>Đang tải dữ liệu...</td>
                              </tr>
                           )}
                           {error && (
                              <tr>
                                 <td colSpan='5' className='text-danger'>{error}</td>
                              </tr>
                           )}
                           {!loading && !error && bookings?.map(item => (
                              <tr key={item._id}>
                                 <td>{item.fullName || 'N/A'}</td>
                                 <td>{item.tourName || 'N/A'}</td>
                                 <td>{item.bookingAt ? new Date(item.bookingAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                 <td>{Number(item.totalPrice || 0).toLocaleString('vi-VN')} đ</td>
                                 <td>{item.status || 'Chưa xử lý'}</td>
                              </tr>
                           ))}
                        </tbody>
                     </Table>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default Dashboard;
