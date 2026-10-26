import React, { useState } from 'react';
import { X, HelpCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';

export function SetupGuideModal({ isOpen, onClose, onCopySignature }) {
  const [selectedClient, setSelectedClient] = useState('gmail');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    setCopied(true);
    await onCopySignature();
    setTimeout(() => setCopied(false), 2000);
  };

  const clients = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '✉️',
      steps: [
        'Click the "Copy Signature" button above to copy the formatted signature to your clipboard.',
        'Open Gmail in your browser and click the Settings gear icon (⚙️) in the top-right corner, then select "See all settings".',
        'Under the "General" tab, scroll down to the "Signature" section.',
        'Click "+ Create new", give it a name, and press Create.',
        'Click into the signature editor box and paste with Ctrl+V (or Cmd+V on Mac).',
        'Set signature defaults for "For new emails use" and "On reply/forward use".',
        'Scroll to the bottom of the page and click "Save Changes". Done!'
      ]
    },
    {
      id: 'apple',
      name: 'Apple Mail',
      icon: '🍎',
      steps: [
        'Click "Copy Signature" button above.',
        'Open Apple Mail on your Mac, click "Mail" in the top menu bar, and open "Settings" (or Preferences).',
        'Navigate to the "Signatures" tab.',
        'Choose your email account on the left and click the "+" button to add a new signature.',
        'Uncheck the box that says "Always match my default message font" (crucial to preserve formatting).',
        'Click in the preview box, select any placeholder text, and paste with Cmd+V.',
        'Close settings. Your signature is active!'
      ]
    },
    {
      id: 'outlook_web',
      name: 'Outlook (Web)',
      icon: '🌐',
      steps: [
        'Click "Copy Signature" button above.',
        'Open Outlook.com or Microsoft 365 Web App in your browser.',
        'Click the Settings gear icon (⚙️) at the top right, then go to "Mail" > "Compose and reply".',
        'Under "Email signature", click "+ New signature" and give it a name.',
        'Paste your signature directly into the text box with Ctrl+V / Cmd+V.',
        'Set your default signature for new messages and replies, then click "Save".'
      ]
    },
    {
      id: 'outlook_desktop',
      name: 'Outlook (Desktop Windows/Mac)',
      icon: '💻',
      steps: [
        'Click "Copy Signature" or click "Download .HTML File" from the export dropdown.',
        'In Outlook Desktop, click "File" > "Options" > "Mail" > "Signatures".',
        'Click "New", enter a name for the signature.',
        'Paste your copied signature into the "Edit signature" box with Ctrl+V (or Cmd+V).',
        'Select your signature for New messages and Replies/forwards under "Choose default signature".',
        'Click "OK" to save.'
      ]
    }
  ];

  const current = clients.find(c => c.id === selectedClient) || clients[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ width: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <HelpCircle size={18} color="#6366f1" />
            <span>How to Install Your Email Signature</span>
          </div>
          <button className="tool-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Client Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-panel-header)' }}>
          {clients.map(c => (
            <button
              key={c.id}
              className={`dock-tab ${selectedClient === c.id ? 'active' : ''}`}
              onClick={() => setSelectedClient(c.id)}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ maxHeight: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>
              Instructions for {current.name}
            </h3>
            <button className="btn-primary" onClick={handleCopy} style={{ fontSize: 12, padding: '6px 12px' }}>
              <Copy size={13} />
              <span>{copied ? 'Copied!' : 'Copy Signature'}</span>
            </button>
          </div>

          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {current.steps.map((step, idx) => (
              <li key={idx} style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-main)' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
