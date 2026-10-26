import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool, Check, X, RotateCcw,
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Trash2, Copy, Sparkles
} from 'lucide-react';
import { interpolateVariables } from '../utils/compiler';
import { SOCIAL_PLATFORMS } from '../utils/constants';

// Convert Bezier Anchors to exact SVG Cubic/Quadratic Path String
function bezierAnchorsToSvgPath(anchors, isClosed, offsetX = 0, offsetY = 0) {
  if (!anchors || anchors.length === 0) return '';
  let d = `M ${(anchors[0].x - offsetX).toFixed(1)} ${(anchors[0].y - offsetY).toFixed(1)}`;

  for (let i = 1; i < anchors.length; i++) {
    const prev = anchors[i - 1];
    const curr = anchors[i];

    if (prev.cpOut && curr.cpIn) {
      d += ` C ${(prev.cpOut.x - offsetX).toFixed(1)} ${(prev.cpOut.y - offsetY).toFixed(1)}, ${(curr.cpIn.x - offsetX).toFixed(1)} ${(curr.cpIn.y - offsetY).toFixed(1)}, ${(curr.x - offsetX).toFixed(1)} ${(curr.y - offsetY).toFixed(1)}`;
    } else if (prev.cpOut) {
      d += ` C ${(prev.cpOut.x - offsetX).toFixed(1)} ${(prev.cpOut.y - offsetY).toFixed(1)}, ${(curr.x - offsetX).toFixed(1)} ${(curr.y - offsetY).toFixed(1)}, ${(curr.x - offsetX).toFixed(1)} ${(curr.y - offsetY).toFixed(1)}`;
    } else if (curr.cpIn) {
      d += ` C ${(prev.x - offsetX).toFixed(1)} ${(prev.y - offsetY).toFixed(1)}, ${(curr.cpIn.x - offsetX).toFixed(1)} ${(curr.cpIn.y - offsetY).toFixed(1)}, ${(curr.x - offsetX).toFixed(1)} ${(curr.y - offsetY).toFixed(1)}`;
    } else {
      d += ` L ${(curr.x - offsetX).toFixed(1)} ${(curr.y - offsetY).toFixed(1)}`;
    }
  }

  if (isClosed && anchors.length >= 2) {
    const last = anchors[anchors.length - 1];
    const first = anchors[0];
    if (last.cpOut && first.cpIn) {
      d += ` C ${(last.cpOut.x - offsetX).toFixed(1)} ${(last.cpOut.y - offsetY).toFixed(1)}, ${(first.cpIn.x - offsetX).toFixed(1)} ${(first.cpIn.y - offsetY).toFixed(1)}, ${(first.x - offsetX).toFixed(1)} ${(first.y - offsetY).toFixed(1)} Z`;
    } else {
      d += ` Z`;
    }
  }

  return d;
}

export function CanvasWorkspace({
  canvasConfig,
  layers,
  selectedLayerIds = [],
  setSelectedLayerIds,
  onUpdateLayer,
  onUpdateMultipleLayers,
  onDeleteLayer,
  onDuplicateLayer,
  onAlignSelected,
  onDeleteSelected,
  zoom,
  darkModePreview,
  mobilePreview,
  variables,
  activeTool = 'select',
  setActiveTool,
  onAddDrawingLayer
}) {
  const containerRef = useRef(null);
  const artboardRef = useRef(null);

  // Dragging & Resizing State
  const [dragging, setDragging] = useState(null); // { id, startX, startY, initPositions: { [id]: { x, y } } }
  const [resizing, setResizing] = useState(null); // { id, handle, startX, startY, initX, initY, initW, initH }
  const [activeGuides, setActiveGuides] = useState([]);
  const [editingTextId, setEditingTextId] = useState(null);

  // Marquee Drag-Selection Box
  const [marquee, setMarquee] = useState(null); // { startX, startY, currentX, currentY }

  // Photoshop Bezier Pen Tool State
  const [penAnchors, setPenAnchors] = useState([]); // [{ x, y, cpIn: null | {x,y}, cpOut: null | {x,y} }]
  const [penDragging, setPenDragging] = useState(null); // { index, anchorX, anchorY }
  const [penCursorPos, setPenCursorPos] = useState(null); // { x, y }
  const [isHoveringFirstAnchor, setIsHoveringFirstAnchor] = useState(false);

  const { width = 540, height = 180 } = canvasConfig;
  const primarySelectedId = selectedLayerIds[selectedLayerIds.length - 1] || null;

  // Finalize Photoshop Bezier Path
  const finalizePenPath = (closeIt = false) => {
    if (penAnchors.length < 2) {
      setPenAnchors([]);
      setPenDragging(null);
      return;
    }

    const allX = [];
    const allY = [];
    penAnchors.forEach(a => {
      allX.push(a.x);
      allY.push(a.y);
      if (a.cpIn) { allX.push(a.cpIn.x); allY.push(a.cpIn.y); }
      if (a.cpOut) { allX.push(a.cpOut.x); allY.push(a.cpOut.y); }
    });

    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const pad = 6;
    const strokeW = Math.max(20, Math.round(maxX - minX + pad * 2));
    const strokeH = Math.max(16, Math.round(maxY - minY + pad * 2));
    const layerX = Math.round(minX - pad);
    const layerY = Math.round(minY - pad);

    const pathData = bezierAnchorsToSvgPath(penAnchors, closeIt, layerX, layerY);

    const count = layers.filter(l => l.type === 'drawing').length + 1;
    const newLayer = {
      id: `vector_${Date.now()}`,
      name: `Bezier Vector ${count}`,
      type: 'drawing',
      x: layerX,
      y: layerY,
      width: strokeW,
      height: strokeH,
      pathData,
      strokeColor: '#6366f1',
      strokeWidth: 2.5,
      fillColor: closeIt ? 'rgba(99, 102, 241, 0.2)' : 'none',
      opacity: 1,
      isClosed: closeIt,
      locked: false,
      visible: true
    };

    if (onAddDrawingLayer) {
      onAddDrawingLayer(newLayer);
    }

    setPenAnchors([]);
    setPenDragging(null);
    setPenCursorPos(null);
  };

  // Canvas Mouse Down: handles Marquee Selection & Pen Anchor Drops
  const handleCanvasMouseDown = (e) => {
    if (editingTextId) return;

    if (!artboardRef.current) return;
    const rect = artboardRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    // PHOTOSHOP PEN TOOL
    if (activeTool === 'pen') {
      e.preventDefault();
      e.stopPropagation();

      // Check if clicking near start anchor to close
      if (penAnchors.length >= 2) {
        const first = penAnchors[0];
        const dist = Math.hypot(x - first.x, y - first.y);
        if (dist <= 14) {
          finalizePenPath(true);
          return;
        }
      }

      // Add new anchor point
      const newIndex = penAnchors.length;
      const newAnchor = { x, y, cpIn: null, cpOut: null };
      setPenAnchors(prev => [...prev, newAnchor]);
      // Start dragging handle immediately for smooth curve tangent
      setPenDragging({ index: newIndex, anchorX: x, anchorY: y });
      return;
    }

    // SELECT TOOL: Clicking empty artboard starts marquee selection or clears selection
    if (e.target === e.currentTarget || e.target.classList.contains('canvas-viewport') || e.target.classList.contains('artboard')) {
      if (!e.shiftKey) {
        setSelectedLayerIds([]);
      }
      setMarquee({ startX: x, startY: y, currentX: x, currentY: y });
    }
  };

  // Layer MouseDown: Handles Shift+Click Multi-Selection & Batch Dragging
  const handleLayerMouseDown = (e, layer) => {
    if (activeTool === 'pen') return; // Handled by pen tool
    if (e.target.classList.contains('resize-handle')) return;

    e.stopPropagation();

    let newSelected = [...selectedLayerIds];

    if (e.shiftKey) {
      // Toggle layer in multi-selection
      if (newSelected.includes(layer.id)) {
        newSelected = newSelected.filter(id => id !== layer.id);
      } else {
        newSelected.push(layer.id);
      }
    } else {
      // Single select if not already in selection
      if (!newSelected.includes(layer.id)) {
        newSelected = [layer.id];
      }
    }

    setSelectedLayerIds(newSelected);

    if (layer.locked) return;

    // Record initial positions of ALL selected layers for batch dragging
    const initPositions = {};
    layers.forEach(l => {
      if (newSelected.includes(l.id)) {
        initPositions[l.id] = { x: l.x, y: l.y };
      }
    });

    setDragging({
      id: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      initPositions
    });
  };

  // Resize MouseDown
  const handleResizeMouseDown = (e, handle, layer) => {
    if (layer.locked) return;
    e.stopPropagation();
    setResizing({
      id: layer.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initX: layer.x,
      initY: layer.y,
      initW: layer.width,
      initH: layer.height
    });
  };

  // Global MouseMove and MouseUp Window Listeners
  useEffect(() => {
    const handleWindowMouseMove = (e) => {
      if (!artboardRef.current) return;
      const rect = artboardRef.current.getBoundingClientRect();
      const currentCanvasX = Math.round((e.clientX - rect.left) / zoom);
      const currentCanvasY = Math.round((e.clientY - rect.top) / zoom);

      // 1. Photoshop Pen Tool Handle Dragging or Hover
      if (activeTool === 'pen') {
        setPenCursorPos({ x: currentCanvasX, y: currentCanvasY });

        // Hover test for first anchor
        if (penAnchors.length >= 2) {
          const first = penAnchors[0];
          const dist = Math.hypot(currentCanvasX - first.x, currentCanvasY - first.y);
          setIsHoveringFirstAnchor(dist <= 14);
        } else {
          setIsHoveringFirstAnchor(false);
        }

        if (penDragging !== null) {
          const { index, anchorX, anchorY } = penDragging;
          const dx = currentCanvasX - anchorX;
          const dy = currentCanvasY - anchorY;

          setPenAnchors(prev => {
            const next = [...prev];
            if (next[index]) {
              next[index] = {
                ...next[index],
                cpOut: { x: anchorX + dx, y: anchorY + dy },
                cpIn: { x: anchorX - dx, y: anchorY - dy }
              };
            }
            return next;
          });
        }
        return;
      }

      // 2. Marquee Selection Drag
      if (marquee) {
        const nextMarquee = { ...marquee, currentX: currentCanvasX, currentY: currentCanvasY };
        setMarquee(nextMarquee);

        // Test intersection with all visible non-locked layers
        const x1 = Math.min(nextMarquee.startX, nextMarquee.currentX);
        const x2 = Math.max(nextMarquee.startX, nextMarquee.currentX);
        const y1 = Math.min(nextMarquee.startY, nextMarquee.currentY);
        const y2 = Math.max(nextMarquee.startY, nextMarquee.currentY);

        const intersecting = layers.filter(l => {
          if (l.locked || l.visible === false) return false;
          const lRight = l.x + l.width;
          const lBottom = l.y + l.height;
          return !(l.x > x2 || lRight < x1 || l.y > y2 || lBottom < y1);
        }).map(l => l.id);

        setSelectedLayerIds(intersecting);
        return;
      }

      // 3. Batch Dragging Selected Elements
      if (dragging) {
        const dx = Math.round((e.clientX - dragging.startX) / zoom);
        const dy = Math.round((e.clientY - dragging.startY) / zoom);

        const updates = {};
        Object.entries(dragging.initPositions).forEach(([id, initPos]) => {
          updates[id] = {
            x: initPos.x + dx,
            y: initPos.y + dy
          };
        });

        if (onUpdateMultipleLayers) {
          onUpdateMultipleLayers(updates, false);
        } else {
          Object.entries(updates).forEach(([id, up]) => onUpdateLayer(id, up, false));
        }
        return;
      }

      // 4. Resizing Element
      if (resizing) {
        const dx = (e.clientX - resizing.startX) / zoom;
        const dy = (e.clientY - resizing.startY) / zoom;
        const { handle, initX, initY, initW, initH } = resizing;

        let newX = initX;
        let newY = initY;
        let newW = initW;
        let newH = initH;

        if (handle.includes('e')) newW = Math.max(15, Math.round(initW + dx));
        if (handle.includes('s')) newH = Math.max(8, Math.round(initH + dy));
        if (handle.includes('w')) {
          const proposedW = Math.max(15, Math.round(initW - dx));
          newX = Math.round(initX + (initW - proposedW));
          newW = proposedW;
        }
        if (handle.includes('n')) {
          const proposedH = Math.max(8, Math.round(initH - dy));
          newY = Math.round(initY + (initH - proposedH));
          newH = proposedH;
        }

        onUpdateLayer(resizing.id, { x: newX, y: newY, width: newW, height: newH }, false);
      }
    };

    const handleWindowMouseUp = () => {
      if (penDragging) {
        setPenDragging(null);
      }
      if (marquee) {
        setMarquee(null);
      }
      if (dragging) {
        // Commit drag to history
        Object.keys(dragging.initPositions).forEach(id => onUpdateLayer(id, {}, true));
        setDragging(null);
        setActiveGuides([]);
      }
      if (resizing) {
        onUpdateLayer(resizing.id, {}, true);
        setResizing(null);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [activeTool, penAnchors, penDragging, marquee, dragging, resizing, zoom, layers, selectedLayerIds, onUpdateLayer, onUpdateMultipleLayers, setSelectedLayerIds]);

  // Render individual layer graphics
  const renderLayerGraphic = (layer) => {
    switch (layer.type) {
      case 'text': {
        const displayText = interpolateVariables(layer.text, variables);
        const isEditing = editingTextId === layer.id;

        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              fontFamily: layer.fontFamily || 'Arial, sans-serif',
              fontSize: layer.fontSize || 14,
              fontWeight: layer.fontWeight || '400',
              fontStyle: layer.fontStyle || 'normal',
              textDecoration: layer.textDecoration || 'none',
              textTransform: layer.textTransform || 'none',
              color: darkModePreview ? (layer.color === '#0f172a' ? '#f8fafc' : layer.color) : layer.color,
              lineHeight: layer.lineHeight || 1.3,
              textAlign: layer.textAlign || 'left',
              letterSpacing: layer.letterSpacing ? `${layer.letterSpacing}px` : 'normal',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'hidden',
              pointerEvents: isEditing ? 'auto' : 'none'
            }}
          >
            {isEditing ? (
              <textarea
                autoFocus
                value={layer.text}
                onChange={(e) => onUpdateLayer(layer.id, { text: e.target.value })}
                onBlur={() => setEditingTextId(null)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid var(--accent-cyan)',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  resize: 'none',
                  padding: 2,
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  pointerEvents: 'auto'
                }}
              />
            ) : (
              displayText
            )}
          </div>
        );
      }

      case 'image': {
        const imgUrl = interpolateVariables(layer.url, variables);
        return (
          <img
            src={imgUrl}
            alt={layer.alt || 'Avatar'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: layer.borderRadius || 0,
              border: `${layer.borderWidth || 0}px solid ${layer.borderColor || 'transparent'}`,
              display: 'block',
              pointerEvents: 'none'
            }}
          />
        );
      }

      case 'divider': {
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: layer.color || '#e2e8f0',
              borderStyle: layer.style || 'solid',
              pointerEvents: 'none'
            }}
          />
        );
      }

      case 'button': {
        const btnText = interpolateVariables(layer.text, variables);
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: layer.bgColor || '#6366f1',
              color: layer.textColor || '#ffffff',
              borderRadius: layer.borderRadius || 6,
              fontSize: layer.fontSize || 12,
              fontWeight: layer.fontWeight || '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              letterSpacing: 0.3,
              pointerEvents: 'none'
            }}
          >
            {btnText}
          </div>
        );
      }

      case 'socials': {
        const platforms = layer.platforms || [];
        const iconSize = layer.iconSize || 22;
        const gap = layer.gap || 8;
        const isMono = layer.colorMode === 'monochrome';
        const monoColor = layer.monoColor || '#475569';
        const stylePack = layer.stylePack || 'default';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: `${gap}px`, height: '100%', pointerEvents: 'none' }}>
            {platforms.filter(p => p.enabled).map(p => {
              const config = SOCIAL_PLATFORMS.find(sp => sp.id === p.id) || { name: p.id, color: '#4F46E5', iconSvg: '' };
              const baseColor = isMono ? monoColor : config.color;

              let badgeStyle = {
                width: iconSize,
                height: iconSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              };
              let svgColor = baseColor;
              let svgSize = iconSize;

              if (stylePack === 'outline') {
                const pad = Math.max(3, Math.round(iconSize * 0.2));
                badgeStyle = {
                  ...badgeStyle,
                  width: iconSize + pad * 2,
                  height: iconSize + pad * 2,
                  border: `1.2px solid ${baseColor}55`,
                  borderRadius: 6,
                  padding: pad
                };
                svgColor = baseColor;
              } else if (stylePack === 'squircle_soft') {
                const pad = Math.max(3, Math.round(iconSize * 0.2));
                badgeStyle = {
                  ...badgeStyle,
                  width: iconSize + pad * 2,
                  height: iconSize + pad * 2,
                  backgroundColor: `${baseColor}18`,
                  border: `1px solid ${baseColor}30`,
                  borderRadius: 8,
                  padding: pad
                };
                svgColor = baseColor;
              } else if (stylePack === 'circle_solid') {
                const pad = Math.max(4, Math.round(iconSize * 0.22));
                badgeStyle = {
                  ...badgeStyle,
                  width: iconSize + pad * 2,
                  height: iconSize + pad * 2,
                  backgroundColor: isMono ? monoColor : '#0f172a',
                  borderRadius: '50%',
                  padding: pad
                };
                svgColor = '#ffffff';
              } else if (stylePack === 'pure_minimal') {
                svgColor = isMono ? monoColor : '#475569';
              } else if (stylePack === 'neo_brutalist') {
                const pad = Math.max(3, Math.round(iconSize * 0.18));
                badgeStyle = {
                  ...badgeStyle,
                  width: iconSize + pad * 2,
                  height: iconSize + pad * 2,
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #000000',
                  boxShadow: '1.5px 1.5px 0px #000000',
                  borderRadius: 3,
                  padding: pad
                };
                svgColor = '#000000';
              } else if (stylePack === 'gradient_glow') {
                const pad = Math.max(4, Math.round(iconSize * 0.22));
                badgeStyle = {
                  ...badgeStyle,
                  width: iconSize + pad * 2,
                  height: iconSize + pad * 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  borderRadius: 8,
                  padding: pad
                };
                svgColor = '#ffffff';
              }

              return (
                <div
                  key={p.id}
                  style={badgeStyle}
                  title={config.name}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={svgSize}
                    height={svgSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={svgColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: config.iconSvg }}
                  />
                </div>
              );
            })}
          </div>
        );
      }

      case 'shape': {
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: darkModePreview ? (layer.fillColor === '#ffffff' ? '#181b22' : layer.fillColor) : (layer.fillColor || '#ffffff'),
              border: `${layer.borderWidth || 0}px solid ${layer.borderColor || 'transparent'}`,
              borderRadius: layer.borderRadius || 0,
              pointerEvents: 'none'
            }}
          />
        );
      }

      case 'drawing': {
        const strokeColor = layer.strokeColor || '#6366f1';
        const strokeWidth = layer.strokeWidth || 2.5;
        const fillColor = layer.fillColor || 'none';
        const w = Math.max(10, layer.width || 60);
        const h = Math.max(10, layer.height || 30);
        const pathData = layer.pathData || '';

        return (
          <svg
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            height="100%"
            style={{ display: 'block', overflow: 'visible', pointerEvents: 'none' }}
          >
            <path
              d={pathData}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }

      case 'qrcode': {
        const qrData = encodeURIComponent(interpolateVariables(layer.qrText || 'https://vortexdynamics.io', variables));
        const fg = (layer.fgColor || '#0f172a').replace('#', '');
        const bg = (layer.bgColor || '#ffffff').replace('#', '');
        const size = Math.max(40, layer.width || 60);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${qrData}&color=${fg}&bgcolor=${bg}&margin=1`;
        const label = layer.label ? interpolateVariables(layer.label, variables) : '';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', pointerEvents: 'none' }}>
            <img src={qrUrl} alt="QR Code" style={{ width: size, height: size, borderRadius: 4, display: 'block' }} />
            {label && <span style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, textAlign: 'center' }}>{label}</span>}
          </div>
        );
      }

      case 'status_pill': {
        const text = interpolateVariables(layer.statusText || '🟢 Available for Projects', variables);
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: layer.pillBg || '#ecfdf5',
              color: layer.pillColor || '#065f46',
              border: `1px solid ${layer.pillBorder || '#a7f3d0'}`,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              fontSize: 11,
              fontWeight: 600,
              gap: 6,
              pointerEvents: 'none',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: layer.dotColor || '#10b981', display: 'inline-block' }} />
            <span>{text}</span>
          </div>
        );
      }

      case 'rating': {
        const text = interpolateVariables(layer.ratingText || '4.9/5 from 400+ reviews', variables);
        const starColor = layer.starColor || '#f59e0b';
        const stars = '★'.repeat(layer.starCount || 5);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', height: '100%', pointerEvents: 'none', fontSize: 11 }}>
            <span style={{ color: starColor, fontSize: 13, letterSpacing: 1 }}>{stars}</span>
            <span style={{ color: layer.textColor || 'var(--text-main)', fontWeight: 600 }}>{text}</span>
          </div>
        );
      }

      case 'signature_script': {
        const strokeColor = layer.strokeColor || '#1e293b';
        const strokeWidth = layer.strokeWidth || 2;
        const svgPath = layer.svgPath || 'M 10,35 Q 25,5 40,25 T 70,20 Q 90,35 110,15 T 140,25 Q 160,10 180,30 L 210,32';

        return (
          <svg viewBox="0 0 220 50" width="100%" height="100%" style={{ display: 'block', overflow: 'visible', pointerEvents: 'none' }}>
            <path d={svgPath} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      }

      default:
        return null;
    }
  };

  const renderArtboardSurface = () => (
    <div
      ref={artboardRef}
      className={`artboard ${darkModePreview ? 'dark-mode-preview' : ''} ${activeTool === 'pen' ? 'pen-mode' : ''}`}
      style={{
        width,
        height,
        backgroundColor: darkModePreview ? '#121418' : (canvasConfig.backgroundColor || '#ffffff')
      }}
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={() => {
        if (activeTool === 'pen' && penAnchors.length >= 2) {
          finalizePenPath(false);
        }
      }}
    >
      {/* PHOTOSHOP BEZIER PEN OVERLAY */}
      {activeTool === 'pen' && (
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 998,
            overflow: 'visible'
          }}
        >
          {/* Committed Path Segments */}
          {penAnchors.length >= 1 && (
            <path
              d={bezierAnchorsToSvgPath(penAnchors, false)}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray={penAnchors.length < 2 ? '4 2' : 'none'}
            />
          )}

          {/* Rubber-band preview to current mouse cursor */}
          {penAnchors.length >= 1 && penCursorPos && (
            <line
              x1={penAnchors[penAnchors.length - 1].x}
              y1={penAnchors[penAnchors.length - 1].y}
              x2={penCursorPos.x}
              y2={penCursorPos.y}
              stroke="rgba(99, 102, 241, 0.6)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}

          {/* Tangent Direction Handles (Lines + Circular Handles) */}
          {penAnchors.map((anchor, idx) => (
            <g key={`handle-${idx}`}>
              {anchor.cpOut && (
                <>
                  <line x1={anchor.x} y1={anchor.y} x2={anchor.cpOut.x} y2={anchor.cpOut.y} stroke="#38bdf8" strokeWidth={1} />
                  <circle cx={anchor.cpOut.x} cy={anchor.cpOut.y} r={3} fill="#38bdf8" stroke="#0f172a" strokeWidth={1} />
                </>
              )}
              {anchor.cpIn && (
                <>
                  <line x1={anchor.x} y1={anchor.y} x2={anchor.cpIn.x} y2={anchor.cpIn.y} stroke="#38bdf8" strokeWidth={1} />
                  <circle cx={anchor.cpIn.x} cy={anchor.cpIn.y} r={3} fill="#38bdf8" stroke="#0f172a" strokeWidth={1} />
                </>
              )}
            </g>
          ))}

          {/* Square Anchor Points (Photoshop Style) */}
          {penAnchors.map((anchor, idx) => (
            <g key={`anchor-${idx}`}>
              <rect
                x={anchor.x - 3.5}
                y={anchor.y - 3.5}
                width={7}
                height={7}
                fill={idx === penAnchors.length - 1 ? '#6366f1' : '#ffffff'}
                stroke="#4338ca"
                strokeWidth={1.5}
              />
              {/* Closing indicator circle on start point */}
              {idx === 0 && isHoveringFirstAnchor && (
                <circle cx={anchor.x} cy={anchor.y} r={8} fill="none" stroke="#22c55e" strokeWidth={2} />
              )}
            </g>
          ))}
        </svg>
      )}

      {/* MARQUEE DRAG-SELECTION BOX */}
      {marquee && (
        <div
          className="marquee-box"
          style={{
            position: 'absolute',
            left: Math.min(marquee.startX, marquee.currentX),
            top: Math.min(marquee.startY, marquee.currentY),
            width: Math.abs(marquee.currentX - marquee.startX),
            height: Math.abs(marquee.currentY - marquee.startY),
            border: '1px solid var(--accent-cyan)',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            pointerEvents: 'none',
            zIndex: 999
          }}
        />
      )}

      {/* Render Elements in Layer Stack */}
      {layers
        .filter(l => l && l.id && l.visible !== false)
        .map((layer, index) => {
          const isSelected = selectedLayerIds ? selectedLayerIds.includes(layer.id) : false;
          const isPrimary = layer.id === primarySelectedId;
          const isDraggingThis = (dragState?.isDragging && (dragState.layerId === layer.id || selectedLayerIds?.includes(layer.id)));
          const isResizingThis = (resizeState?.isResizing && resizeState.layerId === layer.id);

          // Authentic Layer Stacking Order:
          // Visual stacking matches layers array position (index + 2) exactly.
          // Only active mouse drag gestures temporarily elevate the interacting layer.
          const zIndex = (isDraggingThis || isResizingThis) ? 990 : (index + 2);

          return (
            <div
              key={layer.id}
              className={`canvas-element ${isSelected ? 'selected' : ''} ${layer.locked ? 'locked' : ''}`}
              style={{
                left: layer.x,
                top: layer.y,
                width: layer.width,
                height: layer.height,
                opacity: layer.opacity !== undefined ? layer.opacity : 1,
                zIndex,
                cursor: activeTool === 'pen' ? 'crosshair' : (layer.locked ? 'default' : 'move')
              }}
              onMouseDown={(e) => handleLayerMouseDown(e, layer)}
              onClick={(e) => {
                if (activeTool !== 'pen') {
                  e.stopPropagation();
                  if (e.shiftKey) {
                    if (selectedLayerIds.includes(layer.id)) {
                      setSelectedLayerIds(selectedLayerIds.filter(id => id !== layer.id));
                    } else {
                      setSelectedLayerIds([...selectedLayerIds, layer.id]);
                    }
                  } else {
                    setSelectedLayerIds([layer.id]);
                  }
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setSelectedLayerIds([layer.id]);
                if (layer.type === 'text') {
                  setEditingTextId(layer.id);
                }
              }}
            >
              {renderLayerGraphic(layer)}

              {/* Resize Handles (rendered on selected active elements) */}
              {isSelected && !layer.locked && !mobilePreview && activeTool === 'select' && (
                <>
                  <div className="resize-handle handle-nw" onMouseDown={(e) => handleResizeMouseDown(e, 'nw', layer)} />
                  <div className="resize-handle handle-n"  onMouseDown={(e) => handleResizeMouseDown(e, 'n', layer)} />
                  <div className="resize-handle handle-ne" onMouseDown={(e) => handleResizeMouseDown(e, 'ne', layer)} />
                  <div className="resize-handle handle-e"  onMouseDown={(e) => handleResizeMouseDown(e, 'e', layer)} />
                  <div className="resize-handle handle-se" onMouseDown={(e) => handleResizeMouseDown(e, 'se', layer)} />
                  <div className="resize-handle handle-s"  onMouseDown={(e) => handleResizeMouseDown(e, 's', layer)} />
                  <div className="resize-handle handle-sw" onMouseDown={(e) => handleResizeMouseDown(e, 'sw', layer)} />
                  <div className="resize-handle handle-w"  onMouseDown={(e) => handleResizeMouseDown(e, 'w', layer)} />
                </>
              )}
            </div>
          );
        })}
    </div>
  );

  return (
    <div
      className="canvas-viewport"
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
    >
      {/* PHOTOSHOP BEZIER PEN TOOL FLOATING HUD */}
      {activeTool === 'pen' && (
        <div className="pen-mode-bar">
          <PenTool size={15} color="#38bdf8" />
          <span style={{ fontWeight: 600 }}>Photoshop Pen Tool</span>
          <span style={{ opacity: 0.7, fontSize: 11 }}>
            {penAnchors.length === 0
              ? 'Click to place anchor points. Drag to pull Bezier curves.'
              : `${penAnchors.length} anchor point${penAnchors.length > 1 ? 's' : ''} placed`}
          </span>

          {penAnchors.length >= 2 && (
            <>
              <button
                className="btn-pen-exit"
                onClick={() => finalizePenPath(false)}
                title="Finish Open Path (or press Enter)"
              >
                <Check size={12} />
                Finish Path
              </button>
              <button
                className="btn-pen-exit"
                style={{ background: 'var(--accent-indigo)' }}
                onClick={() => finalizePenPath(true)}
                title="Close & Fill Shape"
              >
                <Sparkles size={12} />
                Close Shape
              </button>
            </>
          )}

          <button
            className="btn-pen-cancel"
            onClick={() => {
              setPenAnchors([]);
              setActiveTool('select');
            }}
            title="Exit Pen Tool (Esc)"
          >
            <X size={12} />
            Exit
          </button>
        </div>
      )}

      {/* MULTI-SELECTION QUICK ALIGNMENT TOOLBAR */}
      {selectedLayerIds.length > 1 && activeTool === 'select' && (
        <div className="selection-quick-bar">
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', paddingRight: 6 }}>
            {selectedLayerIds.length} Layers Selected
          </span>

          <div className="quick-bar-divider" />

          {/* Alignment Tools */}
          <button className="tool-btn-sm" onClick={() => onAlignSelected && onAlignSelected('left')} title="Align Left">
            <AlignLeft size={13} />
          </button>
          <button className="tool-btn-sm" onClick={() => onAlignSelected && onAlignSelected('center')} title="Align Center">
            <AlignCenter size={13} />
          </button>
          <button className="tool-btn-sm" onClick={() => onAlignSelected && onAlignSelected('right')} title="Align Right">
            <AlignRight size={13} />
          </button>
          <button className="tool-btn-sm" onClick={() => onAlignSelected && onAlignSelected('top')} title="Align Top">
            <AlignStartVertical size={13} />
          </button>
          <button className="tool-btn-sm" onClick={() => onAlignSelected && onAlignSelected('middle')} title="Align Middle">
            <AlignCenterVertical size={13} />
          </button>
          <button className="tool-btn-sm" onClick={() => onAlignSelected && onAlignSelected('bottom')} title="Align Bottom">
            <AlignEndVertical size={13} />
          </button>

          <div className="quick-bar-divider" />

          <button className="tool-btn-sm text-danger" onClick={onDeleteSelected} title="Delete Selected (Backspace)">
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {mobilePreview ? (
        /* Mobile iPhone Screen Simulation Frame */
        <div
          style={{
            width: 385,
            background: darkModePreview ? '#090a0f' : '#f8fafc',
            border: '12px solid #242731',
            borderRadius: 44,
            boxShadow: '0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Notch & Status */}
          <div style={{ height: 28, background: '#14171f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontSize: 10, color: '#94a3b8' }}>
            <span style={{ fontWeight: 600 }}>9:41</span>
            <div style={{ width: 75, height: 10, background: '#090a0f', borderRadius: 99 }} />
            <span>100% 🔋</span>
          </div>

          {/* Email Client Header */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', background: darkModePreview ? '#121418' : '#ffffff', fontSize: 11 }}>
            <div style={{ fontWeight: 600, color: darkModePreview ? '#f8fafc' : '#0f172a' }}>Re: Project Delivery & Files</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 10 }}>From: {variables.FullName || 'You'}</div>
          </div>

          {/* Mock message body */}
          <div style={{ padding: '14px 14px 10px', fontSize: 11, color: darkModePreview ? '#94a3b8' : '#475569', lineHeight: 1.45 }}>
            Hi team,<br/>Here is the confirmed documentation. Please let me know if you need anything else!<br/><br/>
            Best regards,
          </div>

          {/* Scaled Artboard */}
          <div style={{ padding: '6px 12px 24px', overflowX: 'auto', background: darkModePreview ? '#121418' : '#ffffff' }}>
            <div style={{ transformOrigin: 'top left', transform: 'scale(0.66)', width, height }}>
              {renderArtboardSurface()}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Desktop Artboard */
        <div
          className="artboard-container"
          style={{
            transform: `scale(${zoom})`,
            width,
            height
          }}
        >
          {/* Canvas Dimension Badge */}
          <div className="artboard-badge">
            <span>{width} × {height} px</span>
            {darkModePreview && <span style={{ color: '#38bdf8' }}>• Dark Preview</span>}
          </div>

          {renderArtboardSurface()}
        </div>
      )}
    </div>
  );
}
