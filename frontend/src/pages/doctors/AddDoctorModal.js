import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = ['General Medicine','Cardiology','Dermatology','Orthopedics','Pediatrics','Gynecology','Neurology','Ophthalmology','ENT','Psychiatry','Radiology','Oncology','Urology','Nephrology','Gastroenterology'];

const AddDoctorModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', department: '', qualification: '',
    experience: '', licenseNumber: '', consultationFee: '', bio: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorAPI.create({
        ...form,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        password: form.password || 'Doctor@123'
      });
      toast.success('Doctor added successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Doctor" size="modal-lg">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" className="form-control" placeholder="Dr. Full Name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" className="form-control" placeholder="doctor@hospital.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" placeholder="Default: Doctor@123" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input name="phone" className="form-control" placeholder="10 digit number" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <select name="specialization" className="form-control" value={form.specialization} onChange={handleChange} required>
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <input name="department" className="form-control" placeholder="e.g. Cardiology" value={form.department} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Qualification *</label>
              <input name="qualification" className="form-control" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (years) *</label>
              <input name="experience" type="number" className="form-control" placeholder="Years of experience" value={form.experience} onChange={handleChange} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">License Number *</label>
              <input name="licenseNumber" className="form-control" placeholder="Medical license number" value={form.licenseNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Consultation Fee (₹) *</label>
              <input name="consultationFee" type="number" className="form-control" placeholder="Fee in rupees" value={form.consultationFee} onChange={handleChange} required min="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea name="bio" className="form-control" placeholder="Brief description about the doctor..." value={form.bio} onChange={handleChange} rows={3} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Adding...' : '✅ Add Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDoctorModal;