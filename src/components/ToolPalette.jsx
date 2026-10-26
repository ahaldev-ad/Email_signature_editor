import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer2, Type, Image as ImageIcon, Share2,
  Minus, RectangleHorizontal, Square, ShieldAlert, Sparkles, Award, PenTool,
  QrCode, Star, Activity, Feather, Mail, Phone, MessageCircle, MapPin, Globe, Smartphone, X
} from 'lucide-react';

export function ToolPalette({ activeTool, setActiveTool, onAddLayer }) {
  const [showContactFlyout, setShowContactFlyout] = useState(false);
  const flyoutRef = useRef(null);

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        setShowContactFlyout(false);
      }
    };
    if (showContactFlyout) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showContactFlyout]);

  const tools = [
    {
      id: 'select',
      label: 'Select / Marquee Tool',
      icon: <MousePointer2 size={17} />,
      shortcut: 'V',
      action: () => {
        setActiveTool('select');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'pen',
      label: 'Photoshop Bezier Pen Tool',
      icon: <PenTool size={17} />,
      shortcut: 'P',
      action: () => {
        setActiveTool(activeTool === 'pen' ? 'select' : 'pen');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'text',
      label: 'Add Text Box',
      icon: <Type size={17} />,
      shortcut: 'T',
      action: () => {
        onAddLayer('text');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'contact_menu',
      label: 'Add Contact Icons & Elements',
      icon: <Mail size={17} />,
      shortcut: 'C',
      action: () => setShowContactFlyout(prev => !prev),
      isContact: true
    },
    {
      id: 'avatar',
      label: 'Add Profile Photo / Avatar',
      icon: <ImageIcon size={17} />,
      shortcut: 'I',
      action: () => {
        onAddLayer('avatar');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'status_pill',
      label: 'Add Status / Availability Pill',
      icon: <Activity size={17} />,
      shortcut: 'K',
      action: () => {
        onAddLayer('status_pill');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'rating',
      label: 'Add Star Review Rating',
      icon: <Star size={17} />,
      shortcut: '5',
      action: () => {
        onAddLayer('rating');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'qrcode',
      label: 'Add Dynamic QR Code',
      icon: <QrCode size={17} />,
      shortcut: 'Q',
      action: () => {
        onAddLayer('qrcode');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'signature_script',
      label: 'Add Handwritten Signature',
      icon: <Feather size={17} />,
      shortcut: 'H',
      action: () => {
        onAddLayer('signature_script');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'badge',
      label: 'Add Review / Trust Badge',
      icon: <Award size={17} />,
      shortcut: 'G',
      action: () => {
        onAddLayer('badge');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'socials',
      label: 'Add Social Media Icons',
      icon: <Share2 size={17} />,
      shortcut: 'S',
      action: () => {
        onAddLayer('socials');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'divider',
      label: 'Add Divider Line',
      icon: <Minus size={17} />,
      shortcut: 'U',
      action: () => {
        onAddLayer('divider');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'button',
      label: 'Add CTA Button',
      icon: <RectangleHorizontal size={17} />,
      shortcut: 'B',
      action: () => {
        onAddLayer('button');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'shape',
      label: 'Add Background Box / Shape',
      icon: <Square size={17} />,
      shortcut: 'R',
      action: () => {
        onAddLayer('shape');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'banner',
      label: 'Add Promotional Banner',
      icon: <Sparkles size={17} />,
      shortcut: 'N',
      action: () => {
        onAddLayer('banner');
        setShowContactFlyout(false);
      }
    },
    {
      id: 'disclaimer',
      label: 'Add Legal Disclaimer',
      icon: <ShieldAlert size={17} />,
      shortcut: 'D',
      action: () => {
        onAddLayer('disclaimer');
        setShowContactFlyout(false);
      }
    }
  ];

  const contactItems = [
    { id: 'contact_email', label: '✉️ Email Line', sub: '{Email} + mailto: link', icon: <Mail size={15} color="#38bdf8" /> },
    { id: 'contact_phone', label: '📞 Phone Line', sub: '{Phone} + tel: link', icon: <Phone size={15} color="#10b981" /> },
    { id: 'contact_chat', label: '💬 WhatsApp Chat', sub: 'Chat on WhatsApp Pill', icon: <MessageCircle size={15} color="#25D366" /> },
    { id: 'contact_location', label: '📍 Office Location', sub: '{Address} + Google Maps', icon: <MapPin size={15} color="#f43f5e" /> },
    { id: 'contact_website', label: '🌐 Website Link', sub: '{Website} + link', icon: <Globe size={15} color="#6366f1" /> },
    { id: 'contact_mobile', label: '📱 Mobile Line', sub: '{Mobile} + direct call', icon: <Smartphone size={15} color="#d97706" /> },
    { id: 'contact_stack', label: '📋 Full Contact Block', sub: 'All 4 icons in neat block', icon: <Sparkles size={15} color="#a855f7" /> }
  ];

  return (
    <aside className="left-tool-palette" aria-label="Tool Palette" style={{ position: 'relative' }}>
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`ps-tool ${activeTool === tool.id || (tool.isContact && showContactFlyout) ? 'active' : ''}`}
          onClick={tool.action}
          title={`${tool.label} (${tool.shortcut})`}
        >
          {tool.icon}
          <span className="ps-shortcut">{tool.shortcut}</span>
        </button>
      ))}

      {/* Contact Elements Flyout Menu */}
      {showContactFlyout && (
        <div ref={flyoutRef} className="ps-flyout-menu" style={{ top: 120 }}>
          <div className="ps-flyout-header">
            <span>Contact Elements & Icons</span>
            <button className="tool-btn" style={{ width: 20, height: 20 }} onClick={() => setShowContactFlyout(false)}>
              <X size={12} />
            </button>
          </div>
          <div className="ps-flyout-list">
            {contactItems.map(item => (
              <button
                key={item.id}
                className="ps-flyout-item"
                onClick={() => {
                  onAddLayer(item.id);
                  setShowContactFlyout(false);
                }}
              >
                <div className="ps-flyout-icon-box">{item.icon}</div>
                <div className="ps-flyout-item-text">
                  <strong>{item.label}</strong>
                  <span>{item.sub}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
