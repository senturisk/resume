import { ResumeData, UserProfile, ResumeVersion } from '../types/resume';

export interface ParseResult {
  success: boolean;
  profileName: string;
  targetDomain: string;
  resumeData: ResumeData;
  source: 'gemini' | 'client-heuristics' | 'json';
  warnings?: string[];
}

/**
 * Universal client/server resume parser.
 * Supports PDF base64, text, markdown, and JSON.
 */
export async function parseUniversalResume(
  fileOrText: {
    text?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
  }
): Promise<ParseResult> {
  const { text, fileBase64, mimeType, fileName } = fileOrText;

  // 1. If it's a JSON file or JSON text, test JSON parsing first
  if (text && text.trim().startsWith('{')) {
    try {
      const parsedJson = JSON.parse(text);
      if (parsedJson.personalInfo && parsedJson.workExperiences) {
        const pName = parsedJson.personalInfo.fullName || 'Imported Candidate';
        return {
          success: true,
          profileName: `${pName} - Profile`,
          targetDomain: parsedJson.personalInfo.headline || 'General Professional Track',
          resumeData: {
            ...parsedJson,
            formatting: parsedJson.formatting || {
              template: 'carbon-classic',
              fontFamily: 'ibm-plex-sans',
              fontSize: 'normal',
              margins: 'standard',
              accentColor: '#0f62fe',
              showDividerLines: true,
              dateFormat: 'Mon YYYY',
            },
            sectionOrder: parsedJson.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'custom'],
          },
          source: 'json',
        };
      }
    } catch {
      // Continue to AI / heuristic
    }
  }

  // 2. Attempt Server-Side Gemini API Parser
  try {
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        fileBase64,
        mimeType: mimeType || (fileBase64 ? 'application/pdf' : 'text/plain'),
        fileName,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const extracted = result.data;
        const pName = extracted.personalInfo?.fullName || 'Imported Candidate';
        const targetDomain =
          extracted.personalInfo?.headline ||
          (extracted.workExperiences?.[0]?.role ? `${extracted.workExperiences[0].role} Track` : 'Career Track');

        return {
          success: true,
          profileName: `${pName} (Imported)`,
          targetDomain,
          resumeData: sanitizeResumeData(extracted),
          source: 'gemini',
        };
      }
    }
  } catch (err) {
    console.warn('Server AI parser unavailable, executing client fallback:', err);
  }

  // 3. Fallback: Intelligent Client-Side Heuristic Text Parser
  const rawContent = text || '';
  return fallbackClientHeuristicParser(rawContent, fileName);
}

/**
 * Ensures all required fields of ResumeData exist with defaults
 */
function sanitizeResumeData(data: Partial<ResumeData>): ResumeData {
  return {
    personalInfo: {
      fullName: data.personalInfo?.fullName || 'Candidate Name',
      headline: data.personalInfo?.headline || '',
      email: data.personalInfo?.email || '',
      phone: data.personalInfo?.phone || '',
      location: data.personalInfo?.location || '',
      website: data.personalInfo?.website || '',
      linkedin: data.personalInfo?.linkedin || '',
      github: data.personalInfo?.github || '',
      summary: data.personalInfo?.summary || '',
    },
    workExperiences: (data.workExperiences || []).map((exp, idx) => ({
      id: exp.id || `exp_imp_${Date.now()}_${idx}`,
      company: exp.company || 'Company',
      role: exp.role || 'Role',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent ?? false,
      highlights: exp.highlights && exp.highlights.length > 0 ? exp.highlights : ['Contributed to key projects.'],
      technologies: exp.technologies || [],
    })),
    educations: (data.educations || []).map((edu, idx) => ({
      id: edu.id || `edu_imp_${Date.now()}_${idx}`,
      institution: edu.institution || 'University',
      degree: edu.degree || 'Degree',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      location: edu.location || '',
      gpa: edu.gpa || '',
      honors: edu.honors || [],
    })),
    skills: (data.skills || []).map((sk, idx) => ({
      id: sk.id || `sk_imp_${Date.now()}_${idx}`,
      name: sk.name || 'Skill',
      category: sk.category || 'Technical Skills',
      level: sk.level || 'Advanced',
      yearsOfExperience: sk.yearsOfExperience || 3,
    })),
    projects: (data.projects || []).map((p, idx) => ({
      id: p.id || `proj_imp_${Date.now()}_${idx}`,
      title: p.title || 'Project',
      role: p.role || '',
      organization: p.organization || '',
      url: p.url || '',
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      description: p.description || '',
      highlights: p.highlights || [],
      technologies: p.technologies || [],
    })),
    certifications: (data.certifications || []).map((c, idx) => ({
      id: c.id || `cert_imp_${Date.now()}_${idx}`,
      name: c.name || 'Certification',
      issuer: c.issuer || 'Issuing Authority',
      issueDate: c.issueDate || '',
      expiryDate: c.expiryDate || '',
      credentialId: c.credentialId || '',
      credentialUrl: c.credentialUrl || '',
    })),
    customSections: (data.customSections || []).map((cs, idx) => ({
      id: cs.id || `cust_imp_${Date.now()}_${idx}`,
      title: cs.title || 'Additional Information',
      items: cs.items || [],
    })),
    sectionOrder: data.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'custom'],
    formatting: data.formatting || {
      template: 'carbon-classic',
      fontFamily: 'ibm-plex-sans',
      fontSize: 'normal',
      margins: 'standard',
      accentColor: '#0f62fe',
      showDividerLines: true,
      dateFormat: 'Mon YYYY',
    },
  };
}

/**
 * Intelligent Client-Side Heuristic Text Parser
 */
function fallbackClientHeuristicParser(text: string, fileName?: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let fullName = 'Imported Candidate';
  let email = '';
  let phone = '';
  let headline = '';
  let summary = '';
  let location = '';
  let linkedin = '';
  let github = '';
  let website = '';

  const workExperiences: ResumeData['workExperiences'] = [];
  const educations: ResumeData['educations'] = [];
  const skills: ResumeData['skills'] = [];
  const certifications: ResumeData['certifications'] = [];

  // 1. Scan for emails, phones, URLs
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) phone = phoneMatch[0];

  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+/i);
  if (linkedinMatch) linkedin = linkedinMatch[0];

  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9-_]+/i);
  if (githubMatch) github = githubMatch[0];

  const websiteMatch = text.match(/https?:\/\/(?!www\.linkedin|github)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*/i);
  if (websiteMatch) website = websiteMatch[0];

  // First non-empty line usually Candidate Name
  if (lines.length > 0 && lines[0].length < 60 && !lines[0].includes('@')) {
    fullName = lines[0].replace(/^(resume|curriculum vitae|cv)\s*:?/i, '').trim() || fullName;
  }

  // Second line might be headline or contact
  if (lines.length > 1 && !lines[1].includes('@') && lines[1].length < 80) {
    headline = lines[1];
  }

  // Section slicing
  let currentSection = 'header';
  const sectionLines: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  };

  const sectionKeywords: Record<string, RegExp> = {
    summary: /^(summary|professional summary|executive summary|about|profile)/i,
    experience: /^(work experience|experience|employment history|work history|professional experience)/i,
    education: /^(education|academic background|academics|qualifications)/i,
    skills: /^(skills|technical skills|competencies|technologies|proficiencies)/i,
    certifications: /^(certifications|certificates|licenses|accreditations)/i,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;

    for (const [secKey, regex] of Object.entries(sectionKeywords)) {
      if (regex.test(line) && line.length < 40) {
        currentSection = secKey;
        matched = true;
        break;
      }
    }

    if (!matched && currentSection !== 'header') {
      sectionLines[currentSection].push(line);
    }
  }

  // Process Summary
  if (sectionLines.summary.length > 0) {
    summary = sectionLines.summary.slice(0, 5).join(' ');
  }

  // Process Skills
  if (sectionLines.skills.length > 0) {
    const rawSkillsText = sectionLines.skills.join(', ');
    const tokens = rawSkillsText
      .split(/[,•|/\n]/)
      .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
      .filter((s) => s.length > 1 && s.length < 35);

    const uniqueSkills = Array.from(new Set(tokens)).slice(0, 24);
    uniqueSkills.forEach((name, idx) => {
      skills.push({
        id: `sk_gen_${idx}`,
        name,
        category: 'Core Competencies',
        level: 'Advanced',
        yearsOfExperience: 3,
      });
    });
  }

  // Process Experience (group by bullets or roles)
  let expIndex = 0;
  let currentExp: ResumeData['workExperiences'][0] | null = null;

  for (const line of sectionLines.experience) {
    const isBullet = /^[-*•\u2022\u25E6]|\d+\.\s/.test(line);
    const cleaned = line.replace(/^[-*•\u2022\u25E6]\s*|\d+\.\s*/, '').trim();

    if (!isBullet && line.length < 80 && (line.includes('20') || line.includes(' - ') || !currentExp)) {
      if (currentExp) {
        workExperiences.push(currentExp);
      }
      expIndex++;
      currentExp = {
        id: `exp_h_${expIndex}`,
        company: cleaned.split(' - ')[0] || cleaned,
        role: cleaned.split(' - ')[1] || 'Specialist',
        location: '',
        startDate: '2022-01',
        endDate: '',
        isCurrent: true,
        highlights: [],
        technologies: [],
      };
    } else if (currentExp && cleaned) {
      currentExp.highlights.push(cleaned);
    }
  }
  if (currentExp) workExperiences.push(currentExp);

  // If no experience was parsed, provide default entry
  if (workExperiences.length === 0) {
    workExperiences.push({
      id: 'exp_default_1',
      company: 'Professional Organization',
      role: headline || 'Lead Specialist',
      location: location || 'Remote',
      startDate: '2023-01',
      endDate: '',
      isCurrent: true,
      highlights: ['Managed core operational deliverables and drove cross-functional team initiatives.'],
      technologies: skills.slice(0, 4).map((s) => s.name),
    });
  }

  // Process Education
  if (sectionLines.education.length > 0) {
    educations.push({
      id: 'edu_h_1',
      institution: sectionLines.education[0] || 'University / Academic Institution',
      degree: sectionLines.education[1] || 'Bachelor’s Degree',
      fieldOfStudy: '',
      startDate: '2019-09',
      endDate: '2023-05',
      location: '',
      gpa: '',
      honors: [],
    });
  }

  const resultData: ResumeData = {
    personalInfo: {
      fullName,
      headline: headline || 'Professional Specialist',
      email: email || 'user@example.com',
      phone,
      location,
      website,
      linkedin,
      github,
      summary: summary || 'Experienced professional with demonstrated expertise in delivering high-impact projects.',
    },
    workExperiences,
    educations:
      educations.length > 0
        ? educations
        : [
            {
              id: 'edu_def_1',
              institution: 'Higher Education Institution',
              degree: 'Bachelor of Science',
              fieldOfStudy: 'Academic Study',
              startDate: '2019-09',
              endDate: '2023-05',
              location: '',
              gpa: '',
              honors: [],
            },
          ],
    skills:
      skills.length > 0
        ? skills
        : [
            { id: 'sk_def_1', name: 'Leadership', category: 'Professional', level: 'Expert', yearsOfExperience: 5 },
            { id: 'sk_def_2', name: 'Communication', category: 'Professional', level: 'Expert', yearsOfExperience: 5 },
          ],
    projects: [],
    certifications,
    customSections: [],
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'custom'],
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

  return {
    success: true,
    profileName: `${fullName} (Imported)`,
    targetDomain: headline || 'Professional Career Track',
    resumeData: resultData,
    source: 'client-heuristics',
  };
}
