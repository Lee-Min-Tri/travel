import React, { useState } from 'react'
import CommonSection from '../share/CommonSection'
import { Container, Row, Col } from 'reactstrap'

import { useLocation } from 'react-router-dom'
import TourCard from '../share/TourCard'
import Newsletter from '../share/Newsletter'

const SearchListTour = () => {
const location = useLocation()

const [data] = useState(location.state)
console.log(data)

  return <>
    <CommonSection title={"Tour phù hợp"}/>
    <section>
      <Container>
        <Row>
          {
            data.length === 0 ? (<h4 className='text-center'>Không tìm thấy tour</h4>) : (data ?.map(tour =>
              <Col lg='3' className="mb-4" key={tour._id}><TourCard tour = {tour}/></Col>)
            )
          }
        </Row>
      </Container>
    </section>
    <Newsletter/>
  </>
}

export default SearchListTour
