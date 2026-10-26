import React from 'react';
import {
  AlignLeft, AlignCenter, AlignRight,
  Maximize, Minimize, Link2, Upload, Sparkles, Sliders,
  Italic, Underline, Palette, Lock, Unlock, CaseUpper, PenTool,
  Layers as LayersIcon, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Copy, Trash2, QrCode, Star, Activity, Feather
} from 'lucide-react';
import {
  EMAIL_SAFE_FONTS,
  SOCIAL_PLATFORMS,
  SOCIAL_STYLE_PACKS,
  BRAND_COLOR_PALETTES,
  STATUS_PRESETS,
  SIGNATURE_STYLES
} from '../utils/constants';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
];

export function InspectorPanel({
  layer,
  selectedLayers = [],
  selectedLayerIds = [],
  onUpdateLayer,
  onUpdateMultipleLayers,
  onAlignSelected,
  onDeleteSelected,
  onDuplicateSelected,
  canvasConfig,
  setCanvasConfig,
  onOpenLogoAssetHub
}) {
  // Batch Multi-Selection Inspector
  if (selectedLayerIds && selectedLayerIds.length > 1) {
    return (
      <div className="dock-content">
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Multi-Selection ({selectedLayerIds.length})</span>
            <LayersIcon size={13} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>
            {selectedLayerIds.length} elements selected. Batch transform, align, or distribute together.
          </div>

          {/* Quick Alignment Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => onAlignSelected && onAlignSelected('left')} title="Align Left">
              <AlignLeft size={13} /> Left
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => onAlignSelected && onAlignSelected('center')} title="Align Center">
              <AlignCenter size={13} /> Center
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => onAlignSelected && onAlignSelected('right')} title="Align Right">
              <AlignRight size={13} /> Right
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => onAlignSelected && onAlignSelected('top')} title="Align Top">
              <AlignStartVertical size={13} /> Top
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => onAlignSelected && onAlignSelected('middle')} title="Align Middle">
              <AlignCenterVertical size={13} /> Middle
            </button>
            <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => onAlignSelected && onAlignSelected('bottom')} title="Align Bottom">
              <AlignEndVertical size={13} /> Bottom
            </button>
          </div>
        </div>

        {/* Batch Actions */}
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Batch Actions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={onDuplicateSelected}>
              <Copy size={13} /> Duplicate All Selected (Cmd+D)
            </button>
            <button className="btn-secondary text-danger" style={{ justifyContent: 'center' }} onClick={onDeleteSelected}>
              <Trash2 size={13} /> Delete All Selected (Backspace)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!layer) {
    // Show Canvas Properties when no layer is selected
    return (
      <div className="dock-content">
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Canvas Settings</span>
            <Sliders size={13} />
          </div>

          <div className="prop-row">
            <span className="prop-label">Width</span>
            <input
              type="number"
              className="prop-input-sm"
              value={canvasConfig.width}
              onChange={(e) => setCanvasConfig({ ...canvasConfig, width: Number(e.target.value) })}
            />
          </div>

          <div className="prop-row">
            <span className="prop-label">Height</span>
            <input
              type="number"
              className="prop-input-sm"
              value={canvasConfig.height}
              onChange={(e) => setCanvasConfig({ ...canvasConfig, height: Number(e.target.value) })}
            />
          </div>

          <div className="prop-row">
            <span className="prop-label">Background</span>
            <div className="prop-color-picker">
              <input
                type="color"
                className="color-swatch"
                value={canvasConfig.backgroundColor || '#ffffff'}
                onChange={(e) => setCanvasConfig({ ...canvasConfig, backgroundColor: e.target.value })}
              />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                {canvasConfig.backgroundColor || '#ffffff'}
              </span>
            </div>
          </div>
        </div>

        {/* Brand Color Palettes */}
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Curated Brand Palettes</span>
            <Palette size={13} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BRAND_COLOR_PALETTES.map(p => (
              <div
                key={p.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  background: 'var(--bg-input)',
                  borderRadius: 6,
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600 }}>{p.name}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.primary }} />
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.secondary }} />
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.text }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="prop-group" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
          <div className="prop-group-title" style={{ color: 'var(--accent-cyan)' }}>
            <span>Pro Tip</span>
            <Sparkles size={13} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Click any layer directly on the artboard or from the Layers tab to inspect its coordinates, colors, fonts, links, and opacity.
          </p>
        </div>
      </div>
    );
  }

  // Handle alignment helpers
  const handleAlign = (type) => {
    const { width: cW, height: cH } = canvasConfig;
    switch (type) {
      case 'left': onUpdateLayer(layer.id, { x: 0 }); break;
      case 'centerH': onUpdateLayer(layer.id, { x: Math.round((cW - layer.width) / 2) }); break;
      case 'right': onUpdateLayer(layer.id, { x: cW - layer.width }); break;
      case 'top': onUpdateLayer(layer.id, { y: 0 }); break;
      case 'centerV': onUpdateLayer(layer.id, { y: Math.round((cH - layer.height) / 2) }); break;
      case 'bottom': onUpdateLayer(layer.id, { y: cH - layer.height }); break;
      default: break;
    }
  };

  // Handle local image file upload preview
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateLayer(layer.id, { url: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="dock-content">
      {/* Transform & Position */}
      <div className="prop-group">
        <div className="prop-group-title">
          <span>Transform & Alignment</span>
          {/* Quick Lock / Unlock Toggle */}
          <button
            className="tool-btn"
            style={{ width: 22, height: 22 }}
            onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
            title={layer.locked ? "Unlock element" : "Lock element"}
          >
            {layer.locked ? <Lock size={12} color="#f59e0b" /> : <Unlock size={12} color="var(--text-dim)" />}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div className="prop-row">
            <span className="prop-label">X</span>
            <input
              type="number"
              className="prop-input-sm"
              value={layer.x}
              onChange={(e) => onUpdateLayer(layer.id, { x: Number(e.target.value) })}
            />
          </div>
          <div className="prop-row">
            <span className="prop-label">Y</span>
            <input
              type="number"
              className="prop-input-sm"
              value={layer.y}
              onChange={(e) => onUpdateLayer(layer.id, { y: Number(e.target.value) })}
            />
          </div>
          <div className="prop-row">
            <span className="prop-label">W</span>
            <input
              type="number"
              className="prop-input-sm"
              value={layer.width}
              onChange={(e) => onUpdateLayer(layer.id, { width: Number(e.target.value) })}
            />
          </div>
          <div className="prop-row">
            <span className="prop-label">H</span>
            <input
              type="number"
              className="prop-input-sm"
              value={layer.height}
              onChange={(e) => onUpdateLayer(layer.id, { height: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Alignment quick buttons */}
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          <button className="tool-btn" onClick={() => handleAlign('left')} title="Align Left to Canvas">
            <AlignLeft size={14} />
          </button>
          <button className="tool-btn" onClick={() => handleAlign('centerH')} title="Center Horizontally">
            <AlignCenter size={14} />
          </button>
          <button className="tool-btn" onClick={() => handleAlign('right')} title="Align Right to Canvas">
            <AlignRight size={14} />
          </button>
          <div className="toolbar-divider" />
          <button className="tool-btn" onClick={() => handleAlign('top')} title="Align Top">
            <Minimize size={14} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button className="tool-btn" onClick={() => handleAlign('centerV')} title="Center Vertically">
            <Maximize size={14} />
          </button>
          <button className="tool-btn" onClick={() => handleAlign('bottom')} title="Align Bottom">
            <Minimize size={14} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>

        {/* Opacity Slider */}
        <div className="prop-row" style={{ marginTop: 8 }}>
          <span className="prop-label">Opacity</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={layer.opacity !== undefined ? layer.opacity : 1}
              onChange={(e) => onUpdateLayer(layer.id, { opacity: Number(e.target.value) })}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', minWidth: 32 }}>
              {Math.round((layer.opacity !== undefined ? layer.opacity : 1) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* TEXT SPECIFIC CONTROLS */}
      {layer.type === 'text' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Typography</span>
          </div>

          <div className="prop-row">
            <span className="prop-label">Font</span>
            <select
              className="prop-input-full"
              value={layer.fontFamily || "Arial, Helvetica, sans-serif"}
              onChange={(e) => onUpdateLayer(layer.id, { fontFamily: e.target.value })}
            >
              {EMAIL_SAFE_FONTS.map(f => (
                <option key={f.name} value={f.family}>{f.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div className="prop-row">
              <span className="prop-label">Size</span>
              <input
                type="number"
                className="prop-input-sm"
                value={layer.fontSize || 13}
                onChange={(e) => onUpdateLayer(layer.id, { fontSize: Number(e.target.value) })}
              />
            </div>
            <div className="prop-row">
              <span className="prop-label">Weight</span>
              <select
                className="prop-input-sm"
                style={{ width: 75 }}
                value={layer.fontWeight || '400'}
                onChange={(e) => onUpdateLayer(layer.id, { fontWeight: e.target.value })}
              >
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="800">Black</option>
              </select>
            </div>
          </div>

          {/* Text Style Toggles (Italic, Underline, Uppercase) */}
          <div className="prop-row">
            <span className="prop-label">Style</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`tool-btn ${layer.fontStyle === 'italic' ? 'active' : ''}`}
                style={{ width: 28, height: 28 }}
                onClick={() => onUpdateLayer(layer.id, { fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
                title="Italic"
              >
                <Italic size={13} />
              </button>
              <button
                className={`tool-btn ${layer.textDecoration === 'underline' ? 'active' : ''}`}
                style={{ width: 28, height: 28 }}
                onClick={() => onUpdateLayer(layer.id, { textDecoration: layer.textDecoration === 'underline' ? 'none' : 'underline' })}
                title="Underline"
              >
                <Underline size={13} />
              </button>
              <button
                className={`tool-btn ${layer.textTransform === 'uppercase' ? 'active' : ''}`}
                style={{ width: 28, height: 28 }}
                onClick={() => onUpdateLayer(layer.id, { textTransform: layer.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                title="Uppercase"
              >
                <CaseUpper size={14} />
              </button>
            </div>
          </div>

          {/* Line Height & Letter Spacing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div className="prop-row">
              <span className="prop-label">Line-H</span>
              <input
                type="number"
                step="0.1"
                min="0.8"
                max="2.5"
                className="prop-input-sm"
                value={layer.lineHeight || 1.3}
                onChange={(e) => onUpdateLayer(layer.id, { lineHeight: Number(e.target.value) })}
              />
            </div>
            <div className="prop-row">
              <span className="prop-label">Letter-Sp</span>
              <input
                type="number"
                step="0.5"
                min="-2"
                max="8"
                className="prop-input-sm"
                value={layer.letterSpacing || 0}
                onChange={(e) => onUpdateLayer(layer.id, { letterSpacing: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Color & Quick Palette */}
          <div className="prop-row">
            <span className="prop-label">Color</span>
            <div className="prop-color-picker">
              <input
                type="color"
                className="color-swatch"
                value={layer.color || '#333333'}
                onChange={(e) => onUpdateLayer(layer.id, { color: e.target.value })}
              />
              <input
                type="text"
                className="prop-input-sm"
                style={{ width: 85 }}
                value={layer.color || '#333333'}
                onChange={(e) => onUpdateLayer(layer.id, { color: e.target.value })}
              />
            </div>
          </div>

          {/* Quick Color Swatches */}
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            {['#0f172a', '#6366f1', '#38bdf8', '#10b981', '#ec4899', '#d97706', '#475569'].map(c => (
              <div
                key={c}
                onClick={() => onUpdateLayer(layer.id, { color: c })}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: layer.color === c ? '2px solid #fff' : '1px solid var(--border-subtle)'
                }}
              />
            ))}
          </div>

          {/* Alignment */}
          <div className="prop-row" style={{ marginTop: 6 }}>
            <span className="prop-label">Align</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`tool-btn ${layer.textAlign === 'left' ? 'active' : ''}`}
                onClick={() => onUpdateLayer(layer.id, { textAlign: 'left' })}
              >
                <AlignLeft size={13} />
              </button>
              <button
                className={`tool-btn ${layer.textAlign === 'center' ? 'active' : ''}`}
                onClick={() => onUpdateLayer(layer.id, { textAlign: 'center' })}
              >
                <AlignCenter size={13} />
              </button>
              <button
                className={`tool-btn ${layer.textAlign === 'right' ? 'active' : ''}`}
                onClick={() => onUpdateLayer(layer.id, { textAlign: 'right' })}
              >
                <AlignRight size={13} />
              </button>
            </div>
          </div>

          {/* Hyperlink */}
          <div className="prop-row">
            <span className="prop-label">Link</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
              <Link2 size={13} color="var(--text-dim)" />
              <input
                type="text"
                className="prop-input-full"
                placeholder="https:// or mailto: or tel:"
                value={layer.linkUrl || ''}
                onChange={(e) => onUpdateLayer(layer.id, { linkUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Dynamic Variable Tags */}
          <div style={{ marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, display: 'block' }}>
              Insert Variable Tag:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {['FullName', 'JobTitle', 'Company', 'Email', 'Phone', 'Website'].map(tag => (
                <button
                  key={tag}
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    color: 'var(--accent-cyan)'
                  }}
                  onClick={() => onUpdateLayer(layer.id, { text: `${layer.text} {${tag}}` })}
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* IMAGE / AVATAR / LOGO CONTROLS */}
      {layer.type === 'image' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Image Properties</span>
          </div>

          <div className="prop-row">
            <span className="prop-label">Source URL</span>
          </div>
          <input
            type="text"
            className="prop-input-full"
            placeholder="Image URL or GitHub raw image link"
            value={layer.url || ''}
            onChange={(e) => onUpdateLayer(layer.id, { url: e.target.value })}
          />

          {/* Quick Avatar Gallery Swapper */}
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>
              Sample Avatars:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {SAMPLE_AVATARS.map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  alt={`Preset ${idx}`}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: layer.url === av ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
                  }}
                  onClick={() => onUpdateLayer(layer.id, { url: av })}
                />
              ))}
            </div>
          </div>

          <div className="prop-row" style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
              <Upload size={14} />
              <span>Upload Local Photo</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
            {onOpenLogoAssetHub && (
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: 11.5, gap: 6, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                onClick={onOpenLogoAssetHub}
              >
                <Sparkles size={13} color="var(--accent-indigo)" />
                <span>Search Company Logos & Free Assets</span>
              </button>
            )}
          </div>

          {/* Corner Style */}
          <div className="prop-row">
            <span className="prop-label">Shape</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className={`tool-btn ${layer.borderRadius === 0 ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}
                onClick={() => onUpdateLayer(layer.id, { borderRadius: 0 })}
              >
                Square
              </button>
              <button
                className={`tool-btn ${layer.borderRadius === 12 ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}
                onClick={() => onUpdateLayer(layer.id, { borderRadius: 12 })}
              >
                Rounded
              </button>
              <button
                className={`tool-btn ${layer.borderRadius === 999 ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}
                onClick={() => onUpdateLayer(layer.id, { borderRadius: 999 })}
              >
                Circle
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div className="prop-row">
              <span className="prop-label">Border</span>
              <input
                type="number"
                className="prop-input-sm"
                value={layer.borderWidth || 0}
                onChange={(e) => onUpdateLayer(layer.id, { borderWidth: Number(e.target.value) })}
              />
            </div>
            <div className="prop-row">
              <span className="prop-label">Color</span>
              <input
                type="color"
                className="color-swatch"
                value={layer.borderColor || '#6366f1'}
                onChange={(e) => onUpdateLayer(layer.id, { borderColor: e.target.value })}
              />
            </div>
          </div>

          <div className="prop-row">
            <span className="prop-label">Click Link</span>
            <input
              type="text"
              className="prop-input-full"
              placeholder="https://yourwebsite.com"
              value={layer.linkUrl || ''}
              onChange={(e) => onUpdateLayer(layer.id, { linkUrl: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* DIVIDER CONTROLS */}
      {layer.type === 'divider' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Divider Properties</span>
          </div>

          <div className="prop-row">
            <span className="prop-label">Orientation</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className={`tool-btn ${layer.orientation === 'vertical' ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}
                onClick={() => onUpdateLayer(layer.id, { orientation: 'vertical', width: 2, height: 120 })}
              >
                Vertical
              </button>
              <button
                className={`tool-btn ${layer.orientation === 'horizontal' ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}
                onClick={() => onUpdateLayer(layer.id, { orientation: 'horizontal', width: 350, height: 1 })}
              >
                Horizontal
              </button>
            </div>
          </div>

          <div className="prop-row">
            <span className="prop-label">Line Color</span>
            <div className="prop-color-picker">
              <input
                type="color"
                className="color-swatch"
                value={layer.color || '#6366f1'}
                onChange={(e) => onUpdateLayer(layer.id, { color: e.target.value })}
              />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                {layer.color || '#6366f1'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTA BUTTON CONTROLS */}
      {layer.type === 'button' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>CTA Button Properties</span>
          </div>

          <div className="prop-row">
            <span className="prop-label">Label</span>
            <input
              type="text"
              className="prop-input-full"
              value={layer.text || ''}
              onChange={(e) => onUpdateLayer(layer.id, { text: e.target.value })}
            />
          </div>

          <div className="prop-row">
            <span className="prop-label">Target Link</span>
            <input
              type="text"
              className="prop-input-full"
              placeholder="https://calendly.com/..."
              value={layer.linkUrl || ''}
              onChange={(e) => onUpdateLayer(layer.id, { linkUrl: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div className="prop-row">
              <span className="prop-label">Bg Color</span>
              <input
                type="color"
                className="color-swatch"
                value={layer.bgColor || '#6366f1'}
                onChange={(e) => onUpdateLayer(layer.id, { bgColor: e.target.value })}
              />
            </div>
            <div className="prop-row">
              <span className="prop-label">Text Color</span>
              <input
                type="color"
                className="color-swatch"
                value={layer.textColor || '#ffffff'}
                onChange={(e) => onUpdateLayer(layer.id, { textColor: e.target.value })}
              />
            </div>
          </div>

          {/* Border (Allows Ghost/Outline Buttons) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div className="prop-row">
              <span className="prop-label">Border</span>
              <input
                type="number"
                className="prop-input-sm"
                value={layer.borderWidth || 0}
                onChange={(e) => onUpdateLayer(layer.id, { borderWidth: Number(e.target.value) })}
              />
            </div>
            <div className="prop-row">
              <span className="prop-label">Border Clr</span>
              <input
                type="color"
                className="color-swatch"
                value={layer.borderColor || '#6366f1'}
                onChange={(e) => onUpdateLayer(layer.id, { borderColor: e.target.value })}
              />
            </div>
          </div>

          <div className="prop-row">
            <span className="prop-label">Radius</span>
            <input
              type="number"
              className="prop-input-sm"
              value={layer.borderRadius || 6}
              onChange={(e) => onUpdateLayer(layer.id, { borderRadius: Number(e.target.value) })}
            />
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Quick Style:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn-secondary"
                style={{ fontSize: 10, padding: '3px 8px' }}
                onClick={() => onUpdateLayer(layer.id, { bgColor: '#6366f1', textColor: '#fff', borderRadius: 6, borderWidth: 0 })}
              >
                Solid Fill
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: 10, padding: '3px 8px' }}
                onClick={() => onUpdateLayer(layer.id, { bgColor: 'transparent', textColor: '#6366f1', borderRadius: 6, borderWidth: 1.5, borderColor: '#6366f1' })}
              >
                Outline Ghost
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: 10, padding: '3px 8px' }}
                onClick={() => onUpdateLayer(layer.id, { bgColor: '#25D366', textColor: '#fff', borderRadius: 20, borderWidth: 0 })}
              >
                WhatsApp Pill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOCIAL ICONS CONTROLS */}
      {layer.type === 'socials' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Social Platforms & Style Packs</span>
          </div>

          {/* Style Packs */}
          <div className="prop-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            <span className="prop-label">Icon Style Pack</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {SOCIAL_STYLE_PACKS.map(pack => (
                <button
                  key={pack.id}
                  className={`tool-btn ${(layer.stylePack || 'default') === pack.id ? 'active' : ''}`}
                  style={{ width: 'auto', padding: '5px 6px', fontSize: 10.5, justifyContent: 'center', height: 'auto', textAlign: 'center' }}
                  onClick={() => onUpdateLayer(layer.id, { stylePack: pack.id })}
                  title={pack.desc}
                >
                  {pack.name}
                </button>
              ))}
              <button
                className={`tool-btn ${(layer.stylePack || 'default') === 'default' ? 'active' : ''}`}
                style={{ width: 'auto', padding: '5px 6px', fontSize: 10.5, justifyContent: 'center', height: 'auto', textAlign: 'center' }}
                onClick={() => onUpdateLayer(layer.id, { stylePack: 'default' })}
                title="Default simple unbordered icons"
              >
                Classic Simple
              </button>
            </div>
          </div>

          <div className="prop-row" style={{ marginTop: 6 }}>
            <span className="prop-label">Color Mode</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className={`tool-btn ${layer.colorMode === 'brand' ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}
                onClick={() => onUpdateLayer(layer.id, { colorMode: 'brand' })}
              >
                Official Brand
              </button>
              <button
                className={`tool-btn ${layer.colorMode === 'monochrome' ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', fontSize: 11 }}
                onClick={() => onUpdateLayer(layer.id, { colorMode: 'monochrome' })}
              >
                Mono
              </button>
            </div>
          </div>

          {layer.colorMode === 'monochrome' && (
            <div className="prop-row">
              <span className="prop-label">Mono Color</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="color"
                  className="prop-color"
                  value={layer.monoColor || '#475569'}
                  onChange={(e) => onUpdateLayer(layer.id, { monoColor: e.target.value })}
                />
                <input
                  type="text"
                  className="prop-input-sm"
                  style={{ width: 75 }}
                  value={layer.monoColor || '#475569'}
                  onChange={(e) => onUpdateLayer(layer.id, { monoColor: e.target.value })}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
            <div className="prop-row">
              <span className="prop-label">Size</span>
              <input
                type="number"
                className="prop-input-sm"
                value={layer.iconSize || 22}
                onChange={(e) => onUpdateLayer(layer.id, { iconSize: Number(e.target.value) })}
              />
            </div>
            <div className="prop-row">
              <span className="prop-label">Gap</span>
              <input
                type="number"
                className="prop-input-sm"
                value={layer.gap || 8}
                onChange={(e) => onUpdateLayer(layer.id, { gap: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Platform Toggles */}
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
              Supported Networks ({SOCIAL_PLATFORMS.length}):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {SOCIAL_PLATFORMS.map((sp) => {
                const currentPlatform = (layer.platforms || []).find(p => p.id === sp.id);
                const isEnabled = currentPlatform ? !!currentPlatform.enabled : false;
                const currentUrl = currentPlatform ? (currentPlatform.url ?? '') : '';

                return (
                  <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        const currentList = [...(layer.platforms || [])];
                        const existingIdx = currentList.findIndex(p => p.id === sp.id);
                        if (existingIdx >= 0) {
                          currentList[existingIdx] = { ...currentList[existingIdx], enabled: e.target.checked };
                        } else {
                          currentList.push({ id: sp.id, enabled: e.target.checked, url: sp.defaultUrl || '' });
                        }
                        onUpdateLayer(layer.id, { platforms: currentList });
                      }}
                    />
                    <span style={{ fontSize: 11, width: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sp.name}>
                      {sp.name}
                    </span>
                    <input
                      type="text"
                      className="prop-input-full"
                      style={{ fontSize: 11, padding: '3px 6px' }}
                      value={currentUrl}
                      placeholder={sp.defaultUrl || "URL or {Website}"}
                      onChange={(e) => {
                        const currentList = [...(layer.platforms || [])];
                        const existingIdx = currentList.findIndex(p => p.id === sp.id);
                        if (existingIdx >= 0) {
                          currentList[existingIdx] = { ...currentList[existingIdx], url: e.target.value };
                        } else {
                          currentList.push({ id: sp.id, enabled: true, url: e.target.value });
                        }
                        onUpdateLayer(layer.id, { platforms: currentList });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SHAPE CONTROLS */}
      {layer.type === 'shape' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Card / Shape Styling</span>
          </div>

          <div className="prop-row">
            <span className="prop-label">Fill Color</span>
            <input
              type="color"
              className="color-swatch"
              value={layer.fillColor || '#ffffff'}
              onChange={(e) => onUpdateLayer(layer.id, { fillColor: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div className="prop-row">
              <span className="prop-label">Border</span>
              <input
                type="number"
                className="prop-input-sm"
                value={layer.borderWidth || 0}
                onChange={(e) => onUpdateLayer(layer.id, { borderWidth: Number(e.target.value) })}
              />
            </div>
            <div className="prop-row">
              <span className="prop-label">Radius</span>
              <input
                type="number"
                className="prop-input-sm"
                value={layer.borderRadius || 0}
                onChange={(e) => onUpdateLayer(layer.id, { borderRadius: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}

      {/* VECTOR DRAWING CONTROLS */}
      {layer.type === 'drawing' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Vector Pen Styling</span>
            <PenTool size={13} />
          </div>

          <div className="prop-row">
            <span className="prop-label">Stroke Color</span>
            <div className="prop-color-picker">
              <input
                type="color"
                className="color-swatch"
                value={layer.strokeColor || '#6366f1'}
                onChange={(e) => onUpdateLayer(layer.id, { strokeColor: e.target.value })}
              />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{layer.strokeColor || '#6366f1'}</span>
            </div>
          </div>

          {/* Quick Brand Colors */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#0f172a', '#ffffff'].map(c => (
              <button
                key={c}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: c,
                  border: layer.strokeColor === c ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
                onClick={() => onUpdateLayer(layer.id, { strokeColor: c })}
                title={c}
              />
            ))}
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">Stroke Width ({layer.strokeWidth || 3}px)</span>
            <input
              type="range"
              min="1"
              max="16"
              value={layer.strokeWidth || 3}
              onChange={(e) => onUpdateLayer(layer.id, { strokeWidth: Number(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
            />
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">Fill</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                className={`btn-secondary ${layer.fillColor === 'none' || !layer.fillColor ? 'active' : ''}`}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => onUpdateLayer(layer.id, { fillColor: 'none' })}
              >
                None
              </button>
              <input
                type="color"
                className="color-swatch"
                value={layer.fillColor && layer.fillColor !== 'none' ? layer.fillColor : '#6366f1'}
                onChange={(e) => onUpdateLayer(layer.id, { fillColor: e.target.value })}
                title="Fill Color"
              />
            </div>
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">Opacity ({Math.round((layer.opacity !== undefined ? layer.opacity : 1) * 100)}%)</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={layer.opacity !== undefined ? layer.opacity : 1}
              onChange={(e) => onUpdateLayer(layer.id, { opacity: Number(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* QR CODE CONTROLS */}
      {layer.type === 'qrcode' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>QR Code Settings</span>
            <QrCode size={13} />
          </div>

          <div className="prop-row">
            <span className="prop-label">Link / Data</span>
            <input
              type="text"
              className="prop-input-full"
              value={layer.qrText || ''}
              onChange={(e) => onUpdateLayer(layer.id, { qrText: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">Caption Label</span>
            <input
              type="text"
              className="prop-input-full"
              value={layer.label || ''}
              onChange={(e) => onUpdateLayer(layer.id, { label: e.target.value })}
              placeholder="Scan to connect"
            />
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">QR Color</span>
            <div className="prop-color-picker">
              <input
                type="color"
                className="color-swatch"
                value={layer.fgColor || '#0f172a'}
                onChange={(e) => onUpdateLayer(layer.id, { fgColor: e.target.value })}
              />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{layer.fgColor || '#0f172a'}</span>
            </div>
          </div>
        </div>
      )}

      {/* STATUS PILL CONTROLS */}
      {layer.type === 'status_pill' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Status Pill Settings</span>
            <Activity size={13} />
          </div>

          <div className="prop-row">
            <span className="prop-label">Status Text</span>
            <input
              type="text"
              className="prop-input-full"
              value={layer.statusText || ''}
              onChange={(e) => onUpdateLayer(layer.id, { statusText: e.target.value })}
            />
          </div>

          {/* Quick Status Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quick Presets:</span>
            {STATUS_PRESETS.map((sp, idx) => (
              <button
                key={idx}
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 8px', justifyContent: 'flex-start' }}
                onClick={() => onUpdateLayer(layer.id, {
                  statusText: sp.label,
                  dotColor: sp.dotColor,
                  pillColor: sp.color,
                  pillBg: sp.bgColor,
                  pillBorder: sp.borderColor
                })}
              >
                {sp.label}
              </button>
            ))}
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">Dot Color</span>
            <input
              type="color"
              className="color-swatch"
              value={layer.dotColor || '#10b981'}
              onChange={(e) => onUpdateLayer(layer.id, { dotColor: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* STAR RATING CONTROLS */}
      {layer.type === 'rating' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Rating Widget</span>
            <Star size={13} />
          </div>

          <div className="prop-row">
            <span className="prop-label">Review Text</span>
            <input
              type="text"
              className="prop-input-full"
              value={layer.ratingText || ''}
              onChange={(e) => onUpdateLayer(layer.id, { ratingText: e.target.value })}
            />
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">Star Color</span>
            <input
              type="color"
              className="color-swatch"
              value={layer.starColor || '#f59e0b'}
              onChange={(e) => onUpdateLayer(layer.id, { starColor: e.target.value })}
            />
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">Stars Count</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`btn-secondary ${(layer.starCount || 5) === n ? 'active' : ''}`}
                  style={{ padding: '3px 10px', fontSize: 11 }}
                  onClick={() => onUpdateLayer(layer.id, { starCount: n })}
                >
                  {n} Stars
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIGNATURE SCRIPT CONTROLS */}
      {layer.type === 'signature_script' && (
        <div className="prop-group">
          <div className="prop-group-title">
            <span>Signature Cursive</span>
            <Feather size={13} />
          </div>

          <div className="prop-row">
            <span className="prop-label">Ink Color</span>
            <div className="prop-color-picker">
              <input
                type="color"
                className="color-swatch"
                value={layer.strokeColor || '#1e293b'}
                onChange={(e) => onUpdateLayer(layer.id, { strokeColor: e.target.value })}
              />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{layer.strokeColor || '#1e293b'}</span>
            </div>
          </div>

          {/* Handwriting Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cursive Calligraphy Style:</span>
            {SIGNATURE_STYLES.map(style => (
              <button
                key={style.id}
                className={`btn-secondary ${layer.svgPath === style.svgPath ? 'active' : ''}`}
                style={{ justifyContent: 'space-between', padding: '6px 10px' }}
                onClick={() => onUpdateLayer(layer.id, { svgPath: style.svgPath, name: `${style.name}` })}
              >
                <span>{style.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Apply</span>
              </button>
            ))}
          </div>

          <div className="prop-row" style={{ marginTop: 8 }}>
            <span className="prop-label">Pen Ink Thickness ({layer.strokeWidth || 2}px)</span>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={layer.strokeWidth || 2}
              onChange={(e) => onUpdateLayer(layer.id, { strokeWidth: Number(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
