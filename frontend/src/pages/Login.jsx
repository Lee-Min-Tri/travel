import React, { useState, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import "../style/login.css";

// Đảm bảo bạn đã đưa folder assets vào trong folder src nhé
import loginImg from "../assets/images/login.png";
import userIcon from "../assets/images/user.png";

import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../utils/config";

const Login = () => {
  // 1. Khai báo State để lưu dữ liệu nhập vào (Sửa lỗi 'is not defined')
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const { dispatch } = useContext(AuthContext)
  const navigate = useNavigate()

  // 2. Hàm xử lý khi gõ phím (Sửa lỗi 'handleChange' is not defined)
  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // 3. Hàm xử lý khi nhấn nút Login (Sửa lỗi 'handleClick' is not defined)
  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: 'LOGIN_START' })

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      })

      const result = await res.json()

      if (!res.ok) {
        dispatch({ type: 'LOGIN_FAILURE', payload: result.message });
        return alert(result.message);
      }

      localStorage.setItem('token', result.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: result.data })
      navigate('/')
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err.data })
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8" className="m-auto">
            <div className="login__container d-flex justify-content-between">
              {/* Sử dụng biến loginImg đã import ở trên */}
              <div className="login__img">
                <img src={loginImg} alt="login" />
              </div>

              <div className="login__form">
                {/* Sử dụng biến userIcon đã import ở trên */}
                <div className="user">
                  <img src={userIcon} alt="user icon" />
                </div>
                <h2>Đăng nhập</h2>

                <Form onSubmit={handleClick}>
                  <FormGroup>
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      id="email"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="password"
                      placeholder="Mật khẩu"
                      required
                      id="password"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <Button className="btn secondary__btn auth__btn" type="submit">
                    Đăng nhập
                  </Button>
                </Form>
                <p>
                  Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;