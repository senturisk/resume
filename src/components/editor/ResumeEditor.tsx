import React, { useState } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Info,
  Check,
  Calendar,
  Layers,
  Upload,
} from 'lucide-react';
import {
  ResumeData,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  CustomSection,
} from '../../types/resume';
import {
  CarbonTextInput,
  CarbonTextArea,
  CarbonSelect,
} from '../carbon/CarbonInputs';
import { CarbonAccordionItem } from '../carbon/CarbonAccordion';
import { CarbonButton } from '../carbon/CarbonButton';
import { CarbonTag } from '../carbon/CarbonTagAndModal';

export interface ResumeEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onOpenATSAnalyzer: () => void;
  onOpenUniversalUpload?: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onChange,
  onOpenATSAnalyzer,
  onOpenUniversalUpload,
}) => {
  // Helper to update personal info
  const handlePersonalInfoChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  // ------------------------------------------
  // Work Experience Operations
  // ------------------------------------------
  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: `exp_${Date.now()}`,
      company: 'New Company Inc.',
      role: 'Staff Engineer',
      location: 'City, State (or Remote)',
      startDate: '2023-01',
      endDate: '',
      isCurrent: true,
      highlights: [
        'Architected core system component resulting in 30% performance improvement.',
      ],
      technologies: ['TypeScript', 'Cloud'],
    };
    onChange({
      ...data,
      workExperiences: [newExp, ...data.workExperiences],
    });
  };

  const updateWorkExperience = (index: number, updated: Partial<WorkExperience>) => {
    const updatedList = [...data.workExperiences];
    updatedList[index] = { ...updatedList[index], ...updated };
    onChange({ ...data, workExperiences: updatedList });
  };

  const deleteWorkExperience = (index: number) => {
    const updatedList = data.workExperiences.filter((_, i) => i !== index);
    onChange({ ...data, workExperiences: updatedList });
  };

  const addHighlightBullet = (expIndex: number) => {
    const exp = data.workExperiences[expIndex];
    const newBullets = [...exp.highlights, 'Spearheaded project initiative saving $150K annually.'];
    updateWorkExperience(expIndex, { highlights: newBullets });
  };

  const updateHighlightBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const exp = data.workExperiences[expIndex];
    const newBullets = [...exp.highlights];
    newBullets[bulletIndex] = text;
    updateWorkExperience(expIndex, { highlights: newBullets });
  };

  const deleteHighlightBullet = (expIndex: number, bulletIndex: number) => {
    const exp = data.workExperiences[expIndex];
    const newBullets = exp.highlights.filter((_, i) => i !== bulletIndex);
    updateWorkExperience(expIndex, { highlights: newBullets });
  };

  // ------------------------------------------
  // Education Operations
  // ------------------------------------------
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      institution: 'University Name',
      degree: 'B.S. in Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      location: 'City, State',
      gpa: '3.8',
      honors: ['Dean’s List'],
    };
    onChange({
      ...data,
      educations: [...data.educations, newEdu],
    });
  };

  const updateEducation = (index: number, updated: Partial<Education>) => {
    const updatedList = [...data.educations];
    updatedList[index] = { ...updatedList[index], ...updated };
    onChange({ ...data, educations: updatedList });
  };

  const deleteEducation = (index: number) => {
    const updatedList = data.educations.filter((_, i) => i !== index);
    onChange({ ...data, educations: updatedList });
  };

  // ------------------------------------------
  // Skills Operations
  // ------------------------------------------
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Core Languages');

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: Skill = {
      id: `sk_${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory.trim() || 'Technical Skills',
      level: 'Advanced',
      yearsOfExperience: 3,
    };

    onChange({
      ...data,
      skills: [...data.skills, newSkill],
    });
    setNewSkillName('');
  };

  const deleteSkill = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((s) => s.id !== id),
    });
  };

  // ------------------------------------------
  // Projects Operations
  // ------------------------------------------
  const addProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: 'Distributed Event Broker',
      role: 'Lead Developer',
      organization: 'Open Source',
      url: 'https://github.com/example/broker',
      startDate: '',
      endDate: '',
      description: 'Ultra-low latency streaming message queue built for real-time telemetry.',
      highlights: ['Achieved 200,000 msgs/sec throughput with sub-2ms replication.'],
      technologies: ['Go', 'gRPC'],
    };
    onChange({
      ...data,
      projects: [...data.projects, newProj],
    });
  };

  const updateProject = (index: number, updated: Partial<Project>) => {
    const updatedList = [...data.projects];
    updatedList[index] = { ...updatedList[index], ...updated };
    onChange({ ...data, projects: updatedList });
  };

  const deleteProject = (index: number) => {
    onChange({
      ...data,
      projects: data.projects.filter((_, i) => i !== index),
    });
  };

  // ------------------------------------------
  // Certifications Operations
  // ------------------------------------------
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert_${Date.now()}`,
      name: 'AWS Certified Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2023-08',
      expiryDate: '2026-08',
      credentialId: 'AWS-PSA-12948',
      credentialUrl: '',
    };
    onChange({
      ...data,
      certifications: [...data.certifications, newCert],
    });
  };

  const updateCertification = (index: number, updated: Partial<Certification>) => {
    const updatedList = [...data.certifications];
    updatedList[index] = { ...updatedList[index], ...updated };
    onChange({ ...data, certifications: updatedList });
  };

  const deleteCertification = (index: number) => {
    onChange({
      ...data,
      certifications: data.certifications.filter((_, i) => i !== index),
    });
  };

  // ------------------------------------------
  // Custom Sections Operations (e.g. Languages)
  // ------------------------------------------
  const addCustomSection = () => {
    const newSection = {
      id: `cust_${Date.now()}`,
      title: 'Languages',
      items: [
        {
          id: `item_${Date.now()}`,
          heading: 'English & Bengali',
          subheading: 'Native or Bilingual Proficiency',
          date: '',
          description: '',
          bullets: [],
        },
      ],
    };
    onChange({
      ...data,
      customSections: [...(data.customSections || []), newSection],
    });
  };

  const updateCustomSectionTitle = (secIndex: number, title: string) => {
    const list = [...(data.customSections || [])];
    list[secIndex] = { ...list[secIndex], title };
    onChange({ ...data, customSections: list });
  };

  const deleteCustomSection = (secIndex: number) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).filter((_, i) => i !== secIndex),
    });
  };

  const addCustomItem = (secIndex: number) => {
    const list = [...(data.customSections || [])];
    const target = list[secIndex];
    const newItem = {
      id: `item_${Date.now()}`,
      heading: 'Language or Credential',
      subheading: 'Proficiency Level or Status',
      date: '',
      description: '',
      bullets: [],
    };
    list[secIndex] = { ...target, items: [...target.items, newItem] };
    onChange({ ...data, customSections: list });
  };

  const updateCustomItem = (secIndex: number, itemIndex: number, updated: any) => {
    const list = [...(data.customSections || [])];
    const target = list[secIndex];
    const items = [...target.items];
    items[itemIndex] = { ...items[itemIndex], ...updated };
    list[secIndex] = { ...target, items };
    onChange({ ...data, customSections: list });
  };

  const deleteCustomItem = (secIndex: number, itemIndex: number) => {
    const list = [...(data.customSections || [])];
    const target = list[secIndex];
    list[secIndex] = { ...target, items: target.items.filter((_, i) => i !== itemIndex) };
    onChange({ ...data, customSections: list });
  };

  return (
    <div className="flex flex-col h-full bg-[#ffffff] dark:bg-[#161616] border-r border-[#e0e0e0] dark:border-[#393939] overflow-y-auto">
      {/* Editor Header Banner */}
      <div className="p-4 bg-[#f4f4f4] dark:bg-[#262626] border-b border-[#e0e0e0] dark:border-[#393939] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#161616] dark:text-[#f4f4f4] flex items-center gap-2">
            <User className="w-4 h-4 text-[#0f62fe]" />
            <span>Resume Data Architecture</span>
          </h2>
          <p className="text-xs text-[#525252] dark:text-[#c6c6c6]">
            Structured inputs optimized for ATS text extraction parsers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenUniversalUpload && (
            <button
              onClick={onOpenUniversalUpload}
              className="text-xs bg-[#e8f1ff] dark:bg-[#002d9c]/30 text-[#0f62fe] dark:text-[#78a9ff] hover:bg-[#d0e2ff] dark:hover:bg-[#002d9c]/50 px-2 py-1 flex items-center gap-1 font-medium border border-[#0f62fe]/40 cursor-pointer"
              title="Upload existing resume (PDF, DOCX, TXT, JSON) to auto-fill or populate"
            >
              <Upload className="w-3 h-3" />
              <span className="hidden sm:inline">Auto-Fill /</span>
              <span>Ingest</span>
            </button>
          )}

          <button
            onClick={onOpenATSAnalyzer}
            className="text-xs text-[#0f62fe] dark:text-[#78a9ff] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ATS</span>
            <span>Checklist</span>
          </button>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="divide-y divide-[#e0e0e0] dark:divide-[#393939]">
        {/* Section 1: Personal Info & Contact */}
        <CarbonAccordionItem
          id="sec_personal"
          title="Personal & Contact Information"
          subtitle="Full Name, Email, Phone, URLs"
          defaultOpen={true}
        >
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CarbonTextInput
                id="pi_fullname"
                labelText="Full Legal Name"
                placeholder="e.g. Dewan Mukto"
                value={data.personalInfo.fullName}
                onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                required
              />
              <CarbonTextInput
                id="pi_headline"
                labelText="Target Professional Headline"
                placeholder="e.g. Staff Cloud Infrastructure Architect"
                value={data.personalInfo.headline || ''}
                onChange={(e) => handlePersonalInfoChange('headline', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CarbonTextInput
                id="pi_email"
                labelText="Email Address"
                placeholder="user@example.com"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
              />
              <CarbonTextInput
                id="pi_phone"
                labelText="Phone Number"
                placeholder="+1 (555) 019-2834"
                value={data.personalInfo.phone || ''}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
              />
              <CarbonTextInput
                id="pi_location"
                labelText="Location (City, State / Country)"
                placeholder="San Francisco, CA"
                value={data.personalInfo.location || ''}
                onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CarbonTextInput
                id="pi_linkedin"
                labelText="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/username"
                value={data.personalInfo.linkedin || ''}
                onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
              />
              <CarbonTextInput
                id="pi_github"
                labelText="GitHub / Repository URL"
                placeholder="https://github.com/username"
                value={data.personalInfo.github || ''}
                onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
              />
              <CarbonTextInput
                id="pi_website"
                labelText="Portfolio / Website URL"
                placeholder="https://portfolio.dev"
                value={data.personalInfo.website || ''}
                onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
              />
            </div>

            <div>
              <CarbonTextArea
                id="pi_summary"
                labelText="Executive Profile / Professional Summary"
                helperText="Aim for 2-4 sentences highlighting domain expertise, scale, and high-impact accomplishments."
                placeholder="Principal Distributed Systems Architect with 11+ years designing fault-tolerant cloud platforms..."
                rows={3}
                value={data.personalInfo.summary || ''}
                onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
              />
            </div>
          </div>
        </CarbonAccordionItem>

        {/* Section 2: Work Experience */}
        <CarbonAccordionItem
          id="sec_experience"
          title="Work Experience"
          badge={data.workExperiences.length}
          subtitle="Chronological roles, achievements & metrics"
          defaultOpen={true}
          headerAction={
            <CarbonButton
              size="sm"
              kind="ghost"
              onClick={addWorkExperience}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Role
            </CarbonButton>
          }
        >
          <div className="space-y-6 pt-2">
            {data.workExperiences.length === 0 && (
              <div className="p-4 text-center border border-dashed border-[#8d8d8d] dark:border-[#525252] text-xs text-[#525252] dark:text-[#c6c6c6]">
                No work experience added yet. Click &quot;Add Role&quot; above.
              </div>
            )}

            {data.workExperiences.map((exp, expIdx) => (
              <div
                key={exp.id}
                className="p-4 bg-[#f4f4f4] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-3 relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] dark:border-[#393939]">
                  <span className="font-semibold text-xs font-mono uppercase text-[#0f62fe] dark:text-[#78a9ff]">
                    Role #{expIdx + 1}
                  </span>
                  <button
                    onClick={() => deleteWorkExperience(expIdx)}
                    className="p-1 text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13] transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CarbonTextInput
                    id={`exp_company_${exp.id}`}
                    labelText="Company / Organization"
                    value={exp.company}
                    onChange={(e) => updateWorkExperience(expIdx, { company: e.target.value })}
                    required
                  />
                  <CarbonTextInput
                    id={`exp_role_${exp.id}`}
                    labelText="Job Title / Role"
                    value={exp.role}
                    onChange={(e) => updateWorkExperience(expIdx, { role: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <CarbonTextInput
                    id={`exp_start_${exp.id}`}
                    labelText="Start Date (YYYY-MM)"
                    placeholder="2022-03"
                    value={exp.startDate}
                    onChange={(e) => updateWorkExperience(expIdx, { startDate: e.target.value })}
                  />
                  <CarbonTextInput
                    id={`exp_end_${exp.id}`}
                    labelText="End Date (YYYY-MM)"
                    placeholder="2024-01"
                    disabled={exp.isCurrent}
                    value={exp.endDate || ''}
                    onChange={(e) => updateWorkExperience(expIdx, { endDate: e.target.value })}
                  />
                  <div className="flex flex-col justify-center pt-4">
                    <label className="flex items-center gap-2 text-xs text-[#161616] dark:text-[#f4f4f4] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) =>
                          updateWorkExperience(expIdx, {
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? '' : exp.endDate,
                          })
                        }
                        className="accent-[#0f62fe]"
                      />
                      <span className="font-medium">Currently working here</span>
                    </label>
                  </div>
                </div>

                <CarbonTextInput
                  id={`exp_loc_${exp.id}`}
                  labelText="Location (Optional)"
                  placeholder="San Francisco, CA (Hybrid)"
                  value={exp.location || ''}
                  onChange={(e) => updateWorkExperience(expIdx, { location: e.target.value })}
                />

                {/* Bullets List */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#525252] dark:text-[#c6c6c6]">
                      Impact & Achievement Bullets ({exp.highlights.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => addHighlightBullet(expIdx)}
                      className="text-xs text-[#0f62fe] dark:text-[#78a9ff] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet
                    </button>
                  </div>

                  {exp.highlights.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex items-start gap-2">
                      <span className="text-xs font-mono text-[#8d8d8d] mt-2.5 shrink-0">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) =>
                          updateHighlightBullet(expIdx, bulletIdx, e.target.value)
                        }
                        placeholder="Lead with a strong action verb (e.g. Architected, Reduced, Accelerated) and include quantifiable metrics..."
                        className="flex-1 p-2 text-xs bg-white dark:bg-[#161616] border border-[#8d8d8d] dark:border-[#525252] focus:border-[#0f62fe] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => deleteHighlightBullet(expIdx, bulletIdx)}
                        className="p-1.5 text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13] mt-1 shrink-0"
                        title="Remove bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Technologies List */}
                <div>
                  <CarbonTextInput
                    id={`exp_techs_${exp.id}`}
                    labelText="Key Technologies & Stack (Comma-separated)"
                    placeholder="Kubernetes, Go, Kafka, Terraform"
                    value={exp.technologies?.join(', ') || ''}
                    onChange={(e) =>
                      updateWorkExperience(expIdx, {
                        technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CarbonAccordionItem>

        {/* Section 3: Skills Taxonomy */}
        <CarbonAccordionItem
          id="sec_skills"
          title="Skills & Competencies"
          badge={data.skills.length}
          subtitle="Grouped technical proficiencies"
          defaultOpen={false}
        >
          <div className="space-y-4 pt-2">
            <form onSubmit={addSkill} className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Go, Kubernetes, eBPF, System Design)..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#f4f4f4] dark:bg-[#262626] border border-[#8d8d8d] dark:border-[#525252] focus:border-[#0f62fe] focus:outline-none text-[#161616] dark:text-[#f4f4f4]"
                />
              </div>

              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="h-9 px-2 text-xs bg-[#f4f4f4] dark:bg-[#262626] border border-[#8d8d8d] dark:border-[#525252] focus:border-[#0f62fe] text-[#161616] dark:text-[#f4f4f4]"
              >
                <option value="Core Languages">Core Languages</option>
                <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                <option value="Data & Distributed Systems">Data & Distributed Systems</option>
                <option value="Systems & Networking">Systems & Networking</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Architecture & Leadership">Architecture & Leadership</option>
              </select>

              <CarbonButton size="sm" kind="primary" type="submit">
                Add
              </CarbonButton>
            </form>

            {/* Render grouped skills */}
            <div className="space-y-3">
              {Array.from(new Set(data.skills.map((s) => s.category))).map((category) => (
                <div key={category} className="p-3 bg-[#f4f4f4] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939]">
                  <div className="text-xs font-semibold text-[#161616] dark:text-[#f4f4f4] mb-2 font-mono uppercase">
                    {category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.skills
                      .filter((s) => s.category === category)
                      .map((skill) => (
                        <CarbonTag
                          key={skill.id}
                          type="blue"
                          size="sm"
                          onRemove={() => deleteSkill(skill.id)}
                        >
                          {skill.name}
                        </CarbonTag>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CarbonAccordionItem>

        {/* Section 4: Projects & Systems */}
        <CarbonAccordionItem
          id="sec_projects"
          title="Key Projects & Open Source"
          badge={data.projects.length}
          subtitle="Portfolio systems & codebases"
          defaultOpen={false}
          headerAction={
            <CarbonButton
              size="sm"
              kind="ghost"
              onClick={addProject}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Project
            </CarbonButton>
          }
        >
          <div className="space-y-4 pt-2">
            {data.projects.map((proj, projIdx) => (
              <div
                key={proj.id}
                className="p-4 bg-[#f4f4f4] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] dark:border-[#393939]">
                  <span className="font-semibold text-xs font-mono uppercase text-[#0f62fe]">
                    Project #{projIdx + 1}
                  </span>
                  <button
                    onClick={() => deleteProject(projIdx)}
                    className="p-1 text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13]"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CarbonTextInput
                    id={`proj_title_${proj.id}`}
                    labelText="Project Title"
                    value={proj.title}
                    onChange={(e) => updateProject(projIdx, { title: e.target.value })}
                  />
                  <CarbonTextInput
                    id={`proj_url_${proj.id}`}
                    labelText="Repository / Live URL"
                    placeholder="https://github.com/org/repo"
                    value={proj.url || ''}
                    onChange={(e) => updateProject(projIdx, { url: e.target.value })}
                  />
                </div>

                <CarbonTextInput
                  id={`proj_desc_${proj.id}`}
                  labelText="Description / Architecture Summary"
                  value={proj.description || ''}
                  onChange={(e) => updateProject(projIdx, { description: e.target.value })}
                />
              </div>
            ))}
          </div>
        </CarbonAccordionItem>

        {/* Section 5: Education */}
        <CarbonAccordionItem
          id="sec_education"
          title="Education & Academic Degrees"
          badge={data.educations.length}
          subtitle="Universities, degrees, honors"
          defaultOpen={false}
          headerAction={
            <CarbonButton
              size="sm"
              kind="ghost"
              onClick={addEducation}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Education
            </CarbonButton>
          }
        >
          <div className="space-y-4 pt-2">
            {data.educations.map((edu, eduIdx) => (
              <div
                key={edu.id}
                className="p-4 bg-[#f4f4f4] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] dark:border-[#393939]">
                  <span className="font-semibold text-xs font-mono uppercase text-[#0f62fe]">
                    Education #{eduIdx + 1}
                  </span>
                  <button
                    onClick={() => deleteEducation(eduIdx)}
                    className="p-1 text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13]"
                    title="Delete Education"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CarbonTextInput
                    id={`edu_inst_${edu.id}`}
                    labelText="Institution / University"
                    value={edu.institution}
                    onChange={(e) => updateEducation(eduIdx, { institution: e.target.value })}
                  />
                  <CarbonTextInput
                    id={`edu_degree_${edu.id}`}
                    labelText="Degree & Major (e.g. B.S. in Computer Science)"
                    value={edu.degree}
                    onChange={(e) => updateEducation(eduIdx, { degree: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <CarbonTextInput
                    id={`edu_end_${edu.id}`}
                    labelText="Graduation Date (YYYY-MM)"
                    value={edu.endDate || ''}
                    onChange={(e) => updateEducation(eduIdx, { endDate: e.target.value })}
                  />
                  <CarbonTextInput
                    id={`edu_gpa_${edu.id}`}
                    labelText="GPA (Optional)"
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(eduIdx, { gpa: e.target.value })}
                  />
                  <CarbonTextInput
                    id={`edu_loc_${edu.id}`}
                    labelText="Location"
                    value={edu.location || ''}
                    onChange={(e) => updateEducation(eduIdx, { location: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        </CarbonAccordionItem>

        {/* Section 6: Certifications */}
        <CarbonAccordionItem
          id="sec_certs"
          title="Certifications & Accreditations"
          badge={data.certifications.length}
          subtitle="CKA, GCP, AWS, CISSP"
          defaultOpen={false}
          headerAction={
            <CarbonButton
              size="sm"
              kind="ghost"
              onClick={addCertification}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Cert
            </CarbonButton>
          }
        >
          <div className="space-y-4 pt-2">
            {data.certifications.map((cert, certIdx) => (
              <div
                key={cert.id}
                className="p-4 bg-[#f4f4f4] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] dark:border-[#393939]">
                  <span className="font-semibold text-xs font-mono uppercase text-[#0f62fe]">
                    Certification #{certIdx + 1}
                  </span>
                  <button
                    onClick={() => deleteCertification(certIdx)}
                    className="p-1 text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13]"
                    title="Delete Certification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CarbonTextInput
                    id={`cert_name_${cert.id}`}
                    labelText="Certification Name"
                    value={cert.name}
                    onChange={(e) => updateCertification(certIdx, { name: e.target.value })}
                  />
                  <CarbonTextInput
                    id={`cert_issuer_${cert.id}`}
                    labelText="Issuing Organization"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(certIdx, { issuer: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CarbonTextInput
                    id={`cert_date_${cert.id}`}
                    labelText="Issue Date (YYYY-MM)"
                    value={cert.issueDate || ''}
                    onChange={(e) => updateCertification(certIdx, { issueDate: e.target.value })}
                  />
                  <CarbonTextInput
                    id={`cert_id_${cert.id}`}
                    labelText="Credential ID / License #"
                    value={cert.credentialId || ''}
                    onChange={(e) => updateCertification(certIdx, { credentialId: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        </CarbonAccordionItem>

        {/* Section 7: Custom Sections & Languages */}
        <CarbonAccordionItem
          id="sec_custom"
          title="Languages & Custom Sections"
          badge={(data.customSections || []).length}
          subtitle="Multilingual proficiencies, publications, honors"
          defaultOpen={false}
          headerAction={
            <CarbonButton
              size="sm"
              kind="ghost"
              onClick={addCustomSection}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Section
            </CarbonButton>
          }
        >
          <div className="space-y-4 pt-2">
            {(!data.customSections || data.customSections.length === 0) && (
              <p className="text-xs text-[#525252] dark:text-[#a8a8a8] py-2">
                No custom sections added yet. Click &quot;Add Section&quot; to define Languages, Publications, or Honors.
              </p>
            )}

            {(data.customSections || []).map((sec, secIdx) => (
              <div
                key={sec.id}
                className="p-4 bg-[#f4f4f4] dark:bg-[#262626] border border-[#e0e0e0] dark:border-[#393939] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] dark:border-[#393939]">
                  <div className="flex-1 max-w-xs">
                    <CarbonTextInput
                      id={`sec_title_${sec.id}`}
                      labelText="Section Title"
                      value={sec.title}
                      onChange={(e) => updateCustomSectionTitle(secIdx, e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <CarbonButton
                      size="sm"
                      kind="ghost"
                      onClick={() => addCustomItem(secIdx)}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Entry
                    </CarbonButton>
                    <button
                      onClick={() => deleteCustomSection(secIdx)}
                      className="p-1 text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13]"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Section Items */}
                <div className="space-y-3 pt-1">
                  {sec.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#393939] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-semibold text-[#0f62fe]">
                          Entry #{itemIdx + 1}
                        </span>
                        <button
                          onClick={() => deleteCustomItem(secIdx, itemIdx)}
                          className="p-1 text-[#da1e28] hover:bg-[#fff1f1] dark:hover:bg-[#750e13]"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <CarbonTextInput
                          id={`item_h_${item.id}`}
                          labelText="Heading (e.g. English & Bengali)"
                          value={item.heading}
                          onChange={(e) =>
                            updateCustomItem(secIdx, itemIdx, { heading: e.target.value })
                          }
                        />
                        <CarbonTextInput
                          id={`item_sub_${item.id}`}
                          labelText="Subheading (e.g. Native / Bilingual)"
                          value={item.subheading || ''}
                          onChange={(e) =>
                            updateCustomItem(secIdx, itemIdx, { subheading: e.target.value })
                          }
                        />
                      </div>

                      <CarbonTextInput
                        id={`item_desc_${item.id}`}
                        labelText="Optional Description"
                        value={item.description || ''}
                        onChange={(e) =>
                          updateCustomItem(secIdx, itemIdx, { description: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CarbonAccordionItem>
      </div>
    </div>
  );
};
