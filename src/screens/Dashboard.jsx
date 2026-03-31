import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    TrendingDown, 
    Plus, 
    ChevronRight, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Clock, 
    Target, 
    AlertCircle, 
    Banknote, 
    LucideSettings,
    MoreHorizontal,
    Sparkles,
    Shield,
    PiggyBank
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import Settings from '../components/Settings';

const Dashboard = () => {
    const { 
        data, 
        formatCurrency, 
        currentUser, 
        selectedMonth, 
        setActiveScreen, 
        isAddingTransaction, 
        setIsAddingTransaction, 
        isSettingsOpen, 
        setIsSettingsOpen,
        exchangeRate,
        updateEmergencyFund
    } = useStore();
    const emergencyFund = data.emergencyFund || 20000;
    const [statModal, setStatModal] = React.useState(null);
    const [isEditingEmergency, setIsEditingEmergency] = React.useState(false);
    const [showQuickAdd, setShowQuickAdd] = React.useState(false);

    // Filtering user-specific data
    const userTransactions = useMemo(() => 
        (data.transactions || []).filter(t => t.userId === currentUser?.id), 
    [data.transactions, currentUser]);

    const activeMonthTransactions = useMemo(() => 
        userTransactions.filter(t => t.date && t.date.startsWith(selectedMonth)), 
    [userTransactions, selectedMonth]);

    const income = useMemo(() => 
        activeMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), 
    [activeMonthTransactions]);

    const expense = useMemo(() => 
        activeMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), 
    [activeMonthTransactions]);

    const balance = income - expense;

    // Chart Data Preparation
    const trendData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayExpense = userTransactions
                .filter(t => t.date === date && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                date: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                amount: dayExpense
            };
        });
    }, [userTransactions]);

    // Top Categories
    const topCategories = useMemo(() => {
        const cats = {};
        activeMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.amount;
        });
        return Object.entries(cats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [activeMonthTransactions]);

    const topIncomeCategories = useMemo(() => {
        const cats = {};
        activeMonthTransactions.filter(t => t.type === 'income').forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.amount;
        });
        return Object.entries(cats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [activeMonthTransactions]);

    return (
        <div style={{ paddingBottom: '140px', paddingTop: 'calc(env(safe-area-inset-top, 40px) + 20px)' }}>
            <header style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div onClick={() => setIsSettingsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                    <div style={{ 
                        width: '52px', 
                        height: '52px', 
                        borderRadius: '20px', 
                        background: currentUser?.color || 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '22px',
                        fontWeight: '900',
                        boxShadow: `0 8px 24px -6px ${(currentUser?.color || '#007AFF')}80`,
                        border: '2px solid rgba(255,255,255,0.2)'
                    }}>
                        {currentUser?.name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-h1">Money Planner</h1>
                        <p className="text-heading" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Hi, {currentUser?.name} <LucideSettings size={12} style={{ opacity: 0.5 }} />
                        </p>
                    </div>
                </div>
                <button 
                  onClick={() => setActiveScreen('history')}
                  className="action-icon-btn"
                  style={{ borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                >
                    <Clock size={22} color="var(--text-secondary)" />
                </button>
            </header>

            <div style={{ padding: '0 20px' }}>
                {/* Balance Card - Premium Design */}
                <div className="card" style={{ 
                    background: `linear-gradient(135deg, ${currentUser?.color || '#007AFF'}, hsla(var(--hue-primary), 100%, 30%, 1))`,
                    color: 'white',
                    padding: '30px',
                    borderRadius: '32px',
                    boxShadow: `0 20px 40px -10px ${(currentUser?.color || '#007AFF')}60`,
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Animated light flare */}
                    <div style={{ 
                        position: 'absolute', 
                        top: '-50%', 
                        left: '-50%', 
                        width: '200%', 
                        height: '200%', 
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    <div className="flex-between">
                        <div style={{ flex: 1 }}>
                            <div className="flex-between" style={{ marginBottom: '4px' }}>
                                <p className="text-caption" style={{ color: 'rgba(255,255,255,0.7)' }}>Current Balance</p>
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.15)', 
                                    padding: '4px 10px', 
                                    borderRadius: '100px', 
                                    fontSize: '9px', 
                                    backdropFilter: 'blur(10px)', 
                                    letterSpacing: '0.5px',
                                    fontWeight: '900',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <Clock size={10} /> 1 TWD = {exchangeRate.toFixed(2)} IDR
                                </div>
                            </div>
                            <h2 style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1.5px' }}>
                                {formatCurrency(balance)}
                            </h2>
                        </div>
                        <div style={{ 
                          padding: '10px 16px', 
                          borderRadius: '16px', 
                          background: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}>
                           <Sparkles size={14} /> Safe to Spend
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Moved Higher */}
                <div style={{ margin: '24px 0', display: 'flex', gap: '12px' }}>
                    <button className="btn-primary" style={{ flex: 1, height: '64px', fontSize: '17px', borderRadius: '24px' }} onClick={() => useStore.getState().setIsAddingTransaction(true)}>
                        <Plus size={24} /> New Entry
                    </button>
                    <button 
                        className="card" 
                        style={{ 
                            width: '64px', height: '64px', marginBottom: 0, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            borderRadius: '24px', cursor: 'pointer', border: '1px solid var(--glass-border)' 
                        }} 
                        onClick={() => setActiveScreen('banks')}
                    >
                        <Banknote size={28} color="var(--text-secondary)" />
                    </button>
                </div>

                {/* Interactive 4 Sections Grid */}
                <div style={{ margin: '24px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Income Card */}
                    <motion.div 
                        layout
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setStatModal({ type: 'Income', icon: <TrendingUp color="#34C759" />, val: income })}
                        className="card glass-card" 
                        style={{ padding: '24px', borderRadius: '32px', marginBottom: 0, cursor: 'pointer' }}
                    >
                        <TrendingUp size={24} color="#34C759" style={{ marginBottom: '24px' }} />
                        <div className="flex-between">
                            <div>
                                <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>INCOME</p>
                                <h3 style={{ fontSize: '22px', fontWeight: '900' }}>{formatCurrency(income)}</h3>
                            </div>
                            <ChevronRight size={18} color="var(--text-secondary)" />
                        </div>
                    </motion.div>

                    {/* Emergency Card */}
                    <motion.div 
                        layout
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setStatModal({ type: 'Emergency', icon: <Shield color="#FF9500" />, val: emergencyFund })}
                        className="card glass-card" 
                        style={{ padding: '24px', borderRadius: '32px', marginBottom: 0, cursor: 'pointer' }}
                    >
                        <Shield size={24} color="#FF9500" style={{ marginBottom: '24px' }} />
                        <div className="flex-between">
                            <div>
                                <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>EMERGENCY</p>
                                <h3 style={{ fontSize: '22px', fontWeight: '900' }}>{formatCurrency(emergencyFund)}</h3>
                            </div>
                            <ChevronRight size={18} color="var(--text-secondary)" />
                        </div>
                    </motion.div>

                    {/* Expenses Card */}
                    <motion.div 
                        layout
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setStatModal({ type: 'Expenses', icon: <TrendingDown color="#FF3B30" />, val: expense })}
                        className="card glass-card" 
                        style={{ padding: '24px', borderRadius: '32px', marginBottom: 0, cursor: 'pointer' }}
                    >
                        <TrendingDown size={24} color="#FF3B30" style={{ marginBottom: '24px' }} />
                        <div className="flex-between">
                            <div>
                                <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>EXPENSES</p>
                                <h3 style={{ fontSize: '22px', fontWeight: '900' }}>{formatCurrency(expense)}</h3>
                            </div>
                            <ChevronRight size={18} color="var(--text-secondary)" />
                        </div>
                    </motion.div>

                    {/* Savings Card */}
                    <motion.div 
                        layout
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setStatModal({ type: 'Savings', icon: <PiggyBank color="#007AFF" />, val: balance })}
                        className="card glass-card" 
                        style={{ padding: '24px', borderRadius: '32px', marginBottom: 0, cursor: 'pointer' }}
                    >
                        <PiggyBank size={24} color="#007AFF" style={{ marginBottom: '24px' }} />
                        <div className="flex-between">
                            <div>
                                <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>SAVINGS</p>
                                <h3 style={{ fontSize: '22px', fontWeight: '900' }}>{formatCurrency(balance)}</h3>
                            </div>
                            <ChevronRight size={18} color="var(--text-secondary)" />
                        </div>
                    </motion.div>
                </div>

                {/* Insights Section */}
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <h2 className="text-h2" style={{ margin: 0 }}>Smart Insights</h2>
                    <span 
                      onClick={() => setActiveScreen('monthly')}
                      style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)', cursor: 'pointer' }}
                    >
                        View More
                    </span>
                </div>

                <div className="card glass-card" style={{ height: '220px', padding: '24px' }}>
                    <h3 className="text-caption" style={{ marginBottom: '20px' }}>7-Day Spending Trend</h3>
                    <div style={{ width: '100%', height: '140px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={currentUser?.color || '#007AFF'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={currentUser?.color || '#007AFF'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    cursor={{ stroke: 'var(--glass-border)', strokeWidth: 2 }}
                                    contentStyle={{
                                        backgroundColor: 'var(--nav-bg)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-lg)',
                                        padding: '12px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '900' }}
                                    labelStyle={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', marginBottom: '4px' }}
                                    formatter={(val) => [formatCurrency(val), 'Spent']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke={currentUser?.color || '#007AFF'}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTrend)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Categories */}
                {topCategories.length > 0 && (
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 className="text-caption" style={{ marginBottom: '20px' }}>Top Categories</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {topCategories.map((cat, idx) => {
                                const percentage = Math.round((cat.value / expense) * 100);
                                return (
                                    <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                          width: '10px', 
                                          height: '10px', 
                                          borderRadius: '50%', 
                                          backgroundColor: `hsla(${210 - (idx * 30)}, 100%, 50%, 1)` 
                                        }} />
                                        <div style={{ flex: 1, fontSize: '14px', fontWeight: '700' }}>{cat.name}</div>
                                        <div style={{ fontSize: '14px', fontWeight: '900' }}>{percentage}%</div>
                                        <div style={{ 
                                            width: '80px', 
                                            height: '6px', 
                                            background: 'var(--input-bg)', 
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ 
                                                width: `${percentage}%`, 
                                                height: '100%', 
                                                backgroundColor: `hsla(${210 - (idx * 30)}, 100%, 50%, 1)`
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isAddingTransaction}
                onClose={() => useStore.getState().setIsAddingTransaction(false)}
                title="New Transaction"
            >
                <TransactionForm onComplete={() => useStore.getState().setIsAddingTransaction(false)} />
            </Modal>

            {/* Stat Detail Modal */}
            <Modal
                isOpen={!!statModal}
                onClose={() => { setStatModal(null); setIsEditingEmergency(false); setShowQuickAdd(false); }}
                title={statModal?.type + " Details"}
            >
                <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                    <div style={{ 
                        width: '96px', height: '96px', borderRadius: '32px', background: 'var(--input-bg)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                    }}>
                        {statModal?.icon}
                    </div>
                    
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Total {statModal?.type}
                    </div>

                    {isEditingEmergency && statModal?.type === 'Emergency' ? (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <input 
                                type="number" 
                                autoFocus
                                defaultValue={emergencyFund}
                                onBlur={(e) => {
                                    updateEmergencyFund(e.target.value);
                                    setIsEditingEmergency(false);
                                    setStatModal(prev => ({ ...prev, val: Number(e.target.value) }));
                                }}
                                style={{ width: '160px', textAlign: 'center', fontSize: '32px', fontWeight: '900', padding: '16px', margin: 0, background: 'var(--input-bg)', border: 'none', borderRadius: '16px', color: 'var(--text-primary)' }}
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div 
                                onClick={() => statModal?.type === 'Emergency' && setIsEditingEmergency(true)}
                                style={{ fontSize: '44px', fontWeight: '900', marginTop: '6px', letterSpacing: '-2px', cursor: statModal?.type === 'Emergency' ? 'pointer' : 'default' }}
                            >
                                {formatCurrency(statModal?.val || 0)}
                            </div>
                            {statModal?.type === 'Emergency' && (
                                <button 
                                    onClick={() => setIsEditingEmergency(true)}
                                    style={{ marginTop: '10px', background: 'var(--badge-bg)', border: 'none', padding: '6px 14px', borderRadius: '10px', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                                >
                                    ADJUST RESERVE GOAL
                                </button>
                            )}
                        </div>
                    )}
                </div>
                
                <div style={{ padding: '20px 0' }}>
                <div style={{ padding: '0 0 20px' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            {statModal?.type === 'Expenses' ? 'Breakdown by Category' : statModal?.type === 'Income' ? 'Breakdown by Source' : statModal?.type === 'Savings' ? 'Assets Location' : 'Allocation Breakdown'}
                        </h4>
                        {(statModal?.type === 'Income' || statModal?.type === 'Expenses') && (
                            <button 
                                onClick={() => setShowQuickAdd(!showQuickAdd)}
                                style={{ background: 'var(--input-bg)', border: 'none', padding: '6px 12px', borderRadius: '10px', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                            >
                                {showQuickAdd ? 'CANCEL ADD' : '+ QUICK ADD'}
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showQuickAdd && (statModal?.type === 'Income' || statModal?.type === 'Expenses') && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden', marginBottom: '24px' }}
                            >
                                <div style={{ padding: '20px', background: 'var(--input-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                                    <TransactionForm 
                                        initialData={{ type: statModal.type === 'Income' ? 'income' : 'expense' }} 
                                        onComplete={() => {
                                            setShowQuickAdd(false);
                                            // Optional: update local stats if needed, but the store handles it
                                        }} 
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {(statModal?.type === 'Expenses' || statModal?.type === 'Income') && (
                            (statModal.type === 'Expenses' ? topCategories : topIncomeCategories).map(cat => (
                            <div key={cat.name} className="card glass-card" style={{ padding: '16px 20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statModal.type === 'Expenses' ? 'var(--accent-primary)' : '#34C759' }} />
                                    <div style={{ fontWeight: '800', fontSize: '15px' }}>{cat.name}</div>
                                </div>
                                <div style={{ fontWeight: '900', fontSize: '16px' }}>{formatCurrency(cat.value)}</div>
                            </div>
                        )))}

                        {statModal?.type === 'Savings' && data.banks.filter(b => b.userId === currentUser?.id || b.isJoint).map(bank => (
                            <div key={bank.id} className="card glass-card" style={{ padding: '16px 20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ background: 'var(--input-bg)', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Banknote size={18} color="var(--accent-primary)" />
                                    </div>
                                    <div style={{ fontWeight: '800', fontSize: '15px' }}>{bank.name}</div>
                                </div>
                                <div style={{ fontWeight: '900', fontSize: '16px' }}>{formatCurrency(bank.value, bank.currency)}</div>
                            </div>
                        ))}

                        {statModal?.type === 'Emergency' && (
                           <div style={{ padding: '20px', background: 'var(--badge-bg)', borderRadius: '24px', textAlign: 'left' }}>
                               <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', fontWeight: '500', color: 'var(--text-secondary)' }}>
                                   This reserve is your liquid safety net. It should ideally cover 3-6 months of essential living expenses. You can adjust this goal based on your risk tolerance.
                               </p>
                           </div>
                        )}
                    </div>

                    {/* Latest 5 Transactions for Money Flow */}
                    {(statModal?.type === 'Expenses' || statModal?.type === 'Income') && (
                        <div style={{ marginTop: '32px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>
                                Latest 5 {statModal?.type}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {activeMonthTransactions
                                    .filter(t => (statModal?.type === 'Expenses' ? t.type === 'expense' : t.type === 'income'))
                                    .slice(0, 5)
                                    .map(t => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'hsla(0,0%,100%,0.03)', borderRadius: '16px' }}>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '14px' }}>{t.description || t.category}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t.category} • {t.date}</div>
                                        </div>
                                        <div style={{ fontWeight: '900', fontSize: '15px', color: t.type === 'income' ? '#34C759' : 'var(--text-primary)' }}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </div>
                                    </div>
                                ))}
                                {activeMonthTransactions.filter(t => (statModal?.type === 'Expenses' ? t.type === 'expense' : t.type === 'income')).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '30px', opacity: 0.4, fontSize: '14px' }}>No transactions recorded for this month</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </Modal>

            <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="My Profile">
                <Settings />
            </Modal>
        </div>
    );
};

export default Dashboard;
