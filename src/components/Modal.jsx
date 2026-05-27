import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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

    const transition = {
        type: 'spring',
        damping: 32,
        stiffness: 350,
        mass: 0.8
    };

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
                        exit={{ y: '110%' }}
                        transition={transition}
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{
                            overflowY: 'visible',
                            willChange: 'transform'
                        }}
                    >
                        {/* Drag handle */}
                        <div style={{
                            width: '44px', height: '5px',
                            background: 'var(--glass-border)',
                            borderRadius: '3px',
                            position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                        }} />

                        {/* Header — title + close pill */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '20px', marginTop: '16px',
                        }}>
                            <h2 style={{
                                fontSize: '20px', fontWeight: '800',
                                fontFamily: 'var(--font-display)',
                                margin: 0, letterSpacing: '-0.3px',
                                color: 'var(--text-primary)',
                            }}>
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                style={{
                                    width: '36px', height: '36px',
                                    borderRadius: '14px',
                                    background: 'var(--badge-bg)',
                                    border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body no-scrollbar" style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
