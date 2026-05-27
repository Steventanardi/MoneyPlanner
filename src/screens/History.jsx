import React, { useState, useEffect, useMemo } from 'react';
import useStore from '../store/useStore';
import {
    Trash2,
    Search,
    Edit2,
    Filter,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

const escapeCSV = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

const TransactionRow = React.memo(({ t, getBankName, deleteTransaction, setEditingTransaction, formatCurrency, idx }) => {
    const x = useMotionValue(0);

    const handleDragEnd = (_, info) => {
        if (info.offset.x < -60) {
            animate(x, -80, { type: 'spring', stiffness: 500, damping: 40 });
        } else {
            animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.04, 0.3) }}
            style={{ position: 'relative', borderRadius: '24px' }}
        >
            {/* Swipe-to-delete background */}
            <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px',
                background: 'var(--accent-danger)', borderRadius: '0 24px 24px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '12px' }}>
                    <Trash2 size={22} />
                </button>
            </div>

            <motion.div
                style={{ x }}
                drag="x"
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.05}
                onDragEnd={handleDragEnd}
                onClick={() => { if (Math.abs(x.get()) < 5) setEditingTransaction(t); }}
            >
                <div className="card" style={{ padding: '14px 16px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)', cursor: 'pointer', marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                            background: t.type === 'income' ? 'var(--bento-mint)' : 'var(--bento-blush)',
                            color: t.type === 'income' ? 'var(--bento-mint-ink)' : 'var(--bento-blush-ink)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {t.type === 'income' ? <ArrowUpRight size={20} strokeWidth={2.4} /> : <ArrowDownLeft size={20} strokeWidth={2.4} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{t.category}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {t.description || getBankName(t.bankId)}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                        <div style={{
                            fontWeight: '800', fontSize: '15px', fontFamily: 'var(--font-display)',
                            color: t.type === 'income' ? 'var(--bento-mint-ink)' : 'var(--text-primary)',
                        }}>
                            {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                        </div>
                        <ChevronRight size={16} color="var(--text-secondary)" style={{ opacity: 0.3 }} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
});

const History = () => {
    const { data, formatCurrency, deleteTransaction, currentUser, syncWithSupabase } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterBankId, setFilterBankId] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const availableMonths = useMemo(() => {
        const months = new Set(
            (data.transactions || [])
                .filter(t => t.userId === currentUser?.id && t.date)
                .map(t => t.date.slice(0, 7))
        );
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [data.transactions, currentUser]);

    const visibleTransactions = useMemo(() =>
        (data.transactions || []).filter(t => {
            if (t.userId !== currentUser?.id) return false;
            if (filterType !== 'all' && t.type !== filterType) return false;
            if (filterBankId !== 'all' && String(t.bankId) !== filterBankId) return false;
            if (filterMonth !== 'all' && !(t.date || '').startsWith(filterMonth)) return false;
            const term = searchTerm.toLowerCase();
            return (t.category || '').toLowerCase().includes(term) ||
                (t.description || '').toLowerCase().includes(term) ||
                ((data.banks || []).find(b => b.id === t.bankId)?.name || '').toLowerCase().includes(term);
        }),
    [data.transactions, data.banks, currentUser, filterType, filterBankId, filterMonth, searchTerm]);

    const groupedTransactions = useMemo(() =>
        visibleTransactions.reduce((acc, t) => {
            const date = new Date(t.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            if (!acc[date]) acc[date] = [];
            acc[date].push(t);
            return acc;
        }, {}),
    [visibleTransactions]);

    const sortedDates = useMemo(() =>
        Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a)),
    [groupedTransactions]);

    const chartData = useMemo(() =>
        sortedDates.slice(0, 10).reverse().map(date => {
            const totalExpense = groupedTransactions[date]
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            return { date: date.split(',')[1].trim(), amount: totalExpense };
        }),
    [sortedDates, groupedTransactions]);

    const getBankName = (id) => data.banks.find(b => b.id === id)?.name || 'Manual Entry';

    const handleExport = () => {
        const headers = ['Date', 'Category', 'Description', 'Type', 'Amount', 'Bank'];
        const csv = [
            headers.map(escapeCSV).join(','),
            ...visibleTransactions.map(t => [
                escapeCSV(new Date(t.date).toLocaleDateString()),
                escapeCSV(t.category),
                escapeCSV(t.description || ''),
                escapeCSV(t.type),
                escapeCSV(t.amount),
                escapeCSV(getBankName(t.bankId))
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `money_planner_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)' }}>
            <header style={{ padding: 'calc(env(safe-area-inset-top, 40px) + 20px) 20px 20px' }}>
                <h1 style={{ fontSize: '34px', fontWeight: '900', letterSpacing: '-1.2px', margin: 0, fontFamily: 'var(--font-display)' }}>Activity</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Transaction Log</p>
            </header>

            {/* Quick Chart */}
            <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                <div className="bento-card bento-blush" style={{ padding: '20px', height: '200px', borderRadius: '24px', marginBottom: 0 }}>
                    <div className="flex-between" style={{ marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '700', margin: 0, color: 'var(--bento-blush-ink)', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Daily Volume</h3>
                        <p style={{ fontSize: '11px', color: 'var(--bento-blush-ink)', fontWeight: '600', opacity: 0.6 }}>Last 10 days</p>
                    </div>
                    <ResponsiveContainer width="100%" height="75%">
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--bento-blush-ink)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--bento-blush-ink)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '14px', boxShadow: 'var(--shadow-md)', padding: '10px 14px' }}
                                itemStyle={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-primary)' }}
                                labelStyle={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--bento-blush-ink)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorHistory)"
                                animationDuration={800}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ padding: '0 20px' }}>
                {/* Search & Filter Bar */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search entries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '44px', height: '48px', borderRadius: '16px', fontSize: '14px', marginBottom: 0 }}
                        />
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsFilterOpen(true)}
                        style={{ height: '48px', width: '48px', background: 'var(--bento-sky)', border: 'none', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bento-sky-ink)', cursor: 'pointer', flexShrink: 0 }}
                    >
                        <Filter size={18} strokeWidth={2.4} />
                    </motion.button>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {sortedDates.map(date => (
                        <div key={date}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    background: 'var(--badge-bg)',
                                    padding: '5px 10px', borderRadius: '99px',
                                }}>
                                    <Calendar size={11} color="var(--text-secondary)" />
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                        {date}
                                    </span>
                                </div>
                                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {groupedTransactions[date].map((t, idx) => (
                                    <TransactionRow
                                        key={t.id}
                                        t={t}
                                        idx={idx}
                                        getBankName={getBankName}
                                        deleteTransaction={deleteTransaction}
                                        setEditingTransaction={setEditingTransaction}
                                        formatCurrency={formatCurrency}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {sortedDates.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                            <Search size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <p style={{ fontWeight: '600' }}>No activities found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Modify Activity">
                {editingTransaction && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <TransactionForm
                            initialData={editingTransaction}
                            onComplete={() => {
                                setEditingTransaction(null);
                                syncWithSupabase();
                            }}
                        />
                        <button
                            onClick={() => {
                                if (confirm('Erase this record permanently?')) {
                                    deleteTransaction(editingTransaction.id);
                                    setEditingTransaction(null);
                                    syncWithSupabase();
                                }
                            }}
                            style={{ width: '100%', height: '52px', border: 'none', borderRadius: '16px', color: 'var(--bento-blush-ink)', background: 'var(--bento-blush)', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                        >
                            Delete Record
                        </button>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Refine Log">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Month</label>
                        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                            <option value="all">All Time</option>
                            {availableMonths.map(m => (
                                <option key={m} value={m}>
                                    {new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Type</label>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">All Movements</option>
                            <option value="expense">Outflow Only</option>
                            <option value="income">Inflow Only</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Account</label>
                        <select value={filterBankId} onChange={e => setFilterBankId(e.target.value)}>
                            <option value="all">All Sources</option>
                            {data.banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="btn-primary" 
                        style={{ height: '52px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', marginTop: '20px' }}
                    >
                        <Download size={18} style={{ marginRight: '8px' }} /> Export to CSV
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default History;
