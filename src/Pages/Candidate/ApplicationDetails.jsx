import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  CalendarDays,
  IndianRupee,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Hash,
  Mail,
  Phone,
  UserRound,
  GraduationCap,
  Code2,
  ClipboardList,
  ListChecks,
  Eye,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

/* =====================================================
   API
===================================================== */

import API_BASE from "../../config/api";

const APPLICATION_DETAILS_API = `${API_BASE}/applications/get-candidate-application-by-id.php`;

/* =====================================================
   SKELETON PRIMITIVE
===================================================== */

const Skeleton = ({ className = "", style }) => (
  <div
    style={style}
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

/* =====================================================
   APPLICATION DETAILS SKELETON
===================================================== */

const ApplicationDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ===== TOP APPLICATION HEADER SKELETON ===== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

          <Skeleton className="mb-5 h-5 w-40" />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />

            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex min-w-0 items-center gap-4">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />

                  <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-7 w-64 sm:h-8 sm:w-80" />
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>

                <Skeleton className="h-10 w-32 shrink-0 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT SKELETON ===== */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-6">

            {/* Candidate Information */}
            <SkeletonSectionHeader
              title="Candidate Information"
              subtitle="Information submitted with your application"
              fields={4}
            />

            {/* Job Information */}
            <SkeletonSectionHeader
              title="Job Information"
              subtitle="Details of the position you applied for"
              fields={8}
            />

            {/* Job Description */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="mt-5 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Responsibilities */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="mt-2 h-2 w-2 shrink-0 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-44" />
              </div>
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {[80, 64, 96, 72, 56, 88, 76].map((w, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 rounded-lg"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Cover Letter */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>

            {/* Documents */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-44" />
                </div>
                <Skeleton className="mt-2 h-3 w-56" />
              </div>

              <div className="space-y-3 p-6">
                {Array.from({ length: 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Skeleton className="h-8 w-16 rounded-lg" />
                      <Skeleton className="h-8 w-24 rounded-lg" />
                      <Skeleton className="h-8 w-9 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <aside className="space-y-6">

            {/* Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 shrink-0 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-44" />

              <div className="mt-5 space-y-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application ID */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex gap-3">
                <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Skeleton className="h-12 w-full rounded-xl" />

          </aside>
        </div>
      </main>
    </div>
  );
};

/* =====================================================
   SKELETON SECTION HEADER HELPER
===================================================== */

const SkeletonSectionHeader = ({ title, subtitle, fields = 4 }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-44" />
        </div>
        {subtitle && (
          <Skeleton className="mt-2 h-3 w-60" />
        )}
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="mt-2 h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* =====================================================
   USER HELPERS
===================================================== */

const getCurrentUser = () => {
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

const getCandidateId = () => {
  const user = getCurrentUser();

  if (!user) {
    return (
      localStorage.getItem("id") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id")
    );
  }

  return (
    user.id ||
    user.userId ||
    user.user_id ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("user_id")
  );
};

/* =====================================================
   FORMAT HELPERS
===================================================== */

const normalizeStatus = (status) => {
  return String(status || "Applied")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =====================================================
   DOCUMENT URL HELPER

   Resume upload.php me:
   /uploads/resumes/filename.pdf
===================================================== */

const getDocumentUrl = (documentPath, type = "") => {
  if (!documentPath) {
    return "";
  }

  let value = String(documentPath).trim();

  if (!value) {
    return "";
  }

  /* Already complete HTTP/HTTPS URL */
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  /* Blob/Data URL */
  if (value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }

  /* Remove localhost API URL if backend sends full URL */
  value = value.replace(
    /^https?:\/\/localhost\/job_portal\/job-portal-api\/?/i,
    ""
  );

  /* Remove leading slash */
  value = value.replace(/^\/+/, "");

  /* Already uploads/... */
  if (value.startsWith("uploads/")) {
    return `${API_ROOT}/${value}`;
  }

  /* Resume filename only */
  if (type === "resume") {
    return `${API_ROOT}/uploads/resumes/${value}`;
  }

  /* Other uploaded document */
  return `${API_ROOT}/uploads/${value}`;
};

/* =====================================================
   STATUS CONFIG
===================================================== */

const getStatusConfig = (status) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "shortlisted":
      return {
        label: "Shortlisted",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
      };

    case "interview":
    case "interview scheduled":
    case "interview_scheduled":
    case "interviewed":
      return {
        label: "Interview",
        className: "bg-purple-50 text-purple-700 border-purple-200",
        icon: CalendarDays,
      };

    case "selected":
      return {
        label: "Selected",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle,
      };

    case "hired":
      return {
        label: "Hired",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
      };

    case "rejected":
      return {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };

    case "viewed":
      return {
        label: "Viewed",
        className: "bg-cyan-50 text-cyan-700 border-cyan-200",
        icon: Eye,
      };

    case "screening":
      return {
        label: "Screening",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
      };

    default:
      return {
        label: status || "Applied",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
      };
  }
};

/* =====================================================
   STATUS MESSAGE
===================================================== */

const getStatusMessage = (status) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "shortlisted":
      return "Your application has been shortlisted by the recruiter.";

    case "screening":
      return "Your application is currently being reviewed by the recruiter.";

    case "rejected":
      return "Your application was not selected for this position.";

    case "hired":
      return "Congratulations! You have been hired for this position.";

    case "selected":
      return "Congratulations! You have been selected for this position.";

    case "interview":
    case "interview scheduled":
    case "interview_scheduled":
    case "interviewed":
      return "Your application has moved to the interview stage.";

    case "viewed":
      return "The recruiter has viewed your application.";

    default:
      return "Your application has been successfully submitted and is under review.";
  }
};

/* =====================================================
   SKILLS PARSER
===================================================== */

const parseSkills = (skillsValue) => {
  if (!skillsValue) {
    return [];
  }

  if (Array.isArray(skillsValue)) {
    return skillsValue
      .map((skill) => String(skill).trim())
      .filter(Boolean);
  }

  if (typeof skillsValue === "string") {
    try {
      const parsed = JSON.parse(skillsValue);

      if (Array.isArray(parsed)) {
        return parsed
          .map((skill) => String(skill).trim())
          .filter(Boolean);
      }
    } catch {
      // Normal string parsing
    }

    return skillsValue
      .split(/[,|]/)
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

/* =====================================================
   TEXT LIST PARSER
===================================================== */

const renderListText = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) =>
        item
          .replace(/^\s*[-*•]\s*/, "")
          .replace(/^\s*\d+[.)]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  }

  return [];
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ===================================================
     FETCH APPLICATION
  =================================================== */

  const fetchApplication = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const user = getCurrentUser();
      const candidateId = getCandidateId();

      /* Login check */
      if (!user) {
        navigate("/login", {
          state: {
            redirectTo: `/candidate/application/${id}`,
            message: "Please login to view application details.",
          },
        });

        return;
      }

      /* Candidate role check */
      if (
        user.role &&
        String(user.role).trim().toLowerCase() !== "candidate"
      ) {
        setError("Only candidates can view application details.");
        return;
      }

      /* Candidate ID check */
      if (!candidateId) {
        setError("Candidate login information not found. Please login again.");
        return;
      }

      /* Application ID check */
      if (!id) {
        setError("Application ID is missing.");
        return;
      }

      /* API URL */
      const url =
        `${APPLICATION_DETAILS_API}` +
        `?applicationId=${encodeURIComponent(id)}` +
        `&candidateId=${encodeURIComponent(candidateId)}`;

      console.log("Application Details API:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log("Application Details Response:", data);

      if (data.success && data.application) {
        setApplication(data.application);
      } else {
        setApplication(null);
        setError(data.message || "Application not found.");
      }
    } catch (err) {
      console.error("Application details error:", err);

      setError(err.message || "Unable to load application details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    fetchApplication();
  }, [id]);

  /* ===================================================
     DYNAMIC SKILLS
  =================================================== */

  const skills = useMemo(() => {
    return parseSkills(
      application?.skills ||
        application?.job_skills ||
        application?.required_skills
    );
  }, [application]);

  /* ===================================================
     DYNAMIC RESPONSIBILITIES
  =================================================== */

  const responsibilities = useMemo(() => {
    return renderListText(
      application?.responsibilities || application?.job_responsibilities
    );
  }, [application]);

  /* ===================================================
     DYNAMIC REQUIREMENTS
  =================================================== */

  const requirements = useMemo(() => {
    return renderListText(
      application?.requirements || application?.job_requirements
    );
  }, [application]);

  /* ===================================================
     DYNAMIC DOCUMENTS
  =================================================== */

  const documents = useMemo(() => {
    if (!application) {
      return [];
    }

    const list = [];

    /* Resume */
    const resume =
      application.resume ||
      application.resume_url ||
      application.resume_path;

    if (resume) {
      list.push({
        key: "resume",
        title: "Resume",
        description: "Resume submitted with this application",
        url: getDocumentUrl(resume, "resume"),
      });
    }

    /* Cover Letter Document */
    const coverLetter =
      application.cover_letter_file ||
      application.cover_letter_url ||
      application.cover_letter_document;

    if (coverLetter) {
      list.push({
        key: "cover-letter",
        title: "Cover Letter Document",
        description: "Cover letter document submitted with application",
        url: getDocumentUrl(coverLetter, "cover-letter"),
      });
    }

    /* Portfolio */
    const portfolio =
      application.portfolio ||
      application.portfolio_url ||
      application.portfolio_document;

    if (portfolio) {
      list.push({
        key: "portfolio",
        title: "Portfolio",
        description: "Portfolio submitted with application",
        url: getDocumentUrl(portfolio, "portfolio"),
      });
    }

    /* Certificate */
    const certificate =
      application.certificate ||
      application.certificate_url ||
      application.certificate_document;

    if (certificate) {
      list.push({
        key: "certificate",
        title: "Certificate",
        description: "Certificate submitted with application",
        url: getDocumentUrl(certificate, "certificate"),
      });
    }

    return list;
  }, [application]);

  /* ===================================================
     STATUS
  =================================================== */

  const statusConfig = getStatusConfig(application?.status);
  const StatusIcon = statusConfig.icon;
  const normalizedStatus = normalizeStatus(application?.status);

  /* ===================================================
     STATUS TIMELINE
  =================================================== */

  const reviewStatuses = [
    "viewed",
    "screening",
    "shortlisted",
    "interview",
    "interview scheduled",
    "interview_scheduled",
    "interviewed",
    "selected",
    "hired",
  ];

  const interviewStatuses = [
    "shortlisted",
    "interview",
    "interview scheduled",
    "interview_scheduled",
    "interviewed",
    "selected",
    "hired",
  ];

  const finalStatuses = ["selected", "hired", "rejected"];

  /* ===================================================
     LOADING (SKELETON)
  =================================================== */

  if (loading) {
    return <ApplicationDetailsSkeleton />;
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle size={32} className="text-red-500" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Application Not Found
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "Unable to find this application."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => fetchApplication(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={17} />
                Retry
              </button>

              <button
                onClick={() => navigate("/candidate/applications")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <ArrowLeft size={17} />
                Applications
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          TOP APPLICATION HEADER
      ================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/candidate/applications")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Applications
          </button>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />

            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-100">
                    <Briefcase size={28} className="text-white" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Application Details
                    </p>

                    <h1 className="mt-1 truncate text-2xl font-bold text-slate-900 sm:text-3xl">
                      {application.job_title ||
                        application.title ||
                        application.job_name ||
                        "Job Application"}
                    </h1>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                        <Building2 size={16} className="text-blue-600" />

                        {application.company_name ||
                          application.company ||
                          application.companyName ||
                          "Company"}
                      </span>

                      {application.location && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin size={16} className="text-blue-600" />

                          {application.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold ${statusConfig.className}`}
                >
                  <StatusIcon size={18} />
                  {statusConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">
            {/* Candidate Information */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <SectionTitle
                  icon={<UserRound size={19} />}
                  title="Candidate Information"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Information submitted with your application
                </p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <InfoBox
                  label="Full Name"
                  value={application.candidate_name || application.name}
                  icon={<UserRound size={15} />}
                />

                <InfoBox
                  label="Email"
                  value={application.candidate_email || application.email}
                  icon={<Mail size={15} />}
                />

                <InfoBox
                  label="Phone"
                  value={application.candidate_phone || application.phone}
                  icon={<Phone size={15} />}
                />

                <InfoBox
                  label="Education"
                  value={
                    application.education || application.qualification
                  }
                  icon={<GraduationCap size={15} />}
                />
              </div>
            </section>

            {/* Job Information */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <SectionTitle
                  icon={<Briefcase size={19} />}
                  title="Job Information"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Details of the position you applied for
                </p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <InfoBox
                  label="Company"
                  value={application.company_name || application.company}
                  icon={<Building2 size={15} />}
                />

                <InfoBox
                  label="Location"
                  value={application.location}
                  icon={<MapPin size={15} />}
                />

                <InfoBox
                  label="Job Type"
                  value={application.job_type || application.jobType}
                  icon={<Briefcase size={15} />}
                />

                <InfoBox
                  label="Experience"
                  value={application.experience}
                  icon={<Clock size={15} />}
                />

                <InfoBox
                  label="Salary"
                  value={application.salary}
                  icon={<IndianRupee size={15} />}
                />

                <InfoBox
                  label="Workplace"
                  value={
                    application.workplace_type ||
                    application.work_mode ||
                    application.workplace
                  }
                  icon={<MapPin size={15} />}
                />

                <InfoBox
                  label="Applied On"
                  value={formatDateTime(
                    application.applied_at || application.created_at
                  )}
                  icon={<CalendarDays size={15} />}
                />

                <InfoBox
                  label="Application ID"
                  value={
                    application.application_id || application.id || id
                  }
                  icon={<Hash size={15} />}
                />
              </div>
            </section>

            {/* Job Description */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<FileText size={19} />}
                title="Job Description"
              />

              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                {application.description ||
                  application.job_description ||
                  "No description available."}
              </p>
            </section>

            {/* Responsibilities */}

            {responsibilities.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={<ClipboardList size={19} />}
                  title="Responsibilities"
                />

                <ul className="mt-5 space-y-3">
                  {responsibilities.map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements */}

            {requirements.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={<ListChecks size={19} />}
                  title="Job Requirements"
                />

                <ul className="mt-5 space-y-3">
                  {requirements.map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm leading-6 text-slate-600"
                    >
                      <CheckCircle
                        size={17}
                        className="mt-1 shrink-0 text-blue-600"
                      />

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Skills */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<Code2 size={19} />}
                title="Required Skills"
              />

              <div className="mt-5 flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No skills specified.
                  </p>
                )}
              </div>
            </section>

            {/* Cover Letter */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<FileText size={19} />}
                title="Your Cover Letter"
              />

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {application.cover_letter || "No cover letter provided."}
                </p>
              </div>
            </section>

            {/* Documents */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <SectionTitle
                  icon={<FileText size={19} />}
                  title="Submitted Documents"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Documents submitted with this application
                </p>
              </div>

              <div className="space-y-3 p-6">
                {documents.length > 0 ? (
                  documents.map((document) => (
                    <div
                      key={document.key}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                          <FileText size={20} className="text-red-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {document.title}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {document.description}
                          </p>
                        </div>
                      </div>

                      {document.url && (
                        <div className="flex shrink-0 gap-2">
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={15} />
                            View
                          </a>

                          <a
                            href={document.url}
                            download
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            <Download size={15} />
                            Download
                          </a>

                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-100"
                            title="Open"
                          >
                            <ExternalLink size={15} />
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <FileText
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No documents found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Your submitted resume will appear here.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-6 lg:sticky lg:top-6">
            {/* Status */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Application Status
                </h2>

                <button
                  onClick={() => fetchApplication(true)}
                  disabled={refreshing}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    size={17}
                    className={refreshing ? "animate-spin" : ""}
                  />
                </button>
              </div>

              <div
                className={`mt-5 rounded-xl border p-4 ${statusConfig.className}`}
              >
                <div className="flex items-start gap-3">
                  <StatusIcon size={20} className="mt-0.5" />

                  <div>
                    <p className="font-semibold">
                      {statusConfig.label}
                    </p>

                    <p className="mt-1 text-sm leading-5 opacity-80">
                      {getStatusMessage(application.status)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Timeline */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Application Timeline
              </h2>

              <div className="mt-5 space-y-5">
                <TimelineItem
                  active
                  title="Application Submitted"
                  date={formatDateTime(
                    application.applied_at || application.created_at
                  )}
                />

                <TimelineItem
                  active={reviewStatuses.includes(normalizedStatus)}
                  title="Application Review"
                  date={
                    reviewStatuses.includes(normalizedStatus)
                      ? "Recruiter activity recorded"
                      : "Waiting for recruiter"
                  }
                />

                <TimelineItem
                  active={interviewStatuses.includes(normalizedStatus)}
                  title="Shortlisted / Interview"
                  date={
                    interviewStatuses.includes(normalizedStatus)
                      ? "Application progressed"
                      : "Pending"
                  }
                />

                <TimelineItem
                  active={finalStatuses.includes(normalizedStatus)}
                  title="Final Decision"
                  date={
                    finalStatuses.includes(normalizedStatus)
                      ? statusConfig.label
                      : "Pending"
                  }
                  last
                />
              </div>
            </section>

            {/* Application ID */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Hash size={17} className="text-slate-500" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Application ID
                  </p>

                  <p className="mt-0.5 font-bold text-slate-900">
                    #{application.application_id || application.id || id}
                  </p>
                </div>
              </div>
            </section>

            {/* Security */}

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Your information is secure
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your application details and documents are available only
                    to authorized users.
                  </p>
                </div>
              </div>
            </section>

            {/* Back Button */}

            <button
              onClick={() => navigate("/candidate/applications")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Back to Applications
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

/* =====================================================
   INFO BOX
===================================================== */

const InfoBox = ({ label, value, icon }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words font-semibold text-slate-800">
        {value || "Not specified"}
      </p>
    </div>
  );
};

/* =====================================================
   SECTION TITLE
===================================================== */

const SectionTitle = ({ icon, title }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
        <span className="text-blue-600">{icon}</span>
      </div>

      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    </div>
  );
};

/* =====================================================
   TIMELINE ITEM
===================================================== */

const TimelineItem = ({ active, title, date, last = false }) => {
  return (
    <div className="relative flex gap-3">
      {!last && (
        <div className="absolute left-[9px] top-5 h-full w-px bg-slate-200" />
      )}

      <div
        className={`relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-full border-4 border-white ${
          active
            ? "bg-blue-600 ring-1 ring-blue-100"
            : "bg-slate-300"
        }`}
      />

      <div className="min-w-0">
        <p
          className={`text-sm font-semibold ${
            active ? "text-slate-800" : "text-slate-400"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">{date}</p>
      </div>
    </div>
  );
};

export default ApplicationDetails;