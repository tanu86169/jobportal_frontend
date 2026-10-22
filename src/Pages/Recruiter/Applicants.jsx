
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  CalendarDays,
  Eye,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";

import API_BASE from "../../Config/api";

// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_STYLES = {
  Shortlisted: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  Hired: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  Interview: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  Screening: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  Applied: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
};

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || STATUS_STYLES.Applied;

// =====================================================
// COMPONENT
// =====================================================

const Applicants = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // =====================================================
  // GET LOGGED-IN RECRUITER ID
  // =====================================================

  const getRecruiterId = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return null;

      const user = JSON.parse(storedUser);

      const recruiterId =
        user?.id ||
        user?.userId ||
        user?.user_id ||
        localStorage.getItem("recruiterId");

      return recruiterId ? Number(recruiterId) : null;
    } catch (error) {
      console.error("User parse error:", error);
      return null;
    }
  };

  // =====================================================
  // FETCH RECRUITER APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const recruiterId = getRecruiterId();

      if (!recruiterId || !Number.isFinite(recruiterId)) {
        setError("Recruiter information not found. Please login again.");
        setApplications([]);
        return;
      }

      const response = await axios.get(
        `${API_BASE}/applications/get-recruiter-applications.php`,
        {
          params: {
            recruiterId,
          },
        }
      );

      if (response.data?.success) {
        const list = Array.isArray(response.data.applications)
          ? response.data.applications
          : [];

        setApplications(list);
      } else {
        setApplications([]);
        setError(
          response.data?.message || "Failed to fetch applications."
        );
      }
    } catch (err) {
      console.error("Applications Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to fetch applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredApplications = applications.filter((application) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    const candidateName = String(
      application.candidate_name || ""
    ).toLowerCase();

    const candidateEmail = String(
      application.candidate_email || ""
    ).toLowerCase();

    const jobTitle = String(
      application.job_title || ""
    ).toLowerCase();

    const companyName = String(
      application.company_name || ""
    ).toLowerCase();

    return (
      candidateName.includes(searchText) ||
      candidateEmail.includes(searchText) ||
      jobTitle.includes(searchText) ||
      companyName.includes(searchText)
    );
  });

  // =====================================================
  // STATS
  // =====================================================

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(
      (application) => application.status === "Shortlisted"
    ).length,
    pending: applications.filter(
      (application) =>
        !application.status || application.status === "Applied"
    ).length,
  };

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);

      const response = await fetch(
        `${API_BASE}/applications/update-status.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_id: Number(applicationId),
            status,
          }),
        }
      );

      const rawResponse = await response.text();

      let data;

      try {
        data = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error("Status JSON Parse Error:", parseError);
        alert("Server returned an invalid response. Please check PHP.");
        return;
      }

      if (!response.ok || !data?.success) {
        alert(data?.message || "Failed to update application status.");
        return;
      }

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          Number(application.application_id) === Number(applicationId)
            ? { ...application, status }
            : application
        )
      );

      alert(`Application ${status} successfully!`);
    } catch (error) {
      console.error("Status Update Error:", error);
      alert("Something went wrong while updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // MESSAGE CANDIDATE
  // =====================================================

  const messageCandidate = (application) => {
    const candidateId = Number(application?.candidate_id);

    if (!candidateId) {
      alert("Candidate information not found for this application.");
      console.error("Candidate ID missing:", application);
      return;
    }

    const candidateName = application?.candidate_name || "Candidate";
    const candidateEmail = application?.candidate_email || "";

    const messageUrl =
      `/recruiter/messages` +
      `?candidateId=${candidateId}` +
      `&candidateName=${encodeURIComponent(candidateName)}` +
      `&candidateEmail=${encodeURIComponent(candidateEmail)}`;

    navigate(messageUrl);
  };

  // =====================================================
  // LOADING SKELETON
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-48 rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-200" />
                <div className="mt-4 h-8 w-20 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
              </div>
            ))}
          </div>

          <div className="mb-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-12 w-full rounded-xl bg-slate-100" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 rounded bg-slate-200" />
                    <div className="h-3 w-64 rounded bg-slate-100" />
                    <div className="h-3 w-40 rounded bg-slate-100" />
                  </div>
                  <div className="h-7 w-24 rounded-full bg-slate-100" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((itemIndex) => (
                    <div key={itemIndex} className="space-y-2">
                      <div className="h-3 w-20 rounded bg-slate-100" />
                      <div className="h-4 w-28 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Users size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Applicants
              </h1>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Manage job seekers who have applied for your jobs.
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Applications",
              value: stats.total,
              icon: Users,
              accent: "from-blue-600 to-indigo-600",
            },
            {
              label: "Shortlisted",
              value: stats.shortlisted,
              icon: CheckCircle,
              accent: "from-emerald-600 to-teal-600",
            },
            {
              label: "Pending Review",
              value: stats.pending,
              icon: Clock,
              accent: "from-amber-500 to-orange-500",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accent} text-white shadow-sm`}
                  >
                    <Icon size={20} />
                  </div>

                  <TrendingUp
                    size={18}
                    className="text-slate-300 transition group-hover:text-slate-400"
                  />
                </div>

                <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* SEARCH */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search by candidate name, email, job title, or company..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertCircle size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-red-900">
                Something went wrong
              </p>
              <p className="mt-0.5 text-sm leading-6 text-red-800">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchApplications}
                className="mt-3 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && filteredApplications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <User size={30} />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-800">
              {search ? "No matching applicants" : "No applicants yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try adjusting your search terms or clear the search to see all applicants."
                : "Once candidates start applying to your job postings, they'll appear here."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <XCircle size={15} />
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* APPLICATION CARDS */}

        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const isUpdating =
              Number(updatingId) === Number(application.application_id);

            const applicationStatus = application.status || "Applied";
            const statusStyle = getStatusStyle(applicationStatus);

            const initials = String(
              application.candidate_name || "U"
            )
              .trim()
              .split(/\s+/)
              .map((word) => word[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={application.application_id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                {/* CANDIDATE + STATUS */}

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-blue-500/20">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-black text-slate-900">
                          {application.candidate_name || "Unknown Candidate"}
                        </h2>

                        <div className="mt-2 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} className="shrink-0" />
                            <span className="break-all">
                              {application.candidate_email || "No email"}
                            </span>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Phone size={14} className="shrink-0" />
                            {application.candidate_phone || "No phone"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-black uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                      />
                      {applicationStatus}
                    </span>
                  </div>

                  {/* JOB INFORMATION */}

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 lg:grid-cols-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Applied For
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <Briefcase size={15} className="shrink-0 text-blue-600" />
                        <span className="truncate text-sm font-bold text-slate-800">
                          {application.job_title || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Location
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <MapPin size={15} className="shrink-0 text-rose-500" />
                        <span className="truncate text-sm font-bold text-slate-800">
                          {application.location || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Experience
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <Briefcase size={15} className="shrink-0 text-violet-500" />
                        <span className="truncate text-sm font-bold text-slate-800">
                          {application.experience || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Applied On
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <CalendarDays size={15} className="shrink-0 text-emerald-600" />
                        <span className="truncate text-sm font-bold text-slate-800">
                          {application.applied_at || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SKILLS */}

                  {Array.isArray(application.skills) &&
                    application.skills.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Skills
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {application.skills.map((skill, index) => (
                            <span
                              key={`${application.application_id}-${index}`}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* FOOTER — ID HIDDEN, ACTIONS KEPT */}

                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                    <div className="flex flex-wrap items-center gap-2">
                      {applicationStatus !== "Shortlisted" &&
                        applicationStatus !== "Rejected" &&
                        applicationStatus !== "Hired" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateApplicationStatus(
                                application.application_id,
                                "Shortlisted"
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdating ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <CheckCircle size={15} />
                            )}
                            Shortlist
                          </button>
                        )}

                      {applicationStatus !== "Rejected" &&
                        applicationStatus !== "Hired" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateApplicationStatus(
                                application.application_id,
                                "Rejected"
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdating ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <XCircle size={15} />
                            )}
                            Reject
                          </button>
                        )}

                      <button
                        type="button"
                        onClick={() => messageCandidate(application)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                      >
                        <MessageCircle size={15} />
                        Message
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/recruiter/applicant/${application.application_id}`,
                            {
                              state: { application },
                            }
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
                      >
                        <Eye size={15} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Applicants;