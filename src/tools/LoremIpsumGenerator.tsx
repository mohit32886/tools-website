import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

// Lorem ipsum starter text
const loremIpsumStart = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';

// Bank of Latin words for generation
const latinWords = [
  'a', 'ac', 'accumsan', 'ad', 'adipiscing', 'aenean', 'aliquam', 'aliquet', 'amet', 'ante',
  'aptent', 'arcu', 'at', 'auctor', 'augue', 'bibendum', 'blandit', 'commodo', 'condimentum',
  'congue', 'consectetur', 'consequat', 'convallis', 'cras', 'cum', 'curabitur', 'cursus',
  'dapibus', 'diam', 'dictum', 'dictumst', 'dignissim', 'dis', 'dolor', 'donec', 'dui', 'duis',
  'efficitur', 'egestas', 'eget', 'eleifend', 'elementum', 'elit', 'enim', 'erat', 'eros', 'est',
  'et', 'etiam', 'eu', 'euismod', 'ex', 'facilisi', 'facilisis', 'fames', 'faucibus', 'felis',
  'fermentum', 'feugiat', 'finibus', 'fringilla', 'fusce', 'gravida', 'habitant', 'habitasse',
  'hac', 'hendrerit', 'himenaeos', 'iaculis', 'id', 'imperdiet', 'in', 'integer', 'interdum',
  'ipsum', 'justo', 'lacinia', 'lacus', 'laoreet', 'lectus', 'leo', 'libero', 'ligula', 'litora',
  'lobortis', 'lorem', 'luctus', 'maecenas', 'magna', 'magnis', 'malesuada', 'massa', 'mattis',
  'mauris', 'maximus', 'metus', 'mi', 'molestie', 'mollis', 'montes', 'morbi', 'nam', 'nascetur',
  'natoque', 'nec', 'neque', 'netus', 'nibh', 'nisi', 'nisl', 'non', 'nostra', 'nulla', 'nullam',
  'nunc', 'odio', 'orci', 'ornare', 'parturient', 'pellentesque', 'penatibus', 'per', 'pharetra',
  'phasellus', 'placerat', 'platea', 'porta', 'porttitor', 'posuere', 'potenti', 'praesent',
  'pretium', 'primis', 'proin', 'pulvinar', 'purus', 'quam', 'quis', 'quisque', 'rhoncus',
  'ridiculus', 'risus', 'rutrum', 'sagittis', 'sapien', 'scelerisque', 'sed', 'sem', 'semper',
  'senectus', 'sit', 'sociis', 'sociosqu', 'sodales', 'sollicitudin', 'suscipit', 'suspendisse',
  'taciti', 'tellus', 'tempor', 'tempus', 'tincidunt', 'torquent', 'tortor', 'tristique',
  'turpis', 'ullamcorper', 'ultrices', 'ultricies', 'urna', 'ut', 'varius', 'vehicula', 'vel',
  'velit', 'venenatis', 'vestibulum', 'vitae', 'vivamus', 'viverra', 'volutpat', 'vulputate'
];

const LoremIpsumGenerator: React.FC = () => {
  const [count, setCount] = useState<number>(5);
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [minWordsPerSentence, setMinWordsPerSentence] = useState<number>(5);
  const [maxWordsPerSentence, setMaxWordsPerSentence] = useState<number>(15);
  const [minSentencesPerParagraph, setMinSentencesPerParagraph] = useState<number>(3);
  const [maxSentencesPerParagraph, setMaxSentencesPerParagraph] = useState<number>(7);
  const [result, setResult] = useState<string>('');

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const generateWord = (): string => {
    return latinWords[Math.floor(Math.random() * latinWords.length)];
  };

  const generateSentence = (startWithLoremIpsum: boolean = false): string => {
    const numWords = getRandomInt(minWordsPerSentence, maxWordsPerSentence);
    let words: string[] = [];
    
    if (startWithLoremIpsum) {
      // Use the lorem ipsum start text (already has a period at the end)
      return loremIpsumStart;
    }
    
    for (let i = 0; i < numWords; i++) {
      words.push(generateWord());
    }
    
    // Capitalize first letter and add period
    return capitalize(words.join(' ')) + '.';
  };

  const generateParagraph = (isFirst: boolean = false): string => {
    const numSentences = getRandomInt(minSentencesPerParagraph, maxSentencesPerParagraph);
    let sentences: string[] = [];
    
    for (let i = 0; i < numSentences; i++) {
      // Only use "Lorem ipsum" for the first sentence of the first paragraph if startWithLorem is true
      if (i === 0 && isFirst && startWithLorem) {
        sentences.push(generateSentence(true));
      } else {
        sentences.push(generateSentence());
      }
    }
    
    return sentences.join(' ');
  };

  const generateLoremIpsum = () => {
    let output = '';
    
    if (unit === 'paragraphs') {
      for (let i = 0; i < count; i++) {
        output += generateParagraph(i === 0) + (i < count - 1 ? '\n\n' : '');
      }
    } else if (unit === 'sentences') {
      for (let i = 0; i < count; i++) {
        output += (i === 0 && startWithLorem) ? generateSentence(true) : generateSentence();
        output += ' ';
      }
    } else if (unit === 'words') {
      if (startWithLorem && count >= 2) {
        // Start with "Lorem ipsum"
        output = 'Lorem ipsum';
        for (let i = 2; i < count; i++) {
          output += ' ' + generateWord();
        }
      } else {
        let words = [];
        for (let i = 0; i < count; i++) {
          words.push(generateWord());
        }
        output = words.join(' ');
        // Capitalize first letter
        output = capitalize(output);
      }
      
      // Add period at the end for words
      if (!output.endsWith('.')) {
        output += '.';
      }
    }
    
    setResult(output);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Generate
            </label>
          </div>
          
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-20 p-2 border rounded-lg"
            />
            
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'paragraphs' | 'sentences' | 'words')}
              className="flex-grow p-2 border rounded-lg"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Start with "Lorem ipsum dolor sit amet"</span>
            </label>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Words per sentence
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={minWordsPerSentence}
                    onChange={(e) => setMinWordsPerSentence(parseInt(e.target.value) || 3)}
                    className="w-16 p-1 text-sm border rounded"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min={minWordsPerSentence}
                    max="30"
                    value={maxWordsPerSentence}
                    onChange={(e) => setMaxWordsPerSentence(parseInt(e.target.value) || minWordsPerSentence)}
                    className="w-16 p-1 text-sm border rounded"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Sentences per paragraph
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={minSentencesPerParagraph}
                    onChange={(e) => setMinSentencesPerParagraph(parseInt(e.target.value) || 1)}
                    className="w-16 p-1 text-sm border rounded"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min={minSentencesPerParagraph}
                    max="15"
                    value={maxSentencesPerParagraph}
                    onChange={(e) => setMaxSentencesPerParagraph(parseInt(e.target.value) || minSentencesPerParagraph)}
                    className="w-16 p-1 text-sm border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={generateLoremIpsum}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Lorem Ipsum
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Result
            </label>
            {result && (
              <button
                onClick={copyToClipboard}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy to Clipboard
              </button>
            )}
          </div>
          
          <textarea
            className="w-full h-[350px] p-3 border rounded-lg font-serif text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={result}
            readOnly
            placeholder="Your generated text will appear here..."
          />
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
        <h3 className="font-medium mb-1">About Lorem Ipsum</h3>
        <p>
          Lorem Ipsum is a placeholder text commonly used in the printing, typesetting, and publishing industries. 
          It's used to demonstrate the visual form of a document without relying on meaningful content.
        </p>
        <p className="mt-1">
          The standard Lorem Ipsum passage has been used since the 1500s and is derived from sections 1.10.32 and 1.10.33 of 
          Cicero's "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil).
        </p>
      </div>
    </div>
  );
};

export default LoremIpsumGenerator; 