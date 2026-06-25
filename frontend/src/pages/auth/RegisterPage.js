import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Always register as patient from public form
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      role: 'patient'   // FIXED: always patient, no choice
    });
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <h1>🏥 MediCare HMS</h1>
          <p>Hospital Management System</p>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Create Patient Account
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Register as a patient to book appointments
        </p>

        {/* Info box */}
        <div style={{
          background: '#e0f2fe', border: '1px solid #7dd3fc',
          borderRadius: 8, padding: '10px 14px',
          fontSize: 13, color: '#0369a1', marginBottom: 20
        }}>
          <strong>ℹ️ Note:</strong> Public registration is for <strong>patients only</strong>.
          Doctor and Admin accounts are created by the hospital administration.
        </div>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              name="name"
              className="form-control"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="form-error">⚠️ {errors.name}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="form-error">⚠️ {errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <p className="form-error">⚠️ {errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              name="confirmPassword"
              type="password"
              className="form-control"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="form-error">⚠️ {errors.confirmPassword}</p>}
          </div>

          {/* Role display - not selectable */}
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div style={{
              padding: '9px 12px', border: '1px solid var(--border)',
              borderRadius: 6, fontSize: 14, background: '#f8fafc',
              color: 'var(--text-secondary)', display: 'flex',
              alignItems: 'center', gap: 8
            }}>
              🧑 Patient
              <span style={{
                marginLeft: 'auto', fontSize: 11,
                background: '#d1fae5', color: '#065f46',
                padding: '2px 8px', borderRadius: 10, fontWeight: 600
              }}>
                Default
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Only patients can self-register. Contact admin for other account types.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? '⏳ Creating account...' : '✅ Create Patient Account'}
          </button>

        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>

        {/* Admin contact info */}
        <div style={{
          marginTop: 20, padding: '12px 16px',
          background: '#f8fafc', borderRadius: 8,
          border: '1px solid var(--border)', fontSize: 13,
          color: 'var(--text-secondary)', textAlign: 'center'
        }}>
          Are you a doctor or staff?{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Contact hospital admin to get your account
          </span>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;