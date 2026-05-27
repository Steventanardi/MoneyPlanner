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
        <div className="card" style={{ padding: '22px', borderRadius: '24px', background: 'var(--card-bg)' }}>
            <h3 className="text-caption" style={{ marginBottom: '18px' }}>Top categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topCategories.map((cat, idx) => {
                    const percentage = Math.round((cat.value / expense) * 100);
                    const swatch = SWATCHES[idx % SWATCHES.length];
                    return (
                        <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '34px', height: '34px',
                                borderRadius: '11px',
                                background: swatch.fill,
                                color: swatch.ink,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: '800',
                                flexShrink: 0,
                            }}>
                                {cat.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{cat.name}</div>
                                <div style={{
                                    marginTop: '4px',
                                    height: '6px',
                                    background: 'var(--badge-bg)',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        background: swatch.fill,
                                        borderRadius: '3px',
                                    }} />
                                </div>
                            </div>
                            <div style={{
                                fontSize: '13px', fontWeight: '700',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-display)',
                                minWidth: '34px', textAlign: 'right',
                            }}>
                                {percentage}%
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopCategories;
