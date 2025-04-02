import React, { useState } from 'react';
import { Search, Copy, AlertCircle, ExternalLink, RefreshCw, Clock, Info } from 'lucide-react';

interface HeaderResult {
  url: string;
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  redirectChain?: { url: string; statusCode: number }[];
  timing?: number;
}

const HttpHeaderViewer: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [showCommonHeaders, setShowCommonHeaders] = useState<boolean>(true);

  // Fetch HTTP headers for a URL
  const fetchHeaders = async () => {
    let validatedUrl = url.trim();
    
    if (!validatedUrl) {
      setError('Please enter a URL');
      return;
    }

    // Add protocol if missing
    if (!/^https?:\/\//i.test(validatedUrl)) {
      validatedUrl = 'https://' + validatedUrl;
      setUrl(validatedUrl);
    }

    try {
      new URL(validatedUrl);
    } catch (err) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const startTime = performance.now();
      
      // Using a CORS proxy to fetch headers
      // Note: In a production app, you'd want to use your own backend proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${validatedUrl}`;
      
      const response = await fetch(proxyUrl, {
        method: 'HEAD',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const endTime = performance.now();
      const timing = endTime - startTime;
      
      // Extract headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      setResult({
        url: validatedUrl,
        statusCode: response.status,
        statusText: response.statusText,
        headers,
        timing
      });
      
      // Add to recent URLs
      if (!recentUrls.includes(validatedUrl)) {
        setRecentUrls(prev => [validatedUrl, ...prev].slice(0, 5)); // Keep only the 5 most recent
      }
    } catch (err) {
      setError(`Error fetching headers: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHeaders();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllHeaders = () => {
    if (result) {
      const formattedHeaders = Object.entries(result.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      copyToClipboard(formattedHeaders);
    }
  };

  const getStatusClass = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800';
    if (statusCode >= 300 && statusCode < 400) return 'bg-blue-100 text-blue-800';
    if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-100 text-yellow-800';
    if (statusCode >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Filter headers based on common category or show all
  const getFilteredHeaders = (): [string, string][] => {
    if (!result || !result.headers) return [];
    
    const entries = Object.entries(result.headers);
    
    if (!showCommonHeaders) {
      return entries.sort((a, b) => a[0].localeCompare(b[0]));
    }
    
    // Common header categories
    const commonHeadersMap: Record<string, RegExp[]> = {
      'content': [/^content-/i],
      'caching': [/^cache-/i, /^expires$/i, /^age$/i, /^etag$/i, /^last-modified$/i],
      'security': [/^strict-transport-security$/i, /^content-security-policy/i, /^x-xss-protection$/i, /^x-frame-options$/i, /^x-content-type-options$/i],
      'cors': [/^access-control-/i],
      'server': [/^server$/i, /^x-powered-by$/i, /^via$/i],
      'other': [/.*/]
    };
    
    const categorizedHeaders: Record<string, [string, string][]> = {
      'content': [],
      'caching': [],
      'security': [],
      'cors': [],
      'server': [],
      'other': []
    };
    
    // Categorize each header
    entries.forEach(entry => {
      let categorized = false;
      
      for (const [category, patterns] of Object.entries(commonHeadersMap)) {
        if (category === 'other') continue;
        
        for (const pattern of patterns) {
          if (pattern.test(entry[0])) {
            categorizedHeaders[category].push(entry);
            categorized = true;
            break;
          }
        }
        
        if (categorized) break;
      }
      
      if (!categorized) {
        categorizedHeaders['other'].push(entry);
      }
    });
    
    // Combine all categories, with headers in each category sorted alphabetically
    return [
      ...categorizedHeaders['content'].sort((a, b) => a[0].localeCompare(b[0])),
      ...categorizedHeaders['caching'].sort((a, b) => a[0].localeCompare(b[0])),
      ...categorizedHeaders['security'].sort((a, b) => a[0].localeCompare(b[0])),
      ...categorizedHeaders['cors'].sort((a, b) => a[0].localeCompare(b[0])),
      ...categorizedHeaders['server'].sort((a, b) => a[0].localeCompare(b[0])),
      ...categorizedHeaders['other'].sort((a, b) => a[0].localeCompare(b[0]))
    ];
  };

  // Get the category for a header
  const getHeaderCategory = (header: string): string => {
    const headerLower = header.toLowerCase();
    
    if (headerLower.startsWith('content-')) return 'Content';
    if (headerLower.startsWith('cache-') || ['expires', 'age', 'etag', 'last-modified'].includes(headerLower)) 
      return 'Caching';
    if (
      headerLower === 'strict-transport-security' || 
      headerLower.startsWith('content-security-policy') || 
      headerLower === 'x-xss-protection' || 
      headerLower === 'x-frame-options' || 
      headerLower === 'x-content-type-options'
    ) return 'Security';
    if (headerLower.startsWith('access-control-')) return 'CORS';
    if (['server', 'x-powered-by', 'via'].includes(headerLower)) return 'Server';
    
    return 'Other';
  };

  // Function to show the meaning of a header
  const getHeaderDescription = (header: string): string => {
    const headerDescriptions: Record<string, string> = {
      'content-type': 'The MIME type of the content',
      'content-length': 'The size of the response body in bytes',
      'cache-control': 'Directives for caching mechanisms',
      'expires': 'When the content should be considered stale',
      'etag': 'Entity tag for identifying specific versions of a resource',
      'last-modified': 'The date and time the resource was last modified',
      'set-cookie': 'Set a cookie for the client',
      'strict-transport-security': 'Force browsers to use HTTPS',
      'content-security-policy': 'Controls which resources can be loaded',
      'x-xss-protection': 'Filters for cross-site scripting attacks',
      'x-frame-options': 'Controls whether a page can be displayed in a frame',
      'x-content-type-options': 'Prevents MIME type sniffing',
      'access-control-allow-origin': 'Which origins can access the resource (CORS)',
      'server': 'Information about the server software',
      'x-powered-by': 'Technology that powers the server',
    };
    
    return headerDescriptions[header.toLowerCase()] || '';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <div className="flex">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a URL (e.g., https://example.com)"
              className="flex-grow p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 flex items-center"
            >
              <Search className="h-4 w-4 mr-1" />
              Fetch
            </button>
          </div>
        </div>
      </form>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Fetching HTTP headers...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          <span>
            {error}
            {error.includes('cors-anywhere') && (
              <span className="block mt-1">
                Note: This tool uses a third-party CORS proxy. You may need to 
                <a 
                  href="https://cors-anywhere.herokuapp.com/corsdemo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-700 font-medium underline mx-1"
                >
                  request temporary access
                </a>
                to the demo server.
              </span>
            )}
          </span>
        </div>
      )}

      {recentUrls.length > 0 && !result && !loading && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Recent URLs
          </h3>
          <div className="bg-gray-50 border rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {recentUrls.map((recentUrl, index) => (
                <div 
                  key={index} 
                  className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                  onClick={() => {
                    setUrl(recentUrl);
                    setTimeout(fetchHeaders, 0);
                  }}
                >
                  <div className="flex items-center">
                    <ExternalLink className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-mono text-sm truncate">{recentUrl}</span>
                  </div>
                  <RefreshCw className="h-3 w-3 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg border p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <div className="flex items-center mb-2 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 mr-3">Response Info</h3>
                <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusClass(result.statusCode)}`}>
                  {result.statusCode} {result.statusText}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{result.timing ? `${Math.round(result.timing)}ms` : 'N/A'}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <span className="text-xs text-gray-500 mr-2">URL</span>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-blue-600 hover:text-blue-800 truncate flex-grow"
                >
                  {result.url}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">
                HTTP Headers ({Object.keys(result.headers).length})
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCommonHeaders(!showCommonHeaders)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showCommonHeaders ? 'Show Alphabetically' : 'Group by Category'}
                </button>
                <button
                  onClick={copyAllHeaders}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy All
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border overflow-hidden">
              <div className="divide-y divide-gray-200">
                {getFilteredHeaders().map(([key, value], index) => {
                  const category = showCommonHeaders ? getHeaderCategory(key) : null;
                  const description = getHeaderDescription(key);
                  
                  // Add category label before first header of each category
                  const prevCategory = index > 0 ? getHeaderCategory(getFilteredHeaders()[index - 1][0]) : null;
                  const showCategoryLabel = showCommonHeaders && category !== prevCategory;
                  
                  return (
                    <React.Fragment key={key}>
                      {showCategoryLabel && (
                        <div className="bg-gray-100 px-4 py-1 text-xs font-medium text-gray-700">
                          {category}
                        </div>
                      )}
                      <div className="p-3 hover:bg-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="font-mono text-sm font-medium text-gray-800">{key}</div>
                            {description && (
                              <div className="text-xs text-gray-500 mt-0.5">{description}</div>
                            )}
                            <div className="font-mono text-sm text-gray-600 mt-1 break-all">{value}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(`${key}: ${value}`)}
                            className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center h-6"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About HTTP Headers</h3>
        <p>
          HTTP headers allow the client and server to pass additional information with an HTTP request or response.
          Headers contain valuable information about the request/response, browser, server, and more.
        </p>
        <p className="mt-1">
          Common uses for checking HTTP headers include:
        </p>
        <ul className="mt-1 list-disc list-inside">
          <li>Debugging redirects and status codes</li>
          <li>Examining caching behavior</li>
          <li>Checking security headers</li>
          <li>Identifying server technologies</li>
          <li>Verifying CORS settings</li>
        </ul>
        <p className="mt-1">
          <strong>Note:</strong> This tool uses a proxy to bypass CORS restrictions when fetching headers.
        </p>
      </div>
    </div>
  );
};

export default HttpHeaderViewer; 