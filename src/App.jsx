import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';
import { SESSION_TIMEOUT_MS, RATE_FETCH_INTERVAL_MS, TIMEOUT_CHECK_INTERVAL_MS } from './constants';
import useResponsive from './hooks/useResponsive';
import { requestNotificationPermission, checkExpiryNotifications } from './utils/notifications';

// Screens
import Navigation from './components/Navigation';
import Dashboard from './screens/Dashboard';
import MonthlyPlanner from './screens/MonthlyPlanner';
import BankTracker from './screens/BankTracker';
import Recurring from './screens/Recurring';
import History from './screens/History';
import Inventory from './screens/Inventory';
import Login from './screens/Login';
import Settings from './screens/Settings';


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
            // Request permission then immediately check for items expiring within 3 days
            requestNotificationPermission().then(granted => {
                if (granted) {
                    checkExpiryNotifications(useStore.getState().data.inventory, currentUser.id);
                }
            });
        }
    }, [currentUser]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        document.body.className = `${theme}-theme`;
    }, [theme]);

    const { isDesktop } = useResponsive();
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

        // Re-check expiry notifications every hour while the app is open
        const expiryInterval = setInterval(() => {
            const state = useStore.getState();
            if (state.currentUser) {
                checkExpiryNotifications(state.data.inventory, state.currentUser.id);
            }
        }, 60 * 60 * 1000);

        return () => {
             clearInterval(rateInterval);
             clearInterval(timeoutCheckInterval);
             clearInterval(expiryInterval);
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
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    if (!currentUser) return <Login />;

    return (
        <div className="iphone-container">

            <main className="main-content no-scrollbar" style={{ position: 'relative', marginLeft: isDesktop ? '240px' : 0 }}>
                <ErrorBoundary>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeScreen}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.14,
                                ease: 'easeOut'
                            }}
                            style={{ width: '100%' }}
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
                    top: 'env(safe-area-inset-top, 16px)',
                    right: '16px',
                    zIndex: 3000,
                    background: 'var(--card-bg)',
                    color: 'var(--text-secondary)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    border: '1px solid var(--glass-border)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                }} className="sync-pulse">
                    Syncing
                </div>
            )}
        </div>
    );
};

export default App;
