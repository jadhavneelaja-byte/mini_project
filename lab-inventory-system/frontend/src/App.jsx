import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, NotificationContainer } from './contexts/NotificationContext';
import Login from './components/Login';
import LabSelection from './components/LabSelection';
import StudentLabView from './components/StudentLabView';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import Sidebar from './components/Sidebar';
import QRScanner from './components/QRScanner';

const AppContent = () => {
  const { user, login } = useAuth();

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student'} replace />} />
          <Route path="/student" element={user.role === 'student' ? <LabSelection /> : <Navigate to="/" replace />} />
          <Route path="/student/lab/:labName" element={user.role === 'student' ? <StudentLabView /> : <Navigate to="/" replace />} />
          <Route path="/qr-scanner" element={user.role === 'student' ? <QRScanner /> : <Navigate to="/" replace />} />
          <Route path="/admin" element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
          <Route path="/teacher" element={user.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student'} replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
          <NotificationContainer />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;