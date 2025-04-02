import React, { useState } from 'react';

const TextFormatter: React.FC = () => {
  const [text, setText] = useState('');
  const [formattedText, setFormattedText] = useState('');

  // Text formatting functions
  const formatUpperCase = () => setFormattedText(text.toUpperCase());
  const formatLowerCase = () => setFormattedText(text.toLowerCase());
  const formatTitleCase = () => {
    const result = text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    setFormattedText(result);
  };
  
  const formatSentenceCase = () => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const result = sentences
      .map(sentence => {
        if (sentence.length === 0) return '';
        return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
      })
      .join(' ');
    setFormattedText(result);
  };
  
  const formatRemoveExtraSpaces = () => {
    setFormattedText(text.replace(/\s+/g, ' ').trim());
  };

  const formatTrim = () => {
    setFormattedText(text.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter text to format
        </label>
        <textarea
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button 
          onClick={formatUpperCase}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          UPPERCASE
        </button>
        <button 
          onClick={formatLowerCase}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          lowercase
        </button>
        <button 
          onClick={formatTitleCase}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Title Case
        </button>
        <button 
          onClick={formatSentenceCase}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Sentence case
        </button>
        <button 
          onClick={formatRemoveExtraSpaces}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Remove Extra Spaces
        </button>
        <button 
          onClick={formatTrim}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Trim
        </button>
      </div>

      {formattedText && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formatted text
          </label>
          <div className="border p-3 rounded-lg bg-gray-50 min-h-[80px] whitespace-pre-wrap">
            {formattedText}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(formattedText);
            }}
            className="mt-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-300"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default TextFormatter; 