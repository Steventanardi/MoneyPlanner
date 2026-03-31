import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay" 
                    onClick={onClose}
                >
                    <motion.div 
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="modal-content" 
                        onClick={e => e.stopPropagation()}
                        style={{ overflowY: 'visible' }}
                    >
                        {/* Drag Handle Indicator */}
                        <div style={{ 
                            width: '40px', height: '6px', background: 'var(--text-secondary)', opacity: 0.3, 
                            borderRadius: '3px', position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)' 
                        }} />

                        {/* macOS Header Style */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {/* MacBook Style Red Dot */}
                                <div 
                                    onClick={onClose} 
                                    style={{ 
                                        width: '20px', height: '20px', borderRadius: '50%', 
                                        background: '#FF5F56', cursor: 'pointer',
                                        boxShadow: 'inset 0 0 2px rgba(0,0,0,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }} 
                                />
                                {/* Hidden Inactive MacBook Dots */}
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }} />
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }} />
                            </div>
                            <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, opacity: 0.9 }}>{title}</h2>
                            <div style={{ width: '52px' }} /> {/* Spacer */}
                        </div>

                        <div className="modal-body no-scrollbar" style={{ maxHeight: 'calc(90vh - 100px)', overflowY: 'auto' }}>
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
