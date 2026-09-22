import React from 'react';
import { ResumeData } from '../../types/resume';
import { formatResumeDate } from '../../services/atsEngine';

export interface PrintResumeDocumentProps {
  data: ResumeData;
  scale?: number;
}

export const PrintResumeDocument: React.FC<PrintResumeDocumentProps> = ({ data, scale = 1 }) => {
  const { personalInfo, workExperiences, educations, skills, projects, certifications, customSections, formatting } =
    data;

  const fontClass = {
    'ibm-plex-sans': 'font-sans',
    'ibm-plex-serif': 'font-serif',
    'ibm-plex-mono': 'font-mono',
  }[formatting.fontFamily || 'ibm-plex-sans'];

  const marginClass = {
    compact: 'p-8',
    standard: 'p-10',
    generous: 'p-12',
  }[formatting.margins || 'standard'];

  const fontSizeClass = {
    compact: 'text-[12px] leading-relaxed',
    normal: 'text-[13px] leading-relaxed',
    spacious: 'text-[14px] leading-relaxed',
  }[formatting.fontSize || 'normal'];

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
    const cat = s.category || 'Technical Skills';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  return (
    <div
      id="ats-print-container"
      className={`print-only-target w-[8.5in] min-h-[11in] bg-white text-[#161616] shadow-xl mx-auto ${marginClass} ${fontClass} ${fontSizeClass} transition-transform origin-top`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
      }}
    >
      {/* 1. Header & Contact Information */}
      <header className="resume-section-heading border-b-2 pb-4 mb-5 border-[#161616]">
        <h1 className="text-2xl font-bold tracking-tight text-[#161616] uppercase font-sans">
          {personalInfo.fullName || 'Candidate Name'}
        </h1>
        {personalInfo.headline && (
          <p className="text-sm font-medium text-[#393939] mt-0.5 font-sans">
            {personalInfo.headline}
          </p>
        )}

        {/* Contact Links & Items (ATS text parsable inline) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#393939] mt-2">
          {personalInfo.email && (
            <span>
              <a href={`mailto:${personalInfo.email}`} className="text-[#161616] hover:underline">
                {personalInfo.email}
              </a>
            </span>
          )}
          {personalInfo.phone && (
            <>
              <span className="text-[#8d8d8d]">•</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo.location && (
            <>
              <span className="text-[#8d8d8d]">•</span>
              <span>{personalInfo.location}</span>
            </>
          )}
          {personalInfo.linkedin && (
            <>
              <span className="text-[#8d8d8d]">•</span>
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-[#161616] hover:underline">
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
          {personalInfo.github && (
            <>
              <span className="text-[#8d8d8d]">•</span>
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="text-[#161616] hover:underline">
                {personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
          {personalInfo.website && (
            <>
              <span className="text-[#8d8d8d]">•</span>
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="text-[#161616] hover:underline">
                {personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
        </div>
      </header>

      {/* 2. Professional Summary */}
      {personalInfo.summary && (
        <section className="resume-item-block mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#161616] border-b border-[#c6c6c6] pb-1 mb-2 font-mono">
            Professional Summary
          </h2>
          <p className="text-[#262626] text-justify leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* 3. Work Experience */}
      {workExperiences.length > 0 && (
        <section className="resume-item-block mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#161616] border-b border-[#c6c6c6] pb-1 mb-3 font-mono">
            Work Experience
          </h2>
          <div className="space-y-4">
            {workExperiences.map((exp) => (
              <div key={exp.id} className="resume-item-block">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-sm text-[#161616]">{exp.role}</span>
                    <span className="text-xs text-[#525252]"> — </span>
                    <span className="font-semibold text-xs text-[#262626]">{exp.company}</span>
                  </div>
                  <div className="text-xs text-[#525252] font-mono text-right shrink-0">
                    {formatResumeDate(exp.startDate, formatting.dateFormat)} –{' '}
                    {exp.isCurrent ? 'Present' : formatResumeDate(exp.endDate, formatting.dateFormat)}
                  </div>
                </div>

                {exp.location && (
                  <div className="text-[11px] text-[#6f6f6f] italic">{exp.location}</div>
                )}

                {/* Bullets */}
                {exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-[#262626]">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="pl-0.5 leading-snug">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Skills/Technologies tags */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="text-[11px] text-[#525252] mt-1.5">
                    <span className="font-semibold">Core Technologies: </span>
                    <span>{exp.technologies.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Skills Taxonomy */}
      {skills.length > 0 && (
        <section className="resume-item-block mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#161616] border-b border-[#c6c6c6] pb-1 mb-2 font-mono">
            Skills & Competencies
          </h2>
          <div className="space-y-1.5">
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <div key={category} className="text-xs">
                <span className="font-bold text-[#161616]">{category}: </span>
                <span className="text-[#262626]">{items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Projects & Systems */}
      {projects.length > 0 && (
        <section className="resume-item-block mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#161616] border-b border-[#c6c6c6] pb-1 mb-3 font-mono">
            Key Projects & Systems
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="resume-item-block">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-xs text-[#161616]">{proj.title}</span>
                    {proj.role && (
                      <span className="text-xs text-[#525252]"> ({proj.role})</span>
                    )}
                  </div>
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#0f62fe] hover:underline font-mono"
                    >
                      {proj.url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>

                {proj.description && (
                  <p className="text-xs text-[#393939] mt-0.5">{proj.description}</p>
                )}

                {proj.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-xs text-[#262626]">
                    {proj.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Education */}
      {educations.length > 0 && (
        <section className="resume-item-block mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#161616] border-b border-[#c6c6c6] pb-1 mb-2 font-mono">
            Education
          </h2>
          <div className="space-y-2">
            {educations.map((edu) => (
              <div key={edu.id} className="resume-item-block">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-xs text-[#161616]">{edu.institution}</span>
                    <span className="text-xs text-[#525252]"> — </span>
                    <span className="text-xs text-[#262626]">
                      {edu.degree}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </span>
                  </div>
                  <div className="text-xs text-[#525252] font-mono text-right">
                    {edu.endDate ? formatResumeDate(edu.endDate, formatting.dateFormat) : ''}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#6f6f6f]">
                  {edu.location && <span>{edu.location}</span>}
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  {edu.honors && edu.honors.length > 0 && (
                    <span>Honors: {edu.honors.join(', ')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Certifications */}
      {certifications.length > 0 && (
        <section className="resume-item-block mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#161616] border-b border-[#c6c6c6] pb-1 mb-2 font-mono">
            Certifications & Licenses
          </h2>
          <div className="space-y-1.5">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-semibold text-[#161616]">{cert.name}</span>
                  <span className="text-[#525252]"> — {cert.issuer}</span>
                  {cert.credentialId && (
                    <span className="text-[11px] text-[#6f6f6f] font-mono">
                      {' '}
                      (ID: {cert.credentialId})
                    </span>
                  )}
                </div>
                {cert.issueDate && (
                  <span className="text-xs text-[#525252] font-mono">
                    {formatResumeDate(cert.issueDate, formatting.dateFormat)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Custom Sections (e.g. Patents, Publications) */}
      {customSections.map((sec) => (
        <section key={sec.id} className="resume-item-block mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#161616] border-b border-[#c6c6c6] pb-1 mb-2 font-mono">
            {sec.title}
          </h2>
          <div className="space-y-2">
            {sec.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-xs text-[#161616]">{item.heading}</span>
                  {item.date && (
                    <span className="text-xs text-[#525252] font-mono">{item.date}</span>
                  )}
                </div>
                {item.subheading && (
                  <div className="text-[11px] text-[#525252] italic">{item.subheading}</div>
                )}
                {item.description && (
                  <p className="text-xs text-[#262626] mt-0.5">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
