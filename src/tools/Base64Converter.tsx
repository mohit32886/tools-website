import React, { useState } from 'react';

const Base64Converter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (error) {
      setOutput('Invalid input');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('encode')}
          className={`flex-1 py-2 rounded-lg ${
            mode === 'encode'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`flex-1 py-2 rounded-lg ${
            mode === 'decode'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Decode
        </button>
      </div>

      <textarea
        className="w-full h-32 p-3 border rounded-lg"
        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter base64 to decode...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleConvert}
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Convert
      </button>

      <textarea
        className="w-full h-32 p-3 border rounded-lg bg-gray-50"
        value={output}
        readOnly
        placeholder="Result will appear here..."
      />
    </div>
  );
}

export default Base64Converter;