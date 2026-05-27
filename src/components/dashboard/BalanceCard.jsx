import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

const BalanceCard = ({ balance, expenseDelta, expense }) => {
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

            <div className="flex-between" style={{
                paddingTop: '4px',
                borderTop: '1px solid rgba(107, 63, 26, 0.18)',
            }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--bento-peach-ink)', opacity: 0.75 }}>
                    Money you can move
                </span>
                <span className="bento-chip" style={{ color: 'var(--bento-peach-ink)', background: 'rgba(107, 63, 26, 0.12)' }}>
                    <Sparkles size={12} /> Safe to spend
                </span>
            </div>
        </div>
    );
};

export default BalanceCard;
