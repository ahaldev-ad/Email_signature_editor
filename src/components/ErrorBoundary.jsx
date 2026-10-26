import React from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, Copy } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SigStudio Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('sigstudio_saved_project_v1');
      localStorage.removeItem('signacraft_saved_project_v1');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleCopyError = () => {
    const text = `${this.state.error?.toString()}\n\nStack:\n${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard.writeText(text);
    alert('Error details copied to clipboard');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: '#0f1115',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            maxWidth: 520,
            width: '100%',
            background: '#1b1e25',
            border: '1px solid #262b37',
            borderRadius: 16,
            padding: 28,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f43f5e'
              }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  SigStudio Recovery Shield
                </h2>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  An unexpected issue occurred while rendering the workspace
                </span>
              </div>
            </div>

            <div style={{
              background: '#121418',
              border: '1px solid #262b37',
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#38bdf8',
              maxHeight: 120,
              overflowY: 'auto',
              wordBreak: 'break-word'
            }}>
              {this.state.error?.message || 'Unknown render error'}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  background: '#6366f1',
                  color: '#ffffff',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset to Fresh Signature</span>
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  background: '#222630',
                  color: '#f8fafc',
                  border: '1px solid #262b37',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleCopyError}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #262b37',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                <Copy size={13} />
                <span>Copy Logs</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
