import React from 'react';
import { Clock, Sun, Sunrise, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return { text: 'Up late?',      Icon: Moon };
    if (h < 12) return { text: 'Good morning',   Icon: Sunrise };
    if (h < 18) return { text: 'Good afternoon', Icon: Sun };
    return      { text: 'Good evening',          Icon: Moon };
};

const DashboardHeader = () => {
    const { currentUser, setActiveScreen } = useStore();
    const accent = currentUser?.color || 'var(--accent-primary)';
    const { text: greetText, Icon: GreetIcon } = getGreeting();

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
                    flexShrink: 0,
                }}>
                    {currentUser?.name?.charAt(0)}
                </div>
                <div>
                    <p className="text-heading" style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <GreetIcon size={12} strokeWidth={2.4} />
                        {greetText}, {currentUser?.name}
                    </p>
                    <h1 className="text-h1" style={{ margin: 0 }}>Today's plan</h1>
                </div>
            </div>
            <button
                onClick={() => setActiveScreen('history')}
                aria-label="History"
                style={{
                    width: '46px', height: '46px',
                    borderRadius: '16px',
                    background: 'var(--bento-butter)',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                }}
            >
                <Clock size={20} color="var(--bento-butter-ink)" />
            </button>
        </header>
    );
};

export default DashboardHeader;
