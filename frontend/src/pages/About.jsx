import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import '../style/about.css'
import aboutImg from '../assets/images/ava-1.jpg' 

const About = () => {
  return (
    <>
      {/* SECTION 1: HERO - Giới thiệu hoành tráng */}
      <section className="about_hero">
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h1 className="hero_title">Kết nối mọi hành trình</h1>
              <p className="hero_subtitle">Khám phá thế giới cùng đội ngũ chuyên gia tận tâm</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECTION 2: CHI TIẾT - Ảnh và nội dung */}
      <section className="about_detail mt-5">
        <Container>
          <Row className="align-items-center">
            <Col lg="6">
              <div className="about_img-wrapper">
                <img src={aboutImg} alt="Travel" className="img-fluid rounded-5 shadow-lg" />
                <div className="experience_badge">
                  <span>15+</span>
                  <p>Năm kinh nghiệm</p>
                </div>
              </div>
            </Col>
            <Col lg="6" className="ps-lg-5">
              <h3 className="section_label">VÌ SAO CHỌN CHÚNG TÔI?</h3>
              <h2 className="section_title">Chúng tôi mang lại giá trị <br /><span>thực trên từng dặm bay</span></h2>
              <p className="section_desc">
                Không chỉ là đặt tour, chúng tôi thiết kế những trải nghiệm cá nhân hóa. 
                Từ những ngọn núi hùng vĩ tại Hà Giang đến những bãi cát trắng tại Phú Quốc, 
                đội ngũ của chúng tôi luôn đồng hành cùng bạn 24/7.
              </p>
              
              <div className="features_grid">
                <div className="feature_item">
                  <i className="ri-shield-check-line"></i>
                  <div>
                    <h6>Bảo hiểm trọn gói</h6>
                    <p>An toàn của bạn là ưu tiên số 1.</p>
                  </div>
                </div>
                <div className="feature_item">
                  <i className="ri-customer-service-2-line"></i>
                  <div>
                    <h6>Hỗ trợ 24/7</h6>
                    <p>Luôn có mặt khi bạn cần.</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECTION 3: GIÁ TRỊ CỐT LÕI */}
      <section className="values_section bg-light py-5 mt-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Giá trị cốt lõi</h2>
          </div>
          <Row>
            {[
              { icon: 'ri-earth-line', title: 'Du lịch bền vững', desc: 'Bảo vệ môi trường và văn hóa địa phương.' },
              { icon: 'ri-heart-line', title: 'Tận tâm phục vụ', desc: 'Lắng nghe và thấu hiểu mọi nhu cầu.' },
              { icon: 'ri-flashlight-line', title: 'Sáng tạo đổi mới', desc: 'Luôn tìm kiếm những điểm đến mới lạ.' }
            ].map((val, i) => (
              <Col lg="4" key={i} className="mb-4">
                <div className="value_card text-center p-4">
                  <div className="icon_box"><i className={val.icon}></i></div>
                  <h4>{val.title}</h4>
                  <p>{val.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  )
}

export default About