import React from 'react';
import { ShieldAlert, ShieldCheck, RefreshCw, X, Download, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AntiRefreshModal({
  isOpen,
  onClose,
  docName,
  layersCount,
  onExportJson
}) {
  if (!isOpen) return null;

  const handleForceReload = () => {
    // Remove beforeunload listener before forcing reload
    window.onbeforeunload = null;
    window.location.reload();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 11000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          width: '90vw',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header with Shield */}
        <div style={{
          padding: '20px 24px 16px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
                Anti-Refresh Shield Active
              </h3>
              <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
                SigStudio intercepted an accidental page reload
              </span>
            </div>
          </div>

          <button className="modal-close" onClick={onClose} title="Keep Editing (Esc)">
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
            You pressed a refresh shortcut (<kbd style={{ background: 'var(--bg-canvas)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>Cmd+R / F5</kbd>) or attempted to reload. SigStudio prevented your session and canvas states from resetting.
          </p>

          <div style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)' }}>
                {docName || 'Untitled Signature'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                {layersCount} Active Layers • Auto-saved to Local Storage
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 8px',
              borderRadius: 6
            }}>
              <CheckCircle2 size={13} />
              <span>Protected</span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.4 }}>
            💡 To prevent data loss, your project is continuously saved. You can also export a <code>.json</code> backup file at any time.
          </p>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 24px',
          background: 'var(--bg-panel)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          {onExportJson && (
            <button
              className="btn-secondary"
              style={{ fontSize: 11.5, padding: '6px 12px', gap: 6 }}
              onClick={() => {
                onExportJson();
              }}
            >
              <Download size={13} />
              <span>Save Backup (.json)</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button
              className="btn-secondary"
              style={{ fontSize: 11.5, padding: '6px 12px', color: '#f43f5e' }}
              onClick={handleForceReload}
              title="Force browser to reload"
            >
              <RefreshCw size={12} />
              <span>Reload Anyway</span>
            </button>

            <button
              className="btn-primary"
              style={{ fontSize: 11.5, padding: '6px 16px', gap: 6 }}
              onClick={onClose}
              autoFocus
            >
              <ShieldCheck size={14} />
              <span>Keep Working</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
