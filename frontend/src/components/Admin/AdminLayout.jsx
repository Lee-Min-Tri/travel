import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { Container, Row, Col } from 'reactstrap'
import AdminSidebar from './AdminSidebar'
import './admin-layout.css' // Tạo file này để chỉnh CSS nếu cần
import { AuthContext } from '../../context/AuthContext'

const AdminLayout = () => {
  const { user } = useContext(AuthContext)
  const currentUser = user?.data ? user.data : user

  return (
    <div className="admin_layout">
      <Container fluid>
        <Row>
          <Col lg="2" className="admin_sidebar p-0 shadow-sm">
            <AdminSidebar currentUser={currentUser} />
          </Col>
          <Col lg="10" className="admin_main-content p-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default AdminLayout