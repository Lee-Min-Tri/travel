import React from 'react'
import '../style/home.css'

import { Container, Row, Col } from 'reactstrap'
import heroImg from '../assets/images/hero-img01.jpg'
import heroImg2 from '../assets/images/hero-img02.jpg'
import heroVideo from '../assets/images/hero-video.mp4'
import experienceImg from '../assets/images/experience.png'
import Subtitle from '../share/Subtitle'
import worldImg from '../assets/images/world.png'

import SearchBar from "./../share/SearchBar"
import ServiceList from '../services/ServiceList'
import FeaturedTourList from '../components/Featured-tours/FeaturedTourList'
import ImageGalerry from '../components/Image-gallery/ImageGalerry'
import Testimonial from '../components/Testimonial/Testimonial'
import Newsletter from '../share/Newsletter'
const Home = () => {
  return <>
    <section>
      <Container>
        <Row>
          <Col lg='6'>
            <div className="hero_subtitle d-flex align-items-center">
              <Subtitle Subtitle={'ĐI NGAY NGẠI CHI'} />
              <img src={worldImg} alt="" />
            </div>
            <h1>Kỳ nghỉ <span className="hightlight">đáng nhớ</span></h1>
            <p>Thế giới rộng lớn hơn những gì chúng ta thấy qua màn hình. Tại Travel World, chúng tôi không chỉ bán những chuyến đi, chúng tôi mở ra những cánh cửa dẫn lối đến những vùng đất chưa tên, những trải nghiệm chưa từng có và những câu chuyện chưa kể. Hãy để mỗi bước chân của bạn trở thành một chương mới đầy rực rỡ trong cuốn nhật ký cuộc đời.</p>
          </Col>

          <Col lg='2'>
            <div className="hero_img-box">
              <img src={heroImg} alt="" />
            </div>
          </Col>
          <Col lg='2'>
            <div className="hero_img-box hero_video-box mt-4">
              <video src={heroVideo} alt="" controls />
            </div>
          </Col>
          <Col lg='2'>
            <div className="hero_img-box mt-5">
              <img src={heroImg2} alt="" />
            </div>
          </Col>

          <SearchBar />
        </Row>
      </Container>
    </section>
    {/*hero section start*/}
    <section>
      <Container>
        <Row>
          <Col lg='3'>
            <h5 className="services_subtitle">Dịch vụ của chúng tôi</h5>
            <h2 className="services_title">Chúng tôi có những dịch vụ tốt nhất</h2>
          </Col>
          <ServiceList />
        </Row>
      </Container>
    </section>

    {/*featured tour section start*/}
    <section>
      <Container>
        <Row>
          <Col lg='12' className='mb-5'>
            <Subtitle Subtitle={'Khám phá'} />
            <h2 className="featured_tour-title">Các tour du lịch</h2>
          </Col>
          <FeaturedTourList />
        </Row>
      </Container>
    </section>
    {/*featured tour section end*/}

    {/*trải nghiệm start*/}
    <section>
      <Container>
        <Row>
          <Col lg = '6'>
            <div className="experience_content">
              <Subtitle Subtitle={'Trải nghiệm'}/>
              <h2>Trải nghiệm mà bạn sẽ không quên</h2>
              <p>Có những hành trình không đo bằng số km, mà đo bằng những khoảnh khắc khiến tim ta lỗi nhịp. Tại Travel World, chúng tôi tin rằng mỗi chuyến đi là một chương rực rỡ trong cuốn nhật ký cuộc đời, nơi bạn tìm thấy chính mình giữa những kỳ quan và những nụ cười xa lạ.</p>
            </div>

            <div className="counter_wrapper d-flex align-items-center gap-5">
              <div className="counter_box">
                <span>12k+</span>
                <h6>Chuyến đi</h6>
              </div>
              <div className="counter_box">
                <span>2k+</span>
                <h6>Cảm xúc khác nhau</h6>
              </div>
              <div className="counter_box">
                <span>15k+</span>
                <h6>Khoảnh khắc đáng nhớ</h6>
              </div>
            </div>
          </Col>
          <Col lg="6">
            <div className="experience_img">
              <img src={experienceImg} alt="" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
    {/*trải nghiệm end*/}

    {/*bộ sưu tập start*/}
    <section>
      <Container>
        <Row>
          <Col lg = '12'>
            <Subtitle Subtitle={'Bộ sưu tập'}/>
            <h2 className="gallery_title">
              Bộ sưu tập của chúng tôi
            </h2>
          </Col>
          <Col lg='12'>
            <ImageGalerry/>
          </Col>
        </Row>
      </Container>
    </section>
    {/*bộ sưu tập end*/}

    {/*lời chứng thực start*/}
    <section>
      <Container>
        <Row>
          <Col lg = '12'>
            <Subtitle Subtitle={'Fans Love'}/>
            <h2 className="testimonial_title">Lời góp ý</h2>
          </Col>
          <Col lg='12'>
            <Testimonial/>
          </Col>
        </Row>
      </Container>
    </section>
    {/*lời chứng thực end*/}
    <Newsletter/>
  </>
}

export default Home
