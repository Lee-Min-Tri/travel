import React, { useRef } from 'react'
import './search-bar.css'
import { Col, Form, FormGroup } from "reactstrap"

import { BASE_URL } from '../utils/config'
import { useNavigate } from 'react-router-dom'

const SearchBar = () => {

    const locationRef = useRef('')
    const distanceRef = useRef(0)
    const maxGroupSizeRef = useRef(0)
    const navigate = useNavigate()

    const searchHandler = async () => {
        const location = locationRef.current.value
        const distance = distanceRef.current.value
        const maxGroupSize = maxGroupSizeRef.current.value

        if(location ==='' || distance ==='' || maxGroupSize ===''){
            return alert("chưa điền thông tin kìa bạn yêu ơi!!!")
        }

        const res = await fetch(`${BASE_URL}/tours/search/getTourBySearch?city=${location}&distance=${distance}&maxGroupSize=${maxGroupSize}`)

        if(!res.ok) alert('sai')
        const result = await res.json()
        navigate(`/tours/search?city=${location}&distance=${distance}&maxGroupSize=${maxGroupSize}`,{state: result.data})
    }

    return <Col>
        <div className="search_bar">
            <Form className="d-flex align-items-center gap-4">
                <FormGroup className="d-flex gap-3 form_group form_group_fast">
                    <span><i class="ri-map-pin-line"></i></span>
                    <div>
                        <h6>Địa điểm</h6>
                        <input type="text" placeholder='Địa điểm mà bạn thích' ref={locationRef}/>
                    </div>
                </FormGroup>
                <FormGroup className="d-flex gap-3 form_group form_group_fast">
                    <span><i class="ri-pin-distance-line"></i></span>
                    <div>
                        <h6>Khoảng cách</h6>
                        <input type="number" placeholder='km' ref={distanceRef}/>
                    </div>
                </FormGroup>
                <FormGroup className="d-flex gap-3 form_group form_group_last">
                    <span><i class="ri-group-line"></i></span>
                    <div>
                        <h6>Số lượng</h6>
                        <input type="number" placeholder='0' ref={maxGroupSizeRef}/>
                    </div>
                </FormGroup>

                <span className='search_icon' type='submit' onClick={searchHandler}><i class="ri-search-line"></i></span>
            </Form>
        </div>
    </Col>
}

export default SearchBar
