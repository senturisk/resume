import React, { useState } from 'react';
import {
  FileText,
  Layers,
  GitBranch,
  Download,
  Printer,
  Sun,
  Moon,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Sparkles,
  Upload,
  Menu,
  X,
  ChevronRight,
  Settings,
  Plus,
} from 'lucide-react';
import { UserProfile, ResumeVersion } from '../../types/resume';

export interface CarbonHeaderProps {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  versions: ResumeVersion[];
  activeVersion: ResumeVersion | null;
  onSelectProfile: (profileId: string) => void;
  onSelectVersion: (versionId: string) => void;
  onOpenProfileManager: () => void;
  onCreateNewProfile: () => void;
  onCreateNewVersion: () => void;
  onOpenImportExport: () => void;
  onOpenATSAnalyzer: () => void;
  onOpenUniversalUpload: () => void;
  onPrint: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  isDarkMode: boolean;
  onToggleTheme: () => void;
  atsScore: number;
}

export const CarbonHeader: React.FC<CarbonHeaderProps> = ({
  profiles,
  activeProfile,
  versions,
  activeVersion,
  onSelectProfile,
  onSelectVersion,
  onOpenProfileManager,
  onCreateNewProfile,
  onCreateNewVersion,
  onOpenImportExport,
  onOpenATSAnalyzer,
  onOpenUniversalUpload,
  onPrint,
  saveStatus,
  isDarkMode,
  onToggleTheme,
  atsScore,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="no-print h-14 bg-[#161616] text-white flex items-center justify-between px-3 sm:px-4 border-b border-[#393939] select-none z-30 sticky top-0">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0f62fe] flex items-center justify-center font-bold text-white text-xs sm:text-sm tracking-tighter">
              SR
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm sm:text-base tracking-tight text-white font-sans whitespace-nowrap">
                Sen Resume
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#a8a8a8] border border-[#525252] px-1 py-0.2 rounded-sm hidden sm:inline-block">
                Carbon ATS Studio
              </span>
            </div>
          </div>

          {/* Desktop Vertical divider */}
          <div className="h-6 w-[1px] bg-[#393939] hidden lg:block" />

          {/* Desktop Profile Switcher */}
          <div className="hidden lg:flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#8d8d8d]" />
            <span className="text-xs text-[#8d8d8d]">Profile:</span>
            <select
              value={activeProfile?.id || ''}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="h-8 bg-[#262626] border border-[#525252] text-xs text-white px-2 focus:outline-none focus:border-[#0f62fe] cursor-pointer max-w-[170px] xl:max-w-[200px] truncate"
              title="Switch User Profile"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={onCreateNewProfile}
              className="h-8 w-8 bg-[#262626] hover:bg-[#0f62fe] text-white flex items-center justify-center border border-[#525252] hover:border-[#0f62fe] transition-colors cursor-pointer shrink-0"
              title="Create New Career Profile from Scratch (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Version Switcher */}
          <div className="hidden lg:flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-[#8d8d8d]" />
            <span className="text-xs text-[#8d8d8d]">Version:</span>
            <select
              value={activeVersion?.id || ''}
              onChange={(e) => onSelectVersion(e.target.value)}
              className="h-8 bg-[#262626] border border-[#525252] text-xs text-white px-2 focus:outline-none focus:border-[#0f62fe] cursor-pointer max-w-[180px] xl:max-w-[220px] truncate"
              title="Switch Resume Version"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.versionTag}] {v.title}
                </option>
              ))}
            </select>
            <button
              onClick={onCreateNewVersion}
              className="h-8 w-8 bg-[#262626] hover:bg-[#0f62fe] text-white flex items-center justify-center border border-[#525252] hover:border-[#0f62fe] transition-colors cursor-pointer shrink-0"
              title="Create New Resume Version from Scratch (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenProfileManager}
              className="h-8 px-2 text-xs bg-[#393939] hover:bg-[#525252] text-white flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Manage Profiles, Versions & Branching"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Right Controls (Desktop Full Toolbar) */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          {/* Auto-save Status */}
          <div className="flex items-center gap-1 text-xs text-[#a8a8a8]">
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#24a148]" />
                <span className="text-[11px] text-[#c6c6c6]">Saved locally</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#f1c21b] animate-spin" />
                <span className="text-[11px] text-[#f1c21b]">Saving...</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-[11px] text-[#8d8d8d]">Unsaved changes</span>
            )}
          </div>

          {/* Universal Resume Upload Trigger */}
          <button
            onClick={onOpenUniversalUpload}
            className="h-8 px-2.5 text-xs bg-[#262626] hover:bg-[#393939] text-[#78a9ff] hover:text-white flex items-center gap-1.5 border border-[#525252] transition-colors cursor-pointer"
            title="Upload Any Resume (PDF / DOC / TXT / JSON)"
          >
            <Upload className="w-3.5 h-3.5 text-[#0f62fe]" />
            <span>Upload Resume</span>
          </button>

          {/* ATS Score Indicator Pill */}
          <button
            onClick={onOpenATSAnalyzer}
            className={`h-8 px-2.5 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              atsScore >= 85
                ? 'bg-[#044317] border-[#24a148] text-[#a7f0ba] hover:bg-[#0e6027]'
                : atsScore >= 70
                ? 'bg-[#3c3838] border-[#f1c21b] text-[#f1c21b] hover:bg-[#525252]'
                : 'bg-[#750e13] border-[#fa4d56] text-[#ffb3b8] hover:bg-[#a2191f]'
            }`}
            title="Open ATS Quality & Keyword Analysis"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ATS: {atsScore}%</span>
          </button>

          {/* Data Portability (JSON / Full Backup) */}
          <button
            onClick={onOpenImportExport}
            className="h-8 px-2.5 text-xs bg-[#262626] hover:bg-[#393939] text-white flex items-center gap-1.5 border border-[#525252] transition-colors cursor-pointer"
            title="Import or Export Resumes & Full Backup Package"
          >
            <Download className="w-3.5 h-3.5 text-[#78a9ff]" />
            <span>Data Portability</span>
          </button>

          {/* Print / PDF Trigger */}
          <button
            onClick={onPrint}
            className="h-8 px-3 text-xs bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export Print-Ready ATS PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="font-semibold">Export PDF</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="h-8 w-8 flex items-center justify-center bg-[#262626] hover:bg-[#393939] text-[#c6c6c6] hover:text-white transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode (Carbon Gray 10)' : 'Switch to Dark Mode (Carbon Gray 100)'}
            aria-label="Toggle visual theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#f1c21b]" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Controls (Mobile Compact Controls: ATS Pill + Print + Hamburger Menu) */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          {/* ATS score compact button */}
          <button
            onClick={onOpenATSAnalyzer}
            className={`h-8 px-2 text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
              atsScore >= 85
                ? 'bg-[#044317] border-[#24a148] text-[#a7f0ba]'
                : atsScore >= 70
                ? 'bg-[#3c3838] border-[#f1c21b] text-[#f1c21b]'
                : 'bg-[#750e13] border-[#fa4d56] text-[#ffb3b8]'
            }`}
            title="ATS Score"
          >
            <BarChart3 className="w-3 h-3" />
            <span>{atsScore}%</span>
          </button>

          {/* Print PDF direct action on mobile */}
          <button
            onClick={onPrint}
            className="h-8 px-2 sm:px-2.5 text-xs bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium flex items-center gap-1 cursor-pointer"
            title="Export PDF"
          >
            <Printer className="w-3 h-3" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-8 w-8 flex items-center justify-center bg-[#262626] hover:bg-[#393939] text-white border border-[#525252] transition-colors cursor-pointer"
            title="Open Mobile Navigation Menu"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Carbon Submenu Drawer (Slide-down overlay when hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="no-print lg:hidden fixed inset-x-0 top-14 bottom-0 bg-black/60 z-50 animate-fadeIn backdrop-blur-xs flex flex-col justify-start">
          <div className="bg-[#161616] border-b border-[#393939] p-4 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl text-xs">
            {/* Auto-save Status Row */}
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <span className="text-[#a8a8a8] font-mono text-[11px] uppercase">Storage Status</span>
              <div className="flex items-center gap-1.5">
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#24a148]" />
                    <span className="text-[#c6c6c6]">Saved locally to IndexedDB</span>
                  </>
                )}
                {saveStatus === 'saving' && (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#f1c21b] animate-spin" />
                    <span className="text-[#f1c21b]">Saving changes...</span>
                  </>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-[#8d8d8d]">Unsaved modifications</span>
                )}
              </div>
            </div>

            {/* Profile Selection on Mobile */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#8d8d8d] uppercase tracking-wider block">
                Active Career Profile
              </label>
              <div className="flex gap-1.5">
                <select
                  value={activeProfile?.id || ''}
                  onChange={(e) => {
                    onSelectProfile(e.target.value);
                  }}
                  className="flex-1 h-9 bg-[#262626] border border-[#525252] text-xs text-white px-2 focus:outline-none focus:border-[#0f62fe] truncate"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCreateNewProfile();
                  }}
                  className="h-9 px-2.5 bg-[#262626] hover:bg-[#0f62fe] text-white flex items-center gap-1 border border-[#525252] shrink-0 cursor-pointer"
                  title="Create Career Profile from Scratch (+)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-xs">New</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfileManager();
                  }}
                  className="h-9 px-2.5 bg-[#393939] hover:bg-[#525252] text-white flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-xs">Manage</span>
                </button>
              </div>
            </div>

            {/* Version Selection on Mobile */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#8d8d8d] uppercase tracking-wider block">
                Active Resume Version
              </label>
              <div className="flex gap-1.5">
                <select
                  value={activeVersion?.id || ''}
                  onChange={(e) => {
                    onSelectVersion(e.target.value);
                  }}
                  className="flex-1 h-9 bg-[#262626] border border-[#525252] text-xs text-white px-2 focus:outline-none focus:border-[#0f62fe] truncate"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      [{v.versionTag}] {v.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCreateNewVersion();
                  }}
                  className="h-9 px-2.5 bg-[#262626] hover:bg-[#0f62fe] text-white flex items-center gap-1 border border-[#525252] shrink-0 cursor-pointer"
                  title="Create Resume Version from Scratch (+)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-xs">New</span>
                </button>
              </div>
            </div>

            {/* Action Buttons Submenu */}
            <div className="pt-2 space-y-2 border-t border-[#262626]">
              {/* Universal Upload */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUniversalUpload();
                }}
                className="w-full h-10 px-3 bg-[#262626] hover:bg-[#393939] text-[#78a9ff] hover:text-white flex items-center justify-between border border-[#525252] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#0f62fe]" />
                  <span className="font-medium text-white">Upload Any Resume (Universal AI)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8d8d8d]" />
              </button>

              {/* ATS Audit Drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenATSAnalyzer();
                }}
                className="w-full h-10 px-3 bg-[#262626] hover:bg-[#393939] text-white flex items-center justify-between border border-[#525252] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#24a148]" />
                  <span>ATS Audit & Keyword Matcher</span>
                </div>
                <span className="font-mono text-[#a7f0ba] bg-[#044317] px-1.5 py-0.5 border border-[#24a148]">
                  {atsScore}%
                </span>
              </button>

              {/* Data Portability */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenImportExport();
                }}
                className="w-full h-10 px-3 bg-[#262626] hover:bg-[#393939] text-white flex items-center justify-between border border-[#525252] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#78a9ff]" />
                  <span>Data Portability & JSON Backup</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8d8d8d]" />
              </button>

              {/* Visual Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className="w-full h-10 px-3 bg-[#262626] hover:bg-[#393939] text-white flex items-center justify-between border border-[#525252] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-[#f1c21b]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#a8a8a8]" />
                  )}
                  <span>Theme: {isDarkMode ? 'Dark (Carbon Gray 100)' : 'Light (Carbon Gray 10)'}</span>
                </div>
                <span className="text-[11px] text-[#8d8d8d]">Tap to toggle</span>
              </button>
            </div>
          </div>
          {/* Backdrop click to close */}
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
};
