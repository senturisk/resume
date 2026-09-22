/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Eye,
  Edit3,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  UserProfile,
  ResumeVersion,
  ResumeData,
  ImportExportPackage,
} from './types/resume';
import { storageAdapter } from './services/storageAdapter';
import { SAMPLE_PROFILES, SAMPLE_VERSIONS } from './services/sampleData';
import { analyzeResumeATS } from './services/atsEngine';
import { CarbonHeader } from './components/carbon/CarbonHeader';
import { ResumeEditor } from './components/editor/ResumeEditor';
import { ResumePreview } from './components/preview/ResumePreview';
import { ATSAnalyzerDrawer } from './components/ats/ATSAnalyzerDrawer';
import { ImportExportModal } from './components/modals/ImportExportModal';
import { ProfileVersionModal } from './components/modals/ProfileVersionModal';
import { UniversalResumeUploadModal } from './components/modals/UniversalResumeUploadModal';
import { CreateProfileModal, CreateVersionModal } from './components/modals/CreateScratchModal';

export const BLANK_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
  },
  workExperiences: [],
  educations: [],
  skills: [],
  projects: [],
  certifications: [],
  customSections: [],
  sectionOrder: [
    'summary',
    'experience',
    'skills',
    'projects',
    'education',
    'certifications',
  ],
  formatting: {
    template: 'carbon-classic',
    fontFamily: 'ibm-plex-sans',
    fontSize: 'normal',
    margins: 'standard',
    accentColor: '#0f62fe',
    showDividerLines: true,
    dateFormat: 'Mon YYYY',
  },
};

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('sen_resume_theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  // Mobile / Tablet View Mode: 'editor' | 'preview'
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Persistence State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<ResumeVersion | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isLoading, setIsLoading] = useState(true);

  // ATS Optimization & Job Match state
  const [targetJobDescription, setTargetJobDescription] = useState<string>('');

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState(false);
  const [isCreateVersionModalOpen, setIsCreateVersionModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [isUniversalUploadModalOpen, setIsUniversalUploadModalOpen] = useState(false);

  // Debounced auto-save timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sen_resume_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sen_resume_theme', 'light');
    }
  }, [isDarkMode]);

  // Initial Load from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        await storageAdapter.init();
        let loadedProfiles = await storageAdapter.getProfiles();
        let loadedVersions = await storageAdapter.getVersions();

        // Remove any legacy Elena Vance profiles & versions from IndexedDB
        const legacyElenaProfiles = loadedProfiles.filter(
          (p) => p.id.includes('elena') || p.name.toLowerCase().includes('elena')
        );
        if (legacyElenaProfiles.length > 0) {
          for (const ep of legacyElenaProfiles) {
            await storageAdapter.deleteProfile(ep.id);
          }
          loadedProfiles = await storageAdapter.getProfiles();
          loadedVersions = await storageAdapter.getVersions();
        }

        // Ensure Dewan Mukto canonical profile exists in storage
        const hasMukto = loadedProfiles.some((p) => p.id === 'profile_dewan_mukto');
        if (loadedProfiles.length === 0 || loadedVersions.length === 0 || !hasMukto) {
          for (const p of SAMPLE_PROFILES) {
            await storageAdapter.saveProfile(p);
          }
          for (const v of SAMPLE_VERSIONS) {
            await storageAdapter.saveVersion(v);
          }
          loadedProfiles = await storageAdapter.getProfiles();
          loadedVersions = await storageAdapter.getVersions();
        }

        setProfiles(loadedProfiles);
        setVersions(loadedVersions);

        // Restore active selection or prioritize Dewan Mukto default
        const activeSel = await storageAdapter.getActiveSelection();
        const matchedProfile =
          loadedProfiles.find((p) => p.id === activeSel?.profileId) ||
          loadedProfiles.find((p) => p.id === 'profile_dewan_mukto') ||
          loadedProfiles[0];
        setActiveProfile(matchedProfile);

        const profileVersions = loadedVersions.filter((v) => v.profileId === matchedProfile.id);
        const matchedVersion =
          profileVersions.find((v) => v.id === activeSel?.versionId) ||
          profileVersions.find((v) => v.id === matchedProfile.defaultVersionId) ||
          profileVersions[0];
        setActiveVersion(matchedVersion || null);
      } catch (err) {
        console.error('Failed to initialize storage:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Update active version in database with debounce
  const handleDataChange = useCallback(
    (newData: ResumeData) => {
      if (!activeVersion) return;

      const updatedVersion: ResumeVersion = {
        ...activeVersion,
        updatedAt: new Date().toISOString(),
        data: newData,
      };

      setActiveVersion(updatedVersion);
      setSaveStatus('saving');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await storageAdapter.saveVersion(updatedVersion);
          setVersions((prev) =>
            prev.map((v) => (v.id === updatedVersion.id ? updatedVersion : v))
          );
          setSaveStatus('saved');
        } catch (err) {
          console.error('Auto-save failed:', err);
          setSaveStatus('unsaved');
        }
      }, 500);
    },
    [activeVersion]
  );

  // Switch Active Profile
  const handleSelectProfile = async (profileId: string) => {
    const prof = profiles.find((p) => p.id === profileId);
    if (!prof) return;

    setActiveProfile(prof);
    const profileVers = versions.filter((v) => v.profileId === prof.id);
    const defaultVer =
      profileVers.find((v) => v.id === prof.defaultVersionId) || profileVers[0];
    setActiveVersion(defaultVer || null);

    if (defaultVer) {
      await storageAdapter.setActiveSelection(prof.id, defaultVer.id);
    }
  };

  // Switch Active Version
  const handleSelectVersion = async (versionId: string) => {
    const ver = versions.find((v) => v.id === versionId);
    if (!ver) return;

    setActiveVersion(ver);
    if (activeProfile) {
      await storageAdapter.setActiveSelection(activeProfile.id, ver.id);
    }
  };

  // Profile creation
  const handleCreateProfile = async (name: string, domain: string) => {
    const newProfId = `prof_${Date.now()}`;
    const newVerId = `ver_${Date.now()}`;

    // Base new version on current active data or sample
    const initialData: ResumeData = activeVersion
      ? JSON.parse(JSON.stringify(activeVersion.data))
      : SAMPLE_VERSIONS[0].data;

    const newVersion: ResumeVersion = {
      id: newVerId,
      profileId: newProfId,
      parentVersionId: null,
      versionTag: 'v1.0',
      title: `${name} - Baseline v1.0`,
      targetRole: domain,
      notes: 'Initial version branch.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: initialData,
    };

    const newProfile: UserProfile = {
      id: newProfId,
      name,
      targetDomain: domain,
      description: '',
      defaultVersionId: newVerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storageAdapter.saveProfile(newProfile);
    await storageAdapter.saveVersion(newVersion);

    const updatedProfiles = [...profiles, newProfile];
    const updatedVersions = [...versions, newVersion];

    setProfiles(updatedProfiles);
    setVersions(updatedVersions);
    setActiveProfile(newProfile);
    setActiveVersion(newVersion);
    await storageAdapter.setActiveSelection(newProfId, newVerId);
  };

  // Profile deletion
  const handleDeleteProfile = async (profileId: string) => {
    if (profiles.length <= 1) {
      alert('You must retain at least one active profile.');
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this profile? All associated resume versions will be permanently removed.'
      )
    ) {
      return;
    }

    await storageAdapter.deleteProfile(profileId);
    const updatedProfiles = profiles.filter((p) => p.id !== profileId);
    const updatedVersions = versions.filter((v) => v.profileId !== profileId);

    setProfiles(updatedProfiles);
    setVersions(updatedVersions);

    const nextProf = updatedProfiles[0];
    setActiveProfile(nextProf);
    const nextVers = updatedVersions.filter((v) => v.profileId === nextProf.id);
    setActiveVersion(nextVers[0] || null);

    if (nextVers[0]) {
      await storageAdapter.setActiveSelection(nextProf.id, nextVers[0].id);
    }
  };

  // Version creation
  const handleCreateVersion = async (title: string, tag: string, cloneFromId?: string) => {
    if (!activeProfile) return;

    const sourceVer = cloneFromId ? versions.find((v) => v.id === cloneFromId) : activeVersion;
    const baseData: ResumeData = sourceVer
      ? JSON.parse(JSON.stringify(sourceVer.data))
      : SAMPLE_VERSIONS[0].data;

    const newVersion: ResumeVersion = {
      id: `ver_${Date.now()}`,
      profileId: activeProfile.id,
      parentVersionId: cloneFromId || null,
      versionTag: tag,
      title,
      targetRole: sourceVer?.targetRole || activeProfile.targetDomain,
      notes: `Branched from ${sourceVer?.title || 'root'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: baseData,
    };

    await storageAdapter.saveVersion(newVersion);
    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    setActiveVersion(newVersion);
    await storageAdapter.setActiveSelection(activeProfile.id, newVersion.id);
  };

  // Profile creation from scratch (+)
  const handleCreateProfileScratch = async (
    name: string,
    domain: string,
    startFromScratch: boolean
  ) => {
    const newProfId = `prof_${Date.now()}`;
    const newVerId = `ver_${Date.now()}`;

    const initialData: ResumeData = startFromScratch
      ? {
          ...BLANK_RESUME_DATA,
          personalInfo: {
            ...BLANK_RESUME_DATA.personalInfo,
            fullName: name,
          },
        }
      : activeVersion
      ? JSON.parse(JSON.stringify(activeVersion.data))
      : SAMPLE_VERSIONS[0].data;

    const newVersion: ResumeVersion = {
      id: newVerId,
      profileId: newProfId,
      parentVersionId: null,
      versionTag: 'v1.0',
      title: `${name} - Baseline v1.0`,
      targetRole: domain,
      notes: startFromScratch ? 'Created from scratch.' : 'Initial version branch.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: initialData,
    };

    const newProfile: UserProfile = {
      id: newProfId,
      name,
      targetDomain: domain,
      description: '',
      defaultVersionId: newVerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storageAdapter.saveProfile(newProfile);
    await storageAdapter.saveVersion(newVersion);

    const updatedProfiles = [...profiles, newProfile];
    const updatedVersions = [...versions, newVersion];

    setProfiles(updatedProfiles);
    setVersions(updatedVersions);
    setActiveProfile(newProfile);
    setActiveVersion(newVersion);
    await storageAdapter.setActiveSelection(newProfId, newVerId);
  };

  // Version creation from scratch (+)
  const handleCreateVersionScratch = async (
    title: string,
    tag: string,
    mode: 'scratch' | 'clone'
  ) => {
    if (!activeProfile) return;

    const baseData: ResumeData =
      mode === 'scratch'
        ? {
            ...BLANK_RESUME_DATA,
            personalInfo: {
              ...BLANK_RESUME_DATA.personalInfo,
              fullName: activeVersion?.data.personalInfo.fullName || activeProfile.name,
              email: activeVersion?.data.personalInfo.email || '',
              phone: activeVersion?.data.personalInfo.phone || '',
              location: activeVersion?.data.personalInfo.location || '',
              website: activeVersion?.data.personalInfo.website || '',
              linkedin: activeVersion?.data.personalInfo.linkedin || '',
              github: activeVersion?.data.personalInfo.github || '',
            },
          }
        : activeVersion
        ? JSON.parse(JSON.stringify(activeVersion.data))
        : SAMPLE_VERSIONS[0].data;

    const newVersion: ResumeVersion = {
      id: `ver_${Date.now()}`,
      profileId: activeProfile.id,
      parentVersionId: mode === 'clone' && activeVersion ? activeVersion.id : null,
      versionTag: tag,
      title,
      targetRole: activeProfile.targetDomain,
      notes: mode === 'scratch' ? 'Created from scratch.' : `Branched from ${activeVersion?.title || 'active'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: baseData,
    };

    await storageAdapter.saveVersion(newVersion);
    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    setActiveVersion(newVersion);
    await storageAdapter.setActiveSelection(activeProfile.id, newVersion.id);
  };

  // Version deletion
  const handleDeleteVersion = async (versionId: string) => {
    const profileVers = versions.filter((v) => v.profileId === activeProfile?.id);
    if (profileVers.length <= 1) {
      alert('A profile must keep at least one resume version.');
      return;
    }

    if (!confirm('Are you sure you want to delete this resume version?')) return;

    await storageAdapter.deleteVersion(versionId);
    const updatedVersions = versions.filter((v) => v.id !== versionId);
    setVersions(updatedVersions);

    if (activeVersion?.id === versionId) {
      const remaining = updatedVersions.filter((v) => v.profileId === activeProfile?.id);
      setActiveVersion(remaining[0] || null);
      if (activeProfile && remaining[0]) {
        await storageAdapter.setActiveSelection(activeProfile.id, remaining[0].id);
      }
    }
  };

  // Set default version
  const handleSetDefaultVersion = async (profileId: string, versionId: string) => {
    const prof = profiles.find((p) => p.id === profileId);
    if (!prof) return;

    const updatedProfile: UserProfile = {
      ...prof,
      defaultVersionId: versionId,
      updatedAt: new Date().toISOString(),
    };

    await storageAdapter.saveProfile(updatedProfile);
    setProfiles((prev) => prev.map((p) => (p.id === profileId ? updatedProfile : p)));
    if (activeProfile?.id === profileId) {
      setActiveProfile(updatedProfile);
    }
  };

  // Import handler (Full package or Single version)
  const handleImportComplete = async (
    mode: 'merge' | 'overwrite',
    importedData: ImportExportPackage | ResumeVersion
  ) => {
    if ('profiles' in importedData && 'versions' in importedData) {
      // Full Package
      await storageAdapter.importAll(importedData, mode);
      const newProfiles = await storageAdapter.getProfiles();
      const newVersions = await storageAdapter.getVersions();

      setProfiles(newProfiles);
      setVersions(newVersions);

      if (newProfiles.length > 0) {
        setActiveProfile(newProfiles[0]);
        const profVersions = newVersions.filter((v) => v.profileId === newProfiles[0].id);
        setActiveVersion(profVersions[0] || null);
      }
    } else {
      // Single version
      const ver = importedData as ResumeVersion;
      // Ensure profile exists or attach to current
      if (activeProfile) {
        ver.profileId = activeProfile.id;
        ver.id = `ver_imported_${Date.now()}`;
        await storageAdapter.saveVersion(ver);
        setVersions((prev) => [...prev, ver]);
        setActiveVersion(ver);
      }
    }
  };

  // Print execution
  const handlePrint = () => {
    window.print();
  };

  // Universal Resume Population Handler
  const handlePopulateResume = async (
    profileName: string,
    targetDomain: string,
    data: ResumeData
  ) => {
    const newProfId = `profile_${Date.now()}`;
    const newVerId = `ver_${Date.now()}_v1_0`;

    const newProfile: UserProfile = {
      id: newProfId,
      name: profileName,
      targetDomain: targetDomain || 'General Professional Track',
      description: `Universal resume profile generated for ${data.personalInfo.fullName}`,
      defaultVersionId: newVerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newVersion: ResumeVersion = {
      id: newVerId,
      profileId: newProfId,
      parentVersionId: null,
      versionTag: 'v1.0',
      title: data.personalInfo.headline || 'Base ATS Version',
      targetRole: data.personalInfo.headline || targetDomain || 'Target Role',
      notes: 'Imported via Universal Resume Ingestion Engine.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data,
    };

    await storageAdapter.saveProfile(newProfile);
    await storageAdapter.saveVersion(newVersion);

    const updatedProfiles = [newProfile, ...profiles];
    const updatedVersions = [newVersion, ...versions];

    setProfiles(updatedProfiles);
    setVersions(updatedVersions);
    setActiveProfile(newProfile);
    setActiveVersion(newVersion);
    await storageAdapter.setActiveSelection(newProfId, newVerId);

    // Switch view to preview so candidate immediately views the result
    setMobileView('preview');
  };

  // Compute ATS Optimization Report in real time
  const atsReport = activeVersion
    ? analyzeResumeATS(activeVersion.data, targetJobDescription)
    : analyzeResumeATS(SAMPLE_VERSIONS[0].data, targetJobDescription);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f4f4f4] dark:bg-[#161616] text-[#161616] dark:text-[#f4f4f4]">
        <div className="w-10 h-10 border-4 border-[#0f62fe] border-t-transparent animate-spin rounded-full mb-3" />
        <p className="text-sm font-sans font-medium">Initializing Sen Resume Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] dark:bg-[#161616] font-sans antialiased text-[#161616] dark:text-[#f4f4f4]">
      {/* Carbon 48px Header */}
      <CarbonHeader
        profiles={profiles}
        activeProfile={activeProfile}
        versions={versions.filter((v) => v.profileId === activeProfile?.id)}
        activeVersion={activeVersion}
        onSelectProfile={handleSelectProfile}
        onSelectVersion={handleSelectVersion}
        onOpenProfileManager={() => setIsProfileModalOpen(true)}
        onCreateNewProfile={() => setIsCreateProfileModalOpen(true)}
        onCreateNewVersion={() => setIsCreateVersionModalOpen(true)}
        onOpenImportExport={() => setIsImportExportModalOpen(true)}
        onOpenATSAnalyzer={() => setIsATSModalOpen(true)}
        onOpenUniversalUpload={() => setIsUniversalUploadModalOpen(true)}
        onPrint={handlePrint}
        saveStatus={saveStatus}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        atsScore={atsReport.overallScore}
      />

      {/* Main Dual-Pane Studio Body (Carbon 2x Grid layout) */}
      <main className="flex-1 flex overflow-hidden relative" style={{ height: 'calc(100vh - 5rem)' }}>
        {/* Left Pane: Structured Data Editor */}
        <div
          className={`w-full lg:w-[48%] xl:w-[45%] h-full overflow-hidden shrink-0 ${
            mobileView === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          {activeVersion && (
            <ResumeEditor
              data={activeVersion.data}
              onChange={handleDataChange}
              onOpenATSAnalyzer={() => setIsATSModalOpen(true)}
              onOpenUniversalUpload={() => setIsUniversalUploadModalOpen(true)}
            />
          )}
        </div>

        {/* Right Pane: Live ATS PDF / Canvas Rendering Preview */}
        <div
          className={`flex-1 h-full overflow-hidden ${
            mobileView === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {activeVersion && (
            <ResumePreview
              data={activeVersion.data}
              onUpdateFormatting={(newFormatting) =>
                handleDataChange({
                  ...activeVersion.data,
                  formatting: newFormatting,
                })
              }
              onPrint={handlePrint}
            />
          )}
        </div>
      </main>

      {/* Carbon Standard Footer with Copyright */}
      <footer className="no-print h-8 bg-[#161616] text-[#8d8d8d] border-t border-[#393939] px-4 flex items-center justify-between text-xs font-sans shrink-0 select-none z-20">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#c6c6c6]">© Senturisk 2026</span>
          <span className="text-[#525252] hidden sm:inline">|</span>
          <span className="text-[#8d8d8d] hidden sm:inline">IBM Carbon Design System ATS Resume Studio</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-[#a8a8a8]">Client-Side Privacy First</span>
          <span className="text-[#525252]">•</span>
          <span className="text-[#a8a8a8]">Offline IndexedDB</span>
        </div>
      </footer>

      {/* Mobile Floating View Switcher Bar (Visible on mobile/tablet screens < lg:1056px) */}
      <div className="no-print lg:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-40 bg-[#161616] border border-[#525252] shadow-2xl p-1 flex items-center gap-1 rounded-none select-none">
        <button
          onClick={() => setMobileView('editor')}
          className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            mobileView === 'editor'
              ? 'bg-[#0f62fe] text-white'
              : 'text-[#c6c6c6] hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            mobileView === 'preview'
              ? 'bg-[#0f62fe] text-white'
              : 'text-[#c6c6c6] hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live ATS Preview</span>
        </button>
      </div>

      {/* ATS Optimization & Keyword Analysis Drawer */}
      <ATSAnalyzerDrawer
        isOpen={isATSModalOpen}
        onClose={() => setIsATSModalOpen(false)}
        report={atsReport}
        targetJobDescription={targetJobDescription}
        onJobDescriptionChange={setTargetJobDescription}
      />

      {/* Profile & Version Manager Modal */}
      <ProfileVersionModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        versions={versions}
        activeProfile={activeProfile}
        activeVersion={activeVersion}
        onSelectProfile={handleSelectProfile}
        onSelectVersion={handleSelectVersion}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        onCreateVersion={handleCreateVersion}
        onDeleteVersion={handleDeleteVersion}
        onSetDefaultVersion={handleSetDefaultVersion}
      />

      {/* Create Profile from Scratch Modal */}
      <CreateProfileModal
        isOpen={isCreateProfileModalOpen}
        onClose={() => setIsCreateProfileModalOpen(false)}
        onSubmit={handleCreateProfileScratch}
      />

      {/* Create Version from Scratch Modal */}
      <CreateVersionModal
        isOpen={isCreateVersionModalOpen}
        onClose={() => setIsCreateVersionModalOpen(false)}
        activeProfileName={activeProfile?.name}
        currentVersionTitle={activeVersion?.title}
        onSubmit={handleCreateVersionScratch}
      />

      {/* Import / Export & Data Portability Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        activeVersion={activeVersion}
        onImportComplete={handleImportComplete}
      />

      {/* Universal Resume Upload & Ingestion Engine Modal */}
      <UniversalResumeUploadModal
        isOpen={isUniversalUploadModalOpen}
        onClose={() => setIsUniversalUploadModalOpen(false)}
        onPopulateResume={handlePopulateResume}
      />
    </div>
  );
}
