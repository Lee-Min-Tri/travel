import React from 'react'
import Slider from 'react-slick'
import ava01 from '../../assets/images/ava-1.jpg'
import ava02 from '../../assets/images/ava-2.jpg'
import ava03 from '../../assets/images/ava-3.jpg'
import ava04 from '../../assets/images/ava-4.jpg'

const Testimonial = () => {

    const settings = {
        dots: true,
        infinite: true,
        autoplay: true,
        speed: 1000,
        swipeToSlide: true,
        autoplaySpeed: 2000,
        slidesToShow: 3,
        responsive:[
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    slideToScroll: 1,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slideToScroll: 1,
                },
            },
        ]
    }

  return <Slider {... settings}>
    <div className="testimonial py-4 px-3">
        <p>
            Đi chơi với cậu đúng là 'tour ẩm thực' chất lượng cao! Mấy quán cậu chọn món nào cũng lạ và ngon tuyệt, đúng là chỉ có người sành ăn mới biết được.
        </p>
        <div className='d-flex align-items-center gap-4 mt-3'>
            <img src={ava01} className='w-25 h-25 rounded-2' alt="" />
            <div>
                <h6 className='mb-0 mt-3'>Sơn Tùng MTP</h6>
                <p>Khách hàng</p>
            </div>
        </div>
    </div>
    <div className="testimonial py-4 px-3">
        <p>
            Có cậu đi cùng đúng là may mắn của cả nhóm. Lúc nào cậu cũng tràn đầy năng lượng và biết cách khuấy động không khí, làm chuyến đi vui hơn gấp bội.
        </p>
        <div className='d-flex align-items-center gap-4 mt-3'>
            <img src={ava02} className='w-25 h-25 rounded-2' alt="" />
            <div>
                <h6 className='mb-0 mt-3'>Trần Hà Linh</h6>
                <p>Khách hàng</p>
            </div>
        </div>
    </div>
    <div className="testimonial py-4 px-3">
        <p>
            Tớ thực sự bái phục cách cậu sắp xếp lịch trình đấy! Mọi điểm đến đều rất kết nối, vừa đủ thời gian để tận hưởng mà không cảm thấy bị vội vàng chút nào
        </p>
        <div className='d-flex align-items-center gap-4 mt-3'>
            <img src={ava03} className='w-25 h-25 rounded-2' alt="" />
            <div>
                <h6 className='mb-0 mt-3'>Bún bò Huế</h6>
                <p>Khách hàng</p>
            </div>
        </div>
    </div>
    <div className="testimonial py-4 px-3">
        <p>
            Cậu có 'mắt nhìn' địa điểm đỉnh thật sự. Những chỗ mình ghé qua không chỉ đẹp để chụp ảnh mà còn có không khí rất đặc biệt, đúng chất khám phá luôn.
        </p>
        <div className='d-flex align-items-center gap-4 mt-3'>
            <img src={ava04} className='w-25 h-25 rounded-2' alt="" />
            <div>
                <h6 className='mb-0 mt-3'>Phương Hữu Dưỡng</h6>
                <p>Khách hàng</p>
            </div>
        </div>
    </div>
  </Slider>
}

export default Testimonial
