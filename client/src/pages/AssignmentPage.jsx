import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const AssignmentPage = () => {
  const { id } = useParams(); // courseId
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState('');
  const [message, setMessage] = useState('');
  const [mySubmission, setMySubmission] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

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
      .get(`/assignments/course/${id}`)
      .then((res) => setAssignments(res.data))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!selected) {
      setMySubmission(null);
      return;
    }
    api
      .get(`/assignments/${selected._id}/submissions/me`)
      .then((res) => setMySubmission(res.data))
      .catch(() => {});
  }, [selected]);

  const submit = async () => {
    if (!selected) return;
    setMessage('');
    try {
      await api.post(`/assignments/${selected._id}/submissions`, {
        answers,
        fileUrl
      });
      setMessage('Submitted successfully.');
      const res = await api.get(`/assignments/${selected._id}/submissions/me`);
      setMySubmission(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="page">
      <h2>Assignments</h2>
      <div className="grid-2">
        <div>
          <h3>List</h3>
          <ul className="list">
            {assignments.map((a) => (
              <li
                key={a._id}
                className={selected?._id === a._id ? 'active' : ''}
                onClick={() => setSelected(a)}
              >
                {a.title}{' '}
                <span className="muted">
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </span>
              </li>
            ))}
            {assignments.length === 0 && <p>No assignments yet.</p>}
          </ul>
        </div>
        <div>
          <h3>Submission</h3>
          {selected ? (
            <div className="card">
              <h4>Submitting for: {selected.title}</h4>
              {selected.description && <p className="muted">{selected.description}</p>}
              {selected.fileUrl && (
                <div style={{ marginBottom: '15px', display: 'flex', gap: '8px' }}>
                  <a
                    href={selected.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                  >
                    View File
                  </a>
                  <a
                    href={selected.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="btn-secondary"
                  >
                    Download
                  </a>
                </div>
              )}
              {mySubmission && (
                <p className="muted small">
                  Status: submitted • Grade:{' '}
                  {mySubmission.grade != null ? mySubmission.grade : 'Pending'}{' '}
                  {mySubmission.feedback && `• Feedback: ${mySubmission.feedback}`}
                </p>
              )}
              {mySubmission?.fileUrl && (
                <p className="muted small">
                  Submitted file:{' '}
                  <a href={mySubmission.fileUrl} target="_blank" rel="noreferrer">
                    View
                  </a>{' '}
                  |{' '}
                  <a href={mySubmission.fileUrl} target="_blank" rel="noreferrer" download>
                    Download
                  </a>
                </p>
              )}
              {selected.dueDate && new Date() > new Date(selected.dueDate) ? (
                <p style={{ color: 'red', marginTop: '10px' }}>
                  Submission closed. Due date has passed.
                </p>
              ) : (
                <>
                  <input
                    type="file"
                    onChange={async (e) => {
                      if (!e.target.files || !e.target.files[0]) return;
                      const url = await uploadFile(e.target.files[0]);
                      setFileUrl(url);
                    }}
                  />
                  <textarea
                    rows={6}
                    value={answers}
                    onChange={(e) => setAnswers(e.target.value)}
                    placeholder="Write your answers or paste link to file"
                  />
                  <button onClick={submit} className="btn-primary">
                    Submit
                  </button>
                </>
              )}
              {message && <p>{message}</p>}
            </div>
          ) : (
            <p>Select an assignment to submit.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;

