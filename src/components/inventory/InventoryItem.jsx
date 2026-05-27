import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getExpiryInfo, fmtDate } from './inventoryUtils';

const InventoryItem = ({ item, idx, deleteConfirm, onEdit, onDelete }) => {
  const { formatCurrency } = useStore();
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
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '4px', background: expiry.color, borderRadius: '4px 0 0 4px'
      }} />

      <div style={{ padding: '16px 16px 16px 20px' }}>
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

          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={() => onEdit(item)}
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
              onClick={() => onDelete(item.id)}
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
};

export default InventoryItem;
