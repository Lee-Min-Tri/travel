import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Input, Button, FormGroup, Label, Spinner, Alert, Badge } from 'reactstrap';
import useFetch from '../../hooks/useFetch';
import { BASE_URL } from '../../utils/config';
import '../../style/dashboard.css';

const Dashboard = () => {
   const { data: bookings, loading, error } = useFetch(`${BASE_URL}/booking`);
   const { data: topSpending = [] } = useFetch(`${BASE_URL}/booking/stats/top-spending`);
   const { data: topFrequent = [] } = useFetch(`${BASE_URL}/booking/stats/top-frequent`);
   const { data: topTours = [] } = useFetch(`${BASE_URL}/booking/stats/top-tours`);

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

   const StatCard = ({ icon, title, value, color = 'primary' }) => (
      <div className={`stat-card stat-card-${color}`}>
         <div className='stat-icon'>
            <i className={`ri-${icon}`}></i>
         </div>
         <div className='stat-content'>
            <h6 className='stat-title'>{title}</h6>
            <h3 className='stat-value'>{value}</h3>
         </div>
      </div>
   );

   return (
      <section className='dashboard mt-5 mb-5'>
         <Container>
            {/* HEADER */}
            <Row className='mb-5'>
               <Col lg='12'>
                  <div className='dashboard-header'>
                     <div>
                        <h1 className='dashboard-title'>
                           <i className='ri-dashboard-3-line me-2'></i>
                           Bảng Điều Khiển Quản Trị
                        </h1>
                        <p className='dashboard-subtitle'>Tổng quan doanh thu, booking và thống kê khách hàng</p>
                     </div>
                  </div>
               </Col>
            </Row>

            {/* MAIN STATS CARDS */}
            <Row className='mb-5 gy-3'>
               <Col lg='3' md='6' xs='12'>
                  <StatCard 
                     icon='shopping-cart-2-line' 
                     title='Tổng Booking' 
                     value={totalBookings}
                     color='blue'
                  />
               </Col>
               <Col lg='3' md='6' xs='12'>
                  <StatCard 
                     icon='money-dollar-circle-line' 
                     title='Doanh Thu' 
                     value={`${(totalRevenue / 1000000).toFixed(1)}M đ`}
                     color='green'
                  />
               </Col>
               <Col lg='3' md='6' xs='12'>
                  <StatCard 
                     icon='close-circle-line' 
                     title='Hủy Đặt' 
                     value={`${canceledBookings} (${cancelRate}%)`}
                     color='red'
                  />
               </Col>
               <Col lg='3' md='6' xs='12'>
                  <StatCard 
                     icon='calendar-line' 
                     title='Lượng Khách' 
                     value={bookings?.reduce((sum, item) => sum + (Number(item.guestSize) || 0), 0) || 0}
                     color='orange'
                  />
               </Col>
            </Row>

            {/* DATE FILTER SECTION */}
            <Row className='mb-5'>
               <Col lg='12'>
                  <div className='filter-card'>
                     <div className='filter-header'>
                        <h5 className='mb-0'>
                           <i className='ri-filter-line me-2'></i>Lọc Doanh Thu Theo Khoảng Thời Gian
                        </h5>
                     </div>
                     <Row className='align-items-end gy-3 mt-3'>
                        <Col md='4'>
                           <FormGroup>
                              <Label for='startDate' className='form-label-custom'>Từ ngày</Label>
                              <Input
                                 type='date'
                                 id='startDate'
                                 value={startDate}
                                 onChange={(e) => setStartDate(e.target.value)}
                                 className='input-custom'
                              />
                           </FormGroup>
                        </Col>
                        <Col md='4'>
                           <FormGroup>
                              <Label for='endDate' className='form-label-custom'>Đến ngày</Label>
                              <Input
                                 type='date'
                                 id='endDate'
                                 value={endDate}
                                 onChange={(e) => setEndDate(e.target.value)}
                                 className='input-custom'
                              />
                           </FormGroup>
                        </Col>
                        <Col md='4'>
                           <Button color='secondary' size='sm' onClick={resetFilters} className='btn-custom'>
                              <i className='ri-refresh-line me-1'></i>Xóa Lọc
                           </Button>
                        </Col>
                     </Row>

                     <Row className='mt-4 gy-3'>
                        <Col md='4'>
                           <div className='filter-stat'>
                              <h6>Tổng Booking</h6>
                              <p className='value'>{filteredCount}</p>
                           </div>
                        </Col>
                        <Col md='4'>
                           <div className='filter-stat'>
                              <h6>Doanh Thu</h6>
                              <p className='value'>{filteredRevenue.toLocaleString('vi-VN')} đ</p>
                           </div>
                        </Col>
                        <Col md='4'>
                           <div className='filter-stat'>
                              <h6>Hủy Đặt</h6>
                              <p className='value'>{filteredCanceled}</p>
                           </div>
                        </Col>
                     </Row>
                  </div>
               </Col>
            </Row>

            {/* TOP STATS TABLES */}
            <Row className='mb-5 gy-4'>
               {/* Top Spending Customers */}
               <Col lg='4'>
                  <div className='stats-table-card'>
                     <div className='table-header'>
                        <h6 className='mb-0'>
                           <i className='ri-heart-3-line me-2 text-danger'></i>
                           Top 10 Khách Chi Tiền Nhiều Nhất
                        </h6>
                     </div>
                     <div className='table-body'>
                        {topSpending && topSpending.length > 0 ? (
                           <div className='top-list'>
                              {topSpending.map((customer, idx) => (
                                 <div key={idx} className='top-item'>
                                    <div className='rank'>{idx + 1}</div>
                                    <div className='info'>
                                       <p className='name'>{customer._id}</p>
                                       <p className='meta'>{customer.bookingCount} lần đặt</p>
                                    </div>
                                    <div className='amount'>
                                       {(customer.totalSpent / 1000000).toFixed(1)}M đ
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className='text-muted text-center py-3'>Chưa có dữ liệu</p>
                        )}
                     </div>
                  </div>
               </Col>

               {/* Top Frequent Customers */}
               <Col lg='4'>
                  <div className='stats-table-card'>
                     <div className='table-header'>
                        <h6 className='mb-0'>
                           <i className='ri-user-star-line me-2 text-warning'></i>
                           Top 10 Khách Đặt Nhiều Nhất
                        </h6>
                     </div>
                     <div className='table-body'>
                        {topFrequent && topFrequent.length > 0 ? (
                           <div className='top-list'>
                              {topFrequent.map((customer, idx) => (
                                 <div key={idx} className='top-item'>
                                    <div className='rank'>{idx + 1}</div>
                                    <div className='info'>
                                       <p className='name'>{customer._id}</p>
                                       <p className='meta'>{customer.totalSpent.toLocaleString('vi-VN')} đ</p>
                                    </div>
                                    <div className='count'>
                                       {customer.bookingCount} lần
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className='text-muted text-center py-3'>Chưa có dữ liệu</p>
                        )}
                     </div>
                  </div>
               </Col>

               {/* Top Booked Tours */}
               <Col lg='4'>
                  <div className='stats-table-card'>
                     <div className='table-header'>
                        <h6 className='mb-0'>
                           <i className='ri-map-pin-2-line me-2 text-info'></i>
                           Top 10 Tour Đặt Nhiều Nhất
                        </h6>
                     </div>
                     <div className='table-body'>
                        {topTours && topTours.length > 0 ? (
                           <div className='top-list'>
                              {topTours.map((tour, idx) => (
                                 <div key={idx} className='top-item'>
                                    <div className='rank'>{idx + 1}</div>
                                    <div className='info'>
                                       <p className='name text-truncate'>{tour._id}</p>
                                       <p className='meta'>{tour.totalGuests} khách</p>
                                    </div>
                                    <div className='count'>
                                       {tour.bookingCount} lần
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className='text-muted text-center py-3'>Chưa có dữ liệu</p>
                        )}
                     </div>
                  </div>
               </Col>
            </Row>

            {/* RECENT BOOKINGS TABLE */}
            <Row>
               <Col lg='12'>
                  <div className='recent-bookings-card'>
                     <div className='table-header'>
                        <h6 className='mb-0'>
                           <i className='ri-list-check-2 me-2'></i>
                           Danh Sách Booking Gần Đây
                        </h6>
                     </div>
                     <div className='table-responsive'>
                        {loading && (
                           <div className='text-center py-5'>
                              <Spinner color='primary' size='sm' className='me-2' />
                              Đang tải dữ liệu...
                           </div>
                        )}
                        {error && (
                           <Alert color='danger' className='mb-0'>{error}</Alert>
                        )}
                        {!loading && !error && (
                           <Table striped hover responsive className='mb-0'>
                              <thead>
                                 <tr>
                                    <th>Người Đặt</th>
                                    <th>Tour</th>
                                    <th>Số lượng khách</th>
                                    <th>Ngày Đặt</th>
                                    <th>Giá</th>
                                    <th>Trạng Thái</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {bookings?.slice(0, 10).map(item => (
                                    <tr key={item._id}>
                                       <td>
                                          <strong>{item.fullName || 'N/A'}</strong><br />
                                          <small className='text-muted'>{item.userEmail}</small>
                                       </td>
                                       <td>{item.tourName || 'N/A'}</td>
                                       <td>{item.guestSize ? `${item.guestSize} khách` : 'Chưa rõ'}</td>
                                       <td>{item.bookingAt ? new Date(item.bookingAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                       <td className='fw-bold text-danger'>{Number(item.totalPrice || 0).toLocaleString('vi-VN')} đ</td>
                                       <td>
                                          <Badge 
                                             color={
                                                item.status === 'Đã thanh toán' ? 'success' :
                                                item.status === 'Đã hủy' ? 'danger' :
                                                item.status === 'Đang chờ thanh toán' ? 'warning' :
                                                'secondary'
                                             }
                                          >
                                             {item.status || 'Chưa xử lý'}
                                          </Badge>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </Table>
                        )}
                     </div>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default Dashboard;
