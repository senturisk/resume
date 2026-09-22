import React, { useState } from 'react';
import {
  Layers,
  GitBranch,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  Star,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, ResumeVersion } from '../../types/resume';
import { CarbonModal } from '../carbon/CarbonTagAndModal';
import { CarbonButton } from '../carbon/CarbonButton';
import { CarbonTextInput } from '../carbon/CarbonInputs';

export interface ProfileVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  versions: ResumeVersion[];
  activeProfile: UserProfile | null;
  activeVersion: ResumeVersion | null;
  onSelectProfile: (profileId: string) => void;
  onSelectVersion: (versionId: string) => void;
  onCreateProfile: (name: string, domain: string) => Promise<void>;
  onDeleteProfile: (profileId: string) => Promise<void>;
  onCreateVersion: (title: string, tag: string, cloneFromId?: string) => Promise<void>;
  onDeleteVersion: (versionId: string) => Promise<void>;
  onSetDefaultVersion: (profileId: string, versionId: string) => Promise<void>;
}

export const ProfileVersionModal: React.FC<ProfileVersionModalProps> = ({
  isOpen,
  onClose,
  profiles,
  versions,
  activeProfile,
  activeVersion,
  onSelectProfile,
  onSelectVersion,
  onCreateProfile,
  onDeleteProfile,
  onCreateVersion,
  onDeleteVersion,
  onSetDefaultVersion,
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'versions'>('versions');

  // New Profile Form State
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDomain, setNewProfileDomain] = useState('');

  // New Version Form State
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionTag, setNewVersionTag] = useState('v1.0');
  const [cloneFromCurrent, setCloneFromCurrent] = useState(true);

  // Filter versions belonging to the active profile
  const profileVersions = versions.filter((v) => v.profileId === activeProfile?.id);

  const handleCreateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    await onCreateProfile(newProfileName.trim(), newProfileDomain.trim() || 'General');
    setNewProfileName('');
    setNewProfileDomain('');
    setIsCreatingProfile(false);
  };

  const handleCreateVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTitle.trim()) return;
    await onCreateVersion(
      newVersionTitle.trim(),
      newVersionTag.trim() || 'v1.0',
      cloneFromCurrent ? activeVersion?.id : undefined
    );
    setNewVersionTitle('');
    setNewVersionTag('v1.0');
    setIsCreatingVersion(false);
  };

  return (
    <CarbonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile & Version Control Studio"
      subtitle="Organize multi-track careers, target roles, and tailored resume branches."
      size="lg"
    >
      {/* Navigation tabs */}
      <div className="flex border-b border-[#e0e0e0] dark:border-[#393939] mb-4">
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'versions'
              ? 'border-[#0f62fe] text-[#0f62fe] dark:text-[#78a9ff] font-semibold'
              : 'border-transparent text-[#525252] dark:text-[#c6c6c6]'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Resume Versions ({profileVersions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'profiles'
              ? 'border-[#0f62fe] text-[#0f62fe] dark:text-[#78a9ff] font-semibold'
              : 'border-transparent text-[#525252] dark:text-[#c6c6c6]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Profiles ({profiles.length})</span>
        </button>
      </div>

      {/* Versions Management Tab */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#f4f4f4] dark:bg-[#161616] p-3 border border-[#e0e0e0] dark:border-[#393939]">
            <div>
              <span className="text-xs text-[#6f6f6f] dark:text-[#a8a8a8]">Active Profile:</span>
              <span className="ml-2 font-semibold text-sm text-[#161616] dark:text-[#f4f4f4]">
                {activeProfile?.name}
              </span>
            </div>
            {!isCreatingVersion && (
              <CarbonButton
                size="sm"
                kind="primary"
                onClick={() => setIsCreatingVersion(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Branch New Version
              </CarbonButton>
            )}
          </div>

          {/* New Version Inline Form */}
          {isCreatingVersion && (
            <form
              onSubmit={handleCreateVersionSubmit}
              className="p-4 bg-[#f4f4f4] dark:bg-[#161616] border-2 border-[#0f62fe] space-y-3"
            >
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#0f62fe]" />
                <span>Create New Version Branch</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <CarbonTextInput
                    id="version_title"
                    labelText="Version Title (e.g. Meta - Senior Staff SRE)"
                    value={newVersionTitle}
                    onChange={(e) => setNewVersionTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <CarbonTextInput
                    id="version_tag"
                    labelText="Version Tag (e.g. v2.0)"
                    value={newVersionTag}
                    onChange={(e) => setNewVersionTag(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="clone_data"
                  checked={cloneFromCurrent}
                  onChange={(e) => setCloneFromCurrent(e.target.checked)}
                  className="accent-[#0f62fe]"
                />
                <label htmlFor="clone_data" className="text-xs text-[#525252] dark:text-[#c6c6c6] cursor-pointer">
                  Clone content from currently active version ({activeVersion?.title})
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <CarbonButton
                  size="sm"
                  kind="secondary"
                  type="button"
                  onClick={() => setIsCreatingVersion(false)}
                >
                  Cancel
                </CarbonButton>
                <CarbonButton size="sm" kind="primary" type="submit">
                  Save Version
                </CarbonButton>
              </div>
            </form>
          )}

          {/* Version List */}
          <div className="divide-y divide-[#e0e0e0] dark:divide-[#393939] border border-[#e0e0e0] dark:border-[#393939]">
            {profileVersions.map((ver) => {
              const isSelected = ver.id === activeVersion?.id;
              const isDefault = ver.id === activeProfile?.defaultVersionId;

              return (
                <div
                  key={ver.id}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#edf5ff] dark:bg-[#002d9c]/30 border-l-4 border-[#0f62fe]'
                      : 'hover:bg-[#f4f4f4] dark:hover:bg-[#333333]'
                  }`}
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onSelectVersion(ver.id)}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-1.5 py-0.5 bg-[#e0e0e0] dark:bg-[#393939] text-[#161616] dark:text-[#f4f4f4] rounded-sm font-semibold">
                        {ver.versionTag}
                      </span>
                      <span className="font-semibold text-sm text-[#161616] dark:text-[#f4f4f4]">
                        {ver.title}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] px-1.5 py-0.2 bg-[#0f62fe] text-white rounded-sm">
                          Active
                        </span>
                      )}
                      {isDefault && (
                        <span className="text-[11px] px-1.5 py-0.2 bg-[#e0e0e0] dark:bg-[#525252] text-[#161616] dark:text-[#f4f4f4] rounded-sm flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current text-yellow-500" /> Default
                        </span>
                      )}
                    </div>
                    {ver.targetRole && (
                      <p className="text-xs text-[#525252] dark:text-[#c6c6c6] mt-0.5">
                        Target Role: {ver.targetRole}
                      </p>
                    )}
                    <p className="text-[11px] text-[#8d8d8d] mt-0.5">
                      Last edited {new Date(ver.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isDefault && activeProfile && (
                      <button
                        onClick={() => onSetDefaultVersion(activeProfile.id, ver.id)}
                        className="p-1.5 text-xs text-[#525252] dark:text-[#c6c6c6] hover:text-[#0f62fe] transition-colors"
                        title="Set as Default Version for this Profile"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    {profileVersions.length > 1 && (
                      <button
                        onClick={() => onDeleteVersion(ver.id)}
                        className="p-1.5 text-xs text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13] transition-colors"
                        title="Delete this Version"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Profiles Management Tab */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#f4f4f4] dark:bg-[#161616] p-3 border border-[#e0e0e0] dark:border-[#393939]">
            <p className="text-xs text-[#525252] dark:text-[#c6c6c6]">
              Profiles isolate entire industry categories or career identities.
            </p>
            {!isCreatingProfile && (
              <CarbonButton
                size="sm"
                kind="primary"
                onClick={() => setIsCreatingProfile(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                New Profile
              </CarbonButton>
            )}
          </div>

          {isCreatingProfile && (
            <form
              onSubmit={handleCreateProfileSubmit}
              className="p-4 bg-[#f4f4f4] dark:bg-[#161616] border-2 border-[#0f62fe] space-y-3"
            >
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0f62fe]" />
                <span>Create New Profile Track</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CarbonTextInput
                  id="profile_name"
                  labelText="Profile Name (e.g. Solutions Architecture)"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  required
                />
                <CarbonTextInput
                  id="profile_domain"
                  labelText="Target Domain (e.g. Enterprise Cloud)"
                  value={newProfileDomain}
                  onChange={(e) => setNewProfileDomain(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <CarbonButton
                  size="sm"
                  kind="secondary"
                  type="button"
                  onClick={() => setIsCreatingProfile(false)}
                >
                  Cancel
                </CarbonButton>
                <CarbonButton size="sm" kind="primary" type="submit">
                  Save Profile
                </CarbonButton>
              </div>
            </form>
          )}

          <div className="divide-y divide-[#e0e0e0] dark:divide-[#393939] border border-[#e0e0e0] dark:border-[#393939]">
            {profiles.map((prof) => {
              const isSelected = prof.id === activeProfile?.id;
              const count = versions.filter((v) => v.profileId === prof.id).length;

              return (
                <div
                  key={prof.id}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#edf5ff] dark:bg-[#002d9c]/30 border-l-4 border-[#0f62fe]'
                      : 'hover:bg-[#f4f4f4] dark:hover:bg-[#333333]'
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectProfile(prof.id);
                      setActiveTab('versions');
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#161616] dark:text-[#f4f4f4]">
                        {prof.name}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] px-1.5 py-0.2 bg-[#0f62fe] text-white rounded-sm">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#525252] dark:text-[#c6c6c6]">
                      <span>{prof.targetDomain}</span>
                      <span>•</span>
                      <span>{count} version{count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {profiles.length > 1 && (
                      <button
                        onClick={() => onDeleteProfile(prof.id)}
                        className="p-1.5 text-xs text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13] transition-colors"
                        title="Delete this Profile and its Versions"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </CarbonModal>
  );
};
