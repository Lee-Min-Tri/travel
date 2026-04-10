import React from 'react'
import {Container, Row, Col, Button} from 'reactstrap'
import { Link } from 'react-router-dom'
import '../style/thank-you.css'

const ThankYou = () => {
  return <section>
    <Container>
        <Row>
            <Col lg = '12' className='pt-5 text-center'>
                <div className="thank_you">
                    <span><i class="ri-checkbox-circle-line"></i></span>
                    <h1 className="mb-3 fw-semibold">Cảm ơn bạn</h1>
                    <h3 className="mb-4">Tour của bạn đã được chuẩn bị</h3>

                    <Button className='btn primary_btn w-25'><Link to='/home'>
                        Quay về trang chủ
                    </Link></Button>
                </div>
            </Col>
        </Row>
    </Container>
  </section>
}

export default ThankYou
