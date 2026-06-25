import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { billingAPI, patientAPI, doctorAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const GenerateBillModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: '', discount: 0, taxRate: 0, notes: '' });
  const [items, setItems] = useState([{ description: 'Consultation Fee', quantity: 1, unitPrice: '' }]);

  useEffect(() => {
    if (isOpen) {
      patientAPI.getAll({ limit: 100 }).then(r => setPatients(r.data.data)).catch(() => {});
      doctorAPI.getAll({ limit: 100 }).then(r => setDoctors(r.data.data)).catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleItemChange = (i, e) => {
    const updated = [...items];
    updated[i][e.target.name] = e.target.value;
    setItems(updated);
  };
  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: '' }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
  const tax = (subtotal - Number(form.discount)) * (Number(form.taxRate) / 100);
  const total = subtotal - Number(form.discount) + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await billingAPI.create({
        patient: form.patient, doctor: form.doctor || undefined,
        items: items.map(i => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
        discount: Number(form.discount), taxRate: Number(form.taxRate), notes: form.notes
      });
      toast.success('Bill generated!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Bill" size="modal-lg">
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
              <label className="form-label">Doctor (optional)</label>
              <select name="doctor" className="form-control" value={form.doctor} onChange={handleChange}>
                <option value="">Select doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center" style={{ margin: '16px 0 12px' }}>
            <p className="section-title" style={{ margin: 0 }}>Bill Items</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                {i === 0 && <label className="form-label">Description</label>}
                <input name="description" className="form-control" placeholder="Service description" value={item.description} onChange={e => handleItemChange(i, e)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                {i === 0 && <label className="form-label">Qty</label>}
                <input name="quantity" type="number" className="form-control" min="1" value={item.quantity} onChange={e => handleItemChange(i, e)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                {i === 0 && <label className="form-label">Unit Price (₹)</label>}
                <input name="unitPrice" type="number" className="form-control" placeholder="0" min="0" value={item.unitPrice} onChange={e => handleItemChange(i, e)} required />
              </div>
              <div style={{ paddingBottom: 1 }}>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18, padding: '8px 4px' }}>✕</button>
                )}
              </div>
            </div>
          ))}

          <div className="form-grid" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Discount (₹)</label>
              <input name="discount" type="number" className="form-control" min="0" value={form.discount} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Tax Rate (%)</label>
              <input name="taxRate" type="number" className="form-control" min="0" max="100" value={form.taxRate} onChange={handleChange} />
            </div>
          </div>

          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 16, border: '1px solid #bbf7d0' }}>
            <div className="flex justify-between" style={{ marginBottom: 6 }}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {Number(form.discount) > 0 && <div className="flex justify-between" style={{ marginBottom: 6, color: 'var(--success)' }}><span>Discount</span><span>-{formatCurrency(form.discount)}</span></div>}
            {Number(form.taxRate) > 0 && <div className="flex justify-between" style={{ marginBottom: 6 }}><span>Tax ({form.taxRate}%)</span><span>{formatCurrency(tax)}</span></div>}
            <div className="flex justify-between font-bold" style={{ fontSize: 18, borderTop: '1px solid #86efac', paddingTop: 8 }}><span>Total Amount</span><span style={{ color: 'var(--success)' }}>{formatCurrency(total)}</span></div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Notes</label>
            <textarea name="notes" className="form-control" rows={2} placeholder="Additional notes..." value={form.notes} onChange={handleChange} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Generating...' : '💳 Generate Bill'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GenerateBillModal;