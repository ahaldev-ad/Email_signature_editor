import { SOCIAL_PLATFORMS } from './constants';

/**
 * Replaces placeholders like {FullName}, {JobTitle} with values from variables dictionary
 */
export function interpolateVariables(text, variables = {}) {
  if (!text || typeof text !== 'string') return text || '';
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Converts canvas layers to bulletproof, cross-client HTML email markup.
 * Uses nested tables, inline CSS, explicit dimensions, and Outlook conditionals.
 */
export function compileSignatureToHtml(canvasConfig, layers, variables = {}, options = {}) {
  const { width = 540, height = 180 } = canvasConfig;
  const isDarkModePreview = options.isDarkModePreview || false;

  // Filter only visible layers and sort vertically
  const visibleLayers = layers
    .filter(l => l.visible !== false)
    .sort((a, b) => a.y - b.y);

  // Find full-size background shape if present
  const bgLayer = visibleLayers.find(l => l.type === 'shape' && l.width >= width * 0.85 && l.height >= height * 0.85);
  const contentLayers = visibleLayers.filter(l => l !== bgLayer);

  // Determine background color
  const bgColor = bgLayer ? (bgLayer.fillColor || '#ffffff') : '#ffffff';
  const borderColor = bgLayer ? (bgLayer.borderColor || 'transparent') : 'transparent';
  const borderWidth = bgLayer ? (bgLayer.borderWidth || 0) : 0;
  const borderRadius = bgLayer ? (bgLayer.borderRadius || 0) : 0;

  // Check if we have left-column elements (like avatar/logo) vs right-column content
  const avatarLayer = contentLayers.find(l => l.type === 'image' && l.x < width * 0.35);
  const verticalDivider = contentLayers.find(l => l.type === 'divider' && l.orientation === 'vertical');

  // Elements that belong to the right column (everything except avatar and vertical divider)
  const rightColumnLayers = contentLayers.filter(l => {
    if (l === avatarLayer || l === verticalDivider) return false;
    // Keep wide bottom banners separate
    if (l.width > width * 0.75 && l.y > 100) return false;
    return true;
  }).sort((a, b) => a.y - b.y);

  // Full-width bottom layers (like promo banner or legal disclaimer)
  const bottomLayers = contentLayers.filter(l => {
    if (l === avatarLayer || l === verticalDivider) return false;
    return l.width > width * 0.75 && l.y > 100;
  });

  // Cluster rightColumnLayers into horizontal rows if elements share similar Y coordinates
  const rowClusters = [];
  rightColumnLayers.forEach(layer => {
    const matchingCluster = rowClusters.find(cluster => 
      Math.abs(cluster[0].y - layer.y) <= 16
    );
    if (matchingCluster) {
      matchingCluster.push(layer);
      matchingCluster.sort((a, b) => a.x - b.x);
    } else {
      rowClusters.push([layer]);
    }
  });
  rowClusters.sort((a, b) => a[0].y - b[0].y);

  // Render individual element to email safe HTML
  const renderElement = (layer) => {
    const opacity = layer.opacity !== undefined ? layer.opacity : 1;

    switch (layer.type) {
      case 'text': {
        const textContent = interpolateVariables(layer.text, variables);
        const lines = textContent.split('\n');
        const fontFam = layer.fontFamily || "Arial, Helvetica, sans-serif";
        const fSize = layer.fontSize || 13;
        const fWeight = layer.fontWeight || '400';
        const color = layer.color || '#333333';
        const lHeight = layer.lineHeight || 1.35;
        const tAlign = layer.textAlign || 'left';
        const letterSpacing = layer.letterSpacing ? `${layer.letterSpacing}px` : 'normal';
        const fontStyle = layer.fontStyle || 'normal';
        const textDecoration = layer.textDecoration || 'none';
        const textTransform = layer.textTransform || 'none';

        const lineHtml = lines.map(line => {
          if (!line.trim()) return '&nbsp;';
          return `<span>${line}</span>`;
        }).join('<br/>');

        const innerContent = layer.linkUrl ? 
          `<a href="${interpolateVariables(layer.linkUrl, variables)}" target="_blank" style="color: ${color}; text-decoration: ${textDecoration === 'none' ? 'underline' : textDecoration}; font-family: ${fontFam}; font-weight: ${fWeight}; font-style: ${fontStyle}; text-transform: ${textTransform};">${lineHtml}</a>` :
          lineHtml;

        return `
          <div style="font-family: ${fontFam}; font-size: ${fSize}px; font-weight: ${fWeight}; font-style: ${fontStyle}; text-transform: ${textTransform}; color: ${color}; line-height: ${lHeight}; text-align: ${tAlign}; letter-spacing: ${letterSpacing}; opacity: ${opacity}; margin: 0; padding: 0;">
            ${innerContent}
          </div>
        `;
      }

      case 'image': {
        const imgUrl = interpolateVariables(layer.url, variables);
        const imgW = layer.width || 80;
        const imgH = layer.height || 80;
        const bRadius = layer.borderRadius || 0;
        const bWidth = layer.borderWidth || 0;
        const bColor = layer.borderColor || 'transparent';
        const altText = layer.alt || 'Signature Image';
        
        let imgTag = `<img src="${imgUrl}" alt="${altText}" width="${imgW}" height="${imgH}" style="display: block; width: ${imgW}px; height: ${imgH}px; border-radius: ${bRadius}px; border: ${bWidth}px solid ${bColor}; outline: none; text-decoration: none; opacity: ${opacity}; -ms-interpolation-mode: bicubic;" />`;
        
        if (layer.linkUrl) {
          imgTag = `<a href="${interpolateVariables(layer.linkUrl, variables)}" target="_blank" style="border: 0; text-decoration: none; display: inline-block;">${imgTag}</a>`;
        }
        return imgTag;
      }

      case 'divider': {
        if (layer.orientation === 'vertical') {
          return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; opacity: ${opacity};">
            <tr>
              <td style="width: ${layer.width || 2}px; height: ${layer.height || 100}px; background-color: ${layer.color || '#e2e8f0'}; font-size: 1px; line-height: 1px;">&nbsp;</td>
            </tr>
          </table>`;
        } else {
          return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; opacity: ${opacity};">
            <tr>
              <td style="height: ${layer.height || 1}px; background-color: ${layer.color || '#e2e8f0'}; font-size: 1px; line-height: 1px;">&nbsp;</td>
            </tr>
          </table>`;
        }
      }

      case 'button': {
        const btnText = interpolateVariables(layer.text, variables);
        const btnLink = interpolateVariables(layer.linkUrl || '#', variables);
        const btnBg = layer.bgColor || '#6366f1';
        const btnColor = layer.textColor || '#ffffff';
        const btnRadius = layer.borderRadius || 6;
        const btnSize = layer.fontSize || 12;
        const btnWeight = layer.fontWeight || '600';
        const bWidth = layer.borderWidth || 0;
        const bColor = layer.borderColor || 'transparent';
        const padV = layer.paddingV || 7;
        const padH = layer.paddingH || 16;

        return `
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${btnLink}" style="height:${layer.height || 34}px;v-text-anchor:middle;width:${layer.width || 140}px;" arcsize="15%" strokecolor="${bColor}" strokeweight="${bWidth}px" fillcolor="${btnBg}">
            <w:anchorlock/>
            <center style="color:${btnColor};font-family:Arial,sans-serif;font-size:${btnSize}px;font-weight:${btnWeight};">${btnText}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; opacity: ${opacity};">
            <tr>
              <td align="center" bgcolor="${btnBg}" style="border-radius: ${btnRadius}px; background-color: ${btnBg}; border: ${bWidth}px solid ${bColor}; padding: ${padV}px ${padH}px;">
                <a href="${btnLink}" target="_blank" style="display: inline-block; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: ${btnSize}px; font-weight: ${btnWeight}; color: ${btnColor}; text-decoration: none; border-radius: ${btnRadius}px; line-height: 1.2;">
                  ${btnText}
                </a>
              </td>
            </tr>
          </table>
          <!--<![endif]-->
        `;
      }

      case 'socials': {
        const platforms = layer.platforms || [];
        const iconSize = layer.iconSize || 22;
        const gap = layer.gap || 8;
        const isMono = layer.colorMode === 'monochrome';
        const monoColor = layer.monoColor || '#475569';
        const stylePack = layer.stylePack || 'default';

        const renderedIcons = platforms.filter(p => p.enabled).map(p => {
          const config = SOCIAL_PLATFORMS.find(sp => sp.id === p.id) || { name: p.id, color: '#4F46E5', iconSvg: '' };
          const targetUrl = interpolateVariables(p.url || config.defaultUrl, variables);
          const baseColor = isMono ? monoColor : config.color;

          let badgeWrapperStyle = 'display: inline-block; text-decoration: none; border: 0; vertical-align: middle;';
          let svgColor = baseColor;
          let renderSize = iconSize;

          if (stylePack === 'outline') {
            const pad = Math.max(3, Math.round(iconSize * 0.2));
            badgeWrapperStyle += ` border: 1px solid ${baseColor}; border-radius: 6px; padding: ${pad}px; background-color: transparent;`;
            svgColor = baseColor;
          } else if (stylePack === 'squircle_soft') {
            const pad = Math.max(3, Math.round(iconSize * 0.2));
            badgeWrapperStyle += ` background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: ${pad}px;`;
            svgColor = baseColor;
          } else if (stylePack === 'circle_solid') {
            const pad = Math.max(4, Math.round(iconSize * 0.22));
            const bg = isMono ? monoColor : '#0f172a';
            badgeWrapperStyle += ` background-color: ${bg}; border-radius: 50%; padding: ${pad}px;`;
            svgColor = '#ffffff';
          } else if (stylePack === 'pure_minimal') {
            svgColor = isMono ? monoColor : '#475569';
          } else if (stylePack === 'neo_brutalist') {
            const pad = Math.max(3, Math.round(iconSize * 0.18));
            badgeWrapperStyle += ` background-color: #ffffff; border: 2px solid #000000; border-radius: 3px; padding: ${pad}px;`;
            svgColor = '#000000';
          } else if (stylePack === 'gradient_glow') {
            const pad = Math.max(4, Math.round(iconSize * 0.22));
            badgeWrapperStyle += ` background-color: #6366f1; border-radius: 8px; padding: ${pad}px;`;
            svgColor = '#ffffff';
          }

          // Reliable email image using SVG Data URL
          const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="${renderSize}" height="${renderSize}" viewBox="0 0 24 24" fill="none" stroke="${svgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${config.iconSvg}</svg>`;
          const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;

          return `
            <td style="padding-right: ${gap}px; vertical-align: middle;">
              <a href="${targetUrl}" target="_blank" style="${badgeWrapperStyle}">
                <img src="${encodedSvg}" alt="${config.name}" width="${renderSize}" height="${renderSize}" style="display: block; width: ${renderSize}px; height: ${renderSize}px; border: 0;" />
              </a>
            </td>
          `;
        }).join('');

        return `
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; opacity: ${opacity};">
            <tr>
              ${renderedIcons}
            </tr>
          </table>
        `;
      }

      case 'shape': {
        return `
          <div style="background-color: ${layer.fillColor || '#ffffff'}; border: ${layer.borderWidth || 0}px solid ${layer.borderColor || 'transparent'}; border-radius: ${layer.borderRadius || 0}px; width: ${layer.width}px; height: ${layer.height}px; opacity: ${opacity};">
          </div>
        `;
      }

      case 'drawing': {
        const strokeColor = layer.strokeColor || '#6366f1';
        const strokeWidth = layer.strokeWidth || 3;
        const fillColor = layer.fillColor || 'none';
        const w = Math.max(10, layer.width || 60);
        const h = Math.max(10, layer.height || 30);
        const pathData = layer.pathData || '';

        const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${pathData}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;

        return `<img src="${encodedSvg}" alt="${layer.name || 'Handwritten Drawing'}" width="${w}" height="${h}" style="display: block; width: ${w}px; height: ${h}px; border: 0; outline: none; opacity: ${opacity};" />`;
      }

      case 'qrcode': {
        const qrData = encodeURIComponent(interpolateVariables(layer.qrText || 'https://vortexdynamics.io', variables));
        const fg = (layer.fgColor || '#0f172a').replace('#', '');
        const bg = (layer.bgColor || '#ffffff').replace('#', '');
        const size = Math.max(40, layer.width || 60);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${qrData}&color=${fg}&bgcolor=${bg}&margin=1`;
        const label = layer.label ? interpolateVariables(layer.label, variables) : '';

        return `
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; text-align: center; opacity: ${opacity};">
            <tr>
              <td align="center">
                <img src="${qrUrl}" alt="QR Code" width="${size}" height="${size}" style="display: block; width: ${size}px; height: ${size}px; border: 0; outline: none; border-radius: 4px;" />
              </td>
            </tr>
            ${label ? `<tr><td style="font-family: Arial, sans-serif; font-size: 9px; color: #64748b; padding-top: 3px; text-align: center; line-height: 1.1;">${label}</td></tr>` : ''}
          </table>
        `;
      }

      case 'status_pill': {
        const text = interpolateVariables(layer.statusText || '🟢 Available for Projects', variables);
        const bg = layer.pillBg || '#ecfdf5';
        const color = layer.pillColor || '#065f46';
        const border = layer.pillBorder || '#a7f3d0';
        const dotColor = layer.dotColor || '#10b981';

        return `
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background-color: ${bg}; border: 1px solid ${border}; border-radius: 20px; opacity: ${opacity};">
            <tr>
              <td style="padding: 4px 10px; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 600; color: ${color}; line-height: 1;">
                <span style="display: inline-block; width: 6px; height: 6px; background-color: ${dotColor}; border-radius: 50%; margin-right: 6px; vertical-align: middle;"></span>
                <span style="vertical-align: middle;">${text}</span>
              </td>
            </tr>
          </table>
        `;
      }

      case 'rating': {
        const text = interpolateVariables(layer.ratingText || '4.9/5 from 400+ reviews', variables);
        const starColor = layer.starColor || '#f59e0b';
        const textColor = layer.textColor || '#475569';
        const count = layer.starCount || 5;
        const stars = '★'.repeat(count);

        return `
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; opacity: ${opacity};">
            <tr>
              <td style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3;">
                <span style="color: ${starColor}; font-size: 13px; letter-spacing: 1px;">${stars}</span>
                <span style="color: ${textColor}; font-weight: 600; margin-left: 5px;">${text}</span>
              </td>
            </tr>
          </table>
        `;
      }

      case 'signature_script': {
        const strokeColor = layer.strokeColor || '#1e293b';
        const strokeWidth = layer.strokeWidth || 2;
        const w = Math.max(60, layer.width || 180);
        const h = Math.max(30, layer.height || 45);
        const svgPath = layer.svgPath || 'M 10,35 Q 25,5 40,25 T 70,20 Q 90,35 110,15 T 140,25 Q 160,10 180,30 L 210,32';

        const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 220 50" fill="none"><path d="${svgPath}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;

        return `<img src="${encodedSvg}" alt="${layer.name || 'Signature'}" width="${w}" height="${h}" style="display: block; width: ${w}px; height: ${h}px; border: 0; outline: none; opacity: ${opacity};" />`;
      }

      default:
        return '';
    }
  };

  // Build the outer table container
  const htmlBody = `
<!-- SIGNATURE START -->
<table class="signacraft-root" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.4; border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; max-width: ${width}px; background-color: ${bgColor}; border: ${borderWidth}px solid ${borderColor}; border-radius: ${borderRadius}px;">
  <tr>
    <td style="padding: 16px 20px;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
        <tr>
          ${avatarLayer ? `
          <td valign="top" style="vertical-align: top; padding-right: 18px; width: ${avatarLayer.width}px;">
            ${renderElement(avatarLayer)}
          </td>
          ` : ''}

          ${verticalDivider ? `
          <td valign="top" style="vertical-align: top; width: ${verticalDivider.width + 12}px; padding-right: 18px;">
            ${renderElement(verticalDivider)}
          </td>
          ` : ''}

          <td valign="top" style="vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
              ${rowClusters.map(cluster => `
              <tr>
                <td style="padding-bottom: 6px; vertical-align: top;">
                  ${cluster.length === 1 ? renderElement(cluster[0]) : `
                    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                      <tr>
                        ${cluster.map((l, cIdx) => `
                          <td style="${cIdx < cluster.length - 1 ? 'padding-right: 12px;' : ''} vertical-align: middle;">
                            ${renderElement(l)}
                          </td>
                        `).join('')}
                      </tr>
                    </table>
                  `}
                </td>
              </tr>
              `).join('')}
            </table>
          </td>
        </tr>
      </table>

      ${bottomLayers.length > 0 ? `
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; margin-top: 14px;">
        ${bottomLayers.map(bl => `
        <tr>
          <td style="padding-top: 8px;">
            ${renderElement(bl)}
          </td>
        </tr>
        `).join('')}
      </table>
      ` : ''}
    </td>
  </tr>
</table>
<!-- SIGNATURE END -->
  `.trim();

  // If full HTML document requested (for download or preview)
  if (options.fullDocument) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email Signature</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body { margin: 0; padding: 20px; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background: ${isDarkModePreview ? '#121212' : '#ffffff'}; }
    table { border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; }
    @media only screen and (max-width: 480px) {
      .signacraft-root { width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 12px; font-family: Arial, sans-serif; background-color: ${isDarkModePreview ? '#121212' : '#ffffff'};">
  ${htmlBody}
</body>
</html>`;
  }

  return htmlBody;
}

/**
 * Copies rich formatted HTML signature directly to clipboard.
 * Allows user to paste directly into Gmail, Apple Mail, Outlook settings!
 */
export async function copySignatureToClipboard(htmlString) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const typeHtml = 'text/html';
      const typeText = 'text/plain';
      const blobHtml = new Blob([htmlString], { type: typeHtml });
      // Create stripped plain text fallback
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const blobText = new Blob([plainText], { type: typeText });

      const item = new window.ClipboardItem({
        [typeHtml]: blobHtml,
        [typeText]: blobText
      });
      await navigator.clipboard.write([item]);
      return { success: true, method: 'ClipboardItem' };
    }
  } catch (err) {
    console.warn('ClipboardItem write failed, trying execCommand fallback:', err);
  }

  // Fallback: create temporary DOM element, select it, and run document.execCommand('copy')
  try {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    container.style.left = '-9999px';
    container.innerHTML = htmlString;
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const successful = document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(container);

    if (successful) {
      return { success: true, method: 'execCommand' };
    }
    throw new Error('execCommand failed');
  } catch (fallbackErr) {
    console.error('All copy methods failed:', fallbackErr);
    return { success: false, error: fallbackErr.message };
  }
}

/**
 * Initiates download of .html file in browser
 */
export function downloadHtmlFile(filename, content) {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/html;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Initiates download of JSON project file
 */
export function downloadJsonProject(projectData, filename = 'signature-project.json') {
  const element = document.createElement('a');
  const file = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
