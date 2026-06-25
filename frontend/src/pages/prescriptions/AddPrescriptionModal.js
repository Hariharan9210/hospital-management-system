import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { prescriptionAPI, patientAPI, doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FREQUENCIES = ['Once daily','Twice daily','Three times daily','Four times daily','Every 6 hours','Every 8 hours','Every 12 hours','As needed','Before meals','After meals','At bedtime'];

const AddPrescriptionModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: '', diagnosis: '', generalInstructions: '', followUpDate: '' });
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: 'Once daily', duration: '', instructions: '' }]);

  useEffect(() => {
    if (isOpen) {
      patientAPI.getAll({ limit: 100 }).then(r => setPatients(r.data.data)).catch(() => {});
      doctorAPI.getAll({ limit: 100 }).then(r => setDoctors(r.data.data)).catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMedChange = (i, e) => {
    const updated = [...medicines];
    updated[i][e.target.name] = e.target.value;
    setMedicines(updated);
  };

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', frequency: 'Once daily', duration: '', instructions: '' }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await prescriptionAPI.create({ ...form, medicines });
      toast.success('Prescription created!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Prescription" size="modal-lg">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Patient *</label>
              <select name="patient" className="form-control" value={form.patient} onChange={handleChange} required>
                <option value="">Select patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Doctor *</label>
              <select name="doctor" className="form-control" value={form.doctor} onChange={handleChange} required>
                <option value="">Select doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Diagnosis *</label>
            <textarea name="diagnosis" className="form-control" rows={2} placeholder="Patient diagnosis..." value={form.diagnosis} onChange={handleChange} required />
          </div>

          <div className="flex justify-between items-center" style={{ margin: '16px 0 12px' }}>
            <p className="section-title" style={{ margin: 0 }}>Medicines</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addMedicine}>+ Add Medicine</button>
          </div>

          {medicines.map((med, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 12, border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Medicine {i + 1}</p>
                {medicines.length > 1 && (
                  <button type="button" onClick={() => removeMedicine(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input name="name" className="form-control" placeholder="Medicine name" value={med.name} onChange={e => handleMedChange(i, e)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Dosage *</label>
                  <input name="dosage" className="form-control" placeholder="e.g. 500mg" value={med.dosage} onChange={e => handleMedChange(i, e)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency *</label>
                  <select name="frequency" className="form-control" value={med.frequency} onChange={e => handleMedChange(i, e)}>
                    {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input name="duration" className="form-control" placeholder="e.g. 7 days" value={med.duration} onChange={e => handleMedChange(i, e)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <input name="instructions" className="form-control" placeholder="e.g. Take with food" value={med.instructions} onChange={e => handleMedChange(i, e)} />
              </div>
            </div>
          ))}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">General Instructions</label>
              <textarea name="generalInstructions" className="form-control" rows={2} placeholder="Additional instructions..." value={form.generalInstructions} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input name="followUpDate" type="date" className="form-control" value={form.followUpDate} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Creating...' : '💊 Create Prescription'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPrescriptionModal;