import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      {stats && (
        <div className="grid">
          <div className="card">
            <h3>Total Users</h3>
            <p className="big-number">{stats.usersCount}</p>
          </div>
          <div className="card">
            <h3>Total Courses</h3>
            <p className="big-number">{stats.coursesCount}</p>
          </div>
          <div className="card">
            <h3>Payments</h3>
            <p className="big-number">{stats.paymentsCount}</p>
          </div>
          <div className="card">
            <h3>Enrollments</h3>
            <p className="big-number">{stats.enrollmentsCount}</p>
          </div>
        </div>
      )}
      <Link to="/admin/manage" className="btn-primary">
        Go to Management Panel
      </Link>
    </div>
  );
};

export default AdminDashboard;

