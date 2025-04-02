import React, { useState } from 'react';

const TextCounter: React.FC = () => {
  const [text, setText] = useState('');

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Type or paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-4">
        <div className="flex-1 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Words</p>
          <p className="text-2xl font-bold">{wordCount}</p>
        </div>
        <div className="flex-1 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Characters</p>
          <p className="text-2xl font-bold">{charCount}</p>
        </div>
      </div>
    </div>
  );
}

export default TextCounter;