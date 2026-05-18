import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, FormGroup, Button, Input, Label } from 'reactstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';

const CreateTour = () => {
   const { id } = useParams();
   const isUpdateMode = !!id;
   const navigate = useNavigate();

   const [formData, setFormData] = useState({
      title: '',
      city: '',
      address: '',
      distance: 0,
      price: 0,
      maxGroupSize: 0,
      desc: '',
      featured: false
   });
   const [itinerary, setItinerary] = useState([]);
   const [tourDates, setTourDates] = useState([]);
   const [mainPhoto, setMainPhoto] = useState(null);
   const [galleryPhotos, setGalleryPhotos] = useState([]);

   useEffect(() => {
      if (!isUpdateMode) return;

      const fetchTour = async () => {
         try {
            const res = await fetch(`${BASE_URL}/tours/${id}`);
            const result = await res.json();
            if (res.ok) {
               const data = result.data;
               setFormData({
                  title: data.title || '',
                  city: data.city || '',
                  address: data.address || '',
                  distance: data.distance || 0,
                  price: data.price || 0,
                  maxGroupSize: data.maxGroupSize || 0,
                  desc: data.desc || '',
                  featured: data.featured || false
               });
               setItinerary(data.itinerary || []);
               setTourDates((data.tourDates || []).map(item => ({
                  ...item,
                  date: item.date ? new Date(item.date).toISOString().slice(0, 10) : ''
               })));
            }
         } catch (err) {
            console.error('Lỗi tải dữ liệu tour:', err);
         }
      };

      fetchTour();
   }, [id, isUpdateMode]);

   const handleChange = e => {
      const { id, value, type, checked } = e.target;
      setFormData(prev => ({
         ...prev,
         [id]: type === 'checkbox' ? checked : value
      }));
   };

   const addTourDate = () => {
      setTourDates(prev => [
         ...prev,
         { date: '', seatsAvailable: formData.maxGroupSize || 0 }
      ]);
   };

   const removeTourDate = index => {
      setTourDates(prev => prev.filter((_, i) => i !== index));
   };

   const updateTourDate = (index, field, value) => {
      setTourDates(prev => prev.map((item, i) => i === index ? {
         ...item,
         [field]: field === 'seatsAvailable' ? Number(value) : value
      } : item));
   };

   const addDay = () => {
      setItinerary(prev => [
         ...prev,
         {
            day: prev.length + 1,
            location: '',
            description: '',
            meals: ''
         }
      ]);
   };

   const removeDay = index => {
      setItinerary(prev => prev.filter((_, i) => i !== index));
   };

   const updateDay = (index, field, value) => {
      setItinerary(prev => prev.map((day, i) => i === index ? { ...day, [field]: value } : day));
   };

   const handleSubmit = async e => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const data = new FormData();

      const keysToAppend = ['title', 'city', 'address', 'distance', 'price', 'maxGroupSize', 'desc', 'featured'];
      keysToAppend.forEach(key => {
         data.append(key, formData[key]);
      });

      if (itinerary.length > 0) {
         data.append('itinerary', JSON.stringify(itinerary));
      }

      if (tourDates.length > 0) {
         data.append('tourDates', JSON.stringify(tourDates));
      }

      if (mainPhoto) {
         data.append('photo', mainPhoto);
      }

      if (galleryPhotos.length > 0) {
         galleryPhotos.forEach(file => data.append('images', file));
      }

      try {
         const url = isUpdateMode ? `${BASE_URL}/tours/${id}` : `${BASE_URL}/tours`;
         const method = isUpdateMode ? 'PUT' : 'POST';

         const res = await fetch(url, {
            method,
            headers: {
               Authorization: `Bearer ${token}`
            },
            body: data
         });

         const result = await res.json();
         if (res.ok) {
            alert(isUpdateMode ? 'Cập nhật thành công!' : 'Thêm tour mới thành công!');
            navigate('/admin/tours');
         } else {
            alert(result.message || 'Có lỗi xảy ra');
         }
      } catch (err) {
         alert('Lỗi server: Không thể gửi dữ liệu!');
      }
   };

   return (
      <section className="mt-5 mb-5">
         <Container>
            <Row>
               <Col lg='10' className='m-auto'>
                  <div className='create__tour-content shadow-lg p-5 rounded-4 bg-white border'>
                     <h2 className='mb-5 text-center fw-bold text-primary'>
                        {isUpdateMode ? 'CHỈNH SỬA THÔNG TIN TOUR' : 'THÊM TOUR DU LỊCH MỚI'}
                     </h2>
                     <Form onSubmit={handleSubmit}>
                        <Row>
                           <Col md='8'>
                              <FormGroup>
                                 <Label className='fw-bold'>Tên Tour</Label>
                                 <Input type='text' id='title' value={formData.title} onChange={handleChange} placeholder='Ví dụ: Tour Sapa 3 ngày 2 đêm' required />
                              </FormGroup>
                           </Col>
                           <Col md='4'>
                              <FormGroup>
                                 <Label className='fw-bold'>Thành phố</Label>
                                 <Input type='text' id='city' value={formData.city} onChange={handleChange} placeholder='Lào Cai' required />
                              </FormGroup>
                           </Col>
                        </Row>

                        <FormGroup>
                           <Label className='fw-bold'>Địa chỉ chi tiết</Label>
                           <Input type='text' id='address' value={formData.address} onChange={handleChange} placeholder='Bản Cát Cát, Sapa...' required />
                        </FormGroup>

                        <Row>
                           <Col md='4'>
                              <FormGroup>
                                 <Label className='fw-bold'>Giá tour (vnđ)</Label>
                                 <Input type='number' id='price' value={formData.price} onChange={handleChange} required />
                              </FormGroup>
                           </Col>
                           <Col md='4'>
                              <FormGroup>
                                 <Label className='fw-bold'>Khoảng cách (km)</Label>
                                 <Input type='number' id='distance' value={formData.distance} onChange={handleChange} required />
                              </FormGroup>
                           </Col>
                           <Col md='4'>
                              <FormGroup>
                                 <Label className='fw-bold'>Số khách tối đa</Label>
                                 <Input type='number' id='maxGroupSize' value={formData.maxGroupSize} onChange={handleChange} required />
                              </FormGroup>
                           </Col>
                        </Row>

                        <FormGroup>
                           <Label className='fw-bold'>Mô tả Tour</Label>
                           <Input type='textarea' id='desc' value={formData.desc} onChange={handleChange} rows='5' placeholder='Mô tả chi tiết lịch trình...' required />
                        </FormGroup>

                        <div className='itinerary_section mb-4'>
                           <div className='d-flex justify-content-between align-items-center mb-3'>
                              <Label className='fw-bold mb-0'>Lịch trình chi tiết</Label>
                              <Button type='button' color='success' size='sm' onClick={addDay}>
                                 <i className='ri-add-line'></i> Thêm ngày
                              </Button>
                           </div>

                           {itinerary.length === 0 ? (
                              <div className='text-center py-4 text-muted border rounded bg-light'>
                                 <i className='ri-calendar-line' style={{ fontSize: '2rem' }}></i>
                                 <p className='mb-0 mt-2'>Chưa có lịch trình nào. Nhấn "Thêm ngày" để bắt đầu.</p>
                              </div>
                           ) : (
                              itinerary.map((day, index) => (
                                 <div key={index} className='itinerary_day border rounded p-3 mb-3 bg-light'>
                                    <div className='d-flex justify-content-between align-items-center mb-3'>
                                       <h6 className='mb-0 fw-bold text-primary'>Ngày {day.day}</h6>
                                       <Button type='button' color='danger' size='sm' onClick={() => removeDay(index)}>
                                          <i className='ri-delete-bin-line'></i> Xóa
                                       </Button>
                                    </div>
                                    <Row>
                                       <Col md='6'>
                                          <FormGroup>
                                             <Label className='small fw-bold'>Địa điểm</Label>
                                             <Input type='text' value={day.location} onChange={e => updateDay(index, 'location', e.target.value)} placeholder='Ví dụ: Hà Nội → Sapa' required />
                                          </FormGroup>
                                       </Col>
                                       <Col md='6'>
                                          <FormGroup>
                                             <Label className='small fw-bold'>Bữa ăn</Label>
                                             <Input type='text' value={day.meals} onChange={e => updateDay(index, 'meals', e.target.value)} placeholder='Ví dụ: Sáng, Trưa, Tối' />
                                          </FormGroup>
                                       </Col>
                                    </Row>
                                    <FormGroup>
                                       <Label className='small fw-bold'>Mô tả chi tiết</Label>
                                       <Input type='textarea' value={day.description} onChange={e => updateDay(index, 'description', e.target.value)} rows='3' placeholder='Mô tả hoạt động trong ngày...' required />
                                    </FormGroup>
                                 </div>
                              ))
                           )}
                        </div>

                        <div className='tour_dates_section mb-4'>
                           <div className='d-flex justify-content-between align-items-center mb-3'>
                              <Label className='fw-bold mb-0'>Ngày khởi hành</Label>
                              <Button type='button' color='success' size='sm' onClick={addTourDate}>
                                 <i className='ri-add-line'></i> Thêm ngày
                              </Button>
                           </div>

                           {tourDates.length === 0 ? (
                              <div className='text-center py-4 text-muted border rounded bg-light'>
                                 <i className='ri-calendar-line' style={{ fontSize: '2rem' }}></i>
                                 <p className='mb-0 mt-2'>Chưa có ngày khởi hành. Nhấn "Thêm ngày" để tạo ngày tour.</p>
                              </div>
                           ) : (
                              tourDates.map((item, index) => (
                                 <div key={index} className='tour_date_item border rounded p-3 mb-3 bg-light'>
                                    <div className='d-flex justify-content-between align-items-center mb-3'>
                                       <h6 className='mb-0 fw-bold text-primary'>Ngày {index + 1}</h6>
                                       <Button type='button' color='danger' size='sm' onClick={() => removeTourDate(index)}>
                                          <i className='ri-delete-bin-line'></i> Xóa
                                       </Button>
                                    </div>
                                    <Row>
                                       <Col md='6'>
                                          <FormGroup>
                                             <Label className='small fw-bold'>Ngày khởi hành</Label>
                                             <Input type='date' value={item.date} onChange={e => updateTourDate(index, 'date', e.target.value)} required />
                                          </FormGroup>
                                       </Col>
                                       <Col md='6'>
                                          <FormGroup>
                                             <Label className='small fw-bold'>Số ghế trống ban đầu</Label>
                                             <Input type='number' min='1' value={item.seatsAvailable} onChange={e => updateTourDate(index, 'seatsAvailable', e.target.value)} placeholder='Mặc định tối đa nhóm' />
                                          </FormGroup>
                                       </Col>
                                    </Row>
                                 </div>
                              ))
                           )}
                        </div>

                        <Row className='mb-4'>
                           <Col md='6'>
                              <FormGroup className='p-3 border rounded bg-light'>
                                 <Label className='fw-bold text-success text-uppercase' style={{ fontSize: '.8rem' }}>Ảnh đại diện (Thumbnail)</Label>
                                 <Input type='file' accept='image/*' onChange={e => setMainPhoto(e.target.files[0])} />
                              </FormGroup>
                           </Col>
                           <Col md='6'>
                              <FormGroup className='p-3 border rounded bg-light'>
                                 <Label className='fw-bold text-info text-uppercase' style={{ fontSize: '.8rem' }}>Thư viện ảnh (Gallery)</Label>
                                 <Input type='file' accept='image/*' multiple onChange={e => setGalleryPhotos(Array.from(e.target.files))} />
                              </FormGroup>
                           </Col>
                        </Row>

                        <FormGroup check className='mb-5'>
                           <Label check className='fw-bold'>
                              <Input type='checkbox' id='featured' checked={formData.featured} onChange={handleChange} /> Đánh dấu là Tour nổi bật
                           </Label>
                        </FormGroup>

                        <div className='d-flex justify-content-center gap-3'>
                           <Button type='button' color='secondary' outline onClick={() => navigate('/admin/tours')}>Hủy bỏ</Button>
                           <Button type='submit' color='primary' className='px-5 shadow'>
                              {isUpdateMode ? 'Lưu thay đổi' : 'Tạo tour ngay'}
                           </Button>
                        </div>
                     </Form>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default CreateTour;
