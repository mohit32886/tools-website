import React, { useState, useEffect } from 'react';

interface TimeSpan {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalInDays: number;
  totalInHours: number;
  totalInMinutes: number;
  totalInSeconds: number;
}

const DateCalculator: React.FC = () => {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(formattedToday);
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(formattedToday);
  const [endTime, setEndTime] = useState('00:00');
  const [timeDifference, setTimeDifference] = useState<TimeSpan | null>(null);
  const [includeTime, setIncludeTime] = useState(false);
  const [calculationType, setCalculationType] = useState<'difference' | 'add' | 'subtract'>('difference');
  const [durationValue, setDurationValue] = useState('1');
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [resultDate, setResultDate] = useState<string | null>(null);

  const calculateTimeDifference = () => {
    const startDateTime = new Date(`${startDate}T${startTime || '00:00'}`);
    const endDateTime = new Date(`${endDate}T${endTime || '00:00'}`);
    
    // Time difference in milliseconds
    const differenceMs = endDateTime.getTime() - startDateTime.getTime();
    
    if (differenceMs < 0) {
      alert('End date must be after start date');
      return;
    }
    
    // Convert to various units
    const totalInSeconds = Math.floor(differenceMs / 1000);
    const totalInMinutes = Math.floor(totalInSeconds / 60);
    const totalInHours = Math.floor(totalInMinutes / 60);
    const totalInDays = Math.floor(totalInHours / 24);
    
    // Breakdown
    const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((differenceMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((differenceMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((differenceMs % (1000 * 60)) / 1000);
    
    setTimeDifference({
      days,
      hours,
      minutes,
      seconds,
      totalInDays,
      totalInHours,
      totalInMinutes,
      totalInSeconds
    });
  };

  const calculateDate = () => {
    const startDateTime = new Date(`${startDate}T${startTime || '00:00'}`);
    const value = parseInt(durationValue, 10);
    
    if (isNaN(value) || value <= 0) {
      alert('Please enter a valid positive number for duration');
      return;
    }
    
    let resultDateTime = new Date(startDateTime);
    
    if (calculationType === 'add') {
      // Add duration
      switch (durationUnit) {
        case 'days':
          resultDateTime.setDate(resultDateTime.getDate() + value);
          break;
        case 'weeks':
          resultDateTime.setDate(resultDateTime.getDate() + (value * 7));
          break;
        case 'months':
          resultDateTime.setMonth(resultDateTime.getMonth() + value);
          break;
        case 'years':
          resultDateTime.setFullYear(resultDateTime.getFullYear() + value);
          break;
      }
    } else if (calculationType === 'subtract') {
      // Subtract duration
      switch (durationUnit) {
        case 'days':
          resultDateTime.setDate(resultDateTime.getDate() - value);
          break;
        case 'weeks':
          resultDateTime.setDate(resultDateTime.getDate() - (value * 7));
          break;
        case 'months':
          resultDateTime.setMonth(resultDateTime.getMonth() - value);
          break;
        case 'years':
          resultDateTime.setFullYear(resultDateTime.getFullYear() - value);
          break;
      }
    }
    
    // Format the result date
    const resultDateStr = resultDateTime.toISOString().split('T')[0];
    const resultTimeStr = includeTime 
      ? resultDateTime.toISOString().split('T')[1].substring(0, 5) 
      : '';
    
    setResultDate(
      includeTime 
        ? `${resultDateStr} at ${resultTimeStr}` 
        : resultDateStr
    );
  };

  const handleCalculate = () => {
    if (calculationType === 'difference') {
      calculateTimeDifference();
      setResultDate(null);
    } else {
      calculateDate();
      setTimeDifference(null);
    }
  };

  useEffect(() => {
    // Reset results when calculation type changes
    setTimeDifference(null);
    setResultDate(null);
  }, [calculationType]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calculation Type
          </label>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={calculationType === 'difference'}
                onChange={() => setCalculationType('difference')}
              />
              <span className="ml-2">Calculate time between dates</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={calculationType === 'add'}
                onChange={() => setCalculationType('add')}
              />
              <span className="ml-2">Add time to date</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={calculationType === 'subtract'}
                onChange={() => setCalculationType('subtract')}
              />
              <span className="ml-2">Subtract time from date</span>
            </label>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {calculationType === 'difference' ? 'Start Date' : 'Date'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>
          
          {includeTime && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {calculationType === 'difference' ? 'Start Time' : 'Time'}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
          )}
          
          {calculationType === 'difference' ? (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
              
              {includeTime && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex items-end gap-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <input
                  type="number"
                  min="1"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  className="border rounded p-2 w-24"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as any)}
                  className="border rounded p-2"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="include-time"
            checked={includeTime}
            onChange={(e) => setIncludeTime(e.target.checked)}
            className="form-checkbox"
          />
          <label htmlFor="include-time" className="text-sm text-gray-700">
            Include time in calculation
          </label>
        </div>
        
        <button
          onClick={handleCalculate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Calculate
        </button>
      </div>
      
      {timeDifference && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium mb-3">Time Difference</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-600 text-xs">Days</p>
              <p className="text-2xl font-semibold">{timeDifference.days}</p>
            </div>
            
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-600 text-xs">Hours</p>
              <p className="text-2xl font-semibold">{timeDifference.hours}</p>
            </div>
            
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-600 text-xs">Minutes</p>
              <p className="text-2xl font-semibold">{timeDifference.minutes}</p>
            </div>
            
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-600 text-xs">Seconds</p>
              <p className="text-2xl font-semibold">{timeDifference.seconds}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Total Time</h4>
            <ul className="text-sm space-y-1">
              <li><span className="text-gray-600">Total days:</span> {timeDifference.totalInDays}</li>
              <li><span className="text-gray-600">Total hours:</span> {timeDifference.totalInHours}</li>
              <li><span className="text-gray-600">Total minutes:</span> {timeDifference.totalInMinutes}</li>
              <li><span className="text-gray-600">Total seconds:</span> {timeDifference.totalInSeconds}</li>
            </ul>
          </div>
        </div>
      )}
      
      {resultDate && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium mb-3">Result Date</h3>
          <p className="text-xl font-semibold">{resultDate}</p>
        </div>
      )}
    </div>
  );
};

export default DateCalculator; 