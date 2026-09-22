import { z } from 'zod';

// ==========================================
// 1. Zod Validation Schemas
// ==========================================

export const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role / Job title is required'),
  location: z.string().optional().default(''),
  startDate: z.string(), // ISO format YYYY-MM
  endDate: z.string().optional().default(''),
  isCurrent: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
  technologies: z.array(z.string()).optional().default([]),
});

export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  location: z.string().optional().default(''),
  gpa: z.string().optional().default(''),
  honors: z.array(z.string()).optional().default([]),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().default('Technical Skills'), // e.g. Languages, Cloud, Frameworks, Architecture
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional().default('Advanced'),
  yearsOfExperience: z.number().optional().default(1),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Project title is required'),
  role: z.string().optional().default(''),
  organization: z.string().optional().default(''),
  url: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  description: z.string().optional().default(''),
  highlights: z.array(z.string()).default([]),
  technologies: z.array(z.string()).optional().default([]),
});

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().optional().default(''),
  expiryDate: z.string().optional().default(''),
  credentialId: z.string().optional().default(''),
  credentialUrl: z.string().optional().default(''),
});

export const CustomSectionItemSchema = z.object({
  id: z.string(),
  heading: z.string(),
  subheading: z.string().optional().default(''),
  date: z.string().optional().default(''),
  description: z.string().optional().default(''),
  bullets: z.array(z.string()).optional().default([]),
});

export const CustomSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(CustomSectionItemSchema).default([]),
});

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  headline: z.string().optional().default(''),
  email: z.string().email().or(z.literal('')).default(''),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  website: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  github: z.string().optional().default(''),
  summary: z.string().optional().default(''),
});

export const ResumeFormattingSchema = z.object({
  template: z.enum(['carbon-classic', 'carbon-modern', 'carbon-tech', 'carbon-executive']).default('carbon-classic'),
  fontFamily: z.enum(['ibm-plex-sans', 'ibm-plex-serif', 'ibm-plex-mono']).default('ibm-plex-sans'),
  fontSize: z.enum(['compact', 'normal', 'spacious']).default('normal'),
  margins: z.enum(['compact', 'standard', 'generous']).default('standard'),
  accentColor: z.string().default('#0f62fe'), // Carbon Blue 60 default
  showDividerLines: z.boolean().default(true),
  dateFormat: z.enum(['YYYY-MM', 'Mon YYYY', 'YYYY']).default('Mon YYYY'),
});

export const SectionTypeSchema = z.enum([
  'personalInfo',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'custom',
]);

export const ResumeDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  workExperiences: z.array(WorkExperienceSchema).default([]),
  educations: z.array(EducationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  customSections: z.array(CustomSectionSchema).default([]),
  sectionOrder: z.array(z.string()).default([
    'summary',
    'experience',
    'skills',
    'projects',
    'education',
    'certifications',
  ]),
  formatting: ResumeFormattingSchema.default({
    template: 'carbon-classic',
    fontFamily: 'ibm-plex-sans',
    fontSize: 'normal',
    margins: 'standard',
    accentColor: '#0f62fe',
    showDividerLines: true,
    dateFormat: 'Mon YYYY',
  }),
});

export const ResumeVersionSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  parentVersionId: z.string().nullable().optional(),
  versionTag: z.string().default('v1.0'),
  title: z.string().min(1, 'Version title is required'),
  targetRole: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
  data: ResumeDataSchema,
});

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Profile name is required'),
  targetDomain: z.string().default('Software Engineering'),
  description: z.string().optional().default(''),
  defaultVersionId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ImportExportPackageSchema = z.object({
  schemaVersion: z.string().default('1.0.0'),
  appName: z.literal('Sen Resume'),
  exportDate: z.string(),
  metadata: z.object({
    totalProfiles: z.number(),
    totalVersions: z.number(),
    clientPlatform: z.string().optional().default('Web'),
  }),
  profiles: z.array(UserProfileSchema),
  versions: z.array(ResumeVersionSchema),
});

// ==========================================
// 2. TypeScript Inferred Types
// ==========================================

export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type CustomSectionItem = z.infer<typeof CustomSectionItemSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type ResumeFormatting = z.infer<typeof ResumeFormattingSchema>;
export type SectionType = z.infer<typeof SectionTypeSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type ResumeVersion = z.infer<typeof ResumeVersionSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ImportExportPackage = z.infer<typeof ImportExportPackageSchema>;

// ATS Analysis Types
export interface ATSCheckItem {
  id: string;
  category: 'contact' | 'formatting' | 'impact' | 'verbs' | 'length' | 'skills';
  label: string;
  description: string;
  passed: boolean;
  score: number; // 0 to 10
  recommendation?: string;
}

export interface ATSOptimizationReport {
  overallScore: number; // 0 - 100
  rating: 'Exceptional' | 'Strong' | 'Needs Improvement' | 'Critical ATS Issues';
  keywordDensity: {
    totalWords: number;
    actionVerbCount: number;
    actionVerbRatio: number; // percentage
    metricCount: number; // quantifiable numbers (% / $ / X)
    topKeywords: { word: string; count: number }[];
  };
  jobMatch?: {
    matchPercentage: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  checklist: ATSCheckItem[];
}
