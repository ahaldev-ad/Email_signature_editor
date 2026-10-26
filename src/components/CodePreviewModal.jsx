import React, { useState } from 'react';
import { X, Code2, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { compileSignatureToHtml, downloadHtmlFile } from '../utils/compiler';

export function CodePreviewModal({ isOpen, onClose, canvasConfig, layers, variables, docName, darkModePreview }) {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState('code'); // 'code' | 'preview'

  if (!isOpen) return null;

  const rawHtml = compileSignatureToHtml(canvasConfig, layers, variables, { isDarkModePreview: darkModePreview });
  const fullHtml = compileSignatureToHtml(canvasConfig, layers, variables, { fullDocument: true, isDarkModePreview: darkModePreview });

  const handleCopyCode = async () => {
    setCopied(true);
    await navigator.clipboard.writeText(rawHtml);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadHtmlFile(`${docName.replace(/\s+/g, '_')}.html`, fullHtml);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ width: 780 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Code2 size={18} color="#38bdf8" />
            <span>Email HTML Code & Visual Output Inspector</span>
          </div>
          <button className="tool-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-panel-header)' }}>
          <button
            className={`dock-tab ${viewTab === 'code' ? 'active' : ''}`}
            onClick={() => setViewTab('code')}
          >
            Compiled HTML ({rawHtml.length} bytes)
          </button>
          <button
            className={`dock-tab ${viewTab === 'preview' ? 'active' : ''}`}
            onClick={() => setViewTab('preview')}
          >
            Email Client Render Test
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: 460, padding: 0 }}>
          {viewTab === 'code' ? (
            <div style={{ position: 'relative' }}>
              <pre
                style={{
                  margin: 0,
                  padding: 18,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: '#e2e8f0',
                  background: '#0a0d14',
                  overflowX: 'auto',
                  maxHeight: 440,
                  lineHeight: 1.6
                }}
              >
                <code>{rawHtml}</code>
              </pre>
            </div>
          ) : (
            <div style={{ padding: 24, background: darkModePreview ? '#121418' : '#f8fafc', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  background: darkModePreview ? '#1a1d24' : '#ffffff',
                  padding: 16,
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  maxWidth: '100%',
                  overflowX: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: rawHtml }}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleDownload}>
            <Download size={14} />
            <span>Download .HTML</span>
          </button>
          <button className="btn-primary" onClick={handleCopyCode}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied HTML!' : 'Copy Code to Clipboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
