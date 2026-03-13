import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminManagementPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  // Alert State
  const [alertTarget, setAlertTarget] = useState('all');
  const [alertCourseId, setAlertCourseId] = useState('');
  const [alertCourseQuery, setAlertCourseQuery] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertStatus, setAlertStatus] = useState('');

  // Admin certificate issue
  const [certStudentId, setCertStudentId] = useState('');
  const [certCourseId, setCertCourseId] = useState('');
  const [certStatus, setCertStatus] = useState('');

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  };

  const loadData = () => {
    api
      .get('/admin/dashboard-stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch(() => {});
    api
      .get('/admin/courses')
      .then((res) => setCourses(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveInstructor = async (id) => {
    await api.put(`/admin/instructors/${id}/approve`);
    loadData();
  };

  const togglePublish = async (course) => {
    await api.put(`/admin/courses/${course._id}/publish`, {
      published: !course.isPublished
    });
    loadData();
  };

  const deleteUser = async (id) => {
    if(!window.confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    loadData();
  };

  const deleteCourse = async (id) => {
    if(!window.confirm('Delete this course?')) return;
    await api.delete(`/admin/courses/${id}`);
    loadData();
  };

  const sendSystemAlert = async () => {
    if (!alertMessage.trim()) return;
    try {
      const payload = { target: alertTarget, message: alertMessage };
      if (alertTarget === 'enrolled') {
        payload.courseId = alertCourseId;
        if (!payload.courseId && alertCourseQuery.trim()) {
          payload.courseName = alertCourseQuery.trim();
        }
      }
      const res = await api.post('/admin/alert', payload);
      setAlertStatus(res.data.message);
      setAlertMessage('');
    } catch (err) {
      setAlertStatus('Failed to send alert.');
    }
  };

  const issueCertificateAdmin = async () => {
    if (!certStudentId || !certCourseId) {
      setCertStatus('Select a student and a completed course.');
      return;
    }
    try {
      const res = await api.post('/certificates/admin/issue', {
        studentId: certStudentId,
        courseId: certCourseId
      });
      setCertStatus(`Certificate issued: ${res.data.certificateCode || 'success'}`);
      loadData();
    } catch (err) {
      setCertStatus(err.response?.data?.message || 'Failed to issue certificate.');
    }
  };

  return (
    <div className="page">
      <h2>Admin Management Panel</h2>

      {stats && (
        <section className="grid-2" style={{ marginBottom: '20px' }}>
          <div className="card text-center">
            <h3>Total Users</h3>
            <p className="large">{stats.usersCount}</p>
          </div>
          <div className="card text-center">
            <h3>Courses Published</h3>
            <p className="large">{stats.coursesCount}</p>
          </div>
          <div className="card text-center">
            <h3>Active Enrollments</h3>
            <p className="large">{stats.enrollmentsCount} ({stats.completedEnrollmentsCount} completed)</p>
          </div>
          <div className="card text-center">
            <h3>Platform Activity</h3>
            <p className="large">{stats.submissionsCount} Submissions | {stats.certificatesCount} Certificates | {stats.paymentsCount} Payments</p>
          </div>
        </section>
      )}

      <section>
        <h3>System Alerts</h3>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
          <div>
            <label><strong>Target Audience:</strong></label>
            <select
              style={{ marginLeft: '10px', padding: '5px' }}
              value={alertTarget}
              onChange={(e) => setAlertTarget(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="students">All Students</option>
              <option value="instructors">All Instructors</option>
              <option value="enrolled">Enrolled Students (by Course)</option>
            </select>
          </div>
          {alertTarget === 'enrolled' && (
            <div style={{ marginTop: '10px' }}>
              <label><strong>Course:</strong></label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                <select
                  style={{ padding: '5px', minWidth: 320 }}
                  value={alertCourseId}
                  onChange={(e) => setAlertCourseId(e.target.value)}
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} (ID: {c.courseNumber ?? c._id})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or type course name (exact)"
                  style={{ padding: '5px', width: 250 }}
                  value={alertCourseQuery}
                  onChange={(e) => setAlertCourseQuery(e.target.value)}
                />
              </div>
            </div>
          )}
          <div style={{ marginTop: '10px' }}>
            <textarea
              style={{ width: '100%', height: '80px', padding: '10px' }}
              placeholder="Enter alert message..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
            ></textarea>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button className="btn-primary" onClick={sendSystemAlert}>
              Send Alert
            </button>
            {alertStatus && <span style={{ marginLeft: '10px', color: 'green' }}>{alertStatus}</span>}
          </div>
        </div>
      </section>

      <section>
        <h3>Certificates (Admin Issue)</h3>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <div>
              <label><strong>Student:</strong></label>
              <select
                style={{ marginLeft: '6px', padding: '5px', minWidth: '220px' }}
                value={certStudentId}
                onChange={(e) => setCertStudentId(e.target.value)}
              >
                <option value="">Select student</option>
                {users.filter((u) => u.role === 'student').map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label><strong>Course:</strong></label>
              <select
                style={{ marginLeft: '6px', padding: '5px', minWidth: '260px' }}
                value={certCourseId}
                onChange={(e) => setCertCourseId(e.target.value)}
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} (ID: {c.courseNumber ?? c._id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={issueCertificateAdmin}>
            Issue Certificate
          </button>
          {certStatus && (
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#16a34a' }}>
              {certStatus}
            </span>
          )}
        </div>
      </section>

      <section>
        <h3>Users</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.approved ? 'Yes' : 'No'}</td>
                <td>
                  {!u.approved && (
                    <button
                      onClick={() => approveInstructor(u._id)}
                      className="btn-small btn-primary"
                    >
                      Approve as Instructor
                    </button>
                  )}{' '}
                  <button className="btn-small btn-secondary" style={{ color: 'red', borderColor: 'red' }} onClick={() => deleteUser(u._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Courses</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Title</th>
              <th>Instructor</th>
              <th>Price</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr key={c._id}>
                <td className="muted small">
                  {c.courseNumber ?? idx + 1}
                </td>
                <td>{c.title}</td>
                <td>{c.instructor?.name}</td>
                <td>{c.price ? `Rs ${c.price.toFixed(0)}` : 'Free'}</td>
                <td>{c.isPublished ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    onClick={() => togglePublish(c)}
                    className={c.isPublished ? 'btn-small btn-secondary' : 'btn-small btn-primary'}
                  >
                    {c.isPublished ? 'Unpublish' : 'Publish'}
                  </button>{' '}
                  <button className="btn-small btn-secondary" style={{ color: 'red', borderColor: 'red' }} onClick={() => deleteCourse(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminManagementPage;

