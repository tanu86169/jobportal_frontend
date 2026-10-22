
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  Building2,
  MapPin,
  BriefcaseBusiness,
  Globe,
  Users,
  CalendarDays,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Search,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import API_BASE from "../Config/api";

// ==========================================
// HELPERS
// ==========================================

const safeString = (val, fallback = "") => {
  if (val === null || val === undefined) return fallback;
  return String(val);
};

const getFirstLetter = (name) =>
  safeString(name, "C").trim().charAt(0).toUpperCase() || "C";

const getWebsiteUrl = (website) => {
  const value = safeString(website).trim();

  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  return `https://${value}`;
};

const getCompanyColors = (index = 0) => {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-500",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-blue-600",
    "from-amber-500 to-orange-600",
    "from-fuchsia-500 to-pink-600",
  ];

  const safeIndex = Math.abs(Number(index) || 0);
  return colors[safeIndex % colors.length];
};

const formatSalary = (salary) => {
  if (salary === null || salary === undefined || salary === "") {
    return "";
  }

  if (typeof salary === "number") {
    return `₹${salary.toLocaleString("en-IN")}`;
  }

  return String(salary);
};

const getJobId = (job) => job?.id ?? job?.job_id;

const getJobTitle = (job) =>
  job?.job_title || job?.title || "Untitled Job";

const getJobSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim()).filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return [];
};

// ==========================================
// COMPANY INITIAL AVATAR
// ==========================================

const CompanyInitial = ({
  name,
  index = 0,
  size = "large",
}) => {
  const sizeClasses =
    size === "small"
      ? "h-11 w-11 rounded-xl text-lg"
      : "h-20 w-20 rounded-2xl text-3xl";

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${sizeClasses} bg-gradient-to-br ${getCompanyColors(
        index
      )} font-black text-white shadow-lg shadow-slate-900/10`}
      title={name || "Company"}
      aria-label={`${name || "Company"} initial`}
    >
      {getFirstLetter(name)}
    </div>
  );
};

// ==========================================
// SKELETON LOADING
// ==========================================

const CompanyDetailsSkeleton = () => (
  <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-6 h-5 w-40 rounded bg-slate-200" />

    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-slate-200" />

        <div className="flex-1 space-y-4">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-full max-w-xl rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
        </div>
      </div>

      <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
        <div className="h-20 rounded-2xl bg-slate-200" />
        <div className="h-20 rounded-2xl bg-slate-200" />
        <div className="h-20 rounded-2xl bg-slate-200" />
      </div>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        <div className="h-64 rounded-3xl bg-slate-200" />
        <div className="h-96 rounded-3xl bg-slate-200" />
      </div>

      <div className="space-y-4 lg:col-span-4">
        <div className="h-80 rounded-3xl bg-slate-200" />
        <div className="h-72 rounded-3xl bg-slate-200" />
      </div>
    </div>
  </div>
);

// ==========================================
// EMPTY JOBS
// ==========================================

const EmptyJobs = () => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
      <Search size={26} />
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-800">
      No Open Positions Right Now
    </h3>

    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
      This company currently has no active job openings. Check back later
      for new opportunities.
    </p>

    <Link
      to="/jobs"
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
    >
      Explore Other Jobs
      <ArrowUpRight size={16} />
    </Link>
  </div>
);

// ==========================================
// MAIN PAGE
// ==========================================

const CompanyDetails = () => {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [openJobs, setOpenJobs] = useState([]);
  const [similarCompanies, setSimilarCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH COMPANY DETAILS
  // ==========================================

  const fetchCompanyDetails = useCallback(
    async (signal) => {
      if (!id) {
        setCompany(null);
        setOpenJobs([]);
        setSimilarCompanies([]);
        setError("Company ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const apiBase = String(API_BASE || "").replace(/\/+$/, "");

        const response = await axios.get(
          `${apiBase}/companies/get-by-id.php`,
          {
            params: { id },
            timeout: 15000,
            headers: { Accept: "application/json" },
            signal,
          }
        );

        const result = response.data;

        console.log("Company API Response:", result);

        if (
          !result ||
          result.success === false ||
          !result.company
        ) {
          throw new Error(
            result?.message || "Company details not found."
          );
        }

        setCompany(result.company);

        setOpenJobs(
          Array.isArray(result.open_jobs)
            ? result.open_jobs
            : []
        );

        setSimilarCompanies(
          Array.isArray(result.similar_companies)
            ? result.similar_companies
            : []
        );
      } catch (err) {
        if (
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "Company Details API Error:",
          err.response?.data || err.message
        );

        setCompany(null);
        setOpenJobs([]);
        setSimilarCompanies([]);

        setError(
          err.response?.data?.message ||
            (err.code === "ECONNABORTED"
              ? "Request timed out. Please try again."
              : err.message || "Unable to load company details.")
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchCompanyDetails(controller.signal);

    return () => controller.abort();
  }, [fetchCompanyDetails]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />

        <main className="w-full flex-1">
          <CompanyDetailsSkeleton />
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !company) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={32} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              Company Not Found
            </h1>

            <p className="mt-3 break-words text-sm leading-6 text-slate-500">
              {error || "Unable to find this company."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => fetchCompanyDetails()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <Link
                to="/companies"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back to Companies
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================
  // NO COMPANY DATA
  // ==========================================

  if (!company) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <AlertCircle size={32} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              No Company Data
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              The company data could not be loaded. Please try again.
            </p>

            <Link
              to="/companies"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Back to Companies
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================
  // SAFE DATA EXTRACTION
  // ==========================================

  const companyName = safeString(
    company.company_name || company.name,
    "Company"
  );

  const websiteUrl = getWebsiteUrl(company.website);
  const location = safeString(company.location);
  const industry = safeString(company.industry);
  const companySize = safeString(company.company_size);
  const foundedYear = safeString(company.founded_year);

  const description = safeString(
    company.description,
    "This company has not added a description yet."
  );

  const totalOpenJobs =
    Number(company.open_jobs ?? openJobs.length) || 0;

  const visibleSimilarCompanies = (
    Array.isArray(similarCompanies) ? similarCompanies : []
  ).filter((item) => {
    if (!item) return false;

    const similarId = item.id ?? item.company_id;

    return (
      similarId != null &&
      String(similarId) !== String(id)
    );
  });

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="w-full flex-1">
        {/* ====================================== */}
        {/* HERO SECTION                           */}
        {/* ====================================== */}

        <section className="relative overflow-hidden bg-slate-900">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Companies
            </Link>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
              <CompanyInitial
                name={companyName}
                index={Number(company.id || id || 0)}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                    <CheckCircle2 size={13} />
                    Verified Profile
                  </span>

                  {industry && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 ring-1 ring-inset ring-white/15">
                      {industry}
                    </span>
                  )}
                </div>

                <h1 className="mt-4 break-words text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {companyName}
                </h1>

                <p className="mt-4 max-w-3xl whitespace-pre-line break-words text-sm leading-7 text-slate-300 sm:text-base">
                  {description.length > 220
                    ? `${description.slice(0, 220).trim()}…`
                    : description}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300">
                  {location && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin
                        size={16}
                        className="shrink-0 text-blue-400"
                      />
                      {location}
                    </span>
                  )}

                  {companySize && (
                    <span className="inline-flex items-center gap-2">
                      <Users
                        size={16}
                        className="shrink-0 text-blue-400"
                      />
                      {companySize}
                    </span>
                  )}

                  {foundedYear && (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="shrink-0 text-blue-400"
                      />
                      Founded {foundedYear}
                    </span>
                  )}
                </div>

                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    <Globe size={16} />
                    Visit Website
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* COMPANY STATS */}

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Open Positions",
                  value: totalOpenJobs,
                  icon: BriefcaseBusiness,
                },
                {
                  label: "Industry",
                  value: industry || "—",
                  icon: Building2,
                },
                {
                  label: "Location",
                  value: location || "—",
                  icon: MapPin,
                },
                {
                  label: "Company Size",
                  value: companySize || "—",
                  icon: Users,
                },
              ].map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <Icon size={18} className="text-blue-400" />

                    <p className="mt-3 truncate text-lg font-black text-white sm:text-xl">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================== */}
        {/* MAIN CONTENT SECTION                   */}
        {/* ====================================== */}

        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            {/* ================================== */}
            {/* LEFT COLUMN                        */}
            {/* ================================== */}

            <div className="min-w-0 space-y-6 lg:col-span-8">
              {/* ABOUT COMPANY */}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
                    <Building2 size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      About the employer
                    </p>

                    <h2 className="mt-0.5 text-xl font-black text-slate-900 sm:text-2xl">
                      About {companyName}
                    </h2>
                  </div>
                </div>

                <p className="mt-6 whitespace-pre-line break-words text-sm leading-7 text-slate-600 sm:text-base">
                  {description}
                </p>
              </section>

              {/* OPEN JOBS */}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Career opportunities
                    </p>

                    <h2 className="mt-0.5 text-2xl font-black text-slate-900">
                      Open Jobs
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {openJobs.length > 0
                        ? `${openJobs.length} position${
                            openJobs.length === 1 ? "" : "s"
                          } available`
                        : `Explore available positions at ${companyName}.`}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BriefcaseBusiness size={22} />
                  </div>
                </div>

                <div className="mt-6">
                  {openJobs.length === 0 ? (
                    <EmptyJobs />
                  ) : (
                    <div className="space-y-3">
                      {openJobs.map((job, index) => {
                        const jobId = getJobId(job);
                        const skills = getJobSkills(job?.skills);

                        return (
                          <article
                            key={jobId ?? index}
                            className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:border-slate-300 hover:shadow-md"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition group-hover:bg-blue-600">
                                    <BriefcaseBusiness size={20} />
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="break-words text-base font-black text-slate-900 transition group-hover:text-blue-700 sm:text-lg">
                                      {getJobTitle(job)}
                                    </h3>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                      {companyName}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  {job?.location && (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                      <MapPin size={13} />
                                      {job.location}
                                    </span>
                                  )}

                                  {job?.job_type && (
                                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                      {job.job_type}
                                    </span>
                                  )}

                                  {job?.work_mode && (
                                    <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                      {job.work_mode}
                                    </span>
                                  )}

                                  {job?.experience && (
                                    <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                      {job.experience}
                                    </span>
                                  )}
                                </div>

                                {job?.salary !== null &&
                                  job?.salary !== undefined &&
                                  job?.salary !== "" && (
                                    <p className="mt-3 text-sm font-bold text-emerald-700">
                                      {formatSalary(job.salary)}
                                    </p>
                                  )}

                                {skills.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {skills.slice(0, 6).map((skill, si) => (
                                      <span
                                        key={`${skill}-${si}`}
                                        className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600"
                                      >
                                        {skill}
                                      </span>
                                    ))}

                                    {skills.length > 6 && (
                                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                        +{skills.length - 6} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <Link
                                to={
                                  jobId != null
                                    ? `/jobs/${jobId}`
                                    : "/jobs"
                                }
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600"
                              >
                                {jobId != null
                                  ? "View Job"
                                  : "Browse Jobs"}
                                <ArrowUpRight size={15} />
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>

                {openJobs.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <Link
                      to={`/jobs?company=${encodeURIComponent(companyName)}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-800"
                    >
                      Explore More Jobs
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                )}
              </section>
            </div>

            {/* ================================== */}
            {/* RIGHT SIDEBAR                     */}
            {/* Normal page scrolling: NO STICKY   */}
            {/* ================================== */}

            <aside className="min-w-0 space-y-6 lg:col-span-4 lg:self-start">
              {/* COMPANY INFO */}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <Building2 size={18} />
                  </div>

                  <h2 className="text-lg font-black text-slate-900">
                    Company Info
                  </h2>
                </div>

                <dl className="mt-6 divide-y divide-slate-100">
                  {[
                    { label: "Name", value: companyName },
                    {
                      label: "Industry",
                      value: industry || "Not specified",
                    },
                    {
                      label: "Company Size",
                      value: companySize || "Not specified",
                    },
                    {
                      label: "Founded",
                      value: foundedYear || "Not specified",
                    },
                    {
                      label: "Location",
                      value: location || "Not specified",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-4 py-3"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {item.label}
                      </dt>

                      <dd className="max-w-[60%] break-words text-right text-sm font-bold text-slate-800">
                        {item.value}
                      </dd>
                    </div>
                  ))}

                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Open Positions
                    </dt>

                    <dd className="text-sm font-bold text-emerald-600">
                      {totalOpenJobs}
                    </dd>
                  </div>
                </dl>

                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Globe size={16} />
                    Visit Official Website
                    <ExternalLink size={13} />
                  </a>
                )}
              </section>

              {/* SIMILAR COMPANIES */}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Similar Companies
                    </h2>

                    <p className="text-xs text-slate-500">
                      Discover other employers
                    </p>
                  </div>
                </div>

                {visibleSimilarCompanies.length === 0 ? (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-8 text-center">
                    <Building2
                      size={26}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      No similar companies available yet.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-2">
                    {visibleSimilarCompanies.map((item, index) => {
                      const similarId = item.id ?? item.company_id;

                      const similarName =
                        item.company_name || item.name || "Company";

                      return (
                        <Link
                          key={similarId}
                          to={`/companies/${similarId}`}
                          className="group flex min-w-0 items-center gap-3 rounded-2xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50"
                        >
                          <CompanyInitial
                            name={similarName}
                            index={Number(similarId || index)}
                            size="small"
                          />

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-bold text-slate-800 transition group-hover:text-blue-700">
                              {similarName}
                            </h3>

                            {item.location && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                                <MapPin size={11} />
                                {item.location}
                              </p>
                            )}

                            <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                              {Number(item.open_jobs || 0)} Open Jobs
                            </p>
                          </div>

                          <ArrowUpRight
                            size={15}
                            className="shrink-0 text-slate-400 transition group-hover:text-blue-600"
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}

                <Link
                  to="/companies"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  View All Companies
                  <ArrowUpRight size={15} />
                </Link>
              </section>

              {/* CALL TO ACTION */}

              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/25 blur-3xl" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <TrendingUp size={22} />
                  </div>

                  <h2 className="mt-4 text-xl font-black">
                    Find Your Next Opportunity
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Explore job openings and find a role that matches your
                    skills.
                  </p>

                  <Link
                    to="/jobs"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    Explore Jobs
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyDetails;