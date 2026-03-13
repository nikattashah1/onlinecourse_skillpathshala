import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const PaymentPage = () => {
  const { id } = useParams(); // courseId
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch(() => {});
  }, [id]);

  const pay = async () => {
    setMessage('');
    try {
      await api.post('/payments', { courseId: id });
      setMessage('Payment successful! You can now enroll.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment failed');
    }
  };

  const enroll = async () => {
    setMessage('');
    try {
      await api.post('/enrollments', { courseId: id });
      navigate('/student/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Enrollment failed');
    }
  };

  return (
    <div className="page">
      <h2>Payment</h2>
      {course && (
        <div className="card">
          <p>
            Course: <strong>{course.title}</strong>
          </p>
          <p>Amount: Rs {course.price}</p>
          <button onClick={pay} className="btn-primary">
            Simulate Payment
          </button>
          <button onClick={enroll} className="btn-secondary">
            Enroll after Payment
          </button>
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;

