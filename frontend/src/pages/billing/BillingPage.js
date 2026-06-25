import React, { useState, useEffect, useCallback } from 'react';
import { billingAPI } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import GenerateBillModal from './GenerateBillModal';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const BillingPage = () => {
  const { isAdmin } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selected, setSelected] = useState(null);
  const LIMIT = 10;

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billingAPI.getAll({ page, limit: LIMIT, paymentStatus });
      setBills(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [page, paymentStatus]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handlePayment = async (id, status) => {
    try {
      await billingAPI.updatePayment(id, { paymentStatus: status, paymentMethod: 'cash' });
      toast.success('Payment updated!');
      setSelected(null);
      fetchBills();
    } catch { toast.error('Failed to update payment'); }
  };

  const statusColors = {
    pending: 'badge-warning', paid: 'badge-success',
    partial: 'badge-info', cancelled: 'badge-danger', refunded: 'badge-secondary'
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">{total} total bills</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowGenerate(true)}>+ Generate Bill</button>}
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters-row">
            <select className="form-control" value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {['pending','paid','partial','cancelled','refunded'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Loading bills...</p></div>
          ) : bills.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💳</div><h3>No bills found</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td><span className="badge badge-secondary">{b.billId}</span></td>
                    <td>
                      <p className="font-medium">{b.patient?.name}</p>
                      <p className="text-sm text-secondary">{b.patient?.patientId}</p>
                    </td>
                    <td>{b.doctor?.name || '–'}</td>
                    <td className="font-bold">{formatCurrency(b.totalAmount)}</td>
                    <td className="text-success">{formatCurrency(b.amountPaid)}</td>
                    <td className="text-danger">{formatCurrency(b.balanceDue)}</td>
                    <td><span className={`badge ${statusColors[b.paymentStatus]}`}>{b.paymentStatus}</span></td>
                    <td>{formatDate(b.billDate)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelected(b)}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      <GenerateBillModal isOpen={showGenerate} onClose={() => setShowGenerate(false)} onSuccess={() => { setShowGenerate(false); fetchBills(); }} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Bill Details">
        {selected && (
          <>
            <div className="modal-body">
              <div className="info-grid" style={{ marginBottom: 16 }}>
                <div className="info-item"><label>Bill ID</label><p>{selected.billId}</p></div>
                <div className="info-item"><label>Date</label><p>{formatDate(selected.billDate)}</p></div>
                <div className="info-item"><label>Patient</label><p>{selected.patient?.name}</p></div>
                <div className="info-item"><label>Status</label><p><span className={`badge ${statusColors[selected.paymentStatus]}`}>{selected.paymentStatus}</span></p></div>
              </div>

              <p className="section-title">Bill Items</p>
              <table style={{ marginBottom: 16 }}>
                <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                  {selected.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td className="font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                <div className="flex justify-between" style={{ marginBottom: 8 }}><span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span></div>
                {selected.discount > 0 && <div className="flex justify-between" style={{ marginBottom: 8, color: 'var(--success)' }}><span>Discount</span><span>-{formatCurrency(selected.discount)}</span></div>}
                {selected.taxAmount > 0 && <div className="flex justify-between" style={{ marginBottom: 8 }}><span>Tax ({selected.taxRate}%)</span><span>{formatCurrency(selected.taxAmount)}</span></div>}
                <div className="flex justify-between font-bold" style={{ fontSize: 18, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                  <span>Total</span><span>{formatCurrency(selected.totalAmount)}</span>
                </div>
                <div className="flex justify-between" style={{ marginTop: 8, color: 'var(--success)' }}><span>Amount Paid</span><span>{formatCurrency(selected.amountPaid)}</span></div>
                <div className="flex justify-between" style={{ color: 'var(--danger)', fontWeight: 600 }}><span>Balance Due</span><span>{formatCurrency(selected.balanceDue)}</span></div>
              </div>

              {isAdmin && selected.paymentStatus !== 'paid' && selected.paymentStatus !== 'cancelled' && (
                <div style={{ marginTop: 16 }}>
                  <p className="section-title">Update Payment</p>
                  <div className="flex gap-2">
                    <button className="btn btn-success" onClick={() => handlePayment(selected._id, 'paid')}>✅ Mark as Paid</button>
                    <button className="btn btn-warning" onClick={() => handlePayment(selected._id, 'partial')}>💰 Partial Payment</button>
                    <button className="btn btn-danger" onClick={() => handlePayment(selected._id, 'cancelled')}>❌ Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default BillingPage;