import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ChevronRight, Shield, PiggyBank } from 'lucide-react';
import { useStore } from '../../store/useStore';

/* Each stat tile gets its own Bento fill so the grid reads like a candy shop, not a spreadsheet. */
const TILES = {
    income:    { tint: 'var(--bento-mint)',   ink: 'var(--bento-mint-ink)',   iconBg: 'rgba(14, 50, 32, 0.12)' },
    emergency: { tint: 'var(--bento-butter)', ink: 'var(--bento-butter-ink)', iconBg: 'rgba(92, 63, 0, 0.12)' },
    expenses:  { tint: 'var(--bento-blush)',  ink: 'var(--bento-blush-ink)',  iconBg: 'rgba(107, 31, 61, 0.12)' },
    savings:   { tint: 'var(--bento-sky)',    ink: 'var(--bento-sky-ink)',    iconBg: 'rgba(20, 57, 87, 0.12)' },
};

const StatTile = ({ kind, label, value, Icon, onClick, formatCurrency }) => {
    const t = TILES[kind];
    return (
        <motion.div
            layout
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className="bento-card"
            style={{
                background: t.tint,
                color: t.ink,
                padding: '20px',
                borderRadius: '24px',
                marginBottom: 0,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                minHeight: '128px',
            }}
        >
            <div className="flex-between">
                <div style={{
                    width: '36px', height: '36px', borderRadius: '12px',
                    background: t.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={18} color={t.ink} strokeWidth={2.2} />
                </div>
                <ChevronRight size={16} color={t.ink} style={{ opacity: 0.5 }} />
            </div>
            <div>
                <p style={{
                    fontSize: '10px', fontWeight: '700',
                    color: t.ink, opacity: 0.7,
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                    marginBottom: '4px',
                }}>
                    {label}
                </p>
                <h3 className="bento-num" style={{ fontSize: '22px', color: t.ink }}>
                    {formatCurrency(value)}
                </h3>
            </div>
        </motion.div>
    );
};

const StatGrid = ({ income, expense, balance, emergencyFund, onStatClick }) => {
    const { formatCurrency } = useStore();

    return (
        <div style={{ margin: '20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <StatTile
                kind="income" label="Income" value={income} Icon={TrendingUp}
                formatCurrency={formatCurrency}
                onClick={() => onStatClick({ type: 'Income', icon: <TrendingUp color="var(--bento-mint-ink)" />, val: income })}
            />
            <StatTile
                kind="emergency" label="Emergency" value={emergencyFund} Icon={Shield}
                formatCurrency={formatCurrency}
                onClick={() => onStatClick({ type: 'Emergency', icon: <Shield color="var(--bento-butter-ink)" />, val: emergencyFund })}
            />
            <StatTile
                kind="expenses" label="Expenses" value={expense} Icon={TrendingDown}
                formatCurrency={formatCurrency}
                onClick={() => onStatClick({ type: 'Expenses', icon: <TrendingDown color="var(--bento-blush-ink)" />, val: expense })}
            />
            <StatTile
                kind="savings" label="Savings" value={balance} Icon={PiggyBank}
                formatCurrency={formatCurrency}
                onClick={() => onStatClick({ type: 'Savings', icon: <PiggyBank color="var(--bento-sky-ink)" />, val: balance })}
            />
        </div>
    );
};

export default StatGrid;
