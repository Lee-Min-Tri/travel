import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import Home from './../pages/Home'
import Tour from './../pages/Tour'
import TourDetail from './../pages/TourDetails'
import Register from './../pages/Register'
import Login from './../pages/Login'
import SearchListTour from './../pages/SearchListTour'
import ThankYou from '../pages/ThankYou'
import BookingDetail from '../pages/BookingDetail'
import PolicyFAQ from '../pages/PolicyFAQ'

import AdminLayout from '../components/Admin/AdminLayout'
import Dashboard from '../pages/Admin/Dashboard'
import ManageTours from '../pages/Admin/ManageTours'
import CreateTour from '../pages/Admin/CreateTour'
import ManageUsers from '../pages/Admin/ManageUsers'
import ManageBookings from '../pages/Admin/ManageBookings'
import ManageBookingDetail from '../pages/Admin/ManageBookingDetail'
import ManageFAQ from '../pages/Admin/ManageFAQ'
import ManageReviews from '../pages/Admin/ManageReviews'
import About from '../pages/About'
import Booking from '../pages/Mybooking'
import Profile from '../pages/MyProfile'

const AdminOnlyRoute = ({ children }) => {
    const { user } = useContext(AuthContext)
    const currentUser = user?.data ? user.data : user
    const role = currentUser?.role

    if (!currentUser || role !== 'admin') {
        return <Navigate to='/home' replace />
    }

    return children
}

const AdminOrStaffRoute = ({ children }) => {
    const { user } = useContext(AuthContext)
    const currentUser = user?.data ? user.data : user
    const role = currentUser?.role

    if (!currentUser || (role !== 'admin' && role !== 'nhân viên')) {
        return <Navigate to='/home' replace />
    }

    return children
}

const Router = () => {
    return (
        <Routes>
            <Route path='/' element={<Navigate to='/home' />} />
            <Route path='/home' element={<Home />} />
            <Route path='/tour' element={<Tour />} />
            <Route path='/tour/:id' element={<TourDetail />} />
            <Route path='/booking/:id' element={<BookingDetail />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/thank-you' element={<ThankYou />} />
            <Route path='/tours/search' element={<SearchListTour />} />
            <Route path='/about' element={<About />} />
            <Route path='/policy' element={<PolicyFAQ />} />
            <Route path='/mybooking' element={<Booking />} />
            <Route path='/myprofile' element={<Profile />} />

            <Route path='/admin' element={<AdminLayout />}>
                <Route path='dashboard' element={<AdminOnlyRoute><Dashboard /></AdminOnlyRoute>} />
                <Route path='tours' element={<AdminOrStaffRoute><ManageTours /></AdminOrStaffRoute>} />
                <Route path='tours/create' element={<AdminOrStaffRoute><CreateTour /></AdminOrStaffRoute>} />
                <Route path='update-tour/:id' element={<AdminOrStaffRoute><CreateTour /></AdminOrStaffRoute>} />
                <Route path='bookings' element={<AdminOrStaffRoute><ManageBookings /></AdminOrStaffRoute>} />
                <Route path='bookings/:id' element={<AdminOrStaffRoute><ManageBookingDetail /></AdminOrStaffRoute>} />
                <Route path='faqs' element={<AdminOnlyRoute><ManageFAQ /></AdminOnlyRoute>} />
                <Route path='reviews' element={<AdminOrStaffRoute><ManageReviews /></AdminOrStaffRoute>} />
                <Route path='users' element={<AdminOnlyRoute><ManageUsers /></AdminOnlyRoute>} />
            </Route>
        </Routes>
    )
}

export default Router
