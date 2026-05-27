import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

const InventoryFilters = ({ search, setSearch, filter, setFilter, sort, setSort }) => (
  <>
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
  </>
);

export default InventoryFilters;
