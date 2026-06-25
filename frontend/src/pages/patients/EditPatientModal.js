import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { patientAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EditPatientModal = ({ isOpen, onClose, onSuccess, patient }) => {
  const [loading, setLoading] = useState(false);
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
    allergies: '',
    currentMedications: ''
  });

  // Fill form when patient data loads
  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || '',
        phone: patient.phone === '0000000000' ? '' : patient.phone || '',
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        street: patient.address?.street || '',
        city: patient.address?.city === 'Not set' ? '' : patient.address?.city || '',
        state: patient.address?.state === 'Not set' ? '' : patient.address?.state || '',
        pincode: patient.address?.pincode || '',
        emergencyName: patient.emergencyContact?.name || '',
        emergencyRelationship: patient.emergencyContact?.relationship || '',
        emergencyPhone: patient.emergencyContact?.phone || '',
        allergies: Array.isArray(patient.allergies)
          ? patient.allergies.join(', ')
          : '',
        currentMedications: Array.isArray(patient.currentMedications)
          ? patient.currentMedications.join(', ')
          : ''
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.phone.trim()) return toast.error('Phone is required');
    if (!form.dateOfBirth) return toast.error('Date of birth is required');
    if (!form.gender) return toast.error('Gender is required');
    if (!form.bloodGroup) return toast.error('Blood group is required');
    if (!form.city.trim()) return toast.error('City is required');
    if (!form.state.trim()) return toast.error('State is required');

    setLoading(true);
    try {
      await patientAPI.update(patient._id, {
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
          : [],
        currentMedications: form.currentMedications
          ? form.currentMedications.split(',').map(m => m.trim()).filter(Boolean)
          : []
      });

      toast.success(`${form.name} updated successfully!`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`✏️ Edit Patient — ${patient?.name}`} size="modal-lg">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">

          {/* Patient ID badge */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 20,
            display: 'flex',
            gap: 16,
            fontSize: 13,
            flexWrap: 'wrap'
          }}>
            <span>
              🪪 <strong>Patient ID:</strong>{' '}
              <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>
                {patient?.patientId}
              </span>
            </span>
            <span>
              📧 <strong>Email:</strong> {patient?.email}
            </span>
            <span>
              📅 <strong>Registered:</strong>{' '}
              {patient?.createdAt
                ? new Date(patient.createdAt).toLocaleDateString('en-IN')
                : 'N/A'}
            </span>
          </div>

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
                placeholder="Patient full name"
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
                placeholder="Penicillin, Dust (comma separated)"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Current Medications</label>
              <input
                name="currentMedications"
                className="form-control"
                value={form.currentMedications}
                onChange={handleChange}
                placeholder="Metformin, Aspirin (comma separated)"
              />
            </div>
          </div>

          {/* Address */}
          <p className="section-title" style={{ marginTop: 8 }}>Address</p>
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
                placeholder="City"
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
                placeholder="State"
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
          <p className="section-title" style={{ marginTop: 8 }}>Emergency Contact</p>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                name="emergencyName"
                className="form-control"
                value={form.emergencyName}
                onChange={handleChange}
                placeholder="Contact name"
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
              <label className="form-label">Phone</label>
              <input
                name="emergencyPhone"
                className="form-control"
                value={form.emergencyPhone}
                onChange={handleChange}
                placeholder="Emergency phone"
                maxLength={10}
              />
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPatientModal;