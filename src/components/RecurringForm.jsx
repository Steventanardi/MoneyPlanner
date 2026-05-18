import React, { useState } from 'react';
import useStore from '../store/useStore';
import { 
    Music, 
    Tv, 
    Calendar, 
    CreditCard,
    DollarSign,
    Briefcase,
    Globe,
    Zap,
    Home,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';

const RecurringForm = ({ type, onComplete, initialData }) => {
    const { addSubscription, addBill, updateRecurring, currentUser, pushToSupabase } = useStore();
    const isEdit = !!initialData;
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        amount: initialData?.amount || '',
        category: initialData?.category || (type === 'subscriptions' ? 'Entertainment' : 'Housing'),
        frequency: initialData?.frequency || 'monthly',
        icon: initialData?.icon || 'Calendar',
        dueDate: initialData?.dueDate || '1',
    });

    if (!currentUser) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            setFormError('Name is required');
            return;
        }
        const parsedAmount = parseFloat(formData.amount);
        if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setFormError('Enter a valid amount greater than 0');
            return;
        }
        setFormError('');

        if (isEdit) {
            const updates = type === 'subscriptions'
                ? { name: formData.name, amount: parsedAmount, category: formData.category, frequency: formData.frequency, icon: formData.icon }
                : { name: formData.name, amount: parsedAmount, category: formData.category, dueDate: parseInt(formData.dueDate) };
            updateRecurring(type, initialData.id, updates);
        } else if (type === 'subscriptions') {
            addSubscription({
                name: formData.name,
                amount: parsedAmount,
                category: formData.category,
                frequency: formData.frequency,
                icon: formData.icon
            });
        } else {
            addBill({
                name: formData.name,
                amount: parsedAmount,
                category: formData.category,
                dueDate: parseInt(formData.dueDate),
            });
        }
        pushToSupabase();
        onComplete();
    };

    const icons = [
        { name: 'Music', icon: Music },
        { name: 'Tv', icon: Tv },
        { name: 'Calendar', icon: Calendar },
        { name: 'CreditCard', icon: CreditCard },
        { name: 'Zap', icon: Zap },
        { name: 'Home', icon: Home }
    ];

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Identity</label>
                <input
                    type="text"
                    placeholder={type === 'subscriptions' ? "Netflix, Spotify, Google One..." : "Rent, Electric, Phone..."}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ height: '52px', borderRadius: '14px' }}
                />
            </div>

            <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Expected Amount</label>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', opacity: 0.5 }}>NT$</div>
                    <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        style={{ paddingLeft: '56px', height: '52px', borderRadius: '14px' }}
                    />
                </div>
            </div>

            <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Category Selection</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ height: '52px', borderRadius: '14px' }}
                >
                    {type === 'subscriptions' ? (
                        <>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Software">Services/Cloud</option>
                            <option value="Health">Wellness</option>
                            <option value="Other">Miscellaneous</option>
                        </>
                    ) : (
                        <>
                            <option value="Housing">Rent/Mortgage</option>
                            <option value="Utilities">Base Utilities</option>
                            <option value="Insurance">Protection</option>
                            <option value="Other">Bills/Other</option>
                        </>
                    )}
                </select>
            </div>

            {type === 'subscriptions' ? (
                <div className="input-group">
                    <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Assign Icon</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                        {icons.map(item => (
                            <motion.button
                                key={item.name}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData({ ...formData, icon: item.name })}
                                style={{
                                    height: '44px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: formData.icon === item.name ? 'var(--accent-primary)' : 'var(--input-bg)',
                                    color: formData.icon === item.name ? 'white' : 'var(--text-secondary)',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                                }}
                            >
                                <item.icon size={18} />
                            </motion.button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="input-group">
                    <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Due Day (1-31)</label>
                    <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="31"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                        style={{ height: '52px', borderRadius: '14px' }}
                    />
                </div>
            )}

            {formError && (
                <div style={{ color: 'var(--accent-danger)', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>
                    {formError}
                </div>
            )}

            <button
                type="submit"
                className="btn-primary"
                style={{ height: '56px', marginTop: '12px' }}
            >
                {isEdit ? 'Save Changes' : 'Confirm Setup'}
            </button>
        </form>
    );
};

export default RecurringForm;
