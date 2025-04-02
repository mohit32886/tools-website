import React, { useState, useEffect } from 'react';
import { Copy, AlertCircle, Check, Info } from 'lucide-react';

interface RegexMatch {
  index: number;
  text: string;
  groups: string[];
}

interface RegexReference {
  pattern: string;
  description: string;
}

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<string>('g');
  const [testText, setTestText] = useState<string>('');
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState<string>('');
  const [showReference, setShowReference] = useState<boolean>(false);
  const [matchesCount, setMatchesCount] = useState<number>(0);
  const [matchesDetails, setMatchesDetails] = useState<string>('');
  const [selectedReference, setSelectedReference] = useState<RegexReference | null>(null);

  // Common regex patterns for reference
  const regexReferences: RegexReference[] = [
    { pattern: '[0-9]+', description: 'Match one or more digits' },
    { pattern: '[a-zA-Z]+', description: 'Match one or more letters' },
    { pattern: '\\w+', description: 'Match one or more word characters (alphanumeric + underscore)' },
    { pattern: '\\d+', description: 'Match one or more digits (same as [0-9]+)' },
    { pattern: '\\s+', description: 'Match one or more whitespace characters' },
    { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', description: 'Basic email validation' },
    { pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$', description: 'URL validation' },
    { pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$', description: 'Password with at least 1 uppercase, 1 lowercase, 1 number, 8+ chars' },
    { pattern: '^\\d{3}-\\d{3}-\\d{4}$', description: 'US phone number (XXX-XXX-XXXX format)' },
    { pattern: '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', description: 'UUID format' },
  ];

  // Map of regex flags and their descriptions
  const flagDescriptions: Record<string, string> = {
    'g': 'Global match (find all matches)',
    'i': 'Case-insensitive matching',
    'm': 'Multiline mode (^ and $ match start/end of line)',
    's': 'Dot matches newline characters',
    'u': 'Unicode support',
    'y': 'Sticky mode (search from lastIndex)'
  };

  useEffect(() => {
    if (!pattern || !testText) {
      setMatches([]);
      setMatchesCount(0);
      setMatchesDetails('');
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setError('');

      const foundMatches: RegexMatch[] = [];
      let match;
      let count = 0;

      if (flags.includes('g')) {
        // Global matching
        while ((match = regex.exec(testText)) !== null) {
          const groups = match.slice(1);
          foundMatches.push({
            index: match.index,
            text: match[0],
            groups: groups
          });
          count++;
          
          // Avoid infinite loops for zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        // Single match
        match = regex.exec(testText);
        if (match) {
          const groups = match.slice(1);
          foundMatches.push({
            index: match.index,
            text: match[0],
            groups: groups
          });
          count = 1;
        }
      }

      setMatches(foundMatches);
      setMatchesCount(count);

      // Generate match details
      if (count > 0) {
        let details = `Found ${count} match${count !== 1 ? 'es' : ''}`;
        if (foundMatches.some(m => m.groups.length > 0)) {
          details += ' with capturing groups';
        }
        setMatchesDetails(details);
      } else {
        setMatchesDetails('No matches found');
      }
    } catch (err) {
      setError(`Invalid regex: ${err instanceof Error ? err.message : String(err)}`);
      setMatches([]);
      setMatchesCount(0);
      setMatchesDetails('');
    }
  }, [pattern, flags, testText]);

  const toggleFlag = (flag: string) => {
    setFlags(prevFlags => 
      prevFlags.includes(flag) 
        ? prevFlags.replace(flag, '') 
        : prevFlags + flag
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const applyReferencePattern = (reference: RegexReference) => {
    setPattern(reference.pattern);
    setSelectedReference(reference);
  };

  const highlightMatches = () => {
    if (!testText || matches.length === 0) return testText;

    // Sort matches by index in descending order to avoid issues when inserting HTML
    const sortedMatches = [...matches].sort((a, b) => b.index - a.index);

    let result = testText;
    for (const match of sortedMatches) {
      const { index, text } = match;
      const before = result.substring(0, index);
      const after = result.substring(index + text.length);
      result = `${before}<mark class="bg-yellow-200">${text}</mark>${after}`;
    }

    return result;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regular Expression
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="flex-grow p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="bg-gray-100 px-2 py-2 border-t border-b border-r rounded-r-lg text-gray-700">
              /{flags}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Flags
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(flagDescriptions).map(([flag, description]) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                className={`px-2 py-1 text-sm rounded ${
                  flags.includes(flag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={description}
              >
                {flag}
              </button>
            ))}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {flags.split('').map(f => flagDescriptions[f]).join(', ')}
          </div>
        </div>

        {error && (
          <div className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Text
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to test against the regex..."
            className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Result{matches.length > 0 ? ` (${matchesCount} match${matchesCount !== 1 ? 'es' : ''})` : ''}
            </label>
            <button
              onClick={() => setShowReference(!showReference)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Info className="h-3 w-3 mr-1" />
              {showReference ? 'Hide Reference' : 'Show Regex Reference'}
            </button>
          </div>

          {testText && matches.length > 0 ? (
            <div className="space-y-4">
              <div
                className="p-3 border rounded-lg bg-gray-50 overflow-auto max-h-48"
                dangerouslySetInnerHTML={{ __html: highlightMatches() }}
              />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Match Details</h3>
                {matches.map((match, idx) => (
                  <div key={idx} className="p-2 border rounded bg-white">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Match #{idx + 1} at index {match.index}</span>
                      <button
                        onClick={() => copyToClipboard(match.text)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="font-mono text-sm break-all">{match.text}</div>
                    
                    {match.groups.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Capturing Groups</h4>
                        {match.groups.map((group, groupIdx) => (
                          <div key={groupIdx} className="flex items-start py-1">
                            <span className="text-xs bg-gray-200 px-1 rounded mr-2">
                              ${groupIdx + 1}
                            </span>
                            <span className="font-mono text-xs">{group || '(empty)'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : testText ? (
            <div className="p-3 border rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
              No matches found
            </div>
          ) : (
            <div className="p-3 border rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
              Enter a pattern and test text to see results
            </div>
          )}
        </div>
      </div>
      
      {showReference && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Common Regex Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {regexReferences.map((ref, idx) => (
              <button
                key={idx}
                onClick={() => applyReferencePattern(ref)}
                className={`p-2 text-left text-sm border rounded-lg hover:bg-blue-50 ${
                  selectedReference?.pattern === ref.pattern 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="font-mono text-xs mb-1">{ref.pattern}</div>
                <div className="text-gray-600 text-xs">{ref.description}</div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Regex Cheat Sheet
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div><code>.</code> - Any character except newline</div>
              <div><code>\w</code> - Word character [A-Za-z0-9_]</div>
              <div><code>\d</code> - Digit [0-9]</div>
              <div><code>\s</code> - Whitespace character</div>
              <div><code>^</code> - Start of string/line</div>
              <div><code>$</code> - End of string/line</div>
              <div><code>*</code> - 0 or more</div>
              <div><code>+</code> - 1 or more</div>
              <div><code>?</code> - 0 or 1 (optional)</div>
              <div><code>{"{n}"}</code> - Exactly n times</div>
              <div><code>{"{n,}"}</code> - n or more times</div>
              <div><code>{"{n,m}"}</code> - Between n and m times</div>
              <div><code>|</code> - Alternation (OR)</div>
              <div><code>()</code> - Capturing group</div>
              <div><code>(?:)</code> - Non-capturing group</div>
              <div><code>[abc]</code> - Character class (a or b or c)</div>
              <div><code>[^abc]</code> - Negated character class</div>
              <div><code>\b</code> - Word boundary</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About Regular Expressions</h3>
        <p>
          Regular expressions (regex) are powerful patterns used to match character combinations in strings.
          They are widely used for text validation, search and replace operations, and text extraction.
        </p>
      </div>
    </div>
  );
};

export default RegexTester; 