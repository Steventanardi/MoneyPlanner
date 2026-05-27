import React from 'react';
import { Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';

const DashboardHeader = () => {
    const { currentUser, setActiveScreen } = useStore();
    const accent = currentUser?.color || 'var(--accent-primary)';

    return (
        <header style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
                onClick={() => setActiveScreen('settings')}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
            >
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '18px',
                    background: accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFBF5',
                    fontSize: '22px',
                    fontWeight: '800',
                    fontFamily: 'var(--font-display)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    {currentUser?.name?.charAt(0)}
                </div>
                <div>
                    <p className="text-heading" style={{ marginBottom: 2 }}>Hi, {currentUser?.name}</p>
                    <h1 className="text-h1" style={{ margin: 0 }}>Today's plan</h1>
                </div>
            </div>
            <button
                onClick={() => setActiveScreen('history')}
                aria-label="History"
                style={{
                    width: '46px', height: '46px',
                    borderRadius: '16px',
                    background: 'var(--badge-bg)',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                }}
            >
                <Clock size={20} color="var(--text-secondary)" />
            </button>
        </header>
    );
};

export default DashboardHeader;
