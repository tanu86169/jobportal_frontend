import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import CareerHeroVisual from "../Components/CareerHeroVisual";

import {
  Search,
  MapPin,
  BriefcaseBusiness,
  ShieldCheck,
  Zap,
  ArrowRight,
  Laptop,
  Megaphone,
  Palette,
  TrendingUp,
  Coins,
  UserRound,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Building2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

import Footer from "../Components/Footer";
import Header from "../Components/Header";

import API_BASE from "../Config/api";

// =========================================================
// CATEGORY ICONS
// =========================================================

const categoryIcons = {
  "IT & Software": Laptop,
  Marketing: Megaphone,
  Design: Palette,
  Sales: TrendingUp,
  Finance: Coins,
  "Human Resources": UserRound,
};

// =========================================================
// FEATURES
// =========================================================

const features = [
  {
    title: "Verified Jobs",
    description:
      "Every job listing is carefully checked to provide genuine opportunities.",
    icon: ShieldCheck,
  },
  {
    title: "Safe & Secure",
    description:
      "Your profile and application data are protected with secure technology.",
    icon: ShieldCheck,
  },
  {
    title: "Top Companies",
    description: "Connect with leading companies and growing startups.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Easy to Apply",
    description: "Find relevant jobs and apply quickly with your profile.",
    icon: Zap,
  },
];

// =========================================================
// HOW IT WORKS
// =========================================================

const steps = [
  {
    number: "01",
    title: "Search Jobs",
    description: "Search jobs by title, skills, location and experience.",
    icon: Search,
  },
  {
    number: "02",
    title: "Apply",
    description: "Apply to jobs that match your skills and career goals.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Get Interviewed",
    description: "Connect with recruiters and attend interviews.",
    icon: MessageSquare,
  },
  {
    number: "04",
    title: "Get Hired",
    description: "Receive an offer and start your next career journey.",
    icon: CheckCircle2,
  },
];

// =========================================================
// HOME COMPONENT
// =========================================================

const Home = () => {
  const navigate = useNavigate();

  // =======================================================
  // STATES
  // =======================================================

  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);

  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  const [categorySearch, setCategorySearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =======================================================
  // FETCH HOME DATA
  // =======================================================

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError("");

      const requests = await Promise.allSettled([
        axios.get(`${API_BASE}/jobs/get-all.php`),
        axios.get(`${API_BASE}/companies/get-all.php`),
        axios.get(`${API_BASE}/categories/get-all.php`),
        axios.get(`${API_BASE}/articles/get-all.php`),
      ]);

      const [
        jobsResponse,
        companiesResponse,
        categoriesResponse,
        articlesResponse,
      ] = requests;

      // ===================================================
      // JOBS
      // ===================================================

      if (jobsResponse.status === "fulfilled") {
        const jobsData = jobsResponse.value.data;

        /*
         * Jobs API is used only for:
         * - Featured Jobs
         * - Job search
         *
         * Company listing/count is NOT calculated from jobs here.
         */

        const jobsList = Array.isArray(jobsData?.jobs)
          ? jobsData.jobs
          : Array.isArray(jobsData?.data?.jobs)
            ? jobsData.data.jobs
            : [];

        setJobs(jobsList);
      } else {
        console.error("Jobs API Error:", jobsResponse.reason);
        setJobs([]);
      }

      // ===================================================
      // COMPANIES
      // ===================================================

      if (companiesResponse.status === "fulfilled") {
        const companiesData = companiesResponse.value.data;

        /*
         * IMPORTANT:
         *
         * Home page and Companies page now use the same
         * Companies API.
         *
         * Backend already returns:
         *
         * company_name
         * status
         * open_jobs
         *
         * So we DO NOT calculate company jobs from jobs API.
         */

        const companiesList = Array.isArray(companiesData?.data?.companies)
          ? companiesData.data.companies
          : Array.isArray(companiesData?.companies)
            ? companiesData.companies
            : [];

        setCompanies(companiesList);
      } else {
        console.error("Companies API Error:", companiesResponse.reason);
        setCompanies([]);
      }

      // ===================================================
      // CATEGORIES
      // ===================================================

      if (categoriesResponse.status === "fulfilled") {
        const categoriesData = categoriesResponse.value.data;

        const allCategories = Array.isArray(categoriesData?.data?.categories)
          ? categoriesData.data.categories
          : Array.isArray(categoriesData?.categories)
            ? categoriesData.categories
            : [];

        const activeCategories = allCategories.filter((category) => {
          const status = String(category?.status ?? "")
            .trim()
            .toLowerCase();

          return status === "active";
        });

        setCategories(activeCategories);
      } else {
        console.error("Categories API Error:", categoriesResponse.reason);
        setCategories([]);
      }

      // ===================================================
      // ARTICLES
      // ===================================================

      if (articlesResponse.status === "fulfilled") {
        const articlesData = articlesResponse.value.data;

        const articlesList = Array.isArray(articlesData?.data?.articles)
          ? articlesData.data.articles
          : Array.isArray(articlesData?.articles)
            ? articlesData.articles
            : [];

        setArticles(articlesList);
      } else {
        console.error("Articles API Error:", articlesResponse.reason);
        setArticles([]);
      }

      // ===================================================
      // ALL API FAILED
      // ===================================================

      if (requests.every((request) => request.status === "rejected")) {
        setError("Unable to connect with backend APIs.");
      }
    } catch (err) {
      console.error("Home API Error:", err);
      setError("Unable to load home page data.");
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // USE EFFECT
  // =======================================================

  useEffect(() => {
    fetchHomeData();
  }, []);

  // =======================================================
  // SEARCH JOBS
  // =======================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (jobTitle.trim()) {
      params.set("search", jobTitle.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const query = params.toString();

    navigate(query ? `/jobs?${query}` : "/jobs");
  };

  // =======================================================
  // IMAGE URL HELPER
  // =======================================================

  const getAssetUrl = (value) => {
    if (!value) return "";

    const path = String(value).trim();
    if (!path) return "";

    // Full URL ko as-is rakhein
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    // Leading slash remove karein
    const cleanPath = path.replace(/^\/+/, "");

    // API URL se /api remove karein
    const baseUrl = API_BASE.replace(/\/api\/?$/i, "");

    return `${baseUrl}/${cleanPath}`;
  };

  // =======================================================
  // JOB HELPERS
  // =======================================================

  const getJobRole = (job) => {
    return (
      job?.job_title ||
      job?.role ||
      job?.title ||
      job?.job_role ||
      "Software Developer"
    );
  };

  const getJobCompany = (job) => {
    return job?.company_name || job?.company || job?.companyName || "Company";
  };

  const getCompanyLogo = (job) => {
    return getAssetUrl(
      job?.company_logo_url ||
        job?.company_logo ||
        job?.companyLogo ||
        job?.logo ||
        "",
    );
  };

  const getJobLocation = (job) => {
    return job?.location || job?.job_location || "Remote / On-site";
  };

  const getJobType = (job) => {
    return job?.job_type || job?.type || "Full Time";
  };

  const getJobExperience = (job) => {
    return job?.experience || job?.experience_level || "0-2 Yrs";
  };

  const getJobSalary = (job) => {
    return job?.salary || job?.salary_range || "Not disclosed";
  };

  const getJobOpenings = (job) => {
    const openings = Number(job?.vacancies);

    if (!Number.isFinite(openings) || openings <= 0) {
      return 1;
    }

    return openings;
  };

  // =======================================================
  // COMPANY HELPERS
  // =======================================================

  const getCompanyName = (company) => {
    return (
      company?.company_name || company?.name || company?.company || "Company"
    );
  };

  const getCompanyLogoFromCompany = (company) => {
    return getAssetUrl(
      company?.logo || company?.company_logo || company?.companyLogo || "",
    );
  };

  // =======================================================
  // COMPANY OPEN JOB COUNT
  // =======================================================

  /*
   * IMPORTANT:
   *
   * Do NOT calculate company jobs from `jobs`.
   *
   * Backend Companies API already sends:
   *
   * open_jobs: 2
   *
   * So we use that exact value.
   */

  const getCompanyJobCount = (company) => {
    const openJobs = Number(company?.open_jobs);

    if (!Number.isFinite(openJobs) || openJobs < 0) {
      return 0;
    }

    return openJobs;
  };

  // =======================================================
  // ARTICLE IMAGE
  // =======================================================

  const getArticleImage = (article) => {
    const imagePath =
      article?.image_url ||
      article?.image ||
      article?.thumbnail ||
      article?.featured_image ||
      article?.cover_image ||
      "";
    return getAssetUrl(imagePath);
  };

  // =======================================================
  // CATEGORY SEARCH
  // =======================================================

  const filteredCategories = useMemo(() => {
    const searchValue = categorySearch.trim().toLowerCase();

    if (!searchValue) {
      return categories;
    }

    return categories.filter((category) => {
      const categoryName = String(category?.name || "")
        .trim()
        .toLowerCase();

      return categoryName.includes(searchValue);
    });
  }, [categories, categorySearch]);

  // =======================================================
  // HOME PAGE LIMITS
  // =======================================================

  const homeCategories = categorySearch.trim()
    ? filteredCategories
    : showAllCategories
      ? categories
      : categories.slice(0, 6);

  const featuredJobs = jobs.slice(0, 4);

  /*
   * IMPORTANT:
   *
   * Home Top Companies now directly uses the same
   * companies array returned by Companies API.
   *
   * No fallback from jobs.
   */

  const topCompanies = companies.slice(0, 4);

  const homeArticles = articles.slice(0, 4);

  // =======================================================
  // CLEAR CATEGORY SEARCH
  // =======================================================

  const clearCategorySearch = () => {
    setCategorySearch("");
    setShowAllCategories(false);
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchHomeData}
              className="flex shrink-0 items-center gap-1 font-semibold hover:underline"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-16 xl:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] xl:gap-16">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-xs font-semibold text-blue-600 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Find Your Next Opportunity
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[48px] xl:text-6xl">
                Find Your <span className="block text-blue-600">Dream Job</span>
                & Build Your Future
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                Discover job opportunities from top companies. Find the right
                role that matches your skills.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-7 rounded-2xl bg-white p-2 shadow-xl shadow-blue-100/60 ring-1 ring-slate-100"
              >
                <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  {/* JOB SEARCH */}

                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 sm:px-4">
                    <Search size={20} className="shrink-0 text-slate-400" />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400">
                        Job title / skills
                      </p>

                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(event) => setJobTitle(event.target.value)}
                        placeholder="e.g. MERN Developer"
                        className="mt-1 block w-full min-w-0 truncate border-none bg-transparent p-0 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* LOCATION SEARCH */}

                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 sm:px-4">
                    <MapPin size={20} className="shrink-0 text-slate-400" />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400">
                        Location
                      </p>

                      <input
                        type="text"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="City or Remote"
                        className="mt-1 block w-full min-w-0 truncate border-none bg-transparent p-0 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex min-h-[58px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 lg:px-6"
                  >
                    <Search size={18} />

                    <span className="whitespace-nowrap">Search Jobs</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="relative hidden h-[500px] min-w-0 items-center justify-center lg:flex">
              <CareerHeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          CATEGORIES
      ================================================= */}

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* CATEGORY HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Explore opportunities
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Browse Jobs by Category
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Explore jobs by your preferred career category and find
                opportunities that match your skills.
              </p>
            </div>

            {/* CATEGORY SEARCH */}

            <div className="w-full lg:max-w-sm">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={categorySearch}
                  onChange={(event) => {
                    setCategorySearch(event.target.value);
                    setShowAllCategories(false);
                  }}
                  placeholder="Search categories..."
                  aria-label="Search job categories"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                {categorySearch && (
                  <button
                    type="button"
                    onClick={clearCategorySearch}
                    aria-label="Clear category search"
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CATEGORY RESULT INFO */}

          {!loading && categories.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-500">
                {categorySearch.trim() ? (
                  <>
                    Showing{" "}
                    <span className="font-bold text-slate-700">
                      {filteredCategories.length}
                    </span>{" "}
                    {filteredCategories.length === 1
                      ? "category"
                      : "categories"}{" "}
                    for{" "}
                    <span className="font-semibold text-blue-600">
                      "{categorySearch}"
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-slate-700">
                      {categories.length}
                    </span>{" "}
                    {categories.length === 1 ? "category" : "categories"}{" "}
                    available
                  </>
                )}
              </p>

              {categorySearch.trim() && filteredCategories.length > 0 && (
                <button
                  type="button"
                  onClick={clearCategorySearch}
                  className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* CATEGORY CONTENT */}

          <div className="mt-7">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="h-11 w-11 rounded-xl bg-slate-200" />

                    <div className="mt-4 h-4 w-24 rounded bg-slate-200" />

                    <div className="mt-2 h-3 w-16 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <BriefcaseBusiness size={25} />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  No categories available
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Job categories will appear here once they are added by the
                  administrator.
                </p>
              </div>
            ) : homeCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <Search size={25} />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  No category found
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  We couldn't find any category matching{" "}
                  <span className="font-semibold text-slate-700">
                    "{categorySearch}"
                  </span>
                  .
                </p>

                <button
                  type="button"
                  onClick={clearCategorySearch}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View All Categories
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
                  {homeCategories.map((category) => {
                    const categoryName = String(
                      category?.name || "Other",
                    ).trim();

                    const Icon =
                      categoryIcons[categoryName] || BriefcaseBusiness;

                    const jobCount = Number(category?.job_count) || 0;

                    return (
                      <Link
                        key={category.id || categoryName}
                        to={`/jobs?category=${encodeURIComponent(
                          categoryName,
                        )}`}
                        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-5"
                      >
                        <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-50 opacity-0 transition duration-300 group-hover:opacity-100" />

                        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md">
                          <Icon size={21} />
                        </div>

                        <h3 className="relative mt-4 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-slate-900 transition group-hover:text-blue-600">
                          {categoryName}
                        </h3>

                        <div className="relative mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-slate-500">
                            {jobCount} {jobCount === 1 ? "Job" : "Jobs"}
                          </p>

                          <ArrowRight
                            size={14}
                            className="text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {!categorySearch.trim() && categories.length > 6 && (
                  <div className="flex w-full justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAllCategories((visible) => !visible)
                      }
                      aria-expanded={showAllCategories}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      {showAllCategories ? "View Less" : "View All"}

                      {showAllCategories ? (
                        <ChevronUp
                          size={16}
                          strokeWidth={2}
                          className="text-blue-600"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          strokeWidth={2}
                          className="text-blue-600"
                        />
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          FEATURED JOBS
      ================================================= */}

     
<section className="bg-slate-50 py-12 sm:py-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Latest opportunities
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Featured Jobs
        </h2>
      </div>

      <Link
        to="/jobs"
        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
      >
        View All Jobs
        <ArrowRight size={16} />
      </Link>
    </div>

    <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {loading ? (
        Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {/* Company logo and Featured badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="h-6 w-16 rounded-full bg-slate-200" />
            </div>

            {/* Job title */}
            <div className="mt-5 h-5 w-3/4 rounded-md bg-slate-200" />

            {/* Company name */}
            <div className="mt-3 h-3 w-1/2 rounded-md bg-slate-200" />

            {/* Location */}
            <div className="mt-6 flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-slate-200" />
              <div className="h-3 w-3/4 rounded-md bg-slate-200" />
            </div>

            {/* Job type and experience */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-slate-200" />
              <div className="h-3 w-4/5 rounded-md bg-slate-200" />
            </div>

            {/* Salary */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded-md bg-slate-200" />
            </div>

            {/* Openings */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-slate-200" />
              <div className="h-3 w-1/3 rounded-md bg-slate-200" />
            </div>

            {/* View details footer */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="h-3 w-24 rounded-md bg-slate-200" />
              <div className="h-4 w-4 rounded bg-slate-200" />
            </div>
          </div>
        ))
      ) : featuredJobs.length === 0 ? (
        <div className="col-span-full py-10 text-center text-slate-500">
          No jobs available right now.
        </div>
      ) : (
        featuredJobs.map((job) => {
          const logo = getCompanyLogo(job);
          const role = getJobRole(job);
          const company = getJobCompany(job);
          const locationValue = getJobLocation(job);
          const openings = getJobOpenings(job);

          return (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 text-blue-600 ring-1 ring-slate-100">
                    {logo ? (
                      <img
                        src={logo}
                        alt={company}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Building2 size={24} />
                    )}
                  </div>

                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-600 ring-1 ring-green-100">
                    Featured
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                  {role}
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {company}
                </p>

                <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={15}
                      className="shrink-0 text-slate-400"
                    />
                    <span className="truncate">{locationValue}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness
                      size={15}
                      className="shrink-0 text-slate-400"
                    />
                    <span className="truncate">
                      {getJobType(job)} • {getJobExperience(job)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Coins size={15} className="shrink-0 text-blue-600" />
                    <span className="truncate">{getJobSalary(job)}</span>
                  </div>

                  <div className="flex items-center gap-2 font-semibold text-blue-600">
                    <Users size={15} className="shrink-0" />
                    <span>
                      {openings} {openings === 1 ? "Opening" : "Openings"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-blue-600">
                <span>View Details</span>

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
</section>

      {/* =================================================
          TOP COMPANIES
      ================================================= */}

     
<section className="py-12 sm:py-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Trusted by candidates
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Top Companies Hiring
        </h2>
      </div>

      {!loading && (
        <Link
          to="/companies"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      )}
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {loading ? (
        Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {/* Company logo and arrow */}
            <div className="flex items-start justify-between gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="h-5 w-5 rounded bg-slate-200" />
            </div>

            {/* Company name */}
            <div className="mt-5 h-4 w-3/4 rounded-md bg-slate-200" />

            {/* Open positions */}
            <div className="mt-3 h-3 w-1/2 rounded-md bg-slate-200" />
          </div>
        ))
      ) : topCompanies.length === 0 ? (
        <div className="col-span-full py-8 text-center text-slate-500">
          No companies available.
        </div>
      ) : (
        topCompanies.map((company) => {
          const companyName = getCompanyName(company);

          const companyLogo = getCompanyLogoFromCompany(company);

          /*
           * Use backend open_jobs.
           * Do not calculate from jobs API.
           */
          const jobCount = getCompanyJobCount(company);

          const companyKey =
            company.company_id ||
            company.id ||
            company.recruiter_id ||
            companyName;

          return (
            <Link
              key={companyKey}
              to={`/jobs?company=${encodeURIComponent(companyName)}`}
              className="group flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt={companyName}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Building2 size={23} />
                  )}
                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                />
              </div>

              <div className="mt-5 min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-800 group-hover:text-blue-600">
                  {companyName}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {jobCount} open{" "}
                  {jobCount === 1 ? "position" : "positions"}
                </p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  </div>
</section>

      {/* =================================================
          FEATURES
      ================================================= */}

      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-600">
              Why JobandJob?
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Everything You Need to Build Your Career
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              We make job searching simple, secure and effective for candidates
              and recruiters.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600">
              Simple process
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              How It Works
            </h2>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={21} />
                    </div>

                    <span className="text-3xl font-black text-slate-100">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================
          CAREER ADVICE
      ================================================= */}

      
<section className="bg-slate-50 py-12 sm:py-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Career resources
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Career Advice & Tips
        </h2>
      </div>

      <Link
        to="/career-advice"
        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
      >
        View All
        <ArrowRight size={16} />
      </Link>
    </div>

    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            {/* Article image skeleton */}
            <div className="h-44 w-full bg-slate-200" />

            <div className="p-5">
              {/* Category skeleton */}
              <div className="h-3 w-24 rounded-md bg-slate-200" />

              {/* Article title skeleton */}
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded-md bg-slate-200" />
                <div className="h-4 w-5/6 rounded-md bg-slate-200" />
              </div>

              {/* Read article skeleton */}
              <div className="mt-5 h-3 w-28 rounded-md bg-slate-200" />
            </div>
          </div>
        ))
      ) : homeArticles.length === 0 ? (
        <div className="col-span-full py-8 text-center text-slate-500">
          No articles available.
        </div>
      ) : (
        homeArticles.map((article) => {
          const articleImage = getArticleImage(article);

          return (
            <Link
              key={article.id}
              to={`/career-advice/${article.id}`}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="h-44 overflow-hidden bg-slate-100">
                {articleImage ? (
                  <img
                    src={articleImage}
                    alt={article.title || "Career article"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      console.error("Article image failed:", {
                        title: article.title,
                        image: article.image,
                        image_url: article.image_url,
                        thumbnail: article.thumbnail,
                        featured_image: article.featured_image,
                        finalURL: e.currentTarget.src,
                      });

                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <FileText size={40} />
                  </div>
                )}
              </div>

              <div className="p-5">
                <span className="text-xs font-semibold text-blue-600">
                  {article.category || "Career Tips"}
                </span>

                <h3 className="mt-2 line-clamp-2 text-base font-bold leading-6 text-slate-900">
                  {article.title || "Career Advice"}
                </h3>

                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
                  Read Article
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  </div>
</section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-blue-600 px-6 py-10 text-center sm:px-10 lg:flex lg:items-center lg:justify-between lg:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to take the next step in your career?
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              Join thousands of job seekers who found their dream role through
              our portal.
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-4 lg:mt-0">
            <Link
              to="/jobs"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
