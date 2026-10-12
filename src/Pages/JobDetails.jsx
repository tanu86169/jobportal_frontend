import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

import {
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  IndianRupee,
  MapPin,
  Share2,
  Send,
  Users,
  Globe2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

// ======================================================
// API
// ======================================================

import API_BASE from "../Config/api";

const JOBS_API = `${API_BASE}/jobs/get-all.php`;

const TRACK_JOB_VIEW_API = `${API_BASE}/jobs/track-view.php`;

const CHECK_APPLICATION_API = `${API_BASE}/applications/check.php`;

const SAVE_JOB_API = `${API_BASE}/savedJobs/save.php`;

const GET_SAVED_JOB_API = `${API_BASE}/savedJobs/get.php`;

const REMOVE_SAVED_JOB_API = `${API_BASE}/savedJobs/remove.php`;

const recordJobView = (jobId) => {
  const storageKey = `job-view:${jobId}`;
  let viewKey;

  try {
    viewKey = sessionStorage.getItem(storageKey);
    if (!viewKey) {
      viewKey =
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(storageKey, viewKey);
    }
  } catch {
    viewKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  fetch(TRACK_JOB_VIEW_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: Number(jobId), view_key: viewKey }),
  }).catch((error) => {
    console.error("Record job view error:", error);
  });
};

// ======================================================
// ASSET URL
// ======================================================

const getAssetUrl = (value) => {
  if (!value) return "";

  const asset = String(value).trim();

  if (!asset) return "";

  if (/^https?:\/\//i.test(asset)) {
    return asset;
  }

  return `${API_ROOT}/${asset.replace(/^\/+/, "")}`;
};

// ======================================================
// OPENINGS
// ======================================================

const getOpenings = (job) => {
  const value = Number(job?.vacancies);

  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return value;
};

// ======================================================
// FORMAT DATE
// ======================================================

const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ======================================================
// DAYS AGO
// ======================================================

const getDaysAgo = (date) => {
  if (!date) return 0;

  const createdDate = new Date(date);
  const today = new Date();

  if (Number.isNaN(createdDate.getTime())) {
    return 0;
  }

  const difference = today.getTime() - createdDate.getTime();

  return Math.max(Math.floor(difference / (1000 * 60 * 60 * 24)), 0);
};

// ======================================================
// POSTED TEXT
// ======================================================

const getPostedText = (date) => {
  const days = getDaysAgo(date);

  if (days === 0) {
    return "Posted today";
  }

  if (days === 1) {
    return "Posted 1 day ago";
  }

  if (days < 7) {
    return `Posted ${days} days ago`;
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);

    return weeks === 1 ? "Posted 1 week ago" : `Posted ${weeks} weeks ago`;
  }

  const months = Math.floor(days / 30);

  return months === 1 ? "Posted 1 month ago" : `Posted ${months} months ago`;
};

// ======================================================
// TEXT TO ARRAY
// ======================================================

const textToArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(/\r?\n|•/)
    .map((item) => item.replace(/^\s*[-*0-9.)]+\s*/, "").trim())
    .filter(Boolean);
};

// ======================================================
// CURRENT USER
// ======================================================

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    return null;
  }
};

// ======================================================
// CANDIDATE ID
// ======================================================

const getCandidateId = () => {
  const user = getCurrentUser();

  if (!user || user.role !== "candidate") {
    return null;
  }

  return (
    user.id ||
    user.userId ||
    user.user_id ||
    localStorage.getItem("userId") ||
    localStorage.getItem("user_id")
  );
};

// ======================================================
// JOB DETAILS
// ======================================================

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ====================================================
  // STATES
  // ====================================================

  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [checkingApplication, setCheckingApplication] = useState(false);

  const [applied, setApplied] = useState(false);

  // ====================================================
  // FETCH JOBS
  // ====================================================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(JOBS_API);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch jobs");
        }

        const jobs = Array.isArray(data.jobs) ? data.jobs : [];

        setAllJobs(jobs);

        const foundJob = jobs.find((item) => Number(item.id) === Number(id));

        if (!foundJob) {
          throw new Error("Job not found");
        }

        setJob(foundJob);
        recordJobView(foundJob.id);
      } catch (err) {
        console.error("Job Details Error:", err);

        setError(err.message || "Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [id]);

  // ====================================================
  // CHECK APPLICATION
  // ====================================================

  useEffect(() => {
    const checkApplication = async () => {
      const user = getCurrentUser();
      const candidateId = getCandidateId();

      if (!user || user.role !== "candidate" || !id || !candidateId) {
        setApplied(false);
        return;
      }

      try {
        setCheckingApplication(true);

        const response = await fetch(
          `${CHECK_APPLICATION_API}?jobId=${Number(
            id,
          )}&candidateId=${Number(candidateId)}`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error("Check Application Error:", data.message);
          return;
        }

        setApplied(data.applied === true);
      } catch (error) {
        console.error("Check Application Error:", error);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplication();
  }, [id]);

  // ====================================================
  // CHECK SAVED JOB
  // ====================================================

  useEffect(() => {
    const checkSavedJob = async () => {
      const user = getCurrentUser();

      if (!user || user.role !== "candidate") {
        setSaved(false);
        return;
      }

      const candidateId = getCandidateId();

      if (!candidateId || !id) {
        setSaved(false);
        return;
      }

      try {
        const response = await fetch(
          `${GET_SAVED_JOB_API}?candidate_id=${Number(candidateId)}`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setSaved(false);
          return;
        }

        const savedJobs = Array.isArray(data.saved_jobs) ? data.saved_jobs : [];

        const isSaved = savedJobs.some(
          (item) => Number(item.job_id) === Number(id),
        );

        setSaved(isSaved);
      } catch (error) {
        console.error("Check Saved Job Error:", error);

        setSaved(false);
      }
    };

    checkSavedJob();
  }, [id]);

  // ====================================================
  // SKILLS
  // ====================================================

  const skills = useMemo(() => {
    if (!job) return [];

    if (Array.isArray(job.skills)) {
      return job.skills.filter(Boolean);
    }

    return textToArray(job.skills);
  }, [job]);

  // ====================================================
  // RESPONSIBILITIES
  // ====================================================

  const responsibilities = useMemo(() => {
    return textToArray(job?.responsibilities);
  }, [job]);

  // ====================================================
  // REQUIREMENTS
  // ====================================================

  const requirements = useMemo(() => {
    return textToArray(job?.requirements);
  }, [job]);

  // ====================================================
  // RECOMMENDED JOBS
  // ====================================================

  const recommendedJobs = useMemo(() => {
    if (!job) return [];

    const others = allJobs.filter((item) => Number(item.id) !== Number(job.id));

    const currentCategory = String(job.category || "")
      .trim()
      .toLowerCase();

    const sameCategory = others.filter(
      (item) =>
        String(item.category || "")
          .trim()
          .toLowerCase() === currentCategory,
    );

    const otherCategory = others.filter(
      (item) =>
        String(item.category || "")
          .trim()
          .toLowerCase() !== currentCategory,
    );

    return [...sameCategory, ...otherCategory].slice(0, 5);
  }, [allJobs, job]);

  // ====================================================
  // SAVE / REMOVE JOB
  // ====================================================

  const handleSave = async () => {
    const user = getCurrentUser();

    if (!user) {
      navigate("/login", {
        state: {
          redirectTo: `/jobs/${id}`,
          message: "Please login as a candidate to save this job.",
        },
      });

      return;
    }

    if (user.role !== "candidate") {
      alert("Only candidates can save jobs.");
      return;
    }

    const candidateId = getCandidateId();

    if (!candidateId) {
      alert("Candidate information is missing. Please login again.");

      return;
    }

    if (!id) return;

    try {
      setSaving(true);

      // REMOVE SAVED JOB
      if (saved) {
        const response = await fetch(REMOVE_SAVED_JOB_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate_id: Number(candidateId),
            job_id: Number(id),
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(data.message || "Unable to remove saved job.");

          return;
        }

        setSaved(false);

        return;
      }

      // SAVE JOB
      const response = await fetch(SAVE_JOB_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidate_id: Number(candidateId),
          job_id: Number(id),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to save job.");

        return;
      }

      setSaved(true);
    } catch (error) {
      console.error("Save Job Error:", error);

      alert("Unable to save job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // APPLY BUTTON
  // ====================================================

  const handleApply = () => {
    const user = getCurrentUser();

    if (applied) {
      alert("You have already applied for this job.");

      return;
    }

    if (!user) {
      navigate("/login", {
        state: {
          redirectTo: `/jobs/${id}`,
          message: "Please login to apply for this job.",
        },
      });

      return;
    }

    if (user.role !== "candidate") {
      alert("Only candidates can apply for jobs.");

      return;
    }

    const candidateId = getCandidateId();

    if (!candidateId) {
      alert("Candidate information is missing. Please login again.");

      return;
    }

    // IMPORTANT:
    // Apply page par resume + cover letter upload hoga.
    navigate(`/apply/${id}`);
  };

  // ====================================================
  // SHARE
  // ====================================================

  const handleShare = async () => {
    if (!job) return;

    const shareData = {
      title: job.job_title || "Job Opportunity",

      text: `Check out this job: ${job.job_title || ""} at ${
        job.company_name || ""
      }`,

      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);

        alert("Job link copied successfully!");
      }
    } catch (error) {
      console.log("Share cancelled");
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />

        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h2 className="text-xl font-bold text-slate-900">
              Loading job details...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we fetch the job information.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <BriefcaseBusiness size={28} className="text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Job not found</h2>

            <p className="mt-2 text-sm text-slate-500">
              {error || "The requested job could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Jobs
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ====================================================
  // JOB DATA
  // ====================================================

  const companyLogo =
    job.company_logo_url ||
    getAssetUrl(job.company_logo) ||
    getAssetUrl(job.logo);

  const openings = getOpenings(job);

  const applicants =
    job.applicants_count ?? job.applicants ?? job.total_applicants ?? null;

  const applyButtonText = applied
    ? "Applied"
    : checkingApplication
      ? "Checking..."
      : "Apply Now";

  const saveButtonText = saving ? "Saving..." : saved ? "Saved" : "Save";

  const isActive = String(job.status || "active").toLowerCase() === "active";

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* BACK */}
        <button
          type="button"
          onClick={() => navigate("/jobs")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Jobs
        </button>

        {/* TWO COLUMN */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* JOB SUMMARY */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                      {job.job_title}
                    </h1>

                    <p className="mt-2 text-base font-medium text-slate-700">
                      Position: {job.position || "Not specified"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Category: {job.category || "Not specified"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.company_name || "Company not specified"}
                    </p>
                  </div>

                  {/* LOGO */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-24 sm:w-24">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={job.company_name || "Company"}
                        className="h-full w-full object-contain p-3"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-3xl font-bold text-blue-600">
                        {(job.company_name || "C").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* META */}
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-100 pb-5 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <BriefcaseBusiness size={17} className="text-slate-400" />
                    {job.experience || "Fresher"}
                  </span>

                  <span className="flex items-center gap-2">
                    <IndianRupee size={17} className="text-slate-400" />
                    {job.salary || "Salary not specified"}
                  </span>

                  <span className="flex items-center gap-2">
                    <MapPin size={17} className="text-slate-400" />
                    {job.location || "Location not specified"}
                  </span>
                </div>

                {/* POSTED / OPENINGS */}
                <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <span className="text-slate-500">
                      Posted:{" "}
                      <strong className="font-semibold text-slate-900">
                        {getPostedText(job.created_at).replace("Posted ", "")}
                      </strong>
                    </span>

                    <span className="hidden text-slate-300 sm:block">|</span>

                    <span className="text-slate-500">
                      Openings:{" "}
                      <strong className="font-semibold text-slate-900">
                        {openings}
                      </strong>
                    </span>

                    {applicants !== null && (
                      <>
                        <span className="hidden text-slate-300 sm:block">
                          |
                        </span>

                        <span className="text-slate-500">
                          Applicants:{" "}
                          <strong className="font-semibold text-slate-900">
                            {applicants}
                          </strong>
                        </span>
                      </>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3">
                    {/* SAVE */}
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                        saved
                          ? "border-blue-200 bg-blue-50 text-blue-600"
                          : saving
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {saved ? (
                        <BookmarkCheck size={18} />
                      ) : (
                        <Bookmark size={18} />
                      )}

                      {saveButtonText}
                    </button>

                    {/* APPLY */}
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={applied || checkingApplication}
                      className={`flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition ${
                        applied
                          ? "cursor-default bg-green-600"
                          : checkingApplication
                            ? "cursor-not-allowed bg-blue-400"
                            : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {applied ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Send size={18} />
                      )}

                      {applyButtonText}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* JOB HIGHLIGHTS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-slate-900">
                Job Highlights
              </h2>

              <div className="mt-5 rounded-xl bg-slate-50 p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <HighlightItem
                    icon={<Users />}
                    label="Openings"
                    value={`${openings} ${
                      openings === 1 ? "Opening" : "Openings"
                    }`}
                  />

                  <HighlightItem
                    icon={<BriefcaseBusiness />}
                    label="Job Type"
                    value={job.job_type || "Not specified"}
                  />

                  
<HighlightItem
  icon={<BriefcaseBusiness />}
  label="Position"
  value={job.position || "Not specified"}
/>

                  <HighlightItem
                    icon={<Clock3 />}
                    label="Experience"
                    value={job.experience || "Not specified"}
                  />

                  <HighlightItem
                    icon={<Globe2 />}
                    label="Workplace"
                    value={job.workplace_type || "Not specified"}
                  />

                  <HighlightItem
                    icon={<GraduationCap />}
                    label="Education"
                    value={job.education || "Not specified"}
                  />

                  <HighlightItem
                    icon={<Building2 />}
                    label="Category"
                    value={job.category || "Not specified"}
                  />
                </div>
              </div>
            </section>

            {/* DESCRIPTION */}
            <ContentSection title="Job Description" text={job.description} />

            {/* RESPONSIBILITIES */}
            {responsibilities.length > 0 && (
              <BulletSection
                title="Key Responsibilities"
                items={responsibilities}
              />
            )}

            {/* REQUIREMENTS */}
            {requirements.length > 0 && (
              <BulletSection title="Requirements" items={requirements} />
            )}

            {/* SKILLS */}
            {skills.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <h2 className="text-xl font-bold text-slate-900">
                  Required Skills
                </h2>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* COMPANY */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-slate-900">
                About the Company
              </h2>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt={job.company_name || "Company"}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {(job.company_name || "C").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {job.company_name || "Company not specified"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {job.location || "Location not specified"}
                  </p>
                </div>
              </div>
            </section>

            {/* APPLY CTA */}
            <section className="rounded-2xl bg-blue-600 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Interested in this position?
                  </h2>

                  <p className="mt-1 text-sm text-blue-100">
                    Apply with your resume and cover letter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applied || checkingApplication}
                  className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition ${
                    applied
                      ? "cursor-default bg-green-100 text-green-700"
                      : checkingApplication
                        ? "cursor-not-allowed bg-blue-100 text-blue-400"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {applied ? <CheckCircle2 size={19} /> : <Send size={19} />}

                  {applyButtonText}
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* RECOMMENDED JOBS */}
            {recommendedJobs.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Jobs you might be interested in
                </h2>

                <div className="mt-3 divide-y divide-slate-100">
                  {recommendedJobs.map((recommendedJob) => {
                    const recommendedLogo =
                      recommendedJob.company_logo_url ||
                      getAssetUrl(recommendedJob.company_logo) ||
                      getAssetUrl(recommendedJob.logo);

                    const recommendedOpenings = getOpenings(recommendedJob);

                    return (
                      <button
                        key={recommendedJob.id}
                        type="button"
                        onClick={() => navigate(`/jobs/${recommendedJob.id}`)}
                        className="group flex w-full gap-4 py-5 text-left"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {recommendedLogo ? (
                            <img
                              src={recommendedLogo}
                              alt={recommendedJob.company_name || "Company"}
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-xl font-bold text-blue-600">
                              {(recommendedJob.company_name || "C")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 transition group-hover:text-blue-600">
                              {recommendedJob.job_title}
                            </h3>

                            <ChevronRight
                              size={17}
                              className="mt-0.5 shrink-0 text-slate-400 transition group-hover:text-blue-600"
                            />
                          </div>

                          <p className="mt-1 truncate text-sm text-slate-600">
                            {recommendedJob.company_name || "Company"}
                          </p>

                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={13} />

                            <span className="truncate">
                              {recommendedJob.location || "India"}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users size={13} />
                              {recommendedOpenings}{" "}
                              {recommendedOpenings === 1
                                ? "Opening"
                                : "Openings"}
                            </span>

                            <span>
                              {getPostedText(recommendedJob.created_at)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* JOB INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Job Information
              </h2>

              <div className="mt-5 space-y-5">
                <InfoItem
                  icon={<CheckCircle2 />}
                  label="Job Status"
                  value={isActive ? "Active" : job.status || "Inactive"}
                />

                <InfoItem
                  icon={<Users />}
                  label="Openings"
                  value={`${openings} ${
                    openings === 1 ? "Opening" : "Openings"
                  }`}
                />

                <InfoItem
                  icon={<CalendarDays />}
                  label="Posted"
                  value={formatDate(job.created_at)}
                />

                <InfoItem
                  icon={<CalendarDays />}
                  label="Deadline"
                  value={formatDate(job.deadline)}
                />

                <InfoItem
                  icon={<BriefcaseBusiness />}
                  label="Experience"
                  value={job.experience || "Not specified"}
                />

                <InfoItem
                  icon={<MapPin />}
                  label="Location"
                  value={job.location || "Not specified"}
                />
              </div>
            </section>

            {/* SHARE / SAVE */}
            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="font-bold text-slate-900">
                Interested in this job?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Save this job or share it with someone who may be interested.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}

                  {saveButtonText}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Share2 size={17} />
                  Share
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ======================================================
// HIGHLIGHT ITEM
// ======================================================

const HighlightItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {React.cloneElement(icon, {
          size: 19,
        })}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
};

// ======================================================
// CONTENT SECTION
// ======================================================

const ContentSection = ({ title, text }) => {
  if (!text) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>

      <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
        {text}
      </div>
    </section>
  );
};

// ======================================================
// BULLET SECTION
// ======================================================

const BulletSection = ({ title, items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>

      <ul className="mt-5 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex items-start gap-3 text-sm leading-6 text-slate-600"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

// ======================================================
// INFO ITEM
// ======================================================

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-blue-600">
        {React.cloneElement(icon, {
          size: 19,
        })}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
};

export default JobDetails;
