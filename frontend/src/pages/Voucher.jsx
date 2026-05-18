import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button } from 'reactstrap';
import { BASE_URL } from '../utils/config';

const Voucher = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [voucher, setVoucher] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchVoucher = async () => {
         try {
            const res = await fetch(`${BASE_URL}/booking/voucher/${id}`);
            const result = await res.json();
            if (res.ok) {
               setVoucher(result.data);
            } else {
               setError(result.message || 'Không tìm thấy voucher');
            }
         } catch (err) {
            setError('Lỗi server khi tải voucher');
         } finally {
            setLoading(false);
         }
      };
      fetchVoucher();
   }, [id]);

   return (
      <section className='mt-5 mb-5'>
         <Container>
            <div className='bg-white rounded shadow-sm p-4'>
               <h2 className='text-primary fw-bold mb-4'>Chi tiết Voucher</h2>
               {loading && <p>Đang tải voucher...</p>}
               {error && <p className='text-danger'>{error}</p>}
               {!loading && !error && voucher && (
                  <div>
                     <p><strong>Mã voucher:</strong> {voucher.code || 'N/A'}</p>
                     <p><strong>Tên tour:</strong> {voucher.tourName || 'N/A'}</p>
                     <p><strong>Người dùng:</strong> {voucher.userName || 'N/A'}</p>
                     <p><strong>Giá trị:</strong> {Number(voucher.amount || 0).toLocaleString('vi-VN')} đ</p>
                     <p><strong>Ngày sử dụng:</strong> {voucher.usedAt ? new Date(voucher.usedAt).toLocaleDateString('vi-VN') : 'Chưa sử dụng'}</p>
                     <div className='mt-4'>
                        <Button color='primary' onClick={() => window.print()}>In voucher</Button>{' '}
                        <Button color='secondary' outline onClick={() => navigate(-1)}>Quay lại</Button>
                     </div>
                  </div>
               )}
            </div>
         </Container>
      </section>
   );
};

export default Voucher;
