import React from 'react';

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '100vh', padding: '40px 24px',
                    textAlign: 'center', gap: '16px'
                }}>
                    <div style={{ fontSize: '48px' }}>⚠️</div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Something went wrong</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            marginTop: '8px', padding: '14px 28px', borderRadius: '16px',
                            background: 'var(--accent-primary)', color: 'white', border: 'none',
                            fontWeight: '800', fontSize: '15px', cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
