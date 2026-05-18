import React from 'react';
import { Container, Table, Button } from 'reactstrap';
import useFetch from '../hooks/useFetch';
import { BASE_URL } from '../utils/config';

const MyBookings = () => {
   const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
   const userId = user?._id || '';
   const { data: bookings, loading, error } = useFetch(userId ? `${BASE_URL}/booking/user/${userId}` : null);

   const isCancelled = status => {
      if (!status) return false;
      const normalized = status.toString().toLowerCase();
      return normalized === 'đã hủy' || normalized === 'cancelled';
   };

   const activeBookings = bookings?.filter(booking => !isCancelled(booking.status)) || [];

   const cancelBooking = async id => {
      if (!window.confirm('Bạn có chắc chắn muốn huỷ booking này?')) return;
      const token = localStorage.getItem('token');
      try {
         const res = await fetch(`${BASE_URL}/booking/${id}/cancel`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            }
         });
         const result = await res.json();
         if (res.ok) {
            alert('Huỷ booking thành công!');
            window.location.reload();
         } else {
            alert(result.message || 'Không thể huỷ booking');
         }
      } catch (err) {
         alert('Lỗi server khi huỷ booking');
      }
   };

   if (!user) {
      return (
         <section className='mt-5 mb-5'>
            <Container>
               <h2 className='mb-4 text-primary fw-bold'>Booking của tôi</h2>
               <div className='bg-white rounded shadow-sm p-4'>
                  <p>Vui lòng đăng nhập để xem Booking của bạn.</p>
               </div>
            </Container>
         </section>
      );
   }

   return (
      <section className='mt-5 mb-5'>
         <Container>
            <h2 className='mb-4 text-primary fw-bold'>Booking của tôi</h2>
            <div className='bg-white rounded shadow-sm p-4'>
               {loading && <p>Đang tải dữ liệu...</p>}
               {error && <p className='text-danger'>{error}</p>}
               {!loading && !error && bookings?.length === 0 && <p>Bạn chưa có booking nào.</p>}
               {!loading && !error && activeBookings?.length === 0 && bookings?.length > 0 && (
                  <p>Bạn chưa có tour đang đăng ký. Các tour đã hủy không được hiển thị ở đây.</p>
               )}
               {!loading && !error && activeBookings?.length > 0 && (
                  <Table responsive striped>
                     <thead>
                        <tr>
                           <th>#</th>
                           <th>Tour</th>
                           <th>Ngày đi</th>
                           <th>Số khách</th>
                           <th>Giá</th>
                           <th>Trạng thái</th>
                           <th>Hành động</th>
                        </tr>
                     </thead>
                     <tbody>
                        {activeBookings.map((item, index) => (
                           <tr key={item._id || index}>
                              <td>{index + 1}</td>
                              <td>
                                 <Button color='link' className='p-0' onClick={() => window.location.href = `/booking/${item._id}`}>
                                    {item.tourId?.title || item.tourName || 'N/A'}
                                 </Button>
                              </td>
                              <td>{item.bookingAt ? new Date(item.bookingAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                              <td>{item.guestSize || 1} khách</td>
                              <td>{Number(item.totalPrice || 0).toLocaleString('vi-VN')} đ</td>
                              <td>{item.status || 'Chưa xử lý'}</td>
                              <td className='d-flex gap-2'>
                                 <Button color='primary' size='sm' onClick={() => window.location.href = `/booking/${item._id}`}>
                                    Chi tiết
                                 </Button>
                                 <Button color='danger' size='sm' onClick={() => cancelBooking(item._id)}>
                                    Huỷ
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </Table>
               )}
            </div>
         </Container>
      </section>
   );
};

export default MyBookings;
