import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from './../pages/Home'
import Tour from './../pages/Tour'
import TourDetail from './../pages/TourDetails'
import Register from './../pages/Register'
import Login from './../pages/Login'
import SearchListTour from './../pages/SearchListTour'
import ThankYou from '../pages/ThankYou'

const Router = () => {
    return (
        <Routes>
            <Route path='/' element={<Navigate to='/home' />} />
            <Route path='/home' element={<Home />} />
            <Route path='/tour' element={<Tour />} />
            <Route path='/tour/:id' element={<TourDetail />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/thank-you' element={<ThankYou />} />
            <Route path='/tours/search' element={<SearchListTour />} />
        </Routes>
    )
}

export default Router
