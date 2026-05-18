import React from 'react';
import './booking-timeline.css';

const BookingTimeline = ({ itinerary }) => {
  // Log để bạn kiểm tra trong console nếu cần
  console.log("Timeline đang hiển thị:", itinerary);

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className='timeline_empty text-center p-3'>
        <p className='text-muted'>Nội dung lịch trình đang được chuẩn bị...</p>
      </div>
    );
  }

  return (
    <div className='booking_timeline'>
      <div className='timeline_container'>
        {itinerary.map((item, index) => (
          <div key={index} className='timeline_item d-flex gap-3 mb-4'>
            {/* Cột mốc thời gian/đường kẻ */}
            <div className='timeline_marker d-flex flex-column align-items-center'>
              <div className='timeline_dot bg-primary rounded-circle' style={{width:'15px', height:'15px'}}></div>
              {index < itinerary.length - 1 && <div className='timeline_line flex-grow-1' style={{width:'2px', background:'#e9ecef'}}></div>}
            </div>

            {/* Nội dung chi tiết - Khớp với Object trong ảnh của bạn */}
            <div className='timeline_content pb-3'>
              <h6 className='fw-bold text-primary mb-1'>
                Ngày {item.day}: {item.location}
              </h6>
              <p className='text-muted mb-0' style={{fontSize: '0.9rem', lineHeight: '1.5'}}>
                {item.description}
              </p>
              
              {/* Nếu có thêm meals hoặc time thì hiện, không thì thôi */}
              {(item.meals || item.time) && (
                <div className='mt-2'>
                  {item.meals && <small className='badge bg-info me-2 text-dark'>{item.meals}</small>}
                  {item.time && <small className='text-secondary'><i className='ri-time-line'></i> {item.time}</small>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingTimeline;