import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { patientAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AddPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    dateOfBirth: '', gender: '', bloodGroup: '',
    street: '', city: '', state: '', pincode: '',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
    allergies: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await patientAPI.create({
        name: form.name, email: form.email,
        password: form.password || 'Patient@123',
        phone: form.phone, dateOfBirth: form.dateOfBirth,
        gender: form.gender, bloodGroup: form.bloodGroup,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        emergencyContact: { name: form.emergencyName, relationship: form.emergencyRelationship, phone: form.emergencyPhone },
        allergies: form.allergies ? form.allergies.split(',').map(a => a.trim()) : []
      });
      toast.success('Patient added successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add patient');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Patient" size="modal-lg">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <p className="section-title">Personal Information</p>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" className="form-control" placeholder="Patient full name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" className="form-control" placeholder="patient@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" placeholder="Default: Patient@123" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input name="phone" className="form-control" placeholder="10 digit number" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input name="dateOfBirth" type="date" className="form-control" value={form.dateOfBirth} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select name="gender" className="form-control" value={form.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select name="bloodGroup" className="form-control" value={form.bloodGroup} onChange={handleChange} required>
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Allergies</label>
              <input name="allergies" className="form-control" placeholder="Comma separated: Penicillin, Peanuts" value={form.allergies} onChange={handleChange} />
            </div>
          </div>

          <p className="section-title" style={{ marginTop: 16 }}>Address</p>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Street</label>
              <input name="street" className="form-control" placeholder="Street address" value={form.street} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input name="city" className="form-control" placeholder="City" value={form.city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input name="state" className="form-control" placeholder="State" value={form.state} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input name="pincode" className="form-control" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
            </div>
          </div>

          <p className="section-title" style={{ marginTop: 16 }}>Emergency Contact</p>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input name="emergencyName" className="form-control" placeholder="Contact name" value={form.emergencyName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Relationship</label>
              <input name="emergencyRelationship" className="form-control" placeholder="e.g. Spouse" value={form.emergencyRelationship} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input name="emergencyPhone" className="form-control" placeholder="Contact phone" value={form.emergencyPhone} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Adding...' : '✅ Add Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPatientModal;