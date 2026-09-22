import { ResumeData, ATSOptimizationReport, ATSCheckItem } from '../types/resume';

const STRONG_ACTION_VERBS = new Set([
  'architected',
  'engineered',
  'spearheaded',
  'optimized',
  'automated',
  'reduced',
  'delivered',
  'led',
  'designed',
  'formulated',
  'scaled',
  'unified',
  'mentored',
  'standardized',
  'established',
  'overhauled',
  'orchestrated',
  'implemented',
  'executed',
  'pioneered',
  'streamlined',
  'maximized',
  'generated',
  'revamped',
  'diagnosed',
  'deployed',
  'accelerated',
  'built',
  'consolidated',
  'created',
  'drove',
  'expanded',
  'improved',
  'launched',
  'migrated',
  'negotiated',
  'refactored',
  'resolved',
  'transformed',
  'upgraded',
]);

const STOP_WORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'me',
  'more',
  'most',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'with',
  'would',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'with',
  'within',
  'across',
  'per',
]);

// Extract words cleanly
export function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\-\+\#]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

// Format date according to preferences
export function formatResumeDate(isoDate: string, format: 'YYYY-MM' | 'Mon YYYY' | 'YYYY'): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  const year = parts[0];
  const month = parts[1];

  if (!month) return year;

  if (format === 'YYYY') return year;
  if (format === 'YYYY-MM') return `${year}-${month.padStart(2, '0')}`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNum = parseInt(month, 10);
  if (monthNum >= 1 && monthNum <= 12) {
    return `${months[monthNum - 1]} ${year}`;
  }
  return isoDate;
}

// Calculate ATS score and generate report
export function analyzeResumeATS(data: ResumeData, jobDescription = ''): ATSOptimizationReport {
  const checklist: ATSCheckItem[] = [];

  // 1. Contact Information
  const hasName = Boolean(data.personalInfo.fullName.trim());
  const hasEmail = Boolean(data.personalInfo.email.trim() && data.personalInfo.email.includes('@'));
  const hasPhone = Boolean(data.personalInfo.phone.trim());
  const hasLocation = Boolean(data.personalInfo.location.trim());

  const contactScore = (hasName ? 4 : 0) + (hasEmail ? 3 : 0) + (hasPhone ? 2 : 0) + (hasLocation ? 1 : 0);
  checklist.push({
    id: 'contact_info',
    category: 'contact',
    label: 'Contact Information Completeness',
    description: 'ATS parsers require clean name, email, phone, and standard location format.',
    passed: contactScore >= 9,
    score: contactScore,
    recommendation:
      contactScore < 9
        ? 'Add all standard contact fields (Full Name, valid Email, Phone, and City/State).'
        : undefined,
  });

  // 2. Professional Summary
  const summaryLength = data.personalInfo.summary?.trim().length || 0;
  const summaryPassed = summaryLength >= 100 && summaryLength <= 800;
  checklist.push({
    id: 'summary_presence',
    category: 'formatting',
    label: 'Targeted Executive Summary',
    description: 'A 2-4 sentence summary with role keywords increases parser categorization.',
    passed: summaryPassed,
    score: summaryPassed ? 10 : summaryLength > 0 ? 6 : 2,
    recommendation: !summaryPassed
      ? 'Include a focused professional summary of 2-4 sentences highlighting career domain and impact.'
      : undefined,
  });

  // 3. Work Experience Count & Structure
  const expCount = data.workExperiences.length;
  checklist.push({
    id: 'work_history',
    category: 'formatting',
    label: 'Work Experience History',
    description: 'ATS engines look for chronological roles with company, title, dates, and bullet achievements.',
    passed: expCount >= 1,
    score: expCount >= 2 ? 10 : expCount === 1 ? 7 : 0,
    recommendation: expCount === 0 ? 'Add at least one professional work experience entry.' : undefined,
  });

  // 4. Quantifiable Impact & Metrics
  // Check for numbers, % signs, $, X multipliers
  let totalBullets = 0;
  let metricBullets = 0;
  let actionVerbStarts = 0;
  const metricRegex = /\b(\d+[\d,.]*|\$\d+[\d,.]*[kmb]?|\d+%\b|\d+x\b)/i;

  const allBulletTexts: string[] = [];

  data.workExperiences.forEach((exp) => {
    exp.highlights.forEach((h) => {
      totalBullets++;
      allBulletTexts.push(h);
      if (metricRegex.test(h)) {
        metricBullets++;
      }
      const firstWord = h.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^\w]/g, '');
      if (firstWord && STRONG_ACTION_VERBS.has(firstWord)) {
        actionVerbStarts++;
      }
    });
  });

  const metricRatio = totalBullets > 0 ? metricBullets / totalBullets : 0;
  const metricPassed = totalBullets > 0 && metricRatio >= 0.4;
  checklist.push({
    id: 'quantifiable_metrics',
    category: 'impact',
    label: 'Quantifiable Metrics & ROI',
    description: 'Aim for ≥40% of bullet points containing tangible metrics (%, $, scale numbers, latency, latency gains).',
    passed: metricPassed,
    score: Math.min(10, Math.round(metricRatio * 20)),
    recommendation: !metricPassed
      ? `Currently ${Math.round(metricRatio * 100)}% of bullets have metrics. Add percentages, dollar figures, or scale numbers.`
      : undefined,
  });

  // 5. Strong Action Verbs Ratio
  const verbRatio = totalBullets > 0 ? actionVerbStarts / totalBullets : 0;
  const verbPassed = totalBullets > 0 && verbRatio >= 0.5;
  checklist.push({
    id: 'action_verbs',
    category: 'verbs',
    label: 'Strong Action Verbs Beginning',
    description: 'Bullets should lead with definitive past-tense verbs (e.g. Architected, Engineered, Reduced).',
    passed: verbPassed,
    score: Math.min(10, Math.round(verbRatio * 18)),
    recommendation: !verbPassed
      ? `Currently ${Math.round(verbRatio * 100)}% of bullets start with strong action verbs. Replace passive phrasing.`
      : undefined,
  });

  // 6. Skills Inventory & Categorization
  const skillsCount = data.skills.length;
  const hasCategories = new Set(data.skills.map((s) => s.category.trim())).size >= 2;
  const skillsPassed = skillsCount >= 6 && hasCategories;
  checklist.push({
    id: 'skills_coverage',
    category: 'skills',
    label: 'Skills Taxonomy & Density',
    description: 'ATS parsing heavily indexes grouped technical skills and domain proficiencies.',
    passed: skillsPassed,
    score: skillsCount >= 8 ? 10 : skillsCount >= 5 ? 7 : 4,
    recommendation:
      skillsCount < 6
        ? 'List at least 6-12 discrete, relevant technical skills categorized logically.'
        : undefined,
  });

  // 7. Education & Credentials
  const eduCount = data.educations.length;
  checklist.push({
    id: 'education_check',
    category: 'formatting',
    label: 'Education Section',
    description: 'Degree, major institution, and graduation year are verified for baseline qualification criteria.',
    passed: eduCount >= 1,
    score: eduCount >= 1 ? 10 : 3,
    recommendation: eduCount === 0 ? 'Include your educational background or highest degree achieved.' : undefined,
  });

  // Aggregate word count & top keywords
  const fullText = [
    data.personalInfo.fullName,
    data.personalInfo.headline,
    data.personalInfo.summary,
    ...allBulletTexts,
    ...data.skills.map((s) => s.name),
    ...data.projects.map((p) => `${p.title} ${p.description} ${p.highlights.join(' ')}`),
  ].join(' ');

  const words = extractWords(fullText);
  const wordFrequency: Record<string, number> = {};
  words.forEach((w) => {
    wordFrequency[w] = (wordFrequency[w] || 0) + 1;
  });

  const sortedKeywords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }));

  // Job Description Matching
  let jobMatchData = undefined;
  if (jobDescription.trim().length > 30) {
    const jdWords = Array.from(new Set(extractWords(jobDescription))).filter((w) => w.length > 2);
    const resumeWordsSet = new Set(words);

    const matched = jdWords.filter((w) => resumeWordsSet.has(w));
    const missing = jdWords.filter((w) => !resumeWordsSet.has(w)).slice(0, 20);

    const matchPct = jdWords.length > 0 ? Math.round((matched.length / jdWords.length) * 100) : 0;

    jobMatchData = {
      matchPercentage: Math.min(100, Math.max(0, matchPct)),
      matchedKeywords: matched.slice(0, 25),
      missingKeywords: missing,
    };
  }

  // Calculate Overall Score (0 - 100)
  const totalScorePoints = checklist.reduce((acc, curr) => acc + curr.score, 0);
  const maxPossible = checklist.length * 10;
  let overallScore = Math.round((totalScorePoints / maxPossible) * 100);

  // If job description is provided, weight the match into the score
  if (jobMatchData) {
    overallScore = Math.round(overallScore * 0.75 + jobMatchData.matchPercentage * 0.25);
  }

  let rating: ATSOptimizationReport['rating'] = 'Exceptional';
  if (overallScore < 50) rating = 'Critical ATS Issues';
  else if (overallScore < 70) rating = 'Needs Improvement';
  else if (overallScore < 88) rating = 'Strong';

  return {
    overallScore,
    rating,
    keywordDensity: {
      totalWords: words.length,
      actionVerbCount: actionVerbStarts,
      actionVerbRatio: Math.round(verbRatio * 100),
      metricCount: metricBullets,
      topKeywords: sortedKeywords,
    },
    jobMatch: jobMatchData,
    checklist,
  };
}
