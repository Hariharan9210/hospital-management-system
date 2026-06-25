import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { appointmentAPI, patientAPI, doctorAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';


const BookAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, isPatient, isAdmin, isDoctor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pSearch, setPSearch] = useState('');
  const [dSearch, setDSearch] = useState('');
  const [myPatientId, setMyPatientId] = useState(null);
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    type: 'consultation',
    reason: ''
  });

  // If patient is logged in, fetch their own patient profile ID
  // If patient is logged in, fetch their own patient profile ID
  useEffect(() => {
    if (isOpen && isPatient) {
      // First get the full user profile which has profileId
      authAPI.getMe()
        .then(res => {
          const profile = res.data.profile;
          if (profile && profile._id) {
            // Profile found directly from user account
            setMyPatientId(profile._id);
            setForm(prev => ({ ...prev, patient: profile._id }));
          } else {
            // Fallback: search by email
            patientAPI.getAll({ limit: 100, search: user.email })
              .then(r => {
                const found = r.data.data.find(p => p.email === user.email);
                if (found) {
                  setMyPatientId(found._id);
                  setForm(prev => ({ ...prev, patient: found._id }));
                } else {
                  toast.error('Patient profile not found. Ask admin to create your profile.');
                }
              });
          }
        })
        .catch(() => toast.error('Failed to load patient profile'));
    }
  }, [isOpen, isPatient, user]);

  // Fetch all patients for admin/doctor dropdown
  useEffect(() => {
    if (!isOpen || isPatient) return;
    const timer = setTimeout(() => {
      patientAPI.getAll({ limit: 50, search: pSearch })
        .then(r => setPatients(r.data.data))
        .catch(() => toast.error('Failed to load patients'));
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, pSearch, isPatient]);

  // Fetch doctors for dropdown
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      doctorAPI.getAll({ limit: 50, search: dSearch })
        .then(r => setDoctors(r.data.data))
        .catch(() => toast.error('Failed to load doctors'));
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, dSearch]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setForm({ patient: '', doctor: '', appointmentDate: '', startTime: '', endTime: '', type: 'consultation', reason: '' });
      setPSearch('');
      setDSearch('');
      setMyPatientId(null);
    }
  }, [isOpen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!form.patient) return toast.error('Patient profile not found. Contact admin.');
    if (!form.doctor) return toast.error('Please select a doctor');
    if (!form.appointmentDate) return toast.error('Please select a date');
    if (!form.startTime) return toast.error('Please select a time');
    if (!form.reason.trim()) return toast.error('Please enter a reason for visit');

    setLoading(true);
    try {
      await appointmentAPI.create({
        patient: form.patient,
        doctor: form.doctor,
        appointmentDate: form.appointmentDate,
        timeSlot: {
          startTime: form.startTime,
          endTime: form.endTime || form.startTime
        },
        type: form.type,
        reason: form.reason
      });
      toast.success('Appointment booked successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📅 Book Appointment">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">

          {/* Show patient info box when patient is logged in */}
          {isPatient && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 8, padding: '12px 16px', marginBottom: 16,
              fontSize: 14, color: '#166534'
            }}>
              {myPatientId ? (
                <p>✅ Booking appointment for: <strong>{user?.name}</strong></p>
              ) : (
                <p style={{ color: 'var(--danger)' }}>
                  ❌ Patient profile not found. Please ask admin to create your patient profile first.
                </p>
              )}
            </div>
          )}

          {/* Patient dropdown — only for admin and doctor */}
          {(isAdmin || isDoctor) && (
            <div className="form-group">
              <label className="form-label">Search Patient *</label>
              <input
                className="form-control"
                placeholder="Type patient name to search..."
                value={pSearch}
                onChange={e => setPSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <select
                name="patient"
                className="form-control"
                value={form.patient}
                onChange={handleChange}
                required
                size={4}
                style={{ height: 'auto' }}
              >
                <option value="">-- Select Patient --</option>
                {patients.length === 0 && (
                  <option disabled>No patients found</option>
                )}
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} | {p.patientId} | {p.phone}
                  </option>
                ))}
              </select>
              {form.patient && (
                <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>
                  ✅ Selected: {patients.find(p => p._id === form.patient)?.name}
                </p>
              )}
            </div>
          )}

          {/* Doctor dropdown — for everyone */}
          <div className="form-group">
            <label className="form-label">Search Doctor *</label>
            <input
              className="form-control"
              placeholder="Type doctor name or specialization..."
              value={dSearch}
              onChange={e => setDSearch(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <select
              name="doctor"
              className="form-control"
              value={form.doctor}
              onChange={handleChange}
              required
              size={4}
              style={{ height: 'auto' }}
            >
              <option value="">-- Select Doctor --</option>
              {doctors.length === 0 && (
                <option disabled>No doctors found</option>
              )}
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} | {d.specialization} | ₹{d.consultationFee}
                </option>
              ))}
            </select>
            {form.doctor && (
              <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>
                ✅ Selected: {doctors.find(d => d._id === form.doctor)?.name}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Appointment Date *</label>
              <input
                name="appointmentDate"
                type="date"
                className="form-control"
                value={form.appointmentDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                name="startTime"
                type="time"
                className="form-control"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Appointment Type</label>
            <select name="type" className="form-control" value={form.type} onChange={handleChange}>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="routine-checkup">Routine Checkup</option>
            </select>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label className="form-label">Reason for Visit *</label>
            <textarea
              name="reason"
              className="form-control"
              rows={3}
              placeholder="Describe your symptoms or reason for this appointment..."
              value={form.reason}
              onChange={handleChange}
              required
            />
          </div>

        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (isPatient && !myPatientId)}
          >
            {loading ? '⏳ Booking...' : '📅 Book Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookAppointmentModal;