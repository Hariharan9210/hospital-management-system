import React, { useState, useEffect, useCallback } from 'react';
import { appointmentAPI } from '../../services/api';
import { formatDate, getInitials } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import BookAppointmentModal from './BookAppointmentModal';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  scheduled: 'badge-info',
  confirmed: 'badge-primary',
  completed: 'badge-success',
  cancelled: 'badge-danger',
  'no-show': 'badge-secondary'
};

const statusIcons = {
  scheduled: '📋',
  confirmed: '✅',
  completed: '🏁',
  cancelled: '❌',
  'no-show': '🚫'
};

const AppointmentsPage = () => {
  const { isAdmin, isDoctor, isPatient } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showBook, setShowBook] = useState(false);
  const [selected, setSelected] = useState(null);
  const LIMIT = 10;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getAll({
        page, limit: LIMIT, status, date
      });
      setAppointments(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [page, status, date]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id, newStatus) => {
    try {
      await appointmentAPI.updateStatus(id, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}!`);
      setSelected(null);
      fetchAppointments();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async (id) => {
    try {
      await appointmentAPI.cancel(id, { reason: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      setSelected(null);
      fetchAppointments();
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  // Safe getter for patient name
  const getPatientName = (appointment) => {
    if (appointment?.patient?.name) return appointment.patient.name;
    return 'Unknown Patient';
  };

  const getPatientId = (appointment) => {
    if (appointment?.patient?.patientId) return appointment.patient.patientId;
    return '—';
  };

  const getDoctorName = (appointment) => {
    if (appointment?.doctor?.name) return appointment.doctor.name;
    return 'Unknown Doctor';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isPatient ? 'My Appointments' : 'Appointments'}
          </h1>
          <p className="page-subtitle">{total} total appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBook(true)}>
          + Book Appointment
        </button>
      </div>

      {/* Patient info box */}
      {isPatient && (
        <div style={{
          background: '#e0f2fe', border: '1px solid #7dd3fc',
          borderRadius: 8, padding: '12px 16px', marginBottom: 16,
          fontSize: 14, color: '#0369a1'
        }}>
          ℹ️ You can book appointments with doctors and cancel scheduled ones.
        </div>
      )}

      <div className="card">
        {/* Filters */}
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters-row">
            <select
              className="form-control"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              {['scheduled','confirmed','completed','cancelled','no-show'].map(s => (
                <option key={s} value={s}>
                  {statusIcons[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="form-control"
              value={date}
              onChange={e => { setDate(e.target.value); setPage(1); }}
            />

            {(status || date) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setStatus(''); setDate(''); setPage(1); }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No appointments found</h3>
              <p style={{ marginBottom: 16 }}>
                {status
                  ? `No ${status} appointments found`
                  : 'Book your first appointment'}
              </p>
              <button className="btn btn-primary" onClick={() => setShowBook(true)}>
                + Book Appointment
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Appt ID</th>
                  {/* Hide patient column for patient role */}
                  {!isPatient && <th>Patient</th>}
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>

                    {/* Appointment ID */}
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: 11 }}>
                        {a.appointmentId || '—'}
                      </span>
                    </td>

                    {/* Patient column - only for admin and doctor */}
                    {!isPatient && (
                      <td>
                        {a.patient ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="avatar avatar-sm"
                              style={{ background: '#dbeafe', color: '#1d4ed8' }}
                            >
                              {getInitials(getPatientName(a))}
                            </div>
                            <div>
                              <p className="font-medium">{getPatientName(a)}</p>
                              <p className="text-sm text-secondary">
                                {getPatientId(a)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                            Patient not found
                          </span>
                        )}
                      </td>
                    )}

                    {/* Doctor */}
                    <td>
                      <p className="font-medium">{getDoctorName(a)}</p>
                      <p className="text-sm text-secondary">
                        {a.doctor?.specialization || '—'}
                      </p>
                    </td>

                    {/* Date */}
                    <td>{formatDate(a.appointmentDate)}</td>

                    {/* Time */}
                    <td>
                      {a.timeSlot?.startTime || '—'} – {a.timeSlot?.endTime || '—'}
                    </td>

                    {/* Type */}
                    <td>
                      <span className="badge badge-secondary"
                        style={{ textTransform: 'capitalize' }}>
                        {a.type?.replace('-', ' ') || '—'}
                      </span>
                    </td>

                    {/* Reason */}
                    <td style={{ maxWidth: 150 }}>
                      <p style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 13
                      }}>
                        {a.reason || '—'}
                      </p>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${statusColors[a.status] || 'badge-secondary'}`}>
                        {statusIcons[a.status]} {a.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelected(a)}
                      >
                        👁️ View
                      </button>
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

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBook}
        onClose={() => setShowBook(false)}
        onSuccess={() => { setShowBook(false); fetchAppointments(); }}
      />

      {/* View / Manage Appointment Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Appointment Details"
      >
        {selected && (
          <>
            <div className="modal-body">

              {/* Status banner */}
              <div style={{
                background: selected.status === 'completed' ? '#d1fae5'
                  : selected.status === 'cancelled' ? '#fee2e2'
                  : selected.status === 'confirmed' ? '#dbeafe'
                  : selected.status === 'no-show' ? '#f1f5f9'
                  : '#fef3c7',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <span style={{ fontSize: 24 }}>
                  {statusIcons[selected.status]}
                </span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>
                    Appointment {selected.status?.charAt(0).toUpperCase() + selected.status?.slice(1)}
                  </p>
                  <p style={{ fontSize: 13, opacity: 0.8 }}>
                    {selected.appointmentId}
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div className="info-grid" style={{ marginBottom: 16 }}>
                <div className="info-item">
                  <label>Patient</label>
                  <p>{getPatientName(selected)}</p>
                  {selected.patient?.patientId && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {selected.patient.patientId}
                    </p>
                  )}
                </div>
                <div className="info-item">
                  <label>Doctor</label>
                  <p>{getDoctorName(selected)}</p>
                  {selected.doctor?.specialization && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {selected.doctor.specialization}
                    </p>
                  )}
                </div>
                <div className="info-item">
                  <label>Date</label>
                  <p>{formatDate(selected.appointmentDate)}</p>
                </div>
                <div className="info-item">
                  <label>Time</label>
                  <p>
                    {selected.timeSlot?.startTime} – {selected.timeSlot?.endTime}
                  </p>
                </div>
                <div className="info-item">
                  <label>Type</label>
                  <p style={{ textTransform: 'capitalize' }}>
                    {selected.type?.replace('-', ' ')}
                  </p>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <p>
                    <span className={`badge ${statusColors[selected.status]}`}>
                      {statusIcons[selected.status]} {selected.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label className="form-label">Reason for Visit</label>
                <div style={{
                  background: '#f8fafc', padding: '10px 14px',
                  borderRadius: 6, fontSize: 14,
                  border: '1px solid var(--border)'
                }}>
                  {selected.reason || 'Not specified'}
                </div>
              </div>

              {/* Symptoms */}
              {selected.symptoms?.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Symptoms</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selected.symptoms.map((s, i) => (
                      <span key={i} className="badge badge-warning">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor notes */}
              {selected.notes && (
                <div className="form-group">
                  <label className="form-label">Doctor Notes</label>
                  <div style={{
                    background: '#f0fdf4', padding: '10px 14px',
                    borderRadius: 6, fontSize: 14,
                    border: '1px solid #bbf7d0'
                  }}>
                    {selected.notes}
                  </div>
                </div>
              )}

              {/* Cancellation reason */}
              {selected.cancellationReason && (
                <div className="form-group">
                  <label className="form-label">Cancellation Reason</label>
                  <div style={{
                    background: '#fef2f2', padding: '10px 14px',
                    borderRadius: 6, fontSize: 14,
                    border: '1px solid #fecaca'
                  }}>
                    {selected.cancellationReason}
                    {selected.cancelledBy && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 8 }}>
                        (by {selected.cancelledBy})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Admin / Doctor status actions */}
              {(isAdmin || isDoctor) && (
                <div style={{ marginTop: 16 }}>
                  <p className="section-title">Update Status</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

                    {selected.status === 'scheduled' && (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => updateStatus(selected._id, 'confirmed')}
                        >
                          ✅ Confirm
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => updateStatus(selected._id, 'cancelled')}
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}

                    {selected.status === 'confirmed' && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => updateStatus(selected._id, 'completed')}
                        >
                          🏁 Mark Completed
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() => updateStatus(selected._id, 'no-show')}
                        >
                          🚫 No Show
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => updateStatus(selected._id, 'cancelled')}
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}

                    {['completed', 'cancelled', 'no-show'].includes(selected.status) && (
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        width: '100%'
                      }}>
                        ℹ️ This appointment is <strong>{selected.status}</strong>.
                        No further status updates are possible.
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Patient cancel action */}
              {isPatient && selected.status === 'scheduled' && (
                <div style={{ marginTop: 16 }}>
                  <p className="section-title">Actions</p>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(selected._id)}
                  >
                    ❌ Cancel My Appointment
                  </button>
                </div>
              )}

              {isPatient && selected.status === 'confirmed' && (
                <div style={{
                  marginTop: 16,
                  background: '#fef3c7',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#92400e'
                }}>
                  ⚠️ This appointment is confirmed. Contact the hospital to cancel.
                </div>
              )}

            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentsPage;