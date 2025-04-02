import React, { useState, useEffect } from 'react';
import * as marked from 'marked';

// Set marked options for safety
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: true,
});

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState('# Hello Markdown\n\nType your **markdown** here and see the preview in real-time!\n\n- List item 1\n- List item 2\n\n```\nconst code = "formatted code block";\n```\n\n> Blockquote example\n\n[Link example](https://example.com)');
  const [html, setHtml] = useState('');

  useEffect(() => {
    setHtml(marked(markdown));
  }, [markdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Markdown
            </label>
            <button
              onClick={handleCopy}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Copy Markdown
            </button>
          </div>
          <textarea
            className="flex-1 w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
          />
        </div>
        
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Preview
            </label>
            <button
              onClick={handleCopyHtml}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Copy HTML
            </button>
          </div>
          <div 
            className="flex-1 border rounded-lg p-4 overflow-auto prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 rounded-lg border text-sm">
        <h3 className="font-medium mb-2">Markdown Cheatsheet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <div><code># Heading 1</code> - <span className="font-semibold">Heading 1</span></div>
            <div><code>## Heading 2</code> - <span className="font-semibold">Heading 2</span></div>
            <div><code>**bold**</code> - <span className="font-bold">bold</span></div>
            <div><code>*italic*</code> - <span className="italic">italic</span></div>
            <div><code>[Link](url)</code> - <span className="text-blue-600 underline">Link</span></div>
          </div>
          <div>
            <div><code>- list item</code> - Bulleted list</div>
            <div><code>1. numbered</code> - Numbered list</div>
            <div><code>![alt](image-url)</code> - Image</div>
            <div><code>```code```</code> - Code block</div>
            <div><code>&gt; quote</code> - Blockquote</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor; 