import React, { useState, useEffect } from 'react';

const QrCodeGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (text) {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
      setQrUrl(url);
    } else {
      setQrUrl('');
    }
  }, [text]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text or URL..."
        className="w-full px-3 py-2 border rounded-lg"
      />

      {qrUrl && (
        <div className="flex justify-center">
          <img src={qrUrl} alt="QR Code" className="border rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default QrCodeGenerator;