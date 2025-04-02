import React, { useState, useEffect } from 'react';

interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
}

const ColorPaletteGenerator: React.FC = () => {
  const [baseColor, setBaseColor] = useState('#3b82f6'); // Default to a nice blue
  const [paletteType, setPaletteType] = useState<'analogous' | 'monochromatic' | 'triadic' | 'complementary' | 'split-complementary'>('analogous');
  const [palette, setPalette] = useState<ColorInfo[]>([]);

  // Convert hex to HSL
  const hexToHSL = (hex: string) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    let r = parseInt(hex.slice(0, 2), 16) / 255;
    let g = parseInt(hex.slice(2, 4), 16) / 255;
    let b = parseInt(hex.slice(4, 6), 16) / 255;
    
    // Find min and max values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    // Calculate lightness
    let l = (max + min) / 2;
    
    let h, s;
    
    if (max === min) {
      // Achromatic
      h = s = 0;
    } else {
      // Calculate saturation
      s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
      
      // Calculate hue
      switch (max) {
        case r:
          h = (g - b) / (max - min) + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / (max - min) + 2;
          break;
        default: // b is max
          h = (r - g) / (max - min) + 4;
          break;
      }
      h /= 6;
    }
    
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // Achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Generate RGB string from hex
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return '';
  };

  // Generate HSL string from HSL values
  const formatHSL = (h: number, s: number, l: number) => {
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  // Generate color palettes
  const generatePalette = () => {
    const { h, s, l } = hexToHSL(baseColor);
    const colors: ColorInfo[] = [];
    
    // Add base color
    colors.push({
      hex: baseColor,
      rgb: hexToRgb(baseColor),
      hsl: formatHSL(h, s, l)
    });
    
    switch (paletteType) {
      case 'analogous':
        // Analogous colors: colors that are adjacent to each other on the color wheel
        for (let i = 1; i <= 4; i++) {
          const newHue = (h + i * 30) % 360;
          const newHex = hslToHex(newHue, s, l);
          colors.push({
            hex: newHex,
            rgb: hexToRgb(newHex),
            hsl: formatHSL(newHue, s, l)
          });
        }
        break;
        
      case 'monochromatic':
        // Monochromatic: variations of the same hue with different lightness and saturation
        for (let i = 1; i <= 4; i++) {
          // Alternate between changing lightness and saturation
          const newL = Math.max(Math.min(l + (i % 2 === 0 ? i * 5 : 0), 90), 10);
          const newS = Math.max(Math.min(s + (i % 2 !== 0 ? i * 5 : 0), 90), 10);
          const newHex = hslToHex(h, newS, newL);
          colors.push({
            hex: newHex,
            rgb: hexToRgb(newHex),
            hsl: formatHSL(h, newS, newL)
          });
        }
        break;
        
      case 'triadic':
        // Triadic: three colors equally spaced around the color wheel
        for (let i = 1; i <= 4; i++) {
          const newHue = (h + i * 120) % 360;
          const newHex = hslToHex(newHue, s, l);
          colors.push({
            hex: newHex,
            rgb: hexToRgb(newHex),
            hsl: formatHSL(newHue, s, l)
          });
        }
        break;
        
      case 'complementary':
        // Complementary: colors directly opposite each other on the color wheel
        const complementaryHue = (h + 180) % 360;
        
        // Add variations of the base color
        for (let i = 1; i <= 2; i++) {
          const newS = Math.max(Math.min(s - i * 20, 100), 0);
          const newHex = hslToHex(h, newS, l);
          colors.push({
            hex: newHex,
            rgb: hexToRgb(newHex),
            hsl: formatHSL(h, newS, l)
          });
        }
        
        // Add complementary and its variations
        const compHex = hslToHex(complementaryHue, s, l);
        colors.push({
          hex: compHex,
          rgb: hexToRgb(compHex),
          hsl: formatHSL(complementaryHue, s, l)
        });
        
        for (let i = 1; i <= 1; i++) {
          const newS = Math.max(Math.min(s - i * 20, 100), 0);
          const newHex = hslToHex(complementaryHue, newS, l);
          colors.push({
            hex: newHex,
            rgb: hexToRgb(newHex),
            hsl: formatHSL(complementaryHue, newS, l)
          });
        }
        break;
        
      case 'split-complementary':
        // Split-complementary: base color plus two colors adjacent to its complement
        const comp = (h + 180) % 360;
        const split1 = (comp - 30 + 360) % 360;
        const split2 = (comp + 30) % 360;
        
        // Add variations of base color
        const lighter = hslToHex(h, s, Math.min(l + 15, 95));
        colors.push({
          hex: lighter,
          rgb: hexToRgb(lighter),
          hsl: formatHSL(h, s, Math.min(l + 15, 95))
        });
        
        // Add split complementary colors
        const splitHex1 = hslToHex(split1, s, l);
        colors.push({
          hex: splitHex1,
          rgb: hexToRgb(splitHex1),
          hsl: formatHSL(split1, s, l)
        });
        
        const splitHex2 = hslToHex(split2, s, l);
        colors.push({
          hex: splitHex2,
          rgb: hexToRgb(splitHex2),
          hsl: formatHSL(split2, s, l)
        });
        
        // Add a darker variant of one split color
        const darker = hslToHex(split1, s, Math.max(l - 15, 5));
        colors.push({
          hex: darker,
          rgb: hexToRgb(darker),
          hsl: formatHSL(split1, s, Math.max(l - 15, 5))
        });
        break;
    }
    
    setPalette(colors);
  };

  // Generate palette on mount and when inputs change
  useEffect(() => {
    generatePalette();
  }, [baseColor, paletteType]);

  // Copy color code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-12 h-12 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="border p-2 rounded w-28 font-mono text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Palette Type
          </label>
          <select
            value={paletteType}
            onChange={(e) => setPaletteType(e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="analogous">Analogous</option>
            <option value="monochromatic">Monochromatic</option>
            <option value="triadic">Triadic</option>
            <option value="complementary">Complementary</option>
            <option value="split-complementary">Split Complementary</option>
          </select>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Generated Palette
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {palette.map((color, index) => (
            <div key={index} className="space-y-2">
              <div 
                className="w-full aspect-square rounded-lg shadow-md border border-gray-200"
                style={{ backgroundColor: color.hex }}
              />
              <div className="text-xs font-mono">
                <div 
                  onClick={() => copyToClipboard(color.hex)}
                  className="cursor-pointer hover:bg-gray-100 p-1 rounded truncate"
                  title="Click to copy HEX"
                >
                  {color.hex}
                </div>
                <div 
                  onClick={() => copyToClipboard(color.rgb)}
                  className="cursor-pointer hover:bg-gray-100 p-1 rounded truncate"
                  title="Click to copy RGB"
                >
                  {color.rgb}
                </div>
                <div 
                  onClick={() => copyToClipboard(color.hsl)}
                  className="cursor-pointer hover:bg-gray-100 p-1 rounded truncate"
                  title="Click to copy HSL"
                >
                  {color.hsl}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator; 