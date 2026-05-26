import React, { useState } from 'react';
import { Home, Calendar, Package, Wallet, CreditCard, Coins, Settings as SettingsIcon, Sun, Moon, Clock, ChevronUp } from 'lucide-react';
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

/* ── Mobile: floating pill + bottom sheet ────────────────── */
const BottomNav = ({ activeScreen, setActiveScreen, currentUser }) => {
  const accent = currentUser?.color || 'var(--accent-primary)';
  const [isOpen, setIsOpen] = useState(false);

  const activeItem = NAV_ITEMS.find(i => i.id === activeScreen) || NAV_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  const handleNav = (id) => {
    setActiveScreen(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop — tap to close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Bottom sheet (always rendered for smooth slide transition) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 999,
        background: 'var(--card-bg)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid var(--glass-border)',
        borderBottom: 'none',
        padding: '14px 16px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: '0 -12px 48px rgba(0,0,0,0.25)',
        willChange: 'transform',
      }}>
        {/* Drag handle */}
        <div style={{
          width: '40px', height: '4px',
          background: 'var(--glass-border)',
          borderRadius: '2px', margin: '0 auto 18px',
        }} />

        {/* Nav grid — 4 per row, last 3 centered */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  width: 'calc(25% - 8px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '8px', padding: '18px 6px',
                  borderRadius: '16px',
                  background: isActive ? `${accent}15` : 'var(--input-bg)',
                  border: `2px solid ${isActive ? accent : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                  minWidth: 0,
                }}
              >
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 2}
                  color={isActive ? accent : 'var(--text-secondary)'}
                />
                <span style={{
                  fontSize: '11px', fontWeight: isActive ? '800' : '600',
                  color: isActive ? accent : 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.2px',
                  lineHeight: 1,
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating pill trigger — small footprint, doesn't block content */}
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          position: 'fixed',
          bottom: `calc(14px + env(safe-area-inset-bottom, 0px))`,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '11px 20px',
          background: 'var(--card-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '100px',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <ActiveIcon size={16} strokeWidth={2.5} color={accent} />
        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
          {activeItem.label}
        </span>
        <ChevronUp size={14} color="var(--text-secondary)" strokeWidth={2.5} />
      </button>
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
