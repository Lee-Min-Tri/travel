import React, { useState, useContext, useEffect } from 'react'
import './booking.css'
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { BASE_URL } from '../../utils/config'

const Booking = ({ tour, avgRating }) => {

    const { price, reviews, title } = tour
    const navigate = useNavigate()

    const { user } = useContext(AuthContext)


    const [booking, setBooking] = useState({
        userId: user && user._id,
        userEmail: user && user.email,
        tourName: title,
        fullName: '',
        phone: '',
        guestSize: 1,
        bookingAt: ''
    })

    useEffect(() => {
        if (tour?.tourDates?.length > 0) {
            const firstAvailableDate = tour.tourDates.find(date => Number(date.seatsAvailable) > 0)?.date || tour.tourDates[0].date
            setBooking(prev => ({
                ...prev,
                bookingAt: prev.bookingAt || firstAvailableDate
            }))
        }
    }, [tour])

    const handleChange = e => {
        const id = e.target.id;
        const value = e.target.value;

        // Bước 1: Cập nhật State cho React
        setBooking(prev => {
            // Tạo object mới từ dữ liệu cũ + dữ liệu vừa nhập
            const updatedData = { ...prev, [id]: value };

            // Bước 2: In ra console để bạn kiểm tra (Lúc này nó sẽ KHÔNG bị undefined)
            console.log("Dữ liệu Object hiện tại:", updatedData);

            // Trả về object mới để React lưu vào state 'booking'
            return updatedData;
        });
    };

    const serviceFee = 450000
    const totalAmount = Number(price) * Number(booking.guestSize) + Number(serviceFee)
    const selectedTourDate = tour?.tourDates?.find(date => date.date === booking.bookingAt)

    const handleClick = async e => {
        e.preventDefault()

        try {
            if (!user || user === undefined || user === null) {
                return alert('Bạn chưa đăng nhập')
            }

            if (!tour?.tourDates?.length) {
                return alert('Tour chưa có ngày khởi hành. Vui lòng liên hệ quản trị.')
            }

            if (!booking.bookingAt) {
                return alert('Vui lòng chọn ngày khởi hành')
            }

            if (!selectedTourDate) {
                return alert('Ngày khởi hành bạn chọn không hợp lệ')
            }

            if (Number(booking.guestSize) > Number(selectedTourDate.seatsAvailable)) {
                return alert('Số lượng khách vượt quá số ghế trống cho ngày đã chọn')
            }

            const bookingData = {
                ...booking,
                tourId: tour?._id,
                itinerary: tour?.itinerary || [],
                totalPrice: totalAmount
            }

            const token = localStorage.getItem('token')
            const res = await fetch(`${BASE_URL}/booking`, {
                method: 'post',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            })
            const result = await res.json()
            if (!res.ok) {
                return alert(result.message)
            }
            navigate('/thank-you')
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <div className="booking">
            <div className="booking_top d-flex align-items-center justify-content-between">
                <h3>{Number(price).toLocaleString('vi-VN')}đ <span>/1 người</span></h3>
                <span className='tour_rating d-flex align-items-center'>
                    <i class="ri-star-line" ></i> {avgRating === 0 ? null : avgRating} ({reviews?.length})
                </span>
            </div>

            {/*booking form*/}
            <div className="booking_form">
                <h5>Thông tin</h5>
                <Form className="booking_info-form" onSubmit={handleClick}>
                    <FormGroup>
                        <input type="text" placeholder='Họ và tên' id='fullName'
                            required onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <input type="number" placeholder='Số điện thoại' id='phone'
                            required onChange={handleChange} />
                    </FormGroup>
                    <FormGroup className="d-flex align-items-center gap-3">
                        {tour?.tourDates?.length > 0 ? (
                            <select id='bookingAt' value={booking.bookingAt} required onChange={handleChange} className='form-select'>
                                <option value=''>Chọn ngày khởi hành</option>
                                {tour.tourDates.map((dateItem, idx) => (
                                    <option
                                        key={idx}
                                        value={dateItem.date}
                                        disabled={Number(dateItem.seatsAvailable) <= 0}
                                    >
                                        {new Date(dateItem.date).toLocaleDateString('vi-VN')} - {Number(dateItem.seatsAvailable) > 0 ? `còn ${dateItem.seatsAvailable} ghế` : 'Hết chỗ'}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className='text-danger'>Tour chưa có ngày khởi hành. Vui lòng liên hệ quản trị.</div>
                        )}
                        <input type="number" placeholder='Số lượng' id='guestSize'
                            required onChange={handleChange} />
                    </FormGroup>
                    {selectedTourDate && (
                        <div className='text-muted mb-3'>
                            Số ghế trống cho ngày {new Date(selectedTourDate.date).toLocaleDateString('vi-VN')}: {selectedTourDate.seatsAvailable}
                        </div>
                    )}
                    {selectedTourDate && Number(selectedTourDate.seatsAvailable) <= 0 && (
                        <div className='text-danger mb-3'>Ngày này đã hết chỗ. Vui lòng chọn ngày khác.</div>
                    )}
                </Form>
            </div>

            {/*booking bottom*/}
            <div className="booking_bottom">
                <ListGroup>
                    <ListGroupItem className="border-0 px-0">
                        <h5 className='d-flex align-items-center gap-1'>{Number(price).toLocaleString('vi-VN')}đ <i class="ri-close-line"></i> 1 người</h5>
                        <span>{Number(price).toLocaleString('vi-VN')}đ</span>
                    </ListGroupItem>
                    <ListGroupItem className="border-0 px-0">
                        <h5>Phí dịch vụ</h5>
                        <span>{Number(serviceFee).toLocaleString('vi-VN')}đ</span>
                    </ListGroupItem>
                    <ListGroupItem className="border-0 px-0 total">
                        <h5>Tổng cộng</h5>
                        <span>{Number(totalAmount).toLocaleString('vi-VN')}đ</span>
                    </ListGroupItem>
                </ListGroup>

                <Button className='btn primary_btn w-100 mt-4' onClick={handleClick}>Đặt ngay</Button>
            </div>
        </div>
    )
}

export default Booking
