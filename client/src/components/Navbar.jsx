import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../../../logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
    api
      .get('/notifications/me')
      .then((res) => {
        setNotifications(res.data);
        const unread = res.data.filter((n) => !n.read).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, [user]);

  const toggleDropdown = () => {
    if (!user) return;
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 8000);
    return () => clearTimeout(t);
  }, [open]);

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => api.put(`/notifications/${n._id}/read`))
      );
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const markAsRead = async (id) => {
    const notif = notifications.find(n => n._id === id);
    if (notif && notif.read) return;
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const dismissNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const removed = notifications.find((n) => n._id === id);
      if (removed && !removed.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">
          <img src={logo} alt="SkillPathshala" className="nav-logo-img" />
          <span className="nav-logo-text">SkillPathshala</span>
        </Link>
      </div>
      <div className="nav-right">
        <Link to="/courses">Courses</Link>
        {user && (
          <button
            type="button"
            className="nav-bell"
            onClick={toggleDropdown}
            aria-label="Notifications"
          >
            <span className="nav-bell-icon" />
            {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>
        )}
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          </>
        )}
        {user && (
          <>
            {user.role === 'student' && <Link to="/student/dashboard">Student Dashboard</Link>}
            {user.role === 'instructor' && (
              <Link to="/instructor/dashboard">Instructor Dashboard</Link>
            )}
            {user.role === 'admin' && <Link to="/admin/dashboard">Admin Dashboard</Link>}
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </>
        )}
      </div>
      {user && open && (
        <div className="nav-dropdown">
          <div className="nav-dropdown-header">
            <button
              type="button"
              className="btn-small"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              style={{ background: 'transparent', border: 'none', fontSize: 18, lineHeight: 1 }}
            >
              &times;
            </button>
            <span style={{ marginLeft: 8 }}>Notifications</span>
            <button type="button" className="btn-small" onClick={markAllAsRead}>
              Mark all as read
            </button>
          </div>
          <ul className="list">
            {notifications.slice(0, 8).map((n) => (
              <li 
                key={n._id} 
                className={n.read ? 'muted small' : 'small'} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => markAsRead(n._id)}
              >
                <span>{n.message}</span>
                <button 
                  onClick={(e) => dismissNotification(n._id, e)} 
                  className="btn-small" 
                  style={{ background: 'transparent', color: 'red', border: 'none', padding: '0 5px', marginLeft: '10px' }}
                  title="Dismiss"
                >
                  &times;
                </button>
              </li>
            ))}
            {notifications.length === 0 && <p className="small">No notifications.</p>}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

