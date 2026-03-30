import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { 
    Trash2, 
    Search, 
    Edit2, 
    Filter, 
    Download, 
    Camera,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { getReceipt } from '../utils/db';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
    const { data, formatCurrency, deleteTransaction, currentUser, syncWithSupabase } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterBankId, setFilterBankId] = useState('all');
    const [viewingReceiptId, setViewingReceiptId] = useState(null);
    const [receiptImageRaw, setReceiptImageRaw] = useState(null);

    useEffect(() => {
        if (viewingReceiptId) {
            getReceipt(viewingReceiptId).then(img => setReceiptImageRaw(img)).catch(console.error);
        } else {
            setReceiptImageRaw(null);
        }
    }, [viewingReceiptId]);

    const visibleTransactions = (data.transactions || []).filter(t => {
        if (t.userId !== currentUser?.id) return false;
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterBankId !== 'all' && t.bankId !== Number(filterBankId)) return false;

        const searchMatches = (t.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((data.banks || []).find(b => b.id === t.bankId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            
        return searchMatches;
    });

    const groupedTransactions = visibleTransactions.reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(t);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
        new Date(b) - new Date(a)
    );

    // Dynamic Chart Data
    const chartData = sortedDates.slice(0, 10).reverse().map(date => {
        const totalExpense = groupedTransactions[date]
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return { date: date.split(',')[1].trim(), amount: totalExpense };
    });

    const getBankName = (id) => data.banks.find(b => b.id === id)?.name || 'Manual Entry';

    const handleExport = () => {
        const headers = ['Date', 'Category', 'Description', 'Type', 'Amount', 'Bank'];
        const csv = [
            headers.join(','),
            ...visibleTransactions.map(t => [
                new Date(t.date).toLocaleDateString(),
                t.category,
                t.description || '',
                t.type,
                t.amount,
                getBankName(t.bankId)
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
        <div style={{ paddingBottom: '120px' }}>
            <header style={{ padding: 'calc(env(safe-area-inset-top, 40px) + 20px) 20px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', margin: 0 }}>Activity</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Full Transaction Log</p>
            </header>

            {/* Quick Chart */}
            <div style={{ padding: '0 20px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '24px', height: '220px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Daily Volume</h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Last 10 Active Days</p>
                    </div>
                    <ResponsiveContainer width="100%" height="70%">
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                itemStyle={{ fontWeight: '800', fontSize: '13px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="var(--accent-primary)" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorHistory)" 
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ padding: '0 20px' }}>
                {/* Search & Filter Bar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input 
                            type="text" 
                            placeholder="Find an entry..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '48px', height: '52px', borderRadius: '16px', fontSize: '15px' }}
                        />
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsFilterOpen(true)}
                        style={{ height: '52px', width: '52px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}
                    >
                        <Filter size={18} />
                    </motion.button>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {sortedDates.map(date => (
                        <div key={date}>
                            <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={12} /> {date}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {groupedTransactions[date].map((t, idx) => (
                                    <motion.div
                                        key={t.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="card"
                                        style={{ padding: '16px 18px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                            <div style={{ 
                                                width: '44px', height: '44px', borderRadius: '14px', 
                                                background: t.type === 'income' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
                                                color: t.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-primary)' }}>{t.category}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>
                                                    {t.description || getBankName(t.bankId)}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontWeight: '900', fontSize: '16px', color: t.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                                                {formatCurrency(t.amount)}
                                            </div>
                                            <button 
                                                onClick={() => setEditingTransaction(t)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.4, cursor: 'pointer' }}
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
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
                            style={{ width: '100%', height: '52px', border: 'none', borderRadius: '16px', color: 'var(--accent-danger)', background: 'rgba(255,59,48,0.1)', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                        >
                            Delete Record
                        </button>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Refine Log">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
