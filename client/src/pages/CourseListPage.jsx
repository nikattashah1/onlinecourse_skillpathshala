import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CourseListPage = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    api
      .get('/courses')
      .then((res) => setCourses(res.data))
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category || 'Other'));
    return ['All', ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || c.category === category;
      const matchesRating = (c.ratingAvg || 0) >= minRating;
      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [courses, search, category, minRating]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Browse Courses</h2>
        <div className="filters">
          <input
            className="search-input"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
            <option value={0}>All ratings</option>
            <option value={4}>4★ and up</option>
            <option value={4.5}>4.5★ and up</option>
          </select>
        </div>
      </div>

      <div className="grid course-grid">
        {filtered.map((course) => (
          <div key={course._id} className="card course-card">
            {course.thumbnailUrl && (
              <div className="course-thumb">
                <img src={course.thumbnailUrl} alt={course.title} />
              </div>
            )}
            <div className="course-body">
              <span className="chip">{course.category}</span>
              <h3>{course.title}</h3>
              <p className="muted small">{course.description}</p>
              <p className="muted small">
                By {course.instructor?.name} • {course.duration} • {course.lessonsCount} lessons
              </p>
              <div className="course-meta">
                <div className="course-rating-row">
                  <span className="rating">
                    {course.ratingCount > 0 ? (
                      <>
                        ⭐ {Number(course.ratingAvg || 0).toFixed(1)}{' '}
                        <span className="muted small">({course.ratingCount})</span>
                      </>
                    ) : (
                      <span className="muted small">☆☆☆☆☆ Not rated yet</span>
                    )}
                  </span>
                  <span className="difficulty-pill">{course.difficulty}</span>
                </div>
                <span className="price">
                  {course.price ? `Rs ${course.price.toFixed(0)}` : 'Free'}
                </span>
              </div>
            </div>
            <div className="course-footer">
              <Link to={`/courses/${course._id}`} className="btn-primary">
                View Details
              </Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p>No courses match your filters.</p>}
      </div>
    </div>
  );
};

export default CourseListPage;

