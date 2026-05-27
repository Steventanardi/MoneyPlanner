import React from 'react';
import { Sparkles, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';

const BalanceCard = ({ balance, expenseDelta, expense, income }) => {
    const { formatCurrency, exchangeRate } = useStore();

    return (
        <div className="bento-card bento-peach" style={{
            padding: '26px 26px 28px',
            borderRadius: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: 'var(--shadow-md)',
        }}>
            <div className="flex-between">
                <span style={{
                    fontSize: '11px', fontWeight: '700',
                    color: 'var(--bento-peach-ink)', opacity: 0.7,
                    letterSpacing: '0.6px', textTransform: 'uppercase',
                }}>
                    Current Balance
                </span>
                <span className="bento-chip" style={{ color: 'var(--bento-peach-ink)' }}>
                    <Clock size={10} /> 1 TWD = {exchangeRate.toFixed(2)} IDR
                </span>
            </div>

            <div>
                <h2 className="bento-num" style={{
                    fontSize: '42px',
                    color: 'var(--bento-peach-ink)',
                    lineHeight: 1.05,
                }}>
                    {formatCurrency(balance)}
                </h2>
                {expenseDelta !== null && expense > 0 && (
                    <div className="bento-chip" style={{
                        marginTop: '10px',
                        color: 'var(--bento-peach-ink)',
                    }}>
                        {expenseDelta > 0 ? '↑' : '↓'} {Math.abs(expenseDelta).toFixed(0)}% spending vs last month
                    </div>
                )}
            </div>

            <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(107, 63, 26, 0.18)', display: 'flex', gap: '10px' }}>
                <div style={{
                    flex: 1, background: 'rgba(107, 63, 26, 0.10)',
                    borderRadius: '14px', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <ArrowUpRight size={14} color="var(--bento-peach-ink)" strokeWidth={2.6} />
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--bento-peach-ink)', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.4px' }}>In</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--bento-peach-ink)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{formatCurrency(income ?? 0)}</div>
                    </div>
                </div>
                <div style={{
                    flex: 1, background: 'rgba(107, 63, 26, 0.10)',
                    borderRadius: '14px', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <ArrowDownLeft size={14} color="var(--bento-peach-ink)" strokeWidth={2.6} />
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--bento-peach-ink)', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Out</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--bento-peach-ink)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{formatCurrency(expense)}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="bento-chip" style={{ color: 'var(--bento-peach-ink)', background: 'rgba(107, 63, 26, 0.10)', whiteSpace: 'nowrap' }}>
                        <Sparkles size={11} /> Safe
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;
