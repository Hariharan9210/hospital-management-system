export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const getStatusBadge = (status) => {
  const map = {
    scheduled: 'badge-info',
    confirmed: 'badge-primary',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    'no-show': 'badge-secondary',
    active: 'badge-success',
    resolved: 'badge-secondary',
    chronic: 'badge-warning',
    pending: 'badge-warning',
    paid: 'badge-success',
    partial: 'badge-info',
    refunded: 'badge-purple',
    male: 'badge-info',
    female: 'badge-purple',
    other: 'badge-secondary'
  };
  return map[status] || 'badge-secondary';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};