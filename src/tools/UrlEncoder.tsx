import React, { useState } from 'react';

const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setError('');
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    setOutput('');
    setError('');
  };

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
      setError('');
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Failed to process input'}`);
      setOutput('');
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput('');
    setError('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const examples = {
    encode: [
      'https://example.com/path with spaces',
      'https://example.com/search?q=hello world&lang=en',
      'User input: "name@example.com"',
    ],
    decode: [
      'https%3A%2F%2Fexample.com%2Fpath%20with%20spaces',
      'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den',
      'User%20input%3A%20%22name%40example.com%22',
    ],
  };

  const loadExample = (index: number) => {
    setInput(examples[mode][index]);
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4 mb-2">
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => handleModeChange('encode')}
        >
          Encode
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => handleModeChange('decode')}
        >
          Decode
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'encode' ? 'URL to Encode' : 'URL to Decode'}
        </label>
        <textarea
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          rows={3}
          value={input}
          onChange={handleInputChange}
          placeholder={
            mode === 'encode'
              ? 'Enter URL to encode...'
              : 'Enter encoded URL to decode...'
          }
        />
      </div>

      <div className="flex justify-between">
        <div className="space-x-2">
          <button
            onClick={handleProcess}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          {output && (
            <button
              onClick={handleSwap}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Swap
            </button>
          )}
        </div>

        <div className="space-x-2">
          <span className="text-sm text-gray-500">Examples:</span>
          {examples[mode].map((_, index) => (
            <button
              key={index}
              onClick={() => loadExample(index)}
              className="text-blue-600 hover:underline text-sm"
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
            </label>
            <button
              onClick={copyToClipboard}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border font-mono text-sm break-all whitespace-pre-wrap">
            {output}
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg text-sm">
        <h3 className="font-medium text-blue-700 mb-2">About URL Encoding</h3>
        <p className="text-blue-700 mb-2">
          URL encoding converts characters that are not allowed in URLs to URL-safe 
          representations. Special characters are replaced with a '%' followed by 
          their hexadecimal ASCII value.
        </p>
        <ul className="list-disc list-inside text-blue-700">
          <li>Space becomes %20</li>
          <li>? becomes %3F</li>
          <li>& becomes %26</li>
          <li>= becomes %3D</li>
          <li>/ becomes %2F</li>
          <li>: becomes %3A</li>
        </ul>
      </div>
    </div>
  );
};

export default UrlEncoder; 