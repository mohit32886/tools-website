import React, { useState } from 'react';

const HtmlEscape: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setError('');
  };

  const handleModeChange = (newMode: 'escape' | 'unescape') => {
    setMode(newMode);
    setOutput('');
    setError('');
  };

  const escapeHtml = (text: string): string => {
    const textArea = document.createElement('textarea');
    textArea.innerText = text;
    return textArea.innerHTML;
  };

  const unescapeHtml = (html: string): string => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  };

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'escape') {
        setOutput(escapeHtml(input));
      } else {
        setOutput(unescapeHtml(input));
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
    escape: [
      '<div class="example">Hello & welcome!</div>',
      'X < Y && Y > Z',
      '<script>alert("XSS!")</script>',
    ],
    unescape: [
      '&lt;div class=&quot;example&quot;&gt;Hello &amp; welcome!&lt;/div&gt;',
      'X &lt; Y &amp;&amp; Y &gt; Z',
      '&lt;script&gt;alert(&quot;XSS!&quot;)&lt;/script&gt;',
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
            mode === 'escape'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => handleModeChange('escape')}
        >
          Escape HTML
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === 'unescape'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => handleModeChange('unescape')}
        >
          Unescape HTML
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'escape' ? 'HTML to Escape' : 'HTML to Unescape'}
        </label>
        <textarea
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          rows={5}
          value={input}
          onChange={handleInputChange}
          placeholder={
            mode === 'escape'
              ? 'Enter HTML to escape...'
              : 'Enter escaped HTML to unescape...'
          }
        />
      </div>

      <div className="flex justify-between">
        <div className="space-x-2">
          <button
            onClick={handleProcess}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {mode === 'escape' ? 'Escape' : 'Unescape'}
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
              {mode === 'escape' ? 'Escaped HTML' : 'Unescaped HTML'}
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
        <h3 className="font-medium text-blue-700 mb-2">Common HTML Entities</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1">Character</th>
                  <th className="text-left py-1">Entity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>&lt;</td>
                  <td>&amp;lt;</td>
                </tr>
                <tr>
                  <td>&gt;</td>
                  <td>&amp;gt;</td>
                </tr>
                <tr>
                  <td>&amp;</td>
                  <td>&amp;amp;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1">Character</th>
                  <th className="text-left py-1">Entity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>&quot;</td>
                  <td>&amp;quot;</td>
                </tr>
                <tr>
                  <td>&#39;</td>
                  <td>&amp;#39;</td>
                </tr>
                <tr>
                  <td>©</td>
                  <td>&amp;copy;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlEscape; 