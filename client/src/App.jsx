import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import AssignmentPage from './pages/AssignmentPage';
import PaymentPage from './pages/PaymentPage';
import CertificatePage from './pages/CertificatePage';
import AdminManagementPage from './pages/AdminManagementPage';
import InstructorProfilePage from './pages/InstructorProfilePage';
import InstructorCourseManagePage from './pages/InstructorCourseManagePage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route
            path="/courses/:id/player"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CoursePlayerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/assignments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AssignmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/pay"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CertificatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminManagementPage />
              </ProtectedRoute>
            }
          />
          <Route path="/instructors/:id" element={<InstructorProfilePage />} />
          <Route
            path="/instructor/courses/:id/manage"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorCourseManagePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;

