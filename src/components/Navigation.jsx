import React from 'react';
import { Home, Calendar, Package, Wallet, CreditCard, Coins } from 'lucide-react';
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
  const accent = currentUser?.color || 'var(--accent-primary)';

  return (
    <nav style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
      background: 'var(--nav-bg)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex', flexDirection: 'column',
      padding: '32px 14px 28px',
      zIndex: 1000,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '4px 10px', marginBottom: '36px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '9px',
          background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Coins size={18} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: '900', fontSize: '15px', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            Money<span style={{ color: accent }}>.</span>
          </div>
          <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Planner</div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 12px', borderRadius: '9px', width: '100%',
                background: isActive ? `${accent}12` : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                transition: 'background 0.12s ease, border-color 0.12s ease'
              }}
            >
              <Icon
                size={17} strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? accent : 'var(--text-secondary)'}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? accent : 'var(--text-secondary)',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* User chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '11px 12px', borderRadius: '9px',
        border: '1px solid var(--glass-border)',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
          background: `${accent}15`, color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '800', fontSize: '13px'
        }}>
          {currentUser?.avatar || 'S'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            {currentUser?.role}
          </div>
        </div>
      </div>
    </nav>
  );
};

/* ── Mobile / tablet flat bottom bar ────────────────────── */
const BottomNav = ({ activeScreen, setActiveScreen, currentUser }) => {
  const accent = currentUser?.color || 'var(--accent-primary)';

  return (
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
              gap: '3px', padding: 0,
              borderTop: isActive ? `2px solid ${accent}` : '2px solid transparent',
              transition: 'border-color 0.15s ease',
              marginTop: '-1px'  /* overlap the nav border-top */
            }}
          >
            <Icon
              size={21}
              strokeWidth={isActive ? 2.5 : 1.8}
              color={isActive ? accent : 'var(--text-secondary)'}
            />
            <span style={{
              fontSize: '9px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? accent : 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.3px'
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

/* ── Export ──────────────────────────────────────────────── */
const Navigation = () => {
  const { activeScreen, setActiveScreen, currentUser } = useStore();
  const { isDesktop } = useResponsive();

  return isDesktop
    ? <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} currentUser={currentUser} />
    : <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} currentUser={currentUser} />;
};

export default Navigation;
