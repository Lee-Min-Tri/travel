import React, { useRef, useEffect, useContext } from 'react'
import { 
  Container, 
  Row, 
  Button
} from 'reactstrap'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import './header.css'
import { AuthContext } from '../../context/AuthContext'

const nav_links = [
  { path: '/home', display: 'Home' },
  { path: '/about', display: 'Về chúng tôi' },
  { path: '/policy', display: 'FAQ' },
  { path: '/tour', display: 'Tất cả tour' },
  { path: '/mybooking', display: 'Tour của tôi' },
  { path: '/myprofile', display: 'Thông tin của tôi' },
  
]

const Header = () => {
  const headerRef = useRef(null)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { user, dispatch } = useContext(AuthContext)

  // Lấy dữ liệu user an toàn
  const currentUser = user?.data ? user.data : user;
  const userRole = currentUser?.role || user?.role;
  const username = currentUser?.username || user?.username;
  const isManager = userRole === 'admin' || userRole === 'nhân viên';

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  // Xử lý Header dính (Sticky)
  useEffect(() => {
    const handleScroll = () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        headerRef.current?.classList.add('sticky_header')
      } else {
        headerRef.current?.classList.remove('sticky_header')
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => menuRef.current.classList.toggle('show_menu')

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav_warapper d-flex align-items-center justify-content-between">
            {/* Logo */}
            <div className="logo">
              <Link to='/home'>
                <img src={logo} alt="logo" />
              </Link>
            </div>

            {/* Điều hướng Menu */}
            <div className="navigation" ref={menuRef} onClick={toggleMenu}>
              <ul className="menu d-flex align-items-center gap-5">
                {nav_links.map((item, index) => (
                  <li className="nav_item" key={index}>
                    <NavLink
                      to={item.path}
                      className={navClass => (navClass.isActive ? 'active_link' : '')}
                    >
                      {item.display}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cụm nút bên phải */}
            <div className="nav_right d-flex align-items-center gap-4">
              <div className="nav_btns d-flex align-items-center gap-4">
                {user && username ? (
                  <>
                    <h5 className="mb-0 text-primary fw-bold">{username}</h5>

                    {isManager && (
                      <Button
                        className="btn btn-warning btn-sm text-dark fw-bold px-3 py-1 rounded-2 ms-2"
                        onClick={() => navigate(userRole === 'admin' ? '/admin/dashboard' : '/admin/tours')}
                      >
                        Quản trị
                      </Button>
                    )}

                    <Button className="btn btn-dark" onClick={logout}>
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="btn secondary_btn">
                      <Link to="/login" className="text-decoration-none">Đăng nhập</Link>
                    </Button>
                    <Button className="btn primary_btn">
                      <Link to="/register" className="text-decoration-none">Đăng ký</Link>
                    </Button>
                  </>
                )}
              </div>

              <span className="mobile_menu" onClick={toggleMenu}>
                <i className="ri-menu-5-line"></i>
              </span>
            </div>
          </div>
        </Row>
      </Container>
    </header>
  )
}

export default Header