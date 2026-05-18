import React from 'react';
import { Moon, Sun, Fingerprint, LogOut, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{
      fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)',
      textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px', paddingLeft: '4px'
    }}>
      {title}
    </div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

const Toggle = ({ enabled }) => (
  <div style={{
    width: '48px', height: '26px', borderRadius: '13px',
    background: enabled ? 'var(--accent-primary)' : 'var(--glass-border)',
    position: 'relative', flexShrink: 0, transition: 'background 0.2s ease'
  }}>
    <div style={{
      position: 'absolute', top: '3px',
      left: enabled ? '25px' : '3px',
      width: '20px', height: '20px', borderRadius: '10px',
      background: 'white', transition: 'left 0.2s ease',
      boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
    }} />
  </div>
);

const Row = ({ icon: Icon, label, sublabel, right, onClick, color, isLast }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
      padding: '15px 18px',
      background: 'none', border: 'none', cursor: onClick ? 'pointer' : 'default',
      borderBottom: isLast ? 'none' : '1px solid var(--glass-border)',
      textAlign: 'left'
    }}
  >
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
      background: `${color}18`, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>{label}</div>
      {sublabel && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '1px' }}>{sublabel}</div>}
    </div>
    {right}
  </button>
);

const Settings = () => {
  const { currentUser, theme, toggleTheme, toggleBiometrics, userBiometrics, logout } = useStore();
  const biometricsEnabled = userBiometrics?.[currentUser?.id] || false;
  const accent = currentUser?.color || 'var(--accent-primary)';

  return (
    <div className="screen-container" style={{ paddingBottom: '120px' }}>

      <div className="screen-header">
        <div>
          <h1 className="text-h1">Settings</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Preferences & Account</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '58px', height: '58px', borderRadius: '18px',
          background: `${accent}18`, color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: '900', flexShrink: 0
        }}>
          {currentUser?.avatar || 'S'}
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)' }}>{currentUser?.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '2px' }}>{currentUser?.role}</div>
        </div>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Row
          icon={theme === 'dark' ? Moon : Sun}
          label="Dark Mode"
          sublabel={theme === 'dark' ? 'Currently dark' : 'Currently light'}
          color="var(--accent-purple)"
          right={<Toggle enabled={theme === 'dark'} />}
          onClick={toggleTheme}
          isLast
        />
      </Section>

      {/* Security */}
      <Section title="Security">
        <Row
          icon={Fingerprint}
          label="Face ID / Biometrics"
          sublabel={biometricsEnabled ? 'Enabled — tap to disable' : 'Tap to enroll'}
          color="var(--accent-success)"
          right={<Toggle enabled={biometricsEnabled} />}
          onClick={toggleBiometrics}
          isLast
        />
      </Section>

      {/* Account */}
      <Section title="Account">
        <Row
          icon={LogOut}
          label="Sign Out"
          sublabel="You'll need your PIN to sign back in"
          color="var(--accent-danger)"
          onClick={logout}
          isLast
        />
      </Section>

      {/* About */}
      <Section title="About">
        <Row
          icon={Info}
          label="Money Planner"
          sublabel="Version 1.0.0"
          color="var(--text-secondary)"
          isLast
        />
      </Section>

    </div>
  );
};

export default Settings;
