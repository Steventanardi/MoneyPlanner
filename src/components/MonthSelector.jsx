import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const MonthSelector = () => {
    const { selectedMonth, setSelectedMonth } = useStore();

    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const year = d.getFullYear();
        const monthNum = String(d.getMonth() + 1).padStart(2, '0');
        const label = d.toLocaleDateString('en-US', { month: 'long' });
        return { value: `${year}-${monthNum}`, label };
    }).reverse();

    return (
        <div
            className="no-scrollbar"
            style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '4px 20px 18px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            }}
        >
            {months.map(({ value, label }) => {
                const isActive = selectedMonth === value;
                return (
                    <button
                        key={value}
                        onClick={() => setSelectedMonth(value)}
                        style={{
                            position: 'relative',
                            padding: '10px 18px',
                            background: 'transparent',
                            border: 'none',
                            color: isActive ? 'var(--bento-peach-ink)' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: isActive ? '700' : '600',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'color 0.2s ease',
                            borderRadius: '16px',
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '-0.1px',
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="active-month"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'var(--bento-peach)',
                                    borderRadius: '16px',
                                    zIndex: -1,
                                }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

export default MonthSelector;
