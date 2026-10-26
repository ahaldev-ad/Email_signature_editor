import React, { useState } from 'react';
import { X, LayoutTemplate, Sparkles, ArrowRight, Search } from 'lucide-react';
import { PREBUILT_TEMPLATES } from '../utils/constants';

export function TemplatesModal({ isOpen, onClose, onSelectTemplate }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'executive', label: 'Executive' },
    { id: 'tech', label: 'Tech & SaaS' },
    { id: 'business', label: 'Real Estate & Legal' },
    { id: 'minimal', label: 'Minimalist' }
  ];

  const filteredTemplates = PREBUILT_TEMPLATES.filter(tmpl => {
    const matchesSearch = tmpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'executive' && (tmpl.id.includes('executive') || tmpl.id.includes('promo'))) return true;
    if (activeCategory === 'tech' && (tmpl.id.includes('tech') || tmpl.id.includes('fintech'))) return true;
    if (activeCategory === 'business' && (tmpl.id.includes('real_estate') || tmpl.id.includes('legal') || tmpl.id.includes('healthcare'))) return true;
    if (activeCategory === 'minimal' && (tmpl.id.includes('creative') || tmpl.id.includes('minimalist'))) return true;
    return true;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ width: 840 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <LayoutTemplate size={18} color="#6366f1" />
            <span>Signature Templates Library ({PREBUILT_TEMPLATES.length} Styles)</span>
          </div>
          <button className="tool-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-panel-header)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {categories.map(c => (
              <button
                key={c.id}
                className={`tool-btn ${activeCategory === c.id ? 'active' : ''}`}
                style={{ width: 'auto', padding: '4px 10px', fontSize: 11, fontWeight: 600 }}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '4px 8px', width: 220 }}>
            <Search size={13} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 12, padding: 0 }}
            />
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: 460 }}>
          <div className="templates-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {filteredTemplates.map(tmpl => {
              const isDarkTheme = tmpl.id.includes('dark') || tmpl.id.includes('ft');

              return (
                <div
                  key={tmpl.id}
                  className="template-card"
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>
                      {tmpl.name}
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: 4 }}>
                      {tmpl.width}×{tmpl.height}px
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, minHeight: 34 }}>
                    {tmpl.description}
                  </p>

                  {/* Visual miniature mockup badge */}
                  <div
                    style={{
                      height: 80,
                      background: isDarkTheme ? '#0b0f19' : '#ffffff',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 14px',
                      gap: 12
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: isDarkTheme ? 10 : '50%',
                        background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ width: '65%', height: 7, borderRadius: 2, background: isDarkTheme ? '#f8fafc' : '#1e293b' }} />
                      <div style={{ width: '45%', height: 5, borderRadius: 2, background: isDarkTheme ? '#38bdf8' : '#6366f1' }} />
                      <div style={{ width: '85%', height: 5, borderRadius: 2, background: isDarkTheme ? '#64748b' : '#94a3b8' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, color: 'var(--accent-cyan)', fontSize: 12, fontWeight: 600 }}>
                    <span>Apply Template</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
