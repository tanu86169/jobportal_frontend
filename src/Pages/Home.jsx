import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const categoryIcons = {
  "IT & Software": Laptop,
  "IT & Software Development": Laptop,
  Marketing: Megaphone,
  "Digital Marketing": Megaphone,
  Design: Palette,
  Sales: TrendingUp,
  "sales and marketing": TrendingUp,
  Finance: Coins,
  "Human Resources": UserRound,
  "Business development executives": TrendingUp,
};

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

const getList = (response, keys) => {
  let value = response?.data;
  for (const key of keys) value = value?.[key];
  return Array.isArray(value) ? value : [];
};

const getAssetUrl = (value) => {
  if (value == null || !String(value).trim()) return "";
  const path = String(value).trim().replace(/\\/g, "/");
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  const base = String(API_BASE || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");
  const cleanPath = path.replace(/^\/+/, "");
  // Accept either "uploads/logo.png" or "job-portal-api/uploads/logo.png".
  if (/^(uploads|assets|images)\//i.test(cleanPath))
    return `${base}/${cleanPath}`;
  if (/job-portal-api\//i.test(cleanPath))
    return `${base}/${cleanPath.split(/job-portal-api\//i).pop()}`;
  return `${base}/${cleanPath}`;
};

const firstText = (...values) =>
  values.find((value) => value != null && String(value).trim() !== "");

const getJobRole = (job) =>
  firstText(job?.job_title, job?.role, job?.title, job?.job_role) ||
  "Software Developer";

const getJobCompany = (job) => {
  const value = firstText(
    job?.company_name,
    typeof job?.company === "string" ? job.company : "",
    job?.companyName,
    job?.recruiter_company_name,
    job?.company?.company_name,
    job?.company?.name,
  );
  return value || "Company";
};

const getCompanyName = (company) =>
  firstText(company?.company_name, company?.name, company?.company) ||
  "Company";

const getCompanyLogo = (job) =>
  getAssetUrl(
    firstText(
      job?.company_logo_url,
      job?.company_logo,
      job?.companyLogo,
      job?.company_logo_path,
      job?.logo_url,
      job?.logo,
      job?.company?.logo_url,
      job?.company?.company_logo,
      job?.company?.logo,
    ),
  );

const getCompanyLogoFromCompany = (company) =>
  getAssetUrl(
    firstText(
      company?.company_logo_url,
      company?.company_logo,
      company?.company_logo_path,
      company?.companyLogo,
      company?.logo_url,
      company?.logo,
      company?.company?.logo_url,
      company?.company?.company_logo,
      company?.company?.logo,
    ),
  );

const getCompanyInitial = (name) => {
  const clean = String(name || "C").trim();
  return clean ? clean.charAt(0).toUpperCase() : "C";
};

const getJobLocation = (job) =>
  firstText(job?.location, job?.job_location, job?.city) || "Remote / On-site";
const getJobType = (job) =>
  firstText(job?.job_type, job?.type, job?.employment_type) || "Full Time";
const getJobExperience = (job) =>
  firstText(job?.experience, job?.experience_level) || "0-2 Yrs";

const formatSalaryAmount = (value) => {
  if (value == null || String(value).trim() === "") return "";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  return String(value).trim();
};
const getJobSalary = (job) => {
  const raw = firstText(
    job?.salary_display,
    job?.salary_range,
    job?.salary_text,
    job?.salary,
    job?.salary_package,
  );

  const unit = String(
    firstText(
      job?.salary_unit,
      job?.salary_period,
      job?.pay_period,
      job?.salary_type,
    ) || "",
  )
    .trim()
    .toLowerCase();

  const formatAmount = (value) =>
    Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const isMonthly =
    /\b(?:month|monthly|month-wise|months|per\s+month|pm)\b|p\.m\./i;

  const isYearly =
    /\b(?:year|yearly|annual|annually|annum|per\s+annum|pa)\b|p\.a\./i;

  const extractNumbers = (value) =>
    String(value).match(/\d[\d,]*(?:\.\d+)?/g) || [];

  const toLPA = (amount) => formatAmount(amount / 100000);

  // Salary already has a display value.
  if (raw != null && String(raw).trim() !== "") {
    const text = String(raw).trim();

    // Already displayed in LPA.
    if (/\blpa\b/i.test(text)) {
      return text;
    }

    // Monthly salary: remove existing units and add /month once.
    if (isMonthly.test(text) || isMonthly.test(unit)) {
      const cleaned = text
        .replace(/₹|rs\.?|inr/gi, "")
        .replace(
          /\s*(?:\/\s*(?:months?|mo)|per\s+months?|monthly|month-wise|p\.m\.|pm)\s*/gi,
          " ",
        )
        .replace(/\s*-\s*/g, " - ")
        .replace(/\s+/g, " ")
        .trim();

      return cleaned ? `₹${cleaned}/month` : "Salary not disclosed";
    }

    // Yearly salary: convert rupees into LPA.
    if (isYearly.test(text) || isYearly.test(unit)) {
      const numbers = extractNumbers(text);

      if (numbers.length > 0) {
        const amounts = numbers.map((n) =>
          Number(n.replace(/,/g, "")),
        );

        if (amounts.length >= 2) {
          return `${toLPA(amounts[0])} - ${toLPA(amounts[1])} LPA`;
        }

        return `${toLPA(amounts[0])} LPA`;
      }

      return text;
    }

    // Unknown format: keep unchanged.
    return text;
  }

  // Salary values coming directly from the database.
  const min = Number(job?.salary_min ?? job?.min_salary ?? 0);
  const max = Number(job?.salary_max ?? job?.max_salary ?? 0);

  const validMin = Number.isFinite(min) && min > 0 ? min : 0;
  const validMax = Number.isFinite(max) && max > 0 ? max : 0;

  if (validMin === 0 && validMax === 0) {
    return "Salary not disclosed";
  }

  const monthly = isMonthly.test(unit);
  const yearly =
    isYearly.test(unit) || /\blpa\b|\bpa\b/i.test(unit);

  const formatSalary = (amount) => {
    if (monthly) {
      return `₹${formatAmount(amount)}`;
    }

    if (yearly || amount >= 100000) {
      return `${toLPA(amount)} LPA`;
    }

    return `₹${formatAmount(amount)}`;
  };

  if (validMin > 0 && validMax > 0) {
    if (monthly) {
      return `₹${formatAmount(validMin)} - ₹${formatAmount(validMax)}/month`;
    }

    return `${formatSalary(validMin)} - ${formatSalary(validMax)}`;
  }

  if (validMin > 0) {
    return monthly
      ? `₹${formatAmount(validMin)}/month`
      : formatSalary(validMin);
  }

  return monthly
    ? `Up to ₹${formatAmount(validMax)}/month`
    : `Up to ${formatSalary(validMax)}`;
};


const getJobOpenings = (job) => {
  const value = Number(job?.vacancies ?? job?.openings);
  return Number.isFinite(value) && value > 0 ? value : 1;
};

const getCompanyJobCount = (company) => {
  const count = Number(company?.open_jobs);
  return Number.isFinite(count) && count >= 0 ? count : 0;
};

const CompanyLogo = ({ src, name, size = "normal" }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const sizeClass = size === "small" ? "h-12 w-12" : "h-12 w-12";
  return (
    <div
      className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-blue-50 font-bold text-blue-700 ring-1 ring-blue-100`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xl" aria-label={`${name} initial`}>
          {getCompanyInitial(name)}
        </span>
      )}
    </div>
  );
};

const SkeletonCard = ({ kind = "job" }) => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="h-12 w-12 rounded-xl bg-slate-200" />
      <div className="h-6 w-16 rounded-full bg-slate-200" />
    </div>
    <div className="mt-5 h-5 w-3/4 rounded-md bg-slate-200" />
    <div className="mt-3 h-3 w-1/2 rounded-md bg-slate-200" />
    {kind === "job" ? (
      <>
        <div className="mt-6 h-3 w-3/4 rounded-md bg-slate-200" />
        <div className="mt-4 h-3 w-4/5 rounded-md bg-slate-200" />
        <div className="mt-4 h-3 w-2/3 rounded-md bg-slate-200" />
      </>
    ) : null}
  </div>
);

const Home = () => {
  const navigate = useNavigate();
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

  const fetchHomeData = useCallback(async () => {
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

    if (jobsResponse.status === "fulfilled") {
      const data = jobsResponse.value.data;
      const list = Array.isArray(data?.jobs)
        ? data.jobs
        : Array.isArray(data?.data?.jobs)
          ? data.data.jobs
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setJobs(list);
    } else {
      console.error("Jobs API Error:", jobsResponse.reason);
      setJobs([]);
    }

    if (companiesResponse.status === "fulfilled") {
      const data = companiesResponse.value.data;
      const list = Array.isArray(data?.data?.companies)
        ? data.data.companies
        : Array.isArray(data?.companies)
          ? data.companies
          : [];
      setCompanies(list);
    } else {
      console.error("Companies API Error:", companiesResponse.reason);
      setCompanies([]);
    }

    if (categoriesResponse.status === "fulfilled") {
      const data = categoriesResponse.value.data;
      const list = Array.isArray(data?.data?.categories)
        ? data.data.categories
        : Array.isArray(data?.categories)
          ? data.categories
          : [];
      setCategories(
        list.filter(
          (item) =>
            String(item?.status ?? "active")
              .trim()
              .toLowerCase() === "active",
        ),
      );
    } else {
      console.error("Categories API Error:", categoriesResponse.reason);
      setCategories([]);
    }

    if (articlesResponse.status === "fulfilled") {
      const data = articlesResponse.value.data;
      const list = Array.isArray(data?.data?.articles)
        ? data.data.articles
        : Array.isArray(data?.articles)
          ? data.articles
          : [];
      setArticles(list);
    } else {
      console.error("Articles API Error:", articlesResponse.reason);
      setArticles([]);
    }

    if (requests.every((request) => request.status === "rejected"))
      setError("Unable to connect with backend APIs.");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (jobTitle.trim()) params.set("search", jobTitle.trim());
    if (location.trim()) params.set("location", location.trim());
    const query = params.toString();
    navigate(query ? `/jobs?${query}` : "/jobs");
  };

  const getArticleImage = (article) =>
    getAssetUrl(
      firstText(
        article?.image_url,
        article?.image,
        article?.thumbnail,
        article?.featured_image,
        article?.cover_image,
      ),
    );

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    return query
      ? categories.filter((item) =>
          String(item?.name || "")
            .toLowerCase()
            .includes(query),
        )
      : categories;
  }, [categories, categorySearch]);

  const homeCategories = categorySearch.trim()
    ? filteredCategories
    : showAllCategories
      ? categories
      : categories.slice(0, 6);
  // Homepage par sirf 4 jobs dikhengi
  const featuredJobs = jobs.slice(0, 4);
  const topCompanies = useMemo(() => {
    let list = Array.isArray(companies) ? [...companies] : [];
    if (list.length < 4 && jobs.length > 0) {
      const existingNames = new Set(
        list.map((c) => String(getCompanyName(c)).toLowerCase().trim()),
      );
      jobs.forEach((job) => {
        const cName = getJobCompany(job);
        if (
          cName &&
          cName !== "Company" &&
          !existingNames.has(cName.toLowerCase())
        ) {
          existingNames.add(cName.toLowerCase());
          list.push({
            id: job.recruiter_id || job.id,
            company_id: job.recruiter_id || job.id,
            company_name: cName,
            name: cName,
            logo: getCompanyLogo(job),
            logo_url: getCompanyLogo(job),
            location: getJobLocation(job),
            open_jobs: jobs.filter(
              (j) => getJobCompany(j).toLowerCase() === cName.toLowerCase(),
            ).length,
          });
        }
      });
    }
    return list.slice(0, 8);
  }, [companies, jobs]);
  const homeArticles = articles.slice(0, 4);

  const clearCategorySearch = () => {
    setCategorySearch("");
    setShowAllCategories(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {error && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchHomeData}
              className="flex shrink-0 items-center gap-1 font-semibold hover:underline"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-16 xl:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] xl:gap-16">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-xs font-semibold text-blue-600 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />{" "}
                Find Your Next Opportunity
              </div>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[48px] xl:text-6xl">
                Find Your <span className="block text-blue-600">Dream Job</span>{" "}
                &amp; Build Your Future
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
                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 sm:px-4">
                    <Search size={20} className="shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400">
                        Job title / skills
                      </p>
                      <input
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. MERN Developer"
                        className="mt-1 block w-full min-w-0 truncate border-none bg-transparent p-0 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 sm:px-4">
                    <MapPin size={20} className="shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400">
                        Location
                      </p>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
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

      {/* CATEGORIES */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <div className="w-full lg:max-w-sm">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
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

          <div className="mt-7">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
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
                    const name = String(category?.name || "Other").trim();
                    const Icon = categoryIcons[name] || BriefcaseBusiness;
                    const count = Number(category?.job_count) || 0;
                    return (
                      <Link
                        key={category.id || name}
                        to={`/jobs?category=${encodeURIComponent(name)}`}
                        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-5"
                      >
                        <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-50 opacity-0 transition duration-300 group-hover:opacity-100" />
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md">
                          <Icon size={21} />
                        </div>
                        <h3 className="relative mt-4 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-slate-900 transition group-hover:text-blue-600">
                          {name}
                        </h3>
                        <div className="relative mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-slate-500">
                            {count} {count === 1 ? "Job" : "Jobs"}
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
                      onClick={() => setShowAllCategories((v) => !v)}
                      aria-expanded={showAllCategories}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      {showAllCategories ? "View Less" : "View All"}
                      {showAllCategories ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}

      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
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

          {/* Featured Jobs Grid */}
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : featuredJobs.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-500">
                No jobs available right now.
              </div>
            ) : (
              featuredJobs.map((job, index) => {
                const company = getJobCompany(job);
                const role = getJobRole(job);
                const openings = getJobOpenings(job);
                const jobId = job.id || job.job_id;

                // Company name ka first letter
                const firstLetter = company?.trim()?.charAt(0) || "C";

                // Pastel badge colors
                const badgeColors = [
                  "bg-blue-100 text-blue-700",
                  "bg-violet-100 text-violet-700",
                  "bg-emerald-100 text-emerald-800",
                  "bg-pink-100 text-pink-600",
                  "bg-amber-100 text-amber-700",
                  "bg-teal-100 text-teal-700",
                  "bg-fuchsia-100 text-fuchsia-700",
                  "bg-sky-100 text-sky-700",
                ];

                // Gradient top border colors
                const accentColors = [
                  "from-blue-600 to-cyan-400",
                  "from-indigo-600 to-sky-400",
                  "from-emerald-500 to-teal-400",
                  "from-fuchsia-500 to-pink-400",
                  "from-amber-400 to-orange-500",
                  "from-teal-500 to-cyan-400",
                  "from-purple-500 to-fuchsia-400",
                  "from-sky-500 to-blue-400",
                ];

                const colorIndex = index % badgeColors.length;

                return (
                  <div
                    key={jobId || `${role}-${company}`}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/jobs/${jobId}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/jobs/${jobId}`);
                      }
                    }}
                    className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {/* Colored Top Border */}
                    <div
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentColors[colorIndex]}`}
                    />

                    <div>
                      {/* Company Initial + Name */}
                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="flex min-w-0 items-center gap-3">
                          {/* Colored Company Initial */}
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold uppercase shadow-sm ring-1 ring-black/5 transition duration-300 group-hover:scale-105 ${badgeColors[colorIndex]}`}
                          >
                            {firstLetter}
                          </div>

                          {/* Company Name */}
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-bold text-slate-900 transition group-hover:text-blue-600">
                              {company}
                            </p>

                            <span
                              className={`mt-2 inline-block rounded-lg px-2.5 py-1 text-[10px] font-semibold ${badgeColors[colorIndex]}`}
                            >
                              Featured Company
                            </span>
                          </div>
                        </div>

                        <ArrowRight
                          size={18}
                          className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                        />
                      </div>

                      {/* Job Role */}
                      <h3 className="mt-5 text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                        {role}
                      </h3>

                      {/* Job Information */}
                      <div className="mt-4 space-y-3 text-xs text-slate-600">
                        {/* Location */}
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={15}
                            className="shrink-0 text-slate-400"
                          />
                          <span className="truncate">
                            {getJobLocation(job)}
                          </span>
                        </div>

                        {/* Job Type and Experience */}
                        <div className="flex items-center gap-2">
                          <BriefcaseBusiness
                            size={15}
                            className="shrink-0 text-slate-400"
                          />
                          <span className="truncate">
                            {getJobType(job)} • {getJobExperience(job)}
                          </span>
                        </div>

                        {/* Salary */}
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Coins size={15} className="shrink-0 text-blue-600" />
                          <span>{getJobSalary(job)}</span>
                        </div>

                        {/* Openings */}
                        <div className="flex items-center gap-2 font-semibold text-blue-600">
                          <Users size={15} className="shrink-0" />
                          <span>
                            {openings} {openings === 1 ? "Opening" : "Openings"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Details */}
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

      {/* TOP COMPANIES */}

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wide text-blue-600">
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

          {/* Companies Grid */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} kind="company" />
              ))
            ) : topCompanies.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500">
                No companies available.
              </div>
            ) : (
              topCompanies.map((company, index) => {
                const name = getCompanyName(company);
                const count = getCompanyJobCount(company);
                const companyId = company.company_id || company.id;

                const key = companyId || company.recruiter_id || name || index;

                const target = companyId
                  ? `/companies/${companyId}`
                  : `/jobs?company=${encodeURIComponent(name)}`;

                const firstLetter = name?.trim()?.charAt(0) || "C";

                // Different pastel colors for company initials
                const badgeColors = [
                  "bg-blue-100 text-blue-700",
                  "bg-violet-100 text-violet-700",
                  "bg-emerald-100 text-emerald-800",
                  "bg-pink-100 text-pink-600",
                  "bg-amber-100 text-amber-700",
                  "bg-teal-100 text-teal-700",
                  "bg-fuchsia-100 text-fuchsia-700",
                  "bg-sky-100 text-sky-700",
                ];

                const accentColors = [
                  "from-blue-600 to-cyan-400",
                  "from-indigo-600 to-sky-400",
                  "from-emerald-500 to-teal-400",
                  "from-fuchsia-500 to-pink-400",
                  "from-amber-400 to-orange-500",
                  "from-teal-500 to-cyan-400",
                  "from-purple-500 to-fuchsia-400",
                  "from-sky-500 to-blue-400",
                ];

                const colorIndex = index % badgeColors.length;

                return (
                  <Link
                    key={key}
                    to={target}
                    className="group relative flex min-h-[170px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    {/* Colored top border */}
                    <div
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentColors[colorIndex]}`}
                    />

                    {/* Company Initial + Name + Arrow */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Colored initial badge */}
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold uppercase shadow-sm ring-1 ring-black/5 transition duration-300 group-hover:scale-105 ${badgeColors[colorIndex]}`}
                        >
                          {firstLetter}
                        </div>

                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-bold text-slate-900 transition group-hover:text-blue-600">
                            {name}
                          </h3>

                          <span
                            className={`mt-2 inline-block rounded-lg px-2.5 py-1 text-[11px] font-semibold ${badgeColors[colorIndex]}`}
                          >
                            {company.industry || company.category || "Company"}
                          </span>
                        </div>
                      </div>

                      <ArrowRight
                        size={18}
                        className="mt-1 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-blue-600"
                      />
                    </div>

                    {/* Open positions */}
                    <div className="mt-5 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-500">
                        <span className="font-bold text-slate-700">
                          {count}
                        </span>{" "}
                        open {count === 1 ? "position" : "positions"}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
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
          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* CAREER ADVICE */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Career resources
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Career Advice &amp; Tips
              </h2>
            </div>
            <Link
              to="/career-advice"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  <div className="h-44 bg-slate-200" />
                  <div className="p-5">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="mt-4 h-4 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
                    <div className="mt-5 h-3 w-28 rounded bg-slate-200" />
                  </div>
                </div>
              ))
            ) : homeArticles.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500">
                No articles available.
              </div>
            ) : (
              homeArticles.map((article) => {
                const image = getArticleImage(article);
                return (
                  <Link
                    key={article.id || article.article_id || article.title}
                    to={`/career-advice/${article.id || article.article_id}`}
                    className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                  >
                    <div className="h-44 overflow-hidden bg-slate-100">
                      {image ? (
                        <img
                          src={image}
                          alt={article.title || "Career article"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(e) => {
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
                        Read Article <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
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
