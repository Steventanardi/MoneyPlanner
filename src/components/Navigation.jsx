import React from 'react';
import { Home, Calendar, Package, Wallet, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const Navigation = () => {
    const { activeScreen, setActiveScreen, currentUser } = useStore();

    const navItems = [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'monthly', label: 'Planner', icon: Calendar },
        { id: 'recurring', label: 'Bills', icon: CreditCard },
        { id: 'inventory', label: 'Stock', icon: Package },
        { id: 'banks', label: 'Vault', icon: Wallet },
    ];

    return (
        <nav className="nav-floating">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveScreen(item.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            height: '100%',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '0'
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="nav-active-pill"
                                style={{ 
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    x: '-50%',
                                    y: '-50%',
                                    width: '64px',
                                    height: '54px',
                                    backgroundColor: currentUser?.color || 'var(--accent-primary)',
                                    borderRadius: '18px',
                                    boxShadow: `0 8px 24px -4px ${(currentUser?.color || '#007AFF')}60`,
                                    zIndex: 0
                                }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 400, 
                                    damping: 30 
                                }}
                            />
                        )}
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                style={{
                                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                                    transition: 'color 0.3s ease',
                                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                }}
                            />
                            {!isActive && (
                                <span style={{ 
                                    fontSize: '9px', 
                                    fontWeight: '800', 
                                    color: 'var(--text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2px'
                                }}>
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </nav>
    );
};

export default Navigation;
