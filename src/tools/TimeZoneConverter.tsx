import React, { useState, useEffect } from 'react';
import { Clock, Copy, RotateCcw } from 'lucide-react';

interface TimeZone {
  name: string;
  offset: string;
  value: string;
}

const TimeZoneConverter: React.FC = () => {
  const [sourceDate, setSourceDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [sourceTime, setSourceTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [sourceTimeZone, setSourceTimeZone] = useState<string>('UTC');
  const [targetTimeZone, setTargetTimeZone] = useState<string>('America/New_York');
  const [convertedTime, setConvertedTime] = useState<string>('');
  const [recentConversions, setRecentConversions] = useState<Array<{
    from: string;
    to: string;
    sourceDateTime: string;
    targetDateTime: string;
  }>>([]);

  const timeZones: TimeZone[] = [
    { name: 'UTC', offset: '+00:00', value: 'UTC' },
    { name: 'US Eastern (EST/EDT)', offset: '-05:00/-04:00', value: 'America/New_York' },
    { name: 'US Central (CST/CDT)', offset: '-06:00/-05:00', value: 'America/Chicago' },
    { name: 'US Mountain (MST/MDT)', offset: '-07:00/-06:00', value: 'America/Denver' },
    { name: 'US Pacific (PST/PDT)', offset: '-08:00/-07:00', value: 'America/Los_Angeles' },
    { name: 'London (GMT/BST)', offset: '+00:00/+01:00', value: 'Europe/London' },
    { name: 'Paris (CET/CEST)', offset: '+01:00/+02:00', value: 'Europe/Paris' },
    { name: 'Berlin (CET/CEST)', offset: '+01:00/+02:00', value: 'Europe/Berlin' },
    { name: 'Mumbai (IST)', offset: '+05:30', value: 'Asia/Kolkata' },
    { name: 'Singapore (SGT)', offset: '+08:00', value: 'Asia/Singapore' },
    { name: 'Tokyo (JST)', offset: '+09:00', value: 'Asia/Tokyo' },
    { name: 'Sydney (AEST/AEDT)', offset: '+10:00/+11:00', value: 'Australia/Sydney' },
    { name: 'Auckland (NZST/NZDT)', offset: '+12:00/+13:00', value: 'Pacific/Auckland' },
  ];

  const convertTime = () => {
    try {
      // Construct the source date and time in the source timezone
      const sourceDateTime = new Date(`${sourceDate}T${sourceTime}:00`);
      const sourceTimezoneDate = new Date(sourceDateTime.toLocaleString('en-US', {
        timeZone: sourceTimeZone,
      }));
      
      // Get source timezone offset in minutes
      const sourceOffset = sourceTimezoneDate.getTimezoneOffset();
      
      // Apply the source timezone offset
      const utcTime = new Date(sourceDateTime.getTime() - sourceOffset * 60000);
      
      // Convert to target timezone
      const targetTime = new Date(utcTime.toLocaleString('en-US', {
        timeZone: targetTimeZone,
      }));
      
      // Format the result
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'long',
      };
      
      const formattedTime = targetTime.toLocaleString('en-US', {
        ...options,
        timeZone: targetTimeZone,
      });
      
      setConvertedTime(formattedTime);
      
      // Add to recent conversions
      const newConversion = {
        from: sourceTimeZone,
        to: targetTimeZone,
        sourceDateTime: sourceDateTime.toLocaleString('en-US', {
          ...options,
          timeZone: sourceTimeZone,
        }),
        targetDateTime: formattedTime,
      };
      
      setRecentConversions(prev => [newConversion, ...prev.slice(0, 4)]);
    } catch (error) {
      setConvertedTime('Error: Invalid date or time format');
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    setSourceDate(now.toISOString().slice(0, 10));
    setSourceTime(now.toTimeString().slice(0, 5));
  };

  const swapTimeZones = () => {
    setSourceTimeZone(targetTimeZone);
    setTargetTimeZone(sourceTimeZone);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    // Try to detect user's timezone
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimeZone) {
        setSourceTimeZone(userTimeZone);
      }
    } catch (error) {
      // Fallback to UTC if detection fails
      setSourceTimeZone('UTC');
    }
    
    // Initial conversion
    convertTime();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Date
            </label>
            <input
              type="date"
              value={sourceDate}
              onChange={(e) => setSourceDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Time
            </label>
            <input
              type="time"
              value={sourceTime}
              onChange={(e) => setSourceTime(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Time Zone
            </label>
            <select
              value={sourceTimeZone}
              onChange={(e) => setSourceTimeZone(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeZones.map((tz) => (
                <option key={`source-${tz.value}`} value={tz.value}>
                  {tz.name} ({tz.offset})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={getCurrentTime}
              className="bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 flex items-center gap-1 text-sm"
            >
              <Clock className="h-4 w-4" />
              Current Time
            </button>
            
            <button
              onClick={swapTimeZones}
              className="bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 flex items-center gap-1 text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Swap
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Time Zone
            </label>
            <select
              value={targetTimeZone}
              onChange={(e) => setTargetTimeZone(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeZones.map((tz) => (
                <option key={`target-${tz.value}`} value={tz.value}>
                  {tz.name} ({tz.offset})
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-4">
            <button
              onClick={convertTime}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Convert Time
            </button>
          </div>
        </div>
      </div>
      
      {convertedTime && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Converted Time
            </h3>
            <button
              onClick={() => copyToClipboard(convertedTime)}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </button>
          </div>
          <div className="font-medium text-lg">{convertedTime}</div>
        </div>
      )}
      
      {recentConversions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Recent Conversions
          </h3>
          <div className="space-y-2">
            {recentConversions.map((conversion, index) => (
              <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg border">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{conversion.from} → {conversion.to}</span>
                  <button
                    onClick={() => copyToClipboard(`${conversion.sourceDateTime} → ${conversion.targetDateTime}`)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <div>{conversion.sourceDateTime}</div>
                  <div className="font-medium">→ {conversion.targetDateTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">Time Zone Information</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Time zones with two offsets (e.g., -05:00/-04:00) indicate standard/daylight saving time.</li>
          <li>The displayed time respects daylight saving time rules for each region.</li>
          <li>UTC (Coordinated Universal Time) is the primary time standard and doesn't observe daylight saving time.</li>
        </ul>
      </div>
    </div>
  );
};

export default TimeZoneConverter; 