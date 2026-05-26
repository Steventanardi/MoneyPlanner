import React, { useState } from 'react';
import { Home, Calendar, Package, Wallet, CreditCard, Coins, Settings as SettingsIcon, Sun, Moon, Clock, MoreHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';
import useResponsive from '../hooks/useResponsive';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home',    icon: Home         },
  { id: 'monthly',   label: 'Planner', icon: Calendar     },
  { id: 'recurring', label: 'Bills',   icon: CreditCard   },
  { id: 'inventory', label: 'Stock',   icon: Package      },
  { id: 'banks',     label: 'Vault',   icon: Wallet       },
  { id: 'history',   label: 'History', icon: Clock        },
  { id: 'settings',  label: 'Account', icon: SettingsIcon },
];

const MOBILE_MAIN = NAV_ITEMS.slice(0, 5);
const MOBILE_MORE = NAV_ITEMS.slice(5);

/* ── Desktop sidebar ─────────────────────────────────────── */
const Sidebar = ({ activeScreen, setActiveScreen, currentUser, theme, toggleTheme }) => {
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

      {/* User chip + theme toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
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
        <button
          onClick={toggleTheme}
          style={{
            width: '38px', height: '38px', borderRadius: '9px', flexShrink: 0,
            background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', transition: 'background 0.15s ease'
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </nav>
  );
};

/* ── Mobile / tablet flat bottom bar ────────────────────── */
const BottomNav = ({ activeScreen, setActiveScreen, currentUser }) => {
  const accent = currentUser?.color || 'var(--accent-primary)';
  const [showMore, setShowMore] = useState(false);

  const handleNav = (id) => {
    setActiveScreen(id);
    setShowMore(false);
  };

  const moreIsActive = MOBILE_MORE.some(i => i.id === activeScreen);

  const btnStyle = (isActive) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', flex: 1, height: '100%',
    background: 'none', border: 'none', cursor: 'pointer',
    gap: '4px', padding: '0 6px', minWidth: 0,
    borderTop: isActive ? `2px solid ${accent}` : '2px solid transparent',
    transition: 'border-color 0.15s ease',
    marginTop: '-1px',
  });

  const labelStyle = (isActive) => ({
    fontSize: '10px', fontWeight: isActive ? '700' : '500',
    color: isActive ? accent : 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  });

  return (
    <>
      {/* More sheet backdrop */}
      {showMore && (
        <div
          onClick={() => setShowMore(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 998 }}
        />
      )}

      {/* More sheet */}
      {showMore && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          left: '12px', right: '12px',
          background: 'var(--card-bg)',
          borderRadius: '20px',
          padding: '12px',
          zIndex: 999,
          display: 'flex',
          gap: '10px',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
          border: '1px solid var(--glass-border)',
        }}>
          {MOBILE_MORE.map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  flex: 1, padding: '16px 8px',
                  borderRadius: '14px',
                  background: isActive ? `${accent}15` : 'var(--input-bg)',
                  border: `1.5px solid ${isActive ? accent : 'transparent'}`,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} color={isActive ? accent : 'var(--text-secondary)'} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: isActive ? accent : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <nav className="nav-floating">
        {MOBILE_MAIN.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button key={item.id} onClick={() => handleNav(item.id)} style={btnStyle(isActive)}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? accent : 'var(--text-secondary)'} />
              <span style={labelStyle(isActive)}>{item.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button onClick={() => setShowMore(v => !v)} style={btnStyle(moreIsActive || showMore)}>
          <MoreHorizontal size={22} strokeWidth={1.8} color={moreIsActive || showMore ? accent : 'var(--text-secondary)'} />
          <span style={labelStyle(moreIsActive || showMore)}>More</span>
        </button>
      </nav>
    </>
  );
};

/* ── Export ──────────────────────────────────────────────── */
const Navigation = () => {
  const { activeScreen, setActiveScreen, currentUser, theme, toggleTheme } = useStore();
  const { isDesktop } = useResponsive();

  return isDesktop
    ? <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />
    : <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} currentUser={currentUser} />;
};

export default Navigation;
