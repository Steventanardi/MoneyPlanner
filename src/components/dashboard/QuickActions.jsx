import React from 'react';
import { Plus, Banknote, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

const iconBtn = (bg, color) => ({
    width: '60px', height: '60px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '20px',
    background: bg,
    color,
    border: 'none',
    flexShrink: 0,
});

const QuickActions = () => {
    const { setActiveScreen } = useStore();

    return (
        <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
            <motion.button
                className="btn-primary"
                whileTap={{ scale: 0.96 }}
                style={{ flex: 1, height: '60px', fontSize: '15px', borderRadius: '20px', gap: '8px' }}
                onClick={() => useStore.getState().setIsAddingTransaction(true)}
            >
                <Plus size={20} strokeWidth={2.6} /> New entry
            </motion.button>

            <motion.button
                aria-label="Open vault"
                whileTap={{ scale: 0.93 }}
                style={iconBtn('var(--bento-sky)', 'var(--bento-sky-ink)')}
                onClick={() => setActiveScreen('banks')}
            >
                <Banknote size={24} strokeWidth={2.2} />
            </motion.button>

            <motion.button
                aria-label="Inventory"
                whileTap={{ scale: 0.93 }}
                style={iconBtn('var(--bento-mint)', 'var(--bento-mint-ink)')}
                onClick={() => setActiveScreen('inventory')}
            >
                <Package size={22} strokeWidth={2.2} />
            </motion.button>
        </div>
    );
};

export default QuickActions;
