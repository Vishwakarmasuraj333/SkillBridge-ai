import React from "react";
import { StructuredResumeData, TemplateProps } from "./types";
import { renderText, normalizeStringArray } from "@/lib/resume-normalizer";

interface SafeSectionProps {
  children: React.ReactNode;
}

export const SafeSection: React.FC<SafeSectionProps> = ({ children }) => {
  return <>{children}</>;
};

const renderSkillTags = (skills: any[] | undefined) => {
  const list = normalizeStringArray(skills);
  if (list.length === 0) return null;
  return list.map((skill, idx) => (
    <span
      key={idx}
      className="inline-block bg-muted text-foreground text-xs px-2.5 py-0.5 rounded mr-1.5 mb-1.5 border border-border"
    >
      {skill}
    </span>
  ));
};

// Standard A4 Watermark/Footer
const Watermark = ({ isPremiumUser }: { isPremiumUser?: boolean }) => {
  if (isPremiumUser) return null;
  return (
    <div className="w-full text-center text-[10px] text-muted-foreground pt-4 border-t border-border mt-6 print-footer">
      Created with SkillBridge AI Resume Builder
    </div>
  );
};

// 1. Classic Clean - FREE
export const ClassicCleanTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, projects, education, certifications, achievements, languages } = data;
  return (
    <div className="p-8 bg-white text-black font-serif min-h-[1050px] flex flex-col justify-between" style={{ fontFamily: "Georgia, serif" }}>
      <div>
        {/* Header */}
        <SafeSection>
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-900">{renderText(personalInfo.fullName)}</h1>
            <p className="text-sm italic text-gray-600 mt-1">{renderText(personalInfo.jobTitle)}</p>
            <div className="text-xs text-gray-500 mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span>{renderText(personalInfo.phone)}</span>
              <span>•</span>
              <span>{renderText(personalInfo.email)}</span>
              <span>•</span>
              <span>{renderText(personalInfo.location)}</span>
              {personalInfo.linkedin && (
                <>
                  <span>•</span>
                  <span>LinkedIn: {renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</span>
                </>
              )}
              {personalInfo.github && (
                <>
                  <span>•</span>
                  <span>GitHub: {renderText(personalInfo.github).replace(/https?:\/\/(www\.)?/, "")}</span>
                </>
              )}
            </div>
          </div>
        </SafeSection>

        {/* Summary */}
        {summary && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">Professional Summary</h2>
              <p className="text-xs text-gray-700 leading-relaxed text-justify">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">Professional Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline font-sans text-xs">
                      <span className="font-bold text-gray-950">{renderText(exp.role)} - <span className="font-semibold text-gray-800">{renderText(exp.company)}</span></span>
                      <span className="text-gray-600 font-medium">{renderText(exp.startDate)} – {renderText(exp.endDate)}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 italic font-sans">{renderText(exp.location)}</p>
                    <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-xs text-gray-700">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline font-sans text-xs">
                      <span className="font-bold text-gray-950">{renderText(proj.name)}</span>
                      <span className="text-gray-600 text-[10px]">{normalizeStringArray(proj.techStack).join(", ")}</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">{renderText(proj.description)}</p>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-xs text-gray-700">
                        {normalizeStringArray(proj.bullets).map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Skills */}
        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">Technical Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {skills.frontend && skills.frontend.length > 0 && (
                  <p className="text-gray-700"><span className="font-bold">Frontend:</span> {normalizeStringArray(skills.frontend).join(", ")}</p>
                )}
                {skills.backend && skills.backend.length > 0 && (
                  <p className="text-gray-700"><span className="font-bold">Backend:</span> {normalizeStringArray(skills.backend).join(", ")}</p>
                )}
                {skills.database && skills.database.length > 0 && (
                  <p className="text-gray-700"><span className="font-bold">Database:</span> {normalizeStringArray(skills.database).join(", ")}</p>
                )}
                {skills.tools && skills.tools.length > 0 && (
                  <p className="text-gray-700"><span className="font-bold">Tools:</span> {normalizeStringArray(skills.tools).join(", ")}</p>
                )}
                {skills.other && skills.other.length > 0 && (
                  <p className="text-gray-700"><span className="font-bold">Other:</span> {normalizeStringArray(skills.other).join(", ")}</p>
                )}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">Education</h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline text-xs text-gray-700">
                    <div>
                      <span className="font-bold text-gray-900">{renderText(edu.degree)}</span> – <span className="italic">{renderText(edu.institution)}</span>
                      {edu.score && <span className="text-[10px] text-gray-500 ml-2">({renderText(edu.score)})</span>}
                    </div>
                    <span className="text-gray-600 font-semibold">{renderText(edu.year)}</span>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Additional information in 2 cols */}
        {(certifications?.length || achievements?.length || languages?.length) && (
          <SafeSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {certifications && certifications.length > 0 && (
                <div>
                  <h3 className="font-bold uppercase text-gray-800 border-b pb-0.5 mb-1.5">Certifications</h3>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                    {certifications.map((cert: any, index: number) => (
                      <li key={index}>
                        <span>{renderText(cert.name || cert)}</span>
                        {cert.issuer && <span> - {renderText(cert.issuer)}</span>}
                        {cert.year && <span> ({renderText(cert.year)})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {achievements && achievements.length > 0 && (
                <div>
                  <h3 className="font-bold uppercase text-gray-800 border-b pb-0.5 mb-1.5">Achievements</h3>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                    {normalizeStringArray(achievements).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

// 2. Modern Blue - FREE
export const ModernBlueTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, projects, education, certifications, achievements } = data;
  return (
    <div className="p-8 bg-white text-slate-800 font-sans min-h-[1050px] flex flex-col justify-between">
      <div>
        {/* Header banner */}
        <SafeSection>
          <div className="border-l-4 border-blue-600 pl-4 mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{renderText(personalInfo.fullName)}</h1>
            <p className="text-base text-blue-600 font-semibold mt-0.5">{renderText(personalInfo.jobTitle)}</p>
            <div className="text-[11px] text-slate-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <span>📞 {renderText(personalInfo.phone)}</span>
              <span>✉️ {renderText(personalInfo.email)}</span>
              <span>📍 {renderText(personalInfo.location)}</span>
              {personalInfo.linkedin && <span>🔗 LinkedIn: {renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</span>}
            </div>
          </div>
        </SafeSection>

        {/* Summary */}
        {summary && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 border-b border-blue-100 pb-1">Profile</h2>
              <p className="text-xs text-slate-655 leading-relaxed text-justify">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 border-b border-blue-100 pb-1">Work History</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{renderText(exp.role)} <span className="text-blue-600 font-medium">@ {renderText(exp.company)}</span></span>
                      <span className="text-slate-500 font-semibold">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{renderText(exp.location)}</p>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-600">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 border-b border-blue-100 pb-1">Featured Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-955">
                      <span>{renderText(proj.name)}</span>
                      <span className="text-xs text-blue-600 font-medium">{normalizeStringArray(proj.techStack).join(" | ")}</span>
                    </div>
                    <p className="text-xs text-slate-600">{renderText(proj.description)}</p>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-600">
                        {normalizeStringArray(proj.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Core Skills */}
        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 border-b border-blue-100 pb-1">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(skills).map(([category, items]) => {
                  const list = normalizeStringArray(items);
                  if (list.length === 0) return null;
                  return list.map((item: string, i: number) => (
                    <span key={`${category}-${i}`} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {item}
                    </span>
                  ));
                })}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 border-b border-blue-100 pb-1">Education</h2>
              <div className="grid grid-cols-1 gap-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{renderText(edu.degree)}</span> - <span className="italic text-slate-600">{renderText(edu.institution)}</span>
                    </div>
                    <span className="text-slate-500 font-medium">{renderText(edu.year)}</span>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

export const MinimalATSTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, projects, education } = data;
  return (
    <div className="p-8 bg-white text-zinc-900 font-sans min-h-[1050px] flex flex-col justify-between" style={{ fontSize: "11px" }}>
      <div>
        {/* Simple Centered Header */}
        <SafeSection>
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold uppercase tracking-normal text-zinc-950">{renderText(personalInfo.fullName)}</h1>
            <p className="text-xs text-zinc-700 font-semibold mt-0.5">{renderText(personalInfo.jobTitle)}</p>
            <div className="mt-1 text-[11px] text-zinc-600 flex justify-center flex-wrap gap-2 divide-x divide-zinc-300">
              <span className="px-2">{renderText(personalInfo.phone)}</span>
              <span className="px-2">{renderText(personalInfo.email)}</span>
              <span className="px-2">{renderText(personalInfo.location)}</span>
              {personalInfo.linkedin && <span className="px-2">LinkedIn: {renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</span>}
            </div>
          </div>
        </SafeSection>

        {summary && (
          <SafeSection>
            <div className="mb-4">
              <p className="font-bold uppercase text-zinc-800 border-b border-zinc-800 pb-0.5 mb-1.5 tracking-wider" style={{ fontSize: "10px" }}>Summary</p>
              <p className="text-zinc-700 leading-relaxed text-justify">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-4">
              <p className="font-bold uppercase text-zinc-800 border-b border-zinc-800 pb-0.5 mb-1.5 tracking-wider" style={{ fontSize: "10px" }}>Experience</p>
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline font-bold">
                      <span>{renderText(exp.company)} — {renderText(exp.role)}</span>
                      <span className="font-medium text-zinc-600">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">{renderText(exp.location)}</p>
                    <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-zinc-700">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <SafeSection>
            <div className="mb-4">
              <p className="font-bold uppercase text-zinc-800 border-b border-zinc-800 pb-0.5 mb-1.5 tracking-wider" style={{ fontSize: "10px" }}>Projects</p>
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline font-bold">
                      <span>{renderText(proj.name)}</span>
                      <span className="font-medium text-[10px] text-zinc-650">{normalizeStringArray(proj.techStack).join(", ")}</span>
                    </div>
                    <p className="text-zinc-700 mt-0.5">{renderText(proj.description)}</p>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-zinc-700">
                        {normalizeStringArray(proj.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Skills */}
        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-4">
              <p className="font-bold uppercase text-zinc-800 border-b border-zinc-800 pb-0.5 mb-1.5 tracking-wider" style={{ fontSize: "10px" }}>Skills</p>
              <div className="space-y-1 text-zinc-700">
                {Object.entries(skills).map(([category, items]) => {
                  const list = normalizeStringArray(items);
                  if (list.length === 0) return null;
                  return (
                    <p key={category}>
                      <span className="font-bold capitalize">{category}:</span> {list.join(", ")}
                    </p>
                  );
                })}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <SafeSection>
            <div className="mb-4">
              <p className="font-bold uppercase text-zinc-800 border-b border-zinc-800 pb-0.5 mb-1.5 tracking-wider" style={{ fontSize: "10px" }}>Education</p>
              <div className="space-y-1.5">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline">
                    <span><span className="font-bold">{renderText(edu.institution)}</span> — {renderText(edu.degree)}</span>
                    <span className="font-medium text-zinc-650">{renderText(edu.year)}</span>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

// 4. Executive Pro - PREMIUM
export const ExecutiveProTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, education } = data;
  return (
    <div className="p-8 bg-white text-slate-800 font-serif min-h-[1050px] flex flex-col justify-between" style={{ fontFamily: "Georgia, serif" }}>
      <div>
        <SafeSection>
          <div className="border-b-2 border-slate-900 pb-3 mb-5">
            <h1 className="text-3xl font-bold tracking-tight uppercase text-slate-900">{renderText(personalInfo.fullName)}</h1>
            <p className="text-sm font-semibold tracking-wider text-slate-600 mt-1 uppercase">{renderText(personalInfo.jobTitle)}</p>
            <div className="text-[10px] text-slate-500 font-sans mt-3 flex justify-between flex-wrap gap-2">
              <span>{renderText(personalInfo.location)} | {renderText(personalInfo.phone)}</span>
              <span>{renderText(personalInfo.email)} | {renderText(personalInfo.linkedin)}</span>
            </div>
          </div>
        </SafeSection>

        {summary && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-2">Executive Summary</h2>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-3">Professional Achievements & Career</h2>
              <div className="space-y-5">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-sans text-xs font-bold text-slate-900">
                      <span>{renderText(exp.role)}</span>
                      <span className="font-medium text-slate-500">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] italic text-slate-600 font-medium">
                      <span>{renderText(exp.company)}</span>
                      <span>{renderText(exp.location)}</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs text-slate-700 mt-2">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-2">Core Competencies</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-sans text-slate-700">
                {Object.entries(skills).map(([cat, items]) => {
                  const list = normalizeStringArray(items);
                  if (list.length === 0) return null;
                  return (
                    <div key={cat} className="p-2 bg-slate-50 border border-slate-100 rounded">
                      <span className="font-bold block uppercase text-[9px] text-slate-500 mb-1">{cat}</span>
                      <span>{list.join(", ")}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SafeSection>
        )}

        {education && education.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-2">Academic Profile</h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline text-xs">
                    <span><span className="font-bold">{renderText(edu.degree)}</span> - {renderText(edu.institution)}</span>
                    <span className="text-slate-500 font-sans">{renderText(edu.year)}</span>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

// 5. Creative Sidebar - PREMIUM
export const CreativeSidebarTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, projects, education } = data;
  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-[1050px] flex flex-col justify-between">
      <div className="grid grid-cols-3 flex-1">
        {/* Left Sidebar */}
        <div className="col-span-1 bg-slate-900 text-slate-200 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header / Name */}
            <SafeSection>
              <div>
                <h1 className="text-xl font-bold leading-tight text-white">{renderText(personalInfo.fullName)}</h1>
                <p className="text-xs text-blue-400 font-medium mt-1">{renderText(personalInfo.jobTitle)}</p>
              </div>
            </SafeSection>

            {/* Contact */}
            <SafeSection>
              <div className="space-y-2.5 text-[10px] border-t border-slate-800 pt-4">
                <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Contact Info</h2>
                <p className="truncate">📞 {renderText(personalInfo.phone)}</p>
                <p className="truncate">✉️ {renderText(personalInfo.email)}</p>
                <p className="truncate">📍 {renderText(personalInfo.location)}</p>
                {personalInfo.linkedin && <p className="truncate">🔗 {renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</p>}
              </div>
            </SafeSection>

            {/* Skills */}
            {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
              <SafeSection>
                <div className="space-y-3 border-t border-slate-800 pt-4 text-[10px]">
                  <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Expertise</h2>
                  {Object.entries(skills).map(([category, items]) => {
                    const list = normalizeStringArray(items);
                    if (list.length === 0) return null;
                    return (
                      <div key={category} className="space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">{category}</span>
                        <p className="text-slate-350">{list.join(", ")}</p>
                      </div>
                    );
                  })}
                </div>
              </SafeSection>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <SafeSection>
                <div className="space-y-3 border-t border-slate-800 pt-4 text-[10px]">
                  <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Education</h2>
                  {education.map((edu, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="font-bold text-white leading-tight">{renderText(edu.degree)}</p>
                      <p className="text-slate-400">{renderText(edu.institution)}</p>
                      <p className="text-slate-500 font-medium">{renderText(edu.year)}</p>
                    </div>
                  ))}
                </div>
              </SafeSection>
            )}
          </div>
        </div>

        {/* Right Main Section */}
        <div className="col-span-2 bg-white p-8 space-y-6">
          {/* Summary */}
          {summary && (
            <SafeSection>
              <div className="space-y-1.5">
                <h2 className="text-sm font-bold text-slate-900 border-b pb-1">Professional Profile</h2>
                <p className="text-xs text-slate-655 leading-relaxed text-justify">{renderText(summary)}</p>
              </div>
            </SafeSection>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <SafeSection>
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 border-b pb-1">Work History</h2>
                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                        <span>{renderText(exp.role)}</span>
                        <span className="font-medium text-slate-455">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                      </div>
                      <p className="text-[10px] text-blue-600 font-bold">{renderText(exp.company)} | {renderText(exp.location)}</p>
                      <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-xs text-slate-600">
                        {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </SafeSection>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <SafeSection>
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 border-b pb-1">Featured Projects</h2>
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-955">
                        <span>{renderText(proj.name)}</span>
                        <span className="text-[10px] text-blue-600 font-medium">{normalizeStringArray(proj.techStack).join(" | ")}</span>
                      </div>
                      <p className="text-xs text-slate-600">{renderText(proj.description)}</p>
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-600">
                          {normalizeStringArray(proj.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SafeSection>
          )}
        </div>
      </div>
      <div className="bg-white px-8 pb-4">
        <Watermark isPremiumUser={isPremiumUser} />
      </div>
    </div>
  );
};

// 6. Developer Dark - PREMIUM
export const DeveloperDarkTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, projects, education } = data;
  return (
    <div className="p-8 bg-zinc-955 text-zinc-100 font-mono min-h-[1050px] flex flex-col justify-between" style={{ fontSize: "11px" }}>
      <div>
        {/* Terminal Header */}
        <SafeSection>
          <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-[10px] text-zinc-500 ml-2">antigravity@skillbridge-sh: ~</span>
            </div>
            <h1 className="text-xl font-bold text-blue-400">&gt; cat developer_profile.md</h1>
            <div className="mt-2 text-zinc-300">
              <p className="text-lg font-bold text-white">{renderText(personalInfo.fullName)}</p>
              <p className="text-blue-500 font-semibold">{renderText(personalInfo.jobTitle)}</p>
              <div className="text-[10px] text-zinc-500 mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
                <span>TEL: {renderText(personalInfo.phone)}</span>
                <span>EMAIL: {renderText(personalInfo.email)}</span>
                <span>LOC: {renderText(personalInfo.location)}</span>
                {personalInfo.linkedin && <span>LINKEDIN: {renderText(personalInfo.linkedin)}</span>}
                {personalInfo.github && <span>GITHUB: {renderText(personalInfo.github)}</span>}
              </div>
            </div>
          </div>
        </SafeSection>

        {summary && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 border-b border-zinc-800 pb-1"># Executive Summary</h2>
              <p className="text-zinc-300 leading-relaxed text-justify">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {/* Core Tech Stack */}
        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 border-b border-zinc-800 pb-1"># Tech Stack</h2>
              <div className="space-y-2">
                {Object.entries(skills).map(([category, items]) => {
                  const list = normalizeStringArray(items);
                  if (list.length === 0) return null;
                  return (
                    <p key={category} className="text-zinc-300">
                      <span className="text-blue-500 font-bold capitalize">{category}:</span> {list.join(", ")}
                    </p>
                  );
                })}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 border-b border-zinc-800 pb-1"># Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{renderText(exp.role)} @ {renderText(exp.company)}</span>
                      <span className="text-zinc-500 font-medium">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">{renderText(exp.location)}</p>
                    <ul className="list-none space-y-1 text-zinc-300 pl-4 mt-1">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx} className="before:content-['-'] before:mr-2">{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 border-b border-zinc-800 pb-1"># Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{renderText(proj.name)}</span>
                      <span className="text-blue-500 text-[10px]">{normalizeStringArray(proj.techStack).join(" | ")}</span>
                    </div>
                    <p className="text-zinc-300">{renderText(proj.description)}</p>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-none space-y-0.5 text-zinc-300 pl-4 mt-0.5">
                        {normalizeStringArray(proj.bullets).map((b, bIdx) => <li key={bIdx} className="before:content-['-'] before:mr-2">{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 border-b border-zinc-800 pb-1"># Education</h2>
              <div className="space-y-1">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between text-zinc-300">
                    <span>{renderText(edu.degree)} - {renderText(edu.institution)}</span>
                    <span className="text-zinc-500 font-semibold">{renderText(edu.year)}</span>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

// 7. Corporate Elite - PREMIUM
export const CorporateEliteTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, education } = data;
  return (
    <div className="p-8 bg-white text-gray-900 font-sans min-h-[1050px] flex flex-col justify-between" style={{ fontFamily: "Arial, sans-serif" }}>
      <div>
        {/* Deep Navy Corporate Header */}
        <SafeSection>
          <div className="bg-slate-900 text-white p-6 rounded-lg mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider text-white">{renderText(personalInfo.fullName)}</h1>
              <p className="text-xs text-blue-300 font-semibold mt-1 tracking-widest uppercase">{renderText(personalInfo.jobTitle)}</p>
            </div>
            <div className="text-[10px] text-right space-y-1 text-slate-350 shrink-0">
              <p>{renderText(personalInfo.phone)}</p>
              <p>{renderText(personalInfo.email)}</p>
              <p>{renderText(personalInfo.location)}</p>
              {personalInfo.linkedin && <p>{renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</p>}
            </div>
          </div>
        </SafeSection>

        {summary && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">Executive Summary</h2>
              <p className="text-xs text-gray-700 leading-relaxed text-justify">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">Employment History</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-900">
                      <span>{renderText(exp.role)} <span className="font-semibold text-slate-600">| {renderText(exp.company)}</span></span>
                      <span className="text-slate-500 font-medium">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold">{renderText(exp.location)}</p>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-gray-600 mt-1">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Skills */}
        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">Core Skills</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(skills).map(([cat, items]) => {
                  const list = normalizeStringArray(items);
                  if (list.length === 0) return null;
                  return list.map((item: string, i: number) => (
                    <span key={`${cat}-${i}`} className="bg-slate-100 text-slate-800 px-3 py-1 rounded text-xs border border-slate-200">
                      {item}
                    </span>
                  ));
                })}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">Education</h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-700">
                    <span><span className="font-bold">{renderText(edu.degree)}</span> - {renderText(edu.institution)}</span>
                    <span className="text-slate-500">{renderText(edu.year)}</span>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

// 8. Elegant Serif - PREMIUM
export const ElegantSerifTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, projects, education } = data;
  return (
    <div className="p-8 bg-white text-zinc-800 font-serif min-h-[1050px] flex flex-col justify-between" style={{ fontFamily: "Georgia, serif", fontSize: "11px" }}>
      <div>
        {/* Classic centered divider lines */}
        <SafeSection>
          <div className="text-center pb-5 mb-5 border-b border-zinc-200">
            <h1 className="text-3xl font-normal tracking-wide text-zinc-955">{renderText(personalInfo.fullName)}</h1>
            <p className="text-xs italic text-zinc-505 mt-1.5">{renderText(personalInfo.jobTitle)}</p>
            <div className="text-[10px] text-zinc-400 mt-3.5 flex justify-center gap-x-4 flex-wrap">
              <span>{renderText(personalInfo.phone)}</span>
              <span>{renderText(personalInfo.email)}</span>
              <span>{renderText(personalInfo.location)}</span>
            </div>
          </div>
        </SafeSection>

        {summary && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 text-center mb-2.5">Profile</h2>
              <p className="text-zinc-700 leading-relaxed text-justify text-[11px]">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 text-center mb-3">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>{renderText(exp.company)} — <span className="font-normal italic">{renderText(exp.role)}</span></span>
                      <span className="font-semibold text-zinc-505">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 italic mb-1">{renderText(exp.location)}</p>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-zinc-700 text-[10px]">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {projects && projects.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 text-center mb-3">Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>{renderText(proj.name)}</span>
                      <span className="text-[10px] text-zinc-505 font-medium">{normalizeStringArray(proj.techStack).join(", ")}</span>
                    </div>
                    <p className="text-[10px] text-zinc-650 mt-1 leading-relaxed">{renderText(proj.description)}</p>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-zinc-700 text-[10px]">
                        {normalizeStringArray(proj.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 text-center mb-2.5">Expertise</h2>
              <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-755">
                {Object.entries(skills).map(([cat, items]) => {
                  const list = normalizeStringArray(items);
                  if (list.length === 0) return null;
                  return (
                    <p key={cat}>
                      <span className="font-bold capitalize">{cat}:</span> {list.join(", ")}
                    </p>
                  );
                })}
              </div>
            </div>
          </SafeSection>
        )}

        {education && education.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 text-center mb-2">Education</h2>
              <div className="space-y-1.5 text-center">
                {education.map((edu, idx) => (
                  <p key={idx} className="text-[11px]">
                    <span className="font-bold">{renderText(edu.degree)}</span> from <span className="italic">{renderText(edu.institution)}</span>, {renderText(edu.year)}
                  </p>
                ))}
              </div>
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

// 9. Tech Gradient - PREMIUM
export const TechGradientTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, projects, education } = data;
  return (
    <div className="p-8 bg-zinc-900 text-zinc-100 font-sans min-h-[1050px] flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic top gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      <div>
        <SafeSection>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-5 mt-2">
            <div>
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 tracking-tight">{renderText(personalInfo.fullName)}</h1>
              <p className="text-sm text-zinc-400 font-medium mt-1">{renderText(personalInfo.jobTitle)}</p>
            </div>
            <div className="text-[10px] text-zinc-400 space-y-1 font-mono">
              <p>📞 {renderText(personalInfo.phone)}</p>
              <p>✉️ {renderText(personalInfo.email)}</p>
              <p>📍 {renderText(personalInfo.location)}</p>
              {personalInfo.linkedin && <p>🔗 {renderText(personalInfo.linkedin).replace(/https?:\/\/(www\.)?/, "")}</p>}
            </div>
          </div>
        </SafeSection>

        {summary && (
          <SafeSection>
            <div className="mb-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">/ Profile Summary</h2>
              <p className="text-xs text-zinc-350 leading-relaxed text-justify">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {/* Skills */}
        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">/ Skill Badges</h2>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(skills).flat().filter(Boolean).map((item, i) => (
                  <span key={i} className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-semibold font-mono">
                    {renderText(item)}
                  </span>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">/ Career</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1 border-l border-zinc-800 pl-4 relative">
                    <span className="absolute left-[-4.5px] top-1.5 h-2 w-2 rounded-full bg-blue-500" />
                    <div className="flex justify-between text-xs font-bold text-white">
                      <span>{renderText(exp.role)} @ <span className="text-blue-400">{renderText(exp.company)}</span></span>
                      <span className="text-zinc-500 font-mono">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">{renderText(exp.location)}</p>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-zinc-400 mt-1">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <SafeSection>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">/ Builds</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1 p-3 bg-zinc-900 border border-zinc-850 rounded-xl">
                    <div className="flex justify-between items-baseline text-xs font-bold text-white">
                      <span>{renderText(proj.name)}</span>
                      <span className="text-[9px] text-blue-400 font-mono">{normalizeStringArray(proj.techStack).join(", ")}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{renderText(proj.description)}</p>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-zinc-450 mt-1">
                        {normalizeStringArray(proj.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

// 10. Compact One Page - PREMIUM
export const CompactOnePageTemplate: React.FC<TemplateProps> = ({ data, isPremiumUser }) => {
  const { personalInfo, summary, skills, experience, projects, education } = data;
  return (
    <div className="p-5 bg-white text-zinc-900 font-sans min-h-[850px] flex flex-col justify-between" style={{ fontSize: "10px", lineHeight: "1.3" }}>
      <div>
        {/* Very compact header */}
        <SafeSection>
          <div className="flex justify-between items-start border-b pb-2 mb-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-955">{renderText(personalInfo.fullName)}</h1>
              <p className="text-xs text-slate-600 font-semibold">{renderText(personalInfo.jobTitle)}</p>
            </div>
            <div className="text-[9px] text-right text-zinc-500 font-mono">
              <p>{renderText(personalInfo.phone)} | {renderText(personalInfo.email)}</p>
              <p>{renderText(personalInfo.location)} {personalInfo.linkedin ? `| LinkedIn` : ""}</p>
            </div>
          </div>
        </SafeSection>

        {summary && (
          <SafeSection>
            <div className="mb-3">
              <p className="font-bold uppercase text-[9px] text-zinc-800 tracking-wider">Summary</p>
              <p className="text-zinc-700 text-justify">{renderText(summary)}</p>
            </div>
          </SafeSection>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <SafeSection>
            <div className="mb-3">
              <p className="font-bold uppercase text-[9px] text-zinc-800 tracking-wider border-b pb-0.5 mb-1.5">Experience</p>
              <div className="space-y-2">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-bold">
                      <span>{renderText(exp.role)} - <span className="font-normal">{renderText(exp.company)}</span></span>
                      <span className="font-medium text-zinc-500 font-mono">{renderText(exp.startDate)} - {renderText(exp.endDate)}</span>
                    </div>
                    <ul className="list-disc ml-3.5 space-y-0.5 text-zinc-700 text-[9px]">
                      {normalizeStringArray(exp.bullets).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <SafeSection>
            <div className="mb-3">
              <p className="font-bold uppercase text-[9px] text-zinc-800 tracking-wider border-b pb-0.5 mb-1.5">Projects</p>
              <div className="space-y-1.5">
                {projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-bold">
                      <span>{renderText(proj.name)} <span className="font-normal text-[8px] text-zinc-500">({normalizeStringArray(proj.techStack).join(", ")})</span></span>
                    </div>
                    <p className="text-zinc-700">{renderText(proj.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Skills */}
        {skills && Object.values(skills).some((arr) => arr && arr.length > 0) && (
          <SafeSection>
            <div className="mb-3">
              <p className="font-bold uppercase text-[9px] text-zinc-800 tracking-wider border-b pb-0.5 mb-1">Skills</p>
              <div className="grid grid-cols-2 gap-1 text-[9px] text-zinc-700">
                {Object.entries(skills).map(([cat, items]) => {
                  const list = normalizeStringArray(items);
                  if (list.length === 0) return null;
                  return (
                    <p key={cat}>
                      <span className="font-bold capitalize">{cat}:</span> {list.join(", ")}
                    </p>
                  );
                })}
              </div>
            </div>
          </SafeSection>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <SafeSection>
            <div className="mb-3">
              <p className="font-bold uppercase text-[9px] text-zinc-800 tracking-wider border-b pb-0.5 mb-1">Education</p>
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between text-zinc-700">
                  <span><span className="font-bold">{renderText(edu.degree)}</span>, {renderText(edu.institution)}</span>
                  <span className="font-mono text-zinc-500">{renderText(edu.year)}</span>
                </div>
              ))}
            </div>
          </SafeSection>
        )}
      </div>
      <Watermark isPremiumUser={isPremiumUser} />
    </div>
  );
};

// 11. Templates registry list
export const templatesList = [
  {
    id: "classic-clean",
    name: "Classic Clean",
    type: "FREE",
    category: "ATS Friendly",
    description: "Georgia serif font style with elegant traditional headings.",
    previewImage: "",
    component: ClassicCleanTemplate,
  },
  {
    id: "modern-blue",
    name: "Modern Blue",
    type: "FREE",
    category: "Modern",
    description: "Sleek blue layout, left alignment, clean contact items.",
    previewImage: "",
    component: ModernBlueTemplate,
  },
  {
    id: "minimal-ats",
    name: "Minimal ATS",
    type: "FREE",
    category: "ATS Friendly",
    description: "Maximum tracking system performance, direct styling.",
    previewImage: "",
    component: MinimalATSTemplate,
  },
  {
    id: "executive-pro",
    name: "Executive Pro",
    type: "FREE",
    category: "Executive",
    description: "Prestigious layout for management roles and industry leaders.",
    previewImage: "",
    component: ExecutiveProTemplate,
  },
  {
    id: "creative-sidebar",
    name: "Creative Sidebar",
    type: "FREE",
    category: "Creative",
    description: "Double column page layout with stylish sidebar highlights.",
    previewImage: "",
    component: CreativeSidebarTemplate,
  },
  {
    id: "developer-dark",
    name: "Developer Dark",
    type: "FREE",
    category: "Developer",
    description: "IDE terminal monospace theme for tech roles and engineers.",
    previewImage: "",
    component: DeveloperDarkTemplate,
  },
  {
    id: "corporate-elite",
    name: "Corporate Elite",
    type: "FREE",
    category: "Executive",
    description: "Premium navy block structure with a modern corporate feel.",
    previewImage: "",
    component: CorporateEliteTemplate,
  },
  {
    id: "elegant-serif",
    name: "Elegant Serif",
    type: "FREE",
    category: "Modern",
    description: "Poised Georgia design featuring centered header labels.",
    previewImage: "",
    component: ElegantSerifTemplate,
  },
  {
    id: "tech-gradient",
    name: "Tech Gradient",
    type: "FREE",
    category: "Developer",
    description: "Cyberpunk neon theme featuring visual technology tag markers.",
    previewImage: "",
    component: TechGradientTemplate,
  },
  {
    id: "compact-one-page",
    name: "Compact One Page",
    type: "FREE",
    category: "ATS Friendly",
    description: "Compressed structural elements optimized for single page guidelines.",
    previewImage: "",
    component: CompactOnePageTemplate,
  },
];
