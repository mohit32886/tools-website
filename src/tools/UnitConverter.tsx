import React, { useState, useEffect } from 'react';
import { Copy, ArrowRight } from 'lucide-react';

// Unit conversion definitions
const unitCategories = [
  {
    name: 'Length',
    units: [
      { id: 'mm', name: 'Millimeters (mm)', toBase: (v: number) => v / 1000 },
      { id: 'cm', name: 'Centimeters (cm)', toBase: (v: number) => v / 100 },
      { id: 'm', name: 'Meters (m)', toBase: (v: number) => v },
      { id: 'km', name: 'Kilometers (km)', toBase: (v: number) => v * 1000 },
      { id: 'in', name: 'Inches (in)', toBase: (v: number) => v * 0.0254 },
      { id: 'ft', name: 'Feet (ft)', toBase: (v: number) => v * 0.3048 },
      { id: 'yd', name: 'Yards (yd)', toBase: (v: number) => v * 0.9144 },
      { id: 'mi', name: 'Miles (mi)', toBase: (v: number) => v * 1609.344 },
    ],
    baseUnit: 'm', // The base unit for this category (meters for length)
  },
  {
    name: 'Weight',
    units: [
      { id: 'mg', name: 'Milligrams (mg)', toBase: (v: number) => v / 1000000 },
      { id: 'g', name: 'Grams (g)', toBase: (v: number) => v / 1000 },
      { id: 'kg', name: 'Kilograms (kg)', toBase: (v: number) => v },
      { id: 'ton', name: 'Metric Tons (t)', toBase: (v: number) => v * 1000 },
      { id: 'oz', name: 'Ounces (oz)', toBase: (v: number) => v * 0.0283495 },
      { id: 'lb', name: 'Pounds (lb)', toBase: (v: number) => v * 0.453592 },
      { id: 'st', name: 'Stone (st)', toBase: (v: number) => v * 6.35029 },
    ],
    baseUnit: 'kg', // The base unit for this category
  },
  {
    name: 'Volume',
    units: [
      { id: 'ml', name: 'Milliliters (ml)', toBase: (v: number) => v / 1000 },
      { id: 'l', name: 'Liters (l)', toBase: (v: number) => v },
      { id: 'gal_us', name: 'Gallons (US)', toBase: (v: number) => v * 3.78541 },
      { id: 'gal_uk', name: 'Gallons (UK)', toBase: (v: number) => v * 4.54609 },
      { id: 'pt_us', name: 'Pints (US)', toBase: (v: number) => v * 0.473176 },
      { id: 'pt_uk', name: 'Pints (UK)', toBase: (v: number) => v * 0.568261 },
      { id: 'fl_oz_us', name: 'Fluid Ounces (US)', toBase: (v: number) => v * 0.0295735 },
      { id: 'fl_oz_uk', name: 'Fluid Ounces (UK)', toBase: (v: number) => v * 0.0284131 },
      { id: 'cup', name: 'Cups', toBase: (v: number) => v * 0.24 },
    ],
    baseUnit: 'l', // The base unit for this category
  },
  {
    name: 'Temperature',
    units: [
      { 
        id: 'c', 
        name: 'Celsius (°C)', 
        toBase: (v: number) => v,
        fromBase: (v: number) => v,
      },
      { 
        id: 'f', 
        name: 'Fahrenheit (°F)', 
        toBase: (v: number) => (v - 32) * (5/9),
        fromBase: (v: number) => (v * (9/5)) + 32,
      },
      { 
        id: 'k', 
        name: 'Kelvin (K)', 
        toBase: (v: number) => v - 273.15,
        fromBase: (v: number) => v + 273.15,
      },
    ],
    baseUnit: 'c', // The base unit for this category
    useCustomConversion: true, // Flag for units that need special conversion logic
  },
  {
    name: 'Area',
    units: [
      { id: 'mm2', name: 'Square Millimeters (mm²)', toBase: (v: number) => v / 1000000 },
      { id: 'cm2', name: 'Square Centimeters (cm²)', toBase: (v: number) => v / 10000 },
      { id: 'm2', name: 'Square Meters (m²)', toBase: (v: number) => v },
      { id: 'km2', name: 'Square Kilometers (km²)', toBase: (v: number) => v * 1000000 },
      { id: 'in2', name: 'Square Inches (in²)', toBase: (v: number) => v * 0.00064516 },
      { id: 'ft2', name: 'Square Feet (ft²)', toBase: (v: number) => v * 0.092903 },
      { id: 'ac', name: 'Acres', toBase: (v: number) => v * 4046.86 },
      { id: 'ha', name: 'Hectares', toBase: (v: number) => v * 10000 },
    ],
    baseUnit: 'm2', // The base unit for this category
  },
  {
    name: 'Speed',
    units: [
      { id: 'mps', name: 'Meters per Second (m/s)', toBase: (v: number) => v },
      { id: 'kph', name: 'Kilometers per Hour (km/h)', toBase: (v: number) => v / 3.6 },
      { id: 'mph', name: 'Miles per Hour (mph)', toBase: (v: number) => v * 0.44704 },
      { id: 'fps', name: 'Feet per Second (ft/s)', toBase: (v: number) => v * 0.3048 },
      { id: 'knot', name: 'Knots', toBase: (v: number) => v * 0.514444 },
    ],
    baseUnit: 'mps', // The base unit for this category
  },
];

const UnitConverter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(unitCategories[0]);
  const [fromUnit, setFromUnit] = useState(selectedCategory.units[0]);
  const [toUnit, setToUnit] = useState(selectedCategory.units[1]);
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');
  const [recentConversions, setRecentConversions] = useState<string[]>([]);

  // Function to find a unit by ID within the current category
  const findUnitById = (id: string) => {
    return selectedCategory.units.find(unit => unit.id === id) || selectedCategory.units[0];
  };

  // Handle value conversion
  const convertValue = () => {
    if (fromValue === '' || isNaN(parseFloat(fromValue))) {
      setToValue('');
      return;
    }

    const value = parseFloat(fromValue);
    
    if (selectedCategory.useCustomConversion) {
      // For temperature and other special cases that need custom conversion
      const baseValue = fromUnit.toBase(value);
      const resultValue = toUnit.fromBase ? toUnit.fromBase(baseValue) : 0;
      
      // Store the conversion in history
      const conversionText = `${value} ${fromUnit.name.split(' ')[0]} = ${resultValue.toFixed(6)} ${toUnit.name.split(' ')[0]}`;
      addToRecentConversions(conversionText);
      
      // Update the result field
      setToValue(resultValue.toFixed(6));
    } else {
      // Standard conversion through base unit
      const baseValue = fromUnit.toBase(value);
      const resultValue = baseValue / toUnit.toBase(1);
      
      // Store the conversion in history
      const conversionText = `${value} ${fromUnit.name.split(' ')[0]} = ${resultValue.toFixed(6)} ${toUnit.name.split(' ')[0]}`;
      addToRecentConversions(conversionText);
      
      // Update the result field
      setToValue(resultValue.toFixed(6));
    }
  };

  // Add a conversion to recent history
  const addToRecentConversions = (conversion: string) => {
    setRecentConversions(prev => {
      // Keep only last 5 conversions
      const newHistory = [conversion, ...prev.filter(c => c !== conversion)].slice(0, 5);
      return newHistory;
    });
  };

  // Swap the from and to units
  const swapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  // Reset values
  const resetValues = () => {
    setFromValue('1');
    setToValue('');
  };

  // Handle category change
  const handleCategoryChange = (categoryName: string) => {
    const category = unitCategories.find(c => c.name === categoryName) || unitCategories[0];
    setSelectedCategory(category);
    setFromUnit(category.units[0]);
    setToUnit(category.units[1]);
    resetValues();
  };

  // Copy result to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Effect to update conversion when inputs change
  useEffect(() => {
    convertValue();
  }, [fromUnit, toUnit, fromValue]);

  // Effect to reset units when category changes
  useEffect(() => {
    setFromUnit(selectedCategory.units[0]);
    setToUnit(selectedCategory.units[1]);
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory.name}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {unitCategories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              From
            </label>
            <select
              value={fromUnit.id}
              onChange={(e) => setFromUnit(findUnitById(e.target.value))}
              className="w-full p-2 border rounded-lg mb-2"
            >
              {selectedCategory.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter value"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              To
            </label>
            <div className="flex-grow relative">
              <select
                value={toUnit.id}
                onChange={(e) => setToUnit(findUnitById(e.target.value))}
                className="w-full p-2 border rounded-lg mb-2"
              >
                {selectedCategory.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={toValue}
                readOnly
                className="w-full p-2 border rounded-lg bg-gray-50"
                placeholder="Result"
              />
              <button 
                onClick={() => copyToClipboard(toValue)}
                className="absolute right-2 top-[calc(50%+16px)] transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Copy result"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2 flex items-center justify-center">
            <button
              onClick={swapUnits}
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-sm"
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Swap Units
            </button>
          </div>
        </div>
      </div>
      
      {recentConversions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Recent Conversions
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg border max-h-32 overflow-y-auto">
            <ul className="space-y-1 text-sm">
              {recentConversions.map((conversion, index) => (
                <li 
                  key={index}
                  className="hover:bg-gray-100 p-1 rounded cursor-pointer"
                  onClick={() => copyToClipboard(conversion)}
                  title="Click to copy"
                >
                  {conversion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <p className="font-medium mb-1">Common Conversions in {selectedCategory.name}</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {selectedCategory.name === 'Length' && (
            <>
              <li>1 inch = 2.54 centimeters</li>
              <li>1 foot = 0.3048 meters</li>
              <li>1 mile = 1.60934 kilometers</li>
              <li>1 meter = 3.28084 feet</li>
            </>
          )}
          {selectedCategory.name === 'Weight' && (
            <>
              <li>1 pound = 0.453592 kilograms</li>
              <li>1 kilogram = 2.20462 pounds</li>
              <li>1 ounce = 28.3495 grams</li>
              <li>1 stone = 6.35029 kilograms</li>
            </>
          )}
          {selectedCategory.name === 'Volume' && (
            <>
              <li>1 gallon (US) = 3.78541 liters</li>
              <li>1 liter = 0.264172 gallons (US)</li>
              <li>1 cup = 240 milliliters</li>
              <li>1 fluid ounce (US) = 29.5735 milliliters</li>
            </>
          )}
          {selectedCategory.name === 'Temperature' && (
            <>
              <li>0°C = 32°F</li>
              <li>100°C = 212°F</li>
              <li>-40°C = -40°F</li>
              <li>0°C = 273.15K</li>
            </>
          )}
          {selectedCategory.name === 'Area' && (
            <>
              <li>1 acre = 4046.86 square meters</li>
              <li>1 square foot = 0.092903 square meters</li>
              <li>1 hectare = 10,000 square meters</li>
              <li>1 square kilometer = 0.386102 square miles</li>
            </>
          )}
          {selectedCategory.name === 'Speed' && (
            <>
              <li>1 mph = 1.60934 km/h</li>
              <li>1 m/s = 3.6 km/h</li>
              <li>1 knot = 1.15078 mph</li>
              <li>1 km/h = 0.621371 mph</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UnitConverter; 