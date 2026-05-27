import React from 'react';
import { Plus, Banknote, Package } from 'lucide-react';
import { useStore } from '../../store/useStore';

const QuickActions = () => {
    const { setActiveScreen } = useStore();

    return (
        <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
            <button
                className="btn-primary"
                style={{
                    flex: 1,
                    height: '60px',
                    fontSize: '15px',
                    borderRadius: '20px',
                    gap: '8px',
                }}
                onClick={() => useStore.getState().setIsAddingTransaction(true)}
            >
                <Plus size={20} strokeWidth={2.6} /> New entry
            </button>
            <button
                aria-label="Open vault"
                style={{
                    width: '60px', height: '60px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '20px',
                    background: 'var(--bento-sky)',
                    color: 'var(--bento-sky-ink)',
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    transition: 'transform 0.1s ease',
                }}
                onClick={() => setActiveScreen('banks')}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Banknote size={24} strokeWidth={2.2} />
            </button>
            <button
                aria-label="Inventory"
                style={{
                    width: '60px', height: '60px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '20px',
                    background: 'var(--bento-mint)',
                    color: 'var(--bento-mint-ink)',
                    cursor: 'pointer',
                    border: 'none',
                    flexShrink: 0,
                    transition: 'transform 0.1s ease',
                }}
                onClick={() => setActiveScreen('inventory')}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Package size={22} strokeWidth={2.2} />
            </button>
        </div>
    );
};

export default QuickActions;
