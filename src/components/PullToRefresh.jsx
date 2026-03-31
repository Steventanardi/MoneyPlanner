import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef(null);
    const controls = useAnimation();
    const threshold = 100;

    const [isAtTop, setIsAtTop] = useState(true);

    const handleScroll = (e) => {
        setIsAtTop(e.target.scrollTop === 0);
    };

    const handleDrag = (event, info) => {
        if (isRefreshing || !isAtTop) return;
        
        if (info.offset.y > 0) {
            const resistance = 0.4;
            setPullDistance(info.offset.y * resistance);
        }
    };

    const handleDragEnd = async (event, info) => {
        if (isRefreshing || pullDistance === 0) return;

        if (pullDistance >= threshold) {
            setIsRefreshing(true);
            setPullDistance(threshold);
            
            if (onRefresh) {
                await onRefresh();
            }
            
            setTimeout(() => {
                setIsRefreshing(false);
                setPullDistance(0);
                controls.start({ y: 0 });
            }, 800);
        } else {
            setPullDistance(0);
            controls.start({ y: 0 });
        }
    };

    return (
        <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="no-scrollbar"
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%', 
                overflowY: 'auto',
                overflowX: 'hidden',
                touchAction: isAtTop && pullDistance > 0 ? 'none' : 'auto'
            }}
        >
            {/* Pull Indicator Area */}
            <div style={{ 
                position: 'fixed', 
                top: 'env(safe-area-inset-top, 24px)', 
                left: 0, 
                right: 0, 
                height: `${Math.min(pullDistance, 140)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 4000,
                background: 'transparent',
                pointerEvents: 'none'
            }}>
                <motion.div
                    animate={{ 
                        rotate: isRefreshing ? 360 : pullDistance * 3,
                        scale: Math.min(1, pullDistance / threshold),
                        opacity: Math.min(1, pullDistance / (threshold * 0.8)),
                        y: Math.max(0, pullDistance - 40)
                    }}
                    transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring", damping: 20 }}
                    style={{
                        background: 'var(--accent-primary)',
                        padding: '12px',
                        borderRadius: '50%',
                        color: 'white',
                        boxShadow: '0 8px 24px hsla(var(--hue-primary), 100%, 50%, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <RefreshCw size={24} />
                </motion.div>
            </div>

            {/* Content Area - Only drag if we are at the top */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.6}
                dragListener={isAtTop && !isRefreshing}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{ y: isRefreshing ? (threshold / 2) : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ width: '100%', minHeight: '100%' }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PullToRefresh;
