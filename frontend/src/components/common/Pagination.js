import React from 'react';

const Pagination = ({ currentPage, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1) return null;
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  return (
    <div className="pagination">
      <span>Showing {start}–{end} of {total} results</span>
      <div className="page-btns">
        <button className="page-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((page, idx, arr) => (
            <React.Fragment key={page}>
              {idx > 0 && arr[idx - 1] !== page - 1 && <span style={{ padding: '0 4px', color: 'var(--text-secondary)' }}>…</span>}
              <button className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => onPageChange(page)}>{page}</button>
            </React.Fragment>
          ))}
        <button className="page-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
      </div>
    </div>
  );
};

export default Pagination;