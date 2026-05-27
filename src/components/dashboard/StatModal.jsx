import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Modal from '../Modal';
import TransactionForm from '../TransactionForm';

/* Map stat type to a Bento palette so the modal hero feels like the tile that opened it. */
const TYPE_TINT = {
    Income:    { tint: 'var(--bento-mint)',   ink: 'var(--bento-mint-ink)' },
    Expenses:  { tint: 'var(--bento-blush)',  ink: 'var(--bento-blush-ink)' },
    Savings:   { tint: 'var(--bento-sky)',    ink: 'var(--bento-sky-ink)' },
    Emergency: { tint: 'var(--bento-butter)', ink: 'var(--bento-butter-ink)' },
};

const StatModal = ({ statModal, onClose, topCategories, topIncomeCategories, activeMonthTransactions }) => {
    const { data, currentUser, formatCurrency, updateEmergencyFund } = useStore();
    const [isEditingEmergency, setIsEditingEmergency] = React.useState(false);
    const [showQuickAdd, setShowQuickAdd] = React.useState(false);

    const handleClose = () => {
        setIsEditingEmergency(false);
        setShowQuickAdd(false);
        onClose();
    };

    const palette = TYPE_TINT[statModal?.type] || TYPE_TINT.Income;

    return (
        <Modal
            isOpen={!!statModal}
            onClose={handleClose}
            title={statModal?.type + " details"}
        >
            <div style={{ textAlign: 'center', padding: '4px 0 16px' }}>
                <div style={{
                    width: '88px', height: '88px',
                    borderRadius: '26px',
                    background: palette.tint,
                    color: palette.ink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                }}>
                    {statModal?.icon}
                </div>

                <div style={{
                    fontSize: '11px', fontWeight: '700',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.8px',
                }}>
                    Total {statModal?.type}
                </div>

                {isEditingEmergency && statModal?.type === 'Emergency' ? (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <input
                            type="number"
                            autoFocus
                            defaultValue={statModal?.val}
                            onBlur={(e) => {
                                updateEmergencyFund(e.target.value);
                                setIsEditingEmergency(false);
                            }}
                            style={{
                                width: '180px', textAlign: 'center',
                                fontSize: '30px', fontWeight: '800',
                                fontFamily: 'var(--font-display)',
                                padding: '14px', margin: 0,
                                background: 'var(--input-bg)', border: 'none',
                                borderRadius: '18px', color: 'var(--text-primary)',
                            }}
                        />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            onClick={() => statModal?.type === 'Emergency' && setIsEditingEmergency(true)}
                            className="bento-num"
                            style={{
                                fontSize: '42px', marginTop: '6px',
                                color: 'var(--text-primary)',
                                cursor: statModal?.type === 'Emergency' ? 'pointer' : 'default',
                            }}
                        >
                            {formatCurrency(statModal?.val || 0)}
                        </div>
                        {statModal?.type === 'Emergency' && (
                            <button
                                onClick={() => setIsEditingEmergency(true)}
                                style={{
                                    marginTop: '10px',
                                    background: 'var(--badge-bg)', border: 'none',
                                    padding: '7px 14px', borderRadius: '12px',
                                    color: 'var(--accent-primary)',
                                    fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                    letterSpacing: '0.4px', textTransform: 'uppercase',
                                }}
                            >
                                Adjust reserve goal
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div style={{ padding: '12px 0 0' }}>
                <div style={{ padding: '0 0 20px' }}>
                    <div className="flex-between" style={{ marginBottom: '14px' }}>
                        <h4 style={{
                            fontSize: '11px', fontWeight: '700',
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase', letterSpacing: '0.6px',
                        }}>
                            {statModal?.type === 'Expenses' ? 'Breakdown by category'
                                : statModal?.type === 'Income' ? 'Breakdown by source'
                                : statModal?.type === 'Savings' ? 'Assets location'
                                : 'Allocation breakdown'}
                        </h4>
                        {(statModal?.type === 'Income' || statModal?.type === 'Expenses') && (
                            <button
                                onClick={() => setShowQuickAdd(!showQuickAdd)}
                                style={{
                                    background: 'var(--badge-bg)', border: 'none',
                                    padding: '6px 12px', borderRadius: '12px',
                                    color: 'var(--accent-primary)',
                                    fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                    letterSpacing: '0.4px', textTransform: 'uppercase',
                                }}
                            >
                                {showQuickAdd ? 'Cancel' : '+ Quick add'}
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showQuickAdd && (statModal?.type === 'Income' || statModal?.type === 'Expenses') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden', marginBottom: '20px' }}
                            >
                                <div style={{
                                    padding: '20px',
                                    background: 'var(--badge-bg)',
                                    borderRadius: '22px',
                                }}>
                                    <TransactionForm
                                        initialData={{ type: statModal.type === 'Income' ? 'income' : 'expense' }}
                                        onComplete={() => setShowQuickAdd(false)}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(statModal?.type === 'Expenses' || statModal?.type === 'Income') && (
                            (statModal.type === 'Expenses' ? topCategories : topIncomeCategories).map(cat => (
                                <div
                                    key={cat.name}
                                    style={{
                                        padding: '14px 18px',
                                        borderRadius: '18px',
                                        background: 'var(--badge-bg)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '10px', height: '10px', borderRadius: '50%',
                                            backgroundColor: statModal.type === 'Expenses' ? 'var(--accent-danger)' : 'var(--accent-success)',
                                        }} />
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{cat.name}</div>
                                    </div>
                                    <div style={{
                                        fontWeight: '700', fontSize: '15px',
                                        fontFamily: 'var(--font-display)',
                                    }}>
                                        {formatCurrency(cat.value)}
                                    </div>
                                </div>
                            ))
                        )}

                        {statModal?.type === 'Savings' && data.banks.filter(b => b.userId === currentUser?.id || b.isJoint).map(bank => (
                            <div
                                key={bank.id}
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: '18px',
                                    background: 'var(--badge-bg)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        background: 'var(--bento-sky)',
                                        width: '38px', height: '38px',
                                        borderRadius: '13px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Banknote size={18} color="var(--bento-sky-ink)" />
                                    </div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{bank.name}</div>
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-display)' }}>
                                    {formatCurrency(bank.value, bank.currency)}
                                </div>
                            </div>
                        ))}

                        {statModal?.type === 'Emergency' && (
                            <div style={{
                                padding: '20px',
                                background: 'var(--bento-butter)',
                                color: 'var(--bento-butter-ink)',
                                borderRadius: '20px',
                                textAlign: 'left',
                            }}>
                                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', fontWeight: '500' }}>
                                    This reserve is your liquid safety net. It should ideally cover 3–6 months of essential living expenses. You can adjust this goal based on your risk tolerance.
                                </p>
                            </div>
                        )}
                    </div>

                    {(statModal?.type === 'Expenses' || statModal?.type === 'Income') && (
                        <div style={{ marginTop: '28px' }}>
                            <h4 style={{
                                fontSize: '11px', fontWeight: '700',
                                color: 'var(--text-secondary)',
                                textTransform: 'uppercase', letterSpacing: '0.6px',
                                marginBottom: '14px',
                            }}>
                                Latest 5 {statModal?.type}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {activeMonthTransactions
                                    .filter(t => (statModal?.type === 'Expenses' ? t.type === 'expense' : t.type === 'income'))
                                    .slice(0, 5)
                                    .map(t => (
                                        <div
                                            key={t.id}
                                            style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '12px 16px',
                                                background: 'var(--badge-bg)',
                                                borderRadius: '16px',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{t.description || t.category}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>{t.category} • {t.date}</div>
                                            </div>
                                            <div style={{
                                                fontWeight: '700', fontSize: '14px',
                                                fontFamily: 'var(--font-display)',
                                                color: t.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)',
                                            }}>
                                                {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                                            </div>
                                        </div>
                                    ))}
                                {activeMonthTransactions.filter(t => (statModal?.type === 'Expenses' ? t.type === 'expense' : t.type === 'income')).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '28px', opacity: 0.5, fontSize: '13px' }}>No transactions recorded for this month</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default StatModal;
