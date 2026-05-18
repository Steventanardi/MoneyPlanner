import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';
import { SESSION_TIMEOUT_MS, RATE_FETCH_INTERVAL_MS, TIMEOUT_CHECK_INTERVAL_MS } from './constants';

// Screens
import Navigation from './components/Navigation';
import Dashboard from './screens/Dashboard';
import MonthlyPlanner from './screens/MonthlyPlanner';
import BankTracker from './screens/BankTracker';
import Recurring from './screens/Recurring';
import History from './screens/History';
import Inventory from './screens/Inventory';
import Login from './screens/Login';


const App = () => {
    const {
        activeScreen,
        currentUser,
        theme,
        syncWithSupabase,
        checkAndResetBills,
        isSyncing
    } = useStore();

    useEffect(() => {
        if (currentUser) {
            syncWithSupabase();
            checkAndResetBills();
        }
    }, [currentUser]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        document.body.className = `${theme}-theme`;
    }, [theme]);

    const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

    useEffect(() => {
        const handleFocus = (e) => {
             const tag = e.target.tagName.toLowerCase();
             if (tag === 'input' || tag === 'textarea') setIsKeyboardVisible(true);
        };
        const handleBlur = (e) => setIsKeyboardVisible(false);

        window.addEventListener('focusin', handleFocus);
        window.addEventListener('focusout', handleBlur);

        return () => {
             window.removeEventListener('focusin', handleFocus);
             window.removeEventListener('focusout', handleBlur);
        };
    }, []);

    useEffect(() => {
        const { fetchExchangeRate, setLastActive, logout, currentUser } = useStore.getState();
        
        // --- Security Timeout ---
        const checkTimeout = () => {
             const state = useStore.getState();
             if (state.currentUser && (Date.now() - state.lastActive > SESSION_TIMEOUT_MS)) {
                 logout();
             }
        };

        const onUserActivity = () => {
             if (!document.hidden) {
                  checkTimeout();
             }
             setLastActive();
        };

        // Live Rate Pulse
        fetchExchangeRate();
        const rateInterval = setInterval(fetchExchangeRate, RATE_FETCH_INTERVAL_MS);

        // Activity Listeners
        window.addEventListener('visibilitychange', onUserActivity);
        window.addEventListener('mousedown', onUserActivity);
        window.addEventListener('keydown', onUserActivity);
        window.addEventListener('touchstart', onUserActivity);

        const timeoutCheckInterval = setInterval(checkTimeout, TIMEOUT_CHECK_INTERVAL_MS);

        return () => {
             clearInterval(rateInterval);
             clearInterval(timeoutCheckInterval);
             window.removeEventListener('visibilitychange', onUserActivity);
             window.removeEventListener('mousedown', onUserActivity);
             window.removeEventListener('keydown', onUserActivity);
             window.removeEventListener('touchstart', onUserActivity);
        };
    }, []);

    const renderScreen = () => {
        switch (activeScreen) {
            case 'dashboard': return <Dashboard />;
            case 'monthly': return <MonthlyPlanner />;
            case 'banks': return <BankTracker />;
            case 'history': return <History />;
            case 'recurring': return <Recurring />;
            case 'inventory': return <Inventory />;
            default: return <Dashboard />;
        }
    };

    if (!currentUser) return <Login />;

    return (
        <div className="iphone-container">
            {/* Deep Background Glass Orbs */}
            <div style={{ position: 'fixed', top: '10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'linear-gradient(135deg, hsla(var(--hue-primary), 100%, 50%, 0.1), transparent)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '15%', left: '-5%', width: '250px', height: '250px', borderRadius: '50%', background: 'linear-gradient(135deg, hsla(var(--hue-danger), 100%, 50%, 0.05), transparent)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

            <main className="main-content no-scrollbar" style={{ position: 'relative' }}>
                <ErrorBoundary>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeScreen}
                            initial={{ opacity: 0, scale: 0.98, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.02, y: -12 }}
                            transition={{
                                duration: 0.35,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            {renderScreen()}
                        </motion.div>
                    </AnimatePresence>
                </ErrorBoundary>
            </main>

            {!isKeyboardVisible && <Navigation />}

            {isSyncing && (
                <div style={{
                    position: 'fixed',
                    top: 'env(safe-area-inset-top, 24px)',
                    right: '24px',
                    zIndex: 3000,
                    background: 'var(--accent-primary)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '900',
                    boxShadow: 'var(--shadow-md)'
                }} className="sync-pulse">
                    SYNCING...
                </div>
            )}
        </div>
    );
};

export default App;
