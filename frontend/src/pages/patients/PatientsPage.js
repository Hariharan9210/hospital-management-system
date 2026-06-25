import React, { useState, useEffect, useCallback } from 'react';
import { patientAPI } from '../../services/api';
import { formatDate, getStatusBadge, getInitials } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import AddPatientModal from './AddPatientModal';
import EditPatientModal from './EditPatientModal';
import toast from 'react-hot-toast';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const LIMIT = 10;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientAPI.getAll({
        page, limit: LIMIT, search, bloodGroup, gender
      });
      setPatients(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [page, search, bloodGroup, gender]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleDelete = async () => {
    try {
      await patientAPI.delete(deleteId);
      toast.success(`${deleteName} has been deactivated`);
      setDeleteId(null);
      setDeleteName('');
      fetchPatients();
    } catch {
      toast.error('Failed to deactivate patient');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{total} patients registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Patient
        </button>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters-row">
            <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
              <span className="search-icon">🔍</span>
              <input
                className="form-control search-input"
                placeholder="Search by name, email, phone, ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="form-control"
              value={bloodGroup}
              onChange={e => { setBloodGroup(e.target.value); setPage(1); }}
            >
              <option value="">All Blood Groups</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            <select
              className="form-control"
              value={gender}
              onChange={e => { setGender(e.target.value); setPage(1); }}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {(search || bloodGroup || gender) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(''); setBloodGroup(''); setGender(''); setPage(1); }}
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
              <p>Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧑‍🤝‍🧑</div>
              <h3>No patients found</h3>
              <p style={{ marginBottom: 16 }}>
                {search ? `No results for "${search}"` : 'Add your first patient to get started'}
              </p>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                + Add Patient
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm">
                          {getInitials(p.name)}
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-secondary">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{p.patientId}</span>
                    </td>
                    <td>
                      <span>{p.age} yrs</span>
                      {' / '}
                      <span className={`badge ${getStatusBadge(p.gender)}`}>
                        {p.gender}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-danger">{p.bloodGroup}</span>
                    </td>
                    <td>{p.phone}</td>
                    <td>{p.address?.city}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        {/* EDIT BUTTON - now works! */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditPatient(p)}
                          title="Edit patient"
                        >
                          ✏️
                        </button>
                        {/* DELETE BUTTON */}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setDeleteId(p._id);
                            setDeleteName(p.name);
                          }}
                          title="Deactivate patient"
                        >
                          🗑️
                        </button>
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

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => { setShowAdd(false); fetchPatients(); }}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={!!editPatient}
        onClose={() => setEditPatient(null)}
        onSuccess={() => { setEditPatient(null); fetchPatients(); }}
        patient={editPatient}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteName(''); }}
        title="Confirm Deactivation"
      >
        <div className="modal-body">
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 600, color: '#991b1b', marginBottom: 4 }}>
                Deactivate Patient Account
              </p>
              <p style={{ fontSize: 14, color: '#991b1b' }}>
                Are you sure you want to deactivate <strong>{deleteName}</strong>?
                Their data will be preserved but they will not be able to login.
              </p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            This action can be reversed by the admin if needed.
          </p>
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

export default PatientsPage;