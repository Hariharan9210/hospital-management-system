import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Dermatology',
  'Orthopedics', 'Pediatrics', 'Gynecology',
  'Neurology', 'Ophthalmology', 'ENT', 'Psychiatry',
  'Radiology', 'Oncology', 'Urology', 'Nephrology',
  'Gastroenterology'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EditDoctorModal = ({ isOpen, onClose, onSuccess, doctor }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    department: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    consultationFee: '',
    bio: ''
  });
  const [availability, setAvailability] = useState(
    DAYS.map(day => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: false
    }))
  );

  // Fill form when doctor loads
  useEffect(() => {
    if (doctor) {
      setForm({
        name: doctor.name || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        department: doctor.department || '',
        qualification: doctor.qualification || '',
        experience: doctor.experience || '',
        licenseNumber: doctor.licenseNumber || '',
        consultationFee: doctor.consultationFee || '',
        bio: doctor.bio || ''
      });

      // Fill availability
      if (doctor.availability && doctor.availability.length > 0) {
        setAvailability(
          DAYS.map(day => {
            const existing = doctor.availability.find(a => a.day === day);
            return existing
              ? { ...existing }
              : { day, startTime: '09:00', endTime: '17:00', isAvailable: false };
          })
        );
      }

      setActiveTab('basic');
    }
  }, [doctor]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.phone.trim()) return toast.error('Phone is required');
    if (!form.specialization) return toast.error('Specialization is required');
    if (!form.department.trim()) return toast.error('Department is required');
    if (!form.qualification.trim()) return toast.error('Qualification is required');
    if (!form.experience) return toast.error('Experience is required');
    if (!form.licenseNumber.trim()) return toast.error('License number is required');
    if (!form.consultationFee) return toast.error('Consultation fee is required');

    setLoading(true);
    try {
      await doctorAPI.update(doctor._id, {
        name: form.name,
        phone: form.phone,
        specialization: form.specialization,
        department: form.department,
        qualification: form.qualification,
        experience: Number(form.experience),
        licenseNumber: form.licenseNumber,
        consultationFee: Number(form.consultationFee),
        bio: form.bio,
        availability: availability.filter(a => a.isAvailable)
      });

      toast.success(`Dr. ${form.name} updated successfully!`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`✏️ Edit Doctor — ${doctor?.name || ''}`}
      size="modal-lg"
    >
      <form onSubmit={handleSubmit}>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid var(--border)', display: 'flex' }}>
          {[
            { key: 'basic', label: '👤 Basic Info' },
            { key: 'medical', label: '🏥 Medical Info' },
            { key: 'availability', label: '📅 Availability' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
                marginBottom: -2,
                color: activeTab === tab.key
                  ? 'var(--primary)'
                  : 'var(--text-secondary)',
                fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-body">

          {/* Tab 1 - Basic Info */}
          {activeTab === 'basic' && (
            <>
              {/* Doctor ID info */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 20,
                fontSize: 13,
                display: 'flex',
                gap: 20,
                flexWrap: 'wrap'
              }}>
                <span>
                  🪪 <strong>Doctor ID:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>
                    {doctor?.doctorId}
                  </span>
                </span>
                <span>
                  📧 <strong>Email:</strong> {doctor?.email}
                </span>
                <span>
                  ⭐ <strong>Rating:</strong> {doctor?.rating || 0}/5
                </span>
              </div>

              <p className="section-title">Personal Information</p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Dr. Full Name"
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
                    placeholder="10 digit number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio / About</label>
                <textarea
                  name="bio"
                  className="form-control"
                  rows={4}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Brief description about the doctor's expertise and experience..."
                  maxLength={500}
                />
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {form.bio.length}/500 characters
                </p>
              </div>
            </>
          )}

          {/* Tab 2 - Medical Info */}
          {activeTab === 'medical' && (
            <>
              <p className="section-title">Medical Credentials</p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <select
                    name="specialization"
                    className="form-control"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input
                    name="department"
                    className="form-control"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Cardiology"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <input
                    name="qualification"
                    className="form-control"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">License Number *</label>
                  <input
                    name="licenseNumber"
                    className="form-control"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    placeholder="Medical license number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (years) *</label>
                  <input
                    name="experience"
                    type="number"
                    className="form-control"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="Years of experience"
                    min="0"
                    max="60"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹) *</label>
                  <input
                    name="consultationFee"
                    type="number"
                    className="form-control"
                    value={form.consultationFee}
                    onChange={handleChange}
                    placeholder="Fee in rupees"
                    min="0"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Tab 3 - Availability */}
          {activeTab === 'availability' && (
            <>
              <p className="section-title">Weekly Schedule</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Toggle each day and set working hours
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {availability.map((avail, index) => (
                  <div
                    key={avail.day}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr 1fr',
                      gap: 12,
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: avail.isAvailable ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${avail.isAvailable ? '#bbf7d0' : 'var(--border)'}`,
                      borderRadius: 8,
                      transition: 'all 0.15s'
                    }}
                  >
                    {/* Day toggle */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}>
                      <div
                        onClick={() => handleAvailabilityChange(index, 'isAvailable', !avail.isAvailable)}
                        style={{
                          width: 40, height: 22,
                          borderRadius: 11,
                          background: avail.isAvailable ? 'var(--success)' : 'var(--border)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          flexShrink: 0
                        }}
                      >
                        <div style={{
                          width: 16, height: 16,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 3,
                          left: avail.isAvailable ? 21 : 3,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                      <span style={{
                        fontWeight: avail.isAvailable ? 600 : 400,
                        color: avail.isAvailable
                          ? 'var(--success)'
                          : 'var(--text-secondary)',
                        fontSize: 14
                      }}>
                        {avail.day}
                      </span>
                    </label>

                    {/* Start time */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 4
                      }}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        value={avail.startTime}
                        onChange={e => handleAvailabilityChange(index, 'startTime', e.target.value)}
                        disabled={!avail.isAvailable}
                        style={{ opacity: avail.isAvailable ? 1 : 0.4 }}
                      />
                    </div>

                    {/* End time */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 4
                      }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        value={avail.endTime}
                        onChange={e => handleAvailabilityChange(index, 'endTime', e.target.value)}
                        disabled={!avail.isAvailable}
                        style={{ opacity: avail.isAvailable ? 1 : 0.4 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                fontSize: 13,
                color: '#166534'
              }}>
                ✅ Available on:{' '}
                <strong>
                  {availability.filter(a => a.isAvailable).map(a => a.day).join(', ') || 'No days selected'}
                </strong>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          {/* Tab navigation inside footer */}
          <div style={{ flex: 1 }}>
            {activeTab !== 'basic' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const tabs = ['basic', 'medical', 'availability'];
                  const current = tabs.indexOf(activeTab);
                  setActiveTab(tabs[current - 1]);
                }}
              >
                ← Back
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          {activeTab !== 'availability' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const tabs = ['basic', 'medical', 'availability'];
                const current = tabs.indexOf(activeTab);
                setActiveTab(tabs[current + 1]);
              }}
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          )}
        </div>

      </form>
    </Modal>
  );
};

export default EditDoctorModal;