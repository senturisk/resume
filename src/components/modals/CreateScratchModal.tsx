import React, { useState } from 'react';
import { Layers, GitBranch, Plus, Sparkles, FileText, Check } from 'lucide-react';
import { CarbonModal } from '../carbon/CarbonTagAndModal';
import { CarbonButton } from '../carbon/CarbonButton';
import { CarbonTextInput } from '../carbon/CarbonInputs';

export interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, domain: string, startFromScratch: boolean) => Promise<void>;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [profileName, setProfileName] = useState('');
  const [targetDomain, setTargetDomain] = useState('');
  const [startFromScratch, setStartFromScratch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(
        profileName.trim(),
        targetDomain.trim() || 'General Professional Track',
        startFromScratch
      );
      setProfileName('');
      setTargetDomain('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CarbonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Career Profile from Scratch"
      subtitle="Establish a new career identity, target domain, and ATS resume container."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <CarbonTextInput
          id="scratch_prof_name"
          labelText="Profile Name"
          placeholder="e.g. AI Research & Machine Learning"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          helperText="Unique identifier for this career persona or job focus"
          required
        />

        <CarbonTextInput
          id="scratch_prof_domain"
          labelText="Target Career Track / Industry Domain"
          placeholder="e.g. Artificial Intelligence, Data Science, Full-Stack"
          value={targetDomain}
          onChange={(e) => setTargetDomain(e.target.value)}
          helperText="Used for contextual ATS keyword and job description matching"
        />

        <div className="space-y-2 pt-2 border-t border-[#e0e0e0] dark:border-[#393939]">
          <label className="text-xs font-semibold text-[#161616] dark:text-[#f4f4f4] block">
            Initial Resume Architecture:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStartFromScratch(true)}
              className={`p-3 text-left border transition-all cursor-pointer ${
                startFromScratch
                  ? 'border-[#0f62fe] bg-[#edf5ff] dark:bg-[#002d9c]/20'
                  : 'border-[#8d8d8d] dark:border-[#525252] bg-white dark:bg-[#262626]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-[#161616] dark:text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#0f62fe]" />
                  Blank Slate
                </span>
                {startFromScratch && <Check className="w-3.5 h-3.5 text-[#0f62fe]" />}
              </div>
              <p className="text-[11px] text-[#525252] dark:text-[#a8a8a8]">
                Empty sections ready for brand-new candidate data.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStartFromScratch(false)}
              className={`p-3 text-left border transition-all cursor-pointer ${
                !startFromScratch
                  ? 'border-[#0f62fe] bg-[#edf5ff] dark:bg-[#002d9c]/20'
                  : 'border-[#8d8d8d] dark:border-[#525252] bg-white dark:bg-[#262626]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-[#161616] dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0f62fe]" />
                  Starter Structure
                </span>
                {!startFromScratch && <Check className="w-3.5 h-3.5 text-[#0f62fe]" />}
              </div>
              <p className="text-[11px] text-[#525252] dark:text-[#a8a8a8]">
                Pre-populated layout structure with placeholder guides.
              </p>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#e0e0e0] dark:border-[#393939]">
          <CarbonButton size="md" kind="secondary" onClick={onClose} type="button">
            Cancel
          </CarbonButton>
          <CarbonButton
            size="md"
            kind="primary"
            type="submit"
            disabled={!profileName.trim() || isSubmitting}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Profile
          </CarbonButton>
        </div>
      </form>
    </CarbonModal>
  );
};

export interface CreateVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfileName?: string;
  currentVersionTitle?: string;
  onSubmit: (title: string, tag: string, mode: 'scratch' | 'clone') => Promise<void>;
}

export const CreateVersionModal: React.FC<CreateVersionModalProps> = ({
  isOpen,
  onClose,
  activeProfileName,
  currentVersionTitle,
  onSubmit,
}) => {
  const [versionTitle, setVersionTitle] = useState('');
  const [versionTag, setVersionTag] = useState('v1.0');
  const [mode, setMode] = useState<'scratch' | 'clone'>('scratch');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(versionTitle.trim(), versionTag.trim() || 'v1.0', mode);
      setVersionTitle('');
      setVersionTag('v1.0');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CarbonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Resume Version"
      subtitle={`Branch a new tailored resume under "${activeProfileName || 'Active Profile'}".`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <CarbonTextInput
          id="scratch_ver_title"
          labelText="Version Title / Target Role"
          placeholder="e.g. Senior Backend Engineer - FinTech Focus"
          value={versionTitle}
          onChange={(e) => setVersionTitle(e.target.value)}
          helperText="Descriptive title for this specific job application or resume branch"
          required
        />

        <div className="w-full sm:w-1/2">
          <CarbonTextInput
            id="scratch_ver_tag"
            labelText="Version Tag"
            placeholder="v1.0, v2.0, or v1.1"
            value={versionTag}
            onChange={(e) => setVersionTag(e.target.value)}
            helperText="Semantic release tag for version tracking"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-[#e0e0e0] dark:border-[#393939]">
          <label className="text-xs font-semibold text-[#161616] dark:text-[#f4f4f4] block">
            Version Creation Mode:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('scratch')}
              className={`p-3 text-left border transition-all cursor-pointer ${
                mode === 'scratch'
                  ? 'border-[#0f62fe] bg-[#edf5ff] dark:bg-[#002d9c]/20'
                  : 'border-[#8d8d8d] dark:border-[#525252] bg-white dark:bg-[#262626]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-[#161616] dark:text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#0f62fe]" />
                  From Scratch (Blank)
                </span>
                {mode === 'scratch' && <Check className="w-3.5 h-3.5 text-[#0f62fe]" />}
              </div>
              <p className="text-[11px] text-[#525252] dark:text-[#a8a8a8]">
                Start with a fresh, empty resume for this specific position.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('clone')}
              className={`p-3 text-left border transition-all cursor-pointer ${
                mode === 'clone'
                  ? 'border-[#0f62fe] bg-[#edf5ff] dark:bg-[#002d9c]/20'
                  : 'border-[#8d8d8d] dark:border-[#525252] bg-white dark:bg-[#262626]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-[#161616] dark:text-white flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-[#0f62fe]" />
                  Branch from Current
                </span>
                {mode === 'clone' && <Check className="w-3.5 h-3.5 text-[#0f62fe]" />}
              </div>
              <p className="text-[11px] text-[#525252] dark:text-[#a8a8a8]">
                Clone data from &ldquo;{currentVersionTitle || 'active version'}&rdquo;.
              </p>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#e0e0e0] dark:border-[#393939]">
          <CarbonButton size="md" kind="secondary" onClick={onClose} type="button">
            Cancel
          </CarbonButton>
          <CarbonButton
            size="md"
            kind="primary"
            type="submit"
            disabled={!versionTitle.trim() || isSubmitting}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Version
          </CarbonButton>
        </div>
      </form>
    </CarbonModal>
  );
};
