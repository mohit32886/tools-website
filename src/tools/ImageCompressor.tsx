import React, { useState, useRef } from 'react';
import { X, Upload, Download, Image as ImageIcon, Check } from 'lucide-react';

const ImageCompressor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [compressionComplete, setCompressionComplete] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (file: File) => {
    if (!file) return;

    // Reset states
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setError('');
    setCompressionComplete(false);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setFileName(file.name);
    setFileType(file.type);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setOriginalImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const compressImage = () => {
    if (!originalImage) return;

    setIsCompressing(true);
    setError('');

    try {
      const img = new Image();
      img.src = originalImage;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio if width exceeds maxWidth
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not get canvas context');
          setIsCompressing(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob and then to base64
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError('Failed to compress image');
              setIsCompressing(false);
              return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target && typeof e.target.result === 'string') {
                setCompressedImage(e.target.result);
                setCompressedSize(blob.size);
                setIsCompressing(false);
                setCompressionComplete(true);
              }
            };
            reader.readAsDataURL(blob);
          },
          fileType || 'image/jpeg',
          quality / 100
        );
      };

      img.onerror = () => {
        setError('Failed to load image');
        setIsCompressing(false);
      };
    } catch (err) {
      setError(`Error compressing image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsCompressing(false);
    }
  };

  const downloadCompressedImage = () => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage;
    
    // Create a download filename
    const extension = fileType.split('/')[1] || 'jpg';
    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    const newFilename = nameWithoutExt 
      ? `${nameWithoutExt}-compressed.${extension}`
      : `compressed-image.${extension}`;
    
    link.download = newFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = (): string => {
    if (!originalSize || !compressedSize) return '0%';
    const saving = 100 - (compressedSize / originalSize) * 100;
    return `${saving.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : originalImage 
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!originalImage ? handleFileInput : undefined}
        style={{ cursor: !originalImage ? 'pointer' : 'default' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
          className="hidden"
        />

        {!originalImage ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-700">
              Drag and drop an image here, or click to select a file
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPG, PNG, GIF, WebP (up to 5MB)
            </p>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => {
                setOriginalImage(null);
                setCompressedImage(null);
                setFileName('');
                setFileType('');
                setCompressionComplete(false);
              }}
              className="absolute top-0 right-0 bg-white p-1 rounded-full shadow"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Original</h3>
                <div className="relative aspect-video flex items-center justify-center overflow-hidden bg-gray-100 rounded">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {fileName} ({formatFileSize(originalSize)})
                </p>
              </div>
              
              {compressedImage && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Compressed</h3>
                  <div className="relative aspect-video flex items-center justify-center overflow-hidden bg-gray-100 rounded">
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {formatFileSize(compressedSize)} ({calculateSavings()} smaller)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {originalImage && !compressedImage && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">
                Quality ({quality}%)
              </label>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">
                Max Width ({maxWidth}px)
              </label>
            </div>
            <input
              type="range"
              min="320"
              max="3840"
              step="160"
              value={maxWidth}
              onChange={(e) => setMaxWidth(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>320px</span>
              <span>3840px</span>
            </div>
          </div>

          <button
            onClick={compressImage}
            disabled={isCompressing}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isCompressing ? 'Compressing...' : 'Compress Image'}
          </button>
        </div>
      )}

      {compressionComplete && (
        <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
          <div className="flex items-center text-green-800">
            <Check className="h-5 w-5 mr-2" />
            <span>
              Compressed successfully! Saved {calculateSavings()} ({formatFileSize(originalSize - compressedSize)})
            </span>
          </div>
          <button
            onClick={downloadCompressedImage}
            className="flex items-center bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Download</span>
          </button>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• All processing happens in your browser. Your images are never uploaded to any server.</p>
        <p>• For best results, adjust the quality slider to find the optimal balance between file size and image quality.</p>
      </div>
    </div>
  );
};

export default ImageCompressor; 