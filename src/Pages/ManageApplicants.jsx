
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";

import API_BASE from "../Config/api";

const APPLICATIONS_API = `${API_BASE}/recruiter/applications.php`;

const ManageApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Get logged-in recruiter ID
  const getRecruiterId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
      user.id ||
      user.userId ||
      user.user_id ||
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      0
    );
  };

  // Fetch applications from PHP API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const recruiterId = getRecruiterId();

      if (!recruiterId || recruiterId === "0") {
        setError("Recruiter ID not found. Please login again.");
        setApplications([]);
        return;
      }

      const response = await fetch(
        `${APPLICATIONS_API}?recruiterId=${recruiterId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Applications fetch failed"
        );
      }

      setApplications(data.applications || []);
    } catch (err) {
      console.error("Fetch Applications Error:", err);
      setError(err.message || "Something went wrong");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        String(application.candidate_name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(application.candidate_email || "")
          .toLowerCase()
          .includes(searchText) ||
        String(application.job_title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(application.company_name || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        String(application.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  // Statistics
  const totalApplicants = applications.length;

  const appliedApplicants = applications.filter(
    (item) =>
      String(item.status).toLowerCase() === "applied"
  ).length;

  const shortlistedApplicants = applications.filter(
    (item) =>
      String(item.status).toLowerCase() === "shortlisted"
  ).length;

  const rejectedApplicants = applications.filter(
    (item) =>
      String(item.status).toLowerCase() === "rejected"
  ).length;

  // Status badge
  const getStatusClass = (status) => {
    const currentStatus = String(status || "").toLowerCase();

    if (currentStatus === "shortlisted") {
      return "bg-green-100 text-green-700";
    }

    if (currentStatus === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (currentStatus === "hired") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              Manage Applicants
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage candidates who applied for your jobs.
            </p>
          </div>

          <button
            onClick={fetchApplications}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Users className="text-blue-600" size={26} />
              <span className="text-2xl font-bold text-gray-800">
                {totalApplicants}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Total Applicants
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Clock className="text-yellow-600" size={26} />
              <span className="text-2xl font-bold text-gray-800">
                {appliedApplicants}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Applied
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <CheckCircle className="text-green-600" size={26} />
              <span className="text-2xl font-bold text-gray-800">
                {shortlistedApplicants}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Shortlisted
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <XCircle className="text-red-600" size={26} />
              <span className="text-2xl font-bold text-gray-800">
                {rejectedApplicants}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Rejected
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search candidate, email or job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <RefreshCw
              className="mx-auto mb-3 animate-spin text-blue-600"
              size={30}
            />

            <p className="text-gray-500">
              Loading applications...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApplications.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <Users
              className="mx-auto mb-3 text-gray-400"
              size={42}
            />

            <h3 className="text-lg font-semibold text-gray-700">
              No Applicants Found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No applications match your current filters.
            </p>
          </div>
        )}

        {/* Applications Table */}
        {!loading && filteredApplications.length > 0 && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">
                      Candidate
                    </th>

                    <th className="px-5 py-4">
                      Job Details
                    </th>

                    <th className="px-5 py-4">
                      Location
                    </th>

                    <th className="px-5 py-4">
                      Applied Date
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.application_id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800">
                          {application.candidate_name || "N/A"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {application.candidate_email || "N/A"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {application.candidate_phone || "N/A"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {application.job_title || "N/A"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {application.company_name || "N/A"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {application.job_type || "N/A"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={15} />
                          {application.location || "N/A"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={15} />
                          {formatDate(application.applied_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {application.status || "Applied"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            setSelectedApplicant(application)
                          }
                          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                        >
                          <Eye size={15} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applicant Details Modal */}
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6">

              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Applicant Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Application ID:{" "}
                    {selectedApplicant.application_id}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-2xl text-gray-500 hover:text-gray-800"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">

                {/* Candidate Information */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-800">
                    Candidate Information
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      {selectedApplicant.candidate_name || "N/A"}
                    </p>

                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      {selectedApplicant.candidate_email || "N/A"}
                    </p>

                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      {selectedApplicant.candidate_phone || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Job Information */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-800">
                    Job Information
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Job Title:</strong>{" "}
                      {selectedApplicant.job_title || "N/A"}
                    </p>

                    <p>
                      <strong>Company:</strong>{" "}
                      {selectedApplicant.company_name || "N/A"}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedApplicant.location || "N/A"}
                    </p>

                    <p>
                      <strong>Job Type:</strong>{" "}
                      {selectedApplicant.job_type || "N/A"}
                    </p>

                    <p>
                      <strong>Experience:</strong>{" "}
                      {selectedApplicant.experience || "N/A"}
                    </p>

                    <p>
                      <strong>Salary:</strong>{" "}
                      {selectedApplicant.salary || "N/A"}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {selectedApplicant.status || "Applied"}
                    </p>

                    <p>
                      <strong>Applied At:</strong>{" "}
                      {formatDate(selectedApplicant.applied_at)}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-800">
                    Required Skills
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedApplicant.skills) &&
                    selectedApplicant.skills.length > 0 ? (
                      selectedApplicant.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No skills available
                      </p>
                    )}
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                    <FileText size={18} />
                    Cover Letter
                  </h3>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {selectedApplicant.cover_letter ||
                      "No cover letter available."}
                  </p>
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-wrap gap-3">
                  {selectedApplicant.candidate_email && (
                    <a
                      href={`mailto:${selectedApplicant.candidate_email}`}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Mail size={16} />
                      Send Email
                    </a>
                  )}

                  {selectedApplicant.candidate_phone && (
                    <a
                      href={`tel:${selectedApplicant.candidate_phone}`}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  )}

                  {selectedApplicant.resume && (
                    <a
                      href={selectedApplicant.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      <Download size={16} />
                      Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApplicants;