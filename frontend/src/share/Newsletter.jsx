import React from 'react'
import './newsletter.css'

import { Container, Row, Col } from 'reactstrap'
import maleTourist from '../assets/images/male-tourist.png'

const Newsletter = () => {
    return (
        <section className='newsletter'>
            <Container>
                <Row>
                    <Col lg='6'>
                        <div className="newsletter_content">
                            <h2>Tự thưởng cho bản thân 1 chuyến đi chơi nào</h2>

                            <div className="newsletter_input">
                                <input type="email" placeholder='Email của bạn' />
                                <button className="btn newsletter_btn">Đăng ký</button>
                            </div>

                            <p>Sau những ngày dài quay cuồng với công việc và deadline, đã bao lâu rồi bạn chưa lắng nghe nhịp thở của chính mình? Đừng đợi đến khi kiệt sức mới tìm nơi nghỉ ngơi. Hãy tạm gác lại âu lo, tự thưởng cho bản thân một chuyến đi để tâm hồn được vỗ về bởi tiếng sóng biển hay cái se lạnh của đại ngàn. Bạn xứng đáng với những phút giây tuyệt vời nhất!</p>
                        </div>
                    </Col>
                    <Col lg="6">
                        <div className="newsletter_img">
                            <img src={maleTourist} alt="" />
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>)
}

export default Newsletter
