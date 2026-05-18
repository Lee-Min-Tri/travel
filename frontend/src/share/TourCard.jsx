import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody } from "reactstrap"
import caculateAvgRating from '../utils/avgRating'

import "./TourCard.css"
import { BASE_URL } from '../utils/config'

const TourCard = ({ tour }) => {
    const { _id, title, city, photo, price, featured, reviews } = tour

    const {totalRating, avgRating} = caculateAvgRating(reviews)

    return (
        <div className='tour_card'>
            <Card>
                <div className="tour_img">
                    <img src={`http://localhost:4000/static-number-one/${photo}`} alt="tour_img" />
                    {featured && <span>Tour nổi bật</span>}
                </div>

                <CardBody>
                    <div className="card_top d-flex align-items-center justify-content-between">
                        <span className='tour_location d-flex align-items-center gap-1'>
                            <i class="ri-map-pin-line"></i> {city}
                        </span>
                        <span className='tour_rating d-flex align-items-center gap-1'>
                            <i class="ri-star-line"></i> {avgRating === 0 ? null : avgRating}
                            {totalRating === 0 ? (
                                "Chưa có đánh giá"
                            ) : (
                                <span>({reviews.length})</span>
                            )}
                        </span>
                    </div>

                    <h5 className="tour_title">
                        <Link to={`/tour/${_id}`}>{title}</Link>
                    </h5>

                    <div className="card_bottom d-flex align-items-center justify-content-between mt-3">
                        <h5>{Number(price).toLocaleString('vi-VN')}đ <span>/1 người/</span></h5>

                        <button className="btn booking_btn">
                            <Link to={`/tour/${_id}`}>Đặt ngay</Link>
                        </button>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export default TourCard
