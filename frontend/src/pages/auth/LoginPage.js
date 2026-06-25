import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@hospital.com', password: 'Admin@123' },
      doctor: { email: 'arjun@hospital.com', password: 'Doctor@123' },
      patient: { email: 'ravi@gmail.com', password: 'Patient@123' }
    };
    setForm(creds[role]);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🏥 MediCare HMS</h1>
          <p>Hospital Management System</p>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Sign in to your account</p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 6, fontSize: 14, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" className="form-control" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-control" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Login (Demo)</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['admin', 'doctor', 'patient'].map(role => (
              <button key={role} type="button" onClick={() => fillDemo(role)}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
                {role === 'admin' ? '👑' : role === 'doctor' ? '👨‍⚕️' : '🧑'} {role}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;