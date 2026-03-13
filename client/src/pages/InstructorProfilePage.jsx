import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const InstructorProfilePage = () => {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then((res) => setInstructor(res.data))
      .catch(() => {});
    api
      .get('/courses')
      .then((res) => setCourses(res.data.filter((c) => c.instructor?._id === id)))
      .catch(() => {});
  }, [id]);

  if (!instructor) {
    return (
      <div className="page">
        <p>Loading instructor...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>{instructor.name}</h2>
      <p className="muted">{instructor.bio || 'Instructor at SkillPathshala.'}</p>

      <section>
        <h3>Courses by {instructor.name}</h3>
        <div className="grid">
          {courses.map((course) => (
            <div key={course._id} className="card">
              <h4>{course.title}</h4>
              <p className="muted small">{course.description}</p>
              <Link to={`/courses/${course._id}`} className="btn-primary">
                View Course
              </Link>
            </div>
          ))}
          {courses.length === 0 && <p>No courses yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default InstructorProfilePage;

