import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  GraduationCap,
  IndianRupee,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";

// ============================================================
// API
// ============================================================

import API_BASE from "../Config/api";

const MY_APPLICATIONS_API =
  `${API_BASE}/applications/my-applications.php`;

// ============================================================
// SKELETON PRIMITIVE
// ============================================================

const Skeleton = ({ className = "", style }) => (
  <div
    style={style}
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

// ============================================================
// APPLIED JOBS SKELETON
// ============================================================

const AppliedJobsSkeleton = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">

      {/* ===== HERO SKELETON ===== */}
      <section className="mx-4 mt-4 overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 shadow-lg shadow-blue-600/10 sm:mx-6 lg:mx-8">
        <div className="relative px-5 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-7 w-40 rounded-full !bg-white/20" />
              <Skeleton className="h-8 w-56 !bg-white/25 sm:h-9 sm:w-64" />
              <Skeleton className="h-4 w-full max-w-xl !bg-white/15" />
              <Skeleton className="h-4 w-3/4 max-w-md !bg-white/15" />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Skeleton className="h-7 w-32 rounded-full !bg-white/15" />
                <Skeleton className="h-7 w-24 rounded-full !bg-white/15" />
                <Skeleton className="h-7 w-28 rounded-full !bg-white/15" />
              </div>
            </div>

            <div className="shrink-0">
              <Skeleton className="h-11 w-full rounded-xl !bg-white/20 sm:w-32" />
            </div>

          </div>
        </div>
      </section>

      {/* ===== CONTENT SKELETON ===== */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* STATISTICS */}
        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:rounded-2xl sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
                  <Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
                  <Skeleton className="hidden h-3 w-24 sm:block" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg sm:h-11 sm:w-11 sm:rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-5">
          <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center lg:gap-4">
            <Skeleton className="h-11 w-full rounded-xl lg:flex-1" />
            <Skeleton className="h-11 w-full rounded-xl lg:w-52" />
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* APPLICATION CARDS */}
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm sm:rounded-2xl"
            >
              {/* Status strip */}
              <Skeleton className="h-1 w-full rounded-none" />

              <div className="p-4 sm:p-5 lg:p-6">

                {/* Top row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

                  <div className="flex min-w-0 gap-3 sm:gap-3.5">
                    {/* Logo */}
                    <Skeleton className="h-11 w-11 shrink-0 rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl" />

                    {/* Title + Company */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 sm:h-6 sm:w-2/3" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>

                  {/* Status badge */}
                  <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
                </div>

                {/* Meta row */}
                <div className="mt-3.5 flex flex-wrap gap-x-3 gap-y-1.5 sm:mt-4 sm:gap-x-4 sm:gap-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>

                {/* Skills */}
                <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-3.5">
                  <Skeleton className="h-6 w-16 rounded-md sm:rounded-lg" />
                  <Skeleton className="h-6 w-20 rounded-md sm:rounded-lg" />
                  <Skeleton className="h-6 w-14 rounded-md sm:rounded-lg" />
                  <Skeleton className="h-6 w-18 rounded-md sm:rounded-lg" />
                </div>

                {/* Description */}
                <div className="mt-3 rounded-lg bg-slate-50/80 px-3 py-2.5 sm:mt-3.5 sm:rounded-xl sm:px-3.5 sm:py-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="mt-1.5 h-3 w-5/6" />
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3.5 sm:mt-5 sm:flex-row sm:gap-2.5 sm:pt-4">
                  <Skeleton className="h-10 w-full rounded-xl sm:w-32" />
                  <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
                </div>

              </div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
};

// ============================================================
// CURRENT USER
// ============================================================

const getCurrentUser = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    return user || null;
  } catch (error) {
    console.error(
      "Invalid user data in localStorage:",
      error
    );

    return null;
  }
};

// ============================================================
// GET LOGGED-IN USER ID
//
// IMPORTANT:
//
// This is users.id.
//
// It is NOT candidates.id.
//
// applications.candidate_id = users.id
// ============================================================

const getUserId = () => {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  const role = String(user.role || "")
    .trim()
    .toLowerCase();

  if (
    role !== "candidate" &&
    role !== "job-seeker" &&
    role !== "job_seeker"
  ) {
    return null;
  }

  // Prefer user.id.
  // Other values are only fallback for old login responses.
  const id =
    user.id ||
    user.userId ||
    user.user_id ||
    localStorage.getItem("userId") ||
    localStorage.getItem("user_id");

  const userId = Number(id);

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return null;
  }

  return userId;
};

// ============================================================
// ASSET URL
// ============================================================

const getAssetUrl = (value) => {
  if (!value) {
    return "";
  }

  let asset = String(value).trim();

  if (!asset) {
    return "";
  }

  // Absolute HTTP/HTTPS URL
  if (/^https?:\/\//i.test(asset)) {
    return asset;
  }

  // Data URL
  if (asset.startsWith("data:")) {
    return asset;
  }

  // Normalize Windows slashes
  asset = asset.replace(/\\/g, "/");

  // Remove starting slash
  asset = asset.replace(/^\/+/, "");

  // If stored path already contains backend path
  const apiMarker =
    "/job_portal/job-portal-api/";

  const markerIndex =
    asset.indexOf(apiMarker);

  if (markerIndex !== -1) {
    asset = asset.substring(
      markerIndex + apiMarker.length
    );
  }

  // If path already contains localhost backend
  if (
    asset.startsWith("localhost/") ||
    asset.startsWith("127.0.0.1/")
  ) {
    return `http://${asset}`;
  }

  return `${API_ROOT}/${asset}`;
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value) => {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(
    String(value).replace(" ", "T")
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ============================================================
// NORMALIZE ARRAY
//
// Supports:
//
// [] 
// JSON string
// object
// comma-separated string
// ============================================================

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    // Try JSON
    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return [parsed];
      }
    } catch {
      // Not JSON
    }

    // Comma-separated
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  if (typeof value === "object") {
    return [value];
  }

  return [];
};

// ============================================================
// GET SKILL NAME
// ============================================================

const getSkillName = (skill) => {
  if (
    skill === null ||
    skill === undefined
  ) {
    return "";
  }

  if (typeof skill === "object") {
    return String(
      skill.name ||
        skill.skill ||
        skill.title ||
        ""
    ).trim();
  }

  return String(skill).trim();
};

// ============================================================
// STATUS CONFIG
// ============================================================

const getStatusConfig = (status) => {
  const normalized = String(
    status || "Applied"
  )
    .trim()
    .toLowerCase();

  // Hired / Selected
  if (
    normalized === "hired" ||
    normalized === "selected"
  ) {
    return {
      label:
        normalized === "hired"
          ? "Hired"
          : "Selected",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      strip: "bg-emerald-500",
      dot: "bg-emerald-500",
    };
  }

  // Rejected
  if (
    normalized === "rejected" ||
    normalized === "declined"
  ) {
    return {
      label:
        normalized === "declined"
          ? "Declined"
          : "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
      strip: "bg-red-500",
      dot: "bg-red-500",
    };
  }

  // Interview
  if (
    normalized === "interview" ||
    normalized === "interview scheduled" ||
    normalized === "interviewed"
  ) {
    return {
      label:
        status || "Interview",
      className:
        "bg-violet-50 text-violet-700 border-violet-200",
      icon: CalendarDays,
      strip: "bg-violet-500",
      dot: "bg-violet-500",
    };
  }

  // Screening / Shortlisted
  if (
    normalized === "screening" ||
    normalized === "shortlisted"
  ) {
    return {
      label:
        status || "Screening",
      className:
        "bg-sky-50 text-sky-700 border-sky-200",
      icon: Clock3,
      strip: "bg-sky-500",
      dot: "bg-sky-500",
    };
  }

  // Viewed / Under Review
  if (
    normalized === "viewed" ||
    normalized === "under review" ||
    normalized ===
      "awaiting recruiter response"
  ) {
    return {
      label:
        status || "Under Review",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
      strip: "bg-amber-500",
      dot: "bg-amber-500",
    };
  }

  // Default Applied
  return {
    label:
      status || "Applied",
    className:
      "bg-cyan-50 text-cyan-700 border-cyan-200",
    icon: Clock3,
    strip: "bg-cyan-500",
    dot: "bg-cyan-500",
  };
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const AppliedJob = () => {
  const navigate = useNavigate();

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  // ==========================================================
  // USER ID
  // ==========================================================

  const userId = getUserId();

  // ==========================================================
  // FETCH APPLICATIONS
  // ==========================================================

  const fetchApplications = useCallback(
    async (showRefreshLoader = false) => {
      const currentUser =
        getCurrentUser();

      const currentUserId =
        getUserId();

      // ------------------------------------------------------
      // LOGIN VALIDATION
      // ------------------------------------------------------

      if (
        !currentUser ||
        !currentUserId
      ) {
        setLoading(false);
        setRefreshing(false);
        setApplications([]);

        setError(
          "Candidate login information not found. Please login again."
        );

        return;
      }

      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        console.log(
          "Fetching applications for users.id:",
          currentUserId
        );

        // ----------------------------------------------------
        // API REQUEST
        //
        // IMPORTANT:
        // Send USERS.ID as userId.
        // ----------------------------------------------------

        const response =
          await axios.get(
            MY_APPLICATIONS_API,
            {
              params: {
                userId: currentUserId,
              },
            }
          );

        console.log(
          "My applications API response:",
          response.data
        );

        // ----------------------------------------------------
        // API SUCCESS CHECK
        // ----------------------------------------------------

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to fetch applications."
          );
        }

        // ----------------------------------------------------
        // GET APPLICATION ARRAY
        // ----------------------------------------------------

        let data = [];

        if (
          Array.isArray(
            response.data.applications
          )
        ) {
          data =
            response.data.applications;
        } else if (
          Array.isArray(
            response.data.data
          )
        ) {
          data = response.data.data;
        }

        // ----------------------------------------------------
        // SAFETY FILTER
        //
        // If API returns candidate_id, it should match
        // logged-in USERS.ID.
        // ----------------------------------------------------

        const safeApplications =
          data.filter((application) => {
            const candidateId =
              Number(
                application.candidate_id ??
                  application.candidate_user_id ??
                  0
              );

            // If backend doesn't return candidate_id,
            // don't remove the record.
            if (candidateId <= 0) {
              return true;
            }

            return (
              candidateId ===
              currentUserId
            );
          });

        setApplications(
          safeApplications
        );
      } catch (err) {
        console.error(
          "Fetch candidate applications error:",
          err
        );

        setApplications([]);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your applications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const currentUser =
      getCurrentUser();

    if (
      !currentUser ||
      !getUserId()
    ) {
      setLoading(false);

      navigate(
        "/login",
        {
          state: {
            redirectTo:
              "/candidate/applied-jobs",
            message:
              "Please login as a candidate to view your applications.",
          },
        }
      );

      return;
    }

    fetchApplications();
  }, [
    navigate,
    fetchApplications,
  ]);

  // ==========================================================
  // FILTER APPLICATIONS
  // ==========================================================

  const filteredApplications =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      return applications.filter(
        (application) => {
          const title =
            application.job_title ||
            application.title ||
            "";

          const company =
            application.company_name ||
            application.company ||
            "";

          const location =
            application.location ||
            "";

          const skillsArray =
            normalizeArray(
              application.skills
            );

          const skills =
            skillsArray
              .map(getSkillName)
              .filter(Boolean)
              .join(" ");

          const status =
            application.status ||
            "Applied";

          const searchableText =
            `${title} ${company} ${location} ${skills}`
              .toLowerCase();

          const matchesSearch =
            !searchText ||
            searchableText.includes(
              searchText
            );

          const normalizedStatus =
            String(status)
              .trim()
              .toLowerCase();

          let matchesStatus =
            true;

          if (
            statusFilter !== "All"
          ) {
            const selectedStatus =
              statusFilter
                .trim()
                .toLowerCase();

            if (
              selectedStatus ===
              "interview"
            ) {
              matchesStatus =
                normalizedStatus.includes(
                  "interview"
                );
            } else if (
              selectedStatus ===
              "selected"
            ) {
              matchesStatus =
                normalizedStatus ===
                  "selected" ||
                normalizedStatus ===
                  "hired";
            } else {
              matchesStatus =
                normalizedStatus ===
                selectedStatus;
            }
          }

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      applications,
      search,
      statusFilter,
    ]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalApplications =
    applications.length;

  const activeApplications =
    applications.filter(
      (item) => {
        const status =
          String(
            item.status ||
              "Applied"
          )
            .trim()
            .toLowerCase();

        return ![
          "rejected",
          "declined",
          "hired",
          "selected",
        ].includes(status);
      }
    ).length;

  const interviewApplications =
    applications.filter(
      (item) => {
        const status =
          String(
            item.status || ""
          )
            .trim()
            .toLowerCase();

        return (
          status.includes(
            "interview"
          ) ||
          status ===
            "shortlisted"
        );
      }
    ).length;

  const selectedApplications =
    applications.filter(
      (item) => {
        const status =
          String(
            item.status || ""
          )
            .trim()
            .toLowerCase();

        return (
          status === "hired" ||
          status === "selected"
        );
      }
    ).length;

  // ==========================================================
  // LOADING (SKELETON)
  // ==========================================================

  if (loading) {
    return <AppliedJobsSkeleton />;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">

      {/* ====================================================
          HERO
      ==================================================== */}

      <section className="mx-4 mt-4 overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 shadow-lg shadow-blue-600/10 sm:mx-6 lg:mx-8">
        <div className="relative">

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="pointer-events-none absolute right-24 top-10 h-24 w-24 rounded-full border border-white/10 bg-white/5" />

          <div className="pointer-events-none absolute bottom-6 left-10 h-12 w-12 rounded-full bg-white/5" />

          <div className="relative px-5 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                  <Sparkles size={13} />
                  Candidate Dashboard
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  My Applications
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50 sm:text-[15px]">
                  Track your application
                  status, interviews and
                  outcomes from one place.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-blue-50 sm:text-sm">

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                    <FileText size={13} />
                    {totalApplications} Applications
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                    <Clock3 size={13} />
                    {activeApplications} Active
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                    <CheckCircle2 size={13} />
                    {selectedApplications} Selected
                  </span>

                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    fetchApplications(
                      true
                    )
                  }
                  disabled={
                    refreshing
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {refreshing
                    ? "Refreshing…"
                    : "Refresh"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:mb-8 sm:gap-4 lg:grid-cols-4">

          {/* Total */}

          <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-5">

            <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-blue-50 opacity-70 transition group-hover:opacity-100 sm:h-20 sm:w-20 sm:translate-x-6 sm:-translate-y-6" />

            <div className="relative flex items-start justify-between gap-2">

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-sm sm:normal-case sm:tracking-normal">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900 sm:text-3xl">
                  {totalApplications}
                </p>

                <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                  All applications
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 sm:h-11 sm:w-11 sm:rounded-xl">
                <FileText className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
              </div>

            </div>
          </div>

          {/* Active */}

          <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-5">

            <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-cyan-50 opacity-70 transition group-hover:opacity-100 sm:h-20 sm:w-20 sm:translate-x-6 sm:-translate-y-6" />

            <div className="relative flex items-start justify-between gap-2">

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-sm sm:normal-case sm:tracking-normal">
                  Active
                </p>

                <p className="mt-1 text-xl font-bold text-cyan-600 sm:text-3xl">
                  {activeApplications}
                </p>

                <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                  In progress
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 sm:h-11 sm:w-11 sm:rounded-xl">
                <Clock3 className="h-4 w-4 text-cyan-600 sm:h-5 sm:w-5" />
              </div>

            </div>
          </div>

          {/* Interviews */}

          <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-5">

            <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-violet-50 opacity-70 transition group-hover:opacity-100 sm:h-20 sm:w-20 sm:translate-x-6 sm:-translate-y-6" />

            <div className="relative flex items-start justify-between gap-2">

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-sm sm:normal-case sm:tracking-normal">
                  Interviews
                </p>

                <p className="mt-1 text-xl font-bold text-violet-600 sm:text-3xl">
                  {interviewApplications}
                </p>

                <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                  Scheduled / shortlisted
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 sm:h-11 sm:w-11 sm:rounded-xl">
                <CalendarDays className="h-4 w-4 text-violet-600 sm:h-5 sm:w-5" />
              </div>

            </div>
          </div>

          {/* Selected */}

          <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-5">

            <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-emerald-50 opacity-70 transition group-hover:opacity-100 sm:h-20 sm:w-20 sm:translate-x-6 sm:-translate-y-6" />

            <div className="relative flex items-start justify-between gap-2">

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-sm sm:normal-case sm:tracking-normal">
                  Selected
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-600 sm:text-3xl">
                  {selectedApplications}
                </p>

                <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                  Hired / selected
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 sm:h-11 sm:w-11 sm:rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
              </div>

            </div>
          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-5 overflow-hidden rounded-xl border border-red-200 bg-red-50 sm:mb-6 sm:rounded-2xl">

            <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-5">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 sm:h-10 sm:w-10 sm:rounded-xl">
                  <XCircle className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-800 sm:text-base">
                    Unable to load applications
                  </p>

                  <p className="mt-0.5 text-xs text-red-600 sm:text-sm">
                    {error}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  fetchApplications(
                    true
                  )
                }
                disabled={
                  refreshing
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                Retry
              </button>

            </div>
          </div>
        )}

        {/* ==================================================
            SEARCH + FILTER
        ================================================== */}

        <div className="mb-5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-5">

          <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center lg:gap-4">

            <div className="relative min-w-0 flex-1">

              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-3.5 sm:h-5 sm:w-5" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search job, company, location…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 sm:py-3 sm:pl-11 sm:pr-4"
              />

            </div>

            <div className="relative w-full lg:w-52">

              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:left-3.5" />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 sm:py-3 sm:pl-10 sm:pr-9"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Applied">
                  Applied
                </option>

                <option value="Screening">
                  Screening
                </option>

                <option value="Interview">
                  Interview
                </option>

                <option value="Shortlisted">
                  Shortlisted
                </option>

                <option value="Selected">
                  Selected
                </option>

                <option value="Hired">
                  Hired
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>

              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">

            <p className="text-xs text-slate-500 sm:text-sm">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredApplications.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {applications.length}
              </span>
            </p>

            {(search ||
              statusFilter !==
                "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "All"
                  );
                }}
                className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 sm:text-sm"
              >
                Clear filters
              </button>
            )}

          </div>
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center shadow-sm sm:rounded-3xl sm:px-6 sm:py-16">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-blue-100 sm:h-16 sm:w-16">
              <BriefcaseBusiness
                size={26}
                className="text-blue-600 sm:h-7 sm:w-7"
              />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 sm:mt-5 sm:text-xl">
              No applications found
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              {applications.length ===
              0
                ? "You haven’t applied to any jobs yet. Browse openings and start applying."
                : "No application matches your search or filter. Try adjusting them."}
            </p>

            {applications.length ===
              0 && (
              <button
                type="button"
                onClick={() =>
                  navigate("/jobs")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg sm:mt-6 sm:py-3"
              >
                Browse jobs
                <ArrowRight
                  size={15}
                />
              </button>
            )}

          </div>
        ) : (

          /* ==================================================
             APPLICATION LIST
          ================================================== */

          <div className="space-y-3 sm:space-y-4">

            {filteredApplications.map(
              (
                application,
                index
              ) => {

                const statusConfig =
                  getStatusConfig(
                    application.status
                  );

                const StatusIcon =
                  statusConfig.icon;

                const companyLogo =
                  getAssetUrl(
                    application.company_logo_url ||
                      application.company_logo ||
                      application.logo
                  );

                const jobId =
                  application.job_id ||
                  application.jobId;

                const applicationId =
                  application.application_id ||
                  application.id;

                const skills =
                  normalizeArray(
                    application.skills
                  );

                return (
                  <article
                    key={
                      applicationId ||
                      `application-${index}`
                    }
                    className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200/80 hover:shadow-lg sm:rounded-2xl"
                  >

                    {/* Status strip */}

                    <div
                      className={`h-1 w-full ${statusConfig.strip}`}
                    />

                    <div className="p-4 sm:p-5 lg:p-6">

                      {/* ==================================================
                          TOP ROW
                      ================================================== */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

                        {/* Job info */}

                        <div className="flex min-w-0 gap-3 sm:gap-3.5">

                          {/* Logo */}

                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-14 sm:w-14 sm:rounded-2xl">

                            {companyLogo ? (
                              <img
                                src={companyLogo}
                                alt={
                                  application.company_name ||
                                  "Company"
                                }
                                className="h-full w-full object-contain p-1.5"
                                onError={(
                                  e
                                ) => {
                                  e.currentTarget.style.display =
                                    "none";

                                  const fallback =
                                    e.currentTarget.parentElement?.querySelector(
                                      "[data-logo-fallback]"
                                    );

                                  if (
                                    fallback
                                  ) {
                                    fallback.style.display =
                                      "flex";
                                  }
                                }}
                              />
                            ) : null}

                            <div
                              data-logo-fallback
                              className={`h-full w-full items-center justify-center ${
                                companyLogo
                                  ? "hidden"
                                  : "flex"
                              }`}
                            >
                              <Building2
                                size={22}
                                className="text-blue-600 sm:h-6 sm:w-6"
                              />
                            </div>

                          </div>

                          {/* Title + Company */}

                          <div className="min-w-0 flex-1">

                            <h2 className="break-words text-[15px] font-bold leading-snug text-slate-900 transition group-hover:text-blue-600 sm:text-base lg:text-lg">
                              {application.job_title ||
                                application.title ||
                                "Job Position"}
                            </h2>

                            <p className="mt-0.5 truncate text-sm font-medium text-blue-600">
                              {application.company_name ||
                                application.company ||
                                "Company"}
                            </p>

                          </div>
                        </div>

                        {/* Status */}

                        <div
                          className={`inline-flex w-fit shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[11px] font-bold sm:px-3 sm:text-xs ${statusConfig.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusConfig.dot}`}
                          />

                          <StatusIcon
                            size={13}
                            className="opacity-80"
                          />

                          {statusConfig.label}
                        </div>

                      </div>

                      {/* ==================================================
                          META
                      ================================================== */}

                      <div className="mt-3.5 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-500 sm:mt-4 sm:gap-x-4 sm:gap-y-2 sm:text-sm">

                        {application.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin
                              size={14}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="max-w-[140px] truncate sm:max-w-none">
                              {
                                application.location
                              }
                            </span>
                          </span>
                        )}

                        {application.job_type && (
                          <span className="inline-flex items-center gap-1">
                            <BriefcaseBusiness
                              size={14}
                              className="shrink-0 text-slate-400"
                            />
                            {
                              application.job_type
                            }
                          </span>
                        )}

                        {application.experience && (
                          <span className="inline-flex items-center gap-1">
                            <GraduationCap
                              size={14}
                              className="shrink-0 text-slate-400"
                            />
                            {
                              application.experience
                            }
                          </span>
                        )}

                        {application.salary && (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <IndianRupee
                              size={13}
                              className="shrink-0 text-slate-400"
                            />
                            {
                              application.salary
                            }
                          </span>
                        )}

                        {application.applied_at && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays
                              size={14}
                              className="shrink-0 text-slate-400"
                            />

                            Applied{" "}
                            {formatDate(
                              application.applied_at
                            )}
                          </span>
                        )}

                        {application.resume && (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <FileText
                              size={14}
                              className="shrink-0"
                            />
                            Resume
                          </span>
                        )}

                      </div>

                      {/* ==================================================
                          SKILLS
                      ================================================== */}

                      {skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-3.5">

                          {skills
                            .slice(0, 6)
                            .map(
                              (
                                skill,
                                skillIndex
                              ) => {

                                const skillName =
                                  getSkillName(
                                    skill
                                  );

                                if (
                                  !skillName
                                ) {
                                  return null;
                                }

                                return (
                                  <span
                                    key={`${skillName}-${skillIndex}`}
                                    className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200/80 sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs"
                                  >
                                    {
                                      skillName
                                    }
                                  </span>
                                );
                              }
                            )}

                          {skills.length >
                            6 && (
                            <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200/80 sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs">
                              +
                              {skills.length -
                                6}
                            </span>
                          )}

                        </div>
                      )}

                      {/* ==================================================
                          DESCRIPTION
                      ================================================== */}

                      {application.description && (
                        <div className="mt-3 rounded-lg bg-slate-50/80 px-3 py-2.5 sm:mt-3.5 sm:rounded-xl sm:px-3.5 sm:py-3">

                          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                            {
                              application.description
                            }
                          </p>

                        </div>
                      )}

                      {/* ==================================================
                          COVER LETTER
                      ================================================== */}

                      {application.cover_letter && (
                        <div className="mt-2.5 rounded-lg border border-slate-100 bg-white px-3 py-2.5 sm:mt-3 sm:rounded-xl sm:px-3.5 sm:py-3">

                          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-[11px]">
                            Cover letter
                          </p>

                          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                            {
                              application.cover_letter
                            }
                          </p>

                        </div>
                      )}

                      {/* ==================================================
                          DEADLINE
                      ================================================== */}

                      {application.deadline && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 sm:mt-3 sm:text-xs">

                          <Clock3
                            size={12}
                            className="text-slate-400"
                          />

                          Deadline:{" "}

                          <span className="font-semibold text-slate-700">
                            {formatDate(
                              application.deadline
                            )}
                          </span>

                        </div>
                      )}

                      {/* ==================================================
                          ACTIONS
                      ================================================== */}

                      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3.5 sm:mt-5 sm:flex-row sm:items-center sm:gap-2.5 sm:pt-4">

                        {jobId && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/jobs/${jobId}`
                              )
                            }
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:w-auto sm:px-4"
                          >
                            View job

                            <ArrowRight
                              size={14}
                            />
                          </button>
                        )}

                        {applicationId && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/candidate/application/${applicationId}`
                              )
                            }
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md sm:w-auto sm:px-4"
                          >
                            View application

                            <ArrowRight
                              size={14}
                            />
                          </button>
                        )}

                      </div>

                    </div>
                  </article>
                );
              }
            )}

          </div>
        )}
      </section>
    </main>
  );
};

export default AppliedJob;