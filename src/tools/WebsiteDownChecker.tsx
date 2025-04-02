import React, { useState } from 'react';
import { CheckCircle, Globe, AlertCircle, Clock, RefreshCw, ExternalLink, Info } from 'lucide-react';

interface CheckResult {
  url: string;
  status: number;
  statusText: string;
  isUp: boolean;
  responseTime: number;
  timestamp: string;
}

const WebsiteDownChecker: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<CheckResult[]>([]);

  const checkWebsite = async () => {
    let validatedUrl = url.trim();
    
    // Validate URL input
    if (!validatedUrl) {
      setError('Please enter a URL to check');
      return;
    }

    // Add protocol if missing
    if (!/^https?:\/\//i.test(validatedUrl)) {
      validatedUrl = 'https://' + validatedUrl;
      setUrl(validatedUrl);
    }

    try {
      new URL(validatedUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const startTime = performance.now();
      
      // Fetch the website with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
      
      // Fetch only the headers to be lighter (HEAD method)
      // We use a CORS proxy to avoid cross-origin issues
      const response = await fetch('https://cors-anywhere.herokuapp.com/' + validatedUrl, {
        method: 'HEAD',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Check if site is up based on status code
      const isUp = response.status >= 200 && response.status < 400;
      
      const result: CheckResult = {
        url: validatedUrl,
        status: response.status,
        statusText: response.statusText,
        isUp,
        responseTime,
        timestamp: new Date().toLocaleString()
      };
      
      // Add result to the top of the list
      setResults(prev => [result, ...prev].slice(0, 10)); // Keep only the last 10 results
      
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. The website may be down or responding very slowly.');
          
          const result: CheckResult = {
            url: validatedUrl,
            status: 0,
            statusText: 'Timeout',
            isUp: false,
            responseTime: 30000,
            timestamp: new Date().toLocaleString()
          };
          
          setResults(prev => [result, ...prev].slice(0, 10));
        } else {
          setError(`Error checking website: ${err.message}`);
          
          // Check if it's a CORS issue
          if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            const result: CheckResult = {
              url: validatedUrl,
              status: 0,
              statusText: 'Connection Error',
              isUp: false,
              responseTime: 0,
              timestamp: new Date().toLocaleString()
            };
            
            setResults(prev => [result, ...prev].slice(0, 10));
          }
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkWebsite();
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
    if (status >= 500 || status === 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isUp: boolean) => {
    return isUp ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusDescription = (status: number): string => {
    if (status === 0) return 'Unable to connect';
    if (status === 200) return 'OK - Website is up and running';
    if (status === 301 || status === 302 || status === 307 || status === 308) return 'Redirect';
    if (status === 400) return 'Bad Request';
    if (status === 401) return 'Unauthorized';
    if (status === 403) return 'Forbidden';
    if (status === 404) return 'Not Found';
    if (status === 429) return 'Too Many Requests';
    if (status === 500) return 'Internal Server Error';
    if (status === 502) return 'Bad Gateway';
    if (status === 503) return 'Service Unavailable';
    if (status === 504) return 'Gateway Timeout';
    
    // General categories
    if (status >= 200 && status < 300) return 'Success';
    if (status >= 300 && status < 400) return 'Redirection';
    if (status >= 400 && status < 500) return 'Client Error';
    if (status >= 500) return 'Server Error';
    
    return 'Unknown Status';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Globe className="h-4 w-4 inline mr-1" />
            Website URL
          </label>
          <div className="flex">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a URL (e.g., example.com)"
              className="flex-grow p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter a domain name or URL to check if the website is up or down
          </p>
        </div>
      </form>

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

      {results.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Check Results
          </h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {getStatusIcon(result.isUp)}
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 flex items-center"
                        >
                          {result.url}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </h4>
                      <div className="mt-1 flex items-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(result.status)}`}>
                          {result.status} {result.statusText}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {getStatusDescription(result.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-right text-gray-500">
                    <div className="flex items-center justify-end mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{result.responseTime} ms</span>
                    </div>
                    <div>{result.timestamp}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About Website Status Checker</h3>
        <p>
          This tool checks if a website is online by sending a request to the URL and analyzing the response.
          It's useful for verifying if a website is down for everyone or just for you.
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex items-start">
            <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
              <Info className="h-3 w-3 text-blue-700" />
            </div>
            <span>
              <strong>HTTP Status Codes:</strong>
              <ul className="mt-1 list-disc list-inside ml-1">
                <li><strong>2xx (200-299):</strong> Success - the website is up</li>
                <li><strong>3xx (300-399):</strong> Redirection - the page has moved</li>
                <li><strong>4xx (400-499):</strong> Client errors - like page not found (404)</li>
                <li><strong>5xx (500-599):</strong> Server errors - the website is having issues</li>
              </ul>
            </span>
          </div>
        </div>
        <p className="mt-2 text-gray-600 italic">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          Note: A website may appear "up" but still have issues with specific content or functionality.
        </p>
      </div>
    </div>
  );
};

export default WebsiteDownChecker; 