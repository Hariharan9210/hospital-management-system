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
  const LIMIT = 10;

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prescriptionAPI.getAll({ page, limit: LIMIT });
      setPrescriptions(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load prescriptions'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">{total} total prescriptions</p>
        </div>
        {(isAdmin || isDoctor) && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Create Prescription</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
          ) : prescriptions.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💊</div><h3>No prescriptions found</h3></div>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map(p => (
                  <tr key={p._id}>
                    <td><span className="badge badge-secondary">{p.prescriptionId}</span></td>
                    <td>
                      <p className="font-medium">{p.patient?.name}</p>
                      <p className="text-sm text-secondary">{p.patient?.patientId}</p>
                    </td>
                    <td>{p.doctor?.name}</td>
                    <td style={{ maxWidth: 180 }}>
                      <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diagnosis}</p>
                    </td>
                    <td><span className="badge badge-info">{p.medicines?.length} medicine(s)</span></td>
                    <td>{formatDate(p.prescribedDate)}</td>
                    <td>
                      <span className={`badge ${p.status === 'active' ? 'badge-success' : p.status === 'completed' ? 'badge-secondary' : 'badge-danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelected(p)}>👁️ View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">💊 Prescription Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="info-grid" style={{ marginBottom: 16 }}>
                <div className="info-item"><label>Prescription ID</label><p>{selected.prescriptionId}</p></div>
                <div className="info-item"><label>Date</label><p>{formatDate(selected.prescribedDate)}</p></div>
                <div className="info-item"><label>Patient</label><p>{selected.patient?.name}</p></div>
                <div className="info-item"><label>Doctor</label><p>{selected.doctor?.name}</p></div>
              </div>
              <p className="section-title">Diagnosis</p>
              <p style={{ marginBottom: 16, fontSize: 14 }}>{selected.diagnosis}</p>
              <p className="section-title">Medicines</p>
              <table style={{ marginBottom: 16 }}>
                <thead>
                  <tr>
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
                      <td className="font-medium">{m.name}</td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>{m.duration}</td>
                      <td>{m.instructions || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selected.generalInstructions && (
                <>
                  <p className="section-title">General Instructions</p>
                  <p style={{ fontSize: 14 }}>{selected.generalInstructions}</p>
                </>
              )}
              {selected.followUpDate && (
                <p style={{ marginTop: 12, fontSize: 14 }}>
                  <strong>Follow-up Date:</strong> {formatDate(selected.followUpDate)}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <AddPrescriptionModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchPrescriptions(); }} />
    </div>
  );
};

export default PrescriptionsPage;