import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

const BudgetHealthStrip = ({ budgetHealth }) => {
    const { setActiveScreen } = useStore();

    if (!budgetHealth) return null;

    const allOnTrack = budgetHealth.onTrack === budgetHealth.total;
    const tint = allOnTrack ? 'var(--bento-mint)' : 'var(--bento-butter)';
    const ink  = allOnTrack ? 'var(--bento-mint-ink)' : 'var(--bento-butter-ink)';

    return (
        <motion.div
            whileTap={{ scale: 0.985 }}
            onClick={() => setActiveScreen('monthly')}
            className="bento-card"
            style={{
                background: tint,
                color: ink,
                padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '20px',
                marginTop: '4px',
                cursor: 'pointer',
                borderRadius: '18px',
            }}
        >
            <span style={{ fontWeight: '700', fontSize: '14px', color: ink }}>Budget health</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: ink, fontFamily: 'var(--font-display)' }}>
                    {budgetHealth.onTrack}/{budgetHealth.total} on track
                </span>
                <ChevronRight size={16} color={ink} style={{ opacity: 0.6 }} />
            </div>
        </motion.div>
    );
};

export default BudgetHealthStrip;
