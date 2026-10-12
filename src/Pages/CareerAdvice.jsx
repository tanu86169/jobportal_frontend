import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Search,
  ArrowRight,
  Clock3,
  CalendarDays,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  FileText,
  Users,
  Code2,
  BriefcaseBusiness,
  ChevronRight,
  Sparkles,
  Lightbulb,
  RefreshCw,
  X,
  Eye,
  BookOpen,
} from "lucide-react";

import Footer from "../Components/Footer";
import Header from "../Components/Header";

// =====================================================
// API
// =====================================================

import API_BASE from "../Config/api";

const ARTICLES_API = `${API_BASE}/articles/get-all.php`;

// =====================================================
// CATEGORY ICONS
// =====================================================

const categoryIcons = {
  "Resume & CV": FileText,
  Resume: FileText,
  Interview: Users,
  "Career Growth": TrendingUp,
  "Job Search": BriefcaseBusiness,
  Skills: Code2,
  "Career Tips": Lightbulb,
  General: Sparkles,
};

const defaultIcon = FileText;

// =====================================================
// ARTICLE ID
// =====================================================

const getArticleId = (article) => {
  if (!article) return null;

  const id =
    article.id ??
    article.article_id ??
    article.articleId ??
    article._id ??
    null;

  if (
    id === null ||
    id === undefined ||
    String(id).trim() === "" ||
    String(id).toLowerCase() === "undefined" ||
    String(id).toLowerCase() === "null"
  ) {
    return null;
  }

  return id;
};

// =====================================================
// CATEGORY
// =====================================================

const getCategory = (article) => {
  return (
    article?.category ||
    article?.category_name ||
    article?.categoryName ||
    "General"
  );
};

// =====================================================
// CATEGORY ICON
// =====================================================

const getCategoryIcon = (category) => {
  return categoryIcons[category] || defaultIcon;
};

// =====================================================
// DATE
// =====================================================

const formatDate = (dateValue) => {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =====================================================
// DESCRIPTION
// =====================================================

const getDescription = (article) => {
  const value =
    article?.description ||
    article?.excerpt ||
    article?.short_description ||
    article?.summary ||
    article?.content ||
    article?.body ||
    "";

  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
};

// =====================================================
// PUBLISHED
// =====================================================

const isPublished = (article) => {
  if (!article?.status) {
    return true;
  }

  return (
    String(article.status).toLowerCase() ===
    "published"
  );
};

// =====================================================
// FEATURED
// =====================================================

const isFeatured = (article) => {
  return (
    article?.featured === true ||
    article?.featured === 1 ||
    article?.featured === "1" ||
    article?.is_featured === true ||
    article?.is_featured === 1 ||
    article?.is_featured === "1"
  );
};

// =====================================================
// IMAGE URL FIX
// =====================================================

const resolveImageUrl = (imageValue) => {
  if (!imageValue) {
    return "";
  }

  let image = String(imageValue).trim();

  if (!image) {
    return "";
  }

  // Remove spaces
  image = image.replace(/\s+/g, " ");

  // Already complete URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:image/")
  ) {
    return image;
  }

  // Remove leading slash
  image = image.replace(/^\/+/, "");

  // If database contains complete localhost path
  if (image.startsWith("localhost/")) {
    return `http://${image}`;
  }

  // If database contains:
  // job_portal/job-portal-api/...
  if (image.includes("job_portal/job-portal-api/")) {
    const clean = image.substring(
      image.indexOf("job_portal/job-portal-api/") +
        "job_portal/job-portal-api/".length
    );

    return `${API_BASE}/${clean}`;
  }

  // If path starts with job-portal-api
  if (image.startsWith("job-portal-api/")) {
    return `${API_BASE}/${image.replace(
      /^job-portal-api\//,
      ""
    )}`;
  }

  // uploads/articles/file.jpg
  if (image.startsWith("uploads/")) {
    return `${API_BASE}/${image}`;
  }

  // articles/file.jpg
  if (image.startsWith("articles/")) {
    return `${API_BASE}/${image}`;
  }

  // images/file.jpg
  if (image.startsWith("images/")) {
    return `${API_BASE}/${image}`;
  }

  // assets/file.jpg
  if (image.startsWith("assets/")) {
    return `${API_BASE}/${image}`;
  }

  // Just filename:
  // fresher.jpg
  // interview.png
  // resume.webp
  if (
    !image.includes("/") &&
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(image)
  ) {
    return `${API_BASE}/uploads/articles/${image}`;
  }

  // Any other relative path
  return `${API_BASE}/${image}`;
};

// =====================================================
// IMAGE COMPONENT
// =====================================================

const ArticleImage = ({
  src,
  alt,
  className = "",
  icon: Icon = FileText,
}) => {
  const [imageError, setImageError] =
    useState(false);

  if (!src || imageError) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${className}`}
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-100/70" />

        <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-indigo-100/60" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-lg">
          <Icon
            size={34}
            strokeWidth={1.7}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Career article"}
      className={`object-cover ${className}`}
      onError={() => {
        console.error(
          "Article image failed:",
          src
        );

        setImageError(true);
      }}
    />
  );
};

// =====================================================
// COMPONENT
// =====================================================

const CareerAdvice = () => {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] =
    useState("All");

  const [search, setSearch] = useState("");

  const [articles, setArticles] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  // ===================================================
  // SAVED ARTICLES
  // ===================================================

  const [savedArticles, setSavedArticles] =
    useState(() => {
      try {
        const stored = localStorage.getItem(
          "savedCareerArticles"
        );

        if (!stored) {
          return [];
        }

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed)
          ? parsed.map(String)
          : [];
      } catch {
        return [];
      }
    });

  // ===================================================
  // FETCH ARTICLES
  // ===================================================

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        ARTICLES_API,
        {
          timeout: 15000,
        }
      );

      console.log(
        "CAREER ARTICLES API:",
        response.data
      );

      const rawArticles =
        Array.isArray(response.data?.articles)
          ? response.data.articles
          : Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

      const formattedArticles =
        rawArticles
          .filter(isPublished)
          .map((article) => {
            const id =
              getArticleId(article);

            const category =
              getCategory(article);

            const imageValue =
              article?.image_url ||
              article?.image ||
              article?.thumbnail ||
              article?.featured_image ||
              article?.cover_image ||
              article?.image_path ||
              article?.thumbnail_url ||
              "";

            const image =
              resolveImageUrl(
                imageValue
              );

            console.log(
              "ARTICLE:",
              article.title,
              "ID:",
              id,
              "IMAGE:",
              image
            );

            return {
              ...article,

              id,

              title:
                article?.title ||
                article?.article_title ||
                article?.name ||
                "Untitled Article",

              description:
                getDescription(article),

              category,

              readTime:
                article?.read_time ||
                article?.readTime ||
                article?.reading_time ||
                "5 min read",

              date: formatDate(
                article?.created_at ||
                  article?.updated_at ||
                  article?.date ||
                  article?.published_at
              ),

              rawDate:
                article?.created_at ||
                article?.updated_at ||
                article?.date ||
                article?.published_at ||
                "",

              featured:
                isFeatured(article),

              tag:
                article?.tag ||
                article?.tags ||
                category,

              icon:
                getCategoryIcon(category),

              image,

              author:
                article?.author ||
                article?.author_name ||
                article?.created_by ||
                "Admin",

              views:
                article?.views ||
                article?.view_count ||
                0,
            };
          })
          .filter(
            (article) =>
              article.id !== null
          );

      setArticles(
        formattedArticles
      );
    } catch (err) {
      console.error(
        "Career articles API error:",
        err
      );

      setArticles([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load career articles. Please check your backend/API."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchArticles();
  }, []);

  // ===================================================
  // SAVE LOCAL STORAGE
  // ===================================================

  useEffect(() => {
    localStorage.setItem(
      "savedCareerArticles",
      JSON.stringify(savedArticles)
    );
  }, [savedArticles]);

  // ===================================================
  // CATEGORIES
  // ===================================================

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        articles
          .map(
            (article) =>
              article.category
          )
          .filter(Boolean)
      ),
    ];

    return [
      {
        name: "All",
        icon: Sparkles,
      },

      ...uniqueCategories.map(
        (name) => ({
          name,
          icon: getCategoryIcon(name),
        })
      ),
    ];
  }, [articles]);

  // ===================================================
  // FILTER ARTICLES
  // ===================================================

  const filteredArticles =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return articles.filter(
        (article) => {
          const categoryMatch =
            activeCategory === "All" ||
            article.category ===
              activeCategory;

          const title = String(
            article.title || ""
          ).toLowerCase();

          const description =
            String(
              article.description || ""
            ).toLowerCase();

          const category =
            String(
              article.category || ""
            ).toLowerCase();

          const tag = String(
            article.tag || ""
          ).toLowerCase();

          const searchMatch =
            !searchValue ||
            title.includes(
              searchValue
            ) ||
            description.includes(
              searchValue
            ) ||
            category.includes(
              searchValue
            ) ||
            tag.includes(
              searchValue
            );

          return (
            categoryMatch &&
            searchMatch
          );
        }
      );
    }, [
      articles,
      activeCategory,
      search,
    ]);

  // ===================================================
  // FEATURED ARTICLE
  // ===================================================

  const featuredArticle =
    useMemo(() => {
      return (
        articles.find(
          (article) =>
            article.featured
        ) ||
        articles[0] ||
        null
      );
    }, [articles]);

  // ===================================================
  // TOGGLE SAVE
  // ===================================================

  const toggleSave = (id) => {
    if (
      id === null ||
      id === undefined
    ) {
      return;
    }

    const stringId = String(id);

    setSavedArticles(
      (previous) => {
        if (
          previous.includes(stringId)
        ) {
          return previous.filter(
            (item) =>
              item !== stringId
          );
        }

        return [
          ...previous,
          stringId,
        ];
      }
    );
  };

  // ===================================================
  // OPEN ARTICLE
  // ===================================================

  const openArticle = (id) => {
    if (
      id === null ||
      id === undefined ||
      String(id).trim() === "" ||
      String(id) === "undefined" ||
      String(id) === "null"
    ) {
      console.error(
        "Cannot open article. ID missing."
      );

      return;
    }

    navigate(
      `/career-advice/${encodeURIComponent(
        String(id)
      )}`
    );
  };

  // ===================================================
  // CLEAR FILTER
  // ===================================================

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
  };

  // ===================================================
  // SEARCH
  // ===================================================

  const handlePopularSearch = (
    value
  ) => {
    setSearch(value);
    setActiveCategory("All");

    setTimeout(() => {
      document
        .getElementById(
          "latest-articles"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // ===================================================
  // SCROLL
  // ===================================================

  const scrollToArticles = () => {
    document
      .getElementById(
        "latest-articles"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <Header />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden bg-white">
        {/* Background decoration */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 top-32 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_430px]">
            {/* LEFT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
                <Sparkles size={15} />

                Career Resources &
                Insights
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Take the next step
                in your{" "}
                <span className="text-blue-600">
                  career journey.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                Expert advice, practical
                tips and career insights
                to help you build your
                skills, prepare for
                interviews and find the
                right opportunity.
              </p>

              {/* SEARCH */}

              <div className="mt-8 max-w-2xl">
                <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center">
                    <Search
                      size={20}
                      className="ml-3 shrink-0 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          scrollToArticles();
                        }
                      }}
                      placeholder="Search career advice, resume, interview..."
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        className="mr-2 text-slate-400 hover:text-slate-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      scrollToArticles
                    }
                    className="rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* POPULAR */}

              {categories.length >
                1 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">
                    Popular:
                  </span>

                  {categories
                    .filter(
                      (item) =>
                        item.name !==
                        "All"
                    )
                    .slice(0, 5)
                    .map(
                      (category) => (
                        <button
                          key={
                            category.name
                          }
                          type="button"
                          onClick={() =>
                            handlePopularSearch(
                              category.name
                            )
                          }
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {
                            category.name
                          }
                        </button>
                      )
                    )}
                </div>
              )}
            </div>

            {/* =================================================
                RIGHT HERO CARD
            ================================================= */}

            <div className="relative">
              <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-7 shadow-2xl shadow-blue-200">
                {/* circles */}

                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[32px] border-white/10" />

                <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full border-[38px] border-white/10" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-100">
                        Career Growth
                      </p>

                      <p className="mt-1 text-xs text-blue-200">
                        Learn • Improve •
                        Grow
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                      <TrendingUp
                        size={21}
                      />
                    </div>
                  </div>

                  <h2 className="mt-6 text-2xl font-black leading-tight text-white sm:text-3xl">
                    Small improvements.
                    <br />
                    Big career results.
                  </h2>

                  {/* THREE CARDS */}

                  <div className="mt-7 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                          <FileText
                            size={20}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-white">
                            Build a stronger
                            resume
                          </p>

                          <p className="mt-0.5 text-xs text-blue-100">
                            Stand out from
                            recruiters
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                          <Users
                            size={20}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-white">
                            Ace your
                            interview
                          </p>

                          <p className="mt-0.5 text-xs text-blue-100">
                            Prepare with
                            confidence
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                          <BriefcaseBusiness
                            size={20}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-white">
                            Find the right
                            job
                          </p>

                          <p className="mt-0.5 text-xs text-blue-100">
                            Match your skills
                            and goals
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATS */}

                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-2xl font-black text-white">
                        {
                          articles.length
                        }
                      </p>

                      <p className="mt-1 text-xs text-blue-100">
                        Career resources
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-2xl font-black text-white">
                        {Math.max(
                          categories.length -
                            1,
                          0
                        )}
                      </p>

                      <p className="mt-1 text-xs text-blue-100">
                        Categories
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING BADGE */}

              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Lightbulb
                    size={19}
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Learn. Improve. Grow.
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Your career starts
                    here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          CATEGORY BAR
      ================================================= */}

      <section className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3">
            {categories.map(
              (category) => {
                const Icon =
                  category.icon;

                const active =
                  activeCategory ===
                  category.name;

                return (
                  <button
                    key={
                      category.name
                    }
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category.name
                      )
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      size={16}
                    />

                    {
                      category.name
                    }
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* LOADING */}

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <RefreshCw
                size={26}
                className="animate-spin text-blue-600"
              />
            </div>

            <p className="mt-5 text-sm font-bold text-slate-500">
              Loading career
              articles...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
              <FileText
                size={25}
              />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
              Unable to load
              articles
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={
                fetchArticles
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <RefreshCw
                size={16}
              />
              Try Again
            </button>
          </div>
        )}

        {/* CONTENT */}

        {!loading &&
          !error && (
            <>
              {/* =================================================
                  FEATURED ARTICLE
              ================================================= */}

              {activeCategory ===
                "All" &&
                !search.trim() &&
                featuredArticle && (
                  <section className="mb-16">
                    <div className="mb-7 flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                          Featured
                        </div>

                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                          Career insights
                          worth reading
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          Handpicked advice
                          to help you grow
                          professionally.
                        </p>
                      </div>

                      <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 sm:block">
                        Featured article
                      </span>
                    </div>

                    <div className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:shadow-2xl">
                      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                        {/* FEATURED IMAGE */}

                        <div className="relative min-h-[370px] overflow-hidden">
                          {featuredArticle.image ? (
                            <>
                              <ArticleImage
                                src={
                                  featuredArticle.image
                                }
                                alt={
                                  featuredArticle.title
                                }
                                icon={
                                  featuredArticle.icon
                                }
                                className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105"
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-900/20 to-transparent" />
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700">
                              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border-[35px] border-white/10" />

                              <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full border-[40px] border-white/10" />

                              <div className="relative flex h-full items-center justify-center">
                                <div className="flex h-28 w-28 items-center justify-center rounded-[30px] bg-white text-blue-600 shadow-2xl">
                                  {React.createElement(
                                    featuredArticle.icon ||
                                      FileText,
                                    {
                                      size: 50,
                                      strokeWidth: 1.6,
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 p-8">
                            <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                              {
                                featuredArticle.tag
                              }
                            </span>

                            <p className="mt-4 text-sm font-semibold text-blue-100">
                              {
                                featuredArticle.category
                              }
                            </p>

                            <h3 className="mt-2 max-w-md text-2xl font-black text-white">
                              {
                                featuredArticle.title
                              }
                            </h3>
                          </div>
                        </div>

                        {/* FEATURED CONTENT */}

                        <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-12">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                              {
                                featuredArticle.category
                              }
                            </span>

                            {featuredArticle.featured && (
                              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
                                Featured
                              </span>
                            )}
                          </div>

                          <h3 className="mt-5 max-w-xl text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                            {
                              featuredArticle.title
                            }
                          </h3>

                          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                            {
                              featuredArticle.description
                            }
                          </p>

                          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Clock3
                                size={14}
                              />

                              {
                                featuredArticle.readTime
                              }
                            </span>

                            <span className="h-1 w-1 rounded-full bg-slate-300" />

                            <span className="flex items-center gap-1.5">
                              <CalendarDays
                                size={14}
                              />

                              {
                                featuredArticle.date
                              }
                            </span>

                            <span className="h-1 w-1 rounded-full bg-slate-300" />

                            <span className="flex items-center gap-1.5">
                              <Users
                                size={14}
                              />

                              {
                                featuredArticle.author
                              }
                            </span>
                          </div>

                          <div className="mt-8 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                openArticle(
                                  featuredArticle.id
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
                            >
                              Read Article

                              <ArrowRight
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleSave(
                                  featuredArticle.id
                                )
                              }
                              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                                savedArticles.includes(
                                  String(
                                    featuredArticle.id
                                  )
                                )
                                  ? "border-blue-200 bg-blue-50 text-blue-600"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                              }`}
                            >
                              {savedArticles.includes(
                                String(
                                  featuredArticle.id
                                )
                              ) ? (
                                <BookmarkCheck
                                  size={17}
                                />
                              ) : (
                                <Bookmark
                                  size={17}
                                />
                              )}

                              {savedArticles.includes(
                                String(
                                  featuredArticle.id
                                )
                              )
                                ? "Saved"
                                : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

              {/* =================================================
                  LATEST ARTICLES
              ================================================= */}

              <section id="latest-articles">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                      Latest Articles
                    </div>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Advice to help you
                      move forward
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Practical tips for
                      every stage of your
                      career.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {(search.trim() ||
                      activeCategory !==
                        "All") && (
                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Clear filters
                      </button>
                    )}

                    <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
                      {
                        filteredArticles.length
                      }{" "}
                      articles
                    </span>
                  </div>
                </div>

                {filteredArticles.length >
                0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredArticles.map(
                      (article) => {
                        const Icon =
                          article.icon ||
                          FileText;

                        const isSaved =
                          savedArticles.includes(
                            String(
                              article.id
                            )
                          );

                        return (
                          <article
                            key={
                              article.id
                            }
                            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl"
                          >
                            {/* IMAGE */}

                            <div className="relative h-52 overflow-hidden">
                              <ArticleImage
                                src={
                                  article.image
                                }
                                alt={
                                  article.title
                                }
                                icon={Icon}
                                className="h-full w-full transition duration-700 group-hover:scale-105"
                              />

                              {/* Gradient */}

                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />

                              {/* TAG */}

                              <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm backdrop-blur">
                                {
                                  article.tag
                                }
                              </span>

                              {/* BOOKMARK */}

                              <button
                                type="button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  toggleSave(
                                    article.id
                                  );
                                }}
                                aria-label={
                                  isSaved
                                    ? "Remove bookmark"
                                    : "Save article"
                                }
                                className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
                                  isSaved
                                    ? "border-blue-100 bg-blue-50 text-blue-600"
                                    : "border-white/70 bg-white/95 text-slate-400 hover:text-blue-600"
                                }`}
                              >
                                {isSaved ? (
                                  <BookmarkCheck
                                    size={
                                      16
                                    }
                                  />
                                ) : (
                                  <Bookmark
                                    size={
                                      16
                                    }
                                  />
                                )}
                              </button>
                            </div>

                            {/* CONTENT */}

                            <div className="flex flex-1 flex-col p-5">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-blue-600">
                                  {
                                    article.category
                                  }
                                </span>

                                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                  <Clock3
                                    size={
                                      12
                                    }
                                  />

                                  {
                                    article.readTime
                                  }
                                </span>
                              </div>

                              <h3 className="mt-3 line-clamp-2 text-lg font-black leading-6 text-slate-900 transition group-hover:text-blue-600">
                                {
                                  article.title
                                }
                              </h3>

                              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                                {article.description ||
                                  "Read this career article to learn more."}
                              </p>

                              {/* BOTTOM */}

                              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                  <CalendarDays
                                    size={
                                      13
                                    }
                                  />

                                  {
                                    article.date
                                  }
                                </span>

                                {/* READ MORE */}

                                <button
                                  type="button"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    console.log(
                                      "READ MORE ARTICLE:",
                                      article
                                    );

                                    console.log(
                                      "READ MORE ID:",
                                      article.id
                                    );

                                    if (
                                      article.id ===
                                        null ||
                                      article.id ===
                                        undefined ||
                                      String(
                                        article.id
                                      ) ===
                                        "undefined"
                                    ) {
                                      console.error(
                                        "Article ID missing:",
                                        article
                                      );

                                      return;
                                    }

                                    openArticle(
                                      article.id
                                    );
                                  }}
                                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                                >
                                  Read More

                                  <ArrowRight
                                    size={
                                      15
                                    }
                                    className="transition group-hover:translate-x-1"
                                  />
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                      <Search
                        size={27}
                        className="text-slate-400"
                      />
                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-900">
                      No articles found
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      We couldn't find
                      any career advice
                      matching your
                      search.
                    </p>

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Browse All
                      Articles
                    </button>
                  </div>
                )}
              </section>

              {/* =================================================
                  EXPLORE TOPICS
              ================================================= */}

              {categories.length >
                1 && (
                <section className="mt-16">
                  <div className="mb-7">
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                      Explore Topics
                    </div>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                      What do you want
                      to improve?
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Explore articles
                      based on your career
                      goals.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {categories
                      .filter(
                        (category) =>
                          category.name !==
                          "All"
                      )
                      .map(
                        (topic) => {
                          const Icon =
                            topic.icon;

                          const topicArticles =
                            articles.filter(
                              (article) =>
                                article.category ===
                                topic.name
                            );

                          return (
                            <button
                              key={
                                topic.name
                              }
                              type="button"
                              onClick={() => {
                                setActiveCategory(
                                  topic.name
                                );

                                setSearch(
                                  ""
                                );

                                scrollToArticles();
                              }}
                              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                  <Icon
                                    size={
                                      20
                                    }
                                  />
                                </div>

                                <ChevronRight
                                  size={
                                    18
                                  }
                                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                                />
                              </div>

                              <h3 className="mt-5 text-base font-black text-slate-900">
                                {
                                  topic.name
                                }
                              </h3>

                              <p className="mt-1.5 text-sm leading-5 text-slate-500">
                                Explore{" "}
                                {
                                  topicArticles.length
                                }{" "}
                                career
                                articles
                              </p>
                            </button>
                          );
                        }
                      )}
                  </div>
                </section>
              )}
            </>
          )}

        {/* =================================================
            CTA
        ================================================= */}

        {!loading && (
          <section className="relative mt-16 overflow-hidden rounded-[30px] bg-gradient-to-r from-blue-600 to-indigo-700 p-8 shadow-xl shadow-blue-100 sm:p-10 lg:p-12">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[45px] border-white/10" />

            <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full border-[40px] border-white/10" />

            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur">
                  <BriefcaseBusiness
                    size={14}
                  />

                  Find your next
                  opportunity
                </div>

                <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                  Ready to take the
                  next step?
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Put your career
                  knowledge into action
                  and discover jobs that
                  match your skills and
                  ambitions.
                </p>
              </div>

              <Link
                to="/jobs"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-blue-600 shadow-lg transition hover:bg-slate-50"
              >
                Explore Jobs

                <ArrowRight
                  size={18}
                />
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CareerAdvice;