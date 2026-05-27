import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';

const InventoryHeader = ({ stats, onAdd }) => {
  const { formatCurrency } = useStore();

  return (
    <>
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
          onClick={onAdd}
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
    </>
  );
};

export default InventoryHeader;
