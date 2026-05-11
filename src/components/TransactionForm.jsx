import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, Landmark, Tag, FileText, ChevronDown, CalendarDays } from 'lucide-react';
import useStore from '../store/useStore';
import { saveReceipt } from '../utils/db';
import { motion, AnimatePresence } from 'framer-motion';

const TransactionForm = ({ onComplete, initialData }) => {
    const { data, addTransaction, updateTransaction, currentUser, currency, exchangeRate, pushToSupabase } = useStore();
    
    const initialExpenseCats = data.customCategories?.filter(c => c.type === 'expense').map(c => c.name) || ['Food'];

    const todayStr = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        type: 'expense',
        category: (data?.customCategories || []).filter(c => c.type === 'expense')[0]?.name || 'Food',
        amount: '',
        description: '',
        bankId: (data?.banks || [])[0]?.id || '',
        date: todayStr,
    });
    const [receiptImage, setReceiptImage] = useState(null);
    const [formError, setFormError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            // Convert stored TWD back to display currency for editing
            const displayAmount = (currency === 'IDR' && exchangeRate) 
                ? initialData.amount * exchangeRate 
                : initialData.amount;
            
            setFormData({
                type: initialData.type,
                category: initialData.category,
                amount: Math.round(displayAmount).toString(),
                description: initialData.description || '',
                bankId: initialData.bankId || data.banks[0]?.id || '',
                date: initialData.date || new Date().toISOString().split('T')[0],
            });
        }
    }, [initialData, currency, exchangeRate, data.banks]);

    if (!currentUser) return null;

    const availableCategories = (data?.customCategories || [])
        ? (data?.customCategories || []).filter(c => c.type === formData.type).map(c => c.name)
        : [];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setReceiptImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const parsedAmount = parseFloat(formData.amount);
        if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setFormError('Enter a valid amount greater than 0');
            return;
        }
        if (!formData.bankId) {
            setFormError('Select an account');
            return;
        }
        setFormError('');

        const isEditing = !!initialData;
        const txId = isEditing ? initialData.id : crypto.randomUUID();

        // Convert the input amount back to TWD for storage
        const inputAmount = parseFloat(formData.amount);
        const storedAmount = (currency === 'IDR' && exchangeRate) ? inputAmount / exchangeRate : inputAmount;

        const transactionData = {
            ...formData,
            id: txId,
            amount: storedAmount,
            bankId: Number(formData.bankId),
            hasReceipt: !!receiptImage || (isEditing && initialData.hasReceipt)
        };

        if (isEditing) {
            updateTransaction(txId, transactionData);
        } else {
            addTransaction(transactionData);
        }

        if (receiptImage) {
            await saveReceipt(txId, receiptImage);
        }
        
        pushToSupabase();
        onComplete();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Type Selector */}
            <div style={{ 
                display: 'flex', 
                background: 'var(--input-bg)', 
                padding: '4px', 
                borderRadius: '16px',
                position: 'relative'
            }}>
                <motion.div 
                    animate={{ x: formData.type === 'expense' ? 0 : '100%' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    style={{ 
                        position: 'absolute', top: '4px', left: '4px', bottom: '4px', width: 'calc(50% - 4px)',
                        background: formData.type === 'expense' ? 'var(--accent-danger)' : 'var(--accent-success)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                />
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: data.customCategories.find(c => c.type === 'expense')?.name || '' })}
                    style={{ flex: 1, zIndex: 1, height: '44px', background: 'none', border: 'none', color: formData.type === 'expense' ? 'white' : 'var(--text-secondary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >Expense</button>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: data.customCategories.find(c => c.type === 'income')?.name || '' })}
                    style={{ flex: 1, zIndex: 1, height: '44px', background: 'none', border: 'none', color: formData.type === 'income' ? 'white' : 'var(--text-secondary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >Income</button>
            </div>

            {/* Amount Input */}
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Amount ({currency})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '900', color: formData.type === 'expense' ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                        {currency === 'TWD' ? 'NT$' : 'Rp'}
                    </span>
                    <input
                        type="number"
                        inputMode="decimal"
                        autoFocus
                        placeholder="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        style={{ 
                            fontSize: '48px', 
                            fontWeight: '900', 
                            textAlign: 'left', 
                            width: '200px', 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--text-primary)',
                            outline: 'none',
                            padding: 0
                        }}
                    />
                </div>
                {currency === 'IDR' && exchangeRate && formData.amount && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px' }}>
                        ≈ NT$ {Math.round(parseFloat(formData.amount) / exchangeRate)}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Description */}
                <div className="input-field" style={{ position: 'relative' }}>
                    <FileText size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Description (e.g. Starbucks Coffee)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ paddingLeft: '48px' }}
                    />
                </div>

                {/* Date */}
                <div className="input-field" style={{ position: 'relative' }}>
                    <CalendarDays size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        style={{ paddingLeft: '48px' }}
                        required
                    />
                </div>

                {/* Category & Bank */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Tag size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)', zIndex: 1 }} />
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            style={{ paddingLeft: '40px', background: 'var(--input-bg)', borderRadius: '14px', border: 'none', height: '48px', width: '100%', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}
                        >
                            {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Landmark size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)', zIndex: 1 }} />
                        <select
                            value={formData.bankId}
                            onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
                            style={{ paddingLeft: '40px', background: 'var(--input-bg)', borderRadius: '14px', border: 'none', height: '48px', width: '100%', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}
                        >
                            {(data?.banks || []).map(bank => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Receipt Section */}
            <div style={{ background: 'var(--input-bg)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Receipt Attachment</span>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                        {receiptImage ? 'Change' : 'Attach'}
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
                <AnimatePresence>
                    {receiptImage && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 80, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', marginTop: '12px', position: 'relative' }}
                        >
                            <img src={receiptImage} alt="Receipt" style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '10px' }} />
                            <button
                                type="button"
                                onClick={() => setReceiptImage(null)}
                                style={{ position: 'absolute', top: '4px', left: '60px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', padding: '4px' }}
                            ><X size={12} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {formError && (
                <div style={{ color: 'var(--accent-danger)', fontSize: '13px', fontWeight: '700', textAlign: 'center', marginTop: '-8px' }}>
                    {formError}
                </div>
            )}

            <button
                type="submit"
                className="btn-primary"
                style={{
                    backgroundColor: formData.type === 'expense' ? 'var(--accent-primary)' : 'var(--accent-success)',
                    boxShadow: `0 8px 24px ${formData.type === 'expense' ? 'var(--accent-primary-glow)' : 'rgba(52,199,89,0.3)'}`,
                    height: '56px',
                    fontSize: '16px'
                }}
            >
                {initialData ? 'Update Entry' : 'Post Transaction'}
            </button>
        </form>
    );
};

export default TransactionForm;
