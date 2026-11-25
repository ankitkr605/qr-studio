import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export const DEFAULT_QR_DESIGN = {
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  size: 320,
  ecc: 'M',
  margin: 2,
  dotStyle: 'square', // square | rounded | dots | diamond | classy
  cornerStyle: 'square', // square | rounded | extra-rounded
  logoDataUrl: '',
  logoSizePct: 20,
  title: '',
};

/**
 * Checks if module coordinate (row, col) belongs to one of the three 7x7 finder patterns.
 */
function isFinderModule(row, col, count) {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= count - 7;
  const inBottomLeft = row >= count - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

/**
 * Computes QR module matrix using the `qrcode` library.
 * Automatically upgrades ECC to at least 'Q' when a center logo is active for scan reliability.
 */
export function createQrMatrix(content, design = {}) {
  const safeContent = content && content.length > 0 ? content : 'https://qrstudio.app';
  const requestedEcc = design.ecc || 'M';
  const effectiveEcc =
    design.logoDataUrl && (requestedEcc === 'L' || requestedEcc === 'M') ? 'H' : requestedEcc;

  const qr = QRCode.create(safeContent, {
    errorCorrectionLevel: effectiveEcc,
  });

  return {
    modules: qr.modules,
    count: qr.modules.size,
    effectiveEcc,
  };
}

function drawRoundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawFinderPatternCanvas(ctx, x, y, modSize, cornerStyle, fgColor, bgColor) {
  const outerSize = modSize * 7;
  const innerOffset = modSize * 2;
  const innerSize = modSize * 3;
  const holeOffset = modSize;
  const holeSize = modSize * 5;

  ctx.fillStyle = fgColor;
  if (cornerStyle === 'extra-rounded') {
    drawRoundedRectPath(ctx, x, y, outerSize, outerSize, modSize * 2.4);
    ctx.fill();
    ctx.fillStyle = bgColor;
    drawRoundedRectPath(ctx, x + holeOffset, y + holeOffset, holeSize, holeSize, modSize * 1.7);
    ctx.fill();
    ctx.fillStyle = fgColor;
    ctx.beginPath();
    ctx.arc(x + outerSize / 2, y + outerSize / 2, innerSize / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (cornerStyle === 'rounded') {
    drawRoundedRectPath(ctx, x, y, outerSize, outerSize, modSize * 1.4);
    ctx.fill();
    ctx.fillStyle = bgColor;
    drawRoundedRectPath(ctx, x + holeOffset, y + holeOffset, holeSize, holeSize, modSize * 0.9);
    ctx.fill();
    ctx.fillStyle = fgColor;
    drawRoundedRectPath(ctx, x + innerOffset, y + innerOffset, innerSize, innerSize, modSize * 0.7);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, outerSize, outerSize);
    ctx.fillStyle = bgColor;
    ctx.fillRect(x + holeOffset, y + holeOffset, holeSize, holeSize);
    ctx.fillStyle = fgColor;
    ctx.fillRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
  }
}

function drawDataModuleCanvas(ctx, x, y, modSize, dotStyle) {
  const cx = x + modSize / 2;
  const cy = y + modSize / 2;

  switch (dotStyle) {
    case 'dots': {
      ctx.beginPath();
      ctx.arc(cx, cy, modSize * 0.42, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rounded': {
      const pad = modSize * 0.06;
      drawRoundedRectPath(ctx, x + pad, y + pad, modSize - pad * 2, modSize - pad * 2, modSize * 0.32);
      ctx.fill();
      break;
    }
    case 'diamond': {
      const half = modSize * 0.48;
      ctx.beginPath();
      ctx.moveTo(cx, cy - half);
      ctx.lineTo(cx + half, cy);
      ctx.lineTo(cx, cy + half);
      ctx.lineTo(cx - half, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'classy': {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + modSize * 0.65, y);
      ctx.quadraticCurveTo(x + modSize, y, x + modSize, y + modSize * 0.35);
      ctx.lineTo(x + modSize, y + modSize);
      ctx.lineTo(x + modSize * 0.35, y + modSize);
      ctx.quadraticCurveTo(x, y + modSize, x, y + modSize * 0.65);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'square':
    default: {
      // Slight +0.4 overlap eliminates subpixel hairlines on canvas
      ctx.fillRect(x, y, modSize + 0.35, modSize + 0.35);
      break;
    }
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Renders the styled QR code onto an HTMLCanvasElement (supports title + logo).
 */
export async function renderQrToCanvas(canvas, content, design = {}) {
  const merged = { ...DEFAULT_QR_DESIGN, ...design };
  const { modules, count } = createQrMatrix(content, merged);

  const size = Number(merged.size) || 320;
  const margin = Number.isFinite(Number(merged.margin)) ? Number(merged.margin) : 2;
  const titleText = (merged.title || '').trim();
  const titleHeight = titleText ? Math.max(36, Math.round(size * 0.14)) : 0;

  const totalModules = count + margin * 2;
  const modSize = size / totalModules;

  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  canvas.width = size * dpr;
  canvas.height = (size + titleHeight) * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size + titleHeight}px`;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Background
  ctx.fillStyle = merged.bgColor;
  ctx.fillRect(0, 0, size, size + titleHeight);

  // Compute safe logo cutout bounds so modules don't clutter logo edges
  const logoPct = Math.min(Math.max(Number(merged.logoSizePct) || 20, 10), 30);
  const logoBoxSize = merged.logoDataUrl ? (size * logoPct) / 100 : 0;
  const logoPad = merged.logoDataUrl ? Math.max(4, logoBoxSize * 0.12) : 0;
  const clearMin = size / 2 - (logoBoxSize / 2 + logoPad);
  const clearMax = size / 2 + (logoBoxSize / 2 + logoPad);

  // Data modules
  ctx.fillStyle = merged.fgColor;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!modules.get(r, c)) continue;
      if (isFinderModule(r, c, count)) continue;

      const x = (c + margin) * modSize;
      const y = (r + margin) * modSize;

      if (
        merged.logoDataUrl &&
        x + modSize > clearMin &&
        x < clearMax &&
        y + modSize > clearMin &&
        y < clearMax
      ) {
        continue;
      }

      drawDataModuleCanvas(ctx, x, y, modSize, merged.dotStyle);
    }
  }

  // Three Finder Patterns
  const finderCoords = [
    [margin * modSize, margin * modSize],
    [(margin + count - 7) * modSize, margin * modSize],
    [margin * modSize, (margin + count - 7) * modSize],
  ];
  for (const [fx, fy] of finderCoords) {
    drawFinderPatternCanvas(ctx, fx, fy, modSize, merged.cornerStyle, merged.fgColor, merged.bgColor);
  }

  // Center Logo
  if (merged.logoDataUrl) {
    try {
      const img = await loadImage(merged.logoDataUrl);
      const lx = (size - logoBoxSize) / 2;
      const ly = (size - logoBoxSize) / 2;
      ctx.fillStyle = merged.bgColor;
      drawRoundedRectPath(
        ctx,
        lx - logoPad * 0.5,
        ly - logoPad * 0.5,
        logoBoxSize + logoPad,
        logoBoxSize + logoPad,
        8
      );
      ctx.fill();
      ctx.drawImage(img, lx, ly, logoBoxSize, logoBoxSize);
    } catch {
      // Ignore malformed logo image gracefully
    }
  }

  // Optional QR Title
  if (titleText) {
    ctx.fillStyle = merged.fgColor;
    const fontSize = Math.max(13, Math.round(size * 0.055));
    ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText.slice(0, 48), size / 2, size + titleHeight * 0.42, size - 24);
  }
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderFinderSvg(x, y, modSize, cornerStyle, fgColor, bgColor) {
  const outer = modSize * 7;
  const hole = modSize * 5;
  const inner = modSize * 3;
  if (cornerStyle === 'extra-rounded') {
    const cx = x + outer / 2;
    const cy = y + outer / 2;
    return [
      `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${modSize * 2.4}" fill="${fgColor}" />`,
      `<rect x="${x + modSize}" y="${y + modSize}" width="${hole}" height="${hole}" rx="${modSize * 1.7}" fill="${bgColor}" />`,
      `<circle cx="${cx}" cy="${cy}" r="${inner / 2}" fill="${fgColor}" />`,
    ].join('');
  }
  const outerRx = cornerStyle === 'rounded' ? modSize * 1.4 : 0;
  const holeRx = cornerStyle === 'rounded' ? modSize * 0.9 : 0;
  const innerRx = cornerStyle === 'rounded' ? modSize * 0.7 : 0;
  return [
    `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${outerRx}" fill="${fgColor}" />`,
    `<rect x="${x + modSize}" y="${y + modSize}" width="${hole}" height="${hole}" rx="${holeRx}" fill="${bgColor}" />`,
    `<rect x="${x + modSize * 2}" y="${y + modSize * 2}" width="${inner}" height="${inner}" rx="${innerRx}" fill="${fgColor}" />`,
  ].join('');
}

/**
 * Generates a crisp vector SVG string matching the customized design.
 */
export function generateQrSvgString(content, design = {}) {
  const merged = { ...DEFAULT_QR_DESIGN, ...design };
  const { modules, count } = createQrMatrix(content, merged);

  const size = Number(merged.size) || 320;
  const margin = Number.isFinite(Number(merged.margin)) ? Number(merged.margin) : 2;
  const titleText = (merged.title || '').trim();
  const titleHeight = titleText ? Math.max(36, Math.round(size * 0.14)) : 0;
  const totalHeight = size + titleHeight;

  const totalModules = count + margin * 2;
  const modSize = size / totalModules;

  const logoPct = Math.min(Math.max(Number(merged.logoSizePct) || 20, 10), 30);
  const logoBoxSize = merged.logoDataUrl ? (size * logoPct) / 100 : 0;
  const logoPad = merged.logoDataUrl ? Math.max(4, logoBoxSize * 0.12) : 0;
  const clearMin = size / 2 - (logoBoxSize / 2 + logoPad);
  const clearMax = size / 2 + (logoBoxSize / 2 + logoPad);

  const shapes = [];

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!modules.get(r, c)) continue;
      if (isFinderModule(r, c, count)) continue;

      const x = (c + margin) * modSize;
      const y = (r + margin) * modSize;

      if (
        merged.logoDataUrl &&
        x + modSize > clearMin &&
        x < clearMax &&
        y + modSize > clearMin &&
        y < clearMax
      ) {
        continue;
      }

      if (merged.dotStyle === 'dots') {
        shapes.push(
          `<circle cx="${(x + modSize / 2).toFixed(2)}" cy="${(y + modSize / 2).toFixed(2)}" r="${(
            modSize * 0.42
          ).toFixed(2)}" fill="${merged.fgColor}" />`
        );
      } else if (merged.dotStyle === 'rounded') {
        const pad = modSize * 0.06;
        shapes.push(
          `<rect x="${(x + pad).toFixed(2)}" y="${(y + pad).toFixed(2)}" width="${(
            modSize -
            pad * 2
          ).toFixed(2)}" height="${(modSize - pad * 2).toFixed(2)}" rx="${(modSize * 0.32).toFixed(
            2
          )}" fill="${merged.fgColor}" />`
        );
      } else if (merged.dotStyle === 'diamond') {
        const cx = x + modSize / 2;
        const cy = y + modSize / 2;
        const half = modSize * 0.48;
        shapes.push(
          `<polygon points="${cx.toFixed(2)},${(cy - half).toFixed(2)} ${(cx + half).toFixed(
            2
          )},${cy.toFixed(2)} ${cx.toFixed(2)},${(cy + half).toFixed(2)} ${(cx - half).toFixed(
            2
          )},${cy.toFixed(2)}" fill="${merged.fgColor}" />`
        );
      } else {
        shapes.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(modSize + 0.25).toFixed(
            2
          )}" height="${(modSize + 0.25).toFixed(2)}" fill="${merged.fgColor}" />`
        );
      }
    }
  }

  const finderCoords = [
    [margin * modSize, margin * modSize],
    [(margin + count - 7) * modSize, margin * modSize],
    [margin * modSize, (margin + count - 7) * modSize],
  ];
  const finders = finderCoords.map(([fx, fy]) =>
    renderFinderSvg(fx, fy, modSize, merged.cornerStyle, merged.fgColor, merged.bgColor)
  );

  let logoSvg = '';
  if (merged.logoDataUrl) {
    const lx = (size - logoBoxSize) / 2;
    const ly = (size - logoBoxSize) / 2;
    logoSvg = `<rect x="${(lx - logoPad * 0.5).toFixed(2)}" y="${(ly - logoPad * 0.5).toFixed(
      2
    )}" width="${(logoBoxSize + logoPad).toFixed(2)}" height="${(logoBoxSize + logoPad).toFixed(
      2
    )}" rx="8" fill="${merged.bgColor}" /><image href="${escapeXml(
      merged.logoDataUrl
    )}" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" width="${logoBoxSize.toFixed(
      2
    )}" height="${logoBoxSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />`;
  }

  let titleSvg = '';
  if (titleText) {
    const fontSize = Math.max(13, Math.round(size * 0.055));
    titleSvg = `<text x="${size / 2}" y="${size + titleHeight * 0.45}" text-anchor="middle" dominant-baseline="middle" font-family="Plus Jakarta Sans, Inter, sans-serif" font-weight="600" font-size="${fontSize}" fill="${merged.fgColor}">${escapeXml(
      titleText.slice(0, 48)
    )}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${totalHeight}" viewBox="0 0 ${size} ${totalHeight}">
  <rect width="100%" height="100%" fill="${merged.bgColor}" />
  ${shapes.join('\n  ')}
  ${finders.join('\n  ')}
  ${logoSvg}
  ${titleSvg}
</svg>`;
}

export async function downloadQrPng(content, design, filename = 'qr-studio-code') {
  const exportSize = Math.max(Number(design?.size) || 320, 640);
  const offscreen = document.createElement('canvas');
  await renderQrToCanvas(offscreen, content, { ...design, size: exportSize });
  const dataUrl = offscreen.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.png`;
  link.click();
}

export function downloadQrSvg(content, design, filename = 'qr-studio-code') {
  const svgString = generateQrSvgString(content, design);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadQrPdf(content, design, filename = 'qr-studio-code') {
  const offscreen = document.createElement('canvas');
  await renderQrToCanvas(offscreen, content, { ...design, size: 720 });
  const imgData = offscreen.toDataURL('image/png');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const qrSizeMm = 110;
  const aspect = offscreen.height / offscreen.width;
  const imgHeightMm = qrSizeMm * aspect;
  const x = (pageWidth - qrSizeMm) / 2;
  const y = 45;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(design?.title?.trim() || 'QR Studio Code', pageWidth / 2, 28, { align: 'center' });

  pdf.addImage(imgData, 'PNG', x, y, qrSizeMm, imgHeightMm);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  const caption = content.length > 90 ? `${content.slice(0, 87)}...` : content;
  pdf.text(caption, pageWidth / 2, y + imgHeightMm + 14, { align: 'center' });
  pdf.text('Generated with QR Studio', pageWidth / 2, 280, { align: 'center' });

  pdf.save(`${filename}.pdf`);
}
