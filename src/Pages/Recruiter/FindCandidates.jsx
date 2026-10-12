import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Code2,
  ExternalLink,
  Globe,
  FileText,
  Sparkles,
  Users,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Target,
  Award,
  LoaderCircle,
  ChevronDown,
  Briefcase,
} from "lucide-react";

import API_BASE from "../../Config/api";

const CANDIDATES_API = `${API_BASE}/recruiter/candidates.php`;

const JOBS_API = `${API_BASE}/recruiter/jobs.php`;

const MATCH_API = `${API_BASE}/recruiter/candidate-match.php`;

const DEFAULT_LIMIT = 12;

const EXPERIENCE_OPTIONS = [
  "Fresher",
  "0-1 Years",
  "1-2 Years",
  "2-3 Years",
  "3-5 Years",
  "5+ Years",
];

/* =========================================================
   HELPERS
========================================================= */

function getUserFromStorage() {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("User storage error:", error);
    return null;
  }
}

function getUserId(user) {
  return Number(user?.id || user?.user_id || user?.userId || 0);
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "C"
  );
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (parsed && typeof parsed === "object") {
        return [parsed];
      }

      return parsed ? [parsed] : [];
    } catch (error) {
      // Normal plain text experience
      return value.trim() ? [value] : [];
    }
  }

  if (typeof value === "object") {
    return [value];
  }

  return [];
}

function getScoreClass(score) {
  if (score >= 80) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (score >= 60) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (score >= 40) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-red-50 text-red-700 border-red-200";
}

function getScoreLabel(score) {
  if (score >= 80) {
    return "Excellent Match";
  }

  if (score >= 60) {
    return "Good Match";
  }

  if (score >= 40) {
    return "Partial Match";
  }

  return "Low Match";
}

/* =========================================================
   MATCH SCORE CARD
========================================================= */

function MatchScoreBox({ match, loading, compact = false }) {
  if (loading) {
    return (
      <div
        className={`rounded-2xl border border-cyan-100 bg-cyan-50 ${
          compact ? "p-3" : "p-5"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Calculating match...
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div
        className={`rounded-2xl border border-slate-200 bg-slate-50 ${
          compact ? "p-3" : "p-5"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Target className="h-4 w-4" />
          Select a job to calculate match score
        </div>
      </div>
    );
  }

  const score = Number(match.match_score || 0);

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-600" />

            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Match Score
            </span>
          </div>

          <p
            className={`mt-1 text-xs font-semibold ${
              score >= 80
                ? "text-emerald-700"
                : score >= 60
                  ? "text-blue-700"
                  : score >= 40
                    ? "text-amber-700"
                    : "text-red-700"
            }`}
          >
            {match.match_label || getScoreLabel(score)}
          </p>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 text-sm font-black ${getScoreClass(
            score,
          )}`}
        >
          {score}%
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-5 space-y-3">
            <ScoreRow
              label="Skills"
              score={match.breakdown?.skills?.score}
              max={50}
            />

            <ScoreRow
              label="Experience"
              score={match.breakdown?.experience?.score}
              max={20}
            />

            <ScoreRow
              label="Location"
              score={match.breakdown?.location?.score}
              max={15}
            />

            <ScoreRow
              label="Education"
              score={match.breakdown?.education?.score}
              max={10}
            />

            <ScoreRow
              label="Category"
              score={match.breakdown?.category?.score}
              max={5}
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Matched Skills
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {match.matched_skills?.length > 0 ? (
                  match.matched_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">
                    No matched skills
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                Missing Skills
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {match.missing_skills?.length > 0 ? (
                  match.missing_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                    >
                      × {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">
                    No missing skills
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ScoreRow({ label, score = 0, max }) {
  const percentage = max > 0 ? Math.round((Number(score) / max) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>

        <span className="font-bold text-slate-800">
          {score}/{max}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   CANDIDATE CARD
========================================================= */

function CandidateCard({
  candidate,
  match,
  matchLoading,
  onViewProfile,
  onInvite,
}) {
  const skills = normalizeArray(candidate.skills).slice(0, 6);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />

      <div className="flex-1 p-5">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {candidate.profile_image ? (
                <img
                  src={candidate.profile_image}
                  alt={candidate.name}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-500">
                  {getInitials(candidate.name)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-900">
                {candidate.name || "Candidate"}
              </h3>

              <p className="mt-0.5 truncate text-sm font-medium text-cyan-700">
                {candidate.headline || "Job Seeker"}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            Available
          </span>
        </div>

        {/* BASIC DATA */}

        <div className="mt-5 space-y-2.5">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

            <span className="line-clamp-1">
              {candidate.location || "Location not specified"}
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600">
            <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

            <span>
              {candidate.experience_level || "Experience not specified"}
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-600">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

            <span className="line-clamp-1">
              {candidate.category_name || "General"}
            </span>
          </div>
        </div>

        {/* SKILLS */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Skills
            </span>

            {candidate.category_name && (
              <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                {candidate.category_name}
              </span>
            )}
          </div>

          <div className="flex min-h-[58px] flex-wrap content-start gap-1.5">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={`${candidate.candidate_id}-skill-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {String(skill)}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">No skills added</span>
            )}
          </div>
        </div>

        {/* MATCH SCORE */}

        <div className="mt-5">
          <MatchScoreBox match={match} loading={matchLoading} compact />
        </div>
      </div>

      {/* BUTTONS */}

      <div className="border-t border-slate-100 bg-slate-50/70 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onViewProfile(candidate)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" />
            View Profile
          </button>

          <button
            type="button"
            onClick={() => onInvite(candidate)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4" />
            Invite
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PROFILE MODAL
========================================================= */

function CandidateProfileModal({
  candidate,
  match,
  matchLoading,
  onClose,
  onInvite,
}) {
  if (!candidate) {
    return null;
  }

  const skills = normalizeArray(candidate.skills);
  const education = normalizeArray(candidate.education);
  const projects = normalizeArray(candidate.projects);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
              Candidate Profile
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {candidate.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto p-5 sm:p-7">
          {/* PROFILE TOP */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              {candidate.profile_image ? (
                <img
                  src={candidate.profile_image}
                  alt={candidate.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500">
                  {getInitials(candidate.name)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  {candidate.name}
                </h3>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Candidate
                </span>
              </div>

              <p className="mt-1 text-base font-medium text-cyan-700">
                {candidate.headline || "Job Seeker"}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {candidate.location || "Not specified"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-4 w-4" />
                  {candidate.experience_level || "Not specified"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {candidate.category_name || "General"}
                </span>
              </div>
            </div>
          </div>

          {/* MATCH SCORE */}

          <div className="mt-6">
            <MatchScoreBox match={match} loading={matchLoading} />
          </div>

          {/* ABOUT + EXPERIENCE */}

          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:col-span-2">
              <h4 className="font-bold text-slate-900">About Candidate</h4>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {candidate.bio || "Candidate has not added a bio yet."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
  <h4 className="font-bold text-slate-900">
    Experience
  </h4>

  {(() => {
    const experienceList = normalizeArray(candidate.experience);

    if (experienceList.length === 0) {
      return (
        <p className="mt-3 text-sm text-slate-400">
          No experience details added.
        </p>
      );
    }

    return (
      <div className="mt-4 space-y-3">
        {experienceList.map((item, index) => {
          // Plain text experience
          if (typeof item === "string") {
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <p className="text-sm leading-6 text-slate-600">
                  {item}
                </p>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              {/* Designation */}
              {item.designation && (
                <p className="text-sm font-bold text-slate-900">
                  {item.designation}
                </p>
              )}

              {/* Company */}
              {item.company && (
                <p className="mt-1 text-sm font-medium text-cyan-700">
                  {item.company}
                </p>
              )}

              {/* Duration */}
              {item.duration && (
                <p className="mt-1 text-xs text-slate-500">
                  {item.duration}
                </p>
              )}

              {/* Location */}
              {item.location && (
                <p className="mt-1 text-xs text-slate-500">
                  {item.location}
                </p>
              )}

              {/* Description */}
              {item.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  })()}

  <div className="my-5 h-px bg-slate-100" />

  <h4 className="font-bold text-slate-900">
    Category
  </h4>

  <p className="mt-3 text-sm text-slate-600">
    {candidate.category_name || "General"}
  </p>
</div>
          </div>

          {/* SKILLS + EDUCATION */}

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">Skills</h4>

              <div className="mt-4 flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700"
                    >
                      {String(skill)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">
                    No skills added.
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">Education</h4>

              {education.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {education.map((item, index) => {
                    if (typeof item === "string") {
                      return (
                        <div
                          key={index}
                          className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"
                        >
                          {item}
                        </div>
                      );
                    }

                    return (
                      <div key={index} className="rounded-xl bg-slate-50 p-3">
                        <p className="font-semibold text-slate-800">
                          {item.degree || "Education"}
                        </p>

                        {item.university && (
                          <p className="mt-1 text-sm text-slate-500">
                            {item.university}
                          </p>
                        )}

                        {item.duration && (
                          <p className="mt-1 text-xs text-slate-400">
                            {item.duration}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  No education details added.
                </p>
              )}
            </section>
          </div>

          {/* PROJECTS */}

          {projects.length > 0 && (
            <section className="mt-5 rounded-2xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">Projects</h4>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {projects.map((project, index) => (
                  <div key={index} className="rounded-xl bg-slate-50 p-4">
                    {typeof project === "string" ? (
                      <p className="text-sm text-slate-600">{project}</p>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-800">
                          {project.name || "Project"}
                        </p>

                        {project.description && (
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {project.description}
                          </p>
                        )}

                        {project.technologies && (
                          <p className="mt-2 text-xs font-medium text-cyan-700">
                            {Array.isArray(project.technologies)
                              ? project.technologies.join(", ")
                              : project.technologies}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* LINKS */}

          <section className="mt-5 rounded-2xl border border-slate-200 p-5">
            <h4 className="font-bold text-slate-900">Professional Links</h4>

            <div className="mt-4 flex flex-wrap gap-2">
              {candidate.resume && (
                <a
                  href={candidate.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <FileText className="h-4 w-4" />
                  Resume
                </a>
              )}

              {candidate.linkedin && (
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  LinkedIn
                </a>
              )}

              {candidate.github && (
                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Code2 className="h-4 w-4" />
                  GitHub
                </a>
              )}

              {candidate.portfolio && (
                <a
                  href={candidate.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Globe className="h-4 w-4" />
                  Portfolio
                </a>
              )}

              {!candidate.resume &&
                !candidate.linkedin &&
                !candidate.github &&
                !candidate.portfolio && (
                  <p className="text-sm text-slate-400">
                    No professional links added.
                  </p>
                )}
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onInvite(candidate)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4" />
            Invite to Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function FindCandidates() {
  const [user, setUser] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedJobId, setSelectedJobId] = useState("");

  const [matchScores, setMatchScores] = useState({});
  const [matchLoading, setMatchLoading] = useState({});

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [selectedCandidateMatch, setSelectedCandidateMatch] = useState(null);

  const [selectedCandidateMatchLoading, setSelectedCandidateMatchLoading] =
    useState(false);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [education, setEducation] = useState("");

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  const [error, setError] = useState("");
  const [jobsError, setJobsError] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    total_pages: 0,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    const currentUser = getUserFromStorage();

    if (!currentUser) {
      setError("Recruiter login information not found.");
      setLoading(false);
      setJobsLoading(false);
      return;
    }

    if (currentUser.role !== "recruiter") {
      setError("Only recruiters can access Find Candidates.");
      setLoading(false);
      setJobsLoading(false);
      return;
    }

    setUser(currentUser);
  }, []);

  /* =========================================================
     FETCH RECRUITER JOBS
  ========================================================= */

  const fetchJobs = async () => {
    const currentUser = getUserFromStorage();
    const recruiterId = getUserId(currentUser);

    if (!recruiterId) {
      setJobsError("Recruiter ID not found.");
      setJobsLoading(false);
      return;
    }

    try {
      setJobsLoading(true);
      setJobsError("");

      const response = await fetch(`${JOBS_API}?recruiterId=${recruiterId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load recruiter jobs.");
      }

      const fetchedJobs = data.data?.jobs || [];

      setJobs(fetchedJobs);

      /*
       * Automatically select first active job.
       */

      const firstActiveJob =
        fetchedJobs.find(
          (job) => String(job.status).toLowerCase() === "active",
        ) || fetchedJobs[0];

      if (firstActiveJob) {
        setSelectedJobId(String(firstActiveJob.id));
      }
    } catch (err) {
      console.error("Jobs Error:", err);

      setJobs([]);
      setJobsError(err.message || "Unable to load recruiter jobs.");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  /* =========================================================
     FETCH CANDIDATES
  ========================================================= */

  const fetchCandidates = async (requestedPage = page) => {
    const currentUser = getUserFromStorage();
    const recruiterId = getUserId(currentUser);

    if (!recruiterId) {
      setError("Recruiter login information not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.append("recruiterId", String(recruiterId));

      params.append("page", String(requestedPage));

      params.append("limit", String(DEFAULT_LIMIT));

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (categoryId) {
        params.append("category_id", categoryId);
      }

      if (location.trim()) {
        params.append("location", location.trim());
      }

      if (experienceLevel) {
        params.append("experience_level", experienceLevel);
      }

      if (education.trim()) {
        params.append("education", education.trim());
      }

      const response = await fetch(`${CANDIDATES_API}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error("Non JSON response:", text);

        throw new Error(
          `Server returned ${response.status}. Check candidates.php`,
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load candidates.");
      }

      const fetchedCandidates = data.data?.candidates || [];

      setCandidates(fetchedCandidates);

      setCategories(data.data?.categories || []);

      setPagination(
        data.data?.pagination || {
          page: requestedPage,
          limit: DEFAULT_LIMIT,
          total: 0,
          total_pages: 0,
        },
      );

      setPage(requestedPage);

      /*
       * Existing score data belongs to previous page.
       * Clear it before calculating new candidates.
       */

      setMatchScores({});
    } catch (err) {
      console.error("Find Candidates Error:", err);

      setCandidates([]);

      setError(err.message || "Unable to load candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && user?.role === "recruiter") {
      fetchCandidates(1);
    }
  }, [user]);

  /* =========================================================
     CALCULATE ONE CANDIDATE MATCH
  ========================================================= */

  const calculateCandidateMatch = async (candidate) => {
    if (!selectedJobId) {
      return null;
    }

    const candidateId = Number(candidate.candidate_id || candidate.id || 0);

    const jobId = Number(selectedJobId);

    if (!candidateId || !jobId) {
      console.error("Invalid candidate/job ID", {
        candidateId,
        jobId,
      });

      return null;
    }

    try {
      setMatchLoading((previous) => ({
        ...previous,
        [candidateId]: true,
      }));

      const currentUser = getUserFromStorage();

      const recruiterId = getUserId(currentUser);

      const params = new URLSearchParams();

      params.append("candidateId", String(candidateId));

      params.append("jobId", String(jobId));

      /*
       * Extra recruiterId is useful if backend
       * authorization is added later.
       */

      params.append("recruiterId", String(recruiterId));

      const response = await fetch(`${MATCH_API}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to calculate match.");
      }

      const match = data.data || null;

      setMatchScores((previous) => ({
        ...previous,
        [candidateId]: match,
      }));

      return match;
    } catch (error) {
      console.error(`Match error for candidate ${candidateId}:`, error);

      return null;
    } finally {
      setMatchLoading((previous) => ({
        ...previous,
        [candidateId]: false,
      }));
    }
  };

  /* =========================================================
     CALCULATE ALL CURRENT CANDIDATES
  ========================================================= */

  useEffect(() => {
    if (!selectedJobId || candidates.length === 0) {
      return;
    }

    setMatchScores({});

    candidates.forEach((candidate) => {
      calculateCandidateMatch(candidate);
    });
  }, [selectedJobId, candidates]);

  /* =========================================================
     JOB CHANGE
  ========================================================= */

  const handleJobChange = (event) => {
    const newJobId = event.target.value;

    setSelectedJobId(newJobId);

    setSelectedCandidateMatch(null);
  };

  /* =========================================================
     PROFILE
  ========================================================= */

  const handleViewProfile = async (candidate) => {
    setSelectedCandidate(candidate);

    setSelectedCandidateMatch(null);

    if (!selectedJobId) {
      return;
    }

    const candidateId = Number(candidate.candidate_id || candidate.id || 0);

    const existingMatch = matchScores[candidateId];

    if (existingMatch) {
      setSelectedCandidateMatch(existingMatch);

      return;
    }

    setSelectedCandidateMatchLoading(true);

    const match = await calculateCandidateMatch(candidate);

    setSelectedCandidateMatch(match);

    setSelectedCandidateMatchLoading(false);
  };

  /* =========================================================
     INVITE
  ========================================================= */

  const handleInvite = (candidate) => {
    if (!selectedJobId) {
      setInviteMessage("Please select a job before inviting a candidate.");

      setTimeout(() => {
        setInviteMessage("");
      }, 4000);

      return;
    }

    setSelectedCandidate(null);

    const selectedJob = jobs.find(
      (job) => String(job.id) === String(selectedJobId),
    );

    setInviteMessage(
      `Invitation selected for ${candidate.name || "candidate"} for ${
        selectedJob?.job_title || "selected job"
      }.`,
    );

    setTimeout(() => {
      setInviteMessage("");
    }, 4000);
  };

  /* =========================================================
     FILTER SEARCH
  ========================================================= */

  const handleSearch = (event) => {
    event?.preventDefault();

    fetchCandidates(1);
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setCategoryId("");
    setExperienceLevel("");
    setEducation("");

    setTimeout(() => {
      fetchCandidates(1);
    }, 0);
  };

  const hasFilters =
    search || location || categoryId || experienceLevel || education;

  /* =========================================================
     PAGINATION
  ========================================================= */

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > pagination.total_pages || newPage === page) {
      return;
    }

    fetchCandidates(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.total_pages;

    if (!totalPages) {
      return [];
    }

    const numbers = [];

    const start = Math.max(1, page - 2);

    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }

    return numbers;
  }, [pagination.total_pages, page]);

  const selectedJob = jobs.find(
    (job) => String(job.id) === String(selectedJobId),
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="min-h-[calc(100vh-120px)] bg-slate-50">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-5 text-white shadow-xl sm:p-7 lg:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
                  <Users className="h-4 w-4" />
                  Recruiter Talent Search
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  Find the right candidates
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Search candidates and compare their skills, experience,
                  education, location and category against your selected job.
                </p>
              </div>

              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-medium text-slate-300">
                  Candidates Found
                </p>

                <p className="mt-1 text-3xl font-black">
                  {pagination.total || 0}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              JOB SELECT
          ================================================= */}

          <div className="mt-6 rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-cyan-600" />

                  <label className="text-sm font-bold text-slate-900">
                    Select Job for Match Score
                  </label>
                </div>

                <div className="relative">
                  <select
                    value={selectedJobId}
                    onChange={handleJobChange}
                    disabled={jobsLoading || jobs.length === 0}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  >
                    <option value="">Select a job</option>

                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.job_title}
                        {job.position ? ` — ${job.position}` : ""}
                        {job.status !== "active" ? ` (${job.status})` : ""}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {selectedJob && (
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-600">
                    Matching Against
                  </p>

                  <p className="mt-1 font-bold text-cyan-950">
                    {selectedJob.job_title}
                  </p>

                  <p className="mt-0.5 text-xs text-cyan-700">
                    {selectedJob.company_name}
                    {" • "}
                    {selectedJob.location}
                  </p>
                </div>
              )}
            </div>

            {jobsError && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {jobsError}
                </div>

                <button
                  type="button"
                  onClick={fetchJobs}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            )}

            {!jobsLoading && jobs.length === 0 && !jobsError && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  You have no jobs available for matching.
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Create a job first, then return to Find Candidates.
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              INFO
          ================================================= */}

          {selectedJob && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <Target className="h-5 w-5 shrink-0 text-blue-600" />

              <p className="text-sm text-blue-800">
                Match Score is calculated dynamically against{" "}
                <strong>{selectedJob.job_title}</strong>. It is based on skills,
                experience, location, education and category.
              </p>
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {inviteMessage && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />

              {inviteMessage}
            </div>
          )}

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search candidate, skill, headline, location..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <Search className="h-4 w-4" />
                  Search Candidates
                </button>
              </div>

              {/* FILTERS */}

              <div className="mt-4">
                <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* CATEGORY */}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Category
                    </label>

                    <select
                      value={categoryId}
                      onChange={(event) => setCategoryId(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    >
                      <option value="">All Categories</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* LOCATION */}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Location
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="text"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="e.g. Lucknow"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  {/* EXPERIENCE */}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Experience
                    </label>

                    <select
                      value={experienceLevel}
                      onChange={(event) =>
                        setExperienceLevel(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    >
                      <option value="">All Experience Levels</option>

                      {EXPERIENCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* EDUCATION */}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Education
                    </label>

                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="text"
                        value={education}
                        onChange={(event) => setEducation(event.target.value)}
                        placeholder="e.g. BCA, B.Tech"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                      />
                    </div>
                  </div>
                </div>

                {hasFilters && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      Active filters are applied.
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-red-800">
                    Unable to load candidates
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-red-700">{error}</p>

                  <button
                    type="button"
                    onClick={() => fetchCandidates(page)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              RESULT HEADER
          ================================================= */}

          {!error && (
            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Talent pool
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {loading
                    ? "Finding candidates..."
                    : `${pagination.total || 0} candidates found`}
                </h2>
              </div>

              {!loading && pagination.total > 0 && (
                <p className="text-sm text-slate-500">
                  Page {page} of {pagination.total_pages}
                </p>
              )}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="animate-pulse">
                    <div className="flex gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-slate-200" />

                      <div className="flex-1">
                        <div className="h-4 w-32 rounded bg-slate-200" />

                        <div className="mt-2 h-3 w-24 rounded bg-slate-200" />
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="h-3 w-full rounded bg-slate-200" />
                      <div className="h-3 w-3/4 rounded bg-slate-200" />
                      <div className="h-3 w-1/2 rounded bg-slate-200" />
                    </div>

                    <div className="mt-6 h-20 rounded-2xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading && !error && candidates.length === 0 && (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No candidates found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try changing your search keywords or filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* =================================================
              CANDIDATES
          ================================================= */}

          {!loading && !error && candidates.length > 0 && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {candidates.map((candidate) => {
                const candidateId = Number(
                  candidate.candidate_id || candidate.id || 0,
                );

                return (
                  <CandidateCard
                    key={candidateId}
                    candidate={candidate}
                    match={matchScores[candidateId]}
                    matchLoading={matchLoading[candidateId] || false}
                    onViewProfile={handleViewProfile}
                    onInvite={handleInvite}
                  />
                );
              })}
            </div>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading && !error && pagination.total_pages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => goToPage(pageNumber)}
                  className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
                    pageNumber === page
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                disabled={page >= pagination.total_pages}
                onClick={() => goToPage(page + 1)}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          {!loading && !error && candidates.length > 0 && (
            <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <Award className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-cyan-900">
                  Smart Candidate Matching
                </p>

                <p className="mt-0.5 text-xs leading-5 text-cyan-800">
                  Select a job to compare every candidate dynamically against
                  your actual job requirements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          match={selectedCandidateMatch}
          matchLoading={selectedCandidateMatchLoading}
          onClose={() => {
            setSelectedCandidate(null);

            setSelectedCandidateMatch(null);
          }}
          onInvite={handleInvite}
        />
      )}
    </>
  );
}
