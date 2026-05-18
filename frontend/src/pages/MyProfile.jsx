import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, FormGroup, Button, Input } from 'reactstrap';
import { AuthContext } from '../context/AuthContext'; // Nhớ check lại đường dẫn import sau khi bạn dời file vào src
import { BASE_URL } from '../utils/config';

const MyProfile = () => {
   const { user, dispatch } = useContext(AuthContext);
   const [passwords, setPasswords] = useState({
      oldPassword: '',
      newPassword: '',
   });

   const handleInputChange = e => {
      setPasswords(prev => ({ ...prev, [e.target.id]: e.target.value }));
   };

   const submitHandler = async e => {
      e.preventDefault();
      const token = localStorage.getItem('token');

      try {
         // Gọi API đổi mật khẩu (Truyền ID user vào URL)
         const res = await fetch(`${BASE_URL}/auth/update-password/${user._id}`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(passwords)
         });

         const result = await res.json();

         if (!res.ok) {
            return alert(result.message);
         }

         alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
         
         // Đăng xuất sau khi đổi mật khẩu để bảo mật
         dispatch({ type: 'LOGOUT' });
         localStorage.clear();
         window.location.replace('/login');

      } catch (err) {
         alert("Lỗi kết nối server!");
      }
   };

   return (
      <section className="mt-5">
         <Container>
            <Row>
               <Col lg="4" className="mb-4">
                  <div className="profile__card p-3 shadow-sm">
                     <h4>Thông tin của tôi</h4>
                     <hr />
                     <p><b>Username:</b> {user?.username}</p>
                     <p><b>Email:</b> {user?.email}</p>
                     <p><b>Vai trò:</b> {user?.role}</p>
                  </div>
               </Col>

               <Col lg="8">
                  <div className="password__form p-4 shadow-sm border rounded">
                     <h4 className="mb-4">Đổi mật khẩu</h4>
                     <Form onSubmit={submitHandler}>
                        <FormGroup>
                           <label>Mật khẩu hiện tại</label>
                           <Input type="password" id="oldPassword" placeholder="Nhập mật khẩu cũ" 
                              required onChange={handleInputChange} value={passwords.oldPassword} />
                        </FormGroup>
                        <FormGroup>
                           <label>Mật khẩu mới</label>
                           <Input type="password" id="newPassword" placeholder="Nhập mật khẩu mới" 
                              required onChange={handleInputChange} value={passwords.newPassword} />
                        </FormGroup>
                        <Button className="btn primary__btn w-100" type="submit">Cập nhật mật khẩu</Button>
                     </Form>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default MyProfile;