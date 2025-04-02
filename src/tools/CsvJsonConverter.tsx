import React, { useState } from 'react';
import { Copy, ArrowRight, ArrowLeft, Download, Upload, RefreshCw, AlertCircle } from 'lucide-react';

interface ConversionOptions {
  csvDelimiter: string;
  csvQuote: string;
  csvHeader: boolean;
  jsonIndent: number;
  jsonArrayShape: 'records' | 'columns';
}

const CsvJsonConverter: React.FC = () => {
  const [direction, setDirection] = useState<'csvToJson' | 'jsonToCsv'>('csvToJson');
  const [csvText, setCsvText] = useState<string>('');
  const [jsonText, setJsonText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [options, setOptions] = useState<ConversionOptions>({
    csvDelimiter: ',',
    csvQuote: '"',
    csvHeader: true,
    jsonIndent: 2,
    jsonArrayShape: 'records'
  });

  // Parse CSV to array of objects
  const parseCsv = (csv: string, delimiter: string, quote: string, hasHeader: boolean): any[] => {
    // Split the CSV into lines
    const lines = csv.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return [];

    // Function to parse a line into cells, handling quoted values
    const parseLine = (line: string): string[] => {
      const cells: string[] = [];
      let cell = '';
      let inQuote = false;
      let i = 0;

      while (i < line.length) {
        const char = line[i];
        
        // Handle quoted cells
        if (char === quote) {
          if (i + 1 < line.length && line[i + 1] === quote) {
            // Escaped quote
            cell += quote;
            i += 2;
          } else {
            // Toggle quote mode
            inQuote = !inQuote;
            i++;
          }
        } 
        // Handle delimiters
        else if (char === delimiter && !inQuote) {
          cells.push(cell);
          cell = '';
          i++;
        } 
        // Normal character
        else {
          cell += char;
          i++;
        }
      }
      
      // Push the last cell
      cells.push(cell);
      return cells;
    };

    // Parse header and data rows
    let headers: string[] = [];
    let startIndex = 0;
    
    if (hasHeader) {
      headers = parseLine(lines[0]);
      startIndex = 1;
    } else {
      // If no header, use numeric indices
      headers = parseLine(lines[0]).map((_, i) => `field${i + 1}`);
    }

    // Parse data rows
    const data: any[] = [];
    
    if (options.jsonArrayShape === 'records') {
      // Convert to array of objects (one object per row)
      for (let i = startIndex; i < lines.length; i++) {
        const row = parseLine(lines[i]);
        const obj: Record<string, string> = {};
        
        // Map cells to headers
        row.forEach((cell, j) => {
          if (j < headers.length) {
            obj[headers[j]] = cell;
          }
        });
        
        data.push(obj);
      }
    } else {
      // Convert to column-oriented format
      const columns: Record<string, string[]> = {};
      
      // Initialize column arrays
      headers.forEach(header => {
        columns[header] = [];
      });
      
      // Populate columns
      for (let i = startIndex; i < lines.length; i++) {
        const row = parseLine(lines[i]);
        
        row.forEach((cell, j) => {
          if (j < headers.length) {
            columns[headers[j]].push(cell);
          }
        });
      }
      
      data.push(columns);
    }
    
    return data;
  };

  // Convert array of objects to CSV
  const convertToCsv = (jsonData: any[], delimiter: string, quote: string): string => {
    if (jsonData.length === 0) return '';
    
    let csv = '';
    let headers: string[] = [];
    
    // Determine the format and extract headers
    const isColumnar = jsonData.length === 1 && Object.values(jsonData[0]).every(val => Array.isArray(val));
    
    if (isColumnar) {
      // Column-oriented format
      const columnsObj = jsonData[0];
      headers = Object.keys(columnsObj);
      
      // Add header row
      if (options.csvHeader) {
        csv += headers.map(header => escapeCsvCell(header, delimiter, quote)).join(delimiter) + '\n';
      }
      
      // Get the max length of any column
      const maxRows = Math.max(...Object.values(columnsObj).map(col => (col as string[]).length));
      
      // Add data rows
      for (let i = 0; i < maxRows; i++) {
        const row = headers.map(header => {
          const column = columnsObj[header] as string[];
          return i < column.length ? escapeCsvCell(column[i], delimiter, quote) : '';
        });
        
        csv += row.join(delimiter) + '\n';
      }
    } else {
      // Row-oriented format (array of objects)
      // Extract headers from the first object
      if (jsonData.length > 0) {
        headers = Object.keys(jsonData[0]);
      }
      
      // Add header row
      if (options.csvHeader) {
        csv += headers.map(header => escapeCsvCell(header, delimiter, quote)).join(delimiter) + '\n';
      }
      
      // Add data rows
      jsonData.forEach(obj => {
        const row = headers.map(header => escapeCsvCell(obj[header] || '', delimiter, quote));
        csv += row.join(delimiter) + '\n';
      });
    }
    
    return csv;
  };

  // Escape special characters in CSV cells
  const escapeCsvCell = (cell: string, delimiter: string, quote: string): string => {
    cell = String(cell);
    
    // Check if escaping is needed
    const needsEscape = 
      cell.includes(delimiter) || 
      cell.includes(quote) || 
      cell.includes('\n') || 
      cell.includes('\r');
    
    if (needsEscape) {
      // Escape quotes by doubling them
      cell = cell.replace(new RegExp(quote, 'g'), quote + quote);
      // Wrap in quotes
      cell = quote + cell + quote;
    }
    
    return cell;
  };

  // Convert CSV to JSON
  const convertCsvToJson = () => {
    try {
      setError('');
      if (!csvText.trim()) {
        setJsonText('');
        return;
      }

      const result = parseCsv(
        csvText, 
        options.csvDelimiter, 
        options.csvQuote, 
        options.csvHeader
      );
      
      setJsonText(JSON.stringify(result, null, options.jsonIndent));
    } catch (err) {
      setError(`Error converting CSV to JSON: ${err instanceof Error ? err.message : String(err)}`);
      setJsonText('');
    }
  };

  // Convert JSON to CSV
  const convertJsonToCsv = () => {
    try {
      setError('');
      if (!jsonText.trim()) {
        setCsvText('');
        return;
      }

      const jsonData = JSON.parse(jsonText);
      
      // Validate JSON structure
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON must be an array');
      }
      
      const csv = convertToCsv(
        jsonData, 
        options.csvDelimiter, 
        options.csvQuote
      );
      
      setCsvText(csv);
    } catch (err) {
      setError(`Error converting JSON to CSV: ${err instanceof Error ? err.message : String(err)}`);
      setCsvText('');
    }
  };

  // Copy content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Download content as file
  const downloadFile = (content: string, fileType: 'csv' | 'json') => {
    const blob = new Blob([content], { type: fileType === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileType === 'csv' ? 'data.csv' : 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'csv' | 'json') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (fileType === 'csv') {
        setCsvText(content);
      } else {
        setJsonText(content);
      }
    };
    reader.readAsText(file);
    
    // Clear the input value to allow uploading the same file again
    event.target.value = '';
  };

  // Handle option change
  const handleOptionChange = (key: keyof ConversionOptions, value: any) => {
    setOptions({
      ...options,
      [key]: value
    });
  };

  // Examples
  const csvExample = `name,age,email
John Doe,28,john@example.com
Jane Smith,34,jane@example.com
Bob Johnson,45,bob@example.com`;

  const jsonExample = JSON.stringify([
    {"name": "John Doe", "age": "28", "email": "john@example.com"},
    {"name": "Jane Smith", "age": "34", "email": "jane@example.com"},
    {"name": "Bob Johnson", "age": "45", "email": "bob@example.com"}
  ], null, 2);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setDirection('csvToJson')}
          className={`px-4 py-2 rounded-l-lg flex items-center ${
            direction === 'csvToJson' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          CSV to JSON <ArrowRight className="ml-2 h-4 w-4" />
        </button>
        <button
          onClick={() => setDirection('jsonToCsv')}
          className={`px-4 py-2 rounded-r-lg flex items-center ${
            direction === 'jsonToCsv' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          JSON to CSV <ArrowLeft className="ml-2 h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* CSV Input/Output */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              {direction === 'csvToJson' ? 'CSV Input' : 'CSV Output'}
            </label>
            <div className="flex items-center space-x-2">
              {direction === 'csvToJson' ? (
                <>
                  <button
                    onClick={() => setCsvText(csvExample)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Example
                  </button>
                  <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 flex items-center">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => handleFileUpload(e, 'csv')}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <>
                  <button
                    onClick={() => copyToClipboard(csvText)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadFile(csvText, 'csv')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    disabled={!csvText}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea
            className="w-full h-80 p-3 border rounded-lg font-mono text-sm"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Enter CSV text here..."
            readOnly={direction === 'jsonToCsv'}
          />
        </div>

        {/* JSON Input/Output */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              {direction === 'csvToJson' ? 'JSON Output' : 'JSON Input'}
            </label>
            <div className="flex items-center space-x-2">
              {direction === 'jsonToCsv' ? (
                <>
                  <button
                    onClick={() => setJsonText(jsonExample)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Example
                  </button>
                  <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 flex items-center">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={(e) => handleFileUpload(e, 'json')}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <>
                  <button
                    onClick={() => copyToClipboard(jsonText)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadFile(jsonText, 'json')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    disabled={!jsonText}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea
            className="w-full h-80 p-3 border rounded-lg font-mono text-sm"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Enter JSON text here..."
            readOnly={direction === 'csvToJson'}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          className="text-sm text-gray-600 hover:text-gray-800"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? 'Hide Options' : 'Show Options'}
        </button>
        
        <button
          onClick={direction === 'csvToJson' ? convertCsvToJson : convertJsonToCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {direction === 'csvToJson' ? 'Convert to JSON' : 'Convert to CSV'}
        </button>
      </div>

      {showOptions && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-sm text-gray-700 mb-3">Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CSV Options */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600">CSV Options</h4>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={options.csvDelimiter}
                  onChange={(e) => handleOptionChange('csvDelimiter', e.target.value)}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Quote Character
                </label>
                <select
                  value={options.csvQuote}
                  onChange={(e) => handleOptionChange('csvQuote', e.target.value)}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value='"'>Double Quote (")</option>
                  <option value="'">Single Quote (')</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.csvHeader}
                    onChange={(e) => handleOptionChange('csvHeader', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">First row is header</span>
                </label>
              </div>
            </div>
            
            {/* JSON Options */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600">JSON Options</h4>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Indentation Spaces
                </label>
                <select
                  value={options.jsonIndent}
                  onChange={(e) => handleOptionChange('jsonIndent', parseInt(e.target.value))}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value="0">No indentation</option>
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Array Shape
                </label>
                <select
                  value={options.jsonArrayShape}
                  onChange={(e) => handleOptionChange('jsonArrayShape', e.target.value as 'records' | 'columns')}
                  className="w-full p-2 text-sm border rounded"
                >
                  <option value="records">Records (Array of objects, one per row)</option>
                  <option value="columns">Columns (Object with arrays, one per column)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About CSV and JSON</h3>
        <p>
          CSV (Comma-Separated Values) is a simple text format for storing tabular data, while JSON (JavaScript Object Notation) 
          is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse.
        </p>
        <p className="mt-1">
          Converting between these formats is useful for data import/export, API interactions, and data processing.
        </p>
      </div>
    </div>
  );
};

export default CsvJsonConverter; 