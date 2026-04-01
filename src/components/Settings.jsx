import React, { useState } from 'react';
import { 
    Sun, 
    Moon, 
    LogOut, 
    User, 
    Download, 
    Plus, 
    Trash2, 
    Home, 
    Coffee, 
    Car, 
    Tv, 
    Briefcase, 
    TrendingUp, 
    Tag, 
    ShoppingBag, 
    CreditCard, 
    Heart, 
    Zap,
    ChevronRight,
    Globe,
    Shield
} from 'lucide-react';
import useStore from '../store/useStore';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = { Home, Coffee, Car, Tv, Briefcase, TrendingUp, Tag, ShoppingBag, CreditCard, Heart, Zap };

const CategoryForm = ({ onComplete }) => {
    const { addCategory, syncWithSupabase } = useStore();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Tag');
    const [color, setColor] = useState('#007AFF');
    const [type, setType] = useState('expense');

    const handleSubmit = (e) => {
        e.preventDefault();
        addCategory({ name, icon, color, type });
        syncWithSupabase();
        onComplete();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Category Identity</label>
                <input type="text" placeholder="e.g. Shopping, Hobby..." value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                    <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Financial Role</label>
                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>
                <div className="input-group">
                    <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Visual Color</label>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ height: '52px', padding: '4px' }} />
                </div>
            </div>

            <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Assign Primary Icon</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {Object.keys(ICONS).map(ico => {
                        const IconComp = ICONS[ico];
                        return (
                            <motion.button
                                key={ico}
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIcon(ico)}
                                style={{
                                    height: '44px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: icon === ico ? 'var(--accent-primary)' : 'var(--input-bg)',
                                    color: icon === ico ? 'white' : 'var(--text-secondary)',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                                }}
                            >
                                <IconComp size={18} />
                            </motion.button>
                        );
                    })}
                </div>
            </div>
            
            <button type="submit" className="btn-primary" style={{ height: '56px', marginTop: '10px' }}>
                Deploy Category
            </button>
        </form>
    );
};

const Settings = () => {
    const { 
        theme, 
        toggleTheme, 
        currency, 
        setCurrency, 
        currentUser, 
        logout, 
        exchangeRate, 
        data, 
        deleteCategory,
        syncWithSupabase,
        lastSyncedAt,
        toggleBiometrics,
        userBiometrics
    } = useStore();
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);

    if (!currentUser) return null;

    const handleExport = () => {
        const headers = ['Date', 'Category', 'Type', 'Amount (TWD)', 'Bank'];
        const csv = [
            headers.join(','),
            ...data.transactions.map(t => [
                new Date(t.date).toLocaleDateString(),
                t.category,
                t.type,
                t.amount.toFixed(2),
                data.banks.find(b => b.id === t.bankId)?.name || 'Manual'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `money_planner_full_backup_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div style={{ paddingBottom: '120px' }}>
            <header style={{ padding: '30px 20px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', margin: 0 }}>Preferences</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>System & Metadata</p>
            </header>

            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Profile Card */}
                <div className="card" style={{ padding: '20px', borderRadius: '28px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: currentUser.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900' }}>
                                {currentUser.name[0]}
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '800' }}>{currentUser.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Cloud synchronization active</div>
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={logout}
                            style={{ background: 'rgba(255,59,48,0.1)', border: 'none', color: 'var(--accent-danger)', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                        >
                            Log Out
                        </motion.button>
                    </div>
                </div>

                {/* Display Section */}
                <section>
                    <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', marginLeft: '8px' }}>Interface</h3>
                    <div className="card" style={{ padding: '4px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--glass-border)' }}>
                        <div style={{ padding: '16px 18px', background: 'var(--card-bg)', borderRadius: '20px 20px 4px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: 'var(--text-secondary)' }}>{theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}</div>
                                <span style={{ fontWeight: '700', fontSize: '15px' }}>Dark Environment</span>
                            </div>
                            <div 
                                onClick={toggleTheme}
                                style={{ width: '52px', height: '28px', background: theme === 'dark' ? 'var(--accent-primary)' : 'var(--input-bg)', borderRadius: '14px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                            >
                                <motion.div 
                                    animate={{ x: theme === 'dark' ? 26 : 2 }}
                                    style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '16px 18px', background: 'var(--card-bg)', borderRadius: '4px 4px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: 'var(--text-secondary)' }}><Globe size={20} /></div>
                                <span style={{ fontWeight: '700', fontSize: '15px' }}>Base Currency</span>
                            </div>
                            <select 
                                value={currency} 
                                onChange={e => setCurrency(e.target.value)}
                                style={{ width: 'auto', background: 'none', border: 'none', padding: 0, margin: 0, fontWeight: '800', fontSize: '14px', color: 'var(--accent-primary)', textAlign: 'right' }}
                            >
                                <option value="TWD">New Taiwan Dollar</option>
                                <option value="IDR">Indonesian Rupiah</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Categories Studio */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 8px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Custom Categories</h3>
                        <button onClick={() => setIsCatModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>+ Create New</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {data.customCategories?.map(cat => {
                            const Icon = ICONS[cat.icon] || ICONS.Tag;
                            return (
                                <motion.div 
                                    key={cat.id} 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '8px', 
                                        padding: '10px 16px', borderRadius: '18px', 
                                        background: 'var(--card-bg)', border: `1px solid ${cat.color}30`,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <Icon size={14} color={cat.color} />
                                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{cat.name}</span>
                                    <button onClick={() => deleteCategory(cat.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', opacity: 0.3, padding: 0, display: 'flex', cursor: 'pointer' }}>
                                        <Trash2 size={12} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Data & Security */}
                <section>
                    <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', marginLeft: '8px' }}>Security & Storage</h3>
                    <div className="card" style={{ padding: '0 4px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--glass-border)', marginBottom: '16px' }}>
                        <div style={{ padding: '16px 18px', background: 'var(--card-bg)', borderRadius: '20px 20px 4px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: 'var(--accent-primary)' }}><Shield size={20} /></div>
                                <span style={{ fontWeight: '700', fontSize: '15px' }}>Face ID / Biometrics</span>
                            </div>
                            <div 
                                onClick={toggleBiometrics}
                                style={{ width: '52px', height: '28px', background: userBiometrics[currentUser.id] ? 'var(--accent-success)' : 'var(--input-bg)', borderRadius: '14px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                            >
                                <motion.div 
                                    animate={{ x: userBiometrics[currentUser.id] ? 26 : 2 }}
                                    style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '4px 4px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.8 }}>
                                <TrendingUp size={16} color="var(--accent-success)" />
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>Last Cloud Update</div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                {lastSyncedAt ? `Synchronized on ${new Date(lastSyncedAt).toLocaleString()}` : "Not yet synchronized with cloud."}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button onClick={syncWithSupabase} style={{ flex: 1, height: '44px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>Sync Now</button>
                                <button onClick={handleExport} style={{ flex: 1, height: '44px', background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>Export CSV</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="New Category">
                <CategoryForm onComplete={() => setIsCatModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Settings;
