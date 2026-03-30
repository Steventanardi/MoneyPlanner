import React, { useState } from 'react';
import useStore from '../store/useStore';
import Modal from '../components/Modal';
import { 
    Landmark as BankIcon, 
    Plus as PlusIcon, 
    Trash2, 
    TrendingUp, 
    Wallet,
    ChevronRight,
    Search,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BankForm = ({ onComplete, initialData }) => {
    const { addBank, updateBank } = useStore();
    const [name, setName] = useState(initialData?.name || '');
    const [value, setValue] = useState(initialData?.value || '');
    const [currency, setCurrency] = useState(initialData?.currency || 'TWD');
    const [isJoint, setIsJoint] = useState(initialData?.isJoint || false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (initialData) {
            updateBank(initialData.id, { name, value: Number(value), currency, isJoint });
        } else {
            addBank(name, Number(value), currency, isJoint);
        }
        onComplete();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
                <input type="text" placeholder="Bank Name (e.g. Youju Bank)" value={name} onChange={e => setName(e.target.value)} style={{ padding: '16px 20px' }} required />
            </div>
            <div className="input-group">
                <input type="number" inputMode="decimal" placeholder="Balance" value={value} onChange={e => setValue(e.target.value)} style={{ padding: '16px 20px' }} required step="any" />
            </div>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="select-input" style={{ padding: '16px 20px' }}>
                <option value="TWD">TWD (NT$)</option>
                <option value="IDR">IDR (Rp)</option>
            </select>

            <div 
                onClick={() => setIsJoint(!isJoint)} 
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', 
                    padding: '16px 20px', background: 'var(--input-bg)', 
                    borderRadius: 'var(--border-radius-sm)', cursor: 'pointer',
                    border: isJoint ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{ 
                    width: '20px', height: '20px', borderRadius: '6px', 
                    border: '2px solid var(--accent-primary)',
                    background: isJoint ? 'var(--accent-primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', color: 'white', fontWeight: '900'
                }}>
                    {isJoint && "✓"}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Joint Account (Visible to all)</span>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '8px', height: '64px' }}>
                {initialData ? 'Update Asset' : 'Create Bank'}
            </button>
        </form>
    );
};

const BankTracker = () => {
    const { 
        data, 
        deleteBank, 
        formatCurrency, 
        syncWithSupabase, 
        currency, 
        currentUser, 
        exchangeRate 
    } = useStore();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [assetDisplayCurrency, setAssetDisplayCurrency] = useState(currency || 'TWD');

    const userBanks = data.banks.filter(b => b.userId === currentUser?.id || b.isJoint);
    const filteredBanks = userBanks.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAssetsInTWD = userBanks.reduce((acc, bank) => {
        let bankValueInTWD = bank.value;
        if (bank.currency === 'IDR' && exchangeRate) {
            bankValueInTWD = bank.value / exchangeRate;
        }
        return acc + bankValueInTWD;
    }, 0);

    const displayTotal = assetDisplayCurrency === 'TWD' 
        ? totalAssetsInTWD 
        : totalAssetsInTWD * (exchangeRate || 500);

    return (
        <div style={{ paddingBottom: '120px' }}>
            <header style={{ padding: 'calc(env(safe-area-inset-top, 40px) + 20px) 20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', margin: 0 }}>Vault</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Your Managed Assets</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            width: '48px', height: '48px', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 20px var(--accent-primary-glow)',
                            border: 'none', cursor: 'pointer'
                        }}
                    >
                        <PlusIcon size={24} />
                    </motion.button>
                </div>
            </header>

            <div style={{ padding: '0 20px' }}>
                {/* Net Worth Summary */}
                <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '28px',
                    padding: '24px',
                    border: '1px solid var(--glass-border)',
                    marginBottom: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'var(--accent-primary)', opacity: 0.03, borderRadius: '0 0 0 100%', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px', position: 'relative', zIndex: 10 }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Worth Overview</div>
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setAssetDisplayCurrency(prev => prev === 'TWD' ? 'IDR' : 'TWD')}
                            style={{ 
                                background: 'var(--accent-primary)', color: 'white', padding: '6px 14px', 
                                borderRadius: '8px', fontSize: '10px', fontWeight: '900', cursor: 'pointer',
                                boxShadow: '0 4px 12px var(--accent-primary-glow)', border: 'none'
                            }}
                        >
                            SWITCH TO {assetDisplayCurrency === 'TWD' ? 'IDR' : 'TWD'}
                        </motion.button>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>
                        {formatCurrency(displayTotal, assetDisplayCurrency)}
                    </div>
                    <div style={{ 
                        marginTop: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '10px 14px',
                        background: 'var(--input-bg)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)'
                    }}>
                        <Shield size={14} color="var(--accent-success)" />
                        <span>All data is encrypted and synced via Supabase</span>
                    </div>
                </div>

                {/* Search / Filter */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    background: 'var(--input-bg)', 
                    padding: '8px 16px', 
                    borderRadius: '16px',
                    marginBottom: '20px'
                }}>
                    <Search size={18} color="var(--text-secondary)" />
                    <input 
                        type="text" 
                        placeholder="Search your banks..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '15px', padding: '10px 0', margin: 0 }}
                    />
                </div>

                {/* Bank List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AnimatePresence>
                        {filteredBanks.map(bank => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={bank.id}
                                className="card glass-card"
                                onClick={() => setEditingBank(bank)}
                                style={{ 
                                    padding: '18px 20px', 
                                    borderRadius: '24px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    border: '1px solid var(--glass-border)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', borderRadius: '14px', 
                                        background: 'var(--input-bg)', display: 'flex', 
                                        alignItems: 'center', justifyContent: 'center', 
                                        color: 'var(--accent-primary)' 
                                    }}>
                                        <BankIcon size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '-0.3px' }}>{bank.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {bank.currency} Account
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '900', fontSize: '17px', color: 'var(--text-primary)' }}>
                                            {formatCurrency(bank.value, bank.currency)}
                                        </div>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete ${bank.name}?`)) deleteBank(bank.id);
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', opacity: 0.4, cursor: 'pointer', padding: '8px' }}
                                    >
                                        <Trash2 size={18} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredBanks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
                            <Wallet size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <p style={{ fontSize: '15px', fontWeight: '500' }}>No banks found matching your search</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen || !!editingBank} onClose={() => { setIsModalOpen(false); setEditingBank(null); }} title={editingBank ? "Edit Asset" : "Add New Asset"}>
                <BankForm 
                    initialData={editingBank}
                    onComplete={() => {
                        setIsModalOpen(false);
                        setEditingBank(null);
                        syncWithSupabase();
                    }} 
                />
            </Modal>
        </div>
    );
};

export default BankTracker;
