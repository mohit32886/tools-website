import React, { useState, useEffect } from 'react';
import { Copy, Tag, Link, Image, Facebook, Twitter, Globe, AlertCircle, Info } from 'lucide-react';

interface MetaTagsState {
  title: string;
  description: string;
  keywords: string;
  author: string;
  url: string;
  imageUrl: string;
  siteName: string;
  twitterCard: string;
  twitterSite: string;
}

const MetaTagGenerator: React.FC = () => {
  const [metaTags, setMetaTags] = useState<MetaTagsState>({
    title: '',
    description: '',
    keywords: '',
    author: '',
    url: '',
    imageUrl: '',
    siteName: '',
    twitterCard: 'summary_large_image',
    twitterSite: ''
  });

  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate HTML whenever the values change
  useEffect(() => {
    generateHtml();
  }, [metaTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetaTags(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateHtml = () => {
    let html = '';
    
    // Basic meta tags
    if (metaTags.title) {
      html += `<title>${metaTags.title}</title>\n`;
      html += `<meta name="title" content="${metaTags.title}">\n`;
    }
    
    if (metaTags.description) {
      html += `<meta name="description" content="${metaTags.description}">\n`;
    }
    
    if (metaTags.keywords) {
      html += `<meta name="keywords" content="${metaTags.keywords}">\n`;
    }
    
    if (metaTags.author) {
      html += `<meta name="author" content="${metaTags.author}">\n`;
    }
    
    // Open Graph tags
    if (metaTags.title || metaTags.description || metaTags.url || metaTags.imageUrl || metaTags.siteName) {
      html += '\n<!-- Open Graph / Facebook -->\n';
      
      if (metaTags.title) {
        html += `<meta property="og:title" content="${metaTags.title}">\n`;
      }
      
      if (metaTags.description) {
        html += `<meta property="og:description" content="${metaTags.description}">\n`;
      }
      
      if (metaTags.url) {
        html += `<meta property="og:url" content="${metaTags.url}">\n`;
      }
      
      html += `<meta property="og:type" content="website">\n`;
      
      if (metaTags.imageUrl) {
        html += `<meta property="og:image" content="${metaTags.imageUrl}">\n`;
      }
      
      if (metaTags.siteName) {
        html += `<meta property="og:site_name" content="${metaTags.siteName}">\n`;
      }
    }
    
    // Twitter Card tags
    if (metaTags.title || metaTags.description || metaTags.imageUrl || metaTags.twitterCard || metaTags.twitterSite) {
      html += '\n<!-- Twitter -->\n';
      
      if (metaTags.twitterCard) {
        html += `<meta property="twitter:card" content="${metaTags.twitterCard}">\n`;
      }
      
      if (metaTags.twitterSite) {
        html += `<meta property="twitter:site" content="${metaTags.twitterSite}">\n`;
      }
      
      if (metaTags.title) {
        html += `<meta property="twitter:title" content="${metaTags.title}">\n`;
      }
      
      if (metaTags.description) {
        html += `<meta property="twitter:description" content="${metaTags.description}">\n`;
      }
      
      if (metaTags.imageUrl) {
        html += `<meta property="twitter:image" content="${metaTags.imageUrl}">\n`;
      }
    }
    
    setGeneratedHtml(html);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setMetaTags({
      title: '',
      description: '',
      keywords: '',
      author: '',
      url: '',
      imageUrl: '',
      siteName: '',
      twitterCard: 'summary_large_image',
      twitterSite: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Tag className="h-4 w-4 inline mr-1" />
            Title (required)
          </label>
          <input
            type="text"
            name="title"
            value={metaTags.title}
            onChange={handleInputChange}
            placeholder="Your page title"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Keep your title under 60 characters for better SEO
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (recommended)
          </label>
          <textarea
            name="description"
            value={metaTags.description}
            onChange={handleInputChange}
            placeholder="Brief description of your page"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">
            Aim for 150-160 characters for optimal display in search results
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Link className="h-4 w-4 inline mr-1" />
            Page URL
          </label>
          <input
            type="url"
            name="url"
            value={metaTags.url}
            onChange={handleInputChange}
            placeholder="https://example.com/page"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Image className="h-4 w-4 inline mr-1" />
            Image URL
          </label>
          <input
            type="url"
            name="imageUrl"
            value={metaTags.imageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Recommended size: 1200×630 pixels for optimal social sharing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                name="keywords"
                value={metaTags.keywords}
                onChange={handleInputChange}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                name="author"
                value={metaTags.author}
                onChange={handleInputChange}
                placeholder="Author name"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="h-4 w-4 inline mr-1" />
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                value={metaTags.siteName}
                onChange={handleInputChange}
                placeholder="Your Site Name"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Twitter className="h-4 w-4 inline mr-1" />
                  Twitter Card Type
                </label>
                <select
                  name="twitterCard"
                  value={metaTags.twitterCard}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter @username
                </label>
                <input
                  type="text"
                  name="twitterSite"
                  value={metaTags.twitterSite}
                  onChange={handleInputChange}
                  placeholder="@yourusername"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Reset Form
        </button>

        <button
          type="button" 
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg flex items-center ${
            copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Copy className="h-4 w-4 mr-1" />
          {copied ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>

      {generatedHtml && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Meta Tags</h3>
          <div className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
              <code>{generatedHtml}</code>
            </pre>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Copy and paste these tags into the <code>&lt;head&gt;</code> section of your HTML
          </p>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About Meta Tags</h3>
        <p>
          Meta tags are snippets of text that describe a page's content. They don't appear on the page itself, 
          but in the page's code. Meta tags are essentially little content descriptors that help tell search 
          engines and social media platforms what a web page is about.
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex items-start">
            <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
              <Info className="h-3 w-3 text-blue-700" />
            </div>
            <span><strong>SEO Meta Tags</strong> - Help search engines understand your content and improve visibility</span>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
              <Facebook className="h-3 w-3 text-blue-700" />
            </div>
            <span><strong>Open Graph Tags</strong> - Control how your content appears when shared on Facebook and other platforms</span>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
              <Twitter className="h-3 w-3 text-blue-700" />
            </div>
            <span><strong>Twitter Cards</strong> - Enhance the appearance of your content when shared on Twitter</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaTagGenerator; 