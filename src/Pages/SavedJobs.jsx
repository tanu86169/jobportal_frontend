import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  Trash2,
  ArrowRight,
  SlidersHorizontal,
  IndianRupee,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react";

// ======================================================
// API URLS
// ======================================================
import API_BASE from "../Config/api";

const SAVED_JOBS_API = `${API_BASE}/savedJobs/get.php`;

const REMOVE_SAVED_JOB_API = `${API_BASE}/savedJobs/remove.php`;

const MY_APPLICATIONS_API = `${API_BASE}/applications/my-applications.php`;

// ======================================================
// SKELETON PRIMITIVE
// ======================================================

const Skeleton = ({ className = "", style }) => (
  <div
    style={style}
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

// ======================================================
// SAVED JOBS SKELETON
// ======================================================

const SavedJobsSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          {/* ===== HEADER SKELETON ===== */}
          <section className="relative mb-8 overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 px-6 py-7 shadow-lg shadow-blue-600/15 sm:px-8 sm:py-8">
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-7 w-40 rounded-full !bg-white/20" />
                <Skeleton className="h-9 w-56 !bg-white/25 sm:h-10 sm:w-64" />
                <Skeleton className="h-4 w-full max-w-xl !bg-white/15" />
                <Skeleton className="h-4 w-3/4 max-w-md !bg-white/15" />
              </div>
              <div className="hidden shrink-0 sm:flex">
                <Skeleton className="h-20 w-20 rounded-3xl !bg-white/20" />
              </div>
            </div>
          </section>

          {/* ===== SEARCH + COUNT SKELETON ===== */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-12 w-full rounded-xl sm:max-w-md" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </div>

          {/* ===== JOB CARDS SKELETON ===== */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  {/* LEFT SIDE - JOB INFO */}
                  <div className="flex min-w-0 flex-1 gap-4">
                    <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />

                    <div className="min-w-0 flex-1 space-y-3">
                      {/* Title */}
                      <Skeleton className="h-5 w-3/4 sm:h-6 sm:w-2/3" />

                      {/* Company */}
                      <Skeleton className="h-4 w-40" />

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Skeleton className="h-6 w-16 rounded-md" />
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-6 w-14 rounded-md" />
                        <Skeleton className="h-6 w-18 rounded-md" />
                      </div>

                      {/* Saved time */}
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>

                  {/* RIGHT SIDE - ACTIONS */}
                  <div className="flex gap-3 lg:min-w-[230px] lg:flex-col xl:flex-row">
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

// ======================================================
// COMPONENT
// ======================================================

const SavedJobs = () => {
  const [search, setSearch] = useState("");

  const [savedJobs, setSavedJobs] = useState([]);

  // Stores job IDs for which current candidate has already applied
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [error, setError] = useState("");

  // ======================================================
  // GET CURRENT USER
  // ======================================================

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Get Current User Error:", error);
      return null;
    }
  };

  // ======================================================
  // GET CANDIDATE ID
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
  // FORMAT SAVED DATE
  // ======================================================

  const formatSavedDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(String(date).replace(" ", "T"));

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    const now = new Date();
    const difference = now - parsedDate;

    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );
    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return "just now";
    }

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    if (days < 30) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return parsedDate.toLocaleDateString("en-IN");
  };

  // ======================================================
  // FETCH SAVED JOBS
  // ======================================================

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const user = getCurrentUser();

      if (!user) {
        setSavedJobs([]);
        setError(
          "Please login as a candidate to view saved jobs."
        );
        return;
      }

      if (user.role !== "candidate") {
        setSavedJobs([]);
        setError("Only candidates can view saved jobs.");
        return;
      }

      const candidateId = getCandidateId();

      if (!candidateId) {
        setSavedJobs([]);
        setError(
          "Candidate ID not found. Please login again."
        );
        return;
      }

      console.log("Candidate ID:", candidateId);

      const response = await fetch(
        `${SAVED_JOBS_API}?candidate_id=${Number(
          candidateId
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Saved Jobs API Response:",
        data
      );

      if (!data.success) {
        setSavedJobs([]);
        setError(
          data.message ||
            "Unable to fetch saved jobs."
        );
        return;
      }

      const jobs = Array.isArray(data.saved_jobs)
        ? data.saved_jobs.map((job) => ({
            id: Number(job.job_id),

            savedJobId: Number(
              job.saved_job_id
            ),

            title:
              job.job_title ||
              "Untitled Job",

            company:
              job.company_name ||
              "Company",

            location:
              job.location ||
              "Location not specified",

            salary:
              job.salary ||
              "Salary not specified",

            jobType:
              job.job_type ||
              "Not specified",

            experience:
              job.experience ||
              "Not specified",

            workMode:
              job.work_mode ||
              job.workplace_type ||
              job.mode ||
              "",

            skills: Array.isArray(job.skills)
              ? job.skills
              : typeof job.skills ===
                  "string" &&
                job.skills
              ? job.skills
                  .split(",")
                  .map((skill) =>
                    skill.trim()
                  )
                  .filter(Boolean)
              : [],

            savedAt: formatSavedDate(
              job.saved_at
            ),

            description:
              job.description || "",

            deadline:
              job.deadline || "",

            status:
              job.status || "",
          }))
        : [];

      setSavedJobs(jobs);
    } catch (error) {
      console.error(
        "Fetch Saved Jobs Error:",
        error
      );

      setSavedJobs([]);
      setError(
        "Unable to load saved jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH CURRENT CANDIDATE APPLICATIONS
  // ======================================================

  const fetchMyApplications = async () => {
    try {
      setLoadingApplications(true);

      const user = getCurrentUser();

      if (
        !user ||
        user.role !== "candidate"
      ) {
        setAppliedJobIds(new Set());
        return;
      }

      const candidateId =
        getCandidateId();

      if (!candidateId) {
        setAppliedJobIds(new Set());
        return;
      }

      console.log(
        "Fetching applications for candidate:",
        candidateId
      );

      const response = await fetch(
        `${MY_APPLICATIONS_API}?candidateId=${Number(
          candidateId
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Applications HTTP Error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "My Applications Response:",
        data
      );

      if (
        !data.success ||
        !Array.isArray(data.applications)
      ) {
        setAppliedJobIds(new Set());
        return;
      }

      // ==================================================
      // GET ALL APPLIED JOB IDS
      // ==================================================

      const ids = new Set();

      data.applications.forEach(
        (application) => {
          const jobId = Number(
            application.job_id
          );

          if (jobId) {
            ids.add(jobId);
          }
        }
      );

      console.log(
        "Applied Job IDs:",
        Array.from(ids)
      );

      setAppliedJobIds(ids);
    } catch (error) {
      console.error(
        "Fetch My Applications Error:",
        error
      );

      // Don't break Saved Jobs page
      // if application API fails.
      setAppliedJobIds(new Set());
    } finally {
      setLoadingApplications(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchSavedJobs();
    fetchMyApplications();
  }, []);

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredJobs = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    if (!searchText) {
      return savedJobs;
    }

    return savedJobs.filter((job) => {
      return (
        job.title
          .toLowerCase()
          .includes(searchText) ||
        job.company
          .toLowerCase()
          .includes(searchText) ||
        job.location
          .toLowerCase()
          .includes(searchText) ||
        job.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(searchText)
        )
      );
    });
  }, [savedJobs, search]);

  // ======================================================
  // CHECK IF CANDIDATE ALREADY APPLIED
  // ======================================================

  const hasApplied = (jobId) => {
    return appliedJobIds.has(
      Number(jobId)
    );
  };

  // ======================================================
  // REMOVE SAVED JOB
  // ======================================================

  const removeJob = async (job) => {
    try {
      const user = getCurrentUser();

      if (!user) {
        alert(
          "Please login as a candidate."
        );
        return;
      }

      if (user.role !== "candidate") {
        alert(
          "Only candidates can remove saved jobs."
        );
        return;
      }

      const candidateId =
        getCandidateId();

      if (!candidateId) {
        alert(
          "Candidate information not found. Please login again."
        );
        return;
      }

      const response = await fetch(
        REMOVE_SAVED_JOB_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            candidate_id:
              Number(candidateId),

            job_id: Number(job.id),
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Remove Saved Job Response:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
            "Unable to remove saved job."
        );
        return;
      }

      setSavedJobs((prev) =>
        prev.filter(
          (item) =>
            item.id !== job.id
        )
      );
    } catch (error) {
      console.error(
        "Remove Saved Job Error:",
        error
      );

      alert(
        "Unable to remove saved job."
      );
    }
  };

  // ======================================================
  // GO TO JOB DETAILS
  // ======================================================

  const openJob = (jobId) => {
    window.location.href =
      `/jobs/${jobId}`;
  };

  // ======================================================
  // APPLY TO JOB
  // ======================================================

  const applyToJob = (jobId) => {
    if (hasApplied(jobId)) {
      return;
    }

    window.location.href =
      `/jobs/${jobId}/apply`;
  };

  // ======================================================
  // LOADING (SKELETON)
  // ======================================================

  if (loading) {
    return <SavedJobsSkeleton />;
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="relative mb-8 overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg shadow-blue-600/15 sm:px-8 sm:py-8">

            {/* Soft background circles */}

            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-20 right-1/4 h-44 w-44 rounded-full bg-cyan-300/15 blur-2xl" />

            <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full border border-white/10 bg-white/5" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              {/* LEFT CONTENT */}

              <div className="min-w-0">

                {/* Badge */}

                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
                  <BookmarkCheck className="h-3.5 w-3.5" />

                  Saved Collection
                </div>

                {/* Heading */}

                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Saved Jobs
                </h1>

                {/* Description */}

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                  Keep track of the jobs you're interested in and apply whenever you're ready.
                </p>
              </div>

              {/* RIGHT ICON */}

              <div className="hidden shrink-0 sm:flex">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-md">
                  <BookmarkCheck className="h-10 w-10 text-white" />
                </div>
              </div>

            </div>
          </section>

          {/* =================================================
              SEARCH + COUNT
          ================================================= */}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* SEARCH */}

              <div className="relative w-full sm:max-w-md">

                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* COUNT */}

              <div className="flex w-fit items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm text-blue-700">

                <SlidersHorizontal className="h-4 w-4" />

                <span>
                  <strong className="font-bold">
                    {filteredJobs.length}
                  </strong>{" "}
                  saved jobs
                </span>
              </div>

            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

              <p className="font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchSavedJobs}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>

            </div>
          )}

          {/* =================================================
              JOB LIST
          ================================================= */}

          {!error &&
            filteredJobs.length > 0 && (
              <div className="space-y-4">

                {filteredJobs.map(
                  (job) => {
                    const applied =
                      hasApplied(
                        job.id
                      );

                    return (
                      <div
                        key={
                          job.savedJobId
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg sm:p-6"
                      >

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                          {/* =================================================
                              JOB INFORMATION
                          ================================================= */}

                          <button
                            type="button"
                            onClick={() =>
                              openJob(
                                job.id
                              )
                            }
                            className="flex min-w-0 gap-4 text-left"
                          >

                            {/* JOB ICON */}

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/30 transition group-hover:scale-105">

                              <BriefcaseBusiness className="h-7 w-7 text-white" />

                            </div>

                            {/* JOB DETAILS */}

                            <div className="min-w-0">

                              <h2 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600 sm:text-xl">
                                {job.title}
                              </h2>

                              <p className="mt-1 font-medium text-blue-600">
                                {job.company}
                              </p>

                              {/* JOB META */}

                              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  {job.location}
                                </span>

                                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                  <IndianRupee className="h-3.5 w-3.5" />
                                  {job.salary}
                                </span>

                                <span className="flex items-center gap-1.5">
                                  <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                                  {job.jobType}
                                </span>

                                <span>
                                  {job.experience}
                                </span>

                                {job.workMode && (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                    {job.workMode}
                                  </span>
                                )}

                              </div>

                              {/* SKILLS */}

                              {job.skills.length >
                                0 && (
                                <div className="mt-4 flex flex-wrap gap-2">

                                  {job.skills.map(
                                    (
                                      skill,
                                      index
                                    ) => (
                                      <span
                                        key={`${skill}-${index}`}
                                        className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100"
                                      >
                                        {
                                          skill
                                        }
                                      </span>
                                    )
                                  )}

                                </div>
                              )}

                              {/* SAVED TIME */}

                              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">

                                <Clock3 className="h-3.5 w-3.5" />

                                Saved{" "}
                                {
                                  job.savedAt
                                }

                              </div>

                            </div>
                          </button>

                          {/* =================================================
                              ACTIONS
                          ================================================= */}

                          <div className="flex gap-3 lg:min-w-[230px] lg:flex-col xl:flex-row">

                            {/* =================================================
                                APPLY / APPLIED BUTTON
                            ================================================= */}

                            {applied ? (
                              <button
                                type="button"
                                disabled
                                className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 font-semibold text-emerald-700"
                              >
                                <CheckCircle2 className="h-5 w-5" />

                                Applied
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  applyToJob(
                                    job.id
                                  )
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                              >
                                Apply Now

                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}

                            {/* =================================================
                                REMOVE
                            ================================================= */}

                            <button
                              type="button"
                              onClick={() =>
                                removeJob(
                                  job
                                )
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />

                              Remove
                            </button>

                          </div>

                        </div>
                      </div>
                    );
                  }
                )}

              </div>
            )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!error &&
            filteredJobs.length ===
              0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <BookmarkCheck className="h-8 w-8 text-blue-500" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No saved jobs found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "Try searching with a different keyword."
                    : "Jobs you save will appear here. Start exploring jobs and save the ones you're interested in."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/jobs";
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                  >
                    Find Jobs

                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

              </div>
            )}

        </div>
      </main>
    </div>
  );
};

export default SavedJobs;