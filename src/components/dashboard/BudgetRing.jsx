import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../../store/useStore';

const BudgetRing = ({ expense }) => {
    const { data, formatCurrency, setActiveScreen } = useStore();

    const budget = data?.monthlyBudget || 30000;
    const pct = budget > 0 ? Math.min(100, (expense / budget) * 100) : 0;
    const remaining = Math.max(0, budget - expense);

    // Ring color stays semantic but uses lavender's own deep ink when healthy,
    // so it harmonizes with the bento fill instead of fighting it.
    const ringColor = pct > 90
        ? 'var(--accent-danger)'
        : pct > 75
            ? 'var(--accent-warning)'
            : 'var(--accent-purple)';

    const donutData = [
        { value: expense },
        { value: Math.max(0, budget - expense) }
    ];

    return (
        <motion.div
            whileTap={{ scale: 0.985 }}
            onClick={() => setActiveScreen('monthly')}
            className="bento-card bento-lavender"
            style={{
                padding: '20px 22px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                cursor: 'pointer',
                marginTop: '16px',
                marginBottom: 0,
            }}
        >
            <div style={{ position: 'relative', width: '76px', height: '76px', flexShrink: 0 }}>
                <PieChart width={76} height={76}>
                    <Pie
                        data={donutData}
                        cx={32} cy={32}
                        innerRadius={26} outerRadius={36}
                        startAngle={90} endAngle={-270}
                        dataKey="value" strokeWidth={0}
                    >
                        <Cell fill={ringColor} />
                        <Cell fill="rgba(60, 42, 107, 0.18)" />
                    </Pie>
                </PieChart>
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '800',
                    color: 'var(--bento-lav-ink)',
                    fontFamily: 'var(--font-display)',
                }}>
                    {Math.round(pct)}%
                </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '10px', fontWeight: '700',
                    color: 'var(--bento-lav-ink)', opacity: 0.7,
                    textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px'
                }}>
                    Monthly budget
                </div>
                <div className="bento-num" style={{
                    fontSize: '20px',
                    color: 'var(--bento-lav-ink)',
                }}>
                    {formatCurrency(remaining)} <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.7 }}>left</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--bento-lav-ink)', opacity: 0.7, fontWeight: '500', marginTop: '2px' }}>
                    {formatCurrency(expense)} spent of {formatCurrency(budget)}
                </div>
            </div>

            <ChevronRight size={18} color="var(--bento-lav-ink)" style={{ flexShrink: 0, opacity: 0.6 }} />
        </motion.div>
    );
};

export default BudgetRing;
