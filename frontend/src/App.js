import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/patients/PatientsPage';
import DoctorsPage from './pages/doctors/DoctorsPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import PrescriptionsPage from './pages/prescriptions/PrescriptionsPage';
import BillingPage from './pages/billing/BillingPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import UpdateProfilePage from './pages/profile/UpdateProfilePage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loadings...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="patients" element={<ProtectedRoute roles={['admin','doctor']}><PatientsPage /></ProtectedRoute>} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="profile" element={<UpdateProfilePage />} />
        <Route path="billing" element={<ProtectedRoute roles={['admin','patient']}><BillingPage /></ProtectedRoute>} />
      </Route>
      <Route path="manage-users" element={
        <ProtectedRoute roles={['admin']}>
          <ManageUsersPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </Router>
    </AuthProvider>
  );
}

export default App;