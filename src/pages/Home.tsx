import React, { useState } from 'react';
import {
  Type,
  Palette,
  Key,
  FileCode,
  Image,
  QrCode,
  Calendar,
  Calculator,
  Clock,
  Scissors,
  Code,
  Dices,
  FileText,
  Lock,
  Zap,
  BarChart,
  CheckSquare,
  Compass,
  FileJson,
  Edit,
  Hash,
  Table,
  Map,
  Globe,
  Gauge,
  AlignLeft,
  Search,
  Link,
  FileSpreadsheet,
  Server,
  Wifi
} from 'lucide-react';

import ToolCard from '../components/ToolCard';
import Modal from '../components/Modal';
import TextCounter from '../tools/TextCounter';
import TextFormatter from '../tools/TextFormatter';
import TextDiff from '../tools/TextDiff';
import MarkdownEditor from '../tools/MarkdownEditor';
import ColorPicker from '../tools/ColorPicker';
import ColorPaletteGenerator from '../tools/ColorPaletteGenerator';
import PasswordGenerator from '../tools/PasswordGenerator';
import Base64Converter from '../tools/Base64Converter';
import JsonFormatter from '../tools/JsonFormatter';
import HashGenerator from '../tools/HashGenerator';
import UrlEncoder from '../tools/UrlEncoder';
import HtmlEscape from '../tools/HtmlEscape';
import ImageResizer from '../tools/ImageResizer';
import ImageCompressor from '../tools/ImageCompressor';
import AspectRatioCalculator from '../tools/AspectRatioCalculator';
import QrCodeGenerator from '../tools/QrCodeGenerator';
import DateCalculator from '../tools/DateCalculator';
import UnitConverter from '../tools/UnitConverter';
import RandomGenerator from '../tools/RandomGenerator';
import TimeZoneConverter from '../tools/TimeZoneConverter';
import LoremIpsumGenerator from '../tools/LoremIpsumGenerator';
import RegexTester from '../tools/RegexTester';
import SlugGenerator from '../tools/SlugGenerator';
import CsvJsonConverter from '../tools/CsvJsonConverter';
import IpAddressLookup from '../tools/IpAddressLookup';
import DnsLookup from '../tools/DnsLookup';
import HttpHeaderViewer from '../tools/HttpHeaderViewer';

// Organize tools into categories
const toolCategories = [
  {
    id: 'text-tools',
    name: 'Text Tools',
    tools: [
      {
        id: 'text-counter',
        title: 'Text Counter',
        description: 'Count words and characters in your text',
        icon: Type,
        component: TextCounter,
      },
      {
        id: 'text-formatter',
        title: 'Text Formatter',
        description: 'Format and beautify your text',
        icon: Edit,
        component: TextFormatter,
      },
      {
        id: 'text-diff',
        title: 'Text Diff',
        description: 'Compare two text snippets',
        icon: FileText,
        component: TextDiff,
      },
      {
        id: 'markdown-editor',
        title: 'Markdown Editor',
        description: 'Edit and preview markdown',
        icon: Code,
        component: MarkdownEditor,
      },
      {
        id: 'text-case-converter',
        title: 'Case Converter',
        description: 'Convert text between cases',
        icon: Scissors,
        component: TextFormatter, // Use TextFormatter as it has case conversion functionality
      },
      {
        id: 'lorem-ipsum-generator',
        title: 'Lorem Ipsum Generator',
        description: 'Generate placeholder text for designs',
        icon: AlignLeft,
        component: LoremIpsumGenerator,
      },
      {
        id: 'slug-generator',
        title: 'Slug Generator',
        description: 'Convert text to URL-friendly slugs',
        icon: Link,
        component: SlugGenerator,
      },
    ]
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    tools: [
      {
        id: 'base64-converter',
        title: 'Base64 Converter',
        description: 'Encode and decode Base64 strings',
        icon: FileCode,
        component: Base64Converter,
      },
      {
        id: 'json-formatter',
        title: 'JSON Formatter',
        description: 'Format and validate JSON',
        icon: FileJson,
        component: JsonFormatter,
      },
      {
        id: 'hash-generator',
        title: 'Hash Generator',
        description: 'Generate MD5, SHA1, SHA256 hashes',
        icon: Hash,
        component: HashGenerator,
      },
      {
        id: 'url-encoder',
        title: 'URL Encoder/Decoder',
        description: 'Encode and decode URLs',
        icon: Globe,
        component: UrlEncoder,
      },
      {
        id: 'html-escape',
        title: 'HTML Escape/Unescape',
        description: 'Escape and unescape HTML entities',
        icon: Code,
        component: HtmlEscape,
      },
      {
        id: 'regex-tester',
        title: 'Regex Tester',
        description: 'Test regular expressions with highlights',
        icon: Search,
        component: RegexTester,
      },
      {
        id: 'csv-json-converter',
        title: 'CSV <-> JSON Converter',
        description: 'Convert between CSV and JSON formats',
        icon: FileSpreadsheet,
        component: CsvJsonConverter,
      },
    ]
  },
  {
    id: 'design-tools',
    name: 'Design Tools',
    tools: [
      {
        id: 'color-picker',
        title: 'Color Picker',
        description: 'Pick and convert colors easily',
        icon: Palette,
        component: ColorPicker,
      },
      {
        id: 'image-resizer',
        title: 'Image Resizer',
        description: 'Resize your images easily',
        icon: Image,
        component: ImageResizer,
      },
      {
        id: 'color-palette-generator',
        title: 'Color Palette Generator',
        description: 'Generate harmonious color palettes',
        icon: BarChart,
        component: ColorPaletteGenerator,
      },
      {
        id: 'image-compressor',
        title: 'Image Compressor',
        description: 'Compress images without quality loss',
        icon: Zap,
        component: ImageCompressor,
      },
      {
        id: 'aspect-ratio-calculator',
        title: 'Aspect Ratio Calculator',
        description: 'Calculate dimensions with aspect ratios',
        icon: Calculator,
        component: AspectRatioCalculator,
      },
    ]
  },
  {
    id: 'utility-tools',
    name: 'Utility Tools',
    tools: [
      {
        id: 'password-generator',
        title: 'Password Generator',
        description: 'Generate secure passwords',
        icon: Key,
        component: PasswordGenerator,
      },
      {
        id: 'qr-generator',
        title: 'QR Code Generator',
        description: 'Generate QR codes from text or URLs',
        icon: QrCode,
        component: QrCodeGenerator,
      },
      {
        id: 'date-calculator',
        title: 'Date Calculator',
        description: 'Calculate time between dates',
        icon: Calendar,
        component: DateCalculator,
      },
      {
        id: 'time-zone-converter',
        title: 'Time Zone Converter',
        description: 'Convert times between time zones',
        icon: Clock,
        component: TimeZoneConverter,
      },
      {
        id: 'unit-converter',
        title: 'Unit Converter',
        description: 'Convert between different units',
        icon: Gauge,
        component: UnitConverter,
      },
      {
        id: 'random-generator',
        title: 'Random Generator',
        description: 'Generate random numbers, strings, etc.',
        icon: Dices,
        component: RandomGenerator,
      },
    ]
  },
  {
    id: 'network-tools',
    name: 'Network Tools',
    tools: [
      {
        id: 'ip-address-lookup',
        title: 'IP Address Lookup',
        description: 'Show geolocation, ISP, and other details for an IP',
        icon: Wifi,
        component: IpAddressLookup,
      },
      {
        id: 'dns-lookup',
        title: 'DNS Lookup',
        description: 'Perform DNS lookups for various record types',
        icon: Server,
        component: DnsLookup,
      },
      {
        id: 'http-header-viewer',
        title: 'HTTP Header Viewer',
        description: 'View HTTP response headers for any URL',
        icon: FileCode,
        component: HttpHeaderViewer,
      },
    ]
  },
];

// Flattened tools array for modal component use
const allTools = toolCategories.flatMap(category => category.tools);

const Home: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<typeof allTools[0] | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Web Tools Collection</h1>
        <p className="text-gray-600 text-center mb-6">
          A collection of useful tools for your daily tasks
        </p>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 sticky top-4 z-10 bg-white py-3 px-6 rounded-xl shadow">
          {toolCategories.map((category) => (
            <a 
              key={category.id} 
              href={`#${category.id}`}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              {category.name}
            </a>
          ))}
        </div>

        {toolCategories.map((category) => (
          <div key={category.id} className="mb-16 category-container" id={category.id}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 tool-card-grid">
              {category.tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  onClick={() => setSelectedTool(tool)}
                />
              ))}
            </div>
          </div>
        ))}

        {selectedTool && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedTool(null)}
            title={selectedTool.title}
          >
            <selectedTool.component />
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Home;