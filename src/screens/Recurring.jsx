import React, { useState } from 'react';
import useStore from '../store/useStore';
import { 
    Music, 
    Tv, 
    CheckCircle, 
    Circle, 
    Plus, 
    Trash2, 
    Calendar, 
    CreditCard,
    ChevronRight,
    ArrowRightCircle,
    Bell
} from 'lucide-react';
import Modal from '../components/Modal';
import RecurringForm from '../components/RecurringForm';
import { motion, AnimatePresence } from 'framer-motion';

const PayBillModal = ({ bill, onComplete }) => {
    const { data, payBill, syncWithSupabase } = useStore();
    const [bankId, setBankId] = useState(data.banks[0]?.id || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        payBill(bill.id, bankId);
        syncWithSupabase();
        onComplete();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Settling Payment</div>
                <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>{bill.name}</div>
            </div>
            
            <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Funding Source</label>
                <select value={bankId} onChange={e => setBankId(e.target.value)} required>
                    {data.banks.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>
            
            <button type="submit" className="btn-primary" style={{ background: 'var(--accent-success)', height: '52px' }}>
                Confirm Payment
            </button>
        </form>
    );
};

const Recurring = () => {
    const { data, toggleBillStatus, deleteRecurring, formatCurrency, currentUser, syncWithSupabase } = useStore();
    const [activeTab, setActiveTab] = useState('subscriptions');
    const [isAdding, setIsAdding] = useState(false);
    const [payingBill, setPayingBill] = useState(null);

    const totalSubs = data.subscriptions.reduce((acc, sub) => acc + sub.amount, 0);
    const unpaidBills = data.bills.filter(b => !b.isPaid);
    const totalBills = unpaidBills.reduce((acc, b) => acc + b.amount, 0);

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Music': return <Music size={20} />;
            case 'Tv': return <Tv size={20} />;
            case 'CreditCard': return <CreditCard size={20} />;
            default: return <Calendar size={20} />;
        }
    };

    return (
        <div style={{ paddingBottom: '120px' }}>
            <header style={{ padding: 'calc(env(safe-area-inset-top, 40px) + 20px) 20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', margin: 0 }}>Scheduled</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Subscriptions & Bills</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAdding(true)}
                        style={{
                            background: 'var(--accent-primary)', color: 'white',
                            width: '48px', height: '48px', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 20px var(--accent-primary-glow)',
                            border: 'none', cursor: 'pointer'
                        }}
                    >
                        <Plus size={24} />
                    </motion.button>
                </div>
            </header>

            {/* Tab Selector */}
            <div style={{ padding: '0 20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '16px', position: 'relative' }}>
                    <motion.div 
                        animate={{ x: activeTab === 'subscriptions' ? 0 : '100%' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        style={{ 
                            position: 'absolute', top: '4px', left: '4px', bottom: '4px', width: 'calc(50% - 4px)',
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    />
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        style={{ flex: 1, zIndex: 1, height: '44px', background: 'none', border: 'none', color: activeTab === 'subscriptions' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                    >Subscriptions</button>
                    <button
                        onClick={() => setActiveTab('bills')}
                        style={{ flex: 1, zIndex: 1, height: '44px', background: 'none', border: 'none', color: activeTab === 'bills' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                    >Bills {unpaidBills.length > 0 && `(${unpaidBills.length})`}</button>
                </div>
            </div>

            <div style={{ padding: '0 20px' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'subscriptions' ? (
                        <motion.div
                            key="subs"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                        >
                            <div className="card" style={{ padding: '24px', background: 'var(--accent-primary)', color: 'white', border: 'none', marginBottom: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px' }}>Monthly Committed</div>
                                <div style={{ fontSize: '32px', fontWeight: '900', marginTop: '4px' }}>{formatCurrency(totalSubs)}</div>
                                <div style={{ fontSize: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
                                    <Bell size={14} /> Next cycle starts in 8 days
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.subscriptions.map(sub => (
                                    <div key={sub.id} className="card" style={{ padding: '16px 20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                                                {getIcon(sub.icon)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>{sub.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{sub.category} • Monthly</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontWeight: '900', fontSize: '16px' }}>{formatCurrency(sub.amount)}</div>
                                            <button onClick={() => deleteRecurring('subscriptions', sub.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', opacity: 0.4, cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="bills"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div className="card" style={{ padding: '24px', background: '#FF9500', color: 'white', border: 'none', marginBottom: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px' }}>Outstanding Bills</div>
                                <div style={{ fontSize: '32px', fontWeight: '900', marginTop: '4px' }}>{formatCurrency(totalBills)}</div>
                                <div style={{ fontSize: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
                                    <Calendar size={14} /> {unpaidBills.length} items remaining for this month
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.bills.map(bill => (
                                    <div 
                                        key={bill.id} 
                                        className="card" 
                                        style={{ 
                                            padding: '16px 20px', 
                                            borderRadius: '24px', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            border: '1px solid var(--glass-border)',
                                            opacity: bill.isPaid ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                            <button 
                                                onClick={() => toggleBillStatus(bill.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                {bill.isPaid ? <CheckCircle size={24} color="var(--accent-success)" /> : <Circle size={24} color="var(--text-secondary)" />}
                                            </button>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)', textDecoration: bill.isPaid ? 'line-through' : 'none' }}>{bill.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Due Date: {bill.dueDate}th</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontWeight: '900', fontSize: '16px' }}>{formatCurrency(bill.amount)}</div>
                                            {!bill.isPaid && (
                                                <motion.button 
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setPayingBill(bill)}
                                                    style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                                                >
                                                    Pay
                                                </motion.button>
                                            )}
                                            <button onClick={() => deleteRecurring('bills', bill.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', opacity: 0.4, cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Modal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                title={`Add ${activeTab === 'subscriptions' ? 'Subscription' : 'Bill'}`}
            >
                <RecurringForm
                    type={activeTab}
                    onComplete={() => {
                        setIsAdding(false);
                        syncWithSupabase();
                    }}
                />
            </Modal>

            <Modal isOpen={!!payingBill} onClose={() => setPayingBill(null)} title="Settle Bill">
                {payingBill && <PayBillModal bill={payingBill} onComplete={() => setPayingBill(null)} />}
            </Modal>
        </div>
    );
};

export default Recurring;
