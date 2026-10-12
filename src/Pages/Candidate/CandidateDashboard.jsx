import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Briefcase,
  Bookmark,
  FileText,
  Bell,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  MapPin,
  TrendingUp,
  Phone,
  RefreshCw,
  CalendarDays,
  Loader2,
  Code2,
  CircleUserRound,
  Sparkles,
  Eye,
  ChevronRight,
  X,
  ZoomIn,
  Mail,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API_BASE from "../../config/api";

/* =========================================================
   API
========================================================= */

const PROFILE_API = `${API_BASE}/profile/get.php`;
const DASHBOARD_API = `${API_BASE}/candidate/dashboard.php`;
const APPLICATIONS_API = `${API_BASE}/applications/get-my-applications.php`;

/* =========================================================
   SKELETON PRIMITIVE
========================================================= */

const Skeleton = ({ className = "", style }) => (
  <div
    style={style}
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

/* =========================================================
   DASHBOARD SKELETON
========================================================= */

const DashboardSkeleton = () => {
  return (
    <div className="w-full space-y-5 pb-8 sm:space-y-6">

      {/* ===== WELCOME HEADER SKELETON ===== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 shadow-lg shadow-blue-600/20 sm:rounded-3xl">
        <div className="relative flex flex-col items-start gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-7 lg:px-8">

          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-5 w-32 !bg-white/20" />
            <Skeleton className="h-7 w-64 !bg-white/25 sm:h-8 sm:w-80" />
            <Skeleton className="h-4 w-full max-w-md !bg-white/15" />
            <Skeleton className="h-4 w-3/4 max-w-sm !bg-white/15" />

            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-6 w-40 rounded-full !bg-white/15" />
              <Skeleton className="h-6 w-28 rounded-full !bg-white/15" />
            </div>
          </div>

          {/* Profile image skeleton */}
          <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 p-1.5 sm:mx-0 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <Skeleton className="h-full w-full rounded-full !bg-white/25" />
          </div>

        </div>
      </section>

      {/* ===== QUICK STATS SKELETON ===== */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                <Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl sm:h-12 sm:w-12" />
            </div>
            <Skeleton className="mt-3 h-3 w-14 sm:mt-4" />
          </div>
        ))}
      </section>

      {/* ===== PROFILE STRENGTH SKELETON ===== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl sm:h-14 sm:w-14" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-3 w-24 sm:h-4" />
              <Skeleton className="h-6 w-16 sm:h-7" />
              <Skeleton className="h-3 w-48 sm:w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-40 rounded-xl sm:h-12 sm:w-44" />
        </div>
        <Skeleton className="mt-4 h-2.5 w-full rounded-full sm:mt-5 sm:h-3" />
      </section>

      {/* ===== SKILLS SKELETON ===== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl sm:h-10 sm:w-10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 sm:h-5" />
            <Skeleton className="h-3 w-52 sm:w-60" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5">
          {[80, 64, 96, 72, 56, 88].map((w, i) => (
            <Skeleton
              key={i}
              className="h-8 rounded-full sm:h-9"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
      </section>

      {/* ===== RECOMMENDED JOBS SKELETON ===== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between sm:mb-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 sm:h-6" />
            <Skeleton className="h-3 w-52 sm:w-60" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-11 w-11 rounded-xl sm:h-12 sm:w-12" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="hidden h-6 w-16 rounded-lg sm:block" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="mt-4 h-4 w-20" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== RECENT APPLICATIONS SKELETON ===== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between sm:mb-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 sm:h-6" />
            <Skeleton className="h-3 w-52 sm:w-60" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl sm:h-12 sm:w-12" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-48 sm:w-56" />
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3 sm:gap-4 sm:pt-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="col-span-2 space-y-1.5 sm:col-span-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="mt-3 flex justify-end sm:mt-4">
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== NOTIFICATIONS SKELETON ===== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl sm:h-10 sm:w-10" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 sm:h-6" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="mt-4 space-y-3 sm:mt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4"
            >
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl sm:h-10 sm:w-10" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

/* =========================================================
   CANDIDATE DASHBOARD
========================================================= */

const CandidateDashboard = () => {
  const navigate = useNavigate();

  /* =======================================================
     USER HELPERS
  ======================================================= */

  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("User parse error:", error);
      return null;
    }
  };

  /*
   * IMPORTANT:
   *
   * This is USERS table ID.
   *
   * Example:
   *
   * users.id = 52
   * candidates.id = 10
   * candidates.user_id = 52
   *
   * Applications API currently uses:
   *
   * applications.candidate_id = users.id
   *
   * Therefore for Rosh:
   *
   * users.id = 52
   * applications.candidate_id = 52
   */

  const getUserId = () => {
    const currentUser = getStoredUser();

    const id =
      currentUser?.id ??
      currentUser?.userId ??
      currentUser?.user_id;

    const numericId = Number(id);

    return Number.isFinite(numericId) && numericId > 0
      ? numericId
      : null;
  };

  /* =======================================================
     STATES
  ======================================================= */

  const [profile, setProfile] = useState({});

  const [applications, setApplications] = useState([]);

  const [dashboardData, setDashboardData] = useState({
    stats: {
      savedJobs: 0,
      profileViews: 0,
    },
    recommendedJobs: [],
    notifications: [],
  });

  const [profileCompletion, setProfileCompletion] = useState(0);

  const [loading, setLoading] = useState(true);

  const [applicationsLoading, setApplicationsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [imageModalOpen, setImageModalOpen] =
    useState(false);

  const user = getStoredUser();

  /* =======================================================
     HELPERS
  ======================================================= */

  const hasValue = (value) => {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value > 0;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) return false;
      if (trimmed === "[]") return false;
      if (trimmed === "{}") return false;
      if (trimmed === "null") return false;

      return true;
    }

    if (Array.isArray(value)) {
      return value.some((item) => hasValue(item));
    }

    if (typeof value === "object") {
      return Object.values(value).some((item) =>
        hasValue(item)
      );
    }

    return false;
  };

  /* =======================================================
     JSON PARSER
  ======================================================= */

  const parseJsonField = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "object") {
      return value;
    }

    if (typeof value !== "string") {
      return [];
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  };

  /* =======================================================
     PROFILE COMPLETION
  ======================================================= */

  const calculateProfileCompletion = (
    profileData,
    currentUser = null
  ) => {
    if (
      !profileData ||
      typeof profileData !== "object"
    ) {
      return 0;
    }

    const name =
      profileData.name ||
      currentUser?.name ||
      "";

    const email =
      profileData.email ||
      currentUser?.email ||
      "";

    const phone =
      profileData.phone ||
      currentUser?.phone ||
      "";

    const headline = profileData.headline || "";
    const bio = profileData.bio || "";
    const location = profileData.location || "";
    const resume = profileData.resume || "";
    const linkedin = profileData.linkedin || "";
    const github = profileData.github || "";
    const portfolio = profileData.portfolio || "";

    const skills = parseJsonField(
      profileData.skills
    );

    const experience = parseJsonField(
      profileData.experience
    );

    const education = parseJsonField(
      profileData.education
    );

    const projects = parseJsonField(
      profileData.projects
    );

    const fields = [
      { completed: hasValue(name) },
      { completed: hasValue(email) },
      { completed: hasValue(phone) },
      { completed: hasValue(headline) },
      { completed: hasValue(bio) },
      { completed: hasValue(location) },
      { completed: hasValue(resume) },
      { completed: hasValue(skills) },
      { completed: hasValue(experience) },
      { completed: hasValue(education) },
      { completed: hasValue(projects) },
      { completed: hasValue(linkedin) },
      { completed: hasValue(github) },
      { completed: hasValue(portfolio) },
    ];

    const completedFields = fields.filter(
      (field) => field.completed
    ).length;

    const totalFields = fields.length;

    if (!totalFields) {
      return 0;
    }

    return Math.round(
      (completedFields / totalFields) * 100
    );
  };

  /* =======================================================
     FETCH PROFILE
  ======================================================= */

  const fetchProfile = async () => {
    const userId = getUserId();

    if (!userId) {
      throw new Error(
        "User information not found. Please login again."
      );
    }

    const response = await axios.get(
      PROFILE_API,
      {
        params: {
          user_id: userId,
        },
      }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Unable to load candidate profile."
      );
    }

    const profileData =
      response.data?.profile || {};

    return {
      ...profileData,

      skills: parseJsonField(
        profileData.skills
      ),

      experience: parseJsonField(
        profileData.experience
      ),

      education: parseJsonField(
        profileData.education
      ),

      projects: parseJsonField(
        profileData.projects
      ),
    };
  };

  /* =======================================================
     FETCH APPLICATIONS
  ======================================================= */

  const fetchApplications = async () => {
    setApplicationsLoading(true);

    try {
      const userId = getUserId();

      if (!userId) {
        setApplications([]);
        return [];
      }

      /*
       * IMPORTANT:
       *
       * We send USERS ID.
       *
       * Rosh:
       * users.id = 52
       *
       * API:
       * get-my-applications.php?userId=52
       *
       * Backend:
       * applications.candidate_id = 52
       *
       * Existing Tanu applications:
       * candidate_id = 46
       *
       * Therefore Rosh will NOT see Tanu's applications.
       */

      console.log(
        "Fetching applications for userId:",
        userId
      );

      const response = await axios.get(
        APPLICATIONS_API,
        {
          params: {
            userId: userId,
          },
        }
      );

      console.log(
        "Applications API response:",
        response.data
      );

      if (!response.data?.success) {
        console.warn(
          "Applications API:",
          response.data?.message
        );

        setApplications([]);
        return [];
      }

      const applicationList =
        Array.isArray(
          response.data?.applications
        )
          ? response.data.applications
          : [];

      /*
       * Safety check:
       *
       * Only keep valid application objects.
       */

      const validApplications =
        applicationList.filter(
          (application) =>
            application &&
            (
              application.application_id ||
              application.id
            )
        );

      setApplications(validApplications);

      return validApplications;
    } catch (error) {
      console.error(
        "Fetch Applications Error:",
        error
      );

      setApplications([]);

      return [];
    } finally {
      setApplicationsLoading(false);
    }
  };

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboardAPI = async () => {
    const userId = getUserId();

    if (!userId) {
      return null;
    }

    try {
      const response = await axios.get(
        DASHBOARD_API,
        {
          params: {
            userId: userId,
          },
        }
      );

      if (response.data?.success) {
        return response.data?.data || null;
      }

      return null;
    } catch (error) {
      console.warn(
        "Dashboard API unavailable:",
        error
      );

      return null;
    }
  };

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = getStoredUser();
      const userId = getUserId();

      if (!userId) {
        setError(
          "User information not found. Please login again."
        );

        return;
      }

      const role = String(
        currentUser?.role || ""
      )
        .toLowerCase()
        .trim();

      if (
        role &&
        role !== "candidate"
      ) {
        setError(
          "You are not authorized to access candidate dashboard."
        );

        return;
      }

      /*
       * Debug information.
       */

      console.log(
        "Candidate Dashboard User:",
        currentUser
      );

      console.log(
        "Candidate Dashboard User ID:",
        userId
      );

      /* Load profile first */

      const profileData =
        await fetchProfile();

      setProfile(profileData);

      setProfileCompletion(
        calculateProfileCompletion(
          profileData,
          currentUser
        )
      );

      /*
       * Applications and dashboard
       * can load together.
       */

      const [
        applicationsResult,
        dashboardResult,
      ] = await Promise.all([
        fetchApplications(),
        fetchDashboardAPI(),
      ]);

      if (Array.isArray(applicationsResult)) {
        setApplications(
          applicationsResult
        );
      }

      if (dashboardResult) {
        setDashboardData({
          stats: {
            savedJobs: Number(
              dashboardResult?.stats
                ?.savedJobs ?? 0
            ),

            profileViews: Number(
              dashboardResult?.stats
                ?.profileViews ?? 0
            ),
          },

          recommendedJobs:
            Array.isArray(
              dashboardResult?.recommendedJobs
            )
              ? dashboardResult.recommendedJobs
              : [],

          notifications:
            Array.isArray(
              dashboardResult?.notifications
            )
              ? dashboardResult.notifications
              : [],
        });
      }
    } catch (error) {
      console.error(
        "Candidate Dashboard Error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =======================================================
     ESCAPE IMAGE MODAL
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setImageModalOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = () => {
    loadDashboard();
  };

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const normalizedDate =
      String(date).replace(
        " ",
        "T"
      );

    const formattedDate =
      new Date(normalizedDate);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return String(date);
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =======================================================
     STATUS BADGE
  ======================================================= */

  const getStatusBadge = (status) => {
    const currentStatus = String(
      status || ""
    )
      .toLowerCase()
      .trim();

    if (
      currentStatus === "shortlisted" ||
      currentStatus === "selected"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
          <CheckCircle size={13} />
          {status}
        </span>
      );
    }

    if (currentStatus === "hired") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-200">
          <CheckCircle size={13} />
          {status}
        </span>
      );
    }

    if (
      currentStatus === "rejected" ||
      currentStatus === "declined"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
          <XCircle size={13} />
          {status}
        </span>
      );
    }

    if (
      currentStatus === "interview" ||
      currentStatus ===
        "interview scheduled"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-200">
          <CalendarDays size={13} />
          {status}
        </span>
      );
    }

    if (
      currentStatus === "viewed" ||
      currentStatus === "under review" ||
      currentStatus === "screening"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
          <Eye size={13} />
          {status}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
        <Clock size={13} />
        {status || "Applied"}
      </span>
    );
  };

  /* =======================================================
     LOADING (SKELETON)
  ======================================================= */

  if (loading) {
    return <DashboardSkeleton />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <XCircle
              size={32}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Unable to Load Dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            onClick={handleRefresh}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const dashboardStats =
    dashboardData?.stats || {};

  const recommendedJobs =
    dashboardData?.recommendedJobs || [];

  const notifications =
    dashboardData?.notifications || [];

  const candidateName =
    profile?.name ||
    user?.name ||
    "Candidate";

  const candidateEmail =
    profile?.email ||
    user?.email ||
    "candidate@email.com";

  const candidatePhone =
    profile?.phone ||
    user?.phone ||
    "Not added";

  /* =======================================================
     PROFILE IMAGE
  ======================================================= */

  const getImageUrl = (value) => {
    if (!value) {
      return "";
    }

    let image = String(value).trim();

    if (!image) {
      return "";
    }

    if (image.startsWith("data:")) {
      return image;
    }

    /*
     * Absolute URL
     */

    if (
      /^https?:\/\//i.test(image)
    ) {
      try {
        const url = new URL(image);

        const marker =
          "/job_portal/job-portal-api/";

        const index =
          url.pathname.indexOf(marker);

        if (index !== -1) {
          const relativePath =
            url.pathname.substring(
              index + marker.length
            );

          return `${API_ROOT}/${relativePath}`;
        }

        return image;
      } catch {
        return image;
      }
    }

    /*
     * Windows path -> URL path
     */

    image = image.replace(
      /\\/g,
      "/"
    );

    /*
     * Remove leading slashes.
     */

    image = image.replace(
      /^\/+/,
      ""
    );

    return `${API_ROOT}/${image}`;
  };

  const rawCandidateImage =
    profile?.profile_image ||
    profile?.profileImage ||
    profile?.profile_image_url ||
    profile?.profileImageUrl ||
    profile?.profile_photo ||
    profile?.profilePhoto ||
    profile?.image_url ||
    profile?.imageUrl ||
    profile?.photo ||
    profile?.avatar ||
    profile?.image ||
    user?.profile_image ||
    user?.profileImage ||
    user?.profile_image_url ||
    user?.profileImageUrl ||
    user?.profile_photo ||
    user?.profilePhoto ||
    user?.image_url ||
    user?.imageUrl ||
    user?.photo ||
    user?.avatar ||
    user?.image ||
    "";

  const candidateImage =
    getImageUrl(rawCandidateImage);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goTo = (path) => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    navigate(path);
  };

  /* =======================================================
     APPLICATION COUNTS
  ======================================================= */

  const appliedJobsCount =
    applications.length;

  const shortlistedCount =
    applications.filter(
      (application) => {
        const status = String(
          application?.status || ""
        )
          .toLowerCase()
          .trim();

        return (
          status === "shortlisted" ||
          status === "selected"
        );
      }
    ).length;

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="w-full space-y-5 pb-8 sm:space-y-6">

      {/* =================================================
          IMAGE MODAL
      ================================================= */}

      {imageModalOpen &&
        candidateImage && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
            onClick={() =>
              setImageModalOpen(false)
            }
          >
            <button
              type="button"
              onClick={() =>
                setImageModalOpen(false)
              }
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
              aria-label="Close image"
            >
              <X size={20} />
            </button>

            <div
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <img
                src={candidateImage}
                alt={`${candidateName} profile`}
                className="max-h-[85vh] max-w-[85vw] object-contain"
              />
            </div>
          </div>
        )}

      {/* =================================================
          WELCOME HEADER
      ================================================= */}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20 sm:rounded-3xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl sm:h-72 sm:w-72" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl sm:h-64 sm:w-64" />

        <div className="relative flex flex-col items-start gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-7 lg:px-8">

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-50 ring-1 ring-inset ring-white/20 sm:text-xs">
              <Sparkles size={12} />
              Candidate Workspace
            </div>

            <h1 className="mt-3 truncate text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
              Welcome back,{" "}
              {candidateName} 👋
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm">
              Keep your profile updated, track
              applications and discover your next
              career opportunity.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-inset ring-white/20 sm:text-xs">
                <Mail
                  size={12}
                  className="shrink-0"
                />

                <span className="truncate">
                  {candidateEmail}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-inset ring-white/20 sm:text-xs">
                <Phone
                  size={12}
                  className="shrink-0"
                />

                {candidatePhone}
              </span>

            </div>
          </div>

          {/* PROFILE IMAGE */}

          <button
            type="button"
            onClick={() =>
              candidateImage &&
              setImageModalOpen(true)
            }
            className={`group relative mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 p-1.5 shadow-2xl backdrop-blur-sm transition sm:mx-0 sm:h-28 sm:w-28 lg:h-32 lg:w-32 ${
              candidateImage
                ? "cursor-zoom-in hover:scale-105"
                : "cursor-default"
            }`}
            title={
              candidateImage
                ? "Click to view"
                : ""
            }
          >
            <div className="relative h-full w-full overflow-hidden rounded-full bg-white shadow-xl ring-4 ring-white/30">

              {candidateImage ? (
                <img
                  src={candidateImage}
                  alt={`${candidateName} profile`}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const fallback =
                      event.currentTarget.parentElement?.querySelector(
                        "[data-profile-fallback]"
                      );

                    if (fallback) {
                      fallback.style.display =
                        "flex";
                    }
                  }}
                />
              ) : null}

              <div
                data-profile-fallback
                className={`absolute inset-0 items-center justify-center bg-white text-blue-600 ${
                  candidateImage
                    ? "hidden"
                    : "flex"
                }`}
              >
                <CircleUserRound
                  size={56}
                  strokeWidth={1.7}
                  className="sm:hidden"
                />

                <CircleUserRound
                  size={64}
                  strokeWidth={1.7}
                  className="hidden sm:block"
                />
              </div>

            </div>

            {candidateImage && (
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg ring-2 ring-white transition group-hover:bg-blue-600 group-hover:text-white sm:h-8 sm:w-8">
                <ZoomIn size={14} />
              </span>
            )}
          </button>

        </div>
      </section>

      {/* =================================================
          QUICK STATS
      ================================================= */}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

        <StatCard
          label="Applied Jobs"
          value={
            applicationsLoading ? (
              <Loader2
                size={22}
                className="animate-spin text-blue-600"
              />
            ) : (
              appliedJobsCount
            )
          }
          icon={<Briefcase size={20} />}
          iconClass="bg-blue-600"
          glowClass="bg-blue-50"
          onClick={() =>
            goTo(
              "/candidate/applications"
            )
          }
        />

        <StatCard
          label="Saved Jobs"
          value={Number(
            dashboardStats?.savedJobs ?? 0
          )}
          icon={<Bookmark size={20} />}
          iconClass="bg-pink-500"
          glowClass="bg-pink-50"
          onClick={() =>
            goTo(
              "/candidate/saved-jobs"
            )
          }
        />

        <StatCard
          label="Shortlisted"
          value={shortlistedCount}
          icon={<CheckCircle size={20} />}
          iconClass="bg-green-500"
          glowClass="bg-green-50"
        />

        <StatCard
          label="Profile Views"
          value={Number(
            dashboardStats?.profileViews ?? 0
          )}
          icon={<Eye size={20} />}
          iconClass="bg-purple-500"
          glowClass="bg-purple-50"
        />

      </section>

      {/* =================================================
          PROFILE STRENGTH
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3 sm:gap-4">

            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${
                profileCompletion >= 80
                  ? "bg-green-50 text-green-600"
                  : profileCompletion >= 40
                    ? "bg-blue-50 text-blue-600"
                    : "bg-amber-50 text-amber-600"
              }`}
            >
              <TrendingUp size={24} />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Profile Strength
              </p>

              <h2 className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">
                {profileCompletion}%
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                {profileCompletion === 100
                  ? "Your profile is complete."
                  : `Complete ${
                      100 - profileCompletion
                    }% more information to improve your profile.`}
              </p>

            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              goTo(
                "/candidate/profile"
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:px-5 sm:py-3 sm:text-sm"
          >
            {profileCompletion === 100
              ? "View Profile"
              : "Complete Profile"}

            <ArrowRight size={15} />
          </button>

        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 sm:mt-5 sm:h-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  profileCompletion
                )
              )}%`,
            }}
          />
        </div>

      </section>

      {/* =================================================
          SKILLS
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">

        <SectionTitle
          icon={<Code2 size={18} />}
          title="Professional Skills"
          subtitle="Skills listed on your profile"
        />

        {Array.isArray(
          profile?.skills
        ) &&
        profile.skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5">

            {profile.skills.map(
              (skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100 transition hover:bg-blue-100 sm:px-4 sm:py-2 sm:text-sm"
                >
                  {typeof skill === "object"
                    ? skill?.name ||
                      skill?.title ||
                      skill?.skill ||
                      JSON.stringify(
                        skill
                      )
                    : skill}
                </span>
              )
            )}

          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:mt-5">

            <Code2
              size={28}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-sm text-slate-500">
              No skills added yet.
            </p>

            <button
              type="button"
              onClick={() =>
                goTo(
                  "/candidate/profile"
                )
              }
              className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Add Skills
            </button>

          </div>
        )}

      </section>

      {/* =================================================
          RECOMMENDED JOBS
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">

        <SectionHeader
          title="Recommended Jobs"
          subtitle="Jobs matching your profile"
          buttonText="View All"
          onClick={() =>
            goTo("/jobs")
          }
        />

        {recommendedJobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={32} />}
            title="No recommended jobs yet"
            description="New jobs matching your profile will appear here."
            buttonText="Find Jobs"
            onClick={() =>
              goTo("/jobs")
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">

            {recommendedJobs
              .slice(0, 6)
              .map((job, index) => (
                <div
                  key={
                    job.id || index
                  }
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-5"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 transition group-hover:bg-blue-600 sm:h-12 sm:w-12">

                        <Briefcase
                          size={20}
                          className="text-blue-600 transition group-hover:text-white"
                        />

                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                          {job.title ||
                            job.jobTitle ||
                            job.job_title ||
                            "Job"}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-600 sm:text-sm">
                          {job.company ||
                            job.companyName ||
                            job.company_name ||
                            "Company"}
                        </p>

                      </div>

                    </div>

                    <span className="hidden shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 sm:inline-block">
                      {job.type ||
                        job.jobType ||
                        job.job_type ||
                        "Full Time"}
                    </span>

                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-slate-500 sm:mt-4 sm:grid-cols-2 sm:gap-2">

                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} />
                      {job.location ||
                        "Location not specified"}
                    </span>

                    <span>
                      {job.salary ||
                        "Salary not specified"}
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      goTo(
                        `/jobs/${job.id}`
                      )
                    }
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    View Job
                    <ChevronRight
                      size={16}
                    />
                  </button>

                </div>
              ))}

          </div>
        )}

      </section>

      {/* =================================================
          RECENT APPLICATIONS
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">

        <SectionHeader
          title="Recent Applications"
          subtitle="Track your latest job applications"
          buttonText="View All"
          onClick={() =>
            goTo(
              "/candidate/applications"
            )
          }
        />

        {applicationsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={<FileText size={32} />}
            title="No applications yet"
            description="Jobs you apply for will appear here."
            buttonText="Find Jobs"
            onClick={() =>
              goTo("/jobs")
            }
          />
        ) : (
          <div className="space-y-3 sm:space-y-4">

            {applications
              .slice(0, 5)
              .map(
                (
                  application,
                  index
                ) => (
                  <div
                    key={
                      application.application_id ||
                      application.id ||
                      index
                    }
                    className="group rounded-2xl border border-slate-200 p-4 transition duration-200 hover:border-blue-200 hover:shadow-md sm:p-5"
                  >

                    <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex min-w-0 gap-3 sm:gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 sm:h-12 sm:w-12">
                          <Briefcase
                            size={22}
                            className="text-blue-600"
                          />
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                            {application.job_title ||
                              application.title ||
                              "Job Title"}
                          </h3>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 sm:text-sm">
                            <Building2
                              size={14}
                            />

                            {application.company_name ||
                              application.company ||
                              "Company"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500 sm:mt-3 sm:gap-3 sm:text-xs">

                            <span className="flex items-center gap-1">
                              <MapPin
                                size={12}
                              />

                              {application.location ||
                                "Location not specified"}
                            </span>

                            <span>
                              {application.job_type ||
                                "Full Time"}
                            </span>

                            <span>
                              {application.experience ||
                                "Experience not specified"}
                            </span>

                          </div>

                        </div>
                      </div>

                      <div className="shrink-0">
                        {getStatusBadge(
                          application.status
                        )}
                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3 sm:gap-4 sm:pt-4">

                      <DetailItem
                        label="Salary"
                        value={
                          application.salary ||
                          "Not specified"
                        }
                      />

                      <DetailItem
                        label="Applied On"
                        value={formatDate(
                          application.applied_at ||
                            application.created_at
                        )}
                        icon={
                          <CalendarDays
                            size={14}
                          />
                        }
                      />

                      <div className="col-span-2 sm:col-span-1">

                        <DetailItem
                          label="Deadline"
                          value={formatDate(
                            application.deadline
                          )}
                        />

                      </div>

                    </div>

                    <div className="mt-3 flex justify-end sm:mt-4">

                      <button
                        type="button"
                        onClick={() =>
                          application.job_id &&
                          goTo(
                            `/jobs/${application.job_id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:px-4 sm:py-2 sm:text-sm"
                      >
                        View Job

                        <ArrowRight
                          size={14}
                        />
                      </button>

                    </div>

                  </div>
                )
              )}

            {applications.length > 5 && (
              <div className="pt-2 text-center">

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/candidate/applications"
                    )
                  }
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all{" "}
                  {applications.length}{" "}
                  applications

                  <ArrowRight
                    size={15}
                  />
                </button>

              </div>
            )}

          </div>
        )}

      </section>

      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <SectionTitle
            icon={<Bell size={18} />}
            title="Notifications"
            subtitle="Latest account updates"
          />

          {notifications.length > 0 && (
            <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
              {notifications.length} New
            </span>
          )}

        </div>

        {notifications.length === 0 ? (
          <div className="py-10 text-center">

            <Bell
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm text-slate-500">
              No new notifications.
            </p>

          </div>
        ) : (
          <div className="mt-4 space-y-3 sm:mt-5">

            {notifications
              .slice(0, 5)
              .map(
                (
                  notification,
                  index
                ) => (
                  <div
                    key={
                      notification.id ||
                      index
                    }
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-slate-50 sm:p-4"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm sm:h-10 sm:w-10">
                      <Bell size={16} />
                    </div>

                    <div className="min-w-0">

                      <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                        {notification.title ||
                          "Notification"}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        {notification.message ||
                          notification.description ||
                          ""}
                      </p>

                      <p className="mt-1.5 text-[11px] text-slate-400 sm:text-xs">
                        {notification.time ||
                          notification.createdAt ||
                          notification.created_at ||
                          ""}
                      </p>

                    </div>

                  </div>
                )
              )}

          </div>
        )}

      </section>

    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  label,
  value,
  icon,
  iconClass,
  glowClass,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${
        onClick
          ? "cursor-pointer"
          : ""
      }`}
    >

      <div
        className={`absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full ${glowClass} opacity-70 transition group-hover:scale-125 sm:h-24 sm:w-24 sm:-translate-y-8 sm:translate-x-8`}
      />

      <div className="relative flex items-center justify-between gap-2">

        <div className="min-w-0">

          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            {label}
          </p>

          <div className="mt-1 text-xl font-bold text-slate-900 sm:mt-1.5 sm:text-3xl">
            {value}
          </div>

        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm sm:h-12 sm:w-12 ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      {onClick && (
        <div className="relative mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600 sm:mt-4 sm:text-xs">
          Open
          <ArrowRight size={12} />
        </div>
      )}

    </div>
  );
};

/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailItem = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="min-w-0">

      <p className="text-[11px] text-slate-400 sm:text-xs">
        {label}
      </p>

      <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-slate-700 sm:mt-1 sm:text-sm">

        {icon}

        <span className="truncate">
          {value}
        </span>

      </p>

    </div>
  );
};

/* =========================================================
   SECTION TITLE
========================================================= */

const SectionTitle = ({
  icon,
  title,
  subtitle,
}) => {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-10 sm:w-10">
        {icon}
      </div>

      <div className="min-w-0">

        <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg lg:text-xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-slate-500 sm:mt-1 sm:text-sm">
            {subtitle}
          </p>
        )}

      </div>

    </div>
  );
};

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  title,
  subtitle,
  buttonText,
  onClick,
  icon,
}) => {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">

      <div className="flex min-w-0 items-center gap-3">

        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-10 sm:w-10">
            {icon}
          </div>
        )}

        <div className="min-w-0">

          <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg lg:text-xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:mt-1 sm:text-sm">
              {subtitle}
            </p>
          )}

        </div>

      </div>

      {buttonText && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 self-start rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 sm:self-auto sm:text-sm"
        >
          {buttonText}
          <ArrowRight size={15} />
        </button>
      )}

    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  onClick,
}) => {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center sm:p-8">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm sm:h-16 sm:w-16">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-700 sm:mt-4 sm:text-base">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
        {description}
      </p>

      {buttonText && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:text-sm"
        >
          {buttonText}
          <ArrowRight size={14} />
        </button>
      )}

    </div>
  );
};

export default CandidateDashboard;