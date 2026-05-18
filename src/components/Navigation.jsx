import React from 'react';
import { Home, Calendar, Package, Wallet, CreditCard, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import useResponsive from '../hooks/useResponsive';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home',    icon: Home       },
  { id: 'monthly',   label: 'Planner', icon: Calendar   },
  { id: 'recurring', label: 'Bills',   icon: CreditCard },
  { id: 'inventory', label: 'Stock',   icon: Package    },
  { id: 'banks',     label: 'Vault',   icon: Wallet     },
];

/* ── Desktop sidebar ─────────────────────────────────────── */
const Sidebar = ({ activeScreen, setActiveScreen, currentUser }) => {
  const accentColor = currentUser?.color || 'var(--accent-primary)';

  return (
    <nav style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(30px) saturate(210%)',
      WebkitBackdropFilter: 'blur(30px) saturate(210%)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex', flexDirection: 'column',
      padding: '28px 14px 28px',
      zIndex: 1000,
      boxShadow: '2px 0 20px rgba(0,0,0,0.04)'
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 10px', marginBottom: '36px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
          background: `linear-gradient(135deg, ${accentColor}, hsla(var(--hue-primary), 100%, 38%, 1))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 18px -4px ${accentColor}55`
        }}>
          <Coins size={22} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: '900', fontSize: '17px', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            Money<span style={{ color: accentColor }}>.</span>
          </div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Planner</div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: isActive ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveScreen(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '13px',
                padding: '12px 14px', borderRadius: '14px', width: '100%',
                background: isActive ? accentColor : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                boxShadow: isActive ? `0 6px 18px -4px ${accentColor}45` : 'none',
                transition: 'background 0.18s ease, box-shadow 0.18s ease'
              }}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? '#fff' : 'var(--text-secondary)'} />
              <span style={{
                fontSize: '14px', fontWeight: isActive ? '800' : '600',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* User chip */}
      <div style={{
        padding: '12px 14px', borderRadius: '14px',
        background: 'var(--input-bg)', display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '11px', flexShrink: 0,
          background: `${accentColor}22`, color: accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '900', fontSize: '15px'
        }}>
          {currentUser?.avatar || 'S'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: '800', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser?.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {currentUser?.role} Profile
          </div>
        </div>
      </div>
    </nav>
  );
};

/* ── Mobile / tablet bottom nav ──────────────────────────── */
const BottomNav = ({ activeScreen, setActiveScreen, currentUser }) => (
  <nav className="nav-floating">
    {NAV_ITEMS.map(item => {
      const Icon = item.icon;
      const isActive = activeScreen === item.id;
      return (
        <button
          key={item.id}
          onClick={() => setActiveScreen(item.id)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', flex: 1, height: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            position: 'relative', padding: 0
          }}
        >
          {isActive && (
            <motion.div
              layoutId="nav-active-pill"
              style={{
                position: 'absolute', top: '50%', left: '50%',
                x: '-50%', y: '-50%', width: '64px', height: '54px',
                backgroundColor: currentUser?.color || 'var(--accent-primary)',
                borderRadius: '18px',
                boxShadow: `0 8px 24px -4px ${currentUser?.color || '#007AFF'}60`,
                zIndex: 0
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <Icon
              size={22} strokeWidth={isActive ? 2.5 : 2}
              style={{
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'color 0.3s ease',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            />
            {!isActive && (
              <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                {item.label}
              </span>
            )}
          </div>
        </button>
      );
    })}
  </nav>
);

/* ── Exported component ───────────────────────────────────── */
const Navigation = () => {
  const { activeScreen, setActiveScreen, currentUser } = useStore();
  const { isDesktop } = useResponsive();

  return isDesktop
    ? <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} currentUser={currentUser} />
    : <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} currentUser={currentUser} />;
};

export default Navigation;
