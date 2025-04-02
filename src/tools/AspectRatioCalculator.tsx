import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

// GCD for simplifying aspect ratios
const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

// Function to simplify an aspect ratio
const simplifyRatio = (width: number, height: number): [number, number] => {
  if (width === 0 || height === 0) return [0, 0];
  const divisor = gcd(width, height);
  return [width / divisor, height / divisor];
};

const AspectRatioCalculator: React.FC = () => {
  // Source dimensions
  const [originalWidth, setOriginalWidth] = useState<number>(1920);
  const [originalHeight, setOriginalHeight] = useState<number>(1080);

  // Target dimensions
  const [targetWidth, setTargetWidth] = useState<number | null>(null);
  const [targetHeight, setTargetHeight] = useState<number | null>(null);
  
  // Calculated dimensions
  const [calculatedWidth, setCalculatedWidth] = useState<number | null>(null);
  const [calculatedHeight, setCalculatedHeight] = useState<number | null>(null);

  // Lock aspect ratio
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  
  // Last modified field
  const [lastModified, setLastModified] = useState<'width' | 'height'>('width');

  // Common presets
  const presets = [
    { name: '16:9 (FHD)', width: 1920, height: 1080 },
    { name: '16:10', width: 1600, height: 1000 },
    { name: '4:3', width: 1024, height: 768 },
    { name: '1:1 (Square)', width: 1000, height: 1000 },
    { name: '9:16 (Mobile)', width: 1080, height: 1920 },
    { name: 'HD (720p)', width: 1280, height: 720 },
    { name: '2K (QHD)', width: 2560, height: 1440 },
    { name: '4K (UHD)', width: 3840, height: 2160 },
  ];

  // Calculate when dimensions change
  useEffect(() => {
    if (lockRatio && (targetWidth !== null || targetHeight !== null)) {
      if (lastModified === 'width' && targetWidth !== null) {
        const ratio = originalHeight / originalWidth;
        setCalculatedHeight(Math.round(targetWidth * ratio));
      } else if (lastModified === 'height' && targetHeight !== null) {
        const ratio = originalWidth / originalHeight;
        setCalculatedWidth(Math.round(targetHeight * ratio));
      }
    }
  }, [targetWidth, targetHeight, originalWidth, originalHeight, lockRatio, lastModified]);

  // Apply a preset
  const applyPreset = (width: number, height: number) => {
    setOriginalWidth(width);
    setOriginalHeight(height);
    setTargetWidth(null);
    setTargetHeight(null);
    setCalculatedWidth(null);
    setCalculatedHeight(null);
  };

  // Handle inputs
  const handleOriginalWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : 0;
    setOriginalWidth(value);
  };

  const handleOriginalHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : 0;
    setOriginalHeight(value);
  };

  const handleTargetWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setTargetWidth(value);
    setLastModified('width');
    
    if (lockRatio && value !== null) {
      const ratio = originalHeight / originalWidth;
      setCalculatedHeight(Math.round(value * ratio));
    }
  };

  const handleTargetHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setTargetHeight(value);
    setLastModified('height');
    
    if (lockRatio && value !== null) {
      const ratio = originalWidth / originalHeight;
      setCalculatedWidth(Math.round(value * ratio));
    }
  };

  // Swap width and height
  const swapDimensions = () => {
    setOriginalWidth(originalHeight);
    setOriginalHeight(originalWidth);
    
    if (targetWidth !== null && targetHeight !== null) {
      setTargetWidth(targetHeight);
      setTargetHeight(targetWidth);
    }
    
    if (calculatedWidth !== null && calculatedHeight !== null) {
      setCalculatedWidth(calculatedHeight);
      setCalculatedHeight(calculatedWidth);
    }
  };

  // Reset all fields
  const resetFields = () => {
    setTargetWidth(null);
    setTargetHeight(null);
    setCalculatedWidth(null);
    setCalculatedHeight(null);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Format the aspect ratio
  const formatAspectRatio = (): string => {
    const [width, height] = simplifyRatio(originalWidth, originalHeight);
    return `${width}:${height}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Original Dimensions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                min="1"
                value={originalWidth}
                onChange={handleOriginalWidthChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                min="1"
                value={originalHeight}
                onChange={handleOriginalHeightChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={swapDimensions}
                className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                <span>Swap</span>
              </button>
              <button
                onClick={resetFields}
                className="text-blue-600 hover:underline text-sm"
              >
                Reset
              </button>
            </div>
            
            <div className="text-sm bg-blue-50 px-3 py-1 rounded">
              <span className="font-medium">Ratio: </span>
              <span 
                className="cursor-pointer hover:text-blue-600"
                onClick={() => copyToClipboard(formatAspectRatio())}
                title="Click to copy"
              >
                {formatAspectRatio()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">New Dimensions</h3>
          
          <div>
            <label className="inline-flex items-center cursor-pointer mb-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={lockRatio}
                onChange={() => setLockRatio(!lockRatio)}
              />
              <span className="ml-2 text-sm text-gray-700">Lock aspect ratio</span>
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                min="1"
                value={targetWidth !== null ? targetWidth : ''}
                onChange={handleTargetWidthChange}
                placeholder="Enter width"
                className="w-full p-2 border rounded-lg"
              />
              {calculatedWidth !== null && (
                <div className="mt-1 text-xs text-green-600">
                  Calculated: {calculatedWidth}px
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                min="1"
                value={targetHeight !== null ? targetHeight : ''}
                onChange={handleTargetHeightChange}
                placeholder="Enter height"
                className="w-full p-2 border rounded-lg"
              />
              {calculatedHeight !== null && (
                <div className="mt-1 text-xs text-green-600">
                  Calculated: {calculatedHeight}px
                </div>
              )}
            </div>
          </div>
          
          {!lockRatio && (
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              Note: With aspect ratio unlocked, dimensions may become distorted.
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Common Aspect Ratios</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset.width, preset.height)}
              className="text-left p-2 border rounded hover:bg-gray-50 text-sm"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs text-gray-500">{preset.width} × {preset.height}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Result</h3>
        {(targetWidth !== null || targetHeight !== null || calculatedWidth !== null || calculatedHeight !== null) ? (
          <div className="flex flex-col md:flex-row gap-2">
            <div className="bg-gray-50 p-3 rounded-lg border flex-1">
              <div className="text-xs text-gray-600 mb-1">Final Dimensions</div>
              <div className="font-medium">
                {targetWidth !== null ? targetWidth : calculatedWidth} × {targetHeight !== null ? targetHeight : calculatedHeight} pixels
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {((targetWidth || calculatedWidth || 0) / (targetHeight || calculatedHeight || 1)).toFixed(3)} ratio
              </div>
            </div>
            
            <button
              onClick={() => copyToClipboard(`${targetWidth !== null ? targetWidth : calculatedWidth}×${targetHeight !== null ? targetHeight : calculatedHeight}`)}
              className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 md:w-auto"
            >
              <Copy className="h-4 w-4 mr-1" />
              <span>Copy Dimensions</span>
            </button>
          </div>
        ) : (
          <div className="text-gray-500 bg-gray-50 p-3 rounded-lg border">
            Enter a target width or height to see results
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium text-blue-700 mb-1">About Aspect Ratios</p>
        <p>Aspect ratio is the proportional relationship between width and height. Maintaining the same aspect ratio when resizing prevents distortion.</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>16:9 - Standard widescreen video format, common for YouTube and presentations</li>
          <li>4:3 - Traditional TV and computer monitor format</li>
          <li>1:1 - Perfect square, used for profile pictures and Instagram posts</li>
          <li>9:16 - Vertical video format, used for mobile and stories</li>
        </ul>
      </div>
    </div>
  );
};

export default AspectRatioCalculator; 