import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
  Sparkles,
  Target,
  BarChart,
  ArrowRight,
  X,
} from 'lucide-react';
import { ATSOptimizationReport } from '../../types/resume';

export interface ATSAnalyzerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: ATSOptimizationReport;
  targetJobDescription: string;
  onJobDescriptionChange: (jd: string) => void;
}

export const ATSAnalyzerDrawer: React.FC<ATSAnalyzerDrawerProps> = ({
  isOpen,
  onClose,
  report,
  targetJobDescription,
  onJobDescriptionChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-[1px] flex justify-end">
      <div className="w-full max-w-xl bg-[#ffffff] dark:bg-[#161616] text-[#161616] dark:text-[#f4f4f4] h-full shadow-2xl flex flex-col border-l border-[#e0e0e0] dark:border-[#393939] animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-[#e0e0e0] dark:border-[#393939] flex items-center justify-between bg-[#f4f4f4] dark:bg-[#262626]">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-[#0f62fe]" />
            <div>
              <h2 className="font-semibold text-base font-sans">ATS Optimization Engine</h2>
              <p className="text-xs text-[#525252] dark:text-[#c6c6c6]">
                Applicant Tracking System scan, keyword density & audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#525252] dark:text-[#c6c6c6] hover:bg-[#e0e0e0] dark:hover:bg-[#393939]"
            aria-label="Close ATS panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Top Score Banner */}
          <div className="p-4 bg-[#f4f4f4] dark:bg-[#262626] border-l-4 border-[#0f62fe] flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-[#525252] dark:text-[#c6c6c6]">
                Overall ATS Readiness
              </div>
              <div className="text-2xl font-bold font-sans mt-0.5 flex items-baseline gap-2">
                <span>{report.overallScore}%</span>
                <span
                  className={`text-xs px-2 py-0.5 font-medium rounded-full ${
                    report.overallScore >= 85
                      ? 'bg-[#defbe6] text-[#0e6027] dark:bg-[#044317] dark:text-[#a7f0ba]'
                      : report.overallScore >= 70
                      ? 'bg-[#fef3d6] text-[#b28600] dark:bg-[#684e00] dark:text-[#fddc69]'
                      : 'bg-[#fff1f1] text-[#a2191f] dark:bg-[#750e13] dark:text-[#ffb3b8]'
                  }`}
                >
                  {report.rating}
                </span>
              </div>
            </div>

            {/* Density Quick Stats */}
            <div className="flex gap-4 text-right">
              <div>
                <div className="text-[11px] text-[#6f6f6f] dark:text-[#a8a8a8]">Words</div>
                <div className="font-mono text-sm font-semibold">
                  {report.keywordDensity.totalWords}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6f6f6f] dark:text-[#a8a8a8]">Action Verbs</div>
                <div className="font-mono text-sm font-semibold">
                  {report.keywordDensity.actionVerbRatio}%
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6f6f6f] dark:text-[#a8a8a8]">Metrics</div>
                <div className="font-mono text-sm font-semibold text-[#0f62fe]">
                  {report.keywordDensity.metricCount}
                </div>
              </div>
            </div>
          </div>

          {/* Target Job Description Matcher */}
          <div className="bg-[#ffffff] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <Target className="w-4 h-4 text-[#0f62fe]" />
                <span>Job Description Match Analyzer</span>
              </div>
              {report.jobMatch && (
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#edf5ff] text-[#0043ce] dark:bg-[#002d9c] dark:text-[#d0e2ff]">
                  {report.jobMatch.matchPercentage}% Matched
                </span>
              )}
            </div>

            <p className="text-xs text-[#525252] dark:text-[#c6c6c6]">
              Paste the target job description to analyze semantic keyword parity and identify missing terms.
            </p>

            <textarea
              value={targetJobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              placeholder="Paste job posting text here (e.g. responsibilities, required qualifications, key technologies)..."
              rows={3}
              className="w-full text-xs p-2.5 bg-[#f4f4f4] dark:bg-[#161616] border border-[#8d8d8d] dark:border-[#525252] focus:border-[#0f62fe] focus:outline-none"
            />

            {report.jobMatch && (
              <div className="pt-2 space-y-2 border-t border-[#e0e0e0] dark:border-[#393939]">
                {/* Matched Keywords */}
                <div>
                  <div className="text-[11px] font-medium text-[#24a148] dark:text-[#42be65] mb-1">
                    Matched Keywords ({report.jobMatch.matchedKeywords.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {report.jobMatch.matchedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] px-1.5 py-0.5 bg-[#defbe6] text-[#0e6027] dark:bg-[#044317] dark:text-[#a7f0ba] font-mono rounded-sm"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                {report.jobMatch.missingKeywords.length > 0 && (
                  <div>
                    <div className="text-[11px] font-medium text-[#da1e28] dark:text-[#fa4d56] mb-1">
                      Target Keywords Missing from Resume ({report.jobMatch.missingKeywords.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {report.jobMatch.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-[10px] px-1.5 py-0.5 bg-[#fff1f1] text-[#a2191f] dark:bg-[#750e13] dark:text-[#ffb3b8] font-mono rounded-sm"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audit Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-mono tracking-wider text-[#525252] dark:text-[#c6c6c6]">
              ATS Compliance Checklist
            </h3>

            <div className="divide-y divide-[#e0e0e0] dark:divide-[#393939] border border-[#e0e0e0] dark:border-[#393939] bg-[#ffffff] dark:bg-[#262626]">
              {report.checklist.map((item) => (
                <div key={item.id} className="p-3.5 flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#24a148]" />
                    ) : item.score > 4 ? (
                      <AlertTriangle className="w-4 h-4 text-[#f1c21b]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#da1e28]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#161616] dark:text-[#f4f4f4]">
                        {item.label}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-[#6f6f6f] dark:text-[#a8a8a8]">
                        {item.score}/10
                      </span>
                    </div>
                    <p className="text-xs text-[#525252] dark:text-[#c6c6c6] mt-0.5">
                      {item.description}
                    </p>
                    {item.recommendation && (
                      <div className="mt-2 text-xs p-2 bg-[#fef3d6] dark:bg-[#4d3800] text-[#744210] dark:text-[#fddc69] flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Keyword Density Top 15 */}
          <div className="bg-[#ffffff] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#161616] dark:text-[#f4f4f4]">
                Top Indexed Keywords in Active Resume
              </span>
              <span className="text-[10px] font-mono text-[#6f6f6f]">Frequency</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {report.keywordDensity.topKeywords.map((k) => (
                <span
                  key={k.word}
                  className="text-xs px-2 py-0.5 bg-[#f4f4f4] dark:bg-[#393939] text-[#161616] dark:text-[#f4f4f4] font-mono rounded-sm flex items-center gap-1.5 border border-[#e0e0e0] dark:border-[#525252]"
                >
                  <span>{k.word}</span>
                  <span className="text-[10px] bg-[#0f62fe] text-white px-1 rounded-sm">
                    {k.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
