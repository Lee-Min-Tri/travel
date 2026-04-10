import React, {useRef, useEffect, useContext} from 'react'
import { Container, Row, Button } from 'reactstrap'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import './header.css'
import { AuthContext } from '../../context/AuthContext'

const nav_links = [
  {
    path: '/home',
    display: 'Home'
  },
  {
    path: 'about',
    display: 'Về chúng tôi'
  },
  {
    path: '/tour',
    display: 'Tour'
  },
]

const Header = () => {

  const headerRef = useRef(null)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const {user, dispatch} = useContext(AuthContext)

  const logout = ()=>{
    dispatch({type:'LOGOUT'})
    navigate('/')
  }

  const stickyHeaderFunc = () =>{
    window.addEventListener('scroll', ()=>{
      if(document.body.scrollTop > 80 || document.documentElement.scrollTop > 80){
        headerRef.current.classList.add('sticky_header')
      }else{
        headerRef.current.classList.remove('sticky_header')
      }
    })
  }

  useEffect(() =>{
    stickyHeaderFunc()
    return window.removeEventListener('scroll', stickyHeaderFunc)
  })

  const toggleMenu = () => menuRef.current.classList.toggle('show_menu')

  return <header className="header" ref={headerRef}>
    <Container>
      <Row>
        <div className="nav_warapper d-flex align-items-center justify-content-between">
          {/*logo*/}
          <div className="logo">
            <img src={logo} alt="" />
          </div>

          {/*logo*/}
          {/*menu start*/}
          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <ul className="menu d-flex align-items-center gap-5">
              {
                nav_links.map((item, index) => (
                  <li className="nav_item" key={index}>
                    <NavLink to={item.path} className={navClass =>
                       navClass.isActive ? 'active_link':""}>{item.display}</NavLink>
                  </li>
                ))
              }
            </ul>
          </div>

          {/*menu end*/}
          <div className="nav_right d-flex align-items-center gap-4">
            <div className="nav_btns d-flex align-items-center gap-4">

              {
                user && (user.username || user.data?.username)?<>
                <h5 className='mb-0'>{user.data?.username || user.username}</h5>
                <Button className='btn btn-dark' onClick={logout}>Đăng xuất</Button>
                </> : <>
                <Button className="btn secondary_btn"><Link to='/login'>Đăng nhập</Link></Button>
                <Button className="btn primary_btn"><Link to='/register'>Đăng ký</Link></Button>   
                </>
              }

            </div>

            <span className='mobile_menu' onClick={toggleMenu}>
              <i class="ri-menu-5-line"></i>
            </span>
          </div>
        </div>
      </Row>
    </Container>
  </header>
}

export default Header
