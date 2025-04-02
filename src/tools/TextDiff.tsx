import React, { useState, useEffect } from 'react';
import * as diff from 'diff';

const TextDiff: React.FC = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [diffResult, setDiffResult] = useState<any[]>([]);
  const [diffMode, setDiffMode] = useState<'chars' | 'words' | 'lines'>('words');

  useEffect(() => {
    let result;
    switch (diffMode) {
      case 'chars':
        result = diff.diffChars(leftText, rightText);
        break;
      case 'words':
        result = diff.diffWords(leftText, rightText);
        break;
      case 'lines':
        result = diff.diffLines(leftText, rightText);
        break;
      default:
        result = diff.diffWords(leftText, rightText);
    }
    setDiffResult(result);
  }, [leftText, rightText, diffMode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium">Diff Mode:</label>
          <select
            value={diffMode}
            onChange={(e) => setDiffMode(e.target.value as 'chars' | 'words' | 'lines')}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="chars">Characters</option>
            <option value="words">Words</option>
            <option value="lines">Lines</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Original Text
          </label>
          <textarea
            className="w-full h-64 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="Enter original text here..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Modified Text
          </label>
          <textarea
            className="w-full h-64 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="Enter modified text here..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Diff Result
        </label>
        <div className="border rounded-lg p-4 bg-gray-50 min-h-[150px] overflow-auto font-mono text-sm whitespace-pre-wrap">
          {diffResult.map((part, index) => {
            const color = part.added 
              ? 'bg-green-100 text-green-800' 
              : part.removed 
                ? 'bg-red-100 text-red-800' 
                : 'text-gray-800';
            
            return (
              <span key={index} className={color}>
                {part.value}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-green-100 border border-green-300 mr-1"></span>
          <span className="text-sm text-gray-600">Added</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-red-100 border border-red-300 mr-1"></span>
          <span className="text-sm text-gray-600">Removed</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-white border border-gray-300 mr-1"></span>
          <span className="text-sm text-gray-600">Unchanged</span>
        </div>
      </div>
    </div>
  );
};

export default TextDiff; 