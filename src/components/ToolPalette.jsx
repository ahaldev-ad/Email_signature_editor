import React from 'react';
import {
  MousePointer2, Type, Image as ImageIcon, Share2,
  Minus, RectangleHorizontal, Square, ShieldAlert, Sparkles, Award, PenTool,
  QrCode, Star, Activity, Feather
} from 'lucide-react';

export function ToolPalette({ activeTool, setActiveTool, onAddLayer }) {
  const tools = [
    {
      id: 'select',
      label: 'Select / Marquee Tool',
      icon: <MousePointer2 size={17} />,
      shortcut: 'V',
      action: () => setActiveTool('select')
    },
    {
      id: 'pen',
      label: 'Photoshop Bezier Pen Tool',
      icon: <PenTool size={17} />,
      shortcut: 'P',
      action: () => setActiveTool(activeTool === 'pen' ? 'select' : 'pen')
    },
    {
      id: 'text',
      label: 'Add Text Box',
      icon: <Type size={17} />,
      shortcut: 'T',
      action: () => onAddLayer('text')
    },
    {
      id: 'avatar',
      label: 'Add Profile Photo / Avatar',
      icon: <ImageIcon size={17} />,
      shortcut: 'I',
      action: () => onAddLayer('avatar')
    },
    {
      id: 'status_pill',
      label: 'Add Status / Availability Pill',
      icon: <Activity size={17} />,
      shortcut: 'K',
      action: () => onAddLayer('status_pill')
    },
    {
      id: 'rating',
      label: 'Add Star Review Rating',
      icon: <Star size={17} />,
      shortcut: '5',
      action: () => onAddLayer('rating')
    },
    {
      id: 'qrcode',
      label: 'Add Dynamic QR Code',
      icon: <QrCode size={17} />,
      shortcut: 'Q',
      action: () => onAddLayer('qrcode')
    },
    {
      id: 'signature_script',
      label: 'Add Handwritten Signature',
      icon: <Feather size={17} />,
      shortcut: 'H',
      action: () => onAddLayer('signature_script')
    },
    {
      id: 'badge',
      label: 'Add Review / Trust Badge',
      icon: <Award size={17} />,
      shortcut: 'G',
      action: () => onAddLayer('badge')
    },
    {
      id: 'socials',
      label: 'Add Social Media Icons',
      icon: <Share2 size={17} />,
      shortcut: 'S',
      action: () => onAddLayer('socials')
    },
    {
      id: 'divider',
      label: 'Add Divider Line',
      icon: <Minus size={17} />,
      shortcut: 'U',
      action: () => onAddLayer('divider')
    },
    {
      id: 'button',
      label: 'Add CTA Button',
      icon: <RectangleHorizontal size={17} />,
      shortcut: 'B',
      action: () => onAddLayer('button')
    },
    {
      id: 'shape',
      label: 'Add Background Box / Shape',
      icon: <Square size={17} />,
      shortcut: 'R',
      action: () => onAddLayer('shape')
    },
    {
      id: 'banner',
      label: 'Add Promotional Banner',
      icon: <Sparkles size={17} />,
      shortcut: 'N',
      action: () => onAddLayer('banner')
    },
    {
      id: 'disclaimer',
      label: 'Add Legal Disclaimer',
      icon: <ShieldAlert size={17} />,
      shortcut: 'D',
      action: () => onAddLayer('disclaimer')
    }
  ];

  return (
    <aside className="left-tool-palette" aria-label="Tool Palette">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`ps-tool ${activeTool === tool.id ? 'active' : ''}`}
          onClick={tool.action}
          title={`${tool.label} (${tool.shortcut})`}
        >
          {tool.icon}
          <span className="ps-shortcut">{tool.shortcut}</span>
        </button>
      ))}
    </aside>
  );
}
