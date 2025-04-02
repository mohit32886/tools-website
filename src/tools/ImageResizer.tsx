import React, { useState } from 'react';

const ImageResizer: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer text-blue-500 hover:text-blue-600"
        >
          Click to upload an image
        </label>
      </div>

      {imageUrl && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Width: {width}px
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Height: {height}px
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={maintainAspectRatio}
              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
            />
            <span>Maintain Aspect Ratio</span>
          </label>

          <div className="border rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Preview"
              style={{ width, height, objectFit: maintainAspectRatio ? 'contain' : 'fill' }}
              className="bg-gray-100"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ImageResizer;