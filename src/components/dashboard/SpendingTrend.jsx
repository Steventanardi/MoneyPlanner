import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';

const SpendingTrend = ({ trendData }) => {
    const { formatCurrency, setActiveScreen } = useStore();

    // Trend lives on a blush bento card. Line color stays in the blush ink family.
    const lineColor = 'var(--bento-blush-ink)';
    const fillTopColor = 'rgba(107, 31, 61, 0.28)';
    const fillBottomColor = 'rgba(107, 31, 61, 0)';

    return (
        <>
            <div className="flex-between" style={{ marginBottom: '14px', padding: '0 4px' }}>
                <h2 className="text-h2" style={{ margin: 0 }}>Smart insights</h2>
                <span
                    onClick={() => setActiveScreen('monthly')}
                    style={{
                        fontSize: '12px', fontWeight: '700',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        background: 'var(--badge-bg)',
                    }}
                >
                    View more
                </span>
            </div>

            <div className="bento-card bento-blush" style={{
                height: '220px',
                padding: '20px 18px 8px',
                borderRadius: '24px',
                marginBottom: '12px',
            }}>
                <h3 style={{
                    fontSize: '11px', fontWeight: '700',
                    color: 'var(--bento-blush-ink)', opacity: 0.75,
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                    marginBottom: '12px', padding: '0 4px',
                }}>
                    7-day spending trend
                </h3>
                <div style={{ width: '100%', height: '140px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={[0, 'auto']} />
                            <Tooltip
                                cursor={{ stroke: 'rgba(107, 31, 61, 0.25)', strokeWidth: 2 }}
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '14px',
                                    boxShadow: 'var(--shadow-md)',
                                    padding: '10px 12px',
                                }}
                                itemStyle={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '700' }}
                                labelStyle={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '2px' }}
                                formatter={(val) => [formatCurrency(val), 'Spent']}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke={lineColor}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTrend)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};

export default SpendingTrend;
