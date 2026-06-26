import React, { useState, useEffect, useCallback } from 'react';
import { doctorAPI } from '../../services/api';
import { getInitials, formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import AddDoctorModal from './AddDoctorModal';
import EditDoctorModal from './EditDoctorModal';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Dermatology',
  'Orthopedics', 'Pediatrics', 'Gynecology',
  'Neurology', 'Ophthalmology', 'ENT', 'Psychiatry',
  'Radiology', 'Oncology', 'Urology', 'Nephrology',
  'Gastroenterology'
];

const DoctorsPage = () => {
  const { isAdmin } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [viewDoctor, setViewDoctor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const LIMIT = 10;

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getAll({
        page, limit: LIMIT, search, specialization
      });
      setDoctors(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [page, search, specialization]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleDelete = async () => {
    try {
      await doctorAPI.delete(deleteId);
      toast.success(`Dr. ${deleteName} deactivated`);
      setDeleteId(null);
      setDeleteName('');
      fetchDoctors();
    } catch {
      toast.error('Failed to deactivate doctor');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-subtitle">{total} doctors registered</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Add Doctor
          </button>
        )}
      </div>

      <div className="card">
        {/* Filters */}
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters-row">
            <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
              <span className="search-icon">🔍</span>
              <input
                className="form-control search-input"
                placeholder="Search by name, specialization, department..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="form-control"
              value={specialization}
              onChange={e => { setSpecialization(e.target.value); setPage(1); }}
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {(search || specialization) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(''); setSpecialization(''); setPage(1); }}
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
              <p>Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👨‍⚕️</div>
              <h3>No doctors found</h3>
              <p style={{ marginBottom: 16 }}>
                {search ? `No results for "${search}"` : 'Add your first doctor'}
              </p>
              {isAdmin && (
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                  + Add Doctor
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>ID</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Availability</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="avatar avatar-sm"
                          style={{ background: '#dbeafe', color: '#1d4ed8' }}
                        >
                          {getInitials(d.name)}
                        </div>
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-sm text-secondary">{d.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-secondary">{d.doctorId}</span>
                    </td>

                    <td>
                      <span className="badge badge-info">{d.specialization}</span>
                    </td>

                    <td>
                      <p style={{ fontSize: 13 }}>{d.qualification}</p>
                    </td>

                    <td>{d.experience} yrs</td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                        {formatCurrency(d.consultationFee)}
                      </span>
                    </td>

                    <td>
                      {d.availability && d.availability.length > 0 ? (
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {d.availability.slice(0, 3).map(a => (
                            <span
                              key={a.day}
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                background: '#d1fae5',
                                color: '#065f46',
                                padding: '2px 5px',
                                borderRadius: 4
                              }}
                            >
                              {a.day.slice(0, 3)}
                            </span>
                          ))}
                          {d.availability.length > 3 && (
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                              +{d.availability.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          Not set
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td>
                        <div className="flex gap-2">
                          {/* View button */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setViewDoctor(d)}
                            title="View details"
                          >
                            👁️
                          </button>
                          {/* Edit button */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditDoctor(d)}
                            title="Edit doctor"
                          >
                            ✏️
                          </button>
                          {/* Delete button */}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setDeleteId(d._id);
                              setDeleteName(d.name);
                            }}
                            title="Deactivate doctor"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
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

      {/* Add Doctor Modal */}
      {isAdmin && (
        <AddDoctorModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); fetchDoctors(); }}
        />
      )}

      {/* Edit Doctor Modal */}
      <EditDoctorModal
        isOpen={!!editDoctor}
        onClose={() => setEditDoctor(null)}
        onSuccess={() => { setEditDoctor(null); fetchDoctors(); }}
        doctor={editDoctor}
      />

      {/* View Doctor Modal */}
      <Modal
        isOpen={!!viewDoctor}
        onClose={() => setViewDoctor(null)}
        title="Doctor Details"
      >
        {viewDoctor && (
          <>
            <div className="modal-body">
              {/* Header */}
              <div style={{
                display: 'flex', gap: 16,
                alignItems: 'center', marginBottom: 20,
                padding: '16px',
                background: '#eff6ff',
                borderRadius: 10
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: '#dbeafe', color: '#1d4ed8',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 24,
                  fontWeight: 700, flexShrink: 0
                }}>
                  {getInitials(viewDoctor.name)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 18 }}>{viewDoctor.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {viewDoctor.qualification}
                  </p>
                  <span className="badge badge-info" style={{ marginTop: 4 }}>
                    {viewDoctor.specialization}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="info-grid" style={{ marginBottom: 16 }}>
                <div className="info-item">
                  <label>Doctor ID</label>
                  <p style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>
                    {viewDoctor.doctorId}
                  </p>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <p>{viewDoctor.department}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{viewDoctor.email}</p>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{viewDoctor.phone}</p>
                </div>
                <div className="info-item">
                  <label>Experience</label>
                  <p>{viewDoctor.experience} years</p>
                </div>
                <div className="info-item">
                  <label>Consultation Fee</label>
                  <p style={{ color: 'var(--success)', fontWeight: 700 }}>
                    {formatCurrency(viewDoctor.consultationFee)}
                  </p>
                </div>
                <div className="info-item">
                  <label>License Number</label>
                  <p>{viewDoctor.licenseNumber}</p>
                </div>
                <div className="info-item">
                  <label>Rating</label>
                  <p>⭐ {viewDoctor.rating || 0} / 5</p>
                </div>
              </div>

              {/* Bio */}
              {viewDoctor.bio && (
                <div style={{ marginBottom: 16 }}>
                  <p className="section-title">About</p>
                  <p style={{
                    fontSize: 14, color: 'var(--text-secondary)',
                    lineHeight: 1.6, background: '#f8fafc',
                    padding: '12px 14px', borderRadius: 8,
                    border: '1px solid var(--border)'
                  }}>
                    {viewDoctor.bio}
                  </p>
                </div>
              )}

              {/* Availability */}
              <p className="section-title">Weekly Availability</p>
              {viewDoctor.availability && viewDoctor.availability.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {viewDoctor.availability.map(a => (
                    <div
                      key={a.day}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>✅ {a.day}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {a.startTime} – {a.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  No availability schedule set
                </p>
              )}
            </div>

            <div className="modal-footer">
              {isAdmin && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setViewDoctor(null);
                    setEditDoctor(viewDoctor);
                  }}
                >
                  ✏️ Edit Doctor
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setViewDoctor(null)}
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteName(''); }}
        title="Deactivate Doctor"
      >
        <div className="modal-body">
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '14px 16px',
            marginBottom: 16,
            display: 'flex',
            gap: 12
          }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
                Deactivate Dr. {deleteName}?
              </p>
              <p style={{ fontSize: 14, color: '#991b1b' }}>
                This doctor will no longer be able to login or appear in appointment
                bookings. Their existing data is preserved.
              </p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => { setDeleteId(null); setDeleteName(''); }}
          >
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑️ Yes, Deactivate
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorsPage;