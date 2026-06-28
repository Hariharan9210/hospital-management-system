import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

// Add this component before DashboardPage
const IncompleteProfileWarning = () => {
  const [isIncomplete, setIsIncomplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authAPI.getMe().then(res => {
      const profile = res.data.profile;
      if (!profile ||
          !profile.phone ||
          profile.phone === '0000000000' ||
          !profile.address?.city ||
          profile.address?.city === 'Not set') {
        setIsIncomplete(true);
      }
    }).catch(() => {});
  }, []);

  if (!isIncomplete) return null;

  return (
    <div style={{
      background: '#fef3c7',
      border: '1px solid #fcd34d',
      borderRadius: 8,
      padding: '14px 18px',
      marginBottom: 20,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div>
          <p style={{ fontWeight: 600, color: '#92400e' }}>
            Complete Your Profile
          </p>
          <p style={{ fontSize: 13, color: '#92400e' }}>
            Please update your profile details to book appointments.
          </p>
        </div>
      </div>
      <button
        className="btn btn-warning"
        onClick={() => navigate('/profile')}
        style={{ whiteSpace: 'nowrap' }}
      >
        Update Now →
      </button>
    </div>
  );
};


const DashboardPage = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      authAPI.getDashboardStats()
        .then(res => setStats(res.data.stats))
        .catch(err => console.error('Stats error:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const adminStats = stats ? [
    { icon: '🧑‍🤝‍🧑', label: 'Total Patients', value: stats.totalPatients, color: 'blue', path: '/patients' },
    { icon: '👨‍⚕️', label: 'Total Doctors', value: stats.totalDoctors, color: 'green', path: '/doctors' },
    { icon: '📅', label: 'Total Appointments', value: stats.totalAppointments, color: 'purple', path: '/appointments' },
    { icon: '📆', label: "Today's Appointments", value: stats.todayAppointments, color: 'orange', path: '/appointments' },
    { icon: '⏳', label: 'Pending Bills', value: stats.pendingBills, color: 'red', path: '/billing' },
    { icon: '💰', label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: 'green', path: '/billing' }
  ] : [];

  const getRoleColor = (role) => {
    if (role === 'admin') return '#7c3aed';
    if (role === 'doctor') return '#0284c7';
    return '#059669';
  };

  const getRoleIcon = (role) => {
    if (role === 'admin') return '👑';
    if (role === 'doctor') return '👨‍⚕️';
    return '🧑';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {getRoleIcon(user?.role)} Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name}</strong>! Here is your overview.
          </p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>
          <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Add this inside the return, after page-header div, for patients */}
      {isPatient && (
        <IncompleteProfileWarning />
      )}

      {/* Admin Stats Cards */}
      {isAdmin && (
        loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard statistics...</p>
          </div>
        ) : (
          <div className="stats-grid">
            {adminStats.map((card, i) => (
              <div
                key={i}
                className="stat-card"
                onClick={() => navigate(card.path)}
                style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                <div className="stat-info">
                  <h3>{card.value}</h3>
                  <p>{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        {/* Profile Card - Works for ALL roles */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👤 My Profile</h3>
          </div>
          <div className="card-body">
            {/* Avatar and name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: getRoleColor(user?.role) + '20',
                color: getRoleColor(user?.role),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700, flexShrink: 0
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</p>
                <span style={{
                  display: 'inline-block', marginTop: 4,
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: getRoleColor(user?.role),
                  background: getRoleColor(user?.role) + '20',
                  padding: '3px 10px', borderRadius: 20
                }}>
                  {getRoleIcon(user?.role)} {user?.role}
                </span>
              </div>
            </div>

            {/* Profile details */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                  <span style={{ fontWeight: 500 }}>{user?.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Role</span>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{user?.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>User ID</span>
                  <span style={{ fontWeight: 500, fontSize: 12, fontFamily: 'monospace' }}>
                    {user?.id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Account Status</span>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Admin Actions */}
              {isAdmin && (
                <>
                  <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/patients')}>
                    🧑‍🤝‍🧑 Manage Patients
                  </button>
                  <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/doctors')}>
                    👨‍⚕️ Manage Doctors
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/appointments')}>
                    📅 View All Appointments
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/billing')}>
                    💳 Manage Billing
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/prescriptions')}>
                    💊 View Prescriptions
                  </button>
                </>
              )}

              {/* Doctor Actions */}
              {isDoctor && (
                <>
                  <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/appointments')}>
                    📅 My Appointments
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/patients')}>
                    🧑‍🤝‍🧑 View Patients
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/prescriptions')}>
                    💊 My Prescriptions
                  </button>
                </>
              )}
              

              {/* Patient Actions */}
              {isPatient && (
                <>
                  <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/appointments')}>
                    📅 Book Appointment
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/doctors')}>
                    👨‍⚕️ Find a Doctor
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/prescriptions')}>
                    💊 My Prescriptions
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/billing')}>
                    💳 My Bills
                  </button>
                </>
              )}

            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 How to Use</h3>
          </div>
          <div className="card-body">
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {isAdmin && [
                { icon: '1️⃣', text: 'Go to Patients → Add Patient to register a new patient' },
                { icon: '2️⃣', text: 'Go to Doctors → Add Doctor to register a new doctor' },
                { icon: '3️⃣', text: 'Go to Appointments → Book Appointment' },
                { icon: '4️⃣', text: 'Go to Billing → Generate Bill after appointment' },
                { icon: '5️⃣', text: 'Go to Prescriptions → Create Prescription for a patient' }
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, alignItems: 'flex-start' }}>
                  <span>{tip.icon}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{tip.text}</span>
                </li>
              ))}

              {isDoctor && [
                { icon: '1️⃣', text: 'Check your appointments for today' },
                { icon: '2️⃣', text: 'Confirm or complete appointments' },
                { icon: '3️⃣', text: 'Create prescriptions for patients' },
                { icon: '4️⃣', text: 'View patient medical history' }
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, alignItems: 'flex-start' }}>
                  <span>{tip.icon}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{tip.text}</span>
                </li>
              ))}

              {isPatient && [
                { icon: '1️⃣', text: 'Find a doctor from the Doctors page' },
                { icon: '2️⃣', text: 'Book an appointment with your doctor' },
                { icon: '3️⃣', text: 'View your prescriptions after your visit' },
                { icon: '4️⃣', text: 'Check your bills from the Billing page' }
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, alignItems: 'flex-start' }}>
                  <span>{tip.icon}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{tip.text}</span>
                </li>
              ))}

            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;