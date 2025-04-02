import React, { useState, useEffect } from 'react';
import { Search, MapPin, Copy, AlertCircle, Server, Globe, Info } from 'lucide-react';

interface IpData {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  continent_code?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  org?: string;
  asn?: string;
  timezone?: string;
  success?: boolean;
  message?: string;
}

const IpAddressLookup: React.FC = () => {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [myIp, setMyIp] = useState<string>('');

  // Fetch user's IP on component mount
  useEffect(() => {
    fetchMyIp();
  }, []);

  const fetchMyIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setMyIp(data.ip);
    } catch (err) {
      console.error('Error fetching IP:', err);
    }
  };

  const lookupIp = async (ip: string) => {
    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }

    setLoading(true);
    setError('');
    setIpData(null);

    try {
      // Using ipapi.co as a free IP geolocation API
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Invalid IP address');
      }
      
      setIpData({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country_name: data.country_name,
        country_code: data.country_code,
        continent_code: data.continent_code,
        latitude: data.latitude,
        longitude: data.longitude,
        isp: data.org,
        timezone: data.timezone,
        asn: data.asn
      });
    } catch (err) {
      setError(`Error looking up IP: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupIp(ipAddress);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const lookupMyIp = () => {
    if (myIp) {
      setIpAddress(myIp);
      lookupIp(myIp);
    }
  };

  const getGoogleMapsLink = () => {
    if (ipData?.latitude && ipData?.longitude) {
      return `https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}`;
    }
    return '#';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IP Address
          </label>
          <div className="flex">
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Enter an IP address (e.g., 8.8.8.8)"
              className="flex-grow p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$"
              title="Please enter a valid IPv4 or IPv6 address"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 flex items-center"
            >
              <Search className="h-4 w-4 mr-1" />
              Lookup
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={lookupMyIp}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg flex items-center"
          >
            <Info className="h-4 w-4 mr-1" />
            {myIp ? `Lookup My IP (${myIp})` : 'Lookup My IP'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading IP data...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {ipData && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg border p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800">IP Information</h3>
              <button
                onClick={() => copyToClipboard(ipData.ip)}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy IP
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">IP Address</div>
                  <div className="font-mono">{ipData.ip}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    <Globe className="h-3 w-3 inline mr-1" />
                    Location
                  </div>
                  <div>
                    {[
                      ipData.city,
                      ipData.region,
                      ipData.country_name,
                    ].filter(Boolean).join(', ')}
                    {ipData.country_code && ` (${ipData.country_code})`}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Coordinates
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      {ipData.latitude !== undefined && ipData.longitude !== undefined
                        ? `${ipData.latitude.toFixed(4)}, ${ipData.longitude.toFixed(4)}`
                        : 'N/A'}
                    </span>
                    {ipData.latitude !== undefined && ipData.longitude !== undefined && (
                      <a
                        href={getGoogleMapsLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View on Map
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    <Server className="h-3 w-3 inline mr-1" />
                    ISP / Organization
                  </div>
                  <div>{ipData.isp || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">ASN</div>
                  <div>{ipData.asn || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Timezone</div>
                  <div>{ipData.timezone || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About IP Address Lookup</h3>
        <p>
          This tool allows you to look up geographical information, ISP details, and other data
          associated with an IP address. You can enter any valid IPv4 or IPv6 address, or check your own IP.
        </p>
        <p className="mt-1">
          Please note that IP geolocation is not always 100% accurate, especially for IPs that use proxies or VPNs.
          The accuracy is generally better at country level than at city level.
        </p>
      </div>
    </div>
  );
};

export default IpAddressLookup; 