import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Sliders,
  Type,
  Layout,
  FileCheck,
} from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { PrintResumeDocument } from './PrintResumeDocument';

export interface ResumePreviewProps {
  data: ResumeData;
  onUpdateFormatting: (formatting: ResumeData['formatting']) => void;
  onPrint: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  onUpdateFormatting,
  onPrint,
}) => {
  const [zoom, setZoom] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 0.45;
    }
    return 0.85;
  });
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showPageGuides, setShowPageGuides] = useState<boolean>(true);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(1.4, Math.max(0.35, Math.round((prev + delta) * 100) / 100)));
  };

  const handleFit = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) {
        setZoom(0.42);
      } else if (window.innerWidth < 1024) {
        setZoom(0.65);
      } else {
        setZoom(0.85);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#e0e0e0] dark:bg-[#161616] relative select-none">
      {/* Top Toolbar */}
      <div className="no-print h-12 bg-[#f4f4f4] dark:bg-[#262626] border-b border-[#c6c6c6] dark:border-[#393939] px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-1.5 font-sans">
            <Layout className="w-3.5 h-3.5 text-[#0f62fe]" />
            <span>ATS Real-Time Preview</span>
          </span>

          <span className="text-xs text-[#8d8d8d] hidden sm:inline">|</span>

          {/* Quick template toggle */}
          <div className="hidden md:flex items-center gap-1 text-xs">
            <span className="text-[#6f6f6f] dark:text-[#a8a8a8]">Template:</span>
            <select
              value={data.formatting.template}
              onChange={(e) =>
                onUpdateFormatting({
                  ...data.formatting,
                  template: e.target.value as ResumeData['formatting']['template'],
                })
              }
              className="h-7 text-xs bg-white dark:bg-[#161616] border border-[#8d8d8d] dark:border-[#525252] px-1.5 focus:outline-none focus:border-[#0f62fe] text-[#161616] dark:text-[#f4f4f4]"
            >
              <option value="carbon-classic">Carbon Classic ATS</option>
              <option value="carbon-modern">Carbon Modern Executive</option>
              <option value="carbon-tech">Carbon Tech Minimalist</option>
            </select>
          </div>
        </div>

        {/* Zoom & Formatting controls */}
        <div className="flex items-center gap-2">
          {/* Page break guide toggle */}
          <button
            onClick={() => setShowPageGuides(!showPageGuides)}
            className={`h-7 px-2 text-xs flex items-center gap-1 border transition-colors ${
              showPageGuides
                ? 'bg-[#edf5ff] dark:bg-[#002d9c]/40 border-[#0f62fe] text-[#0f62fe] dark:text-[#78a9ff]'
                : 'bg-white dark:bg-[#333333] border-[#8d8d8d] dark:border-[#525252] text-[#525252] dark:text-[#c6c6c6]'
            }`}
            title="Toggle Visual 1-Page / 2-Page Boundary Lines"
          >
            <FileCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Page Guides</span>
          </button>

          {/* Typography / Spacing Drawer Toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`h-7 px-2 text-xs flex items-center gap-1 border transition-colors ${
              showConfig
                ? 'bg-[#393939] text-white border-[#393939]'
                : 'bg-white dark:bg-[#333333] border-[#8d8d8d] dark:border-[#525252] text-[#161616] dark:text-[#f4f4f4]'
            }`}
            title="Customize Typography, Spacing & Margins"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Typography</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-white dark:bg-[#333333] border border-[#8d8d8d] dark:border-[#525252] h-7">
            <button
              onClick={() => handleZoom(-0.1)}
              className="px-2 hover:bg-[#e0e0e0] dark:hover:bg-[#525252] text-[#161616] dark:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={handleFit}
              className="text-[11px] font-mono px-1.5 min-w-[42px] text-center text-[#161616] dark:text-white hover:bg-[#e0e0e0] dark:hover:bg-[#525252]"
              title="Fit to Screen"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => handleZoom(0.1)}
              className="px-2 hover:bg-[#e0e0e0] dark:hover:bg-[#525252] text-[#161616] dark:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Print button */}
          <button
            onClick={onPrint}
            className="h-7 px-2.5 text-xs bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium flex items-center gap-1 transition-colors"
            title="Print or Export PDF"
          >
            <Printer className="w-3 h-3" />
            <span className="font-semibold hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Formatting options banner (expandable) */}
      {showConfig && (
        <div className="no-print p-3 bg-white dark:bg-[#262626] border-b border-[#c6c6c6] dark:border-[#393939] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs z-10 shadow-sm animate-fadeIn">
          <div>
            <label className="text-[11px] font-medium text-[#525252] dark:text-[#a8a8a8] block mb-1">
              Font Family
            </label>
            <select
              value={data.formatting.fontFamily}
              onChange={(e) =>
                onUpdateFormatting({
                  ...data.formatting,
                  fontFamily: e.target.value as ResumeData['formatting']['fontFamily'],
                })
              }
              className="w-full h-8 bg-[#f4f4f4] dark:bg-[#161616] border border-[#8d8d8d] dark:border-[#525252] px-2 text-[#161616] dark:text-[#f4f4f4]"
            >
              <option value="ibm-plex-sans">IBM Plex Sans (Standard ATS)</option>
              <option value="ibm-plex-serif">IBM Plex Serif (Executive)</option>
              <option value="ibm-plex-mono">IBM Plex Mono (Technical)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#525252] dark:text-[#a8a8a8] block mb-1">
              Font Sizing Density
            </label>
            <select
              value={data.formatting.fontSize}
              onChange={(e) =>
                onUpdateFormatting({
                  ...data.formatting,
                  fontSize: e.target.value as ResumeData['formatting']['fontSize'],
                })
              }
              className="w-full h-8 bg-[#f4f4f4] dark:bg-[#161616] border border-[#8d8d8d] dark:border-[#525252] px-2 text-[#161616] dark:text-[#f4f4f4]"
            >
              <option value="compact">Compact (Dense 1-Page Target)</option>
              <option value="normal">Normal (Balanced 12-13pt)</option>
              <option value="spacious">Spacious (Senior Executive)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#525252] dark:text-[#a8a8a8] block mb-1">
              Page Margins
            </label>
            <select
              value={data.formatting.margins}
              onChange={(e) =>
                onUpdateFormatting({
                  ...data.formatting,
                  margins: e.target.value as ResumeData['formatting']['margins'],
                })
              }
              className="w-full h-8 bg-[#f4f4f4] dark:bg-[#161616] border border-[#8d8d8d] dark:border-[#525252] px-2 text-[#161616] dark:text-[#f4f4f4]"
            >
              <option value="compact">Compact (0.5 in)</option>
              <option value="standard">Standard (0.75 in)</option>
              <option value="generous">Generous (1.0 in)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#525252] dark:text-[#a8a8a8] block mb-1">
              Date Display Format
            </label>
            <select
              value={data.formatting.dateFormat}
              onChange={(e) =>
                onUpdateFormatting({
                  ...data.formatting,
                  dateFormat: e.target.value as ResumeData['formatting']['dateFormat'],
                })
              }
              className="w-full h-8 bg-[#f4f4f4] dark:bg-[#161616] border border-[#8d8d8d] dark:border-[#525252] px-2 text-[#161616] dark:text-[#f4f4f4]"
            >
              <option value="Mon YYYY">Mon YYYY (e.g. Mar 2022)</option>
              <option value="YYYY-MM">ISO YYYY-MM (e.g. 2022-03)</option>
              <option value="YYYY">Year Only (e.g. 2022)</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div className="relative">
          {/* Visual Page Break Guide 1 (11in at 96 DPI = 1056px) */}
          {showPageGuides && (
            <div
              className="absolute left-[-20px] right-[-20px] border-b-2 border-dashed border-[#0f62fe] pointer-events-none z-20 flex items-center justify-between"
              style={{
                top: `${1056 * zoom}px`,
              }}
            >
              <span className="bg-[#0f62fe] text-white text-[10px] font-mono px-2 py-0.5 shadow-sm">
                Page 1 Boundary (11 in)
              </span>
              <span className="bg-[#0f62fe] text-white text-[10px] font-mono px-2 py-0.5 shadow-sm">
                Page 2 Begins Below
              </span>
            </div>
          )}

          {/* The Document */}
          <PrintResumeDocument data={data} scale={zoom} />
        </div>
      </div>
    </div>
  );
};
