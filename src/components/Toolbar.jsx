import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Moon, Sun,
  Download, FileCode, Users, LayoutTemplate, HelpCircle,
  FolderOpen, Save, Sparkles, Check, ChevronDown, Code2, Keyboard,
  Smartphone, Sliders, SlidersHorizontal, Menu, X, Edit3, PackagePlus,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CANVAS_PRESETS } from '../utils/constants';

export function Toolbar({
  docName,
  setDocName,
  canvasConfig,
  setCanvasConfig,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  setZoom,
  darkModePreview,
  setDarkModePreview,
  mobilePreview,
  setMobilePreview,
  uiTheme,
  setUiTheme,
  onOpenTemplates,
  onOpenBatch,
  onOpenGuide,
  onOpenCodePreview,
  onOpenShortcuts,
  onOpenLogoAssetHub,
  onOpenAntiRefreshModal,
  onCopySignature,
  onDownloadHtml,
  onCopyRawHtml,
  onExportJson,
  onImportJson,
  onToggleMobileDock,
  mobileDockOpen
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copying, setCopying] = useState(false);

  const exportRef = useRef(null);
  const toolsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCopyClick = async () => {
    setCopying(true);
    await onCopySignature();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.1, x: 0.85 }
      });
    } catch (_) {}
    setTimeout(() => setCopying(false), 1800);
  };

  const handlePresetChange = (e) => {
    const preset = CANVAS_PRESETS.find(p => p.id === e.target.value);
    if (preset) {
      setCanvasConfig(prev => ({ ...prev, width: preset.width, height: preset.height, preset: preset.id }));
    }
  };

  return (
    <header className="top-toolbar">
      {/* 1. Left Section: Brand & Document Name */}
      <div className="brand-section">
        <div className="brand-logo" title="SigStudio Advanced Email Signature Studio">
          <div className="brand-logo-mark">S</div>
          <span className="brand-title">SigStudio</span>
          <span className="brand-badge">PRO</span>
        </div>

        <div className="doc-name-wrapper">
          <Edit3 size={11} className="doc-edit-icon" />
          <input
            type="text"
            className="doc-name-input"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            title="Click to rename document"
            placeholder="Signature Name"
          />
        </div>

        {/* Anti-Refresh Protection Status Pill */}
        <div
          className="anti-refresh-badge hide-mobile"
          onClick={onOpenAntiRefreshModal}
          title="Anti-Refresh Protection Active (Cmd+R & F5 intercepted • Real-time Auto-Save active)"
        >
          <ShieldCheck size={12} color="#10b981" />
          <span>Anti-Refresh Active</span>
        </div>
      </div>

      {/* 2. Center Section: Viewport, Presets & Canvas Controls */}
      <div className="toolbar-center">
        {/* History: Undo / Redo */}
        <div className="btn-group">
          <button
            className="tool-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl/Cmd + Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            className="tool-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl/Cmd + Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Zoom Controls */}
        <div className="btn-group zoom-group">
          <button
            className="tool-btn"
            onClick={() => setZoom(prev => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10))}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            className="zoom-pill"
            onClick={() => setZoom(1.0)}
            title="Click to Reset Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            className="tool-btn"
            onClick={() => setZoom(prev => Math.min(2.0, Math.round((prev + 0.1) * 10) / 10))}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        <div className="toolbar-divider hide-mobile" />

        {/* Dimension Preset Selector */}
        <div className="preset-selector-wrapper hide-mobile">
          <select
            className="dimension-selector"
            value={canvasConfig.preset || 'custom'}
            onChange={handlePresetChange}
            title="Canvas Preset"
          >
            {CANVAS_PRESETS.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.width}×{p.height})
              </option>
            ))}
            <option value="custom">Custom Size</option>
          </select>
        </div>

        <div className="toolbar-divider hide-mobile" />

        {/* View Mode Simulators */}
        <div className="btn-group hide-mobile">
          <button
            className={`tool-btn ${darkModePreview ? 'active' : ''}`}
            onClick={() => setDarkModePreview(!darkModePreview)}
            title={darkModePreview ? "Exit Dark Mode Simulation" : "Preview in Dark Email Client"}
          >
            <Moon size={14} />
          </button>
          <button
            className={`tool-btn ${mobilePreview ? 'active' : ''}`}
            onClick={() => setMobilePreview(!mobilePreview)}
            title={mobilePreview ? "Exit Mobile Simulation" : "Preview on iPhone Mobile View"}
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {/* 3. Right Section: Library, Tools, Actions & Export */}
      <div className="toolbar-right">
        {/* Templates Button */}
        <button
          className="btn-secondary nav-action-btn"
          onClick={onOpenTemplates}
          title="Browse 9 Pre-built Design Templates"
        >
          <LayoutTemplate size={14} color="var(--accent-indigo)" />
          <span className="btn-label">Templates</span>
        </button>

        {/* Logos & Element Packs Hub */}
        {onOpenLogoAssetHub && (
          <button
            className="btn-secondary nav-action-btn"
            onClick={onOpenLogoAssetHub}
            title="Logos, Element Packs & Free Asset Services"
          >
            <PackagePlus size={14} color="var(--accent-cyan)" />
            <span className="btn-label">Logos & Packs</span>
          </button>
        )}

        {/* Organized Tools Dropdown (Team Batch, HTML Code, Guide, Shortcuts) */}
        <div className="dropdown-container hide-mobile" ref={toolsRef}>
          <button
            className={`btn-secondary nav-action-btn ${toolsOpen ? 'active' : ''}`}
            onClick={() => setToolsOpen(!toolsOpen)}
            title="More Studio Tools & Inspectors"
          >
            <SlidersHorizontal size={14} color="var(--accent-cyan)" />
            <span className="btn-label">Tools</span>
            <ChevronDown size={11} className={`dropdown-chevron ${toolsOpen ? 'open' : ''}`} />
          </button>

          {toolsOpen && (
            <div className="custom-dropdown-menu">
              {onOpenLogoAssetHub && (
                <button
                  className="dropdown-menu-item"
                  onClick={() => { setToolsOpen(false); onOpenLogoAssetHub(); }}
                >
                  <div className="menu-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>
                    <PackagePlus size={14} color="#38bdf8" />
                  </div>
                  <div className="menu-text-wrap">
                    <span className="menu-item-title">Logos & Element Packs</span>
                    <span className="menu-item-desc">Domain logo search & 1-click modular packs</span>
                  </div>
                </button>
              )}

              <button
                className="dropdown-menu-item"
                onClick={() => { setToolsOpen(false); onOpenBatch(); }}
              >
                <div className="menu-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>
                  <Users size={14} color="#38bdf8" />
                </div>
                <div className="menu-text-wrap">
                  <span className="menu-item-title">Team Batch & CSV</span>
                  <span className="menu-item-desc">Generate team signatures from CSV</span>
                </div>
              </button>

              <button
                className="dropdown-menu-item"
                onClick={() => { setToolsOpen(false); onOpenCodePreview(); }}
              >
                <div className="menu-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                  <Code2 size={14} color="#6366f1" />
                </div>
                <div className="menu-text-wrap">
                  <span className="menu-item-title">HTML Code Inspector</span>
                  <span className="menu-item-desc">Live email markup & client render test</span>
                </div>
              </button>

              <button
                className="dropdown-menu-item"
                onClick={() => { setToolsOpen(false); onOpenGuide(); }}
              >
                <div className="menu-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                  <HelpCircle size={14} color="#10b981" />
                </div>
                <div className="menu-text-wrap">
                  <span className="menu-item-title">Email Setup Guide</span>
                  <span className="menu-item-desc">Gmail, Outlook & Apple Mail tutorials</span>
                </div>
              </button>

              <div className="dropdown-divider" />

              <button
                className="dropdown-menu-item"
                onClick={() => { setToolsOpen(false); onOpenShortcuts(); }}
              >
                <div className="menu-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                  <Keyboard size={14} color="#f59e0b" />
                </div>
                <div className="menu-text-wrap">
                  <span className="menu-item-title">Keyboard Shortcuts</span>
                  <span className="menu-item-desc">Photoshop tools cheat-sheet</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Studio Theme Toggle */}
        <button
          className="tool-btn theme-toggle-btn"
          onClick={() => setUiTheme(uiTheme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${uiTheme === 'dark' ? 'Light' : 'Dark'} Studio Theme`}
        >
          {uiTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Primary Action Button: Copy Signature */}
        <button
          className="btn-primary copy-signature-btn"
          onClick={handleCopyClick}
          title="Copy Rich HTML Signature directly to paste into Gmail or Outlook"
        >
          {copying ? <Check size={15} /> : <Sparkles size={15} />}
          <span className="copy-btn-text">{copying ? 'Copied!' : 'Copy Signature'}</span>
        </button>

        {/* Export Dropdown */}
        <div className="dropdown-container" ref={exportRef}>
          <button
            className={`btn-secondary export-btn ${exportOpen ? 'active' : ''}`}
            onClick={() => setExportOpen(!exportOpen)}
            title="Download & Export Options"
          >
            <Download size={14} />
            <ChevronDown size={11} className={`dropdown-chevron ${exportOpen ? 'open' : ''}`} />
          </button>

          {exportOpen && (
            <div className="custom-dropdown-menu export-menu">
              <button
                className="dropdown-menu-item"
                onClick={() => { setExportOpen(false); onDownloadHtml(); }}
              >
                <div className="menu-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                  <Download size={14} color="#10b981" />
                </div>
                <div className="menu-text-wrap">
                  <span className="menu-item-title">Download .HTML</span>
                  <span className="menu-item-desc">Ready to import in email clients</span>
                </div>
              </button>

              <button
                className="dropdown-menu-item"
                onClick={() => { setExportOpen(false); onCopyRawHtml(); }}
              >
                <div className="menu-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>
                  <FileCode size={14} color="#38bdf8" />
                </div>
                <div className="menu-text-wrap">
                  <span className="menu-item-title">Copy Raw HTML Code</span>
                  <span className="menu-item-desc">Copy source code to clipboard</span>
                </div>
              </button>

              <div className="dropdown-divider" />

              <button
                className="dropdown-menu-item"
                onClick={() => { setExportOpen(false); onExportJson(); }}
              >
                <div className="menu-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                  <Save size={14} color="#f59e0b" />
                </div>
                <div className="menu-text-wrap">
                  <span className="menu-item-title">Export Project JSON</span>
                  <span className="menu-item-desc">Save editable signature file</span>
                </div>
              </button>

              <label className="dropdown-menu-item" style={{ cursor: 'pointer' }}>
                <div className="menu-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                  <FolderOpen size={14} color="#6366f1" />
                </div>
                <div className="menu-text-wrap">
                  <span className="menu-item-title">Open Project JSON</span>
                  <span className="menu-item-desc">Load previously saved file</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    setExportOpen(false);
                    onImportJson(e);
                  }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Mobile/Tablet Inspector & Layers Drawer Toggle */}
        {onToggleMobileDock && (
          <button
            className={`tool-btn mobile-dock-btn ${mobileDockOpen ? 'active' : ''}`}
            onClick={onToggleMobileDock}
            title="Toggle Inspector & Layers Drawer"
          >
            <Sliders size={14} />
          </button>
        )}

        {/* Mobile Responsive Overflow Menu (<768px) */}
        <button
          className="tool-btn mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          title="Open Mobile Navigation Menu"
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown (<768px) */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-sheet">
          <div className="mobile-sheet-header">
            <span>Studio Menu</span>
            <button className="tool-btn" onClick={() => setMobileMenuOpen(false)}>
              <X size={15} />
            </button>
          </div>

          <div className="mobile-sheet-grid">
            <button className="mobile-sheet-item" onClick={() => { setMobileMenuOpen(false); onOpenTemplates(); }}>
              <LayoutTemplate size={16} color="var(--accent-indigo)" />
              <span>Templates</span>
            </button>

            {onOpenLogoAssetHub && (
              <button className="mobile-sheet-item" onClick={() => { setMobileMenuOpen(false); onOpenLogoAssetHub(); }}>
                <PackagePlus size={16} color="var(--accent-cyan)" />
                <span>Logos & Packs</span>
              </button>
            )}

            <button className="mobile-sheet-item" onClick={() => { setMobileMenuOpen(false); onOpenBatch(); }}>
              <Users size={16} color="var(--accent-cyan)" />
              <span>Team Batch</span>
            </button>

            <button className="mobile-sheet-item" onClick={() => { setMobileMenuOpen(false); onOpenCodePreview(); }}>
              <Code2 size={16} color="#38bdf8" />
              <span>HTML Code</span>
            </button>

            <button className="mobile-sheet-item" onClick={() => { setMobileMenuOpen(false); onOpenGuide(); }}>
              <HelpCircle size={16} color="#10b981" />
              <span>Setup Guide</span>
            </button>

            <button className="mobile-sheet-item" onClick={() => { setMobileMenuOpen(false); onOpenShortcuts(); }}>
              <Keyboard size={16} color="#f59e0b" />
              <span>Shortcuts</span>
            </button>

            <button className="mobile-sheet-item" onClick={() => { setMobileMenuOpen(false); setDarkModePreview(!darkModePreview); }}>
              <Moon size={16} color="#38bdf8" />
              <span>{darkModePreview ? "Light Preview" : "Dark Preview"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
