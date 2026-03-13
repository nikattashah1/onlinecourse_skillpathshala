import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    api
      .get('/courses/student/me/enrollments')
      .then((res) => setEnrollments(res.data))
      .catch(() => {});
    api
      .get('/certificates/me')
      .then((res) => setCertificates(res.data))
      .catch(() => {});
  }, []);

  const markCourseComplete = async (enrollmentId) => {
    try {
      const res = await api.put(`/enrollments/${enrollmentId}/progress`, {
        progress: 100,
        completed: true
      });
      setEnrollments((prev) => prev.map((e) => (e._id === res.data._id ? res.data : e)));
    } catch {
      // ignore for now
    }
  };

  const overallProgress =
    enrollments.length === 0
      ? 0
      : Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
        );

  return (
    <div className="page">
      <h2>Student Dashboard</h2>
      <p className="muted">Welcome, {user?.name}</p>

      <section className="grid">
        <div className="card">
          <h3>Overview</h3>
          <p className="muted small">Your learning summary</p>
          <p>
            <strong>{enrollments.length}</strong> enrolled courses
          </p>
          <p>
            <strong>{certificates.length}</strong> certificates earned
          </p>
          <p className="muted small">Average progress</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
          <p className="muted small">{overallProgress}% complete across all courses</p>
        </div>
      </section>

      <section>
        <h3>My Courses</h3>
        <div className="grid">
          {enrollments.map((enr) => (
            <div key={enr._id} className="card">
              <h4>{enr.courseId?.title}</h4>
              <p className="muted small">
                Course ID: {enr.courseId?.courseNumber ?? enr.courseId?._id}
              </p>
              <p className="muted small">{enr.courseId?.description}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${enr.progress || 0}%` }} />
              </div>
              <p className="muted small">Progress: {enr.progress || 0}%</p>
              <div className="card-actions">
                <Link to={`/courses/${enr.courseId?._id}/player`} className="btn-primary">
                  Continue
                </Link>
                <Link
                  to={`/courses/${enr.courseId?._id}/assignments`}
                  className="btn-secondary"
                >
                  Assignments
                </Link>
                {!enr.completed && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => markCourseComplete(enr._id)}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
          {enrollments.length === 0 && <p>No enrollments yet. Browse courses to get started.</p>}
        </div>
      </section>

      <section>
        <div className="page-header">
          <h3>Certificates</h3>
          <Link to="/certificates" className="btn-secondary btn-small">
            View all
          </Link>
        </div>
        <div className="grid">
          {certificates.map((c) => (
            <div key={c._id} className="card certificate-card">
              <h4>{c.courseId?.title}</h4>
              <p className="muted small">
                Issued on {new Date(c.completionDate).toLocaleDateString()}
              </p>
              <p className="muted small">Code: {c.certificateCode}</p>
              {c.fileUrl && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <a
                    href={c.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary btn-small"
                  >
                    View
                  </a>
                  <a
                    href={c.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="btn-secondary btn-small"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          ))}
          {certificates.length === 0 && <p>No certificates yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;

