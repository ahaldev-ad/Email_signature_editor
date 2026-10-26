import React, { useState, useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { ToolPalette } from './components/ToolPalette';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { CanvasRulers } from './components/CanvasRulers';
import { InspectorPanel } from './components/InspectorPanel';
import { LayersPanel } from './components/LayersPanel';
import { TemplatesModal } from './components/TemplatesModal';
import { BatchTeamModal } from './components/BatchTeamModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { CodePreviewModal } from './components/CodePreviewModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import LogoAssetModal from './components/LogoAssetModal';
import {
  PREBUILT_TEMPLATES,
  DEFAULT_VARIABLES,
  CANVAS_PRESETS
} from './utils/constants';
import {
  compileSignatureToHtml,
  copySignatureToClipboard,
  downloadHtmlFile,
  downloadJsonProject
} from './utils/compiler';
import { Sliders, Layers as LayersIcon, PanelRightClose, PanelRightOpen } from 'lucide-react';

const STORAGE_KEY = 'sigstudio_saved_project_v1';
const LEGACY_STORAGE_KEY = 'signacraft_saved_project_v1';

export default function App() {
  const initialTemplate = PREBUILT_TEMPLATES[0];

  const [docName, setDocName] = useState('Executive Signature');
  const [canvasConfig, setCanvasConfig] = useState({
    width: initialTemplate.width,
    height: initialTemplate.height,
    preset: 'standard',
    backgroundColor: '#ffffff'
  });
  const [layers, setLayers] = useState(initialTemplate.layers);

  // Multi-Selection: array of layer IDs
  const [selectedLayerIds, setSelectedLayerIds] = useState([initialTemplate.layers[1]?.id || 'layer-name']);
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(1.0);
  const [darkModePreview, setDarkModePreview] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [uiTheme, setUiTheme] = useState('dark');
  const [variables, setVariables] = useState(DEFAULT_VARIABLES);

  // Dock tab ('inspector' | 'layers') & Mobile Dock Drawer Toggle
  const [dockTab, setDockTab] = useState('inspector');
  const [mobileDockOpen, setMobileDockOpen] = useState(false);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCodePreviewOpen, setIsCodePreviewOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isLogoAssetOpen, setIsLogoAssetOpen] = useState(false);

  // Toast notice
  const [toastMessage, setToastMessage] = useState('');

  // Undo / Redo history
  const [history, setHistory] = useState([{ canvasConfig, layers }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Derived selected layer (primary)
  const primarySelectedId = selectedLayerIds[selectedLayerIds.length - 1] || null;
  const selectedLayer = layers.find(l => l.id === primarySelectedId);
  const selectedLayers = layers.filter(l => selectedLayerIds.includes(l.id));

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme);
  }, [uiTheme]);

  // Load from localStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.canvasConfig && parsed.layers) {
          setDocName(parsed.docName || 'Saved Signature');
          setCanvasConfig(parsed.canvasConfig);
          const sanitized = parsed.layers.map(l => {
            const isBg = l.type === 'shape' && (l.width >= 400 || l.id.includes('bg'));
            return isBg ? { ...l, locked: true } : l;
          });
          setLayers(sanitized);
          if (sanitized[1]) setSelectedLayerIds([sanitized[1].id]);
          if (parsed.variables) setVariables(parsed.variables);
        }
      }
    } catch (e) {
      console.warn('Could not load from localStorage', e);
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    try {
      const payload = { docName, canvasConfig, layers, variables };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore quota
    }
  }, [docName, canvasConfig, layers, variables]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Push to Undo / Redo stack
  const pushHistory = (newCanvasConfig, newLayers) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push({ canvasConfig: newCanvasConfig, layers: newLayers });
    if (updated.length > 30) updated.shift();
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const step = history[targetIndex];
      setCanvasConfig(step.canvasConfig);
      setLayers(step.layers);
      setHistoryIndex(targetIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const step = history[targetIndex];
      setCanvasConfig(step.canvasConfig);
      setLayers(step.layers);
      setHistoryIndex(targetIndex);
    }
  };

  // Update single layer properties
  const handleUpdateLayer = (id, updates, recordHistory = true) => {
    setLayers(prev => {
      const updated = prev.map(l => (l.id === id ? { ...l, ...updates } : l));
      if (recordHistory) pushHistory(canvasConfig, updated);
      return updated;
    });
  };

  // Batch update multiple layers (for batch dragging)
  const handleUpdateMultipleLayers = (updatesMap, recordHistory = true) => {
    setLayers(prev => {
      const updated = prev.map(l => {
        if (updatesMap[l.id]) {
          return { ...l, ...updatesMap[l.id] };
        }
        return l;
      });
      if (recordHistory) pushHistory(canvasConfig, updated);
      return updated;
    });
  };

  // Delete single layer
  const handleDeleteLayer = (id) => {
    setLayers(prev => {
      const updated = prev.filter(l => l.id !== id);
      pushHistory(canvasConfig, updated);
      return updated;
    });
    setSelectedLayerIds(prev => prev.filter(item => item !== id));
    showToast('Layer deleted');
  };

  // Batch Delete all selected layers
  const handleDeleteSelected = () => {
    if (selectedLayerIds.length === 0) return;
    const count = selectedLayerIds.length;
    const updated = layers.filter(l => !selectedLayerIds.includes(l.id));
    setLayers(updated);
    setSelectedLayerIds([]);
    pushHistory(canvasConfig, updated);
    showToast(`Deleted ${count} layer${count > 1 ? 's' : ''}`);
  };

  // Batch Duplicate selected layers
  const handleDuplicateSelected = () => {
    if (selectedLayerIds.length === 0) return;
    const toDuplicate = layers.filter(l => selectedLayerIds.includes(l.id));
    const newOnes = toDuplicate.map(l => ({
      ...l,
      id: `${l.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${l.name || 'Layer'} Copy`,
      x: l.x + 15,
      y: l.y + 15
    }));

    const updated = [...layers, ...newOnes];
    setLayers(updated);
    setSelectedLayerIds(newOnes.map(l => l.id));
    pushHistory(canvasConfig, updated);
    showToast(`Duplicated ${newOnes.length} layer${newOnes.length > 1 ? 's' : ''}`);
  };

  // Single layer duplicate
  const handleDuplicateLayer = (id) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;

    const dup = {
      ...layer,
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${layer.name || 'Layer'} Copy`,
      x: layer.x + 15,
      y: layer.y + 15
    };

    const updated = [...layers, dup];
    setLayers(updated);
    setSelectedLayerIds([dup.id]);
    pushHistory(canvasConfig, updated);
    showToast('Layer duplicated');
  };

  // Batch Alignment Tools
  const handleAlignSelected = (type) => {
    if (selectedLayerIds.length < 2) return;
    const selected = layers.filter(l => selectedLayerIds.includes(l.id) && !l.locked);
    if (selected.length < 2) return;

    let updated = [...layers];
    if (type === 'left') {
      const minX = Math.min(...selected.map(l => l.x));
      updated = updated.map(l => selectedLayerIds.includes(l.id) && !l.locked ? { ...l, x: minX } : l);
    } else if (type === 'center') {
      const minX = Math.min(...selected.map(l => l.x));
      const maxX = Math.max(...selected.map(l => l.x + l.width));
      const center = (minX + maxX) / 2;
      updated = updated.map(l => selectedLayerIds.includes(l.id) && !l.locked ? { ...l, x: Math.round(center - l.width / 2) } : l);
    } else if (type === 'right') {
      const maxX = Math.max(...selected.map(l => l.x + l.width));
      updated = updated.map(l => selectedLayerIds.includes(l.id) && !l.locked ? { ...l, x: maxX - l.width } : l);
    } else if (type === 'top') {
      const minY = Math.min(...selected.map(l => l.y));
      updated = updated.map(l => selectedLayerIds.includes(l.id) && !l.locked ? { ...l, y: minY } : l);
    } else if (type === 'middle') {
      const minY = Math.min(...selected.map(l => l.y));
      const maxY = Math.max(...selected.map(l => l.y + l.height));
      const middle = (minY + maxY) / 2;
      updated = updated.map(l => selectedLayerIds.includes(l.id) && !l.locked ? { ...l, y: Math.round(middle - l.height / 2) } : l);
    } else if (type === 'bottom') {
      const maxY = Math.max(...selected.map(l => l.y + l.height));
      updated = updated.map(l => selectedLayerIds.includes(l.id) && !l.locked ? { ...l, y: maxY - l.height } : l);
    }

    setLayers(updated);
    pushHistory(canvasConfig, updated);
    showToast(`Aligned ${selected.length} layers`);
  };

  // Reorder layers
  const handleReorderLayers = (newLayers) => {
    setLayers(newLayers);
    pushHistory(canvasConfig, newLayers);
  };

  // Add new layer from tool palette
  const handleAddLayer = (toolType) => {
    const id = `layer_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    let newLayer = null;

    switch (toolType) {
      case 'text':
        newLayer = {
          id,
          name: 'Text Block',
          type: 'text',
          x: 140,
          y: 60,
          width: 280,
          height: 24,
          text: 'New Text Block',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 14,
          fontWeight: '400',
          color: '#1e293b',
          textAlign: 'left',
          linkUrl: '',
          locked: false,
          visible: true
        };
        break;

      case 'avatar':
        newLayer = {
          id,
          name: 'Photo Avatar',
          type: 'image',
          x: 20,
          y: 25,
          width: 80,
          height: 80,
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          borderRadius: 999,
          borderWidth: 2,
          borderColor: '#6366f1',
          alt: 'Photo',
          locked: false,
          visible: true
        };
        break;

      case 'status_pill':
        newLayer = {
          id,
          name: 'Availability Status Pill',
          type: 'status_pill',
          x: 140,
          y: 75,
          width: 175,
          height: 24,
          statusText: '🟢 Available for Projects',
          pillBg: '#ecfdf5',
          pillColor: '#065f46',
          pillBorder: '#a7f3d0',
          dotColor: '#10b981',
          locked: false,
          visible: true
        };
        break;

      case 'rating':
        newLayer = {
          id,
          name: '5-Star Review Rating',
          type: 'rating',
          x: 140,
          y: 95,
          width: 220,
          height: 22,
          ratingText: '4.9/5 from 400+ reviews',
          starColor: '#f59e0b',
          textColor: '#475569',
          starCount: 5,
          locked: false,
          visible: true
        };
        break;

      case 'qrcode':
        newLayer = {
          id,
          name: 'Dynamic QR Code',
          type: 'qrcode',
          x: 430,
          y: 20,
          width: 75,
          height: 95,
          qrText: 'https://linkedin.com/in/username',
          fgColor: '#0f172a',
          bgColor: '#ffffff',
          label: 'Scan to connect',
          locked: false,
          visible: true
        };
        break;

      case 'signature_script':
        newLayer = {
          id,
          name: 'Handwritten Signature',
          type: 'signature_script',
          x: 140,
          y: 110,
          width: 180,
          height: 45,
          strokeColor: '#1e293b',
          strokeWidth: 2,
          svgPath: 'M 10,35 Q 25,5 40,25 T 70,20 Q 90,35 110,15 T 140,25 Q 160,10 180,30 L 210,32',
          locked: false,
          visible: true
        };
        break;

      case 'badge':
        newLayer = {
          id,
          name: 'Trust / Review Badge',
          type: 'text',
          x: 140,
          y: 110,
          width: 250,
          height: 22,
          text: '⭐ Rated 4.9/5 by 500+ Clients',
          fontFamily: "'Outfit', Arial, sans-serif",
          fontSize: 11,
          fontWeight: '600',
          color: '#d97706',
          textAlign: 'left',
          linkUrl: '',
          locked: false,
          visible: true
        };
        break;

      case 'socials':
        newLayer = {
          id,
          name: 'Social Icons',
          type: 'socials',
          x: 140,
          y: 120,
          width: 160,
          height: 26,
          iconSize: 22,
          gap: 8,
          iconStyle: 'circle',
          colorMode: 'brand',
          platforms: [
            { id: 'linkedin', url: 'https://linkedin.com', enabled: true },
            { id: 'twitter', url: 'https://x.com', enabled: true },
            { id: 'github', url: 'https://github.com', enabled: true },
            { id: 'website', url: 'https://yourwebsite.com', enabled: true }
          ],
          locked: false,
          visible: true
        };
        break;

      case 'divider':
        newLayer = {
          id,
          name: 'Divider Line',
          type: 'divider',
          x: 115,
          y: 20,
          width: 2,
          height: 120,
          color: '#cbd5e1',
          orientation: 'vertical',
          style: 'solid',
          locked: false,
          visible: true
        };
        break;

      case 'button':
        newLayer = {
          id,
          name: 'CTA Button',
          type: 'button',
          x: 340,
          y: 110,
          width: 140,
          height: 32,
          text: 'Schedule Meeting',
          bgColor: '#6366f1',
          textColor: '#ffffff',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: '600',
          linkUrl: 'https://calendly.com',
          locked: false,
          visible: true
        };
        break;

      case 'shape':
        newLayer = {
          id,
          name: 'Card Background',
          type: 'shape',
          x: 0,
          y: 0,
          width: canvasConfig.width,
          height: canvasConfig.height,
          fillColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          borderRadius: 8,
          locked: false,
          visible: true
        };
        break;

      case 'banner':
        newLayer = {
          id,
          name: 'Promo Banner',
          type: 'text',
          x: 20,
          y: 130,
          width: 500,
          height: 28,
          text: '🎉 Join us at Tech Summit 2026 • Free Passes Available',
          fontFamily: "'Outfit', Arial, sans-serif",
          fontSize: 12,
          fontWeight: '700',
          color: '#6366f1',
          textAlign: 'center',
          linkUrl: 'https://techsummit2026.com',
          locked: false,
          visible: true
        };
        break;

      case 'disclaimer':
        newLayer = {
          id,
          name: 'Confidentiality Disclaimer',
          type: 'text',
          x: 20,
          y: 145,
          width: 500,
          height: 30,
          text: 'CONFIDENTIALITY NOTICE: The contents of this email message and any attachments are intended solely for the addressee(s).',
          fontFamily: 'Arial, sans-serif',
          fontSize: 9,
          fontWeight: '400',
          color: '#94a3b8',
          textAlign: 'left',
          linkUrl: '',
          locked: false,
          visible: true
        };
        break;

      default:
        break;
    }

    if (newLayer) {
      const updated = newLayer.type === 'shape' ? [newLayer, ...layers] : [...layers, newLayer];
      setLayers(updated);
      setSelectedLayerIds([newLayer.id]);
      pushHistory(canvasConfig, updated);
      showToast(`Added ${newLayer.name}`);
    }
  };

  // Add drawing layer from Bezier Pen Tool
  const handleAddDrawingLayer = (newDrawingLayer) => {
    const updated = [...layers, newDrawingLayer];
    setLayers(updated);
    setSelectedLayerIds([newDrawingLayer.id]);
    pushHistory(canvasConfig, updated);
    showToast(`Created ${newDrawingLayer.name}`);
  };

  // Insert modular element pack (multi-layer or formatted element)
  const handleInsertElementPack = (pack) => {
    const currentMaxY = layers.reduce((max, l) => Math.max(max, (l.y || 0) + (l.height || 20)), 40);
    const packMaxRelativeY = pack.layers.reduce((max, l) => Math.max(max, (l.y || 0) + (l.height || 20)), 0);
    const packMinRelativeY = pack.layers.reduce((min, l) => Math.min(min, l.y || 0), 9999);
    const packHeight = packMaxRelativeY - packMinRelativeY;

    let targetY = currentMaxY + 12;
    if (pack.category === 'Disclaimers') {
      targetY = Math.max(canvasConfig.height - 28, currentMaxY + 10);
    }

    const neededHeight = Math.max(canvasConfig.height, targetY + packHeight + 16);
    const newCanvasConfig = neededHeight > canvasConfig.height
      ? { ...canvasConfig, height: neededHeight }
      : canvasConfig;

    if (neededHeight > canvasConfig.height) {
      setCanvasConfig(newCanvasConfig);
    }

    const timestamp = Date.now();
    const newLayers = pack.layers.map((layerDef, idx) => {
      const newId = `pack_${pack.id}_${timestamp}_${idx}`;
      const yOffset = (pack.category === 'Disclaimers' || targetY > layerDef.y)
        ? (layerDef.y - packMinRelativeY + targetY)
        : layerDef.y;
      return {
        ...layerDef,
        id: newId,
        y: yOffset
      };
    });

    const updatedLayers = [...layers, ...newLayers];
    setLayers(updatedLayers);
    setSelectedLayerIds(newLayers.map(l => l.id));
    pushHistory(newCanvasConfig, updatedLayers);
    showToast(`Added "${pack.name}" to signature!`);
  };

  // Insert company or brand logo as high-res image layer
  const handleInsertLogo = (logoUrl, name = 'Company Logo') => {
    const newLayer = {
      id: `logo_${Date.now()}`,
      name: `${name} Logo`,
      type: 'image',
      x: Math.max(20, canvasConfig.width - 120),
      y: 20,
      width: 90,
      height: 34,
      url: logoUrl,
      borderRadius: 4,
      aspectRatioLocked: true,
      objectFit: 'contain',
      locked: false,
      visible: true
    };
    const updatedLayers = [...layers, newLayer];
    setLayers(updatedLayers);
    setSelectedLayerIds([newLayer.id]);
    pushHistory(canvasConfig, updatedLayers);
    showToast(`Added "${name}" logo to canvas!`);
  };

  // Apply template
  const handleSelectTemplate = (template) => {
    setCanvasConfig({
      width: template.width,
      height: template.height,
      preset: template.id,
      backgroundColor: '#ffffff'
    });
    setLayers(template.layers);
    if (template.layers[1]) setSelectedLayerIds([template.layers[1].id]);
    pushHistory({ width: template.width, height: template.height, backgroundColor: '#ffffff' }, template.layers);
    showToast(`Loaded ${template.name} template`);
  };

  // Apply team member from batch modal
  const handleApplyTeamMember = (member) => {
    setVariables(prev => ({ ...prev, ...member }));
    if (member.AvatarUrl) {
      const avatarLayer = layers.find(l => l.type === 'image');
      if (avatarLayer) {
        handleUpdateLayer(avatarLayer.id, { url: member.AvatarUrl });
      }
    }
    showToast(`Applied signature for ${member.FullName}`);
  };

  // Copy rich HTML signature to clipboard
  const handleCopySignature = async () => {
    const html = compileSignatureToHtml(canvasConfig, layers, variables, { isDarkModePreview: darkModePreview });
    const result = await copySignatureToClipboard(html);
    if (result.success) {
      showToast('Rich Signature copied! Paste directly into Gmail/Outlook');
    } else {
      showToast('Copy failed. Try downloading the HTML file.');
    }
  };

  // Download .html file
  const handleDownloadHtml = () => {
    const fullHtml = compileSignatureToHtml(canvasConfig, layers, variables, {
      fullDocument: true,
      isDarkModePreview: darkModePreview
    });
    const filename = `${docName.replace(/\s+/g, '_')}.html`;
    downloadHtmlFile(filename, fullHtml);
    showToast(`Downloaded ${filename}`);
  };

  // Copy raw HTML code
  const handleCopyRawHtml = async () => {
    const html = compileSignatureToHtml(canvasConfig, layers, variables, { isDarkModePreview: darkModePreview });
    await navigator.clipboard.writeText(html);
    showToast('Raw HTML code copied to clipboard!');
  };

  // Export JSON project file
  const handleExportJson = () => {
    const projectData = {
      version: '1.0.0',
      docName,
      canvasConfig,
      layers,
      variables
    };
    downloadJsonProject(projectData, `${docName.replace(/\s+/g, '_')}.json`);
    showToast('Project JSON exported');
  };

  // Import JSON project file
  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.canvasConfig && parsed.layers) {
            if (parsed.docName) setDocName(parsed.docName);
            setCanvasConfig(parsed.canvasConfig);
            setLayers(parsed.layers);
            if (parsed.variables) setVariables(parsed.variables);
            pushHistory(parsed.canvasConfig, parsed.layers);
            showToast('Loaded project JSON successfully');
          }
        } catch (err) {
          showToast('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  // ====================================================================
  // CENTRALIZED GLOBAL KEYBOARD SHORTCUTS HANDLER
  // ====================================================================
  useEffect(() => {
    const isInputField = (el) => {
      if (!el) return false;
      const tag = el.tagName?.toUpperCase();
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable ||
        Boolean(el.closest?.('input, textarea, select, [contenteditable="true"], .right-dock, .dock-content, .modal-window'))
      );
    };

    const handleGlobalKeyDown = (e) => {
      // 1. STRICT SAFETY GUARD: When user is typing inside ANY input, textarea, or Inspector panel,
      // NEVER delete element or hijack typing keys!
      if (isInputField(e.target) || isInputField(document.activeElement)) {
        return;
      }

      // 2. Undo: Cmd/Ctrl + Z (not Shift)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // 3. Redo: Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') ||
          ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // 4. Select All: Cmd/Ctrl + A
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const selectable = layers.filter(l => !l.locked && l.visible !== false).map(l => l.id);
        setSelectedLayerIds(selectable);
        showToast(`Selected all ${selectable.length} layers`);
        return;
      }

      // 5. Duplicate Selected: Cmd/Ctrl + D
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedLayerIds.length > 0) {
          handleDuplicateSelected();
        }
        return;
      }

      // 6. Delete Selected: Backspace or Delete (guarded against inputs!)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        if (selectedLayerIds.length > 0) {
          handleDeleteSelected();
        }
        return;
      }

      // 7. Escape: Deselect / Exit Pen Tool / Close Modals
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeTool === 'pen') {
          setActiveTool('select');
        } else {
          setSelectedLayerIds([]);
        }
        setIsTemplatesOpen(false);
        setIsBatchOpen(false);
        setIsGuideOpen(false);
        setIsCodePreviewOpen(false);
        setIsShortcutsOpen(false);
        setIsLogoAssetOpen(false);
        return;
      }

      // 8. Tool selection shortcuts
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === 'v') {
          e.preventDefault();
          setActiveTool('select');
        } else if (k === 'p') {
          e.preventDefault();
          setActiveTool(prev => prev === 'pen' ? 'select' : 'pen');
        } else if (k === 't') {
          e.preventDefault();
          handleAddLayer('text');
        } else if (k === 'i') {
          e.preventDefault();
          handleAddLayer('avatar');
        } else if (k === 'r') {
          e.preventDefault();
          handleAddLayer('shape');
        } else if (k === 'b') {
          e.preventDefault();
          handleAddLayer('button');
        } else if (k === 'u') {
          e.preventDefault();
          handleAddLayer('divider');
        } else if (k === 's') {
          e.preventDefault();
          handleAddLayer('socials');
        } else if (k === 'q') {
          e.preventDefault();
          handleAddLayer('qrcode');
        } else if (k === 'k') {
          e.preventDefault();
          handleAddLayer('status_pill');
        } else if (k === '5') {
          e.preventDefault();
          handleAddLayer('rating');
        } else if (k === 'h') {
          e.preventDefault();
          handleAddLayer('signature_script');
        }
      }

      // 9. Arrow keys: nudge selected layers
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (selectedLayerIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

          setLayers(prev => {
            const updated = prev.map(l => {
              if (selectedLayerIds.includes(l.id) && !l.locked) {
                return { ...l, x: l.x + dx, y: l.y + dy };
              }
              return l;
            });
            pushHistory(canvasConfig, updated);
            return updated;
          });
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [layers, selectedLayerIds, canvasConfig, activeTool, historyIndex, history]);

  return (
    <div className="app-container">
      {/* Top Application Toolbar */}
      <Toolbar
        docName={docName}
        setDocName={setDocName}
        canvasConfig={canvasConfig}
        setCanvasConfig={setCanvasConfig}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        setZoom={setZoom}
        darkModePreview={darkModePreview}
        setDarkModePreview={setDarkModePreview}
        mobilePreview={mobilePreview}
        setMobilePreview={setMobilePreview}
        uiTheme={uiTheme}
        setUiTheme={setUiTheme}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCodePreview={() => setIsCodePreviewOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenLogoAssetHub={() => setIsLogoAssetOpen(true)}
        onCopySignature={handleCopySignature}
        onDownloadHtml={handleDownloadHtml}
        onCopyRawHtml={handleCopyRawHtml}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onToggleMobileDock={() => setMobileDockOpen(!mobileDockOpen)}
        mobileDockOpen={mobileDockOpen}
      />

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Left Photoshop Tool Palette */}
        <ToolPalette
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onAddLayer={handleAddLayer}
        />

        {/* Center Canvas Viewport */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CanvasRulers width={canvasConfig.width} height={canvasConfig.height} zoom={zoom} />

          <CanvasWorkspace
            canvasConfig={canvasConfig}
            layers={layers}
            selectedLayerIds={selectedLayerIds}
            setSelectedLayerIds={setSelectedLayerIds}
            onUpdateLayer={handleUpdateLayer}
            onUpdateMultipleLayers={handleUpdateMultipleLayers}
            onDeleteLayer={handleDeleteLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onAlignSelected={handleAlignSelected}
            onDeleteSelected={handleDeleteSelected}
            zoom={zoom}
            darkModePreview={darkModePreview}
            mobilePreview={mobilePreview}
            variables={variables}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            onAddDrawingLayer={handleAddDrawingLayer}
          />
        </div>

        {/* Mobile Backdrop for Right Dock Drawer */}
        {mobileDockOpen && (
          <div className="mobile-dock-overlay" onClick={() => setMobileDockOpen(false)} />
        )}

        {/* Right Dock / Inspector & Layers */}
        <aside className={`right-dock ${mobileDockOpen ? 'open' : ''}`} aria-label="Properties and Layers">
          <div className="dock-tabs">
            <button
              className={`dock-tab ${dockTab === 'inspector' ? 'active' : ''}`}
              onClick={() => setDockTab('inspector')}
            >
              <Sliders size={13} />
              <span>Inspector {selectedLayerIds.length > 1 ? `(${selectedLayerIds.length})` : ''}</span>
            </button>
            <button
              className={`dock-tab ${dockTab === 'layers' ? 'active' : ''}`}
              onClick={() => setDockTab('layers')}
            >
              <LayersIcon size={13} />
              <span>Layers ({layers.length})</span>
            </button>
            <button
              className="dock-close-mobile-btn"
              onClick={() => setMobileDockOpen(false)}
              title="Close panel"
            >
              <PanelRightClose size={14} />
            </button>
          </div>

          {dockTab === 'inspector' ? (
            <InspectorPanel
              layer={selectedLayer}
              selectedLayers={selectedLayers}
              selectedLayerIds={selectedLayerIds}
              onUpdateLayer={handleUpdateLayer}
              onUpdateMultipleLayers={handleUpdateMultipleLayers}
              onAlignSelected={handleAlignSelected}
              onDeleteSelected={handleDeleteSelected}
              onDuplicateSelected={handleDuplicateSelected}
              canvasConfig={canvasConfig}
              setCanvasConfig={setCanvasConfig}
              onOpenLogoAssetHub={() => setIsLogoAssetOpen(true)}
            />
          ) : (
            <LayersPanel
              layers={layers}
              selectedLayerId={primarySelectedId}
              selectedLayerIds={selectedLayerIds}
              setSelectedLayerId={(id) => {
                setSelectedLayerIds([id]);
                setDockTab('inspector');
              }}
              setSelectedLayerIds={setSelectedLayerIds}
              onUpdateLayer={handleUpdateLayer}
              onDeleteLayer={handleDeleteLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onReorderLayers={handleReorderLayers}
            />
          )}
        </aside>
      </div>

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Logos, Element Packs & Asset Hub Modal */}
      <LogoAssetModal
        isOpen={isLogoAssetOpen}
        onClose={() => setIsLogoAssetOpen(false)}
        onInsertElementPack={handleInsertElementPack}
        onInsertLogo={handleInsertLogo}
      />

      {/* Batch Team Modal */}
      <BatchTeamModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        variables={variables}
        onApplyMember={handleApplyTeamMember}
        canvasConfig={canvasConfig}
        layers={layers}
      />

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Live HTML Code Preview Modal */}
      <CodePreviewModal
        isOpen={isCodePreviewOpen}
        onClose={() => setIsCodePreviewOpen(false)}
        canvasConfig={canvasConfig}
        layers={layers}
        variables={variables}
        darkModePreview={darkModePreview}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
