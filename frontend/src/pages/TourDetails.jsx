import React, { useRef, useState, useEffect, useContext } from 'react'
import '../style/tour-detail.css'
import { Container, Row, Col, Form, ListGroup } from 'reactstrap'
import { useParams } from 'react-router-dom'
import caculateAvgRating from '../utils/avgRating'
import avatar from "../assets/images/avatar.jpg"
import Booking from '../components/Booking/Booking'
import Newsletter from '../share/Newsletter'
import useFetch from '../hooks/useFetch'
import { BASE_URL } from '../utils/config'
import { AuthContext} from '../context/AuthContext'

const TourDetails = () => {

  const { id } = useParams()
  const reviewMsgRef = useRef('')
  const [tourRating, setTourRating] = useState(null)
  const {user} = useContext(AuthContext)

  const { data: result, loading, error } = useFetch(`${BASE_URL}/tours/${id}`)
  const tour = result ? result : {};


  const { photo, title, desc, price, address, reviews, city, distance, maxGroupSize } = tour

  const { totalRating, avgRating } = caculateAvgRating(reviews || [])

  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  const submitHandler = async e => {
    e.preventDefault()
    const reviewText = reviewMsgRef.current.value
 
    try {
      if(!user || user === undefined || user === null)
      {
        alert ('Bạn chưa đăng nhập')
      }

      const reviewObj = {
        username: user?.username,
        reviewText,
        rating: tourRating
      }
      const res = await fetch(`${BASE_URL}/review/${id}`,{
        method:'post',
        headers:{
          'content-type': 'application/json'
        },
        credentials: 'include',
        body:JSON.stringify(reviewObj)
      })

      const result = await res.json()
      if(!res.ok) {
        return alert(result.message)
      }
      alert(result.message)
    } catch (err) {
      alert(err.message)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tour])

  return <>
    <section>
      <Container>
        {
          loading && <h4 className='text-center pt-5'>Loading.......</h4>
        }
        {
          error && <h4 className='text-center pt-5'>{error}</h4>
        }
        {
          !loading && !error && <Row>
            <Col lg='8'>
              <div className="tour_content">
                <img src={photo} alt="" />

                <div className="tour_info">
                  <h2>{title}</h2>

                  <div className='d-flex align-items-center gap-5'>
                    <span className='tour_rating d-flex align-items-center gap-1'>
                      <i class="ri-star-line" style={{ color: "var(--secondary-color)" }}></i> {avgRating === 0 ? null : avgRating}
                      {totalRating === 0 ? (
                        "Chưa có đánh giá"
                      ) : (
                        <span>({reviews.length})</span>
                      )}
                    </span>

                    <span>
                      <i class="ri-map-pin-line"></i>{address}
                    </span>
                  </div>

                  <div className="tour_extra-details">
                    <span><i class="ri-road-map-line"></i>{city}</span>
                    <span><i class="ri-money-dollar-circle-line"></i>{Number(price).toLocaleString('vi-VN')}đ/ 1 người</span>
                    <span><i class="ri-route-line"></i>{distance}km</span>
                    <span><i class="ri-group-fill"></i>{maxGroupSize} người</span>
                  </div>
                  <h5>Mô tả</h5>
                  <p>{desc}</p>
                </div>
                {/*tour reviews*/}
                <div className="tour_reviews mt-4">
                  <h4>Reviews ({reviews?.length} reviews)</h4>

                  <Form onSubmit={submitHandler}>
                    <div className='d-flex align-items-center gap-3 mt-4 rating_group'>
                      <span onClick={() => setTourRating(1)}>1<i class="ri-star-fill"></i></span>
                      <span onClick={() => setTourRating(2)}>2<i class="ri-star-fill"></i></span>
                      <span onClick={() => setTourRating(3)}>3<i class="ri-star-fill"></i></span>
                      <span onClick={() => setTourRating(4)}>4<i class="ri-star-fill"></i></span>
                      <span onClick={() => setTourRating(5)}>5<i class="ri-star-fill"></i></span>
                    </div>

                    <div className="review_input">
                      <input type="text" ref={reviewMsgRef} placeholder='Chia sẻ suy nghĩ của bạn' required />
                      <button className='btn primary_btn text-white' type='submit'>Đăng</button>
                    </div>
                  </Form>

                  <ListGroup className='user_reviews'>
                    {
                      reviews?.map(review => (
                        <div className="review_item">
                          <img src={avatar} alt="" />

                          <div className="w-100">
                            <div className='d-flex align-items-center justify-content-between'>
                              <div>
                                <h5>{review.username}</h5>
                                <p>{new Date(review.createdAt).toLocaleDateString('vi-VN', options)}</p>
                              </div>
                              <span className='d-flex align-item-center'>{review.rating}<i class="ri-star-fill"></i></span>
                            </div>

                            <h6>{review.reviewText}</h6>
                          </div>
                        </div>
                      ))
                    }
                  </ListGroup>
                </div>
              </div>
            </Col>

            <Col lg='4'>
              <Booking tour={tour} avgRating={avgRating} />
            </Col>
          </Row>
        }
      </Container>
    </section>
    <Newsletter />
  </>
}

export default TourDetails
