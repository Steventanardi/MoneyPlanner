export const getExpiryInfo = (expiryDate) => {
  if (!expiryDate) return { label: 'No Expiry', color: '#8E8E93', bgColor: 'rgba(142,142,147,0.12)', daysLeft: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0)  return { label: `Expired ${Math.abs(daysLeft)}d ago`, color: '#FF3B30', bgColor: 'rgba(255,59,48,0.12)', daysLeft };
  if (daysLeft === 0) return { label: 'Expires Today!', color: '#FF3B30', bgColor: 'rgba(255,59,48,0.12)', daysLeft };
  if (daysLeft <= 3)  return { label: `${daysLeft}d left`, color: '#FF3B30', bgColor: 'rgba(255,59,48,0.12)', daysLeft };
  if (daysLeft <= 7)  return { label: `${daysLeft}d left`, color: '#FF9500', bgColor: 'rgba(255,149,0,0.12)', daysLeft };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: '#FFCC00', bgColor: 'rgba(255,204,0,0.12)', daysLeft };
  return { label: `${daysLeft}d left`, color: '#34C759', bgColor: 'rgba(52,199,89,0.12)', daysLeft };
};

export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : null;

export const EMPTY_FORM = { name: '', quantity: '', buyDate: '', expiryDate: '', buyPrice: '', notes: '' };
