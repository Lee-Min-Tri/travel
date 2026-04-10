import React from 'react'
import ServiceCard from './ServiceCard'
import {Col} from "reactstrap"

import weatherImg from '../assets/images/weather.png'
import guideImg from '../assets/images/guide.png'
import customizationImg from '../assets/images/customization.png'

const serviceData = [
    {
        imgUrl: weatherImg,
        title: 'dự báo thời tiết',
        desc: "điền vào đây"
    },
     {
        imgUrl: guideImg,
        title: 'Tour tốt nhất',
        desc: "điền vào đây"
    },
     {
        imgUrl: customizationImg,
        title: 'tùy chỉnh',
        desc: "điền vào đây"
    },
]

const ServiceList = () => {
  return <>
  {
    serviceData.map((item, index) =>
    <Col lg='3' md='6' sm='12' className='mb-4' key={index}>
        <ServiceCard item={item}/>
    </Col>)
  }
  </>
}

export default ServiceList
