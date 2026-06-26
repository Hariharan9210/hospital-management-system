import React, { useState, useEffect, useCallback } from 'react';
import { prescriptionAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import AddPrescriptionModal from './AddPrescriptionModal';
import toast from 'react-hot-toast';

const PrescriptionsPage = () => {
  const { isAdmin, isDoctor } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const LIMIT = 10;

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      // Only send status param if a specific one is selected
      if (statusFilter) params.status = statusFilter;
      const res = await prescriptionAPI.getAll(params);
      setPrescriptions(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  const handleDelete = async (id) => {
    try {
      await prescriptionAPI.delete(id);
      toast.success('Prescription cancelled');
      fetchPrescriptions();
    } catch {
      toast.error('Failed to cancel prescription');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return 'badge-success';
    if (status === 'completed') return 'badge-secondary';
    if (status === 'cancelled') return 'badge-danger';
    return 'badge-secondary';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">{total} prescription(s) found</p>
        </div>
        {(isAdmin || isDoctor) && (
          <button
            className="btn btn-primary"
            onClick={() => setShowAdd(true)}
          >
            + Create Prescription
          </button>
        )}
      </div>

      <div className="card">

        {/* Status Filter */}
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters-row">
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Active & Completed', value: '' },
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '1px solid',
                    borderColor: statusFilter === opt.value
                      ? 'var(--primary)'
                      : 'var(--border)',
                    background: statusFilter === opt.value
                      ? 'var(--primary)'
                      : 'transparent',
                    color: statusFilter === opt.value
                      ? 'white'
                      : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💊</div>
              <h3>
                {statusFilter === 'cancelled'
                  ? 'No cancelled prescriptions'
                  : statusFilter === 'completed'
                  ? 'No completed prescriptions'
                  : 'No prescriptions found'}
              </h3>
              <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
                {statusFilter
                  ? `No ${statusFilter} prescriptions to show`
                  : 'Create the first prescription to get started'}
              </p>
              {(isAdmin || isDoctor) && !statusFilter && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAdd(true)}
                >
                  + Create Prescription
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Date</th>
                  <th>Follow Up</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map(p => (
                  <tr key={p._id}>

                    {/* Prescription ID */}
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: 11 }}>
                        {p.prescriptionId}
                      </span>
                    </td>

                    {/* Patient */}
                    <td>
                      <p className="font-medium">{p.patient?.name || '—'}</p>
                      <p className="text-sm text-secondary">
                        {p.patient?.patientId || ''}
                      </p>
                    </td>

                    {/* Doctor */}
                    <td>
                      <p className="font-medium">{p.doctor?.name || '—'}</p>
                      <p className="text-sm text-secondary">
                        {p.doctor?.specialization || ''}
                      </p>
                    </td>

                    {/* Diagnosis */}
                    <td style={{ maxWidth: 160 }}>
                      <p style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 13
                      }}>
                        {p.diagnosis}
                      </p>
                    </td>

                    {/* Medicine count */}
                    <td>
                      <span className="badge badge-info">
                        {p.medicines?.length || 0} medicine(s)
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(p.prescribedDate)}
                    </td>

                    {/* Follow up */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {p.followUpDate ? (
                        <span style={{
                          fontSize: 12,
                          color: new Date(p.followUpDate) < new Date()
                            ? 'var(--danger)'
                            : 'var(--success)',
                          fontWeight: 500
                        }}>
                          {new Date(p.followUpDate) < new Date() ? '⚠️ ' : '📅 '}
                          {formatDate(p.followUpDate)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelected(p)}
                          title="View prescription"
                        >
                          👁️
                        </button>
                        {(isAdmin || isDoctor) && p.status !== 'cancelled' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p._id)}
                            title="Cancel prescription"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={total}
          limit={LIMIT}
          onPageChange={setPage}
        />
      </div>

      {/* View Prescription Modal */}
      {selected && (
        <div
          className="modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal modal-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">💊 Prescription Details</h2>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 20, cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">

              {/* Header info */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>
                    {selected.prescriptionId}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {formatDate(selected.prescribedDate)}
                  </p>
                </div>
                <span className={`badge ${getStatusBadge(selected.status)}`}
                  style={{ fontSize: 13 }}>
                  {selected.status}
                </span>
              </div>

              {/* Patient and doctor */}
              <div className="info-grid" style={{ marginBottom: 16 }}>
                <div className="info-item">
                  <label>Patient</label>
                  <p>{selected.patient?.name || '—'}</p>
                  {selected.patient?.patientId && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {selected.patient.patientId}
                    </p>
                  )}
                </div>
                <div className="info-item">
                  <label>Doctor</label>
                  <p>{selected.doctor?.name || '—'}</p>
                  {selected.doctor?.specialization && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {selected.doctor.specialization}
                    </p>
                  )}
                </div>
                {selected.followUpDate && (
                  <div className="info-item">
                    <label>Follow-up Date</label>
                    <p style={{
                      color: new Date(selected.followUpDate) < new Date()
                        ? 'var(--danger)'
                        : 'var(--success)',
                      fontWeight: 500
                    }}>
                      {new Date(selected.followUpDate) < new Date()
                        ? '⚠️ Overdue — '
                        : '📅 '}
                      {formatDate(selected.followUpDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Diagnosis */}
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <div style={{
                  background: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 14,
                  border: '1px solid var(--border)',
                  lineHeight: 1.6
                }}>
                  {selected.diagnosis}
                </div>
              </div>

              {/* Medicines table */}
              <p className="section-title" style={{ marginTop: 8 }}>
                Medicines ({selected.medicines?.length || 0})
              </p>
              <div className="table-wrap" style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 16
              }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.medicines?.map((m, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {i + 1}
                        </td>
                        <td className="font-medium">{m.name}</td>
                        <td>
                          <span className="badge badge-info">{m.dosage}</span>
                        </td>
                        <td style={{ fontSize: 13 }}>{m.frequency}</td>
                        <td style={{ fontSize: 13 }}>{m.duration}</td>
                        <td style={{
                          fontSize: 13,
                          color: 'var(--text-secondary)'
                        }}>
                          {m.instructions || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* General instructions */}
              {selected.generalInstructions && (
                <div className="form-group">
                  <label className="form-label">General Instructions</label>
                  <div style={{
                    background: '#fffbeb',
                    padding: '10px 14px',
                    borderRadius: 6,
                    fontSize: 14,
                    border: '1px solid #fde68a',
                    lineHeight: 1.6
                  }}>
                    {selected.generalInstructions}
                  </div>
                </div>
              )}

              {/* Lab tests */}
              {selected.labTests?.length > 0 && (
                <div className="form-group">
                  <label className="form-label">
                    Lab Tests Ordered ({selected.labTests.length})
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selected.labTests.map((test, i) => (
                      <span key={i} className="badge badge-purple">
                        🧪 {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="modal-footer">
              {(isAdmin || isDoctor) && selected.status !== 'cancelled' && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleDelete(selected._id);
                    setSelected(null);
                  }}
                >
                  🗑️ Cancel Prescription
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Prescription Modal */}
      <AddPrescriptionModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => { setShowAdd(false); fetchPrescriptions(); }}
      />
    </div>
  );
};

export default PrescriptionsPage;