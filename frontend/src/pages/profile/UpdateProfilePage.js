import React, { useState, useEffect } from 'react';
import { authAPI, patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UpdateProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    allergies: ''
  });

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get logged in user's profile
        const res = await authAPI.getMe();
        const profile = res.data.profile;

        if (profile && profile._id) {
          setPatientId(profile._id);
          setForm({
            name: profile.name || user?.name || '',
            phone: profile.phone === '0000000000' ? '' : profile.phone || '',
            dateOfBirth: profile.dateOfBirth
              ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
              : '',
            gender: profile.gender || '',
            bloodGroup: profile.bloodGroup || '',
            street: profile.address?.street || '',
            city: profile.address?.city === 'Not set' ? '' : profile.address?.city || '',
            state: profile.address?.state === 'Not set' ? '' : profile.address?.state || '',
            pincode: profile.address?.pincode || '',
            emergencyName: profile.emergencyContact?.name || '',
            emergencyRelationship: profile.emergencyContact?.relationship || '',
            emergencyPhone: profile.emergencyContact?.phone || '',
            allergies: Array.isArray(profile.allergies)
              ? profile.allergies.join(', ')
              : ''
          });
        } else {
          toast.error('Profile not found. Please contact admin.');
        }
      } catch (err) {
        toast.error('Failed to load profile');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId) {
      return toast.error('Profile ID not found. Please refresh and try again.');
    }
    if (!form.phone.trim()) {
      return toast.error('Please enter your phone number');
    }
    if (!form.dateOfBirth) {
      return toast.error('Please enter your date of birth');
    }
    if (!form.gender) {
      return toast.error('Please select your gender');
    }
    if (!form.bloodGroup) {
      return toast.error('Please select your blood group');
    }
    if (!form.city.trim()) {
      return toast.error('Please enter your city');
    }
    if (!form.state.trim()) {
      return toast.error('Please enter your state');
    }

    setLoading(true);
    try {
      await patientAPI.update(patientId, {
        name: form.name,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode
        },
        emergencyContact: {
          name: form.emergencyName,
          relationship: form.emergencyRelationship,
          phone: form.emergencyPhone
        },
        allergies: form.allergies
          ? form.allergies.split(',').map(a => a.trim()).filter(Boolean)
          : []
      });

      toast.success('Profile updated successfully! ✅');

    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <h3>Profile Not Found</h3>
        <p>Your patient profile has not been created yet.</p>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
          Please contact the hospital admin to create your patient profile.
        </p>
      </div>
    );
  }

  // Check if profile is incomplete
  const isIncomplete =
    !form.phone ||
    form.phone === '0000000000' ||
    !form.city ||
    form.city === 'Not set' ||
    !form.dateOfBirth ||
    !form.gender ||
    !form.bloodGroup;

  // Profile completion percentage
  const fields = [
    form.name,
    form.phone && form.phone !== '0000000000',
    form.dateOfBirth,
    form.gender,
    form.bloodGroup,
    form.city && form.city !== 'Not set',
    form.state && form.state !== 'Not set',
    form.emergencyName
  ];
  const completed = fields.filter(Boolean).length;
  const percentage = Math.round((completed / fields.length) * 100);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Update your personal and medical information</p>
        </div>
      </div>

      {/* Incomplete warning */}
      {isIncomplete && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: 8,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 600, color: '#92400e', marginBottom: 2 }}>
              Please complete your profile
            </p>
            <p style={{ fontSize: 13, color: '#92400e' }}>
              Fill in all required fields marked with * to book appointments.
            </p>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: 20,
        alignItems: 'start'
      }}>

        {/* Left sidebar - Profile summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar card */}
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28, fontWeight: 700,
                margin: '0 auto 12px'
              }}>
                {(form.name || user?.name)?.charAt(0).toUpperCase()}
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                {form.name || user?.name}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
                {user?.email}
              </p>
              <span className="badge badge-success">🧑 Patient</span>
            </div>
          </div>

          {/* Completion card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: 14 }}>Profile Completion</h3>
            </div>
            <div className="card-body">
              {/* Progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  marginBottom: 6
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
                  <span style={{
                    fontWeight: 700,
                    color: percentage === 100 ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {percentage}%
                  </span>
                </div>
                <div style={{
                  height: 8,
                  background: 'var(--border)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: percentage === 100
                      ? 'var(--success)'
                      : percentage > 50
                        ? 'var(--primary)'
                        : 'var(--warning)',
                    borderRadius: 4,
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>

              {/* Field status */}
              {[
                { label: 'Name', done: !!form.name },
                { label: 'Phone', done: !!(form.phone && form.phone !== '0000000000') },
                { label: 'Date of Birth', done: !!form.dateOfBirth },
                { label: 'Gender', done: !!form.gender },
                { label: 'Blood Group', done: !!form.bloodGroup },
                { label: 'City', done: !!(form.city && form.city !== 'Not set') },
                { label: 'State', done: !!(form.state && form.state !== 'Not set') },
                { label: 'Emergency Contact', done: !!form.emergencyName }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 0',
                  borderBottom: i < 7 ? '1px solid var(--border)' : 'none',
                  fontSize: 13
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 16 }}>{item.done ? '✅' : '❌'}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right - Edit form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Edit My Profile</h3>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              * Required fields
            </span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>

              {/* Personal Information */}
              <p className="section-title">Personal Information</p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    name="phone"
                    className="form-control"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10 digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    className="form-control"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    className="form-control"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group *</label>
                  <select
                    name="bloodGroup"
                    className="form-control"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select blood group</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <input
                    name="allergies"
                    className="form-control"
                    value={form.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Penicillin, Dust (comma separated)"
                  />
                </div>
              </div>

              {/* Address */}
              <p className="section-title" style={{ marginTop: 8 }}>
                Address
              </p>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Street Address</label>
                  <input
                    name="street"
                    className="form-control"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="Door no, Street name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    name="city"
                    className="form-control"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Your city"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    name="state"
                    className="form-control"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Your state"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    name="pincode"
                    className="form-control"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6 digit pincode"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <p className="section-title" style={{ marginTop: 8 }}>
                Emergency Contact
              </p>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Contact Name</label>
                  <input
                    name="emergencyName"
                    className="form-control"
                    value={form.emergencyName}
                    onChange={handleChange}
                    placeholder="Contact person name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    name="emergencyRelationship"
                    className="form-control"
                    value={form.emergencyRelationship}
                    onChange={handleChange}
                    placeholder="e.g. Parent, Spouse"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    name="emergencyPhone"
                    className="form-control"
                    value={form.emergencyPhone}
                    onChange={handleChange}
                    placeholder="Emergency phone number"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Save button */}
              <div style={{ marginTop: 16 }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? '⏳ Saving...' : '💾 Save Profile'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpdateProfilePage;