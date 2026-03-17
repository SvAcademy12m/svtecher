/** Date formatting helpers */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp?.seconds ? timestamp.seconds * 1000 : timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp?.seconds ? timestamp.seconds * 1000 : timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/** Currency formatter */
export const formatCurrency = (amount, currency = 'ETB') => {
  return `${Number(amount || 0).toLocaleString()} ${currency}`;
};

/** Truncate text */
export const truncate = (text, maxLength = 120) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/** Capitalize first letter */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/** Generate initials from name */
export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};
