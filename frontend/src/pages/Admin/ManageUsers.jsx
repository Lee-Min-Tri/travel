import React, { useState } from 'react';
import { Container, Row, Col, Table, Badge, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap';
import useFetch from '../../hooks/useFetch';
import { BASE_URL } from '../../utils/config';

const ManageUsers = () => {
   const { data: users, loading, error } = useFetch(`${BASE_URL}/users`);
   const [modal, setModal] = useState(false);
   const [editMode, setEditMode] = useState(false);
   const [selectedUser, setSelectedUser] = useState(null);
   const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '', role: 'user', status: 'Đang rảnh' });

   const toggle = () => {
      setModal(!modal);
      if (!modal) { // Reset form khi đóng modal
         setFormData({ username: '', email: '', phone: '', password: '', role: 'user', status: 'Đang rảnh' });
         setEditMode(false);
      }
   };

   // Mở modal để sửa
   const handleEdit = (user) => {
      setEditMode(true);
      setSelectedUser(user);
      setFormData({ username: user.username, email: user.email, phone: user.phone || '', role: user.role, status: user.status || 'Đang rảnh', password: '' });
      setModal(true);
   };

   const handleChange = e => {
      setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      
      // Nếu editMode thì gọi PUT /users/:id, nếu không gọi POST /auth/register
      const url = editMode 
         ? `${BASE_URL}/users/${selectedUser._id}` 
         : `${BASE_URL}/users`;
      
      const method = editMode ? 'PUT' : 'POST';

      try {
         const res = await fetch(url, {
            method: method,
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
         });

         const result = await res.json();
         if (!res.ok) return alert(result.message);

         alert(result.message || "Thao tác thành công!");
         window.location.reload(); // Tải lại trang để cập nhật danh sách
      } catch (err) {
         alert("Lỗi server!");
      }
   };

   const handleDelete = async (id) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
         try {
            const res = await fetch(`${BASE_URL}/users/${id}`, {
               method: 'DELETE',
               headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
               alert("Xóa thành công!");
               window.location.reload();
            }
         } catch (err) { alert("Lỗi khi xóa!"); }
      }
   };

   return (
      <section className="mt-5 pt-5">
         <Container>
            <Row>
               <Col lg='12'>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                     <h3 className="fw-bold">Quản lý người dùng</h3>
                     <Button color="primary" onClick={toggle}>+ Thêm người dùng</Button>
                  </div>
                  
                  {loading && <h4 className="text-center pt-5">Đang tải dữ liệu...</h4>}
                  {error && <div className="alert alert-danger text-center">{error}</div>}

                  {!loading && !error && (
                     <Table hover responsive className="shadow-sm bg-white rounded">
                        <thead className="bg-light">
                           <tr>
                              <th>Tên người dùng</th>
                              <th>Email</th>
                              <th>Điện thoại</th>
                              <th>Quyền hạn</th>
                              <th>Trạng thái</th>
                              <th className="text-center">Thao tác</th>
                           </tr>
                        </thead>
                        <tbody>
                           {users?.map(user => (
                              <tr key={user._id}>
                                 <td className="align-middle">{user.username}</td>
                                 <td className="align-middle">{user.email}</td>
                                 <td className="align-middle">{user.phone || '-'}</td>
                                 <td className="align-middle">
                                    <Badge color={user.role === 'admin' ? "danger" : "success"}>{user.role}</Badge>
                                 </td>
                                 <td className="align-middle">{user.status || 'Đang rảnh'}</td>
                                 <td className="text-center">
                                    <Button color="warning" size="sm" className="me-2 text-white" onClick={() => handleEdit(user)}>Sửa</Button>
                                    <Button color="danger" size="sm" onClick={() => handleDelete(user._id)}>Xóa</Button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </Table>
                  )}
               </Col>
            </Row>
         </Container>

         {/* Modal Thêm/Sửa */}
         <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>{editMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</ModalHeader>
            <ModalBody>
               <Form onSubmit={handleSubmit}>
                  <FormGroup>
                     <Label for="username">Username</Label>
                     <Input type="text" id="username" value={formData.username} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                     <Label for="email">Email</Label>
                     <Input type="email" id="email" value={formData.email} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                     <Label for="phone">Số điện thoại</Label>
                     <Input type="text" id="phone" value={formData.phone} onChange={handleChange} required />
                  </FormGroup>
                  {!editMode && (
                     <FormGroup>
                        <Label for="password">Mật khẩu</Label>
                        <Input type="password" id="password" onChange={handleChange} required />
                     </FormGroup>
                  )}
                  <FormGroup>
                     <Label for="role">Quyền hạn</Label>
                     <Input type="select" id="role" value={formData.role} onChange={handleChange}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="nhân viên">Nhân viên</option>
                        <option value="guide">Hướng dẫn viên</option>
                     </Input>
                  </FormGroup>
                  <FormGroup>
                     <Label for="status">Trạng thái</Label>
                     <Input type="select" id="status" value={formData.status} onChange={handleChange}>
                        <option value="Đang rảnh">Đang rảnh</option>
                        <option value="Đang bận">Đang bận</option>
                     </Input>
                  </FormGroup>
                  <Button color="primary" type="submit" className="w-100 mt-3">Lưu thay đổi</Button>
               </Form>
            </ModalBody>
         </Modal>
      </section>
   );
};

export default ManageUsers;