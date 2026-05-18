import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { BASE_URL } from '../../utils/config';

const ManageTours = () => {
   const [page, setPage] = useState(0);
   const [pageCount, setPageCount] = useState(0);

   // 1. Lấy danh sách tour theo trang (mỗi trang 8 bản ghi theo logic Backend)
   const { data: tours, loading, error } = useFetch(`${BASE_URL}/tours?page=${page}`);

   // 2. Lấy tổng số lượng tour để tính tổng số trang
   useEffect(() => {
      const fetchTourCount = async () => {
         try {
            const res = await fetch(`${BASE_URL}/tours/search/getTourCount`);
            const result = await res.json();
            // Tính toán: Tổng tour / 8 (làm tròn lên)
            setPageCount(Math.ceil(result.data / 8));
         } catch (err) {
            console.log("Lỗi lấy số lượng tour:", err);
         }
      };
      fetchTourCount();
   }, [page]);

   // 3. Hàm xử lý xóa Tour
   const deleteHandler = async (id) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa tour này?")) {
         const token = localStorage.getItem('token');
         try {
            const res = await fetch(`${BASE_URL}/tours/${id}`, {
               method: 'DELETE',
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            });

            if (res.ok) {
               alert("Xóa thành công!");
               window.location.reload();
            } else {
               const result = await res.json();
               alert(result.message);
            }
         } catch (err) {
            alert("Lỗi server không thể xóa!");
         }
      }
   };

   return (
      <section>
         <Container>
            <Row>
               {/* HEADER */}
               <Col lg='12' className="d-flex justify-content-between align-items-center mb-4 mt-5">
                  <div>
                     <h2 className="manage__title fw-bold text-primary">Quản lý Tour Hệ thống</h2>
                     <p className="text-muted">Tổng số trang hiện có: {pageCount}</p>
                  </div>
                  <Link to='/admin/tours/create'>
                     <Button className='btn primary__btn shadow-sm'>+ Thêm Tour Mới</Button>
                  </Link>
               </Col>

               {/* BẢNG DỮ LIỆU */}
               <Col lg='12'>
                  <div className="table__container shadow-sm p-3 bg-white rounded">
                     <Table striped bordered hover responsive className="text-center align-middle">
                        <thead className="table-dark">
                           <tr>
                              <th>Ảnh</th>
                              <th>Tên Tour</th>
                              <th>Thành phố</th>
                              <th>Ngày khởi hành</th>
                              <th>Giá</th>
                              <th>Nổi bật</th>
                              <th>Thao tác</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading && <tr><td colSpan='7' className="py-5">Đang tải dữ liệu...</td></tr>}
                           {error && <tr><td colSpan='7' className="text-danger py-5">{error}</td></tr>}
                           
                           {!loading && !error && tours?.map(tour => {
                              const tourDates = tour.tourDates || [];
                              const firstDate = tourDates.length > 0 ? new Date(tourDates[0].date).toLocaleDateString('vi-VN') : 'Chưa có';
                              const dateSummary = tourDates.length > 1 ? `${firstDate} (+${tourDates.length - 1} đợt)` : firstDate;
                              return (
                                 <tr key={tour._id}>
                                    <td>
                                       <img 
                                          src={`http://localhost:4000/static-number-one/${tour.photo}`} 
                                          alt="" 
                                          style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '5px' }}
                                       />
                                    </td>
                                    <td className="text-start fw-medium">{tour.title}</td>
                                    <td><i className="ri-map-pin-2-line text-secondary"></i> {tour.city}</td>
                                    <td>{dateSummary}</td>
                                    <td className="fw-bold text-danger">
                                       {Number(tour.price || 0).toLocaleString('vi-VN')} đ
                                    </td>
                                    <td>
                                       {tour.featured ? 
                                          <span className="badge bg-success">Yes</span> : 
                                          <span className="badge bg-secondary">No</span>
                                       }
                                    </td>
                                    <td>
                                       <div className="d-flex justify-content-center gap-2">
                                          <Link to={`/admin/update-tour/${tour._id}`}>
                                             <Button color="warning" size="sm" className="text-white">Sửa</Button>
                                          </Link>
                                          <Button color="danger" size="sm" onClick={() => deleteHandler(tour._id)}>Xóa</Button>
                                       </div>
                                    </td>
                                 </tr>
                              )
                           })}
                        </tbody>
                     </Table>
                  </div>
               </Col>

               {/* THANH PHÂN TRANG (PAGINATION) */}
               <Col lg='12'>
                  <div className="pagination d-flex align-items-center justify-content-center mt-5 gap-2">
                     {[...Array(pageCount).keys()].map(number => (
                        <span 
                           key={number} 
                           onClick={() => {
                              setPage(number);
                              window.scrollTo(0, 0); // Cuộn lên đầu khi chuyển trang
                           }}
                           className={page === number ? "active__page" : ""}
                           style={{
                              cursor: 'pointer',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #ff7e01',
                              borderRadius: '5px',
                              fontWeight: 'bold',
                              backgroundColor: page === number ? '#ff7e01' : '#fff',
                              color: page === number ? '#fff' : '#ff7e01',
                              transition: '0.3s'
                           }}
                        >
                           {number + 1}
                        </span>
                     ))}
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default ManageTours;