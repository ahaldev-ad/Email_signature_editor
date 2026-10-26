import React from 'react';

export function CanvasRulers({ width, height, zoom }) {
  // Generate tick markers every 50px
  const xTicks = [];
  for (let x = 0; x <= width; x += 50) {
    xTicks.push(x);
  }

  const yTicks = [];
  for (let y = 0; y <= height; y += 50) {
    yTicks.push(y);
  }

  return (
    <>
      {/* Top Horizontal Ruler */}
      <div className="ruler-top">
        <div style={{ width: 20, height: 20, background: 'var(--bg-topbar)', borderRight: '1px solid var(--border-subtle)', flexShrink: 0 }} />
        <div style={{ position: 'relative', width: width * zoom, height: '100%', overflow: 'hidden' }}>
          {xTicks.map(x => (
            <div
              key={x}
              style={{
                position: 'absolute',
                left: x * zoom,
                top: 0,
                bottom: 0,
                borderLeft: '1px solid var(--border-subtle)',
                paddingLeft: 2,
                fontSize: 8,
                lineHeight: '18px'
              }}
            >
              {x}
            </div>
          ))}
        </div>
      </div>

      {/* Left Vertical Ruler */}
      <div className="ruler-left">
        <div style={{ position: 'relative', height: height * zoom, width: '100%', overflow: 'hidden' }}>
          {yTicks.map(y => (
            <div
              key={y}
              style={{
                position: 'absolute',
                top: y * zoom,
                left: 0,
                right: 0,
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 1,
                paddingLeft: 2,
                fontSize: 8
              }}
            >
              {y}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
