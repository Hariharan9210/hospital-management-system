import React, { useState, useEffect, useCallback } from 'react';
import { doctorAPI } from '../../services/api';
import { getInitials, formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import AddDoctorModal from './AddDoctorModal';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = ['General Medicine','Cardiology','Dermatology','Orthopedics','Pediatrics','Gynecology','Neurology','Ophthalmology','ENT','Psychiatry','Radiology','Oncology','Urology','Nephrology','Gastroenterology'];

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
  const [deleteId, setDeleteId] = useState(null);
  const LIMIT = 10;

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getAll({ page, limit: LIMIT, search, specialization });
      setDoctors(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  }, [page, search, specialization]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleDelete = async () => {
    try {
      await doctorAPI.delete(deleteId);
      toast.success('Doctor deactivated');
      setDeleteId(null);
      fetchDoctors();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-subtitle">{total} doctors registered</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Doctor</button>}
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters-row">
            <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
              <span className="search-icon">🔍</span>
              <input className="form-control" placeholder="Search doctors..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-control" value={specialization} onChange={e => { setSpecialization(e.target.value); setPage(1); }}>
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Loading doctors...</p></div>
          ) : doctors.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👨‍⚕️</div><h3>No doctors found</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>ID</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Phone</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm" style={{ background: '#dbeafe', color: '#1d4ed8' }}>{getInitials(d.name)}</div>
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-sm text-secondary">{d.qualification}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-secondary">{d.doctorId}</span></td>
                    <td><span className="badge badge-info">{d.specialization}</span></td>
                    <td>{d.department}</td>
                    <td>{d.experience} yrs</td>
                    <td>{formatCurrency(d.consultationFee)}</td>
                    <td>{d.phone}</td>
                    {isAdmin && (
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-secondary btn-sm" onClick={() => toast('Edit coming soon!')}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(d._id)}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      {isAdmin && <AddDoctorModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchDoctors(); }} />}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="modal-body"><p>Are you sure you want to deactivate this doctor?</p></div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Yes, Deactivate</button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorsPage;