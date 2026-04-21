import React, { useState } from 'react';
import { useStore, USERS } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, ArrowRight, ShieldCheck, Coins, ChevronLeft, Delete, ScanFace, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const { setCurrentUser, userBiometrics, hasUserPin, setUserPin, verifyUserPin } = useStore();
    const [selectedUser, setSelectedUser] = useState(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'scanning', 'success', 'failed'
    // Setup flow: 'verify' (user has a PIN), 'setup-new' (no PIN yet), 'setup-confirm' (confirming new PIN)
    const [mode, setMode] = useState('verify');
    const [pendingPin, setPendingPin] = useState('');

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setPin('');
        setError(false);
        setPendingPin('');
        setMode(hasUserPin(user.id) ? 'verify' : 'setup-new');
    };

    const handlePinPress = (val) => {
        if (pin.length < 4) {
            const newPin = pin + val;
            setPin(newPin);
            if (newPin.length === 4) {
                handlePinComplete(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError(false);
    };

    const handlePinComplete = async (inputPin) => {
        if (mode === 'setup-new') {
            setPendingPin(inputPin);
            setPin('');
            setMode('setup-confirm');
            return;
        }
        if (mode === 'setup-confirm') {
            if (inputPin === pendingPin) {
                try {
                    await setUserPin(selectedUser.id, inputPin);
                    handleLoginSuccess();
                } catch (err) {
                    console.error('Failed to set PIN:', err);
                    setError(true);
                    setTimeout(() => {
                        setPin('');
                        setPendingPin('');
                        setMode('setup-new');
                        setError(false);
                    }, 500);
                }
            } else {
                setError(true);
                setTimeout(() => {
                    setPin('');
                    setPendingPin('');
                    setMode('setup-new');
                    setError(false);
                }, 500);
            }
            return;
        }
        // mode === 'verify'
        const ok = await verifyUserPin(selectedUser.id, inputPin);
        if (ok) {
            handleLoginSuccess();
        } else {
            setError(true);
            setTimeout(() => {
                setPin('');
                setError(false);
            }, 500);
        }
    };

    const handleFaceID = async () => {
        if (!userBiometrics[selectedUser.id]) {
            alert("Please enroll Face ID in Settings first.");
            return;
        }

        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const options = {
                publicKey: {
                    challenge,
                    rpId: window.location.hostname,
                    userVerification: "required",
                    timeout: 60000
                }
            };

            // --- REAL HARDWARE PROMPT ---
            const credential = await navigator.credentials.get(options);
            if (credential) {
                handleLoginSuccess();
            }
        } catch (err) {
            console.error("Hardware Authentication Failed:", err);
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    const handleLoginSuccess = () => {
        setStatus('loading');
        setTimeout(() => {
            setCurrentUser(selectedUser);
        }, 800);
    };

    return (
        <div className="iphone-container light-theme" style={{ display: 'flex', flexDirection: 'column', padding: '40px 24px', justifyContent: 'center', minHeight: '100vh', position: 'relative' }}>
            <AnimatePresence mode="wait">
                {!selectedUser ? (
                    <motion.div 
                        key="user-select"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        style={{ position: 'relative', zIndex: 1 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <div className="flex-center" style={{ marginBottom: '24px' }}>
                                <div style={{ 
                                    width: '84px', height: '84px', borderRadius: '30px', 
                                    background: 'linear-gradient(135deg, var(--accent-primary), hsla(var(--hue-primary), 100%, 40%, 1))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                                    boxShadow: '0 20px 40px -12px hsla(var(--hue-primary), 100%, 50%, 0.4)', transform: 'rotate(-10deg)'
                                }}>
                                    <Coins size={42} strokeWidth={2.5} />
                                </div>
                            </div>
                            <h1 className="text-h1" style={{ fontSize: '38px', marginBottom: '8px' }}>Money Planner<span style={{ color: 'var(--accent-primary)' }}>.</span></h1>
                            <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-secondary)' }}>Welcome back to your financial hub.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {USERS.map((user, idx) => (
                                <motion.button
                                    key={user.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleUserSelect(user)}
                                    className="card glass-card"
                                    style={{ padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: `${user.color}15`, color: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {user.id === 'girl' ? <Users size={26} /> : <User size={26} />}
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '800', fontSize: '18px' }}>{user.name}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{user.role} Profile</div>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} color="var(--text-secondary)" style={{ opacity: 0.4 }} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="pin-entry"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        style={{ textAlign: 'center' }}
                    >
                        <button 
                            onClick={() => setSelectedUser(null)}
                            style={{ position: 'absolute', top: '20px', left: '0', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer' }}
                        >
                            <ChevronLeft size={20} /> Back
                        </button>

                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '20px', 
                                backgroundColor: `${selectedUser.color}15`, color: selectedUser.color,
                                margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {selectedUser.id === 'girl' ? <Users size={28} /> : <User size={28} />}
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>
                                {mode === 'setup-new' && 'Create Passcode'}
                                {mode === 'setup-confirm' && 'Confirm Passcode'}
                                {mode === 'verify' && 'Enter Passcode'}
                            </h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {mode === 'setup-new' && `Pick a 4-digit PIN for ${selectedUser.name}`}
                                {mode === 'setup-confirm' && 'Re-enter the PIN to confirm'}
                                {mode === 'verify' && `Identify yourself, ${selectedUser.name}`}
                            </p>
                        </div>

                        {/* PIN Dots */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '60px' }}>
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                                    style={{
                                        width: '14px', height: '14px', borderRadius: '50%',
                                        background: pin.length > i ? selectedUser.color : 'var(--input-bg)',
                                        boxShadow: pin.length > i ? `0 0 10px ${selectedUser.color}` : 'none',
                                        transition: 'background 0.2s ease'
                                    }}
                                />
                            ))}
                        </div>

                        {/* PIN Pad */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', maxWidth: '300px', margin: '0 auto' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <motion.button
                                    key={num}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handlePinPress(num.toString())}
                                    style={{ 
                                        height: '70px', borderRadius: '35px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
                                        fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    {num}
                                </motion.button>
                            ))}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleFaceID}
                                style={{ 
                                    height: '70px', borderRadius: '35px', background: `${selectedUser.color}10`, border: `1px solid ${selectedUser.color}30`,
                                    fontSize: '24px', fontWeight: '700', color: selectedUser.color, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <ScanFace size={32} />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handlePinPress('0')}
                                style={{ 
                                    height: '70px', borderRadius: '35px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
                                    fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                0
                            </motion.button>
                            <button
                                onClick={handleDelete}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Delete size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Real Hardware Face ID doesn't need overlays — the OS handles it */}

            {status === 'loading' && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
                    <div style={{ textAlign: 'center' }}>
                         <div className="spinning" style={{ border: `4px solid ${selectedUser?.color || 'var(--accent-primary)'}30`, borderTop: `4px solid ${selectedUser?.color || 'var(--accent-primary)'}`, width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 20px' }} />
                         <p style={{ fontWeight: '800', fontSize: '15px' }}>Accessing Vault...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
