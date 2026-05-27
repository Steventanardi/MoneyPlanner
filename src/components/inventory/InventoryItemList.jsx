import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import InventoryItem from './InventoryItem';

const InventoryItemList = ({ sortedItems, filter, deleteConfirm, onEdit, onDelete }) => (
  <>
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

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <AnimatePresence>
        {sortedItems.map((item, idx) => (
          <InventoryItem
            key={item.id}
            item={item}
            idx={idx}
            deleteConfirm={deleteConfirm}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  </>
);

export default InventoryItemList;
