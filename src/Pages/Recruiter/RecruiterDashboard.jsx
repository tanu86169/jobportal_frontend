import React, { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Users,
  Bell,
  PlusCircle,
  Eye,
  MapPin,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  Clock3,
  MoreVertical,
} from "lucide-react";
import { useNavigate, Link, useOutletContext } from "react-router-dom";

import API_BASE from "../../Config/api";

const GET_MY_JOBS_API = `${API_BASE}/jobs/get-my-jobs.php`;

const GET_RECRUITER_APPLICATIONS_API = `${API_BASE}/applications/get-recruiter-applications.php`;

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const contextUser = outletContext?.user;

  const [user, setUser] = useState(contextUser || null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (
        !storedUser?.id ||
        String(storedUser.role || "")
          .toLowerCase()
          .trim() !== "recruiter"
      ) {
        navigate("/login");
        return;
      }
      setUser(storedUser);
    } catch {
      navigate("/login");
    }
  }, [contextUser, navigate]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${GET_MY_JOBS_API}?recruiterId=${Number(user.id)}`,
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch jobs");
        }

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (error) {
        console.error("Fetch Jobs Error:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchApplications = async () => {
      try {
        setApplicationsLoading(true);
        const response = await fetch(
          `${GET_RECRUITER_APPLICATIONS_API}?recruiterId=${Number(user.id)}`,
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch applications");
        }

        setApplications(
          Array.isArray(data.applications) ? data.applications : [],
        );
      } catch (error) {
        console.error("Fetch Applications Error:", error);
        setApplications([]);
      } finally {
        setApplicationsLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const stats = useMemo(() => {
    const statusCount = (value) =>
      applications.filter(
        (item) => String(item.status || "").toLowerCase() === value,
      ).length;

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(
        (job) => String(job.status || "").toLowerCase() === "active",
      ).length,
      closedJobs: jobs.filter(
        (job) => String(job.status || "").toLowerCase() === "closed",
      ).length,
      totalApplicants: applications.length,
      shortlisted: statusCount("shortlisted"),
      hired: statusCount("hired"),
      rejected: statusCount("rejected"),
      totalViews: jobs.reduce(
        (total, job) => total + Number(job.views || 0),
        0,
      ),
    };
  }, [jobs, applications]);

  const recentJobs = useMemo(
    () =>
      [...jobs]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0),
        )
        .slice(0, 5),
    [jobs],
  );

  const recentApplicants = useMemo(
    () =>
      [...applications]
        .sort(
          (a, b) =>
            new Date(b.applied_at || b.appliedAt || b.created_at || 0) -
            new Date(a.applied_at || a.appliedAt || a.created_at || 0),
        )
        .slice(0, 5),
    [applications],
  );

  const formatDate = (date) => {
    if (!date) return "Recently";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Recently";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getApplicantCount = (jobId) =>
    applications.filter(
      (application) =>
        Number(application.job_id ?? application.jobId) === Number(jobId),
    ).length;

  const getStatusClass = (status) => {
    const value = String(status || "Applied").toLowerCase();

    if (value === "shortlisted") return "bg-green-50 text-green-700";
    if (value === "rejected") return "bg-red-50 text-red-700";
    if (value === "hired") return "bg-purple-50 text-purple-700";
    return "bg-blue-50 text-blue-700";
  };

  const statIconClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] animate-pulse bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-screen-2xl space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8">
            <div className="h-4 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-8 w-64 max-w-full rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-9 w-16 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
              <div className="h-6 w-40 rounded bg-slate-200" />
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-xl bg-slate-50 p-5">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                  <div className="mt-4 h-3 w-2/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="h-6 w-32 rounded bg-slate-200" />
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-slate-50">
      <div className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 lg:p-8">
        <div className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-600/15 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-blue-100">Recruiter workspace</p>
              <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">
                {user.name || "Recruiter"} 👋
              </h1>
              <p className="mt-2 text-sm text-blue-100 sm:text-base">
                Manage your jobs, candidates and hiring pipeline from one place.
              </p>
            </div>

            <Link
              to="/recruiter/post-job"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
            >
              <PlusCircle size={18} />
              Post a New Job
            </Link>
          </div>
        </div>

        <div className="mb-7 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading || applicationsLoading
            ? ["Total Jobs", "Active Jobs", "Applicants", "Job Views"].map(
                (label) => (
                  <div
                    key={label}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="mt-4 h-9 w-16 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
                  </div>
                ),
              )
            : [
                [
                  "Total Jobs",
                  stats.totalJobs,
                  "All posted jobs",
                  BriefcaseBusiness,
                  "blue",
                ],
                [
                  "Active Jobs",
                  stats.activeJobs,
                  "Currently hiring",
                  CheckCircle2,
                  "green",
                ],
                [
                  "Applicants",
                  stats.totalApplicants,
                  "Total applications",
                  Users,
                  "purple",
                ],
                [
                  "Job Views",
                  stats.totalViews,
                  "Total job views",
                  Eye,
                  "orange",
                ],
              ].map(([label, value, description, Icon, color]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{label}</p>
                      <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        {value}
                      </h2>
                      <p className="mt-2 text-xs text-gray-500">
                        {description}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${statIconClasses[color]}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </div>
              ))}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white xl:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900">Recent Jobs</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your latest posted jobs
                </p>
              </div>

              <Link
                to="/recruiter/my-jobs"
                className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600"
              >
                View All <ArrowUpRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse divide-y divide-gray-100">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />

                      <div className="min-w-0 flex-1">
                        <div className="h-5 w-3/4 rounded bg-slate-200" />
                        <div className="mt-3 h-4 w-2/5 rounded bg-slate-100" />

                        <div className="mt-4 flex flex-wrap gap-3">
                          <div className="h-3 w-28 rounded bg-slate-100" />
                          <div className="h-3 w-24 rounded bg-slate-100" />
                        </div>
                      </div>

                      <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100" />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <div className="h-6 w-16 rounded-full bg-slate-200" />
                      <div className="h-6 w-24 rounded bg-slate-100" />
                      <div className="h-6 w-16 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="p-10 text-center">
                <BriefcaseBusiness
                  className="mx-auto mb-3 text-gray-400"
                  size={30}
                />
                <h3 className="font-semibold text-gray-900">
                  No jobs posted yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Post your first job to start hiring.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentJobs.map((job) => {
                  const status = String(job.status || "").toLowerCase();

                  return (
                    <div key={job.id} className="min-w-0 p-5 hover:bg-gray-50">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <BriefcaseBusiness size={20} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words font-semibold text-gray-900">
                              {job.job_title || job.title || "Untitled Job"}
                            </h3>
                            <p className="mt-1 break-words text-sm text-gray-500">
                              {job.company_name || job.company || "Company"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {job.location || "Location not specified"}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarDays size={14} />
                                {formatDate(job.created_at || job.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/recruiter/edit-job/${job.id}`)
                          }
                          className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                        <span
                          className={`rounded-full px-2.5 py-1 font-semibold ${status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {status === "active" ? "Active" : "Closed"}
                        </span>

                        <button
                          type="button"
                          onClick={() => navigate("/recruiter/applicants")}
                          className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                        >
                          <Users size={14} />
                          {getApplicantCount(job.id)} Applicants
                        </button>

                        <span className="flex items-center gap-1 text-gray-500">
                          <Eye size={14} />
                          {Number(job.views || 0)} Views
                        </span>

                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock3 size={14} />
                          {job.job_type || job.jobType || "Job"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            <p className="mb-5 mt-1 text-sm text-gray-500">
              Manage recruitment activities.
            </p>

            <div className="space-y-3">
              {[
                [
                  "/recruiter/post-job",
                  "Post a Job",
                  "Create a new vacancy",
                  PlusCircle,
                ],
                [
                  "/recruiter/my-jobs",
                  "Manage Jobs",
                  "Edit and manage jobs",
                  BriefcaseBusiness,
                ],
                [
                  "/recruiter/applicants",
                  "Applicants",
                  "Review candidates",
                  Users,
                ],
              ].map(([path, title, description, Icon]) => (
                <Link
                  key={path}
                  to={path}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 hover:bg-gray-100"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="truncate text-xs text-gray-500">
                        {description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-gray-400" />
                </Link>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="mb-4 font-semibold text-gray-900">
                Hiring Overview
              </h3>
              {[
                [
                  "Active Jobs",
                  stats.activeJobs,
                  stats.totalJobs,
                  "bg-blue-600",
                ],
                [
                  "Closed Jobs",
                  stats.closedJobs,
                  stats.totalJobs,
                  "bg-gray-400",
                ],
                [
                  "Shortlisted",
                  stats.shortlisted,
                  stats.totalApplicants,
                  "bg-green-500",
                ],
                ["Hired", stats.hired, stats.totalApplicants, "bg-purple-500"],
              ].map(([label, value, total, color]) => {
                const width =
                  total > 0 ? Math.min((value / total) * 100, 100) : 0;

                return (
                  <div key={label} className="mb-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-700">
                        {value}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Applicants
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Latest candidates who applied
                </p>
              </div>
              <Link
                to="/recruiter/applicants"
                className="shrink-0 text-sm font-semibold text-blue-600"
              >
                View All
              </Link>
            </div>

            {applicationsLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />

                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-2/3 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                      </div>
                    </div>

                    <div className="h-6 w-20 shrink-0 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : recentApplicants.length === 0 ? (
              <div className="py-10 text-center">
                <Users className="mx-auto mb-3 text-gray-400" size={30} />
                <p className="font-semibold text-gray-900">No applicants yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplicants.map((application) => {
                  const name =
                    application.candidate_name ||
                    application.name ||
                    "Candidate";
                  const applicationId =
                    application.application_id ?? application.id;

                  return (
                    <button
                      key={applicationId}
                      type="button"
                      onClick={() =>
                        navigate(`/recruiter/applicant/${applicationId}`, {
                          state: { application },
                        })
                      }
                      className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 text-left hover:bg-gray-100"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {application.job_title || "Job Application"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(application.status)}`}
                      >
                        {application.status || "Applied"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-gray-500">Recent updates</p>
              </div>
              <Bell size={19} className="text-gray-400" />
            </div>

            <div className="space-y-4">
              {stats.totalApplicants > 0 && (
                <div className="flex gap-3">
                  <UserCheck className="shrink-0 text-blue-600" size={20} />
                  <p className="text-sm text-gray-700">
                    {stats.totalApplicants} application(s) received
                  </p>
                </div>
              )}

              {stats.activeJobs > 0 && (
                <div className="flex gap-3">
                  <CheckCircle2 className="shrink-0 text-green-600" size={20} />
                  <p className="text-sm text-gray-700">
                    {stats.activeJobs} active job(s)
                  </p>
                </div>
              )}

              {stats.totalApplicants === 0 && stats.activeJobs === 0 && (
                <p className="py-5 text-center text-sm text-gray-500">
                  No recent updates
                </p>
              )}
            </div>

            <Link
              to="/recruiter/notifications"
              className="mt-5 flex w-full items-center justify-center gap-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              View Notifications <ChevronRight size={16} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
