import React from 'react';
import { useStore } from '../../store/useStore';

/* Bento palette rotation — keeps the swatches cohesive instead of harsh primary colors. */
const SWATCHES = [
    { fill: 'var(--bento-peach)',    ink: 'var(--bento-peach-ink)' },
    { fill: 'var(--bento-mint)',     ink: 'var(--bento-mint-ink)' },
    { fill: 'var(--bento-lavender)', ink: 'var(--bento-lav-ink)' },
    { fill: 'var(--bento-sky)',      ink: 'var(--bento-sky-ink)' },
    { fill: 'var(--bento-blush)',    ink: 'var(--bento-blush-ink)' },
];

const TopCategories = ({ topCategories, expense }) => {
    const { formatCurrency } = useStore();

    if (!topCategories.length) return null;

    return (
        <div style={{
            padding: '22px',
            borderRadius: '24px',
            background: 'var(--card-bg)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '12px',
        }}>
            <div className="flex-between" style={{ marginBottom: '18px' }}>
                <h3 className="text-caption">Top categories</h3>
                <span className="text-caption">{topCategories.length} active</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {topCategories.map((cat, idx) => {
                    const percentage = Math.round((cat.value / expense) * 100);
                    const swatch = SWATCHES[idx % SWATCHES.length];
                    return (
                        <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px',
                                borderRadius: '13px',
                                background: swatch.fill,
                                color: swatch.ink,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', fontWeight: '800',
                                fontFamily: 'var(--font-display)',
                                flexShrink: 0,
                            }}>
                                {cat.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="flex-between" style={{ marginBottom: '5px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{cat.name}</span>
                                    <span style={{
                                        fontSize: '12px', fontWeight: '700',
                                        color: swatch.ink,
                                        background: swatch.fill,
                                        padding: '2px 8px',
                                        borderRadius: '99px',
                                        fontFamily: 'var(--font-display)',
                                    }}>
                                        {percentage}%
                                    </span>
                                </div>
                                <div style={{
                                    height: '8px',
                                    background: 'var(--badge-bg)',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        background: swatch.fill,
                                        borderRadius: '4px',
                                        transition: 'width 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                                    }} />
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '3px' }}>
                                    {formatCurrency(cat.value)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopCategories;
