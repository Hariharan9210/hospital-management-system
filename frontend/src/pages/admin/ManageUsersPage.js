import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI, doctorAPI, patientAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ManageUsersPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // If not admin, redirect away
  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Manage Users</h1>
          <p className="page-subtitle">Create new admin, doctor or patient accounts</p>
        </div>
      </div>

      {/* 3 cards side by side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20
      }}>
        <CreateAdminCard />
        <CreateDoctorCard />
        <CreatePatientCard />
      </div>
    </div>
  );
};

// ============================================
// CREATE ADMIN CARD
// ============================================
const CreateAdminCard = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.email.trim()) err.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Enter valid email';
    if (!form.password) err.password = 'Password is required';
    if (form.password.length < 6) err.password = 'Minimum 6 characters';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }

    setLoading(true);
    try {
      // Admin uses the protected admin endpoint
      await authAPI.adminCreateUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'admin'
      });
      toast.success(`Admin account created for ${form.name}!`);
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header" style={{ background: '#f5f3ff' }}>
        <div>
          <h3 className="card-title">👑 Create Admin</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Full system access
          </p>
        </div>
        <span className="badge badge-purple">Admin</span>
      </div>
      <div className="card-body">

        {/* Warning */}
        <div style={{
          background: '#fef3c7', border: '1px solid #fcd34d',
          borderRadius: 8, padding: '10px 14px',
          fontSize: 13, color: '#92400e', marginBottom: 16
        }}>
          ⚠️ <strong>Warning:</strong> Admin accounts have full access to all data.
          Only create for trusted staff.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              name="name"
              className="form-control"
              placeholder="Admin full name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="form-error">⚠️ {errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="admin@hospital.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="form-error">⚠️ {errors.email}</p>}
          </div>

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

          {/* Permissions info */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              ADMIN PERMISSIONS
            </p>
            {[
              'Create, edit, delete patients and doctors',
              'View all appointments and billing',
              'Generate and manage bills',
              'Create prescriptions',
              'Create other user accounts'
            ].map((p, i) => (
              <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 6, marginBottom: 4 }}>
                <span style={{ color: '#7c3aed' }}>✓</span> {p}
              </p>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-lg"
            disabled={loading}
            style={{ background: '#7c3aed', color: 'white', width: '100%', justifyContent: 'center' }}
          >
            {loading ? '⏳ Creating...' : '👑 Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================
// CREATE DOCTOR CARD
// ============================================
const CreateDoctorCard = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', department: '', qualification: '',
    experience: '', licenseNumber: '', consultationFee: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 2 step form

  const SPECIALIZATIONS = [
    'General Medicine', 'Cardiology', 'Dermatology',
    'Orthopedics', 'Pediatrics', 'Gynecology',
    'Neurology', 'Ophthalmology', 'ENT', 'Psychiatry',
    'Radiology', 'Oncology', 'Urology', 'Nephrology',
    'Gastroenterology'
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateStep1 = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.email.trim()) err.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Enter valid email';
    if (!form.password) err.password = 'Password is required';
    if (form.password.length < 6) err.password = 'Minimum 6 characters';
    if (!form.phone.trim()) err.phone = 'Phone is required';
    return err;
  };

  const validateStep2 = () => {
    const err = {};
    if (!form.specialization) err.specialization = 'Required';
    if (!form.department.trim()) err.department = 'Required';
    if (!form.qualification.trim()) err.qualification = 'Required';
    if (!form.experience) err.experience = 'Required';
    if (!form.licenseNumber.trim()) err.licenseNumber = 'Required';
    if (!form.consultationFee) err.consultationFee = 'Required';
    return err;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (Object.keys(err).length > 0) { setErrors(err); return; }

    setLoading(true);
    try {
      await doctorAPI.create({
        name: form.name,
        email: form.email,
        password: form.password || 'Doctor@123',
        phone: form.phone,
        specialization: form.specialization,
        department: form.department,
        qualification: form.qualification,
        experience: Number(form.experience),
        licenseNumber: form.licenseNumber,
        consultationFee: Number(form.consultationFee)
      });
      toast.success(`Dr. ${form.name} account created!`);
      setForm({
        name: '', email: '', password: '', phone: '',
        specialization: '', department: '', qualification: '',
        experience: '', licenseNumber: '', consultationFee: ''
      });
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header" style={{ background: '#eff6ff' }}>
        <div>
          <h3 className="card-title">👨‍⚕️ Create Doctor</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Doctor profile + login account
          </p>
        </div>
        <span className="badge badge-info">Doctor</span>
      </div>
      <div className="card-body">

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step >= s ? 'var(--primary)' : 'var(--border)',
                color: step >= s ? 'white' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700
              }}>
                {s}
              </div>
              <span style={{ fontSize: 12, color: step >= s ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: step === s ? 600 : 400 }}>
                {s === 1 ? 'Login Info' : 'Medical Info'}
              </span>
              {s < 2 && <span style={{ color: 'var(--border)', margin: '0 4px' }}>→</span>}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* Step 1 - Login Info */}
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input name="name" className="form-control" placeholder="Dr. Full Name" value={form.name} onChange={handleChange} />
                {errors.name && <p className="form-error">⚠️ {errors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input name="email" type="email" className="form-control" placeholder="doctor@hospital.com" value={form.email} onChange={handleChange} />
                {errors.email && <p className="form-error">⚠️ {errors.email}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input name="password" type="password" className="form-control" placeholder="Default: Doctor@123" value={form.password} onChange={handleChange} />
                {errors.password && <p className="form-error">⚠️ {errors.password}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input name="phone" className="form-control" placeholder="10 digit number" value={form.phone} onChange={handleChange} />
                {errors.phone && <p className="form-error">⚠️ {errors.phone}</p>}
              </div>
              <button type="button" className="btn btn-primary btn-lg" onClick={handleNext}>
                Next → Medical Info
              </button>
            </>
          )}

          {/* Step 2 - Medical Info */}
          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <select name="specialization" className="form-control" value={form.specialization} onChange={handleChange}>
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.specialization && <p className="form-error">⚠️ {errors.specialization}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <input name="department" className="form-control" placeholder="e.g. Cardiology" value={form.department} onChange={handleChange} />
                {errors.department && <p className="form-error">⚠️ {errors.department}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Qualification *</label>
                <input name="qualification" className="form-control" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={handleChange} />
                {errors.qualification && <p className="form-error">⚠️ {errors.qualification}</p>}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Experience (years) *</label>
                  <input name="experience" type="number" className="form-control" placeholder="Years" value={form.experience} onChange={handleChange} min="0" />
                  {errors.experience && <p className="form-error">⚠️ {errors.experience}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee ₹ *</label>
                  <input name="consultationFee" type="number" className="form-control" placeholder="Amount" value={form.consultationFee} onChange={handleChange} min="0" />
                  {errors.consultationFee && <p className="form-error">⚠️ {errors.consultationFee}</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">License Number *</label>
                <input name="licenseNumber" className="form-control" placeholder="Medical license number" value={form.licenseNumber} onChange={handleChange} />
                {errors.licenseNumber && <p className="form-error">⚠️ {errors.licenseNumber}</p>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? '⏳ Creating...' : '👨‍⚕️ Create Doctor Account'}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};

// ============================================
// CREATE PATIENT CARD
// ============================================
const CreatePatientCard = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    dateOfBirth: '', gender: '', bloodGroup: '',
    city: '', state: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.email.trim()) err.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Enter valid email';
    if (!form.phone.trim()) err.phone = 'Phone is required';
    if (!form.dateOfBirth) err.dateOfBirth = 'Date of birth is required';
    if (!form.gender) err.gender = 'Gender is required';
    if (!form.bloodGroup) err.bloodGroup = 'Blood group is required';
    if (!form.city.trim()) err.city = 'City is required';
    if (!form.state.trim()) err.state = 'State is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }

    setLoading(true);
    try {
      await patientAPI.create({
        name: form.name,
        email: form.email,
        password: form.password || 'Patient@123',
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: { city: form.city, state: form.state }
      });
      toast.success(`Patient ${form.name} created!`);
      setForm({
        name: '', email: '', password: '', phone: '',
        dateOfBirth: '', gender: '', bloodGroup: '',
        city: '', state: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header" style={{ background: '#f0fdf4' }}>
        <div>
          <h3 className="card-title">🧑 Create Patient</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Patient profile + login account
          </p>
        </div>
        <span className="badge badge-success">Patient</span>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" className="form-control" placeholder="Patient name" value={form.name} onChange={handleChange} />
              {errors.name && <p className="form-error">⚠️ {errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" className="form-control" placeholder="patient@gmail.com" value={form.email} onChange={handleChange} />
              {errors.email && <p className="form-error">⚠️ {errors.email}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" placeholder="Default: Patient@123" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input name="phone" className="form-control" placeholder="10 digit number" value={form.phone} onChange={handleChange} />
              {errors.phone && <p className="form-error">⚠️ {errors.phone}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input name="dateOfBirth" type="date" className="form-control" value={form.dateOfBirth} onChange={handleChange} />
              {errors.dateOfBirth && <p className="form-error">⚠️ {errors.dateOfBirth}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="form-error">⚠️ {errors.gender}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select name="bloodGroup" className="form-control" value={form.bloodGroup} onChange={handleChange}>
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                  <option key={bg}>{bg}</option>
                ))}
              </select>
              {errors.bloodGroup && <p className="form-error">⚠️ {errors.bloodGroup}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input name="city" className="form-control" placeholder="City" value={form.city} onChange={handleChange} />
              {errors.city && <p className="form-error">⚠️ {errors.city}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input name="state" className="form-control" placeholder="State" value={form.state} onChange={handleChange} />
              {errors.state && <p className="form-error">⚠️ {errors.state}</p>}
            </div>
          </div>

          <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
            {loading ? '⏳ Creating...' : '🧑 Create Patient Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageUsersPage;