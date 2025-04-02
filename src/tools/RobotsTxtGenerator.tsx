import React, { useState, useEffect } from 'react';
import { Copy, Bot, Globe, Plus, X, Download, Check, AlertCircle, Info } from 'lucide-react';

interface UserAgent {
  name: string;
  disallow: string[];
  allow: string[];
}

interface Sitemap {
  url: string;
}

interface CrawlDelay {
  agent: string;
  delay: string;
}

const RobotsTxtGenerator: React.FC = () => {
  const [userAgents, setUserAgents] = useState<UserAgent[]>([
    { name: '*', disallow: [], allow: [] }
  ]);
  const [sitemaps, setSitemaps] = useState<Sitemap[]>([{ url: '' }]);
  const [crawlDelays, setCrawlDelays] = useState<CrawlDelay[]>([]);
  const [host, setHost] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [newDisallow, setNewDisallow] = useState<Record<number, string>>({});
  const [newAllow, setNewAllow] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [showExamples, setShowExamples] = useState<boolean>(false);
  
  useEffect(() => {
    generateRobotsTxt();
  }, [userAgents, sitemaps, crawlDelays, host]);

  const generateRobotsTxt = () => {
    let content = '';
    
    // Add user agents with their allow/disallow rules
    userAgents.forEach(agent => {
      if (agent.name) {
        content += `User-agent: ${agent.name}\n`;
        
        // Add disallow rules
        agent.disallow.forEach(path => {
          if (path) content += `Disallow: ${path}\n`;
        });
        
        // Add allow rules
        agent.allow.forEach(path => {
          if (path) content += `Allow: ${path}\n`;
        });
        
        // Add crawl delay if exists for this agent
        const delay = crawlDelays.find(d => d.agent === agent.name);
        if (delay && delay.delay) {
          content += `Crawl-delay: ${delay.delay}\n`;
        }
        
        content += '\n';
      }
    });
    
    // Add host if provided
    if (host) {
      content += `Host: ${host}\n\n`;
    }
    
    // Add sitemaps
    sitemaps.forEach(sitemap => {
      if (sitemap.url) content += `Sitemap: ${sitemap.url}\n`;
    });
    
    setGeneratedContent(content);
  };

  const handleAddUserAgent = () => {
    setUserAgents([...userAgents, { name: '', disallow: [], allow: [] }]);
  };

  const handleRemoveUserAgent = (index: number) => {
    const newUserAgents = [...userAgents];
    newUserAgents.splice(index, 1);
    setUserAgents(newUserAgents);
    
    // Also remove any crawl delays for this agent
    const agentName = userAgents[index].name;
    const newCrawlDelays = crawlDelays.filter(d => d.agent !== agentName);
    setCrawlDelays(newCrawlDelays);
  };

  const handleUserAgentChange = (index: number, value: string) => {
    const newUserAgents = [...userAgents];
    newUserAgents[index].name = value;
    setUserAgents(newUserAgents);
    
    // Update any crawl delays with the old name
    const oldName = userAgents[index].name;
    if (oldName) {
      const newCrawlDelays = [...crawlDelays];
      const delayIndex = newCrawlDelays.findIndex(d => d.agent === oldName);
      if (delayIndex !== -1) {
        newCrawlDelays[delayIndex].agent = value;
        setCrawlDelays(newCrawlDelays);
      }
    }
  };

  const handleAddDisallow = (agentIndex: number) => {
    if (newDisallow[agentIndex]) {
      const newUserAgents = [...userAgents];
      newUserAgents[agentIndex].disallow.push(newDisallow[agentIndex]);
      setUserAgents(newUserAgents);
      
      // Clear the input
      setNewDisallow({ ...newDisallow, [agentIndex]: '' });
    }
  };

  const handleRemoveDisallow = (agentIndex: number, pathIndex: number) => {
    const newUserAgents = [...userAgents];
    newUserAgents[agentIndex].disallow.splice(pathIndex, 1);
    setUserAgents(newUserAgents);
  };

  const handleAddAllow = (agentIndex: number) => {
    if (newAllow[agentIndex]) {
      const newUserAgents = [...userAgents];
      newUserAgents[agentIndex].allow.push(newAllow[agentIndex]);
      setUserAgents(newUserAgents);
      
      // Clear the input
      setNewAllow({ ...newAllow, [agentIndex]: '' });
    }
  };

  const handleRemoveAllow = (agentIndex: number, pathIndex: number) => {
    const newUserAgents = [...userAgents];
    newUserAgents[agentIndex].allow.splice(pathIndex, 1);
    setUserAgents(newUserAgents);
  };

  const handleAddSitemap = () => {
    setSitemaps([...sitemaps, { url: '' }]);
  };

  const handleRemoveSitemap = (index: number) => {
    const newSitemaps = [...sitemaps];
    newSitemaps.splice(index, 1);
    setSitemaps(newSitemaps);
  };

  const handleSitemapChange = (index: number, value: string) => {
    const newSitemaps = [...sitemaps];
    newSitemaps[index].url = value;
    setSitemaps(newSitemaps);
  };

  const handleAddCrawlDelay = (agentName: string) => {
    if (!crawlDelays.some(d => d.agent === agentName)) {
      setCrawlDelays([...crawlDelays, { agent: agentName, delay: '' }]);
    }
  };

  const handleCrawlDelayChange = (agent: string, value: string) => {
    const newCrawlDelays = [...crawlDelays];
    const index = newCrawlDelays.findIndex(d => d.agent === agent);
    if (index !== -1) {
      newCrawlDelays[index].delay = value;
      setCrawlDelays(newCrawlDelays);
    }
  };

  const handleRemoveCrawlDelay = (agent: string) => {
    const newCrawlDelays = crawlDelays.filter(d => d.agent !== agent);
    setCrawlDelays(newCrawlDelays);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'robots.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAddTemplate = (template: 'standard' | 'disallow-all' | 'allow-all' | 'wordpress' | 'e-commerce') => {
    switch (template) {
      case 'standard':
        setUserAgents([
          { 
            name: '*', 
            disallow: ['/wp-admin/', '/wp-includes/', '/cgi-bin/', '/wp-content/plugins/', '/wp-content/themes/'], 
            allow: [] 
          }
        ]);
        setSitemaps([{ url: 'https://example.com/sitemap.xml' }]);
        setCrawlDelays([{ agent: '*', delay: '10' }]);
        setHost('example.com');
        break;
        
      case 'disallow-all':
        setUserAgents([
          { name: '*', disallow: ['/'], allow: [] }
        ]);
        setSitemaps([{ url: '' }]);
        setCrawlDelays([]);
        setHost('');
        break;
        
      case 'allow-all':
        setUserAgents([
          { name: '*', disallow: [], allow: ['/'] }
        ]);
        setSitemaps([{ url: 'https://example.com/sitemap.xml' }]);
        setCrawlDelays([]);
        setHost('example.com');
        break;
        
      case 'wordpress':
        setUserAgents([
          { 
            name: '*', 
            disallow: [
              '/wp-admin/', 
              '/wp-includes/', 
              '/wp-content/plugins/', 
              '/wp-content/themes/',
              '/wp-login.php',
              '/wp-json/',
              '/?s=',
              '/search/',
              '/author/'
            ], 
            allow: ['/wp-admin/admin-ajax.php'] 
          }
        ]);
        setSitemaps([{ url: 'https://example.com/sitemap_index.xml' }]);
        setCrawlDelays([{ agent: '*', delay: '10' }]);
        setHost('example.com');
        break;
        
      case 'e-commerce':
        setUserAgents([
          { 
            name: '*', 
            disallow: [
              '/cart/',
              '/checkout/',
              '/my-account/',
              '/wishlist/',
              '/product-category/*?*',
              '/shop/*?*',
              '/wp-admin/',
              '/search/',
              '/tag/',
              '/*?add-to-cart=*',
              '/*?filtering=*',
              '/*?orderby=*'
            ], 
            allow: [] 
          }
        ]);
        setSitemaps([{ url: 'https://example.com/sitemap_index.xml' }]);
        setCrawlDelays([{ agent: '*', delay: '5' }]);
        setHost('example.com');
        break;
    }
    
    setShowExamples(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="lg:w-1/2 space-y-4">
          {/* User Agents Section */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Bot className="h-4 w-4 mr-1" />
                User Agents & Rules
              </h3>
              <button
                type="button"
                onClick={handleAddUserAgent}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add User Agent
              </button>
            </div>

            {userAgents.map((agent, agentIndex) => (
              <div key={agentIndex} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex-grow mr-2">
                    <input
                      type="text"
                      value={agent.name}
                      onChange={(e) => handleUserAgentChange(agentIndex, e.target.value)}
                      placeholder="User agent name (e.g., * or Googlebot)"
                      className="w-full p-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {userAgents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUserAgent(agentIndex)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Disallow Rules */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Disallow Paths
                  </label>
                  <div className="space-y-1">
                    {agent.disallow.map((path, pathIndex) => (
                      <div key={pathIndex} className="flex items-center">
                        <input
                          type="text"
                          value={path}
                          onChange={(e) => {
                            const newUserAgents = [...userAgents];
                            newUserAgents[agentIndex].disallow[pathIndex] = e.target.value;
                            setUserAgents(newUserAgents);
                          }}
                          className="flex-grow p-1.5 text-sm border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDisallow(agentIndex, pathIndex)}
                          className="bg-gray-200 p-1.5 rounded-r hover:bg-gray-300"
                        >
                          <X className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      value={newDisallow[agentIndex] || ''}
                      onChange={(e) => setNewDisallow({ ...newDisallow, [agentIndex]: e.target.value })}
                      placeholder="Add path (e.g., /admin/ or /private/)"
                      className="flex-grow p-1.5 text-sm border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddDisallow(agentIndex)}
                      className="bg-gray-200 p-1.5 rounded-r hover:bg-gray-300"
                    >
                      <Plus className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Allow Rules */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Allow Paths (optional)
                  </label>
                  <div className="space-y-1">
                    {agent.allow.map((path, pathIndex) => (
                      <div key={pathIndex} className="flex items-center">
                        <input
                          type="text"
                          value={path}
                          onChange={(e) => {
                            const newUserAgents = [...userAgents];
                            newUserAgents[agentIndex].allow[pathIndex] = e.target.value;
                            setUserAgents(newUserAgents);
                          }}
                          className="flex-grow p-1.5 text-sm border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAllow(agentIndex, pathIndex)}
                          className="bg-gray-200 p-1.5 rounded-r hover:bg-gray-300"
                        >
                          <X className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      value={newAllow[agentIndex] || ''}
                      onChange={(e) => setNewAllow({ ...newAllow, [agentIndex]: e.target.value })}
                      placeholder="Add path (e.g., /public/)"
                      className="flex-grow p-1.5 text-sm border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddAllow(agentIndex)}
                      className="bg-gray-200 p-1.5 rounded-r hover:bg-gray-300"
                    >
                      <Plus className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Crawl Delay */}
                {crawlDelays.some(d => d.agent === agent.name) ? (
                  <div className="mb-2">
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Crawl Delay (seconds)
                        </label>
                        <input
                          type="number"
                          value={crawlDelays.find(d => d.agent === agent.name)?.delay || ''}
                          onChange={(e) => handleCrawlDelayChange(agent.name, e.target.value)}
                          min="0"
                          step="1"
                          className="w-full p-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCrawlDelay(agent.name)}
                        className="text-gray-500 hover:text-red-500 mb-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddCrawlDelay(agent.name)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    + Add Crawl Delay
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Host & Sitemaps Section */}
          <div className="bg-white border rounded-lg p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="h-4 w-4 inline mr-1" />
                Host (optional)
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="example.com"
                className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Specifies the preferred domain for your site
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sitemaps
                </label>
                <button
                  type="button"
                  onClick={handleAddSitemap}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Sitemap
                </button>
              </div>
              
              <div className="space-y-2">
                {sitemaps.map((sitemap, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={sitemap.url}
                      onChange={(e) => handleSitemapChange(index, e.target.value)}
                      placeholder="https://example.com/sitemap.xml"
                      className="flex-grow p-2 text-sm border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {sitemaps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSitemap(index)}
                        className="bg-gray-200 p-2 rounded-r hover:bg-gray-300"
                      >
                        <X className="h-4 w-4 text-gray-700" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Pre-made Templates</h3>
              <button
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showExamples ? 'Hide Examples' : 'Show Examples'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAddTemplate('standard')}
                className="p-2 text-xs border rounded bg-gray-50 hover:bg-gray-100"
              >
                Standard Template
              </button>
              <button
                type="button"
                onClick={() => handleAddTemplate('disallow-all')}
                className="p-2 text-xs border rounded bg-gray-50 hover:bg-gray-100"
              >
                Disallow All
              </button>
              <button
                type="button"
                onClick={() => handleAddTemplate('allow-all')}
                className="p-2 text-xs border rounded bg-gray-50 hover:bg-gray-100"
              >
                Allow All
              </button>
              <button
                type="button"
                onClick={() => handleAddTemplate('wordpress')}
                className="p-2 text-xs border rounded bg-gray-50 hover:bg-gray-100"
              >
                WordPress
              </button>
              <button
                type="button"
                onClick={() => handleAddTemplate('e-commerce')}
                className="p-2 text-xs border rounded bg-gray-50 hover:bg-gray-100 col-span-2"
              >
                E-commerce
              </button>
            </div>
            
            {showExamples && (
              <div className="mt-3 text-xs space-y-2">
                <div className="p-2 border rounded bg-gray-50">
                  <strong>Standard:</strong> Basic template with common exclusions for system directories
                </div>
                <div className="p-2 border rounded bg-gray-50">
                  <strong>Disallow All:</strong> Prevents all robots from indexing your entire site
                </div>
                <div className="p-2 border rounded bg-gray-50">
                  <strong>Allow All:</strong> Explicitly allows all robots to index your entire site
                </div>
                <div className="p-2 border rounded bg-gray-50">
                  <strong>WordPress:</strong> Optimized for WordPress sites, blocking admin areas and system files
                </div>
                <div className="p-2 border rounded bg-gray-50">
                  <strong>E-commerce:</strong> For online stores, blocking cart, checkout, and filtered pages
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:w-1/2 space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Generated robots.txt</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`text-xs px-2 py-1 rounded flex items-center ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 text-gray-100 p-4 rounded-lg min-h-[300px] overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{generatedContent || 'Your robots.txt will appear here'}</pre>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
            <h3 className="font-medium mb-1">About robots.txt</h3>
            <p>
              The robots.txt file is a standard used by websites to communicate with web crawlers and other web robots.
              It specifies which areas of the site should not be processed or scanned.
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
                  <Info className="h-3 w-3 text-blue-700" />
                </div>
                <span><strong>User-agent:</strong> Specifies which robot the rules apply to (* means all robots)</span>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
                  <Info className="h-3 w-3 text-blue-700" />
                </div>
                <span><strong>Disallow:</strong> Paths that should not be accessed by the robot</span>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
                  <Info className="h-3 w-3 text-blue-700" />
                </div>
                <span><strong>Allow:</strong> Exceptions to Disallow rules (not supported by all robots)</span>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
                  <Info className="h-3 w-3 text-blue-700" />
                </div>
                <span><strong>Sitemap:</strong> URL to the site's XML sitemap</span>
              </div>
            </div>
            <div className="mt-2">
              <AlertCircle className="h-3 w-3 inline mr-1 text-yellow-600" />
              <span className="text-yellow-600">
                <strong>Note:</strong> robots.txt is a guideline for bots, not a security measure. Malicious bots may ignore it.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotsTxtGenerator; 