import React, { useState } from 'react';
import { Search, Server, Copy, AlertCircle, Database, RefreshCw } from 'lucide-react';

// DNS record types
type RecordType = 'A' | 'AAAA' | 'MX' | 'CNAME' | 'TXT' | 'NS' | 'SOA';

interface DnsResponse {
  status: 'success' | 'error';
  answer?: any[];
  message?: string;
}

const DnsLookup: React.FC = () => {
  const [domain, setDomain] = useState<string>('');
  const [recordType, setRecordType] = useState<RecordType>('A');
  const [dnsResult, setDnsResult] = useState<DnsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [recentLookups, setRecentLookups] = useState<{ domain: string; type: RecordType }[]>([]);

  // DNS lookup API call
  const performDnsLookup = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name');
      return;
    }

    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      setError('Please enter a valid domain name');
      return;
    }

    setLoading(true);
    setError('');
    setDnsResult(null);

    try {
      // Using DNS lookup API (this is a free public API for DNS lookups)
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=${recordType}`);
      const data = await response.json();
      
      if (data.Status === 0 || data.Status === 3) { // 0 = No Error, 3 = NXDOMAIN (non-existent domain)
        if (data.Answer || data.Authority) {
          setDnsResult({
            status: 'success',
            answer: data.Answer || data.Authority
          });
        } else if (data.Status === 3) {
          setError(`Domain '${domain}' not found`);
        } else {
          setError(`No ${recordType} records found for ${domain}`);
        }
      } else {
        setError(`DNS lookup failed with status code: ${data.Status}`);
      }

      // Add to recent lookups
      if (!recentLookups.some(item => item.domain === domain && item.type === recordType)) {
        setRecentLookups(prev => [{
          domain,
          type: recordType
        }, ...prev].slice(0, 5)); // Keep only the 5 most recent
      }
    } catch (err) {
      setError(`Error performing DNS lookup: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performDnsLookup();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRecordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecordType(e.target.value as RecordType);
  };

  const formatRecordData = (record: any): string => {
    if (!record || !record.data) return 'N/A';
    
    // MX records have priority + target
    if (recordType === 'MX') {
      const parts = record.data.split(' ');
      if (parts.length >= 2) {
        return `Priority: ${parts[0]}, Target: ${parts.slice(1).join(' ')}`;
      }
    }
    
    // TXT records often have quotes
    if (recordType === 'TXT') {
      return record.data.replace(/^"(.*)"$/, '$1');
    }
    
    return record.data;
  };

  const getRecordTypeName = (type: number): string => {
    const recordTypes: Record<number, string> = {
      1: 'A',
      2: 'NS',
      5: 'CNAME',
      6: 'SOA',
      15: 'MX',
      16: 'TXT',
      28: 'AAAA'
    };
    
    return recordTypes[type] || `Type ${type}`;
  };

  const lookupDomainWithType = (domain: string, type: RecordType) => {
    setDomain(domain);
    setRecordType(type);
    
    // Use setTimeout to ensure state is updated before performing lookup
    setTimeout(() => {
      performDnsLookup();
    }, 0);
  };

  // DNS record type descriptions
  const recordTypeDescriptions: Record<RecordType, string> = {
    'A': 'Maps a domain to an IPv4 address',
    'AAAA': 'Maps a domain to an IPv6 address',
    'CNAME': 'Maps a domain to another domain (alias)',
    'MX': 'Specifies mail servers for the domain',
    'TXT': 'Contains text information (often used for verification)',
    'NS': 'Specifies authoritative name servers for the domain',
    'SOA': 'Start of Authority - Contains administrative information'
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase())}
            placeholder="Enter a domain (e.g., example.com)"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Record Type
          </label>
          <div className="flex gap-2">
            <select
              value={recordType}
              onChange={handleRecordTypeChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="A">A (IPv4 Address)</option>
              <option value="AAAA">AAAA (IPv6 Address)</option>
              <option value="CNAME">CNAME (Canonical Name)</option>
              <option value="MX">MX (Mail Exchange)</option>
              <option value="TXT">TXT (Text)</option>
              <option value="NS">NS (Name Server)</option>
              <option value="SOA">SOA (Start of Authority)</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap"
            >
              <Search className="h-4 w-4 mr-1" />
              Lookup
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {recordTypeDescriptions[recordType]}
          </p>
        </div>
      </form>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Performing DNS lookup...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {dnsResult?.answer && dnsResult.answer.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              DNS Records for {domain} ({recordType})
            </h3>
            <button
              onClick={() => copyToClipboard(JSON.stringify(dnsResult.answer, null, 2))}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy All
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600">Type</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600">Value</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600">TTL</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dnsResult.answer.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getRecordTypeName(record.type)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 font-mono break-all">
                      {formatRecordData(record)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {record.TTL} sec
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      <button
                        onClick={() => copyToClipboard(record.data)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recentLookups.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Recent Lookups
          </h3>
          <div className="bg-gray-50 border rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {recentLookups.map((item, index) => (
                <div 
                  key={index} 
                  className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                  onClick={() => lookupDomainWithType(item.domain, item.type)}
                >
                  <div className="flex items-center">
                    <Server className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium">{item.domain}</span>
                    <span className="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                      {item.type}
                    </span>
                  </div>
                  <RefreshCw className="h-3 w-3 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About DNS Lookup</h3>
        <p>
          DNS (Domain Name System) is the phonebook of the internet. It translates human-readable domain 
          names to IP addresses that computers use to identify each other.
        </p>
        <p className="mt-1">
          Different record types serve different purposes:
        </p>
        <ul className="mt-1 list-disc list-inside">
          <li><strong>A/AAAA:</strong> Maps domains to IPv4/IPv6 addresses</li>
          <li><strong>CNAME:</strong> Creates domain aliases</li>
          <li><strong>MX:</strong> Directs email to mail servers</li>
          <li><strong>TXT:</strong> Stores text notes (often for verification)</li>
          <li><strong>NS:</strong> Specifies name servers for the domain</li>
        </ul>
      </div>
    </div>
  );
};

export default DnsLookup; 