import React, { useState, useEffect } from 'react';
import MD5 from 'crypto-js/md5';
import SHA1 from 'crypto-js/sha1';
import SHA256 from 'crypto-js/sha256';
import SHA512 from 'crypto-js/sha512';
import SHA3 from 'crypto-js/sha3';
import RIPEMD160 from 'crypto-js/ripemd160';

interface HashResult {
  type: string;
  value: string;
}

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<Record<string, boolean>>({
    MD5: true,
    SHA1: true,
    SHA256: true,
    SHA512: true,
    SHA3: false,
    RIPEMD160: false,
  });

  useEffect(() => {
    if (!input) {
      setHashes([]);
      return;
    }

    const newHashes: HashResult[] = [];

    if (selectedAlgorithms.MD5) {
      newHashes.push({
        type: 'MD5',
        value: MD5(input).toString(),
      });
    }

    if (selectedAlgorithms.SHA1) {
      newHashes.push({
        type: 'SHA1',
        value: SHA1(input).toString(),
      });
    }

    if (selectedAlgorithms.SHA256) {
      newHashes.push({
        type: 'SHA256',
        value: SHA256(input).toString(),
      });
    }

    if (selectedAlgorithms.SHA512) {
      newHashes.push({
        type: 'SHA512',
        value: SHA512(input).toString(),
      });
    }

    if (selectedAlgorithms.SHA3) {
      newHashes.push({
        type: 'SHA3',
        value: SHA3(input).toString(),
      });
    }

    if (selectedAlgorithms.RIPEMD160) {
      newHashes.push({
        type: 'RIPEMD160',
        value: RIPEMD160(input).toString(),
      });
    }

    setHashes(newHashes);
  }, [input, selectedAlgorithms]);

  const toggleAlgorithm = (algorithm: string) => {
    setSelectedAlgorithms(prev => ({
      ...prev,
      [algorithm]: !prev[algorithm],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input Text
        </label>
        <textarea
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hash Algorithms
        </label>
        <div className="flex flex-wrap gap-3">
          {Object.keys(selectedAlgorithms).map(algorithm => (
            <label key={algorithm} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedAlgorithms[algorithm]}
                onChange={() => toggleAlgorithm(algorithm)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{algorithm}</span>
            </label>
          ))}
        </div>
      </div>

      {hashes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Generated Hashes
          </h3>
          <div className="space-y-3">
            {hashes.map((hash) => (
              <div key={hash.type} className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-700">{hash.type}</span>
                  <button
                    onClick={() => copyToClipboard(hash.value)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    Copy
                  </button>
                </div>
                <div className="font-mono text-sm break-all">{hash.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
        <p className="font-medium mb-1">Note:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Hashing is a one-way process. You cannot recover the original text from a hash.</li>
          <li>For secure password storage, consider using a specialized password hashing function like bcrypt or Argon2.</li>
        </ul>
      </div>
    </div>
  );
};

export default HashGenerator; 