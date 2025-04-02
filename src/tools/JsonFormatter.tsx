import React, { useState } from 'react';

const JsonFormatter: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = () => {
    try {
      if (!jsonInput.trim()) {
        setError('Please enter JSON to format');
        setFormattedJson('');
        return;
      }

      const parsedJson = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsedJson, null, indentSize);
      setFormattedJson(formatted);
      setError(null);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      setFormattedJson('');
    }
  };

  const minifyJson = () => {
    try {
      if (!jsonInput.trim()) {
        setError('Please enter JSON to minify');
        setFormattedJson('');
        return;
      }

      const parsedJson = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsedJson);
      setFormattedJson(minified);
      setError(null);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      setFormattedJson('');
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then(
      text => {
        setJsonInput(text);
        try {
          const parsedJson = JSON.parse(text);
          setError(null);
        } catch (err) {
          // Don't set error on paste, wait for format button
        }
      },
      err => setError('Failed to read from clipboard')
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter JSON
        </label>
        <div className="relative">
          <textarea
            className="w-full h-48 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"example": "Paste your JSON here"}'
          />
          <button
            onClick={handlePaste}
            className="absolute top-2 right-2 bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
          >
            Paste
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-700 mr-2">
            Indent Size:
          </label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="border rounded p-1 text-sm"
          >
            <option value="2">2 Spaces</option>
            <option value="4">4 Spaces</option>
            <option value="8">8 Spaces</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={formatJson}
            className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Format JSON
          </button>
          <button
            onClick={minifyJson}
            className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
          >
            Minify JSON
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {formattedJson && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Formatted JSON
            </label>
            <button
              onClick={() => {
                navigator.clipboard.writeText(formattedJson);
              }}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300"
            >
              Copy to Clipboard
            </button>
          </div>
          <pre className="bg-gray-50 p-3 rounded-lg border overflow-x-auto text-sm font-mono whitespace-pre">
            {formattedJson}
          </pre>
        </div>
      )}
    </div>
  );
};

export default JsonFormatter; 