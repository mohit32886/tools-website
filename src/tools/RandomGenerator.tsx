import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

interface GeneratorOptions {
  type: 'number' | 'string' | 'uuid' | 'color' | 'name' | 'date' | 'dice';
  length?: number;
  min?: number;
  max?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  startDate?: string;
  endDate?: string;
  diceCount?: number;
  diceSides?: number;
}

const RandomGenerator: React.FC = () => {
  const [generatorType, setGeneratorType] = useState<GeneratorOptions['type']>('number');
  const [options, setOptions] = useState<GeneratorOptions>({
    type: 'number',
    min: 1,
    max: 100,
    length: 10,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
    startDate: '2000-01-01',
    endDate: new Date().toISOString().split('T')[0],
    diceCount: 2,
    diceSides: 6,
  });
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);

  const updateOption = <K extends keyof GeneratorOptions>(
    key: K,
    value: GeneratorOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const generateRandom = () => {
    let generatedValue = '';
    
    switch (options.type) {
      case 'number': {
        const min = options.min || 1;
        const max = options.max || 100;
        generatedValue = Math.floor(Math.random() * (max - min + 1) + min).toString();
        break;
      }
      
      case 'string': {
        const length = options.length || 10;
        const chars: string[] = [];
        
        if (options.includeUppercase) chars.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        if (options.includeLowercase) chars.push(...'abcdefghijklmnopqrstuvwxyz');
        if (options.includeNumbers) chars.push(...'0123456789');
        if (options.includeSymbols) chars.push(...'!@#$%^&*()_+-=[]{}|;:,.<>?');
        
        if (chars.length === 0) {
          // Default to lowercase if nothing selected
          chars.push(...'abcdefghijklmnopqrstuvwxyz');
        }
        
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
        generatedValue = result;
        break;
      }
      
      case 'uuid': {
        generatedValue = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        break;
      }
      
      case 'color': {
        const hex = Math.floor(Math.random() * 16777215).toString(16);
        generatedValue = '#' + '0'.repeat(6 - hex.length) + hex;
        break;
      }
      
      case 'name': {
        // Simple first name generator with common names
        const firstNames = [
          'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Joseph', 'Charles', 'Thomas', 'Daniel',
          'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
          'Emma', 'Olivia', 'Noah', 'Liam', 'Sophia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
        ];
        
        const lastNames = [
          'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
          'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White',
        ];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        generatedValue = `${firstName} ${lastName}`;
        break;
      }
      
      case 'date': {
        const startDate = new Date(options.startDate || '2000-01-01').getTime();
        const endDate = new Date(options.endDate || new Date().toISOString().split('T')[0]).getTime();
        
        if (startDate > endDate) {
          generatedValue = 'Error: Start date must be before end date';
        } else {
          const randomTimestamp = Math.floor(Math.random() * (endDate - startDate + 1) + startDate);
          const randomDate = new Date(randomTimestamp);
          generatedValue = randomDate.toISOString().split('T')[0];
        }
        break;
      }
      
      case 'dice': {
        const count = options.diceCount || 2;
        const sides = options.diceSides || 6;
        
        const rolls: number[] = [];
        let total = 0;
        
        for (let i = 0; i < count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          total += roll;
        }
        
        generatedValue = `[${rolls.join(', ')}] = ${total}`;
        break;
      }
    }
    
    setResult(generatedValue);
    
    // Add to history
    setHistory((prev) => {
      const newHistory = [generatedValue, ...prev].slice(0, 10);
      return newHistory;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generator Type
          </label>
          <select
            value={generatorType}
            onChange={(e) => {
              const newType = e.target.value as GeneratorOptions['type'];
              setGeneratorType(newType);
              updateOption('type', newType);
            }}
            className="w-full p-2 border rounded-lg"
          >
            <option value="number">Random Number</option>
            <option value="string">Random String</option>
            <option value="uuid">UUID</option>
            <option value="color">Random Color</option>
            <option value="name">Random Name</option>
            <option value="date">Random Date</option>
            <option value="dice">Dice Roll</option>
          </select>
        </div>
        
        {/* Options based on generator type */}
        {generatorType === 'number' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum
              </label>
              <input
                type="number"
                value={options.min}
                onChange={(e) => updateOption('min', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum
              </label>
              <input
                type="number"
                value={options.max}
                onChange={(e) => updateOption('max', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        )}
        
        {generatorType === 'string' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={options.length}
                onChange={(e) => updateOption('length', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Character Sets
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeUppercase}
                    onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Uppercase (A-Z)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeLowercase}
                    onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Lowercase (a-z)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Numbers (0-9)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeSymbols}
                    onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Symbols (!@#$%...)</span>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {generatorType === 'date' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={options.startDate}
                onChange={(e) => updateOption('startDate', e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={options.endDate}
                onChange={(e) => updateOption('endDate', e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        )}
        
        {generatorType === 'dice' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Dice
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={options.diceCount}
                onChange={(e) => updateOption('diceCount', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sides per Die
              </label>
              <select
                value={options.diceSides}
                onChange={(e) => updateOption('diceSides', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="4">4 (d4)</option>
                <option value="6">6 (d6)</option>
                <option value="8">8 (d8)</option>
                <option value="10">10 (d10)</option>
                <option value="12">12 (d12)</option>
                <option value="20">20 (d20)</option>
                <option value="100">100 (d100)</option>
              </select>
            </div>
          </div>
        )}
        
        <button
          onClick={generateRandom}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Random {generatorType === 'uuid' ? 'UUID' : generatorType.charAt(0).toUpperCase() + generatorType.slice(1)}
        </button>
      </div>
      
      {result && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              Result
            </h3>
            <button
              onClick={() => copyToClipboard(result)}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </button>
          </div>
          
          <div className="relative">
            {generatorType === 'color' ? (
              <div className="flex items-center space-x-2">
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: result }}
                ></div>
                <div className="font-mono bg-gray-50 p-2 rounded-lg border flex-grow">
                  {result}
                </div>
              </div>
            ) : (
              <div className="font-mono bg-gray-50 p-3 rounded-lg border break-all">
                {result}
              </div>
            )}
          </div>
        </div>
      )}
      
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              History
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear
            </button>
          </div>
          
          <div className="bg-gray-50 p-2 rounded-lg border max-h-40 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer flex justify-between items-center"
                  onClick={() => copyToClipboard(item)}
                  title="Click to copy"
                >
                  <span className="font-mono text-sm truncate">{item}</span>
                  <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About this generator</h3>
        <p>This tool generates various types of random data that can be useful for testing, development, or other creative purposes.</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Random Numbers: Generate integers within a specified range</li>
          <li>Random Strings: Create random character sequences with customizable options</li>
          <li>UUIDs: Generate RFC4122 version 4 compliant unique identifiers</li>
          <li>Colors: Create random hexadecimal color codes</li>
          <li>Names: Generate random first and last name combinations</li>
        </ul>
      </div>
    </div>
  );
};

export default RandomGenerator; 