import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const emptyLesson = { title: '', videoUrl: '', notesUrl: '', description: '' };

const InstructorCourseManagePage = () => {
  const { id } = useParams(); // courseId
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    fileUrl: ''
  });
  const [announcement, setAnnouncement] = useState('');
  const [message, setMessage] = useState('');

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  };

  useEffect(() => {
    api
      .get(`/courses/${id}/lessons`)
      .then((res) => {
        setCourse(res.data);
        setModules(res.data.modules || []);
      })
      .catch(() => {});

    api
      .get(`/assignments/course/${id}`)
      .then((res) => setAssignments(res.data))
      .catch(() => {});
  }, [id]);

  const addModule = () => {
    setModules([...modules, { title: 'New Module', order: modules.length, lessons: [emptyLesson] }]);
  };

  const addLesson = (mIndex) => {
    const copy = modules.slice();
    copy[mIndex].lessons = [...(copy[mIndex].lessons || []), emptyLesson];
    setModules(copy);
  };

  const updateLessonField = (mIndex, lIndex, field, value) => {
    const copy = modules.slice();
    copy[mIndex].lessons[lIndex] = { ...copy[mIndex].lessons[lIndex], [field]: value };
    setModules(copy);
  };

  const removeModule = (mIndex) => {
    if(!window.confirm('Delete this entire module?')) return;
    const copy = modules.slice();
    copy.splice(mIndex, 1);
    setModules(copy);
  };

  const removeLesson = (mIndex, lIndex) => {
    if(!window.confirm('Delete this lesson?')) return;
    const copy = modules.slice();
    copy[mIndex].lessons.splice(lIndex, 1);
    setModules(copy);
  };

  const deleteCourse = async () => {
    if (!window.confirm('Are you sure you want to completely delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      window.location.href = '/instructor/dashboard';
    } catch {
      setMessage('Failed to delete course.');
    }
  };

  const saveContent = async () => {
    try {
      const lessonsCount = modules.reduce(
        (sum, m) => sum + (m.lessons ? m.lessons.length : 0),
        0
      );
      await api.put(`/courses/${id}`, { modules, lessonsCount });
      setMessage('Course content saved.');
    } catch {
      setMessage('Failed to save content.');
    }
  };

  const createAssignment = async () => {
    try {
      const body = {
        courseId: id,
        title: newAssignment.title,
        description: newAssignment.description,
        dueDate: newAssignment.dueDate,
        fileUrl: newAssignment.fileUrl
      };
      const res = await api.post('/assignments', body);
      setAssignments([...assignments, res.data]);
      setNewAssignment({ title: '', description: '', dueDate: '', fileUrl: '' });
      setMessage('Assignment created.');
    } catch {
      setMessage('Failed to create assignment.');
    }
  };

  const loadSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissions([]);
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(res.data);
    } catch {
      setMessage('Failed to load submissions.');
    }
  };

  const gradeSubmission = async (submissionId, grade, feedback) => {
    try {
      const res = await api.put(`/assignments/submissions/${submissionId}/grade`, {
        grade,
        feedback
      });
      setSubmissions((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
      setMessage('Grade saved and student notified.');
    } catch {
      setMessage('Failed to grade submission.');
    }
  };

  const sendAnnouncement = async () => {
    if (!announcement.trim()) return;
    try {
      await api.post('/notifications/announce', { courseId: id, message: announcement });
      setAnnouncement('');
      setMessage('Announcement sent to enrolled students.');
    } catch {
      setMessage('Failed to send announcement.');
    }
  };

  if (!course) {
    return (
      <div className="page">
        <p>Loading course...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manage Course: {course.title}</h2>
        <button className="btn-small" style={{ background: 'transparent', color: 'red', border: '1px solid red' }} onClick={deleteCourse}>Delete Course</button>
      </div>
      {message && <p className="muted small">{message}</p>}

      <section className="grid-2">
        <div>
          <h3>Lessons</h3>
          <div className="card">
            <button className="btn-secondary" style={{ marginBottom: '15px' }} type="button" onClick={addModule}>
              Add Module
            </button>
            {modules.map((m, mIndex) => (
              <div key={mIndex} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <input
                    placeholder="Module Title"
                    value={m.title || ''}
                    onChange={(e) => {
                      const copy = modules.slice();
                      copy[mIndex].title = e.target.value;
                      setModules(copy);
                    }}
                    style={{ fontWeight: 'bold', fontSize: '16px', border: 'none', borderBottom: '1px solid #ccc', padding: '5px', flex: 1 }}
                  />
                  <button className="btn-small" style={{ color: 'red', background: 'transparent', border: 'none', fontSize: '18px' }} onClick={() => removeModule(mIndex)} title="Delete Module">&times;</button>
                </div>
                <button
                  className="btn-small btn-secondary"
                  style={{ marginTop: '10px', marginBottom: '10px' }}
                  type="button"
                  onClick={() => addLesson(mIndex)}
                >
                  Add Lesson
                </button>
                {(m.lessons || []).map((l, lIndex) => (
                  <div key={lIndex} className="card" style={{ position: 'relative' }}>
                    <button className="btn-small" style={{ position: 'absolute', top: '10px', right: '10px', color: 'red', background: 'transparent', border: 'none', fontSize: '18px' }} onClick={() => removeLesson(mIndex, lIndex)} title="Delete Lesson">&times;</button>
                    <input
                      placeholder="Lesson title"
                      value={l.title || ''}
                      onChange={(e) =>
                        updateLessonField(mIndex, lIndex, 'title', e.target.value)
                      }
                    />
                    <input
                      placeholder="YouTube URL (optional)"
                      value={l.videoUrl || ''}
                      onChange={(e) =>
                        updateLessonField(mIndex, lIndex, 'videoUrl', e.target.value)
                      }
                    />
                    <div>
                      <label style={{ fontSize: '12px', color: '#666' }}>Choose File (PDF/Video):</label>
                      <input
                        type="file"
                        accept="application/pdf,video/*"
                        onChange={async (e) => {
                          if (!e.target.files || !e.target.files[0]) return;
                          const url = await uploadFile(e.target.files[0]);
                          updateLessonField(mIndex, lIndex, 'notesUrl', url);
                        }}
                      />
                      {l.notesUrl && (
                        <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', gap: '6px' }}>
                          <a href={l.notesUrl} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                          <span>|</span>
                          <a href={l.notesUrl} target="_blank" rel="noopener noreferrer" download>
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                    <textarea
                      placeholder="Short description"
                      value={l.description || ''}
                      onChange={(e) =>
                        updateLessonField(mIndex, lIndex, 'description', e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
            <button className="btn-primary" type="button" onClick={saveContent}>
              Save Content
            </button>
          </div>
        </div>

        <div>
          <h3>Assignments & Announcements</h3>
          <div className="card">
            <h4>Create Assignment</h4>
            <input
              placeholder="Title"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={newAssignment.description}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, description: e.target.value })
              }
            />
            <input
              type="date"
              value={newAssignment.dueDate}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, dueDate: e.target.value })
              }
            />
            <div style={{ padding: '10px 0' }}>
              <label style={{ fontSize: '12px', color: '#666', display: 'block' }}>Upload Assignment File (Optional):</label>
              <input
                type="file"
                onChange={async (e) => {
                  if (!e.target.files || !e.target.files[0]) return;
                  const url = await uploadFile(e.target.files[0]);
                  setNewAssignment({ ...newAssignment, fileUrl: url });
                }}
              />
              {newAssignment.fileUrl && (
                <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', gap: '6px' }}>
                  <a href={newAssignment.fileUrl} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                  <span>|</span>
                  <a href={newAssignment.fileUrl} target="_blank" rel="noopener noreferrer" download>
                    Download
                  </a>
                </div>
              )}
            </div>
            <button className="btn-primary" type="button" onClick={createAssignment}>
              Create Assignment
            </button>
          </div>

          <div className="card">
            <h4>Assignments</h4>
            <ul className="list">
              {assignments.map((a) => (
                <li key={a._id} onClick={() => loadSubmissions(a)} style={{ cursor: 'pointer' }}>
                  <div><strong>{a.title}</strong></div>
                  <div className="muted small" style={{ display: 'flex', gap: '15px' }}>
                    <span>Created: {new Date(a.createdAt).toLocaleDateString()}</span>
                    <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
              {assignments.length === 0 && <p className="small">No assignments yet.</p>}
            </ul>
            {selectedAssignment && (
              <>
                <h5>Submissions for {selectedAssignment.title}</h5>
                <ul className="list">
                  {submissions.map((s) => (
                    <li key={s._id} style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>{s.studentId?.name}</strong> ({s.studentId?.email})</span>
                        <span>Current Grade: {s.grade != null ? s.grade : 'Not graded'}</span>
                      </div>
                      {s.fileUrl && (
                        <div style={{ fontSize: '14px', display: 'flex', gap: '6px' }}>
                          <a href={s.fileUrl} target="_blank" rel="noopener noreferrer">
                            View Submitted File
                          </a>
                          <span>|</span>
                          <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" download>
                            Download
                          </a>
                        </div>
                      )}
                      {s.answers && (
                        <div style={{ fontSize: '14px', background: '#f5f5f5', padding: '5px' }}>
                          <strong>Text Submission:</strong> {typeof s.answers === 'string' ? s.answers : JSON.stringify(s.answers)}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <input
                          id={`grade-${s._id}`}
                          type="number"
                          placeholder="Grade (0-100)"
                          style={{ width: '100px', padding: '5px' }}
                          defaultValue={s.grade || ''}
                        />
                        <input
                          id={`feedback-${s._id}`}
                          type="text"
                          placeholder="Feedback/Comments"
                          style={{ flex: 1, padding: '5px' }}
                          defaultValue={s.feedback || ''}
                        />
                        <button
                          type="button"
                          className="btn-small btn-primary"
                          onClick={() => {
                            const gUrl = document.getElementById(`grade-${s._id}`).value;
                            const fUrl = document.getElementById(`feedback-${s._id}`).value;
                            gradeSubmission(s._id, Number(gUrl), fUrl);
                          }}
                        >
                          Submit Grade
                        </button>
                      </div>
                    </li>
                  ))}
                  {submissions.length === 0 && (
                    <p className="small">No submissions yet.</p>
                  )}
                </ul>
              </>
            )}
          </div>

          <div className="card">
            <h4>Announcements</h4>
            <textarea
              placeholder="Write an announcement to all enrolled students"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
            />
            <button className="btn-secondary" type="button" onClick={sendAnnouncement}>
              Send Announcement
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstructorCourseManagePage;

