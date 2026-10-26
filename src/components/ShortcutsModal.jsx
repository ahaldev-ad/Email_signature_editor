import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

export function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Tool Selection Shortcuts',
      shortcuts: [
        { key: 'V', desc: 'Select / Marquee Tool' },
        { key: 'P', desc: 'Photoshop Bezier Pen Tool' },
        { key: 'T', desc: 'Add Text Block' },
        { key: 'I', desc: 'Add Photo / Avatar' },
        { key: 'K', desc: 'Add Status / Availability Pill' },
        { key: '5', desc: 'Add Star Review Rating' },
        { key: 'Q', desc: 'Add Dynamic QR Code' },
        { key: 'H', desc: 'Add Handwritten Signature' },
        { key: 'G', desc: 'Add Review / Trust Badge' },
        { key: 'S', desc: 'Add Social Icons' },
        { key: 'U', desc: 'Add Divider Line' },
        { key: 'B', desc: 'Add CTA Button' },
        { key: 'R', desc: 'Add Card Shape' },
        { key: 'N', desc: 'Add Promo Banner' },
        { key: 'D', desc: 'Add Legal Disclaimer' }
      ]
    },
    {
      title: 'Canvas & Selection Controls',
      shortcuts: [
        { key: 'Click + Drag', desc: 'Marquee box select multiple elements' },
        { key: 'Shift + Click', desc: 'Add / remove element from multi-selection' },
        { key: 'Ctrl/Cmd + A', desc: 'Select all elements on canvas' },
        { key: 'Ctrl/Cmd + Z', desc: 'Undo last change' },
        { key: 'Ctrl/Cmd + Y', desc: 'Redo change (or Cmd+Shift+Z)' },
        { key: 'Ctrl/Cmd + D', desc: 'Duplicate selected element(s)' },
        { key: 'Delete / Backspace', desc: 'Delete selected element(s)' },
        { key: 'Arrow Keys', desc: 'Nudge element(s) by 1px (Shift: 10px)' },
        { key: 'Enter / Double Click', desc: 'Finish open Bezier pen path' },
        { key: 'Escape', desc: 'Deselect all / Exit Pen tool / Close modal' }
      ]
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ width: 620 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Keyboard size={18} color="#6366f1" />
            <span>Photoshop Studio Keyboard Shortcuts</span>
          </div>
          <button className="tool-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: 420 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {shortcutGroups.map((group, gIdx) => (
              <div key={gIdx} className="prop-group">
                <span className="prop-group-title">{group.title}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {group.shortcuts.map((sc, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-input)',
                        borderRadius: 6,
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sc.desc}</span>
                      <kbd
                        style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 6px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 4,
                          color: 'var(--accent-cyan)'
                        }}
                      >
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
