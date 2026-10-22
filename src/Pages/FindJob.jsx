import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Clock3,
  IndianRupee,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import Footer from "../Components/Footer";
import Header from "../Components/Header";

// =====================================================
// API URLs
// =====================================================

import API_BASE from "../Config/api";

const JOBS_API = `${API_BASE}/jobs/get-all.php`;

const SAVED_JOBS_API = `${API_BASE}/savedJobs/get.php`;

const SAVE_JOB_API = `${API_BASE}/savedJobs/save.php`;

const REMOVE_SAVED_JOB_API = `${API_BASE}/savedJobs/remove.php`;

// =====================================================
// Locations
// =====================================================

const locations = [
  "Noida",
  "Delhi",
  "Lucknow",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Gurgaon",
];

// =====================================================
// Get Candidate ID
// =====================================================

const getCandidateId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
      user?.id ||
      user?.userId ||
      user?.user_id ||
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      null
    );
  } catch (error) {
    console.error("User parse error:", error);

    return (
      localStorage.getItem("userId") || localStorage.getItem("user_id") || null
    );
  }
};

// =====================================================
// Find Jobs Component
// =====================================================

const FindJobs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ===================================================
  // States
  // ===================================================

  const [jobsData, setJobsData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");

  const [locationSearch, setLocationSearch] = useState("");

  const [savedJobs, setSavedJobs] = useState([]);

  const [savingJobId, setSavingJobId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [mobileFilters, setMobileFilters] = useState(false);

  const [sortBy, setSortBy] = useState("Relevance");

  // ===================================================
  // Filters
  // ===================================================

  const [filters, setFilters] = useState({
    jobType: [],
    experience: [],
    workMode: [],
    location: [],
    industry: [],
    datePosted: "Any time",
  });

  const jobsPerPage = 6;

  // ===================================================
  // Read URL Query Parameters
  //
  // Supported:
  // /jobs?category=IT
  // /jobs?company=ABC
  // /jobs?search=React
  // /jobs?location=Lucknow
  // ===================================================

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const category = params.get("category") || "";

    const company = params.get("company") || "";

    const search = params.get("search") || "";

    const locationParam = params.get("location") || "";

    // Category
    setFilters((previous) => ({
      ...previous,
      industry: category ? [category] : [],
    }));

    // Search
    if (search) {
      setKeyword(search);
    }

    // Location
    if (locationParam) {
      setLocationSearch(locationParam);
    }

    setCurrentPage(1);
  }, [location.search]);

  // ===================================================
  // Fetch All Jobs
  // ===================================================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(JOBS_API);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch jobs");
        }

        const formattedJobs = (data.jobs || []).map((job) => ({
          id: Number(job.id),

          title: job.job_title || "Untitled Job",

          position: job.position || "Not specified",

          company: job.company_name || "Company",

          logo: (job.company_name || "C").trim().charAt(0).toUpperCase(),

          logoBg: "bg-blue-50",

          location: job.location || "Location not specified",

          salary: formatJobSalary(job),
          experience: job.experience || "Fresher",

          type: job.job_type || "Full Time",

          mode: job.workplace_type || "Not specified",

          industry: job.category || "Not specified",

          education: job.education || "",

          responsibilities: job.responsibilities || "",

          requirements: job.requirements || "",

          description: job.description || "No description available.",

          skills: Array.isArray(job.skills)
            ? job.skills
            : typeof job.skills === "string"
              ? job.skills
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean)
              : [],

          posted: formatPostedDate(job.created_at),

          daysAgo: getDaysAgo(job.created_at),
        }));

        setJobsData(formattedJobs);
      } catch (err) {
        console.error("Fetch jobs error:", err);

        setError(err.message || "Unable to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ===================================================
  // Fetch Saved Jobs
  // ===================================================

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const candidateId = getCandidateId();

      if (!candidateId) {
        return;
      }

      try {
        const response = await fetch(
          `${SAVED_JOBS_API}?candidate_id=${Number(candidateId)}`,
        );

        if (!response.ok) {
          throw new Error(`Saved jobs server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch saved jobs");
        }

        setSavedJobs(
          (data.saved_jobs || []).map((item) => Number(item.job_id)),
        );
      } catch (err) {
        console.error("Fetch saved jobs error:", err);
      }
    };

    fetchSavedJobs();
  }, []);

  // ===================================================
  // Toggle Filter
  // ===================================================

  const toggleFilter = (category, value) => {
    setFilters((previous) => {
      const current = previous[category];

      return {
        ...previous,

        [category]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });

    setCurrentPage(1);
  };

  // ===================================================
  // Clear Filters
  // ===================================================

  const clearFilters = () => {
    setFilters({
      jobType: [],
      experience: [],
      workMode: [],
      location: [],
      industry: [],
      datePosted: "Any time",
    });

    setKeyword("");

    setLocationSearch("");

    setCurrentPage(1);

    // Remove query parameters
    navigate("/jobs", {
      replace: true,
    });
  };

  // ===================================================
  // Save / Remove Job
  // ===================================================

  const handleSaveJob = async (jobId) => {
    const candidateId = getCandidateId();

    if (!candidateId) {
      alert("Please login as a candidate first.");
      return;
    }

    const numericJobId = Number(jobId);

    const alreadySaved = savedJobs.includes(numericJobId);

    const apiUrl = alreadySaved ? REMOVE_SAVED_JOB_API : SAVE_JOB_API;

    try {
      setSavingJobId(numericJobId);

      const response = await fetch(apiUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          candidate_id: Number(candidateId),

          job_id: numericJobId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success && data.message !== "Job already saved") {
        throw new Error(data.message || "Unable to update saved job");
      }

      if (alreadySaved) {
        setSavedJobs((previous) =>
          previous.filter((id) => id !== numericJobId),
        );

        alert("Job removed from saved jobs.");
      } else {
        setSavedJobs((previous) =>
          previous.includes(numericJobId)
            ? previous
            : [...previous, numericJobId],
        );

        alert(
          data.message === "Job already saved"
            ? "This job is already saved."
            : "Job saved successfully!",
        );
      }
    } catch (err) {
      console.error("Save/unsave error:", err);

      alert(err.message || "Something went wrong.");
    } finally {
      setSavingJobId(null);
    }
  };

  // ===================================================
  // Company Filter From URL
  // ===================================================

  const companyFilter = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return (params.get("company") || "").trim();
  }, [location.search]);

  // ===================================================
  // Filtered Jobs
  // ===================================================

  const filteredJobs = useMemo(() => {
    const result = jobsData.filter((job) => {
      const search = keyword.toLowerCase().trim();

      const searchedLocation = locationSearch.toLowerCase().trim();

      // ---------------------------------------------
      // Search
      // ---------------------------------------------

      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.description.toLowerCase().includes(search) ||
        job.skills.some((skill) =>
          String(skill).toLowerCase().includes(search),
        );

      // ---------------------------------------------
      // Location Search
      // ---------------------------------------------

      const matchesSearchLocation =
        !searchedLocation ||
        job.location.toLowerCase().includes(searchedLocation);

      // ---------------------------------------------
      // Job Type
      // ---------------------------------------------

      const matchesJobType =
        filters.jobType.length === 0 || filters.jobType.includes(job.type);

      // ---------------------------------------------
      // Experience
      // ---------------------------------------------

      const matchesExperience =
        filters.experience.length === 0 ||
        filters.experience.some((item) =>
          matchExperience(job.experience, item),
        );

      // ---------------------------------------------
      // Work Mode
      // ---------------------------------------------

      const matchesWorkMode =
        filters.workMode.length === 0 || filters.workMode.includes(job.mode);

      // ---------------------------------------------
      // Location Filter
      // ---------------------------------------------

      const matchesLocation =
        filters.location.length === 0 ||
        filters.location.some((item) =>
          job.location.toLowerCase().includes(item.toLowerCase()),
        );

      // ---------------------------------------------
      // Industry / Category
      // ---------------------------------------------

      const matchesIndustry =
        filters.industry.length === 0 ||
        filters.industry.includes(job.industry);

      // ---------------------------------------------
      // Date Posted
      // ---------------------------------------------

      const matchesDate =
        filters.datePosted === "Any time" ||
        (filters.datePosted === "Today" && job.daysAgo === 0) ||
        (filters.datePosted === "Last 3 days" && job.daysAgo <= 3) ||
        (filters.datePosted === "Last 7 days" && job.daysAgo <= 7) ||
        (filters.datePosted === "Last 30 days" && job.daysAgo <= 30);

      // ---------------------------------------------
      // Company Filter
      // ---------------------------------------------

      const matchesCompany =
        !companyFilter ||
        job.company.trim().toLowerCase() === companyFilter.trim().toLowerCase();

      return (
        matchesSearch &&
        matchesSearchLocation &&
        matchesJobType &&
        matchesExperience &&
        matchesWorkMode &&
        matchesLocation &&
        matchesIndustry &&
        matchesDate &&
        matchesCompany
      );
    });

    // =================================================
    // Sorting
    // =================================================

    if (sortBy === "Most Recent") {
      result.sort((a, b) => a.daysAgo - b.daysAgo);
    }

    if (sortBy === "Salary: High to Low") {
      result.sort(
        (a, b) => getSalaryNumber(b.salary) - getSalaryNumber(a.salary),
      );
    }

    if (sortBy === "Salary: Low to High") {
      result.sort(
        (a, b) => getSalaryNumber(a.salary) - getSalaryNumber(b.salary),
      );
    }

    return result;
  }, [jobsData, keyword, locationSearch, filters, sortBy, companyFilter]);

  // ===================================================
  // Pagination
  // ===================================================

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage,
  );

  // ===================================================
  // Active Filters
  // ===================================================

  const activeFilters =
    filters.jobType.length +
    filters.experience.length +
    filters.workMode.length +
    filters.location.length +
    filters.industry.length +
    (filters.datePosted !== "Any time" ? 1 : 0) +
    (companyFilter ? 1 : 0);

  // ===================================================
  // Keep Page Valid
  // ===================================================

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isCandidateLoggedIn = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      return (
        localStorage.getItem("isLoggedIn") === "true" &&
        user &&
        user.role === "candidate"
      );
    } catch (error) {
      return false;
    }
  };

  // ===================================================
  // Render
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {isCandidateLoggedIn() && (
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => navigate("/candidate/dashboard")}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          Hero
      ================================================= */}

      <section className="bg-slate-900 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <p className="mb-2 text-sm font-semibold text-blue-400">
              JOBPORTAL
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Find your next opportunity
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              Discover jobs that match your skills, experience and career goals.
            </p>
          </div>

          {/* Search */}
          <div className="rounded-2xl bg-white p-2 shadow-xl">
            <div className="grid gap-2 lg:grid-cols-[1fr_1fr_auto]">
              {/* Keyword */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <Search className="h-5 w-5 text-slate-400" />

                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);

                    setCurrentPage(1);
                  }}
                  placeholder="Job title, keywords, or company"
                  className="w-full bg-transparent py-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
                <MapPin className="h-5 w-5 text-slate-400" />

                <input
                  type="text"
                  value={locationSearch}
                  onChange={(event) => {
                    setLocationSearch(event.target.value);

                    setCurrentPage(1);
                  }}
                  placeholder="City, state, or location"
                  className="w-full bg-transparent py-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Search Button */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Search className="h-4 w-4" />
                Search Jobs
              </button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-slate-400">Popular:</span>

            {[
              "MERN Developer",
              "Frontend Developer",
              "Backend Developer",
              "Java Developer",
              "UI/UX Designer",
            ].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => {
                  setKeyword(item);
                  setCurrentPage(1);
                }}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500 hover:text-blue-400"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================
          Main
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Mobile Filter Button */}
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFilters(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {activeFilters}
              </span>
            )}
          </button>

          <span className="text-sm text-slate-500">
            {filteredJobs.length} jobs
          </span>
        </div>

        <div className="grid gap-7 lg:grid-cols-[280px_1fr]">
          {/* =================================================
              Sidebar Filters
          ================================================= */}

          <aside
            className={`${
              mobileFilters ? "fixed inset-0 z-50 flex" : "hidden"
            }  lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-7rem)]`}
          >
            {/* Overlay */}
            {mobileFilters && (
              <div
                className="absolute inset-0 bg-black/40 lg:hidden"
                onClick={() => setMobileFilters(false)}
              />
            )}

            <div className="relative z-10 h-full w-[300px] overflow-y-auto bg-white p-5 shadow-xl lg:h-full lg:w-auto lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-sm">
              {" "}
              {/* Filter Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Filter Jobs</h2>

                  {activeFilters > 0 && (
                    <p className="mt-1 text-xs text-blue-600">
                      {activeFilters} active filters
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileFilters(false)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {/* Job Type */}
              <FilterSection title="Job Type">
                {["Full Time", "Part Time", "Internship", "Contract"].map(
                  (item) => (
                    <Checkbox
                      key={item}
                      label={item}
                      checked={filters.jobType.includes(item)}
                      onChange={() => toggleFilter("jobType", item)}
                    />
                  ),
                )}
              </FilterSection>
              {/* Experience */}
              <FilterSection title="Experience">
                {[
                  "Fresher",
                  "0-1 Years",
                  "1-3 Years",
                  "3-5 Years",
                  "5+ Years",
                ].map((item) => (
                  <Checkbox
                    key={item}
                    label={item}
                    checked={filters.experience.includes(item)}
                    onChange={() => toggleFilter("experience", item)}
                  />
                ))}
              </FilterSection>
              {/* Work Mode */}
              <FilterSection title="Work Mode">
                {["Remote", "Hybrid", "On-site"].map((item) => (
                  <Checkbox
                    key={item}
                    label={item}
                    checked={filters.workMode.includes(item)}
                    onChange={() => toggleFilter("workMode", item)}
                  />
                ))}
              </FilterSection>
              {/* Location */}
              <FilterSection title="Location">
                {locations.map((item) => (
                  <Checkbox
                    key={item}
                    label={item}
                    checked={filters.location.includes(item)}
                    onChange={() => toggleFilter("location", item)}
                  />
                ))}
              </FilterSection>
              {/* Date */}
              <FilterSection title="Date Posted">
                {[
                  "Any time",
                  "Today",
                  "Last 3 days",
                  "Last 7 days",
                  "Last 30 days",
                ].map((item) => (
                  <label
                    key={item}
                    className="mb-3 flex cursor-pointer items-center gap-3 text-sm text-slate-600"
                  >
                    <input
                      type="radio"
                      name="datePosted"
                      checked={filters.datePosted === item}
                      onChange={() => {
                        setFilters((previous) => ({
                          ...previous,
                          datePosted: item,
                        }));

                        setCurrentPage(1);
                      }}
                      className="h-4 w-4 accent-blue-600"
                    />

                    {item}
                  </label>
                ))}
              </FilterSection>
              {/* Mobile Button */}
              {mobileFilters && (
                <button
                  type="button"
                  onClick={() => setMobileFilters(false)}
                  className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white lg:hidden"
                >
                  Show {filteredJobs.length} Jobs
                </button>
              )}
            </div>
          </aside>

          {/* =================================================
              Jobs Section
          ================================================= */}

          <section>
            {/* Heading + Sort */}
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {filteredJobs.length.toLocaleString()} Jobs Found
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {companyFilter
                    ? `Jobs posted by ${companyFilter}`
                    : "Find the right opportunity for your career"}
                </p>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                >
                  <option>Relevance</option>

                  <option>Most Recent</option>

                  <option>Salary: High to Low</option>

                  <option>Salary: Low to High</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <h3 className="text-lg font-bold text-slate-900">
                  Loading jobs...
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Please wait while we fetch the latest jobs.
                </p>
              </div>
            )}

            {/* Error */}

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-4" aria-label="Loading jobs">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                  >
                    {/* Job Header: Logo, Title, Company, Save Button */}
                    <div className="flex gap-4">
                      {/* Company Logo Skeleton */}
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-200" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-3">
                            {/* Job Title */}
                            <div className="h-5 w-3/4 rounded-md bg-slate-200" />

                            {/* Company Name */}
                            <div className="h-4 w-1/2 rounded-md bg-slate-200" />
                          </div>

                          {/* Bookmark Button */}
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
                        </div>

                        {/* Job Details: Location, Salary, Experience */}
                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
                          <div className="h-4 w-28 rounded-md bg-slate-200" />
                          <div className="h-4 w-24 rounded-md bg-slate-200" />
                          <div className="h-4 w-24 rounded-md bg-slate-200" />
                        </div>

                        {/* Job Type, Work Mode, Industry Tags */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          <div className="h-6 w-20 rounded-full bg-slate-200" />
                          <div className="h-6 w-16 rounded-full bg-slate-200" />
                          <div className="h-6 w-24 rounded-full bg-slate-200" />
                        </div>

                        {/* Job Description */}
                        <div className="mt-5 space-y-2">
                          <div className="h-3 w-full rounded-md bg-slate-200" />
                          <div className="h-3 w-5/6 rounded-md bg-slate-200" />
                        </div>

                        {/* Skills */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <div className="h-6 w-16 rounded-lg bg-slate-200" />
                          <div className="h-6 w-20 rounded-lg bg-slate-200" />
                          <div className="h-6 w-24 rounded-lg bg-slate-200" />
                          <div className="h-6 w-14 rounded-lg bg-slate-200" />
                        </div>

                        {/* Footer: Posted Date and Buttons */}
                        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="h-4 w-24 rounded-md bg-slate-200" />

                          <div className="flex gap-2">
                            <div className="h-10 w-28 rounded-xl bg-slate-200" />
                            <div className="h-10 w-24 rounded-xl bg-slate-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Jobs */}
            {!loading && !error && currentJobs.length > 0 && (
              <div className="space-y-4">
                {currentJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    saved={savedJobs.includes(job.id)}
                    saving={savingJobId === job.id}
                    onSave={() => handleSaveJob(job.id)}
                  />
                ))}
              </div>
            )}

            {/* No Jobs */}
            {!loading && !error && currentJobs.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-7 w-7 text-slate-400" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  No jobs found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Try adjusting your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-7 flex items-center justify-center gap-2">
                {/* Previous */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((previous) => Math.max(previous - 1, 1))
                  }
                  className="flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {/* Pages */}
                {Array.from({
                  length: totalPages,
                }).map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((previous) =>
                      Math.min(previous + 1, totalPages),
                    )
                  }
                  className="flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// =====================================================
// Filter Section
// =====================================================

const FilterSection = ({ title, children }) => (
  <div className="border-t border-slate-100 py-5 first:border-t-0 first:pt-0">
    <h3 className="mb-4 text-sm font-bold text-slate-900">{title}</h3>

    {children}
  </div>
);

// =====================================================
// Checkbox
// =====================================================

const Checkbox = ({ label, checked, onChange }) => (
  <label className="mb-3 flex cursor-pointer items-center gap-3 text-sm text-slate-600">
    <span
      className={`flex h-4 w-4 items-center justify-center rounded border ${
        checked ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
      }`}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
    </span>

    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="hidden"
    />

    <span>{label}</span>
  </label>
);

// =====================================================
// Job Card
// =====================================================

const JobCard = ({ job, saved, saving, onSave }) => {
  const navigate = useNavigate();

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg sm:p-6">
      <div className="flex gap-4">

        {/* Company Logo - First Letter */}
<div
  className="flex h-14 w-14 shrink-0 items-center justify-center
             rounded-xl border border-blue-100 bg-blue-50
             text-2xl font-bold uppercase text-blue-700 shadow-sm"
  title={job.company}
>
  {(job.company || "C").trim().charAt(0).toUpperCase()}
</div>

        <div className="min-w-0 flex-1">
          {/* Title + Save */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                {job.title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-md bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                  Position: {job.position}
                </span>
              </div>

              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <Building2 className="h-4 w-4" />

                {job.company}
              </p>
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              title={saved ? "Remove from saved jobs" : "Save job"}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                saved
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              } ${saving ? "cursor-wait opacity-60" : ""}`}
            >
              {saving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              ) : saved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Job Meta */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" />
              {job.location}
            </span>

            <span className="flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 text-slate-400" />
              {job.salary}
            </span>

            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
              {job.experience}
            </span>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {job.type}
            </span>

            {job.mode !== "Not specified" && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {job.mode}
              </span>
            )}

            {job.industry !== "Not specified" && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {job.industry}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {job.description}
          </p>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Bottom */}
          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock3 className="h-4 w-4" />
              {job.posted}
            </span>

            <div className="flex gap-2">
              {/* View Details */}
              <button
                type="button"
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
              >
                View Details
              </button>

              {/* Apply */}
              <button
                type="button"
                onClick={() =>
                  navigate(`/jobs/${job.id}/apply`, {
                    state: {
                      job,
                    },
                  })
                }
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

// =====================================================
// Get Days Ago
// =====================================================

const getDaysAgo = (date) => {
  if (!date) return 0;

  const createdDate = new Date(date);

  const today = new Date();

  const difference = today.getTime() - createdDate.getTime();

  return Math.max(Math.floor(difference / (1000 * 60 * 60 * 24)), 0);
};

// =====================================================
// Format Posted Date
// =====================================================

const formatPostedDate = (date) => {
  if (!date) return "Recently posted";

  const days = getDaysAgo(date);

  if (days === 0) return "Today";

  if (days === 1) return "1 day ago";

  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);

  if (days < 30) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  const months = Math.floor(days / 30);

  return months === 1 ? "1 month ago" : `${months} months ago`;
};

const formatJobSalary = (job) => {
  const salaryType = String(job.salary_type || "")
    .toLowerCase()
    .trim();

  const hasSalaryRange =
    job.salary_min != null &&
    job.salary_max != null &&
    job.salary_min !== "" &&
    job.salary_max !== "";

  if (hasSalaryRange) {
    const min = Number(job.salary_min);
    const max = Number(job.salary_max);

    if (
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      !(min === 0 && max === 0)
    ) {
      if (salaryType.includes("year") || salaryType.includes("annual")) {
        return `₹${min} - ₹${max} LPA`;
      }

      if (salaryType.includes("month")) {
        return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")} per month`;
      }

      if (salaryType.includes("day")) {
        return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")} per day`;
      }

      return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}`;
    }
  }

  // Fallback: API se salary pehle se formatted ho
  if (job.salary && job.salary !== "Salary not specified") {
    return job.salary.replace(/per year|annually|annual|yearly/i, "LPA");
  }

  return "Salary not specified";
};

// =====================================================
// Get Salary Number
// =====================================================

const getSalaryNumber = (salary) => {
  if (!salary) return 0;

  const numbers = String(salary).match(/\d+(?:\.\d+)?/g);

  return numbers ? Number(numbers[0]) : 0;
};

// =====================================================
// Match Experience
// =====================================================

const matchExperience = (jobExperience, filterExperience) => {
  const job = (jobExperience || "").toLowerCase();

  const filter = (filterExperience || "").toLowerCase();

  if (filter === "fresher") {
    return job.includes("fresher");
  }

  if (filter === "0-1 years") {
    return job.includes("0-1") || job.includes("fresher");
  }

  if (filter === "1-3 years") {
    return job.includes("1-3") || job.includes("1-2");
  }

  if (filter === "3-5 years") {
    return job.includes("3-5");
  }

  if (filter === "5+ years") {
    return job.includes("5+") || job.includes("5 +");
  }

  return false;
};

export default FindJobs;
