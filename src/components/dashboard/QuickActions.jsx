import React from 'react';
import { Plus, Banknote } from 'lucide-react';
import { useStore } from '../../store/useStore';

const QuickActions = () => {
    const { setActiveScreen } = useStore();

    return (
        <div style={{ margin: '20px 0', display: 'flex', gap: '12px' }}>
            <button
                className="btn-primary"
                style={{
                    flex: 1,
                    height: '64px',
                    fontSize: '16px',
                    borderRadius: '22px',
                }}
                onClick={() => useStore.getState().setIsAddingTransaction(true)}
            >
                <Plus size={22} strokeWidth={2.4} /> New entry
            </button>
            <button
                aria-label="Open vault"
                style={{
                    width: '64px', height: '64px',
                    marginBottom: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '22px',
                    background: 'var(--bento-sky)',
                    color: 'var(--bento-sky-ink)',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'transform 0.1s ease',
                }}
                onClick={() => setActiveScreen('banks')}
            >
                <Banknote size={26} strokeWidth={2.2} />
            </button>
        </div>
    );
};

export default QuickActions;
