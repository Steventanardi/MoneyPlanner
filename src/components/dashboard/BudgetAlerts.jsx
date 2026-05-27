import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

const BudgetAlerts = ({ budgetAlerts }) => {
    const { setActiveScreen } = useStore();

    if (!budgetAlerts.length) return null;

    return (
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {budgetAlerts.map(alert => {
                const overBudget = alert.pct >= 1;
                const tint = overBudget ? 'var(--bento-blush)' : 'var(--bento-butter)';
                const ink  = overBudget ? 'var(--bento-blush-ink)' : 'var(--bento-butter-ink)';
                return (
                    <motion.div
                        key={alert.category}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setActiveScreen('monthly')}
                        style={{
                            background: tint,
                            color: ink,
                            border: 'none',
                            borderRadius: '18px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                        }}
                    >
                        <AlertCircle size={16} color={ink} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: ink }}>
                            {overBudget
                                ? `${alert.category} budget exceeded (${Math.round(alert.pct * 100)}%)`
                                : `${alert.category} at ${Math.round(alert.pct * 100)}% of budget`}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default BudgetAlerts;
