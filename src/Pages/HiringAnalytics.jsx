import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Briefcase,
  Users,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  FileText,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import API_BASE from "../Config/api";

const GET_MY_JOBS_API = `${API_BASE}/jobs/get-my-jobs.php`;

const GET_RECRUITER_APPLICATIONS_API =
  `${API_BASE}/applications/get-recruiter-applications.php`;

const HiringAnalytics = () => {
  const [user, setUser] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------------
  // Get logged-in recruiter
  // -----------------------------------
  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return null;

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("User parse error:", error);
      return null;
    }
  };

  // -----------------------------------
  // Fetch Analytics Data
  // -----------------------------------
  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const loggedInUser = getLoggedInUser();

      if (!loggedInUser?.id) {
        setError("Recruiter login information not found.");
        setLoading(false);
        return;
      }

      if (loggedInUser.role !== "recruiter") {
        setError("Only recruiters can access hiring analytics.");
        setLoading(false);
        return;
      }

      setUser(loggedInUser);

      const recruiterId = Number(loggedInUser.id);

      // -----------------------------------
      // Jobs API
      // -----------------------------------
      const jobsResponse = await fetch(
        `${GET_MY_JOBS_API}?recruiterId=${recruiterId}`
      );

      const jobsRaw = await jobsResponse.text();

      console.log("Analytics Jobs RAW:", jobsRaw);

      let jobsData;

      try {
        jobsData = JSON.parse(jobsRaw);
      } catch (error) {
        throw new Error("Jobs API returned invalid JSON.");
      }

      if (!jobsData.success) {
        throw new Error(jobsData.message || "Unable to fetch jobs.");
      }

      const jobsList = Array.isArray(jobsData.jobs)
        ? jobsData.jobs
        : [];

      // -----------------------------------
      // Applications API
      // -----------------------------------
      const applicationsResponse = await fetch(
        `${GET_RECRUITER_APPLICATIONS_API}?recruiterId=${recruiterId}`
      );

      const applicationsRaw = await applicationsResponse.text();

      console.log(
        "Analytics Applications RAW:",
        applicationsRaw
      );

      let applicationsData;

      try {
        applicationsData = JSON.parse(applicationsRaw);
      } catch (error) {
        throw new Error(
          "Applications API returned invalid JSON."
        );
      }

      if (!applicationsData.success) {
        throw new Error(
          applicationsData.message ||
            "Unable to fetch applications."
        );
      }

      const applicationsList = Array.isArray(
        applicationsData.applications
      )
        ? applicationsData.applications
        : [];

      setJobs(jobsList);
      setApplications(applicationsList);

      console.log("Analytics Jobs:", jobsList);
      console.log("Analytics Applications:", applicationsList);
    } catch (error) {
      console.error("Analytics Error:", error);

      setError(
        error.message ||
          "Something went wrong while loading analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // -----------------------------------
  // Normalize status
  // -----------------------------------
  const getStatus = (application) => {
    return String(
      application?.status || "Applied"
    ).toLowerCase();
  };

  // -----------------------------------
  // Basic Statistics
  // -----------------------------------
  const totalJobs = jobs.length;

  const activeJobs = jobs.filter(
    (job) =>
      String(job.status || "").toLowerCase() ===
      "active"
  ).length;

  const closedJobs = jobs.filter(
    (job) =>
      String(job.status || "").toLowerCase() ===
      "closed"
  ).length;

  const totalApplications = applications.length;

  const shortlisted = applications.filter(
    (application) =>
      getStatus(application) === "shortlisted"
  ).length;

  const rejected = applications.filter(
    (application) =>
      getStatus(application) === "rejected"
  ).length;

  const hired = applications.filter(
    (application) =>
      getStatus(application) === "hired"
  ).length;

  const applied = applications.filter(
    (application) =>
      getStatus(application) === "applied"
  ).length;

  // -----------------------------------
  // Conversion Rates
  // -----------------------------------
  const shortlistRate =
    totalApplications > 0
      ? ((shortlisted / totalApplications) * 100).toFixed(1)
      : 0;

  const hireRate =
    totalApplications > 0
      ? ((hired / totalApplications) * 100).toFixed(1)
      : 0;

  // -----------------------------------
  // Applicants Per Job
  // -----------------------------------
  const applicationsByJob = useMemo(() => {
    const result = {};

    applications.forEach((application) => {
      const jobId =
        application.job_id ??
        application.jobId;

      if (!jobId) return;

      result[jobId] = (result[jobId] || 0) + 1;
    });

    return result;
  }, [applications]);

  // -----------------------------------
  // Job Performance
  // -----------------------------------
  const jobPerformance = useMemo(() => {
    return jobs.map((job) => {
      const jobId = Number(job.id);

      const applicantCount =
        applicationsByJob[jobId] || 0;

      return {
        id: jobId,
        title:
          job.job_title ||
          job.title ||
          "Untitled Job",
        applications: applicantCount,
        views: Number(job.views || 0),
        status:
          String(job.status || "active")
            .charAt(0)
            .toUpperCase() +
          String(job.status || "active").slice(1),
      };
    });
  }, [jobs, applicationsByJob]);

  // -----------------------------------
  // Application Status Chart
  // -----------------------------------
  const statusData = useMemo(() => {
    return [
      {
        name: "Applied",
        value: applied,
      },
      {
        name: "Shortlisted",
        value: shortlisted,
      },
      {
        name: "Rejected",
        value: rejected,
      },
      {
        name: "Hired",
        value: hired,
      },
    ].filter((item) => item.value > 0);
  }, [
    applied,
    shortlisted,
    rejected,
    hired,
  ]);

  // -----------------------------------
  // Job Applications Bar Chart
  // -----------------------------------
  const jobChartData = useMemo(() => {
    return [...jobPerformance]
      .sort(
        (a, b) =>
          b.applications - a.applications
      )
      .slice(0, 8)
      .map((job) => ({
        name:
          job.title.length > 18
            ? job.title.substring(0, 18) + "..."
            : job.title,
        applications: job.applications,
      }));
  }, [jobPerformance]);

  // -----------------------------------
  // Application Timeline
  // -----------------------------------
  const monthlyApplications = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = months.map((month) => ({
      month,
      applications: 0,
    }));

    applications.forEach((application) => {
      const dateValue =
        application.applied_at ||
        application.created_at;

      if (!dateValue) return;

      const date = new Date(dateValue);

      if (isNaN(date.getTime())) return;

      const monthIndex = date.getMonth();

      result[monthIndex].applications += 1;
    });

    // Current month se pehle wale empty months hataane ki zarurat
    // nahi hai; chart complete year show karega.
    return result;
  }, [applications]);

  // -----------------------------------
  // Recent Applications
  // -----------------------------------
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => {
        const dateA = new Date(
          a.applied_at ||
            a.created_at ||
            0
        ).getTime();

        const dateB = new Date(
          b.applied_at ||
            b.created_at ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [applications]);

  // -----------------------------------
  // Format Date
  // -----------------------------------
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // -----------------------------------
  // Status Style
  // -----------------------------------
  const getStatusStyle = (status) => {
    const normalized = String(status).toLowerCase();

    if (normalized === "shortlisted") {
      return "bg-green-100 text-green-700";
    }

    if (normalized === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (normalized === "hired") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  // -----------------------------------
  // Loading
  // -----------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={35}
            className="animate-spin mx-auto text-blue-600"
          />

          <p className="mt-3 text-gray-600">
            Loading hiring analytics...
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------
  // Error
  // -----------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-center">
          <XCircle
            size={45}
            className="mx-auto text-red-500"
          />

          <h2 className="text-xl font-semibold text-gray-900 mt-4">
            Unable to Load Analytics
          </h2>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchAnalytics}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* -------------------------------- Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3
                  size={28}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Hiring Analytics
                </h1>

                <p className="text-gray-500 mt-1">
                  Track your recruitment performance
                  and application activity.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* -------------------------------- Recruiter Info */}
        {user && (
          <div className="mb-6 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                {String(user.name || "R")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  {user.name || "Recruiter"}
                </p>

                <p className="text-sm text-gray-500">
                  {user.email || ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------- Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Jobs
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalJobs}
                </h2>
              </div>

              <div className="p-3 bg-blue-100 rounded-xl">
                <Briefcase
                  className="text-blue-600"
                  size={24}
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              {activeJobs} active · {closedJobs} closed
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Applications
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalApplications}
                </h2>
              </div>

              <div className="p-3 bg-purple-100 rounded-xl">
                <Users
                  className="text-purple-600"
                  size={24}
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Total candidates applied
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Shortlisted
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {shortlisted}
                </h2>
              </div>

              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck
                  className="text-green-600"
                  size={24}
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              {shortlistRate}% shortlist rate
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Candidates Hired
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {hired}
                </h2>
              </div>

              <div className="p-3 bg-purple-100 rounded-xl">
                <CheckCircle
                  className="text-purple-600"
                  size={24}
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              {hireRate}% hiring rate
            </p>
          </div>
        </div>

        {/* -------------------------------- Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">
              Applied
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-1">
              {applied}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">
              Shortlisted
            </p>

            <p className="text-2xl font-bold text-green-600 mt-1">
              {shortlisted}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">
              Rejected
            </p>

            <p className="text-2xl font-bold text-red-600 mt-1">
              {rejected}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">
              Hired
            </p>

            <p className="text-2xl font-bold text-purple-600 mt-1">
              {hired}
            </p>
          </div>
        </div>

        {/* -------------------------------- Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Applications by Job */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Applications by Job
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Number of applications received for
                each job.
              </p>
            </div>

            <div className="h-80">
              {jobChartData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={jobChartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="applications"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No application data available
                </div>
              )}
            </div>
          </div>

          {/* Application Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Application Status
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Current status of your applications.
              </p>
            </div>

            <div className="h-80">
              {statusData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {statusData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No application data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------- Monthly Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Application Activity
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Applications received by month.
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={monthlyApplications}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="applications"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------------------------------- Job Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Job Performance
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Application performance of your posted jobs.
            </p>
          </div>

          {jobPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                      Job
                    </th>

                    <th className="text-center px-5 py-3 text-sm font-semibold text-gray-600">
                      Applications
                    </th>

                    <th className="text-center px-5 py-3 text-sm font-semibold text-gray-600">
                      Views
                    </th>

                    <th className="text-center px-5 py-3 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {jobPerformance.map((job) => (
                    <tr
                      key={job.id}
                      className="border-t border-gray-100"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {job.title}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center font-semibold">
                        {job.applications}
                      </td>

                      <td className="px-5 py-4 text-center text-gray-600">
                        {job.views}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            job.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-gray-400">
              <Briefcase
                size={40}
                className="mx-auto mb-3"
              />

              No jobs posted yet.
            </div>
          )}
        </div>

        {/* -------------------------------- Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText
                size={20}
                className="text-blue-600"
              />

              <h2 className="text-lg font-semibold text-gray-900">
                Recent Applications
              </h2>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Latest candidates who applied to your jobs.
            </p>
          </div>

          {recentApplications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentApplications.map(
                (application, index) => {
                  const candidateName =
                    application.candidate_name ||
                    application.name ||
                    "Candidate";

                  const jobTitle =
                    application.job_title ||
                    application.title ||
                    "Job";

                  const status =
                    application.status ||
                    "Applied";

                  return (
                    <div
                      key={
                        application.application_id ||
                        application.id ||
                        index
                      }
                      className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users
                            size={20}
                            className="text-gray-600"
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {candidateName}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Applied for{" "}
                            <span className="font-medium text-gray-700">
                              {jobTitle}
                            </span>
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(
                              application.applied_at ||
                                application.created_at
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`self-start md:self-auto px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Clock
                size={40}
                className="mx-auto text-gray-300 mb-3"
              />

              <p className="text-gray-500">
                No applications received yet.
              </p>
            </div>
          )}
        </div>

        {/* -------------------------------- Backend Limitation Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex gap-3">
            <TrendingUp
              size={20}
              className="text-blue-600 flex-shrink-0 mt-0.5"
            />

            <div>
              <h3 className="font-semibold text-blue-900">
                Analytics based on current backend data
              </h3>

              <p className="text-sm text-blue-700 mt-1">
                Current analytics are calculated from your
                jobs and applications. Interview tracking,
                offer tracking, hiring source and actual
                time-to-hire will be added when those backend
                fields/modules are available.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HiringAnalytics;