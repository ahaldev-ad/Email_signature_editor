import React, { useState } from 'react';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Copy,
  ArrowUp, ArrowDown, Type, Image as ImageIcon,
  Minus, RectangleHorizontal, Square, Share2, Layers, PenTool,
  QrCode, Activity, Star, Feather
} from 'lucide-react';

export function LayersPanel({
  layers,
  selectedLayerId,
  selectedLayerIds = [],
  setSelectedLayerId,
  setSelectedLayerIds,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onReorderLayers
}) {
  const [editingNameId, setEditingNameId] = useState(null);

  // Return icon for layer type
  const getLayerIcon = (type) => {
    switch (type) {
      case 'text': return <Type size={14} color="#38bdf8" />;
      case 'image': return <ImageIcon size={14} color="#ec4899" />;
      case 'drawing': return <PenTool size={14} color="#06b6d4" />;
      case 'qrcode': return <QrCode size={14} color="#f43f5e" />;
      case 'status_pill': return <Activity size={14} color="#10b981" />;
      case 'rating': return <Star size={14} color="#f59e0b" />;
      case 'signature_script': return <Feather size={14} color="#8b5cf6" />;
      case 'divider': return <Minus size={14} color="#a855f7" />;
      case 'button': return <RectangleHorizontal size={14} color="#10b981" />;
      case 'socials': return <Share2 size={14} color="#6366f1" />;
      case 'shape': return <Square size={14} color="#f59e0b" />;
      default: return <Layers size={14} />;
    }
  };

  // Move layer up in stack (so it renders on top)
  const handleMoveUp = (index, e) => {
    e.stopPropagation();
    if (index === layers.length - 1) return;
    const newLayers = [...layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[index + 1];
    newLayers[index + 1] = temp;
    onReorderLayers(newLayers);
  };

  // Move layer down in stack
  const handleMoveDown = (index, e) => {
    e.stopPropagation();
    if (index === 0) return;
    const newLayers = [...layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[index - 1];
    newLayers[index - 1] = temp;
    onReorderLayers(newLayers);
  };

  // Reverse list so top layers display at top of panel like Photoshop
  const reversedLayers = [...layers].map((layer, originalIdx) => ({ layer, originalIdx })).reverse();

  return (
    <div className="dock-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
          Layer Stack ({layers.length})
        </span>
        {selectedLayerIds.length > 1 && (
          <span style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {selectedLayerIds.length} Selected
          </span>
        )}
      </div>

      <div className="layers-list">
        {reversedLayers.map(({ layer, originalIdx }) => {
          const isSelected = selectedLayerIds.includes(layer.id) || layer.id === selectedLayerId;
          const isEditingName = editingNameId === layer.id;

          return (
            <div
              key={layer.id}
              className={`layer-item ${isSelected ? 'active' : ''}`}
              onClick={(e) => {
                if (e.shiftKey && setSelectedLayerIds) {
                  if (selectedLayerIds.includes(layer.id)) {
                    setSelectedLayerIds(selectedLayerIds.filter(id => id !== layer.id));
                  } else {
                    setSelectedLayerIds([...selectedLayerIds, layer.id]);
                  }
                } else {
                  setSelectedLayerId(layer.id);
                  if (setSelectedLayerIds) setSelectedLayerIds([layer.id]);
                }
              }}
            >
              {/* Left: Icon & Name */}
              <div className="layer-left">
                {getLayerIcon(layer.type)}

                {isEditingName ? (
                  <input
                    type="text"
                    autoFocus
                    value={layer.name || 'Layer'}
                    onChange={(e) => onUpdateLayer(layer.id, { name: e.target.value })}
                    onBlur={() => setEditingNameId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingNameId(null);
                    }}
                    style={{ fontSize: 12, padding: '1px 4px', width: 130 }}
                  />
                ) : (
                  <span
                    onDoubleClick={() => setEditingNameId(layer.id)}
                    title="Double-click to rename"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}
                  >
                    {layer.name || 'Untitled Layer'}
                  </span>
                )}
              </div>

              {/* Right: Actions (Visibility, Lock, Order, Duplicate, Delete) */}
              <div className="layer-actions">
                {/* Reorder Buttons */}
                <button
                  className="tool-btn"
                  style={{ width: 20, height: 20 }}
                  disabled={originalIdx === layers.length - 1}
                  onClick={(e) => handleMoveUp(originalIdx, e)}
                  title="Move Layer Up"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  className="tool-btn"
                  style={{ width: 20, height: 20 }}
                  disabled={originalIdx === 0}
                  onClick={(e) => handleMoveDown(originalIdx, e)}
                  title="Move Layer Down"
                >
                  <ArrowDown size={12} />
                </button>

                {/* Visibility Toggle */}
                <button
                  className="tool-btn"
                  style={{ width: 22, height: 22 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLayer(layer.id, { visible: layer.visible === false ? true : false });
                  }}
                  title={layer.visible === false ? "Show Layer" : "Hide Layer"}
                >
                  {layer.visible === false ? <EyeOff size={13} color="var(--text-dim)" /> : <Eye size={13} />}
                </button>

                {/* Lock Toggle */}
                <button
                  className="tool-btn"
                  style={{ width: 22, height: 22 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLayer(layer.id, { locked: !layer.locked });
                  }}
                  title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                >
                  {layer.locked ? <Lock size={13} color="#f59e0b" /> : <Unlock size={13} color="var(--text-dim)" />}
                </button>

                {/* Duplicate */}
                <button
                  className="tool-btn"
                  style={{ width: 22, height: 22 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateLayer(layer.id);
                  }}
                  title="Duplicate Layer"
                >
                  <Copy size={13} />
                </button>

                {/* Delete */}
                <button
                  className="tool-btn"
                  style={{ width: 22, height: 22 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(layer.id);
                  }}
                  title="Delete Layer"
                >
                  <Trash2 size={13} color="#f43f5e" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
