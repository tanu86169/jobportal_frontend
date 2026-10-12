import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  LifeBuoy,
  Mail,
  MessageCircle,
  Search,
  ShieldQuestion,
  BriefcaseBusiness,
  UserRound,
  Users,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Phone,
  HelpCircle,
  FileText,
  X,
} from "lucide-react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";

// =========================================================
// API
// =========================================================

import API_BASE from "../Config/api";

const FAQ_API = `${API_BASE}/help/faqs.php`;

const SETTINGS_API = `${API_BASE}/admin/settings.php`;

// =========================================================
// DEFAULT SETTINGS
// =========================================================

const DEFAULT_SETTINGS = {
  support_email: "support@jobportal.com",
  support_phone: "",
  contact_email: "support@jobportal.com",

  help_title: "How can we help?",
  help_description:
    "Find answers about jobs, applications, recruiter accounts, profiles and everything you need to get the most from JobPortal.",
};

// =========================================================
// HELPERS
// =========================================================

const isTruthy = (value) => {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "TRUE"
  );
};

const normalizeCategory = (category) => {
  const value = String(category || "").trim();

  return value || "General";
};

const normalizeFaq = (faq, index = 0) => {
  return {
    ...faq,

    id: faq?.id ?? faq?.faq_id ?? `faq-${index}`,

    category: normalizeCategory(faq?.category),

    question: String(
      faq?.question || faq?.title || ""
    ).trim(),

    answer: String(
      faq?.answer || faq?.description || ""
    ).trim(),

    is_featured: isTruthy(faq?.is_featured),

    status: faq?.status || "active",

    sort_order: Number(faq?.sort_order) || 0,
  };
};

// =========================================================
// CATEGORY ICON
// =========================================================

const getCategoryIcon = (category) => {
  const value = String(category || "").toLowerCase();

  if (
    value.includes("recruit") ||
    value.includes("employer") ||
    value.includes("company") ||
    value.includes("job")
  ) {
    return BriefcaseBusiness;
  }

  if (
    value.includes("account") ||
    value.includes("profile") ||
    value.includes("candidate")
  ) {
    return UserRound;
  }

  if (
    value.includes("application") ||
    value.includes("apply") ||
    value.includes("hiring")
  ) {
    return CheckCircle2;
  }

  if (
    value.includes("safety") ||
    value.includes("trust") ||
    value.includes("security")
  ) {
    return ShieldQuestion;
  }

  if (
    value.includes("support") ||
    value.includes("contact")
  ) {
    return MessageCircle;
  }

  if (
    value.includes("team") ||
    value.includes("community")
  ) {
    return Users;
  }

  return BookOpen;
};

// =========================================================
// COMPONENT
// =========================================================

const HelpsAndSupport = () => {
  // =======================================================
  // STATE
  // =======================================================

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [openQuestion, setOpenQuestion] =
    useState(null);

  const [faqs, setFaqs] = useState([]);

  const [categories, setCategories] =
    useState([]);

  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [loading, setLoading] =
    useState(true);

  const [settingsLoading, setSettingsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  // =======================================================
  // FETCH FAQS
  // =======================================================

  const fetchFaqs = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(FAQ_API, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            `FAQ API returned an invalid response. HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message ||
              "Unable to load help articles."
          );
        }

        // ---------------------------------------------------
        // Support multiple API response formats
        // ---------------------------------------------------

        const rawFaqs = Array.isArray(data?.faqs)
          ? data.faqs
          : Array.isArray(data?.data?.faqs)
          ? data.data.faqs
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const normalizedFaqs = rawFaqs
          .map(normalizeFaq)
          .filter(
            (faq) =>
              faq.question &&
              faq.answer
          )
          .sort((a, b) => {
            if (
              a.sort_order !==
              b.sort_order
            ) {
              return (
                a.sort_order -
                b.sort_order
              );
            }

            return (
              Number(a.id) -
              Number(b.id)
            );
          });

        // ---------------------------------------------------
        // Categories from API
        // ---------------------------------------------------

        const rawCategories =
          Array.isArray(data?.categories)
            ? data.categories
            : Array.isArray(
                data?.data?.categories
              )
            ? data.data.categories
            : [];

        const apiCategories =
          rawCategories
            .map((category) =>
              normalizeCategory(
                typeof category === "object"
                  ? category?.name ||
                      category?.category
                  : category
              )
            )
            .filter(Boolean);

        // ---------------------------------------------------
        // Categories from FAQ records
        // ---------------------------------------------------

        const faqCategories =
          normalizedFaqs.map(
            (faq) => faq.category
          );

        const finalCategories = [
          ...new Set([
            ...apiCategories,
            ...faqCategories,
          ]),
        ].sort((a, b) =>
          a.localeCompare(b)
        );

        setFaqs(normalizedFaqs);
        setCategories(finalCategories);
      } catch (error) {
        console.log(
          "Help FAQ Error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load help articles."
        );

        setFaqs([]);
        setCategories([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // =======================================================
  // FETCH SETTINGS
  // =======================================================

  const fetchSettings = useCallback(
    async () => {
      try {
        setSettingsLoading(true);

        const response = await fetch(
          SETTINGS_API,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            `Settings API returned an invalid response. HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        if (
          !response.ok ||
          !data?.success
        ) {
          return;
        }

        // ---------------------------------------------------
        // Object format
        // ---------------------------------------------------

        if (
          data?.settings &&
          !Array.isArray(
            data.settings
          )
        ) {
          setSettings((previous) => ({
            ...previous,
            ...data.settings,
          }));

          return;
        }

        // ---------------------------------------------------
        // Array format
        // ---------------------------------------------------

        if (
          Array.isArray(
            data?.settings
          )
        ) {
          const mappedSettings = {};

          data.settings.forEach(
            (item) => {
              if (
                item?.setting_key
              ) {
                mappedSettings[
                  item.setting_key
                ] =
                  item.setting_value ??
                  "";
              }
            }
          );

          setSettings((previous) => ({
            ...previous,
            ...mappedSettings,
          }));
        }
      } catch (error) {
        console.error(
          "Help Settings Error:",
          error
        );
      } finally {
        setSettingsLoading(false);
      }
    },
    []
  );

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchFaqs();
    fetchSettings();
  }, [fetchFaqs, fetchSettings]);

  // =======================================================
  // FILTER FAQS
  // =======================================================

  const filteredFaqs = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const faqCategory =
        normalizeCategory(
          faq.category
        );

      const matchesCategory =
        selectedCategory === "All" ||
        faqCategory ===
          selectedCategory;

      const searchableText = `
        ${faq.question || ""}
        ${faq.answer || ""}
        ${faq.category || ""}
      `.toLowerCase();

      const matchesSearch =
        !value ||
        searchableText.includes(
          value
        );

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    faqs,
    search,
    selectedCategory,
  ]);

  // =======================================================
  // FEATURED FAQS
  // =======================================================

  const featuredFaqs = useMemo(() => {
    return faqs
      .filter(
        (faq) =>
          faq.is_featured
      )
      .slice(0, 3);
  }, [faqs]);

  // =======================================================
  // CATEGORY COUNTS
  // =======================================================

  const categoryCounts = useMemo(() => {
    const counts = {};

    faqs.forEach((faq) => {
      const category =
        normalizeCategory(
          faq.category
        );

      counts[category] =
        (counts[category] || 0) +
        1;
    });

    return counts;
  }, [faqs]);

  // =======================================================
  // RESET
  // =======================================================

  const handleReset = () => {
    setSearch("");
    setSelectedCategory("All");
    setOpenQuestion(null);
  };

  // =======================================================
  // FAQ TOGGLE
  // =======================================================

  const toggleQuestion = (id) => {
    setOpenQuestion((current) =>
      current === id ? null : id
    );
  };

  // =======================================================
  // SEARCH CHANGE
  // =======================================================

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setOpenQuestion(null);
  };

  // =======================================================
  // OPEN FEATURED FAQ
  // =======================================================

  const openFeaturedFaq = (id) => {
    setOpenQuestion(id);

    setTimeout(() => {
      document
        .getElementById(
          `faq-${id}`
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">

      <Header />

      <main className="flex-1">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden bg-slate-950">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.18),transparent_30%)]" />

          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

            <div className="mx-auto max-w-4xl text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-blue-300 shadow-xl backdrop-blur">
                <LifeBuoy size={31} />
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200">
                <Sparkles size={14} />

                JobPortal Help Center
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {settings.help_title ||
                  "How can we help?"}
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                {settings.help_description ||
                  DEFAULT_SETTINGS.help_description}
              </p>

              {/* Search */}

              <div className="mx-auto mt-9 flex max-w-3xl items-center rounded-2xl border border-white/10 bg-white p-2 shadow-2xl shadow-black/20">

                <Search
                  size={21}
                  className="ml-4 shrink-0 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={
                    handleSearchChange
                  }
                  placeholder="Search questions, applications, jobs..."
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-slate-900 outline-none sm:text-base"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="mr-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Clear search"
                  >
                    <X size={17} />
                  </button>
                )}

              </div>

              {/* Dynamic Stats */}

              <div className="mt-6 flex flex-wrap justify-center gap-3">

                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
                  <span className="font-bold text-white">
                    {faqs.length}
                  </span>{" "}
                  Help Articles
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
                  <span className="font-bold text-white">
                    {categories.length}
                  </span>{" "}
                  Categories
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-400"
                  />

                  Quick answers
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =================================================
            CATEGORIES
        ================================================= */}

        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Browse help
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                What do you need help with?
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose a category to find
                relevant answers.
              </p>
            </div>

            <span className="text-sm font-semibold text-slate-400">
              {faqs.length} articles
            </span>

          </div>

          {/* Category Loading */}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="h-11 w-11 rounded-xl bg-slate-100" />

                    <div className="mt-4 h-5 w-28 rounded bg-slate-100" />

                    <div className="mt-3 h-3 w-full rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                  </div>
                )
              )}

            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* ALL */}

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(
                    "All"
                  );
                  setOpenQuestion(null);
                }}
                className={`group rounded-2xl border p-5 text-left transition-all ${
                  selectedCategory ===
                  "All"
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    selectedCategory ===
                    "All"
                      ? "bg-white/15 text-white"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <BookOpen size={21} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">

                  <h3 className="font-bold">
                    All Help
                  </h3>

                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                      selectedCategory ===
                      "All"
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {faqs.length}
                  </span>

                </div>

                <p
                  className={`mt-1 text-xs leading-5 ${
                    selectedCategory ===
                    "All"
                      ? "text-blue-100"
                      : "text-slate-500"
                  }`}
                >
                  Browse all available
                  help articles.
                </p>
              </button>

              {/* DYNAMIC CATEGORIES */}

              {categories
                .slice(0, 7)
                .map((category) => {
                  const Icon =
                    getCategoryIcon(
                      category
                    );

                  const active =
                    selectedCategory ===
                    category;

                  const count =
                    categoryCounts[
                      category
                    ] || 0;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(
                          category
                        );
                        setOpenQuestion(
                          null
                        );
                      }}
                      className={`group rounded-2xl border p-5 text-left transition-all ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Icon size={21} />
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">

                        <h3 className="font-bold">
                          {category}
                        </h3>

                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>

                      </div>

                      <p
                        className={`mt-1 line-clamp-2 text-xs leading-5 ${
                          active
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        Helpful answers
                        and information.
                      </p>
                    </button>
                  );
                })}

            </div>
          )}

        </section>

        {/* =================================================
            FEATURED
        ================================================= */}

        {!loading &&
          !search &&
          selectedCategory ===
            "All" &&
          featuredFaqs.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">

              <div className="mb-6 flex items-end justify-between">

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                    Popular questions
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Start here
                  </h2>
                </div>

                <span className="hidden text-sm text-slate-400 sm:block">
                  Featured help
                </span>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {featuredFaqs.map(
                  (faq) => (
                    <button
                      key={faq.id}
                      type="button"
                      onClick={() =>
                        openFeaturedFaq(
                          faq.id
                        )
                      }
                      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                    >
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                        {faq.category}
                      </span>

                      <h3 className="mt-4 line-clamp-2 font-bold leading-6 text-slate-900">
                        {faq.question}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {faq.answer}
                      </p>

                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                        Read answer

                        <ArrowRight
                          size={15}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>
                    </button>
                  )
                )}

              </div>

            </section>
          )}

        {/* =================================================
            FAQ + SUPPORT
        ================================================= */}

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">

            {/* =================================================
                FAQ
            ================================================= */}

            <div>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                    Knowledge base
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Frequently asked questions
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {search
                      ? `Showing results for "${search}"`
                      : selectedCategory !==
                        "All"
                      ? `Showing ${selectedCategory} questions`
                      : "Find quick answers to common questions."}
                  </p>
                </div>

                <span className="text-sm font-semibold text-slate-400">
                  {filteredFaqs.length}{" "}
                  result
                  {filteredFaqs.length !==
                  1
                    ? "s"
                    : ""}
                </span>

              </div>

              {/* Loading */}

            
{/* FAQ LIST SKELETON */}
{loading && (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((item) => (
      <div
        key={item}
        className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        {/* Category Badge */}
        <div className="h-5 w-24 rounded-full bg-slate-200" />

        {/* Question */}
        <div className="mt-4 h-5 w-4/5 rounded-md bg-slate-200" />

        {/* Second line */}
        <div className="mt-3 h-4 w-2/3 rounded-md bg-slate-100" />

        {/* Answer preview */}
        <div className="mt-5 space-y-2">
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-5/6 rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
)}


              {/* Error */}

              {!loading &&
                error && (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                      <HelpCircle size={25} />
                    </div>

                    <h3 className="mt-4 font-bold text-red-900">
                      Unable to load help articles
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-700">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        fetchFaqs(true)
                      }
                      disabled={
                        refreshing
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw
                        size={16}
                        className={
                          refreshing
                            ? "animate-spin"
                            : ""
                        }
                      />

                      {refreshing
                        ? "Loading..."
                        : "Try Again"}
                    </button>

                  </div>
                )}

              {/* FAQ LIST */}

              {!loading &&
                !error &&
                filteredFaqs.length >
                  0 && (
                  <div className="space-y-3">

                    {filteredFaqs.map(
                      (faq) => {
                        const isOpen =
                          openQuestion ===
                          faq.id;

                        return (
                          <div
                            id={`faq-${faq.id}`}
                            key={faq.id}
                            className={`overflow-hidden rounded-2xl border bg-white transition-all ${
                              isOpen
                                ? "border-blue-200 shadow-md shadow-blue-100/50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >

                            <button
                              type="button"
                              onClick={() =>
                                toggleQuestion(
                                  faq.id
                                )
                              }
                              className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                            >

                              <div className="min-w-0">

                                <div className="mb-2 flex flex-wrap items-center gap-2">

                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                    {
                                      faq.category
                                    }
                                  </span>

                                  {faq.is_featured && (
                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                                      Popular
                                    </span>
                                  )}

                                </div>

                                <h3 className="pr-2 text-sm font-bold leading-6 text-slate-900 sm:text-base">
                                  {
                                    faq.question
                                  }
                                </h3>

                              </div>

                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                                  isOpen
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <ChevronDown
                                  size={18}
                                  className={`transition-transform ${
                                    isOpen
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>

                            </button>

                            {isOpen && (
                              <div className="border-t border-slate-100 px-5 pb-6 pt-4 sm:px-6">

                                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                                  {
                                    faq.answer
                                  }
                                </p>

                              </div>
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              {/* EMPTY */}

              {!loading &&
                !error &&
                filteredFaqs.length ===
                  0 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Search size={25} />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      No matching articles
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      We couldn't find any
                      help articles
                      matching your
                      search. Try another
                      keyword or browse
                      all categories.
                    </p>

                    <button
                      type="button"
                      onClick={
                        handleReset
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <RefreshCw
                        size={16}
                      />

                      View all articles
                    </button>

                  </div>
                )}

            </div>

            {/* =================================================
                SUPPORT CARD
            ================================================= */}

            <aside className="h-fit lg:sticky lg:top-24">

              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/20 sm:p-7">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <MessageCircle
                    size={24}
                  />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-widest text-blue-100">
                  Need more help?
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Talk to our support team
                </h2>

                <p className="mt-3 text-sm leading-6 text-blue-100">
                  Can't find what you're
                  looking for? Send us
                  your question and our
                  team will help you.
                </p>

                <Link
                  to="/contact"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  Contact Support

                  <ArrowRight size={16} />
                </Link>

                {/* Dynamic Email */}

               
{/* SUPPORT CARD SKELETON */}
{settingsLoading && (
  <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
    <div className="h-12 w-12 rounded-2xl bg-slate-200" />

    <div className="mt-6 h-3 w-32 rounded bg-slate-200" />

    <div className="mt-3 h-7 w-4/5 rounded bg-slate-200" />

    <div className="mt-4 space-y-2">
      <div className="h-3 w-full rounded bg-slate-100" />
      <div className="h-3 w-5/6 rounded bg-slate-100" />
      <div className="h-3 w-2/3 rounded bg-slate-100" />
    </div>

    <div className="mt-6 h-12 w-full rounded-xl bg-slate-200" />

    <div className="mt-4 h-11 w-full rounded-xl bg-slate-100" />

    <div className="mt-3 h-11 w-full rounded-xl bg-slate-100" />
  </div>
)}

{!settingsLoading && (
  <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/20 sm:p-7">

    {/* Yahan aapka existing Support Card content rahega */}

  </div>
)}



                {/* Dynamic Phone */}

                {!settingsLoading &&
                  settings.support_phone && (
                    <a
                      href={`tel:${String(
                        settings.support_phone
                      ).replace(
                        /\s/g,
                        ""
                      )}`}
                      className="mt-2 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 text-sm text-blue-50 transition hover:bg-white/15"
                    >
                      <Phone
                        size={17}
                        className="shrink-0"
                      />

                      <span>
                        {
                          settings.support_phone
                        }
                      </span>
                    </a>
                  )}

                {/* Settings Loading */}

                {settingsLoading && (
                  <div className="mt-4 space-y-2">

                    <div className="h-11 animate-pulse rounded-xl bg-white/10" />

                    <div className="h-11 animate-pulse rounded-xl bg-white/10" />

                  </div>
                )}

              </div>

              {/* Trust */}

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldQuestion
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Stay safe
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Never share your password,
                      OTP or account credentials
                      with anyone.
                    </p>
                  </div>

                </div>

              </div>

              {/* Dynamic Article Summary */}

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Help center
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {faqs.length} articles
                      across{" "}
                      {categories.length}{" "}
                      categories.
                    </p>
                  </div>

                </div>

              </div>

            </aside>

          </div>

        </section>

      </main>

      <Footer />

    </div>
  );
};

export default HelpsAndSupport;