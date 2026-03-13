import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

const CoursePlayerPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [locked, setLocked] = useState(false);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);

  useEffect(() => {
    api
      .get(`/courses/${id}/lessons`)
      .then((res) => setCourse(res.data))
      .catch((err) => {
        if (err.response?.status === 403) {
          setLocked(true);
        }
      });
  }, [id]);

  if (locked) {
    return (
      <div className="page">
        <div className="card">
          <h2>Course Locked</h2>
          <p className="muted">
            You need to enroll in this course to access the lessons and materials.
          </p>
          <Link to={`/courses/${id}`} className="btn-primary">
            View course details
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page">
        <p>Loading course...</p>
      </div>
    );
  }

  const modules = course.modules || [];

  const getYouTubeId = (url) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '');
      }
      if (u.hostname.includes('youtube.com')) {
        if (u.searchParams.get('v')) return u.searchParams.get('v');
        if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1];
      }
    } catch {
      // ignore invalid URL
    }
    return null;
  };

  let current = null;
  if (modules.length > 0) {
    const mod = modules[activeModule] || modules[0];
    current = mod?.lessons?.[activeLesson];
  } else {
    // fallback to legacy flat content if modules not defined
    const content = course.content || [];
    current = content[activeLesson];
  }

  const renderSidebar = () => {
    if (modules.length > 0) {
      return (
        <aside className="player-sidebar card">
          <h4>Course Contents</h4>
          <ul className="list">
            {modules.map((m, mIndex) => (
              <li key={mIndex}>
                <strong>{m.title}</strong>
                <ul className="list">
                  {m.lessons?.map((l, lIndex) => (
                    <li
                      key={lIndex}
                      className={
                        mIndex === activeModule && lIndex === activeLesson ? 'active small' : 'small'
                      }
                      onClick={() => {
                        setActiveModule(mIndex);
                        setActiveLesson(lIndex);
                      }}
                    >
                      {l.title}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </aside>
      );
    }

    const content = course.content || [];
    return (
      <aside className="player-sidebar card">
        <h4>Course Contents</h4>
        <ul className="list">
          {content.map((item, index) => (
            <li
              key={index}
              className={index === activeLesson ? 'active' : ''}
              onClick={() => setActiveLesson(index)}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </aside>
    );
  };

  return (
    <div className="page">
      <h2>{course.title}</h2>
      <div className="player-layout">
        <div className="player-main card">
          {current ? (() => {
            const ytId = getYouTubeId(current.videoUrl);
            const ytEmbed = ytId ? `https://www.youtube.com/embed/${ytId}` : null;
            const ytWatch = ytId ? `https://www.youtube.com/watch?v=${ytId}` : current.videoUrl;
            const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

            return (
              <>
                <h3>{current.title}</h3>
                {ytEmbed && (
                  <div style={{ marginBottom: '10px' }}>
                    <iframe
                      className="video-player"
                      src={ytEmbed}
                      title={current.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {!ytEmbed && current.videoUrl && ytThumb && (
                  <div style={{ marginBottom: '10px' }}>
                    <img
                      src={ytThumb}
                      alt={current.title}
                      style={{ width: '100%', borderRadius: '0.75rem', marginBottom: '8px' }}
                    />
                    <a
                      href={ytWatch}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                    >
                      Open on YouTube
                    </a>
                  </div>
                )}
                {current.description && <p className="muted">{current.description}</p>}
                {current.notesUrl && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <a
                      href={current.notesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                    >
                      View File
                    </a>
                    <a
                      href={current.notesUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="btn-secondary"
                    >
                      Download
                    </a>
                  </div>
                )}
              </>
            );
          })() : (
            <p>No lessons added yet.</p>
          )}
        </div>
        {renderSidebar()}
      </div>
    </div>
  );
};

export default CoursePlayerPage;

