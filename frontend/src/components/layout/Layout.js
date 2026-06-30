import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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

const roleColors = {
  admin: '#7c3aed',
  doctor: '#0284c7',
  patient: '#059669'
};

const roleLabels = {
  admin: 'Administrator',
  doctor: 'Doctor',
  patient: 'Patient'
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navLinks = getNavLinks(user?.role);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = roleColors[user?.role] || '#059669';
  const roleLabel = roleLabels[user?.role] || 'User';

  return (
    <div className="app-layout">

      {/* Dark overlay - shows behind sidebar on mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ============ SIDEBAR ============ */}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🏥 MediCare HMS
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Hospital Management System
            </p>
          </div>

          {/* Close button - only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: 4,
              lineHeight: 1
            }}
            className="sidebar-close-btn"
          >
            ✕
          </button>
        </div>

        {/* User profile section */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div
            className="avatar"
            style={{
              background: roleColor + '20',
              color: roleColor,
              flexShrink: 0
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.name}
            </p>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: roleColor,
              background: roleColor + '20',
              padding: '2px 8px',
              borderRadius: 10,
              display: 'inline-block',
              marginTop: 2
            }}>
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
          <p style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
            padding: '12px 16px 4px'
          }}>
            Menu
          </p>

          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                {link.icon}
              </span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ============ LOGOUT BUTTON ============ */}
        {/* Always visible at bottom of sidebar */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0  // Never shrink - always visible
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fecaca';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fee2e2';
            }}
          >
            🚪 Logout
          </button>
        </div>

      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <div className="main-content">

        {/* Header */}
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            {/* Hamburger menu - only on mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="hamburger-btn"
              style={{
                display: 'none',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: 18,
                color: 'var(--text)',
                lineHeight: 1
              }}
            >
              ☰
            </button>

            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right side of header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                className="avatar avatar-sm"
                style={{ background: roleColor + '20', color: roleColor }}
              >
                {getInitials(user?.name)}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 500,
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.name}
              </span>
            </div>

            {/* Logout button in header for mobile */}
            <button
              onClick={handleLogout}
              className="header-logout-btn"
              style={{
                display: 'none',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;