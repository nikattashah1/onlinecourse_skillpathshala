import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const sectionConfig = [
  { id: 'popular', title: 'Popular Courses', filter: () => true },
  { id: 'programming', title: 'Programming Courses', filter: (c) => c.category === 'Programming' },
  { id: 'technology', title: 'Technology Courses', filter: (c) => c.category === 'Technology' },
  { id: 'design', title: 'Design Courses', filter: (c) => c.category === 'Design' },
  { id: 'business', title: 'Business Courses', filter: (c) => c.category === 'Business' }
];

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/courses')
      .then((res) => setCourses(res.data))
      .catch(() => {});
  }, []);

  const filteredCourses = useMemo(() => {
    if (!search) return courses;
    return courses.filter((c) => {
      const term = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        (c.category || '').toLowerCase().includes(term)
      );
    });
  }, [courses, search]);

  const renderCourseCard = (course) => (
    <div key={course._id} className="card course-card">
      {course.thumbnailUrl && (
        <div className="course-thumb">
          <img src={course.thumbnailUrl} alt={course.title} />
        </div>
      )}
      <div className="course-body">
        <span className="chip">{course.category}</span>
        <h3>{course.title}</h3>
        <p className="muted small">Course ID: {course.courseNumber ?? course._id}</p>
        <p className="muted small">{course.description}</p>
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
          <span className="muted small">
            {course.duration} • {course.lessonsCount} lessons
          </span>
          <span className="price">
            {course.price ? `Rs ${course.price.toFixed(0)}` : 'Free'}
          </span>
        </div>
      </div>
      <div className="course-footer">
        <Link to={`/courses/${course._id}`} className="btn-primary">
          Enroll Now
        </Link>
      </div>
    </div>
  );

  return (
    <div className="page">
      <section className="hero hero-with-bg">
        <div className="hero-content">
          <h1>SkillPathshala</h1>
          <p>
            Upgrade Your Skills Anytime, Anywhere. Learn modern skills in programming, design,
            business, and technology with expert instructors.
          </p>
          <div className="hero-actions">
            <Link to="/courses" className="btn-primary">
              Explore Courses
            </Link>
            <Link to="/register" className="btn-secondary">
              Join for Free
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <strong>15+</strong>
              <span className="muted small">Expert-led courses</span>
            </div>
            <div>
              <strong>Project-based</strong>
              <span className="muted small">Hands-on learning</span>
            </div>
            <div>
              <strong>Certificates</strong>
              <span className="muted small">On completion</span>
            </div>
          </div>
        </div>
        <div className="hero-search">
          <input
            className="search-input large"
            placeholder="Search for courses, categories, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {sectionConfig.map((section) => {
        const list = filteredCourses.filter(section.filter).slice(0, 4);
        if (list.length === 0) return null;
        return (
          <section key={section.id} className="home-section">
            <div className="section-header">
              <h2>{section.title}</h2>
              <Link to="/courses" className="muted small">
                View all
              </Link>
            </div>
            <div className="grid course-grid">{list.map(renderCourseCard)}</div>
          </section>
        );
      })}
    </div>
  );
};

export default HomePage;

