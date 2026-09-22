import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  ResumeVersion,
  ImportExportPackage,
} from '../../types/resume';
import {
  exportFullWorkspacePackage,
  exportSingleResumeVersion,
  parseAndValidateImport,
} from '../../services/importExport';
import { CarbonModal } from '../carbon/CarbonTagAndModal';
import { CarbonButton } from '../carbon/CarbonButton';

export interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVersion: ResumeVersion | null;
  onImportComplete: (mode: 'merge' | 'overwrite', data: ImportExportPackage | ResumeVersion) => Promise<void>;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  activeVersion,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    type?: 'full-package' | 'single-version';
    data?: ImportExportPackage | ResumeVersion;
    error?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidateJson = (jsonString: string) => {
    setRawJsonInput(jsonString);
    if (!jsonString.trim()) {
      setValidationResult(null);
      return;
    }

    try {
      const parsed = parseAndValidateImport(jsonString);
      setValidationResult({
        success: true,
        type: parsed.type,
        data: parsed.data,
      });
    } catch (err: unknown) {
      setValidationResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown validation error',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleValidateJson(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!validationResult || !validationResult.success || !validationResult.data) return;

    setIsProcessing(true);
    try {
      await onImportComplete(importMode, validationResult.data);
      onClose();
    } catch (err: unknown) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyRawJson = () => {
    if (!activeVersion) return;
    navigator.clipboard.writeText(JSON.stringify(activeVersion, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CarbonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Portability & Transfer"
      subtitle="Complete offline data ownership: export schemas or import across devices."
      size="lg"
    >
      {/* Tabs */}
      <div className="flex border-b border-[#e0e0e0] dark:border-[#393939] mb-5">
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'export'
              ? 'border-[#0f62fe] text-[#0f62fe] dark:text-[#78a9ff] font-semibold'
              : 'border-transparent text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616]'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Options</span>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'import'
              ? 'border-[#0f62fe] text-[#0f62fe] dark:text-[#78a9ff] font-semibold'
              : 'border-transparent text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616]'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Import / Restore</span>
        </button>
      </div>

      {/* Export View */}
      {activeTab === 'export' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#f4f4f4] dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#393939]">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm text-[#161616] dark:text-[#f4f4f4]">
                  Full Database Workspace Backup (.json)
                </h4>
                <p className="text-xs text-[#525252] dark:text-[#c6c6c6] mt-1">
                  Bundles all created profiles, version trees, metadata, and customization settings in a single portable schema.
                </p>
              </div>
              <CarbonButton
                size="sm"
                kind="primary"
                onClick={() => exportFullWorkspacePackage()}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export Workspace
              </CarbonButton>
            </div>
          </div>

          <div className="p-4 bg-[#f4f4f4] dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#393939]">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm text-[#161616] dark:text-[#f4f4f4]">
                  Active Resume Only (.json)
                </h4>
                <p className="text-xs text-[#525252] dark:text-[#c6c6c6] mt-1">
                  Exports current version: &quot;{activeVersion?.title}&quot; [{activeVersion?.versionTag}].
                </p>
              </div>
              <div className="flex gap-2">
                <CarbonButton
                  size="sm"
                  kind="secondary"
                  onClick={handleCopyRawJson}
                  icon={copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </CarbonButton>
                <CarbonButton
                  size="sm"
                  kind="tertiary"
                  disabled={!activeVersion}
                  onClick={() => activeVersion && exportSingleResumeVersion(activeVersion)}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download JSON
                </CarbonButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import View */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          {/* File input */}
          <div className="border-2 border-dashed border-[#8d8d8d] dark:border-[#525252] p-5 text-center bg-[#f4f4f4] dark:bg-[#161616]">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <FileCode className="w-8 h-8 mx-auto text-[#0f62fe] mb-2" />
            <p className="text-sm font-semibold">Select a JSON file or drag & drop</p>
            <p className="text-xs text-[#525252] dark:text-[#c6c6c6] mt-0.5">
              Supports Sen Resume Workspace Backups and Single Resume definitions.
            </p>
            <div className="mt-3">
              <CarbonButton
                size="sm"
                kind="tertiary"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </CarbonButton>
            </div>
          </div>

          {/* Paste JSON */}
          <div>
            <label className="text-xs font-semibold text-[#525252] dark:text-[#c6c6c6] block mb-1">
              Or paste raw JSON payload directly:
            </label>
            <textarea
              value={rawJsonInput}
              onChange={(e) => handleValidateJson(e.target.value)}
              placeholder='{"schemaVersion": "1.0.0", "appName": "Sen Resume", ...}'
              rows={4}
              className="w-full text-xs font-mono p-2.5 bg-[#ffffff] dark:bg-[#262626] border border-[#8d8d8d] dark:border-[#525252] focus:border-[#0f62fe] focus:outline-none"
            />
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div
              className={`p-3.5 border ${
                validationResult.success
                  ? 'bg-[#defbe6] dark:bg-[#044317] border-[#24a148] text-[#0e6027] dark:text-[#a7f0ba]'
                  : 'bg-[#fff1f1] dark:bg-[#750e13] border-[#da1e28] text-[#a2191f] dark:text-[#ffb3b8]'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                {validationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {validationResult.success
                    ? `Schema Validated: ${
                        validationResult.type === 'full-package'
                          ? 'Full Workspace Backup'
                          : 'Single Resume Definition'
                      }`
                    : 'Schema Validation Error'}
                </span>
              </div>
              {validationResult.error && (
                <p className="text-xs mt-1 font-mono">{validationResult.error}</p>
              )}
            </div>
          )}

          {/* Import Mode Options */}
          {validationResult?.success && (
            <div className="p-3 bg-[#f4f4f4] dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#393939] space-y-2">
              <span className="text-xs font-semibold block text-[#161616] dark:text-[#f4f4f4]">
                Import Mode Strategy:
              </span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="accent-[#0f62fe]"
                  />
                  <span>Merge into current workspace</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer text-[#da1e28]">
                  <input
                    type="radio"
                    name="importMode"
                    value="overwrite"
                    checked={importMode === 'overwrite'}
                    onChange={() => setImportMode('overwrite')}
                    className="accent-[#da1e28]"
                  />
                  <span>Overwrite entire local database</span>
                </label>
              </div>

              <div className="pt-2">
                <CarbonButton
                  kind={importMode === 'overwrite' ? 'danger' : 'primary'}
                  size="md"
                  disabled={isProcessing}
                  onClick={handleExecuteImport}
                  icon={isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {isProcessing
                    ? 'Importing...'
                    : importMode === 'overwrite'
                    ? 'Confirm Overwrite & Restore'
                    : 'Merge Records into Database'}
                </CarbonButton>
              </div>
            </div>
          )}
        </div>
      )}
    </CarbonModal>
  );
};
