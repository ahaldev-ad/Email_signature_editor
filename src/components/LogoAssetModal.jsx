import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  CheckCircle2, 
  Feather, 
  Star, 
  ArrowRight,
  DownloadCloud
} from 'lucide-react';
import { 
  ELEMENT_PACKS, 
  FREE_LOGO_SERVICES, 
  POPULAR_COMPANY_LOGOS 
} from '../utils/constants';

export default function LogoAssetModal({
  isOpen,
  onClose,
  onInsertElementPack,
  onInsertLogo
}) {
  const [activeTab, setActiveTab] = useState('logos'); // 'logos' | 'packs' | 'services'
  
  // Tab 1 state: Domain search
  const [domainSearch, setDomainSearch] = useState('');
  const [searchedDomain, setSearchedDomain] = useState('github.com');
  const [imgError, setImgError] = useState(false);

  // Tab 2 state: Category filter
  const [packCategory, setPackCategory] = useState('All');

  if (!isOpen) return null;

  const handleDomainSubmit = (e) => {
    e.preventDefault();
    let cleaned = domainSearch.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (cleaned) {
      setSearchedDomain(cleaned);
      setImgError(false);
    }
  };

  const currentSearchLogoUrl = `https://img.logo.dev/${searchedDomain}?token=pk_anonymous`;

  const categories = ['All', 'Contact & Info', 'Disclaimers', 'CTA & Buttons', 'Trust & Badges', 'Mobile & Apps', 'Calligraphy'];

  const filteredPacks = packCategory === 'All'
    ? ELEMENT_PACKS
    : ELEMENT_PACKS.filter(p => p.category === packCategory);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content logo-asset-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 860, width: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="modal-title" style={{ margin: 0, fontSize: 17 }}>Logos, Element Packs & Asset Hub</h2>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>
                Official brand logos, 1-click design component packs, and free asset directories
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '10px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-canvas)'
        }}>
          <button
            className={`tool-btn ${activeTab === 'logos' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '6px 14px', borderRadius: 8, fontSize: 12, gap: 6, fontWeight: 500 }}
            onClick={() => setActiveTab('logos')}
          >
            <Globe size={14} />
            <span>Company Logos & Instant Search</span>
          </button>

          <button
            className={`tool-btn ${activeTab === 'packs' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '6px 14px', borderRadius: 8, fontSize: 12, gap: 6, fontWeight: 500 }}
            onClick={() => setActiveTab('packs')}
          >
            <Package size={14} />
            <span>Modern Element Packs ({ELEMENT_PACKS.length})</span>
          </button>

          <button
            className={`tool-btn ${activeTab === 'services' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '6px 14px', borderRadius: 8, fontSize: 12, gap: 6, fontWeight: 500 }}
            onClick={() => setActiveTab('services')}
          >
            <ExternalLink size={14} />
            <span>Free Logo & Asset Directories</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          
          {/* TAB 1: LOGOS & INSTANT SEARCH */}
          {activeTab === 'logos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Instant Domain Logo Fetcher Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 12,
                padding: '16px 18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Instant Domain Logo Search</span>
                      <span className="brand-badge" style={{ fontSize: 10, padding: '2px 6px' }}>Clearbit / Logo.dev API</span>
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Enter any company website domain to fetch their authentic high-res logo immediately.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleDomainSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                      type="text"
                      className="prop-input-full"
                      style={{ paddingLeft: 32, fontSize: 12.5 }}
                      placeholder="e.g. stripe.com, vercel.com, spotify.com, openai.com"
                      value={domainSearch}
                      onChange={(e) => setDomainSearch(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-secondary" style={{ padding: '0 16px', fontSize: 12 }}>
                    Fetch Logo
                  </button>
                </form>

                {/* Live Preview Card */}
                {searchedDomain && (
                  <div style={{
                    marginTop: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-panel)',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 6,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}>
                        {!imgError ? (
                          <img
                            src={currentSearchLogoUrl}
                            alt={searchedDomain}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <Globe size={20} color="#94a3b8" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                          {searchedDomain}
                        </div>
                        <div style={{ fontSize: 11, color: imgError ? '#f43f5e' : 'var(--text-dim)' }}>
                          {imgError ? 'Logo not found for this domain. Try another domain or use preset.' : 'High-resolution official transparent logo'}
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      style={{ fontSize: 12, padding: '6px 14px', gap: 6 }}
                      onClick={() => {
                        onInsertLogo(currentSearchLogoUrl, searchedDomain);
                        onClose();
                      }}
                      disabled={imgError}
                    >
                      <Plus size={14} />
                      <span>Add to Signature</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Popular Curated Logos Grid */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    Popular Company & Tech Brand Logos (1-Click Insert)
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    Click any logo to place it onto your canvas
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 10
                }}>
                  {POPULAR_COMPANY_LOGOS.map((item) => (
                    <button
                      key={item.name}
                      className="tool-btn"
                      style={{
                        height: 'auto',
                        padding: '12px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-panel)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onClick={() => {
                        onInsertLogo(item.logoUrl, item.name);
                        onClose();
                      }}
                      title={`Insert ${item.name} logo`}
                    >
                      <div style={{
                        width: 38,
                        height: 38,
                        background: '#ffffff',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 6,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                      }}>
                        <img
                          src={item.logoUrl}
                          alt={item.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          loading="lazy"
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURATED ELEMENT PACKS */}
          {activeTab === 'packs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`tool-btn ${packCategory === cat ? 'active' : ''}`}
                    style={{ width: 'auto', padding: '4px 12px', borderRadius: 20, fontSize: 11.5 }}
                    onClick={() => setPackCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Element Packs Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 12
              }}>
                {filteredPacks.map((pack) => (
                  <div
                    key={pack.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      background: 'var(--bg-panel)',
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          color: 'var(--accent-indigo)',
                          letterSpacing: '0.04em'
                        }}>
                          {pack.category}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-dim)', background: 'var(--bg-canvas)', padding: '2px 6px', borderRadius: 4 }}>
                          {pack.layers.length} {pack.layers.length === 1 ? 'Layer' : 'Layers'}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                        {pack.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                        {pack.desc}
                      </p>

                      {/* Mini Preview Box */}
                      <div style={{
                        marginTop: 10,
                        padding: '8px 10px',
                        background: 'var(--bg-canvas)',
                        borderRadius: 6,
                        border: '1px dashed var(--border-subtle)',
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                      }}>
                        {pack.category === 'Disclaimers' && <FileText size={12} color="#10b981" />}
                        {pack.category === 'CTA & Buttons' && <Sparkles size={12} color="#6366f1" />}
                        {pack.category === 'Trust & Badges' && <ShieldCheck size={12} color="#0284c7" />}
                        {pack.category === 'Mobile & Apps' && <Smartphone size={12} color="#000000" />}
                        {pack.category === 'Calligraphy' && <Feather size={12} color="#8b5cf6" />}
                        {pack.category === 'Contact & Info' && <Globe size={12} color="#64748b" />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pack.layers[0]?.text || pack.layers[0]?.ratingText || 'Pre-designed vector element'}
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '7px 0', gap: 6 }}
                      onClick={() => {
                        onInsertElementPack(pack);
                        onClose();
                      }}
                    >
                      <Plus size={14} />
                      <span>Insert Pack into Signature</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FREE LOGO & ASSET DIRECTORIES */}
          {activeTab === 'services' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <Sparkles size={18} color="var(--accent-indigo)" />
                <span style={{ fontSize: 12, color: 'var(--text-main)', lineHeight: 1.4 }}>
                  Need specific brand vectors or executive photography? These verified free resources provide direct SVG vector downloads and royalty-free headshots for your signatures.
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12
              }}>
                {FREE_LOGO_SERVICES.map((srv) => (
                  <div
                    key={srv.name}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      background: 'var(--bg-panel)',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)' }}>
                          {srv.name}
                        </h4>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: `${srv.color}20`,
                          color: srv.color,
                          border: `1px solid ${srv.color}40`
                        }}>
                          {srv.badge}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.45 }}>
                        {srv.desc}
                      </p>
                    </div>

                    <a
                      href={srv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        fontSize: 12,
                        padding: '7px 0',
                        gap: 6
                      }}
                    >
                      <span>Visit {srv.name.split(' ')[0]}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
            💡 Tip: All inserted logos and packs can be resized, repositioned, and styled in the Inspector.
          </span>
          <button className="btn-secondary" onClick={onClose} style={{ fontSize: 12, padding: '6px 14px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
