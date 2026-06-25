import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const getNavLinks = (role) => {
  const all = {
    admin: [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
      { to: '/patients', icon: '🧑‍🤝‍🧑', label: 'Patients' },
      { to: '/doctors', icon: '👨‍⚕️', label: 'Doctors' },
      { to: '/appointments', icon: '📅', label: 'Appointments' },
      { to: '/prescriptions', icon: '💊', label: 'Prescriptions' },
      { to: '/billing', icon: '💳', label: 'Billing' },
      { to: '/manage-users', icon: '👥', label: 'Manage Users' }
    ],
    doctor: [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
      { to: '/patients', icon: '🧑‍🤝‍🧑', label: 'Patients' },
      { to: '/appointments', icon: '📅', label: 'Appointments' },
      { to: '/prescriptions', icon: '💊', label: 'Prescriptions' }
    ],
    patient: [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
      { to: '/profile', icon: '👤', label: 'My Profile' },
      { to: '/appointments', icon: '📅', label: 'My Appointments' },
      { to: '/prescriptions', icon: '💊', label: 'My Prescriptions' },
      { to: '/billing', icon: '💳', label: 'My Bills' },
      { to: '/doctors', icon: '👨‍⚕️', label: 'Find Doctors' }
    ]
  };
  return all[role] || all.patient;
};

const roleColors = { admin: '#7c3aed', doctor: '#0284c7', patient: '#059669' };
const roleLabels = { admin: 'Administrator', doctor: 'Doctor', patient: 'Patient' };

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navLinks = getNavLinks(user?.role);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🏥 MediCare HMS</h1>
          <p>Hospital Management System</p>
        </div>

        <div className="sidebar-user">
          <div className="avatar">{getInitials(user?.name)}</div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <span style={{ fontSize: 11, fontWeight: 600, color: roleColors[user?.role], background: roleColors[user?.role] + '20', padding: '2px 8px', borderRadius: 10 }}>
              {roleLabels[user?.role]}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section">Menu</p>
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>{link.icon}</span> {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{user?.name}</span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;