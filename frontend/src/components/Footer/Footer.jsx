import React from 'react'
import './Footer.css'

import { Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap"
import { Link } from 'react-router-dom'
import logo from "../../assets/images/logo.png"
  const quick_links = [
    {
      path: '/home',
      display: 'Home'
    },
    {
      path: '/about',
      display: 'Về chúng tôi'
    },
    {
      path: '/policy',
      display: 'FAQ'
    },
    {
      path: '/tour',
      display: 'Tour'
    },
  ]
  const quick_links2 = [
    {
      path: '/gallery',
      display: 'Bộ sưu tập'
    },
    {
      path: '/login',
      display: 'Đăng nhập'
    },
    {
      path: '/register',
      display: 'Đăng ký'
    },
  ]

const Footer = () => {

  return (
    <footer className='footer'>
      <Container>
        <Row>
          <Col lg="3">
            <div className="logo">
              <img src={logo} alt="" />
              <p>Chúng tôi tự hào là đơn vị tiên phong trong việc cung cấp các giải pháp công nghệ toàn diện, giúp doanh nghiệp tối ưu hóa quy trình và nâng tầm giá trị cốt lõi. Sự tin tưởng của khách hàng là kim chỉ nam cho mọi hoạt động của chúng tôi.</p>
              <div className="social_links d-flex align-items-center gap-4">
                <span>
                  <Link to='#'><i class="ri-youtube-fill"></i></Link>
                </span>
                <span>
                  <Link to='#'><i class="ri-facebook-circle-fill"></i></Link>
                </span>
                <span>
                  <Link to='#'><i class="ri-instagram-fill"></i></Link>
                </span>
                <span>
                  <Link to='#'><i class="ri-twitter-fill"></i></Link>
                </span>
              </div>
            </div>
          </Col>

          <Col lg='3'>
            <h5 className="footer_link-title">Khám phá</h5>
            <ListGroup className='footer_quick-links'>
              {
                quick_links.map((item, index) => (
                  <ListGroupItem key={index} className='ps-0 border-0'>
                    <Link to={item.path}>{item.display}</Link>
                  </ListGroupItem>
                ))
              }
            </ListGroup>
          </Col>
          <Col lg='3'>
            <h5 className="footer_link-title">Đường dẫn nhanh</h5>
            <ListGroup className='footer_quick-links'>
              {
                quick_links2.map((item, index) => (
                  <ListGroupItem key={index} className='ps-0 border-0'>
                    <Link to={item.path}>{item.display}</Link>
                  </ListGroupItem>
                ))
              }
            </ListGroup>
          </Col>
          <Col lg='3'>
            <h5 className="footer_link-title">Liên hệ</h5>
            <ListGroup className='footer_quick-links'>


              <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                <h6 className='mb-0 d-flex align-items-center gap-2'>
                  <span><i class="ri-map-pin-line"></i></span>
                  Address:
                </h6>

                <p className='mb-0'>C24-NV9 ô số 16, Khu đô thị mới hai bên đường Lê Trọng Tấn, Phường Dương Nội, Hà Nội.</p>
              </ListGroupItem>

              <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                <h6 className='mb-0 d-flex align-items-center gap-2'>
                  <span><i class="ri-mail-fill"></i></span>
                  Email:
                </h6>

                <p className='mb-0'>info@travelworld.vn</p>
              </ListGroupItem>

              <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                <h6 className='mb-0 d-flex align-items-center gap-2'>
                  <span><i class="ri-phone-fill"></i></span>
                  Điện thoại:
                </h6>

                <p className='mb-0'>1800 8368</p>
              </ListGroupItem>


            </ListGroup>
          </Col>

          <Col lg='12' className='text-center pt-5'>
              <p className='copyright'>Giấy phép kinh doanh dịch vụ lữ hành quốc tế INTERNATIONAL TOUR OPERATOR LICENCE số Số GP/No.: 01-3035/2025/CDLQGVN-GPLHQT</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
