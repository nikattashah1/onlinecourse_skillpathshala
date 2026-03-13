import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const blankCourse = {
  title: '',
  description: '',
  price: 0,
  category: 'Programming',
  difficulty: 'Beginner',
  thumbnailUrl: '',
  duration: '',
  lessonsCount: 0
};

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(blankCourse);
  const [error, setError] = useState('');

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  };

  const loadCourses = () => {
    api
      .get('/courses/instructor/me')
      .then((res) => setCourses(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const totalStudents = useMemo(
    () => courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
    [courses]
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!form.thumbnailUrl) {
        setError('Thumbnail is required (paste URL or upload an image).');
        return;
      }
      await api.post('/courses', { ...form, price: Number(form.price) });
      setForm(blankCourse);
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div className="page">
      <h2>Instructor Dashboard</h2>

      <section className="grid">
        <div className="card">
          <h3>Overview</h3>
          <p className="muted small">Teaching performance</p>
          <p>
            <strong>{courses.length}</strong> active courses
          </p>
          <p>
            <strong>{totalStudents}</strong> total enrollments
          </p>
        </div>
      </section>

      <section className="grid-2">
        <div>
          <h3>Create Course</h3>
          <form onSubmit={handleCreate} className="card">
            {error && <div className="error">{error}</div>}
            <label>
              Title
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Programming</option>
                <option>Computer Science</option>
                <option>AI & ML</option>
                <option>Design</option>
                <option>Business</option>
                <option>Technology</option>
                <option>Database</option>
                <option>Cloud</option>
                <option>Tools</option>
              </select>
            </label>
            <label>
              Difficulty
              <select name="difficulty" value={form.difficulty} onChange={handleChange}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label>
              Thumbnail URL
              <input
                type="text"
                name="thumbnailUrl"
                value={form.thumbnailUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </label>
            {form.thumbnailUrl && (
              <div style={{ marginBottom: '15px' }}>
                <img src={form.thumbnailUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover' }} />
              </div>
            )}
            <label>
              Duration (e.g. 12h 30m)
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 12h 30m"
              />
            </label>
            <label>
              Number of Lessons
              <input
                name="lessonsCount"
                type="number"
                min="0"
                value={form.lessonsCount}
                onChange={handleChange}
              />
            </label>
            <label>
              Price
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                min="0"
              />
            </label>
            <button type="submit" className="btn-primary">
              Create
            </button>
          </form>
        </div>

        <div>
          <h3>My Courses</h3>
          <div className="list">
            {courses.map((c) => (
              <div key={c._id} className="card">
                <h4>{c.title}</h4>
                <p className="muted small">Course ID: {c.courseNumber ?? c._id}</p>
                <p className="muted small">
                  {c.category} • {c.difficulty}
                </p>
                <p className="muted small">
                  Enrollments: {c.enrollmentCount || 0} • Rating:{' '}
                  {c.ratingCount > 0 ? Number(c.ratingAvg || 0).toFixed(1) : 'Not rated'}{' '}
                  {c.ratingCount > 0 ? `⭐ (${c.ratingCount})` : ''}
                </p>
                <p className="muted">Price: {c.price ? `Rs ${c.price.toFixed(0)}` : 'Free'}</p>
                <div className="card-actions">
                  <a
                    href={`/instructor/courses/${c._id}/manage`}
                    className="btn-secondary"
                  >
                    Manage Content
                  </a>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p>No courses yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstructorDashboard;


