import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Trash2, Edit2, Calendar, X, AlertTriangle, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import useResponsive from '../hooks/useResponsive';

const getExpiryInfo = (expiryDate) => {
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

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : null;

const EMPTY_FORM = { name: '', quantity: '', buyDate: '', expiryDate: '', buyPrice: '', notes: '' };

const Inventory = () => {
  const { data, currentUser, addInventoryItem, updateInventoryItem, deleteInventoryItem, formatCurrency } = useStore();
  const { isDesktop } = useResponsive();
  const [filter, setFilter]         = useState('all');
  const [sort, setSort]             = useState('expiry');
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const items = useMemo(() =>
    (data.inventory || []).filter(i => i.userId === currentUser?.id),
    [data.inventory, currentUser]
  );

  const stats = useMemo(() => {
    const totalQty   = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const totalValue = items.reduce((s, i) => s + Number(i.buyPrice || 0), 0);
    const urgent     = items.filter(i => { const { daysLeft } = getExpiryInfo(i.expiryDate); return daysLeft !== null && daysLeft <= 7; }).length;
    return { total: items.length, totalQty, totalValue, urgent };
  }, [items]);

  const sortedItems = useMemo(() => {
    const list = filter === 'expiring'
      ? items.filter(i => { const { daysLeft } = getExpiryInfo(i.expiryDate); return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7; })
      : filter === 'expired'
      ? items.filter(i => { const { daysLeft } = getExpiryInfo(i.expiryDate); return daysLeft !== null && daysLeft < 0; })
      : [...items];

    const filtered = search.trim()
      ? list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.notes || '').toLowerCase().includes(search.toLowerCase()))
      : list;

    return filtered.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'value') return Number(b.buyPrice || 0) - Number(a.buyPrice || 0);
      if (sort === 'newest') return new Date(b.buyDate || 0) - new Date(a.buyDate || 0);
      const ai = getExpiryInfo(a.expiryDate), bi = getExpiryInfo(b.expiryDate);
      if (ai.daysLeft === null && bi.daysLeft === null) return 0;
      if (ai.daysLeft === null) return 1;
      if (bi.daysLeft === null) return -1;
      return ai.daysLeft - bi.daysLeft;
    });
  }, [items, filter, sort, search]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, buyDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name || '', quantity: item.quantity || '', buyDate: item.buyDate || '', expiryDate: item.expiryDate || '', buyPrice: item.buyPrice || '', notes: item.notes || '' });
    setShowModal(true);
  };

  const isFormValid = form.name.trim() && form.quantity && form.buyPrice && form.buyDate;

  const handleSave = () => {
    if (!isFormValid) return;
    const payload = { ...form, quantity: Number(form.quantity), buyPrice: Number(form.buyPrice) };
    if (editItem) updateInventoryItem(editItem.id, payload);
    else addInventoryItem(payload);
    setShowModal(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteInventoryItem(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(c => c === id ? null : c), 3000);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: '14px',
    border: '1.5px solid var(--glass-border)', background: 'var(--input-bg)',
    fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px'
  };

  return (
    <div className="screen-container" style={{ paddingBottom: '120px' }}>

      {/* Header */}
      <div className="screen-header">
        <div>
          <h1 className="text-h1">
            Stock <span style={{ color: 'var(--accent-primary)' }}>Inventory</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '600' }}>
            {stats.total} product{stats.total !== 1 ? 's' : ''} · {stats.totalQty} units
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={openAdd}
          style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'var(--accent-primary)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px -4px rgba(0,122,255,0.45)'
          }}
        >
          <Plus size={22} color="white" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Products', value: stats.total, color: 'var(--accent-primary)', large: true },
          { label: 'Total Value', value: formatCurrency(stats.totalValue), color: '#34C759', large: false },
          { label: 'Urgent', value: stats.urgent, color: stats.urgent > 0 ? '#FF9500' : 'var(--text-secondary)', large: true },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card glass-card"
            style={{ padding: '14px', textAlign: 'center' }}
          >
            <div style={{ fontSize: s.large ? '24px' : '13px', fontWeight: '900', color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.3px' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items…"
          style={{ paddingLeft: '42px', paddingRight: search ? '36px' : '14px', height: '44px', borderRadius: '14px', marginBottom: 0 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: '4px' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { id: 'all', label: 'All Items' },
          { id: 'expiring', label: 'Expiring Soon' },
          { id: 'expired', label: 'Expired' },
        ].map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '9px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0,
              background: filter === tab.id ? 'var(--accent-primary)' : 'var(--card-bg)',
              color: filter === tab.id ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              boxShadow: filter === tab.id ? '0 4px 12px -2px rgba(0,122,255,0.35)' : 'none'
            }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Sort Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>
          Sort:
        </span>
        {[
          { id: 'expiry', label: 'Expiry' },
          { id: 'name',   label: 'Name' },
          { id: 'value',  label: 'Value' },
          { id: 'newest', label: 'Newest' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSort(s.id)}
            style={{
              padding: '6px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap',
              background: sort === s.id ? 'var(--text-primary)' : 'var(--input-bg)',
              color: sort === s.id ? 'var(--card-bg)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '60px 20px' }}
        >
          <div style={{
            width: '88px', height: '88px', borderRadius: '30px',
            background: 'var(--card-bg)', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Package size={38} color="var(--text-secondary)" strokeWidth={1.5} />
          </div>
          <p style={{ fontWeight: '900', fontSize: '18px', marginBottom: '8px' }}>
            {filter === 'all' ? 'No items yet' : `No ${filter} items`}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
            {filter === 'all' ? 'Tap + to add your first stock item' : 'Switch to "All Items" to see everything'}
          </p>
        </motion.div>
      )}

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {sortedItems.map((item, idx) => {
            const expiry = getExpiryInfo(item.expiryDate);
            const isDeleting = deleteConfirm === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                transition={{ delay: idx * 0.03, exit: { duration: 0.2 } }}
                className="card glass-card"
                style={{ padding: '0', position: 'relative', overflow: 'hidden' }}
              >
                {/* Color accent strip */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: '4px', background: expiry.color, borderRadius: '4px 0 0 4px'
                }} />

                <div style={{ padding: '16px 16px 16px 20px' }}>
                  {/* Top row: name + badge + actions */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                        <span style={{
                          padding: '3px 9px', borderRadius: '8px', flexShrink: 0,
                          background: expiry.bgColor, color: expiry.color,
                          fontSize: '11px', fontWeight: '800'
                        }}>
                          {expiry.label}
                        </span>
                      </div>

                      {/* Qty + price row */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '13px', fontWeight: '700',
                          color: 'var(--text-secondary)',
                          background: 'var(--input-bg)',
                          padding: '2px 8px', borderRadius: '7px'
                        }}>
                          × {item.quantity} units
                        </span>
                        {item.buyPrice > 0 && (
                          <span style={{ fontSize: '13px', color: '#34C759', fontWeight: '800' }}>
                            {formatCurrency(item.buyPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <motion.button
                        whileTap={{ scale: 0.82 }}
                        onClick={() => openEdit(item)}
                        style={{
                          background: 'var(--input-bg)', border: 'none',
                          width: '34px', height: '34px', borderRadius: '10px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Edit2 size={14} color="var(--text-secondary)" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.82 }}
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: isDeleting ? 'rgba(255,59,48,0.15)' : 'var(--input-bg)',
                          border: isDeleting ? '1.5px solid rgba(255,59,48,0.4)' : 'none',
                          width: '34px', height: '34px', borderRadius: '10px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Trash2 size={14} color={isDeleting ? '#FF3B30' : 'var(--text-secondary)'} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Date row */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {item.buyDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={11} color="var(--text-secondary)" />
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          Bought {fmtDate(item.buyDate)}
                        </span>
                      </div>
                    )}
                    {item.expiryDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <AlertTriangle size={11} color={expiry.color} />
                        <span style={{ fontSize: '11px', color: expiry.color, fontWeight: '700' }}>
                          Exp {fmtDate(item.expiryDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {item.notes}
                    </p>
                  )}

                  {isDeleting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ marginTop: '10px', fontSize: '12px', color: '#FF3B30', fontWeight: '700', textAlign: 'center' }}
                    >
                      Tap trash again to confirm delete
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: isDesktop ? 'center' : 'flex-end',
              justifyContent: isDesktop ? 'center' : 'stretch',
              padding: isDesktop ? '24px' : '0'
            }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={isDesktop ? { opacity: 0, scale: 0.95, y: 0 } : { y: '100%' }}
              animate={isDesktop ? { opacity: 1, scale: 1, y: 0 }   : { y: 0 }}
              exit={isDesktop  ? { opacity: 0, scale: 0.95, y: 0 }  : { y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              style={{
                width: '100%', maxWidth: isDesktop ? '560px' : '100%',
                background: 'var(--card-bg)',
                borderRadius: isDesktop ? '28px' : '28px 28px 0 0',
                padding: '24px 24px 44px',
                maxHeight: '88vh', overflowY: 'auto'
              }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900' }}>
                  {editItem ? 'Edit Item' : 'Add Stock Item'}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'var(--input-bg)', border: 'none',
                    width: '36px', height: '36px', borderRadius: '12px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <X size={18} color="var(--text-secondary)" />
                </motion.button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Name */}
                <div>
                  <label style={labelStyle}>Item Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rice, Milk, Vitamins…"
                    style={inputStyle}
                  />
                </div>

                {/* Qty + Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Total Items *</label>
                    <input
                      type="number" min="1"
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: e.target.value })}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Buy Price *</label>
                    <input
                      type="number" min="0"
                      value={form.buyPrice}
                      onChange={e => setForm({ ...form, buyPrice: e.target.value })}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Buy Date *</label>
                    <input
                      type="date"
                      value={form.buyDate}
                      onChange={e => setForm({ ...form, buyDate: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Expiry Date</label>
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Notes</label>
                  <input
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional notes…"
                    style={inputStyle}
                  />
                </div>

                {/* Confirmation preview */}
                {form.buyPrice > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      padding: '12px 16px', borderRadius: '14px',
                      background: 'rgba(52,199,89,0.1)', border: '1.5px solid rgba(52,199,89,0.25)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Total paid</span>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#34C759' }}>
                      {formatCurrency(Number(form.buyPrice))}
                    </span>
                  </motion.div>
                )}

                {/* Required field hint */}
                {!isFormValid && (form.name || form.quantity || form.buyPrice || form.buyDate) && (
                  <p style={{ fontSize: '12px', color: 'var(--accent-danger)', fontWeight: '600', textAlign: 'center' }}>
                    * Item name, total items, buy price & buy date are required
                  </p>
                )}

                {/* Save button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={!isFormValid}
                  style={{
                    width: '100%', padding: '17px', borderRadius: '16px',
                    border: 'none', cursor: isFormValid ? 'pointer' : 'default',
                    background: isFormValid ? 'var(--accent-primary)' : 'var(--input-bg)',
                    color: isFormValid ? 'white' : 'var(--text-secondary)',
                    fontSize: '16px', fontWeight: '800', marginTop: '4px',
                    boxShadow: isFormValid ? '0 8px 20px -4px rgba(0,122,255,0.4)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {editItem ? 'Save Changes' : 'Add to Inventory'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
