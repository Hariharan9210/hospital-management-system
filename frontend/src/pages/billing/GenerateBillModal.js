import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { billingAPI, patientAPI, doctorAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const GenerateBillModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    discount: 0,
    taxRate: 0,
    notes: ''
  });
  const [items, setItems] = useState([
    { description: 'Consultation Fee', quantity: 1, unitPrice: '' }
  ]);

  useEffect(() => {
    if (isOpen) {
      patientAPI.getAll({ limit: 100 })
        .then(r => setPatients(r.data.data))
        .catch(() => toast.error('Failed to load patients'));
      doctorAPI.getAll({ limit: 100 })
        .then(r => setDoctors(r.data.data))
        .catch(() => toast.error('Failed to load doctors'));
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setForm({ patient: '', doctor: '', discount: 0, taxRate: 0, notes: '' });
      setItems([{ description: 'Consultation Fee', quantity: 1, unitPrice: '' }]);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (i, e) => {
    const updated = [...items];
    updated[i][e.target.name] = e.target.value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: '' }]);
  };

  const removeItem = (i) => {
    if (items.length === 1) {
      return toast.error('At least one item is required');
    }
    setItems(items.filter((_, idx) => idx !== i));
  };

  // Calculate totals live
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.unitPrice) || 0);
  }, 0);
  const discount = Number(form.discount) || 0;
  const taxRate = Number(form.taxRate) || 0;
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const totalAmount = subtotal - discount + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!form.patient) return toast.error('Please select a patient');

    const hasEmptyItem = items.some(
      item => !item.description.trim() || !item.unitPrice
    );
    if (hasEmptyItem) {
      return toast.error('Please fill all bill item details');
    }

    if (subtotal <= 0) {
      return toast.error('Total amount must be greater than 0');
    }

    if (discount > subtotal) {
      return toast.error('Discount cannot be more than subtotal');
    }

    setLoading(true);
    try {
      await billingAPI.create({
        patient: form.patient,
        doctor: form.doctor || undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0
        })),
        discount: Number(form.discount) || 0,
        taxRate: Number(form.taxRate) || 0,
        notes: form.notes
      });

      toast.success(`Bill generated! Total: ${formatCurrency(totalAmount)}`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💳 Generate Bill" size="modal-lg">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">

          {/* Patient and Doctor */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Patient *</label>
              <select
                name="patient"
                className="form-control"
                value={form.patient}
                onChange={handleChange}
                required
              >
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Doctor (optional)</label>
              <select
                name="doctor"
                className="form-control"
                value={form.doctor}
                onChange={handleChange}
              >
                <option value="">Select doctor</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bill Items */}
          <div className="flex justify-between items-center" style={{ margin: '8px 0 12px' }}>
            <p className="section-title" style={{ margin: 0 }}>Bill Items</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          {/* Items header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '3fr 1fr 1fr 40px',
            gap: 8,
            marginBottom: 8,
            padding: '0 4px'
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Description
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Qty
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Unit Price (₹)
            </span>
            <span></span>
          </div>

          {/* Item rows */}
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr 1fr 40px',
                gap: 8,
                marginBottom: 8,
                alignItems: 'center'
              }}
            >
              <input
                name="description"
                className="form-control"
                placeholder="Service description"
                value={item.description}
                onChange={e => handleItemChange(i, e)}
                required
              />
              <input
                name="quantity"
                type="number"
                className="form-control"
                min="1"
                value={item.quantity}
                onChange={e => handleItemChange(i, e)}
                required
              />
              <input
                name="unitPrice"
                type="number"
                className="form-control"
                placeholder="0"
                min="0"
                value={item.unitPrice}
                onChange={e => handleItemChange(i, e)}
                required
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                style={{
                  background: 'none',
                  border: 'none',
                  color: items.length === 1 ? 'var(--border)' : 'var(--danger)',
                  cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Discount and Tax */}
          <div className="form-grid" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Discount (₹)</label>
              <input
                name="discount"
                type="number"
                className="form-control"
                min="0"
                value={form.discount}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tax Rate (%)</label>
              <input
                name="taxRate"
                type="number"
                className="form-control"
                min="0"
                max="100"
                value={form.taxRate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Live total summary */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: 16,
            marginTop: 4
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="flex justify-between" style={{ fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between" style={{ fontSize: 14, color: 'var(--success)' }}>
                  <span>Discount</span>
                  <span>− {formatCurrency(discount)}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between" style={{ fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Tax ({taxRate}%)
                  </span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div style={{
                borderTop: '1px solid #86efac',
                paddingTop: 8,
                marginTop: 4
              }}
                className="flex justify-between"
              >
                <span style={{ fontWeight: 700, fontSize: 16 }}>Total Amount</span>
                <span style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: 'var(--success)'
                }}>
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Notes (optional)</label>
            <textarea
              name="notes"
              className="form-control"
              rows={2}
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={handleChange}
            />
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
            disabled={loading || subtotal <= 0}
          >
            {loading
              ? '⏳ Generating...'
              : `💳 Generate Bill — ${formatCurrency(totalAmount)}`
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GenerateBillModal;