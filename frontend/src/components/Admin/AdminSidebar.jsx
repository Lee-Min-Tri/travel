import React from 'react'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem } from 'reactstrap'
import './admin-sidebar.css'

const AdminSidebar = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'admin'
  const isStaff = currentUser?.role === 'nhân viên'

  return (
    <div className='admin_sidebar_menu'>
      <div className='admin_logo p-3 text-center'>
        <h5 className='fw-bold text-primary'>ADMIN PANEL</h5>
      </div>

      <ListGroup flush className='mt-3'>
        {isAdmin && (
          <ListGroupItem className='border-0'>
            <Link to='/admin/dashboard' className='text-decoration-none text-dark d-flex align-items-center gap-2'>
              <i className='ri-dashboard-line'></i> Thống kê doanh thu
            </Link>
          </ListGroupItem>
        )}

        <ListGroupItem className='border-0'>
          <Link to='/admin/tours' className='text-decoration-none text-dark d-flex align-items-center gap-2'>
            <i className='ri-map-pin-user-line'></i> Quản lý Tour
          </Link>
        </ListGroupItem>
        <ListGroupItem className='border-0'>
          <Link to='/admin/tours/create' className='text-decoration-none text-dark d-flex align-items-center gap-2'>
            <i className='ri-add-circle-line'></i> Thêm Tour mới
          </Link>
        </ListGroupItem>
        <ListGroupItem className='border-0'>
          <Link to='/admin/bookings' className='text-decoration-none text-dark d-flex align-items-center gap-2'>
            <i className='ri-shopping-cart-2-line'></i> Quản lý Booking
          </Link>
        </ListGroupItem>
        <ListGroupItem className='border-0'>
          <Link to='/admin/faqs' className='text-decoration-none text-dark d-flex align-items-center gap-2'>
            <i className='ri-file-list-3-line'></i> Quản lý FAQ
          </Link>
        </ListGroupItem>
        <ListGroupItem className='border-0'>
          <Link to='/admin/reviews' className='text-decoration-none text-dark d-flex align-items-center gap-2'>
            <i className='ri-star-line'></i> Quản lý Đánh giá
          </Link>
        </ListGroupItem>
        {isAdmin && (
          <ListGroupItem className='border-0'>
            <Link to='/admin/users' className='text-decoration-none text-dark d-flex align-items-center gap-2'>
              <i className='ri-user-settings-line'></i> Quản lý User
            </Link>
          </ListGroupItem>
        )}
      </ListGroup>

      <div className='sidebar_footer p-3'>
        <Link to='/home' className='text-decoration-none text-danger d-flex align-items-center gap-2'>
          <i className='ri-home-4-line'></i> Quay lại trang chủ
        </Link>
      </div>
    </div>
  )
}

export default AdminSidebar
