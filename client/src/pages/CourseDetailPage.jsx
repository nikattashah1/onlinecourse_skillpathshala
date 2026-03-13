import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api
      .get(`/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch(() => setError('Course not found'));
  }, [id]);

  const loadReviews = () => {
    api
      .get(`/courses/${id}/reviews`)
      .then((res) => setReviews(res.data))
      .catch(() => {});
    if (user?.role === 'student') {
      api
        .get(`/enrollments/status/${id}`)
        .then((res) => setIsEnrolled(!!res.data?.enrolled))
        .catch(() => setIsEnrolled(false));
      api
        .get(`/courses/${id}/reviews/me`)
        .then((res) => {
          setMyReview(res.data);
          if (res.data) {
            setReviewRating(res.data.rating || 5);
            setReviewComment(res.data.comment || '');
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (!id) return;
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?._id]);

  const handleEnroll = async () => {
    try {
      await api.post('/enrollments', { courseId: id });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    }
  };

  if (!course) {
    return (
      <div className="page">
        <p>{error || 'Loading course...'}</p>
      </div>
    );
  }

  const isPaid = course.price && course.price > 0;

  return (
    <div className="page course-detail">
      {course.thumbnailUrl && (
        <div className="course-banner">
          <img src={course.thumbnailUrl} alt={course.title} />
        </div>
      )}
      <div className="course-detail-layout">
        <div className="course-main">
          <h1>{course.title}</h1>
          <p className="muted small">Course ID: {course.courseNumber ?? course._id}</p>
          <p className="muted">{course.description}</p>
          <p className="muted small">
            By {course.instructor?.name} • {course.duration} • {course.lessonsCount} lessons
          </p>
          <p className="muted small">
            Category: {course.category} • Level: {course.difficulty}
          </p>
          <p className="muted small">
            {course.ratingCount > 0
              ? `⭐ ${Number(course.ratingAvg || 0).toFixed(1)} average (${course.ratingCount} ratings)`
              : 'Not rated yet'}
          </p>

          <section className="card">
            <h3>Syllabus / What you will learn</h3>
            <ul className="list">
              {course.modules?.length > 0 ? (
                course.modules.flatMap(m => m.lessons).map((l, idx) => (
                  <li key={idx}><strong>{l.title}</strong>{l.description ? ` - ${l.description}` : ''}</li>
                ))
              ) : (
                course.content?.map((l, idx) => (
                  <li key={idx}><strong>{l.title}</strong>{l.description ? ` - ${l.description}` : ''}</li>
                ))
              )}
              {(!course.modules?.length && !course.content?.length) && <li>No curriculum available yet.</li>}
            </ul>
          </section>

          <section className="card">
            <h3>Student Reviews</h3>
            {user?.role === 'student' && (
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ marginBottom: 6 }}>{myReview ? 'Update your review' : 'Write a review'}</h4>
                {reviewStatus && <p className="muted small">{reviewStatus}</p>}
                {!isEnrolled && (
                  <div className="error" style={{ marginBottom: 10 }}>
                    You must be enrolled in this course to rate or review.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <label style={{ marginBottom: 0, minWidth: 160 }}>
                    Rating
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      disabled={!isEnrolled}
                    >
                      <option value={5}>5 ★</option>
                      <option value={4}>4 ★</option>
                      <option value={3}>3 ★</option>
                      <option value={2}>2 ★</option>
                      <option value={1}>1 ★</option>
                    </select>
                  </label>
                  <label style={{ marginBottom: 0, flex: 1, minWidth: 220 }}>
                    Comment (optional)
                    <input
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      disabled={!isEnrolled}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: 10 }}
                  disabled={!isEnrolled}
                  onClick={async () => {
                    setReviewStatus('');
                    try {
                      await api.post(`/courses/${id}/reviews`, {
                        rating: reviewRating,
                        comment: reviewComment
                      });
                      setReviewStatus('Thanks! Your review has been saved.');
                      loadReviews();
                      const updated = await api.get(`/courses/${id}`);
                      setCourse(updated.data);
                    } catch (err) {
                      setReviewStatus(err.response?.data?.message || 'Failed to submit review');
                    }
                  }}
                >
                  {myReview ? 'Update Review' : 'Submit Review'}
                </button>
                <p className="muted small" style={{ marginTop: 6 }}>
                  Reviews are available only for enrolled students.
                </p>
              </div>
            )}

            {reviews.length > 0 ? (
              <ul className="list">
                {reviews.map((r) => (
                  <li key={r._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <strong>{r.studentId?.name || 'Student'}</strong>
                      <span className="muted small">
                        ⭐ {Number(r.rating || 0).toFixed(1)} • {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <div className="small" style={{ marginTop: 6 }}>{r.comment}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">No reviews yet.</p>
            )}
          </section>
        </div>

        <aside className="course-sidebar card">
          <p className="price large">{isPaid ? `Rs ${course.price.toFixed(0)}` : 'Free'}</p>
          {error && <div className="error">{error}</div>}
          {user?.role === 'student' && (
            <>
              {isPaid ? (
                <Link to={`/courses/${id}/pay`} className="btn-primary full-width">
                  Proceed to Payment
                </Link>
              ) : (
                <button onClick={handleEnroll} className="btn-primary full-width">
                  Enroll for Free
                </button>
              )}
              <Link to={`/courses/${id}/player`} className="btn-secondary full-width">
                Preview Lessons
              </Link>
            </>
          )}
          {!user && (
            <p className="muted small">
              <Link to="/login">Login</Link> to enroll in this course.
            </p>
          )}
          <p className="muted small">Lifetime access • Certificate on completion</p>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetailPage;

