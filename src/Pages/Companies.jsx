import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  Building2,
  MapPin,
  Briefcase,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Users,
  Calendar,
  X,
  RefreshCw,
} from "lucide-react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";

// =====================================================
// API CONFIGURATION
// =====================================================

import API_BASE from "../Config/api";

const COMPANIES_API = `${API_BASE}/companies/get-all.php`;

// =====================================================
// HELPERS
// =====================================================

const getFirstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

// =====================================================
// COMPANY ID
// =====================================================

const getCompanyId = (company) =>
  getFirstValue(
    company?.id,
    company?.company_id,
    company?.companyId
  );

// =====================================================
// COMPANY NAME
// =====================================================

const getCompanyName = (company) =>
  getFirstValue(
    company?.company_name,
    company?.name,
    company?.company,
    company?.name_of_company
  ) || "Untitled Company";

// =====================================================
// COMPANY DESCRIPTION
// =====================================================

const getCompanyDescription = (company) => {
  const description = getFirstValue(
    company?.description,
    company?.company_description,
    company?.about,
    company?.about_company,
    company?.company_about,
    company?.bio
  );

  if (!description) {
    return "No company description provided.";
  }

  return String(description).trim();
};

// =====================================================
// LOGO URL
// =====================================================

const getLogoUrl = (logo) => {
  if (!logo) return null;

  let value = String(logo).trim();

  if (!value) return null;

  // Full URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Protocol relative URL
  if (value.startsWith("//")) {
    return `${window.location.protocol}${value}`;
  }

  // Normalize Windows slash
  value = value.replace(/\\/g, "/");

  // Remove leading slash
  value = value.replace(/^\/+/, "");

  // Already contains backend path
  if (value.includes("job_portal/job-portal-api/")) {
    const index = value.indexOf(
      "job_portal/job-portal-api/"
    );

    value = value.substring(
      index + "job_portal/job-portal-api/".length
    );
  }

  return `${API_BASE_URL}/${value}`;
};

// =====================================================
// WEBSITE URL
// =====================================================

const getWebsiteUrl = (website) => {
  if (!website) return null;

  let value = String(website).trim();

  if (!value) return null;

  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  return value;
};

// =====================================================
// OPEN JOBS
// =====================================================

const getOpenJobs = (company) => {
  const value = getFirstValue(
    company?.open_jobs,
    company?.open_jobs_count,
    company?.total_open_jobs,
    company?.job_count,
    company?.jobs_count
  );

  const number = Number(value ?? 0);

  return Number.isFinite(number) ? number : 0;
};

// =====================================================
// FALLBACK LETTER
// =====================================================

const getCompanyLogoFallback = (companyName) =>
  String(companyName || "C")
    .charAt(0)
    .toUpperCase();

// =====================================================
// COMPONENT
// =====================================================

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  // ===================================================
  // FETCH COMPANIES
  // ===================================================

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(COMPANIES_API, {
        timeout: 15000,
        headers: {
          Accept: "application/json",
        },
      });

      console.log(
        "Companies API Response:",
        response.data
      );

      const result = response.data;

      if (result?.success === false) {
        throw new Error(
          result?.message ||
            "Unable to fetch companies."
        );
      }

      let rawData = [];

      // -----------------------------------------------
      // RESPONSE FORMAT 1
      // -----------------------------------------------

      if (Array.isArray(result)) {
        rawData = result;
      }

      // -----------------------------------------------
      // RESPONSE FORMAT 2
      // -----------------------------------------------

      else if (Array.isArray(result?.companies)) {
        rawData = result.companies;
      }

      // -----------------------------------------------
      // RESPONSE FORMAT 3
      // -----------------------------------------------

      else if (Array.isArray(result?.data)) {
        rawData = result.data;
      }

      // -----------------------------------------------
      // RESPONSE FORMAT 4
      // -----------------------------------------------

      else if (
        Array.isArray(result?.data?.companies)
      ) {
        rawData = result.data.companies;
      }

      // -----------------------------------------------
      // RESPONSE FORMAT 5
      // -----------------------------------------------

      else if (
        Array.isArray(result?.data?.data)
      ) {
        rawData = result.data.data;
      }

      // -----------------------------------------------
      // VALID COMPANIES
      // -----------------------------------------------

      const validCompanies = rawData.filter(
        (company) =>
          company &&
          typeof company === "object" &&
          getCompanyName(company) !==
            "Untitled Company"
      );

      setCompanies(validCompanies);
    } catch (err) {
      console.error(
        "Companies API Error:",
        err.response?.data || err.message
      );

      setCompanies([]);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredCompanies = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return companies;
    }

    return companies.filter((company) => {
      const searchableValues = [
        getCompanyName(company),
        getCompanyDescription(company),
        company?.location,
        company?.industry,
        company?.company_size,
        company?.website,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [companies, search]);

  // ===================================================
  // VISIBLE COMPANIES
  // ===================================================

  const visibleCompanies = useMemo(() => {
    if (search.trim() || showAll) {
      return filteredCompanies;
    }

    return filteredCompanies.slice(0, 4);
  }, [
    filteredCompanies,
    search,
    showAll,
  ]);

  // ===================================================
  // CLEAR SEARCH
  // ===================================================

  const clearSearch = () => {
    setSearch("");
    setShowAll(false);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">

      <Header />

      <main className="flex-1">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

            <div className="mx-auto max-w-3xl text-center">

              {/* ICON */}

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                <Building2 size={28} />
              </div>

              {/* LABEL */}

              <p className="mt-5 text-sm font-bold uppercase tracking-wider text-blue-600">
                Company Directory
              </p>

              {/* TITLE */}

              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                Explore Companies
              </h1>

              {/* DESCRIPTION */}

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Discover companies, explore their profiles,
                and find open positions that match your
                skills and career goals.
              </p>

              {/* SEARCH */}

              <div className="relative mx-auto mt-8 max-w-2xl">

                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowAll(false);
                  }}
                  placeholder="Search by company, location, industry..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}

              </div>

              {/* SEARCH COUNT */}

              {!loading &&
                !error &&
                search && (
                  <p className="mt-4 text-sm text-slate-500">
                    Found{" "}
                    <span className="font-bold text-slate-800">
                      {filteredCompanies.length}
                    </span>{" "}
                    {filteredCompanies.length === 1
                      ? "company"
                      : "companies"}
                  </p>
                )}

            </div>

          </div>

        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

          {/* =================================================
              LOADING
          ================================================= */}

         {/* =================================================
    SKELETON LOADING
================================================= */}

{loading && (
  <div>
    {/* Skeleton Directory Header */}
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-full">
        <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />

        <div className="mt-3 h-8 w-64 max-w-full animate-pulse rounded-lg bg-slate-200" />

        <div className="mt-3 h-4 w-56 max-w-full animate-pulse rounded bg-slate-200" />
      </div>
    </div>

    {/* Skeleton Company Cards */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex h-full min-h-[350px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Top Accent */}
          <div className="h-1.5 bg-slate-200" />

          <div className="flex flex-1 flex-col p-6">
            {/* Company Logo + Name */}
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-slate-200" />

              <div className="min-w-0 flex-1">
                <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

                <div className="mt-3 h-4 w-2/5 animate-pulse rounded bg-slate-200" />

                <div className="mt-3 h-6 w-24 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>

            {/* Description */}
            <div className="mt-5 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>

            {/* Company Details */}
            <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-3/5 animate-pulse rounded bg-slate-200" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-3/5 animate-pulse rounded bg-slate-200" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-auto flex items-center gap-3 pt-6">
              <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-200" />

              <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertCircle size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Unable to Load Companies
              </h3>

              <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchCompanies}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            filteredCompanies.length === 0 && (
              <div className="py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Building2 size={30} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  No Companies Found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "No companies match your search. Try another company name, location or industry."
                    : "No registered companies are available in the system yet."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Clear Search
                  </button>
                )}

              </div>
            )}

          {/* =================================================
              COMPANIES
          ================================================= */}

          {!loading &&
            !error &&
            filteredCompanies.length > 0 && (
              <>

                {/* DIRECTORY HEADER */}

                <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Discover employers
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      Companies Directory
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Showing{" "}
                      <span className="font-bold text-slate-800">
                        {visibleCompanies.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-slate-800">
                        {filteredCompanies.length}
                      </span>{" "}
                      companies
                    </p>

                  </div>

                </div>

                {/* =================================================
                    COMPANY GRID
                ================================================= */}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                  {visibleCompanies.map(
                    (company, index) => {

                      const companyId =
                        getCompanyId(company);

                      const companyName =
                        getCompanyName(company);

                      const description =
                        getCompanyDescription(company);

                      const logoUrl =
                        getLogoUrl(company?.logo);

                      const websiteUrl =
                        getWebsiteUrl(
                          company?.website
                        );

                      const openJobs =
                        getOpenJobs(company);

                      const companyKey =
                        companyId ??
                        company?.recruiter_id ??
                        `${companyName}-${index}`;

                      const detailsPath =
                        companyId
                          ? `/companies/${encodeURIComponent(
                              String(companyId)
                            )}`
                          : `/jobs?company=${encodeURIComponent(
                              companyName
                            )}`;

                      return (
                        <article
                          key={companyKey}
                          className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                        >

                          {/* TOP ACCENT */}

                          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400" />

                          <div className="flex flex-1 flex-col p-6">

                            {/* =================================================
                                COMPANY HEADER
                            ================================================= */}

                            <div className="flex items-start gap-4">

                              {/* LOGO */}

                              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                                {logoUrl ? (
                                  <img
                                    src={logoUrl}
                                    alt={`${companyName} Logo`}
                                    className="h-full w-full object-contain p-2"
                                    onError={(event) => {
                                      event.currentTarget.style.display =
                                        "none";

                                      const fallback =
                                        event.currentTarget
                                          .nextElementSibling;

                                      if (fallback) {
                                        fallback.style.display =
                                          "flex";
                                      }
                                    }}
                                  />
                                ) : null}

                                <div
                                  className="h-full w-full items-center justify-center bg-blue-50 text-2xl font-black text-blue-600"
                                  style={{
                                    display: logoUrl
                                      ? "none"
                                      : "flex",
                                  }}
                                >
                                  {getCompanyLogoFallback(
                                    companyName
                                  )}
                                </div>

                              </div>

                              {/* COMPANY NAME */}

                              <div className="min-w-0 flex-1">

                                <h3
                                  title={companyName}
                                  className="line-clamp-2 text-lg font-black leading-6 text-slate-900"
                                >
                                  {companyName}
                                </h3>

                                {company?.industry && (
                                  <span className="mt-2 inline-flex max-w-full truncate rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                    {company.industry}
                                  </span>
                                )}

                              </div>

                            </div>

                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <div className="mt-4">

                              <p
                                title={description}
                                className="line-clamp-2 text-sm leading-6 text-slate-600"
                              >
                                {description}
                              </p>

                            </div>

                            {/* =================================================
                                META
                            ================================================= */}

                            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">

                              {/* LOCATION */}

                              {company?.location && (
                                <div className="flex items-center gap-2.5 text-sm text-slate-600">

                                  <MapPin
                                    size={16}
                                    className="shrink-0 text-slate-400"
                                  />

                                  <span className="truncate">
                                    {company.location}
                                  </span>

                                </div>
                              )}

                              {/* EMPLOYEES */}

                              {company?.company_size && (
                                <div className="flex items-center gap-2.5 text-sm text-slate-600">

                                  <Users
                                    size={16}
                                    className="shrink-0 text-slate-400"
                                  />

                                  <span>
                                    {company.company_size}{" "}
                                    Employees
                                  </span>

                                </div>
                              )}

                              {/* OPEN JOBS */}

                              <div className="flex items-center gap-2.5 text-sm font-bold text-emerald-600">

                                <Briefcase
                                  size={16}
                                  className="shrink-0"
                                />

                                <span>
                                  {openJobs}{" "}
                                  {openJobs === 1
                                    ? "Open Position"
                                    : "Open Positions"}
                                </span>

                              </div>

                              {/* FOUNDED */}

                              {company?.founded_year && (
                                <div className="flex items-center gap-2.5 text-sm text-slate-500">

                                  <Calendar
                                    size={16}
                                    className="shrink-0 text-slate-400"
                                  />

                                  <span>
                                    Founded in{" "}
                                    {company.founded_year}
                                  </span>

                                </div>
                              )}

                            </div>

                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="mt-auto flex items-center gap-3 pt-5">

                              <Link
                                to={detailsPath}
                                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                              >
                                View Details
                              </Link>

                              {websiteUrl && (
                                <a
                                  href={websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Visit Official Website"
                                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <ExternalLink size={17} />
                                </a>
                              )}

                            </div>

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>

                {/* =================================================
                    VIEW ALL
                ================================================= */}

                {!search.trim() &&
                  filteredCompanies.length > 4 && (
                    <div className="mt-10 flex justify-center">

                      <button
                        type="button"
                        onClick={() =>
                          setShowAll(
                            (previous) => !previous
                          )
                        }
                        className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600"
                      >
                        {showAll
                          ? "Show Less"
                          : `View All Companies (${
                              filteredCompanies.length -
                              4
                            } More)`}
                      </button>

                    </div>
                  )}

              </>
            )}

        </section>

      </main>

      <Footer />

    </div>
  );
};

export default Companies;