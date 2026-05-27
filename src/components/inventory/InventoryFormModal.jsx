import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ScanLine } from 'lucide-react';
import { useStore } from '../../store/useStore';
import useResponsive from '../../hooks/useResponsive';

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

const InventoryFormModal = ({ showModal, editItem, form, setForm, isFormValid, onSave, onClose, onScanClick }) => {
  const { formatCurrency } = useStore();
  const { isDesktop } = useResponsive();

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: isDesktop ? 'center' : 'flex-end',
            justifyContent: isDesktop ? 'center' : 'stretch',
            padding: isDesktop ? '24px' : '0'
          }}
          onClick={e => e.target === e.currentTarget && onClose()}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900' }}>
                {editItem ? 'Edit Item' : 'Add Stock Item'}
              </h2>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
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
              {!editItem && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onScanClick}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '14px', borderRadius: '14px', cursor: 'pointer',
                    border: '1.5px dashed var(--accent-primary)',
                    background: 'rgba(0,122,255,0.07)', color: 'var(--accent-primary)',
                    fontSize: '14px', fontWeight: '800', width: '100%'
                  }}
                >
                  <ScanLine size={18} />
                  Scan Barcode to Auto-Fill
                </motion.button>
              )}

              <div>
                <label style={labelStyle}>Item Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rice, Milk, Vitamins…"
                  style={inputStyle}
                />
              </div>

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

              <div>
                <label style={labelStyle}>Notes</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes…"
                  style={inputStyle}
                />
              </div>

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

              {!isFormValid && (form.name || form.quantity || form.buyPrice || form.buyDate) && (
                <p style={{ fontSize: '12px', color: 'var(--accent-danger)', fontWeight: '600', textAlign: 'center' }}>
                  * Item name, total items, buy price & buy date are required
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onSave}
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
  );
};

export default InventoryFormModal;
