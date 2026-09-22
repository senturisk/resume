import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  RotateCcw,
  ArrowRight,
  Info,
  Loader2,
  User,
} from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { parseUniversalResume, ParseResult } from '../../services/resumeParser';
import { analyzeResumeATS } from '../../services/atsEngine';
import { CarbonModal } from '../carbon/CarbonTagAndModal';
import { CarbonButton } from '../carbon/CarbonButton';
import { CarbonTag } from '../carbon/CarbonTagAndModal';

export interface UniversalResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPopulateResume: (profileName: string, targetDomain: string, data: ResumeData) => void;
}

export const UniversalResumeUploadModal: React.FC<UniversalResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onPopulateResume,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ParseResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setParsedResult(null);
    setStatusMessage(`Analyzing "${file.name}"...`);

    try {
      const isJson = file.name.endsWith('.json') || file.type.includes('json');
      const isPdf = file.name.endsWith('.pdf') || file.type.includes('pdf');

      if (isPdf) {
        setStatusMessage('Extracting PDF binary document...');
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            setStatusMessage('Parsing candidate profile, work history & skills...');
            const result = await parseUniversalResume({
              fileBase64: base64,
              mimeType: 'application/pdf',
              fileName: file.name,
            });
            setParsedResult(result);
            setIsProcessing(false);
          } catch (err: any) {
            setErrorMessage(err.message || 'Failed to parse PDF document.');
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Text / Markdown / JSON / other
        const text = await file.text();
        setStatusMessage('Parsing resume content...');
        const result = await parseUniversalResume({
          text,
          fileName: file.name,
        });
        setParsedResult(result);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while processing the file.');
      setIsProcessing(false);
    }
  };

  const handleProcessPastedText = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('Please paste resume text into the box.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setParsedResult(null);
    setStatusMessage('Analyzing pasted resume text structure...');

    try {
      const result = await parseUniversalResume({
        text: pastedText,
        fileName: 'pasted_resume.txt',
      });
      setParsedResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process pasted resume text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPopulation = () => {
    if (!parsedResult) return;
    onPopulateResume(
      parsedResult.profileName,
      parsedResult.targetDomain,
      parsedResult.resumeData
    );
    onClose();
  };

  // Preview ATS score of parsed result if available
  const parsedATSReport = parsedResult
    ? analyzeResumeATS(parsedResult.resumeData)
    : null;

  return (
    <CarbonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Universal Resume Ingestion & Profile Populator"
      size="lg"
    >
      <div className="space-y-4 text-xs font-sans">
        <p className="text-[#525252] dark:text-[#c6c6c6]">
          Upload any existing resume (<span className="font-mono">PDF, DOCX, TXT, JSON</span>) or paste raw text.
          Sen Resume automatically parses the data, audits ATS quality, and creates a customized profile and version.
        </p>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e0e0e0] dark:border-[#393939]">
          <button
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-[#0f62fe] text-[#0f62fe] dark:text-[#78a9ff]'
                : 'border-transparent text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (PDF / DOC / TXT)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('paste');
              setErrorMessage(null);
            }}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-[#0f62fe] text-[#0f62fe] dark:text-[#78a9ff]'
                : 'border-transparent text-[#525252] dark:text-[#c6c6c6] hover:text-[#161616]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Resume Text</span>
          </button>
        </div>

        {/* TAB 1: File Upload */}
        {activeTab === 'upload' && !parsedResult && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[#0f62fe] bg-[#edf5ff] dark:bg-[#002d9c]/20'
                  : 'border-[#8d8d8d] dark:border-[#525252] bg-[#f4f4f4] dark:bg-[#262626] hover:border-[#0f62fe]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.docx,.doc,.md,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-[#0f62fe] mx-auto mb-2" />
              <p className="font-semibold text-sm text-[#161616] dark:text-[#f4f4f4] mb-1">
                Drop your resume file here or click to browse
              </p>
              <p className="text-xs text-[#525252] dark:text-[#a8a8a8]">
                Supports PDF, Word Documents, Plain Text, Markdown, and JSON
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Paste Raw Text */}
        {activeTab === 'paste' && !parsedResult && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#161616] dark:text-[#f4f4f4] block">
              Paste Complete Resume Text Below:
            </label>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste candidate name, contact, summary, work history with bullets, education, and skills..."
              className="w-full p-3 font-mono text-xs bg-[#f4f4f4] dark:bg-[#262626] border border-[#8d8d8d] dark:border-[#525252] focus:border-[#0f62fe] focus:outline-none"
            />
            <div className="flex justify-end">
              <CarbonButton
                size="md"
                kind="primary"
                onClick={handleProcessPastedText}
                disabled={isProcessing || !pastedText.trim()}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Parse & Populate Profile
              </CarbonButton>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {isProcessing && (
          <div className="p-6 bg-[#edf5ff] dark:bg-[#002d9c]/20 border border-[#0f62fe] flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#0f62fe] animate-spin shrink-0" />
            <div>
              <p className="font-semibold text-xs text-[#0f62fe] dark:text-[#78a9ff]">
                Universal Parsing in Progress
              </p>
              <p className="text-[11px] text-[#525252] dark:text-[#c6c6c6]">{statusMessage}</p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-[#fff1f1] dark:bg-[#750e13]/30 border border-[#da1e28] text-xs text-[#da1e28] dark:text-[#ff8389] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Parsed Result Preview Card */}
        {parsedResult && (
          <div className="p-4 bg-[#f4f4f4] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] dark:border-[#393939]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#24a148]" />
                <span className="font-semibold text-xs text-[#161616] dark:text-[#f4f4f4]">
                  Successfully Parsed Candidate Profile
                </span>
              </div>
              <CarbonTag type="teal" size="sm">
                Engine: {parsedResult.source}
              </CarbonTag>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-white dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#393939]">
                <div className="text-[10px] text-[#525252] dark:text-[#a8a8a8]">Candidate Name</div>
                <div className="font-semibold text-[#161616] dark:text-[#f4f4f4] truncate">
                  {parsedResult.resumeData.personalInfo.fullName}
                </div>
              </div>

              <div className="p-2 bg-white dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#393939]">
                <div className="text-[10px] text-[#525252] dark:text-[#a8a8a8]">Work Experiences</div>
                <div className="font-semibold text-[#161616] dark:text-[#f4f4f4]">
                  {parsedResult.resumeData.workExperiences.length} Roles
                </div>
              </div>

              <div className="p-2 bg-white dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#393939]">
                <div className="text-[10px] text-[#525252] dark:text-[#a8a8a8]">Skills Extracted</div>
                <div className="font-semibold text-[#161616] dark:text-[#f4f4f4]">
                  {parsedResult.resumeData.skills.length} Skills
                </div>
              </div>

              <div className="p-2 bg-white dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#393939]">
                <div className="text-[10px] text-[#525252] dark:text-[#a8a8a8]">Initial ATS Score</div>
                <div className="font-semibold text-[#0f62fe] dark:text-[#78a9ff]">
                  {parsedATSReport ? `${parsedATSReport.overallScore}/100` : 'Pending'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setParsedResult(null)}
                className="text-xs text-[#525252] dark:text-[#a8a8a8] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Upload a different resume</span>
              </button>

              <CarbonButton
                size="md"
                kind="primary"
                onClick={handleConfirmPopulation}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Populate & Activate Profile
              </CarbonButton>
            </div>
          </div>
        )}
      </div>
    </CarbonModal>
  );
};
