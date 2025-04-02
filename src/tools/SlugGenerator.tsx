import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Settings } from 'lucide-react';

const SlugGenerator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [settings, setSettings] = useState({
    lowercase: true,
    removeStopWords: false,
    separator: '-',
    maxLength: 100,
    removeAccents: true,
    customReplacements: [] as [string, string][]
  });
  const [recentSlugs, setRecentSlugs] = useState<Array<{ input: string; slug: string }>>([]);

  // Common English stop words
  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'am', 'was', 'were', 
    'be', 'been', 'being', 'to', 'of', 'for', 'with', 'about', 'against', 
    'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
  ];

  const removeAccents = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const generateSlug = () => {
    if (!input) return;

    let result = input;

    // Apply custom replacements first
    if (settings.customReplacements.length > 0) {
      settings.customReplacements.forEach(([pattern, replacement]) => {
        result = result.replace(new RegExp(pattern, 'g'), replacement);
      });
    }

    // Remove accents if required
    if (settings.removeAccents) {
      result = removeAccents(result);
    }

    // Convert to lowercase if required
    if (settings.lowercase) {
      result = result.toLowerCase();
    }

    // Split into words
    let words = result
      .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
      .trim()
      .split(/\s+/);

    // Remove stop words if required
    if (settings.removeStopWords) {
      words = words.filter(word => !stopWords.includes(word.toLowerCase()));
    }

    // Join with the specified separator
    result = words.join(settings.separator);

    // Trim to max length, ensuring we don't cut in the middle of a word
    if (result.length > settings.maxLength) {
      const truncated = result.substring(0, settings.maxLength);
      const lastSepIndex = truncated.lastIndexOf(settings.separator);
      if (lastSepIndex !== -1) {
        result = truncated.substring(0, lastSepIndex);
      } else {
        result = truncated;
      }
    }

    setOutput(result);

    // Add to recent slugs (avoid duplicates)
    if (!recentSlugs.some(item => item.input === input)) {
      setRecentSlugs(prev => [{
        input,
        slug: result
      }, ...prev].slice(0, 5)); // Keep only last 5
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Generate slug on input change
  useEffect(() => {
    if (input) {
      generateSlug();
    } else {
      setOutput('');
    }
  }, [input, settings]);

  // Function to add a custom replacement
  const addCustomReplacement = (pattern: string, replacement: string) => {
    if (pattern) {
      setSettings(prev => ({
        ...prev,
        customReplacements: [...prev.customReplacements, [pattern, replacement]]
      }));
    }
  };

  // Function to remove a custom replacement
  const removeCustomReplacement = (index: number) => {
    setSettings(prev => ({
      ...prev,
      customReplacements: prev.customReplacements.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text to Convert
          </label>
          <textarea
            className="w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a title or text to convert to a slug..."
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="w-4 h-4 mr-1" />
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>
          
          <button
            onClick={generateSlug}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            disabled={!input}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Slug
          </button>
        </div>

        {showAdvanced && (
          <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Slug Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.lowercase}
                    onChange={(e) => setSettings({...settings, lowercase: e.target.checked})}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Convert to lowercase</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.removeStopWords}
                    onChange={(e) => setSettings({...settings, removeStopWords: e.target.checked})}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Remove common stop words</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.removeAccents}
                    onChange={(e) => setSettings({...settings, removeAccents: e.target.checked})}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Remove accents/diacritics</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Separator</label>
                <select
                  value={settings.separator}
                  onChange={(e) => setSettings({...settings, separator: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=".">Dot (.)</option>
                  <option value="">No separator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Maximum Length</label>
                <input
                  type="number"
                  value={settings.maxLength}
                  onChange={(e) => setSettings({...settings, maxLength: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="10"
                  max="200"
                />
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Replacements</h4>
              
              {settings.customReplacements.length > 0 && (
                <div className="mb-3 space-y-2">
                  {settings.customReplacements.map((replacement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded flex-grow">
                        {replacement[0]} → {replacement[1]}
                      </div>
                      <button
                        onClick={() => removeCustomReplacement(index)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Pattern (e.g., &)"
                  className="flex-grow p-2 text-sm border rounded"
                  id="customPattern"
                />
                <span className="text-gray-500">→</span>
                <input
                  type="text"
                  placeholder="Replace with"
                  className="flex-grow p-2 text-sm border rounded"
                  id="customReplacement"
                />
                <button
                  onClick={() => {
                    const pattern = (document.getElementById('customPattern') as HTMLInputElement).value;
                    const replacement = (document.getElementById('customReplacement') as HTMLInputElement).value;
                    addCustomReplacement(pattern, replacement);
                    (document.getElementById('customPattern') as HTMLInputElement).value = '';
                    (document.getElementById('customReplacement') as HTMLInputElement).value = '';
                  }}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {output && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Generated Slug
              </label>
              <button
                onClick={() => copyToClipboard(output)}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-3 border rounded-lg font-mono text-sm break-all">
              {output}
            </div>
          </div>
        )}
      </div>

      {recentSlugs.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Recent Slugs
          </h3>
          <div className="bg-gray-50 border rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {recentSlugs.map((item, index) => (
                <div key={index} className="p-2 hover:bg-gray-100">
                  <div className="text-xs text-gray-500 mb-1 truncate">{item.input}</div>
                  <div className="flex justify-between items-center">
                    <div className="font-mono text-sm truncate">{item.slug}</div>
                    <button
                      onClick={() => copyToClipboard(item.slug)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center ml-2"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About Slugs</h3>
        <p>
          Slugs are URL-friendly versions of a string, typically used in web addresses. They are lowercase,
          use hyphens instead of spaces, and remove special characters.
        </p>
        <p className="mt-1">
          Good slugs improve SEO (Search Engine Optimization) and create more readable URLs for users.
        </p>
      </div>
    </div>
  );
};

export default SlugGenerator; 