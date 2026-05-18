import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Input } from 'reactstrap';
import useFetch from '../../hooks/useFetch';
import { BASE_URL } from '../../utils/config';

const ManageBookings = () => {
   const { data: bookings, loading, error } = useFetch(`${BASE_URL}/booking`);
   const [selectedGroup, setSelectedGroup] = useState(null);

   const groupKey = (booking) => {
      const dateKey = booking.bookingAt ? new Date(booking.bookingAt).toISOString().slice(0, 10) : 'unknown'
      const tourId = booking.tourId?._id || booking.tourName || 'unknown'
      return `${tourId}-${dateKey}`
   }

   const tourGroups = bookings?.reduce((acc, booking) => {
      const key = groupKey(booking)
      if (!acc[key]) {
         acc[key] = {
            key,
            tourName: booking.tourName,
            tourId: booking.tourId?._id,
            date: booking.bookingAt ? new Date(booking.bookingAt).toLocaleDateString('vi-VN') : 'Chưa chọn',
            maxGroupSize: booking.tourId?.maxGroupSize || 0,
            bookingCount: 0,
            totalGuests: 0
         }
      }
      acc[key].bookingCount += 1
      acc[key].totalGuests += Number(booking.guestSize || 0)
      return acc
   }, {}) || {}

   const tourGroupList = Object.values(tourGroups)
   const filteredBookings = selectedGroup ? bookings?.filter(booking => groupKey(booking) === selectedGroup) : bookings

   // Hàm cập nhật trạng thái
   const updateStatusHandler = async (id, newStatus) => {
      const token = localStorage.getItem('token');
      try {
         const res = await fetch(`${BASE_URL}/booking/${id}`, {
            method: 'PATCH', // Hoặc PUT tùy bạn đặt ở Route
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
         });

         if (res.ok) {
            window.location.reload(); 
         }
      } catch (err) {
         alert("Lỗi cập nhật trạng thái!");
      }
   };

   const deleteHandler = async (id) => {
      if (window.confirm("Xóa đơn hàng này?")) {
         const token = localStorage.getItem('token');
         const res = await fetch(`${BASE_URL}/booking/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) window.location.reload();
      }
   };

   return (
      <section>
         <Container>
            <Row>
               <Col lg='12' className="mb-4 mt-5">
                  <h2 className="manage__title fw-bold">Quản lý Đơn hàng</h2>
               </Col>
               <Col lg='12' className='mb-4'>
                  <h5 className='mb-3'>Danh sách tour và ngày khởi hành</h5>
                  <Table striped bordered hover responsive className="text-center align-middle">
                     <thead className="table-dark">
                        <tr>
                           <th>Tour</th>
                           <th>Ngày khởi hành</th>
                           <th>Số booking</th>
                           <th>Tổng khách</th>
                           <th>Công suất</th>
                           <th>Hành động</th>
                        </tr>
                     </thead>
                     <tbody>
                        {!loading && !error && tourGroupList?.map(group => {
                           const percent = group.maxGroupSize ? Math.round((group.totalGuests / group.maxGroupSize) * 100) : 0
                           const ratio = group.maxGroupSize ? `${group.totalGuests}/${group.maxGroupSize}` : 'Chưa có'
                           return (
                              <tr key={group.key} onClick={() => setSelectedGroup(group.key)} style={{ cursor: 'pointer' }}>
                                 <td className='text-start'>{group.tourName}</td>
                                 <td>{group.date}</td>
                                 <td>{group.bookingCount}</td>
                                 <td>{ratio}</td>
                                 <td>{group.maxGroupSize ? `${percent}%` : 'Chưa có'}</td>
                                 <td>{selectedGroup === group.key ? 'Đang xem' : 'Xem chi tiết'}</td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </Table>
                  {selectedGroup && (
                     <div className='mb-4'>
                        <Button color='secondary' size='sm' onClick={() => setSelectedGroup(null)}>Xem tất cả booking</Button>
                     </div>
                  )}
               </Col>
               <Col lg='12'>
                  <Table striped bordered hover responsive className="text-center align-middle">
                     <thead className="table-dark">
                        <tr>
                           <th>Khách hàng</th>
                           <th>Tên Tour</th>
                           <th>Số điện thoại</th>
                           <th>Ngày đặt</th>
                           <th>Tổng tiền</th>
                           <th>Trạng thái</th>
                           <th>Thao tác</th>
                        </tr>
                     </thead>
                     <tbody>
                        {!loading && !error && filteredBookings?.map(booking => (
                           <tr key={booking._id}>
                              <td className="text-start">
                                 <strong>{booking.fullName}</strong><br/>
                                 <small>{booking.userEmail}</small>
                              </td>
                              <td className="text-start">{booking.tourName}</td>
                              <td>0{booking.phone}</td>
                              <td>{booking.bookingAt ? new Date(booking.bookingAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                              <td className="text-danger fw-bold">{Number(booking.totalPrice || 0).toLocaleString('vi-VN')}đ</td>
                              <td>
                                 {(() => {
                                    const normalizedStatus = booking.status === 'cancelled' ? 'Đã hủy' : booking.status || 'Đang chờ liên hệ'
                                    return (
                                       <Input 
                                          type="select" 
                                          value={normalizedStatus}
                                          onChange={(e) => updateStatusHandler(booking._id, e.target.value)}
                                          className={normalizedStatus === "Đã liên hệ" ? "text-success" : "text-warning"}
                                          style={{fontSize: '14px', fontWeight: 'bold'}}
                                       >
                                          <option value="Đang chờ liên hệ"> Đang chờ liên hệ</option>
                                          <option value="Đang chờ thanh toán"> Đang chờ thanh toán</option>
                                          <option value="Đã thanh toán"> Đã thanh toán</option>
                                          <option value="Đã hủy"> Đã hủy</option>
                                       </Input>
                                    )
                                 })()}
                              </td>
                              <td className='d-flex gap-2 justify-content-center'>
                                 <Link to={`/admin/bookings/${booking._id}`} className='btn btn-outline-primary btn-sm'>Chi tiết</Link>
                                 <Button color="danger" size="sm" onClick={() => deleteHandler(booking._id)}>Xóa</Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </Table>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default ManageBookings;