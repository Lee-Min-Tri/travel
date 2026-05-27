import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Spinner, Alert, Input, InputGroup, InputGroupText, Modal, ModalHeader, ModalBody, Form, FormGroup, Label } from 'reactstrap';
import useFetch from '../../hooks/useFetch';
import { BASE_URL } from '../../utils/config';
import '../../pages/Admin/tour-status-management.css';

const FillStatusMonitoring = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState('');

  const { data: tours, loading, error } = useFetch(`${BASE_URL}/tours/status/fill?refresh=${refreshKey}`);

  const fetchGuides = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/users/guides`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok) {
        setGuides(result.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách HDV:', err);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const filteredTours = useMemo(() => {
    if (!tours || !Array.isArray(tours)) return [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let result = tours.filter(tour => {
      if (!normalizedSearch) return true;
      return tour.title?.toLowerCase().includes(normalizedSearch) || tour.city?.toLowerCase().includes(normalizedSearch);
    });
    return result.sort((a, b) => (b.fillPercent || 0) - (a.fillPercent || 0));
  }, [tours, searchTerm]);

  const handleDecision = async (tourId, decision) => {
    setLoadingAction(true);
    setActionError(null);
    setActionMessage(null);
    setProcessingId(tourId);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_URL}/tours/status/fill/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision })
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Lỗi xử lý quyết định');
      }
      setActionMessage(result.message);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setActionError(err.message || 'Lỗi khi gửi quyết định');
    } finally {
      setLoadingAction(false);
      setProcessingId(null);
    }
  };

  const openGuideModal = async (tour) => {
    setSelectedTour(tour);
    setSelectedGuide(tour.tourGuide?.guideId || '');
    await fetchGuides();
    setModalOpen(true);
  };

  const handleAssignGuide = async () => {
    if (!selectedGuide) {
      alert('Vui lòng chọn hướng dẫn viên');
      return;
    }

    const guide = guides.find(g => g._id === selectedGuide);
    if (!guide) return;

    setLoadingAction(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_URL}/tours/${selectedTour._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tourGuide: {
            guideId: guide._id,
            name: guide.username,
            phone: guide.phone
          }
        })
      });
      const result = await res.json();
      if (res.ok) {
        setActionMessage('Gán hướng dẫn viên thành công!');
        setModalOpen(false);
        setRefreshKey(prev => prev + 1);
      } else {
        setActionError(result.message || 'Không thể gán hướng dẫn viên');
      }
    } catch (err) {
      setActionError('Lỗi: ' + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa có';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const renderStatusBadge = (status) => {
    const statusClass = {
      'Mở để đặt': 'bg-info text-white',
      'Chờ xác nhận': 'bg-warning text-dark',
      'Đã đủ khách': 'bg-success text-white',
      'Đã xác nhận sẽ chạy': 'bg-primary text-white',
      'Đã khởi hành': 'bg-secondary text-white',
      'Đã hoàn thành': 'bg-dark text-white',
      'Đã hủy': 'bg-danger text-white'
    };
    return <span className={`status-badge ${statusClass[status] || 'bg-secondary text-white'}`}>{status}</span>;
  };

  return (
    <section className='tour-status-management'>
      <Container>
        <Row>
          <Col lg='12' className='mb-4 mt-5'>
            <h2 className='fw-bold text-primary'>Theo dõi fill chỗ trống</h2>
            <p className='text-muted'>Giám sát mức độ lấp đầy, gán hướng dẫn viên và quyết định tour có thực hiện hay không.</p>
          </Col>

          <Col lg='12' className='mb-3'>
            <InputGroup>
              <InputGroupText>Tìm tour</InputGroupText>
              <Input
                placeholder='Tìm theo tên tour hoặc thành phố'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col lg='12'>
            {actionMessage && <Alert color='success' dismissable>{actionMessage}</Alert>}
            {actionError && <Alert color='danger' dismissable>{actionError}</Alert>}
          </Col>

          <Col lg='12'>
            <div className='table__container shadow-sm p-3 bg-white rounded'>
              <Table striped bordered hover responsive className='text-center align-middle'>
                <thead className='table-dark'>
                  <tr>
                    <th>Tên tour</th>
                    <th>Ngày khởi hành</th>
                    <th>Đã fill</th>
                    <th>Tổng ghế</th>
                    <th>Phần trăm</th>
                    <th>Hướng dẫn viên</th>
                    <th>Trạng thái</th>
                    <th>Quyết định</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan='8' className='py-5'>
                        <div className='spinner-container'>
                          <Spinner color='primary' />
                          <p>Đang tải dữ liệu...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {error && (
                    <tr>
                      <td colSpan='8' className='text-danger py-5'>{error}</td>
                    </tr>
                  )}
                  {!loading && !error && filteredTours?.length === 0 && (
                    <tr>
                      <td colSpan='8' className='py-5'>Không có tour nào phù hợp với tìm kiếm.</td>
                    </tr>
                  )}
                  {!loading && !error && filteredTours?.map(tour => {
                    const canDecide = tour.status !== 'Đã hủy' && tour.status !== 'Đã khởi hành' && tour.status !== 'Đã hoàn thành';
                    return (
                      <tr key={tour._id} className={`tour-item status-${tour.status?.replace(/\s+/g, '-').toLowerCase()}`}>
                        <td className='text-start fw-medium'>{tour.title}</td>
                        <td>{formatDate(tour.tourDate)}</td>
                        <td>{tour.booked || 0}</td>
                        <td>{tour.total || 0}</td>
                        <td>{tour.fillPercent}%</td>
                        <td>
                          {tour.tourGuide?.guideId ? (
                            <div>
                              <div className='fw-bold text-primary mb-2'>{tour.tourGuide?.name}</div>
                              <div className='small text-muted mb-2'>{tour.tourGuide?.phone}</div>
                              <Button
                                color='warning'
                                size='sm'
                                outline
                                onClick={() => openGuideModal(tour)}
                              >
                                <i className='ri-edit-line'></i> Thay đổi
                              </Button>
                            </div>
                          ) : (
                            <Button
                              color='warning'
                              size='sm'
                              onClick={() => openGuideModal(tour)}
                            >
                              Gán HDV
                            </Button>
                          )}
                        </td>
                        <td>{renderStatusBadge(tour.status)}</td>
                        <td>
                          <div className='action-buttons justify-content-center'>
                            <Button
                              color='success'
                              size='sm'
                              disabled={!canDecide || loadingAction}
                              onClick={() => handleDecision(tour._id, 'go')}
                            >
                              Đi
                            </Button>
                            <Button
                              color='danger'
                              size='sm'
                              disabled={!canDecide || loadingAction}
                              onClick={() => handleDecision(tour._id, 'no-go')}
                            >
                              Không đi
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size='sm'>
        <ModalHeader toggle={() => setModalOpen(false)}>
          {selectedTour?.tourGuide?.guideId ? 'Thay đổi Hướng dẫn viên' : 'Gán Hướng dẫn viên'}
        </ModalHeader>
        <ModalBody>
          {selectedTour && (
            <Form>
              <FormGroup>
                <Label for='tourName' className='fw-bold'>Tour</Label>
                <Input type='text' id='tourName' value={selectedTour.title} disabled />
              </FormGroup>
              <FormGroup>
                <Label for='guideSelect' className='fw-bold'>Hướng dẫn viên</Label>
                <Input
                  type='select'
                  id='guideSelect'
                  value={selectedGuide}
                  onChange={(e) => setSelectedGuide(e.target.value)}
                >
                  <option value=''>-- Chọn hướng dẫn viên --</option>
                  {guides
                    .filter(guide => guide.status === 'Đang rảnh' || guide._id === selectedTour?.tourGuide?.guideId)
                    .map(guide => (
                      <option key={guide._id} value={guide._id}>
                        {guide.username} - {guide.phone} {guide.status !== 'Đang rảnh' ? `(${guide.status})` : ''}
                      </option>
                    ))}
                </Input>
              </FormGroup>
              <Button color='primary' onClick={handleAssignGuide} disabled={loadingAction} className='w-100'>
                {loadingAction ? 'Đang gán...' : 'Gán HDV'}
              </Button>
            </Form>
          )}
        </ModalBody>
      </Modal>
    </section>
  );
};

export default FillStatusMonitoring;
