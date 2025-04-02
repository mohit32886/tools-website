import React, { useState } from 'react';

const ColorPicker: React.FC = () => {
  const [color, setColor] = useState('#000000');

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-20 h-20"
        />
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">Selected Color</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColorPicker;