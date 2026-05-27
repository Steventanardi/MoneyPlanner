import React from 'react';
import { Home, Calendar, Package, Wallet, CreditCard, Coins, Settings as SettingsIcon, Sun, Moon, Clock } from 'lucide-react';
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

/* ── Mobile: iOS-style persistent tab bar ────────────────── */
const TabBar = ({ activeScreen, setActiveScreen }) => {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 1000,
      display: 'flex',
      background: 'var(--nav-bg-blur)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '0.5px solid var(--glass-border)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      willChange: 'transform',
    }}>
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              paddingTop: '9px',
              paddingBottom: '7px',
              minHeight: '49px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? item.tint : 'transparent',
              transition: 'background 0.12s ease',
            }}>
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? item.ink : 'var(--text-secondary)'}
              />
            </div>
            <span style={{
              fontSize: '9px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? item.ink : 'var(--text-secondary)',
              lineHeight: 1,
              letterSpacing: '0.1px',
              whiteSpace: 'nowrap',
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
  const { activeScreen, setActiveScreen, currentUser, theme, toggleTheme } = useStore();
  const { isDesktop } = useResponsive();

  return isDesktop
    ? <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />
    : <TabBar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />;
};

export default Navigation;
