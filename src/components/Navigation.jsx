import React, { useState } from 'react';
import { Home, Calendar, Package, Wallet, CreditCard, Coins, Settings as SettingsIcon, Sun, Moon, Clock, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import useResponsive from '../hooks/useResponsive';

/* Each nav item gets a paired pastel fill for its active state. */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home',    icon: Home,         tint: 'var(--bento-peach)',    ink: 'var(--bento-peach-ink)' },
  { id: 'monthly',   label: 'Planner', icon: Calendar,     tint: 'var(--bento-lavender)', ink: 'var(--bento-lav-ink)' },
  { id: 'recurring', label: 'Bills',   icon: CreditCard,   tint: 'var(--bento-butter)',   ink: 'var(--bento-butter-ink)' },
  { id: 'inventory', label: 'Stock',   icon: Package,      tint: 'var(--bento-mint)',     ink: 'var(--bento-mint-ink)' },
  { id: 'banks',     label: 'Vault',   icon: Wallet,       tint: 'var(--bento-sky)',      ink: 'var(--bento-sky-ink)' },
  { id: 'history',   label: 'History', icon: Clock,        tint: 'var(--bento-blush)',    ink: 'var(--bento-blush-ink)' },
  { id: 'settings',  label: 'Account', icon: SettingsIcon, tint: 'var(--badge-bg)',       ink: 'var(--text-primary)' },
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
      padding: '28px 16px 24px',
      zIndex: 1000,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px', marginBottom: '32px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '14px',
          background: 'var(--bento-peach)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Coins size={20} color="var(--bento-peach-ink)" strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '17px', letterSpacing: '-0.4px', lineHeight: 1.05, color: 'var(--text-primary)' }}>
            Ruflo
          </div>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.4px' }}>Money planner</div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '14px', width: '100%',
                background: isActive ? item.tint : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.18s ease',
              }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.4 : 2}
                color={isActive ? item.ink : 'var(--text-secondary)'}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? item.ink : 'var(--text-secondary)',
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
          padding: '10px 12px', borderRadius: '14px',
          background: 'var(--badge-bg)',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: accent, color: '#FFFBF5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '13px', fontFamily: 'var(--font-display)',
          }}>
            {currentUser?.avatar || currentUser?.name?.charAt(0) || 'S'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: '700', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
              {currentUser?.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              {currentUser?.role}
            </div>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: '40px', height: '40px', borderRadius: '14px', flexShrink: 0,
            background: 'var(--badge-bg)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', transition: 'background 0.15s ease',
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
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
            background: 'rgba(43, 31, 18, 0.42)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Bottom sheet (always rendered for smooth slide transition) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 999,
        background: 'var(--card-bg)',
        borderRadius: '28px 28px 0 0',
        border: '1px solid var(--glass-border)',
        borderBottom: 'none',
        padding: '14px 16px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: '0 -16px 48px rgba(64, 40, 20, 0.18)',
        willChange: 'transform',
      }}>
        {/* Drag handle */}
        <div style={{
          width: '44px', height: '5px',
          background: 'var(--glass-border)',
          borderRadius: '3px', margin: '0 auto 18px',
        }} />

        {/* Nav grid — 4 per row, pastel pill per item */}
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
                  borderRadius: '20px',
                  background: isActive ? item.tint : 'var(--badge-bg)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, transform 0.1s ease',
                  minWidth: 0,
                }}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.4 : 2}
                  color={isActive ? item.ink : 'var(--text-secondary)'}
                />
                <span style={{
                  fontSize: '11px', fontWeight: isActive ? '700' : '600',
                  color: isActive ? item.ink : 'var(--text-secondary)',
                  letterSpacing: '0.1px',
                  lineHeight: 1,
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating pill trigger — pastel-tinted to the active section */}
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          position: 'fixed',
          bottom: `calc(16px + env(safe-area-inset-bottom, 0px))`,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 26px',
          background: activeItem.tint,
          border: 'none',
          borderRadius: '100px',
          cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(64, 40, 20, 0.22)',
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
          whiteSpace: 'nowrap',
          minHeight: '52px',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <ActiveIcon size={16} strokeWidth={2.4} color={activeItem.ink} />
        <span style={{ fontSize: '13px', fontWeight: '700', color: activeItem.ink, fontFamily: 'var(--font-display)' }}>
          {activeItem.label}
        </span>
        <ChevronUp size={14} color={activeItem.ink} strokeWidth={2.4} />
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
