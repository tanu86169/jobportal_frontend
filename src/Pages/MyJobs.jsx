import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  BriefcaseBusiness,
  MapPin,
  Users,
  Eye,
  CalendarDays,
  MoreVertical,
  Edit3,
  Trash2,
  PlayCircle,
  ChevronDown,
  Filter,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import API_BASE from "../Config/api";

const GET_MY_JOBS_API = `${API_BASE}/jobs/get-my-jobs.php`;

const GET_RECRUITER_APPLICATIONS_API =
  `${API_BASE}/applications/get-recruiter-applications.php`;

const DELETE_JOB_API = `${API_BASE}/jobs/delete.php`;

const UPDATE_STATUS_API = `${API_BASE}/jobs/update-status.php`;

const MyJobs = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState("top");

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const getUser = () => {
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

  // =========================================================
  // FORMAT POSTED DATE
  // =========================================================

  const formatPostedDate = (dateString) => {
    if (!dateString) {
      return "Recently";
    }

    const normalizedDate = String(dateString).replace(" ", "T");
    const date = new Date(normalizedDate);

    if (isNaN(date.getTime())) {
      return "Recently";
    }

    const now = new Date();
    const difference = now.getTime() - date.getTime();

    if (difference < 0) {
      return "Recently";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return "today";
    }

    if (days === 1) {
      return "1 day ago";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    const weeks = Math.floor(days / 7);

    if (weeks === 1) {
      return "1 week ago";
    }

    if (weeks < 4) {
      return `${weeks} weeks ago`;
    }

    const months = Math.floor(days / 30);

    if (months === 1) {
      return "1 month ago";
    }

    return `${months} months ago`;
  };

  // =========================================================
  // FORMAT DEADLINE
  // =========================================================

  const formatDeadline = (dateString) => {
    if (!dateString) {
      return "No deadline";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT SKILLS
  // =========================================================

  const formatSkills = (skills) => {
    if (Array.isArray(skills)) {
      return skills.map((skill) => String(skill).trim()).filter(Boolean);
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  // =========================================================
  // FETCH MY JOBS + APPLICATIONS
  // =========================================================

  const fetchMyJobs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const user = getUser();

      if (!user) {
        setError("Please login first.");
        setJobs([]);
        return;
      }

      const recruiterId = Number(user.id);

      if (!recruiterId) {
        setError("Recruiter ID not found.");
        setJobs([]);
        return;
      }

      if (
        String(user.role || "")
          .toLowerCase()
          .trim() !== "recruiter"
      ) {
        setError("Only recruiters can view their jobs.");
        setJobs([]);
        return;
      }

      // =====================================================
      // FETCH JOBS
      // =====================================================

      const jobsResponse = await fetch(
        `${GET_MY_JOBS_API}?recruiterId=${recruiterId}`,
      );

      if (!jobsResponse.ok) {
        throw new Error(`Jobs server error: ${jobsResponse.status}`);
      }

      const jobsData = await jobsResponse.json();

      console.log("My Jobs API Response:", jobsData);

      if (!jobsData.success) {
        throw new Error(jobsData.message || "Failed to fetch jobs");
      }

      // =====================================================
      // FETCH RECRUITER APPLICATIONS
      // =====================================================

      let applications = [];

      try {
        const applicationsResponse = await fetch(
          `${GET_RECRUITER_APPLICATIONS_API}?recruiterId=${recruiterId}`,
        );

        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();

          console.log("Recruiter Applications API Response:", applicationsData);

          if (applicationsData.success) {
            applications = applicationsData.applications || [];
          }
        } else {
          console.warn("Applications API failed:", applicationsResponse.status);
        }
      } catch (applicationError) {
        console.warn("Applications API Error:", applicationError);
      }

      // =====================================================
      // COUNT APPLICATIONS PER JOB
      // =====================================================

      const applicantCountByJob = {};

      applications.forEach((application) => {
        const jobId = Number(
          application.job_id ?? application.jobId ?? application.job?.id,
        );

        if (!jobId) {
          return;
        }

        applicantCountByJob[jobId] = (applicantCountByJob[jobId] || 0) + 1;
      });

      console.log("Applicant Count By Job:", applicantCountByJob);

      // =====================================================
      // FORMAT JOBS
      // =====================================================

      const formattedJobs = (jobsData.jobs || []).map((job) => {
        const jobId = Number(job.id);

        let formattedStatus = "Active";

        if (String(job.status).toLowerCase() === "closed") {
          formattedStatus = "Closed";
        } else {
          formattedStatus = "Active";
        }

        return {
          id: jobId,

          title: job.job_title || job.title || "Untitled Job",

          category: job.category || "IT & Software",

          companyName: job.company_name || job.companyName || "",

          location: job.location || "Not specified",

          type: job.job_type || job.type || "Full Time",

          workplace: job.workplace || job.workplace_type || "Not specified",

          experience: job.experience || "Fresher",

          salary: job.salary || "Salary not specified",

          // REAL APPLICANT COUNT
          applicants: applicantCountByJob[jobId] || 0,

          // Backend view tracking not available yet
          views: Number(job.views || 0),

          posted: formatPostedDate(job.created_at),

          deadline: formatDeadline(job.deadline),

          status: formattedStatus,

          skills: formatSkills(job.skills),

          description: job.description || "",
        };
      });

      setJobs(formattedJobs);
    } catch (error) {
      console.error("Fetch My Jobs Error:", error);

      setError(error.message || "Something went wrong while fetching jobs.");

      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // LOAD JOBS
  // =========================================================

  useEffect(() => {
    fetchMyJobs();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchMyJobs(true);
  };

  // =========================================================
  // DELETE JOB
  // =========================================================

  const deleteJob = async (job) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${job.title}"?`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const user = getUser();

      if (!user || !user.id) {
        alert("Please login as recruiter.");
        navigate("/login");
        return;
      }

      if (
        String(user.role || "")
          .toLowerCase()
          .trim() !== "recruiter"
      ) {
        alert("Only recruiter can delete jobs.");
        return;
      }

      setOpenMenu(null);

      const response = await fetch(DELETE_JOB_API, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          job_id: Number(job.id),
          recruiter_id: Number(user.id),
        }),
      });

      const data = await response.json();

      console.log("Delete Job Response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete job");
      }

      setJobs((prevJobs) => prevJobs.filter((item) => item.id !== job.id));

      alert("Job deleted successfully.");
    } catch (error) {
      console.error("Delete Job Error:", error);

      alert(error.message || "Something went wrong while deleting the job.");
    }
  };

  // =========================================================
  // VIEW JOB
  // =========================================================

  const viewJob = (job) => {
    setOpenMenu(null);

    if (!job.id) {
      alert("Job ID not found.");
      return;
    }

    navigate(`/jobs/${job.id}`);
  };

  // =========================================================
  // EDIT JOB
  // =========================================================

  const editJob = (job) => {
    setOpenMenu(null);

    if (!job.id) {
      alert("Job ID not found.");
      return;
    }

    navigate(`/recruiter/edit-job/${job.id}`);
  };

  // =========================================================
  // VIEW APPLICANTS
  // =========================================================

  const viewApplicants = (job) => {
    setOpenMenu(null);

    navigate("/recruiter/applicants", {
      state: {
        jobId: job.id,
      },
    });
  };

  // =========================================================
  // CLOSE / ACTIVATE JOB
  // =========================================================

  const toggleJobStatus = async (job) => {
    try {
      setOpenMenu(null);

      const user = getUser();

      if (!user || !user.id) {
        alert("Please login as recruiter.");
        navigate("/login");
        return;
      }

      if (
        String(user.role || "")
          .toLowerCase()
          .trim() !== "recruiter"
      ) {
        alert("Only recruiter can change job status.");
        return;
      }

      const newStatus = job.status === "Active" ? "closed" : "active";

      const confirmMessage =
        newStatus === "closed"
          ? `Are you sure you want to close "${job.title}"?`
          : `Do you want to activate "${job.title}" again?`;

      const confirmed = window.confirm(confirmMessage);

      if (!confirmed) {
        return;
      }

      const response = await fetch(UPDATE_STATUS_API, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          job_id: Number(job.id),
          recruiter_id: Number(user.id),
          status: newStatus,
        }),
      });

      const data = await response.json();

      console.log("Update Status Response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update job status");
      }

      setJobs((prevJobs) =>
        prevJobs.map((item) =>
          item.id === job.id
            ? {
                ...item,
                status: newStatus === "active" ? "Active" : "Closed",
              }
            : item,
        ),
      );

      alert(
        newStatus === "active"
          ? "Job activated successfully."
          : "Job closed successfully.",
      );
    } catch (error) {
      console.error("Update Status Error:", error);

      alert(error.message || "Something went wrong while updating the job.");
    }
  };

  // =========================================================
  // HANDLE MENU TOGGLE WITH SMART POSITION
  // =========================================================

  const handleMenuToggle = (e, jobId) => {
    e.stopPropagation();

    if (openMenu === jobId) {
      setOpenMenu(null);
      return;
    }

    // Check if row is near bottom of viewport
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // If button is in lower half of viewport, open menu upward
    const shouldOpenUpward = rect.bottom > viewportHeight * 0.6;

    setMenuPosition(shouldOpenUpward ? "bottom" : "top");
    setOpenMenu(jobId);
  };

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    return {
      total: jobs.length,

      active: jobs.filter((job) => job.status === "Active").length,

      closed: jobs.filter((job) => job.status === "Closed").length,

      applicants: jobs.reduce(
        (sum, job) => sum + Number(job.applicants || 0),
        0,
      ),

      views: jobs.reduce((sum, job) => sum + Number(job.views || 0), 0),
    };
  }, [jobs]);

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredJobs = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchText) ||
        job.location.toLowerCase().includes(searchText) ||
        job.category.toLowerCase().includes(searchText) ||
        job.companyName.toLowerCase().includes(searchText) ||
        job.type.toLowerCase().includes(searchText) ||
        job.experience.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  // =========================================================
  // STATUS CONFIG
  // =========================================================

  const statusConfig = {
    Active: {
      className: "bg-emerald-50 text-emerald-600",
      dot: "bg-emerald-500",
    },

    Closed: {
      className: "bg-gray-100 text-gray-500",
      dot: "bg-gray-400",
    },
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900"
      onClick={() => setOpenMenu(null)}
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="relative mx-4 mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:mx-6">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-indigo-100/50 blur-3xl" />
        </div>

        <div className="relative px-5 py-5 sm:px-6 lg:px-7">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT CONTENT */}
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
                <BriefcaseBusiness size={22} strokeWidth={2} />
              </div>

              <div>

                <div className="mb-1 flex items-center gap-2 text-[11px] font-medium">
                  <span className="text-gray-400">Recruiter</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-blue-600">My Jobs</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    My Jobs
                  </h1>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                    {stats.total} {stats.total === 1 ? "Job" : "Jobs"}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Manage, monitor and track your job postings.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {stats.active} Active
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-600">
                      {stats.closed} Closed
                    </span>
                  </div>

                  <div className="hidden items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 sm:flex">
                    <Users size={12} className="text-violet-500" />
                    <span className="text-[11px] font-semibold text-violet-700">
                      {stats.applicants} Applicants
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-3">

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                disabled={loading || refreshing}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                title="Refresh jobs"
              >
                <RefreshCw
                  size={16}
                  className={`transition-transform ${
                    refreshing
                      ? "animate-spin"
                      : "group-hover:rotate-90"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/recruiter/post-job");
                }}
                className="group flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg sm:px-5"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <Plus
                    size={15}
                    className="transition-transform group-hover:rotate-90"
                  />
                </span>

                <span>
                  <span className="hidden sm:inline">Post a Job</span>
                  <span className="sm:hidden">Post</span>
                </span>

              </button>

            </div>

          </div>

        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-[1600px] p-4 sm:p-5 lg:p-7">

        {/* ===================================================
            STATS
        ==================================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? ["Total Jobs", "Active Jobs", "Applicants", "Total Views"].map(
                (label) => (
                  <div
                    key={label}
                    className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-full">
                        <div className="h-3 w-20 rounded bg-gray-200" />
                        <div className="mt-3 h-8 w-14 rounded bg-gray-200" />
                      </div>
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />
                    </div>
                    <div className="mt-3 h-3 w-28 rounded bg-gray-100" />
                  </div>
                ),
              )
            : (
                <>
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-400">Total Jobs</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                          {stats.total}
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BriefcaseBusiness size={19} />
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-gray-400">All posted jobs</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-400">Active Jobs</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                          {stats.active}
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={19} />
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-emerald-600">
                      Currently hiring
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-400">Applicants</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                          {stats.applicants}
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Users size={19} />
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-gray-400">Across all jobs</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-400">Total Views</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                          {stats.views.toLocaleString()}
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Eye size={19} />
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-gray-400">
                      Job profile views
                    </p>
                  </div>
                </>
              )}
        </div>

        {/* ===================================================
            JOB LIST
        ==================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Section Header */}

          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Job Postings
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {loading
                    ? "Loading jobs..."
                    : `${filteredJobs.length} jobs found`}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Search jobs..."
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 sm:w-64"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm text-gray-600 outline-none transition focus:border-blue-500 focus:bg-white sm:w-36"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="animate-pulse">
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      {[
                        "Job",
                        "Details",
                        "Applicants",
                        "Views",
                        "Deadline",
                        "Status",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-300"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <tr key={item} className="border-b border-gray-100">
                        <td className="px-6 py-5">
                          <div className="flex gap-3">
                            <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-36 rounded bg-gray-200" />
                              <div className="h-3 w-24 rounded bg-gray-100" />
                              <div className="h-3 w-28 rounded bg-gray-100" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="space-y-3">
                            <div className="h-3 w-28 rounded bg-gray-200" />
                            <div className="h-3 w-20 rounded bg-gray-100" />
                            <div className="h-3 w-24 rounded bg-gray-200" />
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="mx-auto h-5 w-8 rounded bg-gray-200" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="mx-auto h-4 w-10 rounded bg-gray-200" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-3 w-24 rounded bg-gray-200" />
                          <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-7 w-16 rounded-lg bg-gray-200" />
                        </td>
                        <td className="px-5 py-5">
                          <div className="ml-auto h-8 w-8 rounded-lg bg-gray-100" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-100 lg:hidden">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-40 max-w-full rounded bg-gray-200" />
                        <div className="h-3 w-24 rounded bg-gray-100" />
                        <div className="h-3 w-32 rounded bg-gray-100" />
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-gray-100" />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[1, 2, 3, 4].map((box) => (
                        <div key={box} className="rounded-xl bg-gray-100 p-3">
                          <div className="h-3 w-16 rounded bg-gray-200" />
                          <div className="mt-2 h-3 w-20 max-w-full rounded bg-gray-200" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <div className="h-8 w-16 rounded-lg bg-gray-100" />
                      <div className="h-8 w-16 rounded-lg bg-gray-100" />
                      <div className="h-8 w-24 rounded-lg bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertCircle size={25} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-gray-800">
                Unable to load jobs
              </h3>

              <p className="mt-1 max-w-md text-xs leading-5 text-gray-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchMyJobs()}
                className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* =================================================
              JOB CONTENT
          ================================================== */}

          {!loading && !error && (
            <>
              {/* ===========================================
                  DESKTOP TABLE - WITH STICKY ACTION COLUMN
              ============================================ */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Job
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Details
                      </th>

                      <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Applicants
                      </th>

                      <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Views
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Deadline
                      </th>

                      <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Status
                      </th>

                      {/* STICKY ACTION COLUMN */}
                      <th className="sticky right-0 z-20 w-[80px] border-l border-gray-100 bg-gray-50/70 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <tr
                          key={job.id}
                          className="group border-b border-gray-100 last:border-0 transition hover:bg-gray-50/60"
                        >
                          {/* JOB */}

                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BriefcaseBusiness size={19} />
                              </div>

                              <div className="min-w-0">
                                <h3 className="max-w-[250px] truncate text-sm font-bold text-gray-900">
                                  {job.title}
                                </h3>

                                <p className="mt-1 text-xs text-gray-400">
                                  {job.category}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {job.skills
                                    .slice(0, 3)
                                    .map((skill, index) => (
                                      <span
                                        key={`${skill}-${index}`}
                                        className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* DETAILS */}

                          <td className="px-4 py-5">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="max-w-[180px] truncate">
                                  {job.location}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <BriefcaseBusiness
                                  size={14}
                                  className="text-gray-400"
                                />
                                {job.type}
                              </div>

                              <div className="text-xs font-semibold text-gray-700">
                                {job.salary}
                              </div>
                            </div>
                          </td>

                          {/* APPLICANTS */}

                          <td className="px-4 py-5 text-center">
                            <button
                              type="button"
                              onClick={() => viewApplicants(job)}
                              className="group/app inline-flex flex-col items-center"
                            >
                              <span className="text-sm font-bold text-gray-900 group-hover/app:text-blue-600">
                                {job.applicants}
                              </span>

                              <span className="mt-1 text-[10px] text-gray-400 group-hover/app:text-blue-500">
                                applicants
                              </span>
                            </button>
                          </td>

                          {/* VIEWS */}

                          <td className="px-4 py-5 text-center">
                            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                              <Eye size={14} className="text-gray-400" />
                              {job.views.toLocaleString()}
                            </div>
                          </td>

                          {/* DEADLINE */}

                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <CalendarDays
                                size={14}
                                className="text-gray-400"
                              />
                              {job.deadline}
                            </div>

                            <p className="mt-1 text-[10px] text-gray-400">
                              Posted {job.posted}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-5">
                            <JobStatus
                              status={job.status}
                              statusConfig={statusConfig}
                            />
                          </td>

                          {/* STICKY ACTION COLUMN */}
                          <td className="sticky right-0 z-10 w-[80px] border-l border-gray-100 bg-white px-5 py-5 text-center group-hover:bg-gray-50">
                            <div
                              className="relative inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => handleMenuToggle(e, job.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                title="Actions"
                              >
                                <MoreVertical size={18} />
                              </button>

                              {openMenu === job.id && (
                                <JobActionMenu
                                  job={job}
                                  position={menuPosition}
                                  onView={() => viewJob(job)}
                                  onEdit={() => editJob(job)}
                                  onApplicants={() => viewApplicants(job)}
                                  onToggle={() => toggleJobStatus(job)}
                                  onDelete={() => deleteJob(job)}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-16 text-center">
                          <EmptyState
                            hasSearch={
                              Boolean(search) || statusFilter !== "All"
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* =========================================
                  MOBILE / TABLET
              ========================================== */}

              <div className="divide-y divide-gray-100 lg:hidden">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 transition hover:bg-gray-50/60 sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <BriefcaseBusiness size={19} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-gray-900">
                              {job.title}
                            </h3>

                            <p className="mt-1 text-xs text-gray-400">
                              {job.category}
                            </p>

                            <p className="mt-1 text-xs font-medium text-gray-500">
                              {job.companyName}
                            </p>
                          </div>
                        </div>

                        <div
                          className="relative shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleMenuToggle(e, job.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenu === job.id && (
                            <JobActionMenu
                              job={job}
                              position={menuPosition}
                              onView={() => viewJob(job)}
                              onEdit={() => editJob(job)}
                              onApplicants={() => viewApplicants(job)}
                              onToggle={() => toggleJobStatus(job)}
                              onDelete={() => deleteJob(job)}
                            />
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <MapPin size={13} />
                            Location
                          </div>

                          <p className="mt-1 truncate text-xs font-semibold text-gray-700">
                            {job.location}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => viewApplicants(job)}
                          className="rounded-xl bg-gray-50 p-3 text-left transition hover:bg-blue-50"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <Users size={13} />
                            Applicants
                          </div>

                          <p className="mt-1 text-xs font-semibold text-gray-700">
                            {job.applicants}
                          </p>
                        </button>

                        <div className="rounded-xl bg-gray-50 p-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <Eye size={13} />
                            Views
                          </div>

                          <p className="mt-1 text-xs font-semibold text-gray-700">
                            {job.views.toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <CalendarDays size={13} />
                            Deadline
                          </div>

                          <p className="mt-1 truncate text-xs font-semibold text-gray-700">
                            {job.deadline}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <JobStatus
                          status={job.status}
                          statusConfig={statusConfig}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => viewJob(job)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => editJob(job)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => viewApplicants(job)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
                        >
                          <Users size={14} />
                          Applicants
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-16">
                    <EmptyState
                      hasSearch={Boolean(search) || statusFilter !== "All"}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* ===================================================
            BOTTOM INFO
        ==================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                <ArrowUpRight size={18} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-blue-800">
                  Improve your job reach
                </h3>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Add complete job details, relevant skills and salary
                  information to attract more qualified candidates.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                <Clock3 size={18} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Keep your postings updated
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Close positions that are no longer hiring and keep active jobs
                  updated for better candidate engagement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* =========================================================
   JOB STATUS
========================================================= */

const JobStatus = ({ status, statusConfig }) => {
  const config = statusConfig[status] || statusConfig.Active;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};

/* =========================================================
   ACTION MENU - WITH SMART POSITIONING
========================================================= */

const JobActionMenu = ({
  job,
  position = "top",
  onView,
  onEdit,
  onApplicants,
  onToggle,
  onDelete,
}) => {
  const positionClass =
    position === "bottom"
      ? "bottom-10 right-0"
      : "top-10 right-0";

  return (
    <div
      className={`absolute ${positionClass} z-50 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 text-left shadow-xl`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* View */}

      <button
        type="button"
        onClick={onView}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
      >
        <Eye size={15} />
        View Job
      </button>

      {/* Applicants */}

      <button
        type="button"
        onClick={onApplicants}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
      >
        <Users size={15} />
        Applicants
      </button>

      {/* Edit */}

      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
      >
        <Edit3 size={15} />
        Edit Job
      </button>

      {/* Close / Activate */}

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
      >
        {job.status === "Active" ? (
          <>
            <XCircle size={15} />
            Close Job
          </>
        ) : (
          <>
            <PlayCircle size={15} />
            Activate Job
          </>
        )}
      </button>

      <div className="my-1 border-t border-gray-100" />

      {/* Delete */}

      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
      >
        <Trash2 size={15} />
        Delete Job
      </button>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ hasSearch }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
        <BriefcaseBusiness size={25} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-gray-800">
        {hasSearch ? "No jobs found" : "No jobs posted yet"}
      </h3>

      <p className="mt-1 max-w-xs text-center text-xs leading-5 text-gray-400">
        {hasSearch
          ? "Try changing your search or status filter."
          : "Post your first job to start receiving applications."}
      </p>
    </div>
  );
};

export default MyJobs;