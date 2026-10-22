import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  UserRound,
  BookOpen,
  Loader2,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";

/* =========================================================
   API
========================================================= */

import API_BASE from "../Config/api";

const ARTICLES_API = `${API_BASE}/articles/get-all.php`;

/* =========================================================
   HELPERS
========================================================= */

const getArticleId = (article) => {
  return (
    article?.id ??
    article?.article_id ??
    article?.articleId ??
    article?.ID ??
    null
  );
};

const getArticleTitle = (article) => {
  return article?.title || "Untitled Article";
};

const getArticleContent = (article) => {
  return (
    article?.content ||
    article?.description ||
    article?.body ||
    article?.article_content ||
    ""
  );
};

const getArticleCategory = (article) => {
  return (
    article?.category ||
    article?.category_name ||
    article?.categoryName ||
    "Career Advice"
  );
};

const getArticleDate = (article) => {
  return (
    article?.created_at ||
    article?.published_at ||
    article?.date ||
    article?.createdAt ||
    ""
  );
};

const getReadTime = (article) => {
  return (
    article?.read_time ||
    article?.readTime ||
    article?.reading_time ||
    "5 min read"
  );
};

const getAuthor = (article) => {
  return (
    article?.author ||
    article?.author_name ||
    article?.authorName ||
    article?.created_by ||
    "JobPortal Team"
  );
};

const getImage = (article) => {
  return (
    article?.image_url ||
    article?.image ||
    article?.cover_image ||
    article?.coverImage ||
    article?.thumbnail ||
    article?.thumbnail_url ||
    ""
  );
};

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (image) => {
  if (!image) return "";

  // Already absolute
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  // Root relative
  if (image.startsWith("/")) {
    return `http://http://localhost${image}`;
  }

  // Relative path
  return `http://http://localhost/job_portal/job-portal-api/${image}`;
};

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (date) => {
  if (!date) return "Recently published";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   TEXT EXCERPT
========================================================= */

const getPlainText = (html = "") => {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  return doc.body.textContent?.replace(/\s+/g, " ").trim() || "";
};

/* =========================================================
   SAFE HTML
========================================================= */

const cleanHtml = (html) => {
  if (!html) return "";

  const parser = new DOMParser();

  const doc = parser.parseFromString(html, "text/html");

  // Remove dangerous elements
  doc
    .querySelectorAll("script, iframe, object, embed, form")
    .forEach((element) => {
      element.remove();
    });

  // Remove inline event handlers
  doc.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();
      const attributeValue = attribute.value.toLowerCase();

      if (attributeName.startsWith("on")) {
        element.removeAttribute(attribute.name);
      }

      if (
        ["href", "src", "action"].includes(attributeName) &&
        attributeValue.startsWith("javascript:")
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return doc.body.innerHTML;
};

/* =========================================================
   CONTENT STYLES
========================================================= */

const articleStyles = `
.article-content {
  color: #475569;
  font-size: 17px;
  line-height: 1.9;
}

.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4 {
  color: #0f172a;
  font-weight: 700;
  line-height: 1.3;
  margin-top: 32px;
  margin-bottom: 16px;
}

.article-content h1 {
  font-size: 30px;
}

.article-content h2 {
  font-size: 26px;
}

.article-content h3 {
  font-size: 22px;
}

.article-content h4 {
  font-size: 19px;
}

.article-content p {
  margin-bottom: 20px;
}

.article-content ul,
.article-content ol {
  margin: 20px 0;
  padding-left: 28px;
}

.article-content ul {
  list-style-type: disc;
}

.article-content ol {
  list-style-type: decimal;
}

.article-content li {
  margin-bottom: 9px;
}

.article-content strong {
  color: #0f172a;
  font-weight: 700;
}

.article-content a {
  color: #2563eb;
  text-decoration: underline;
}

.article-content blockquote {
  margin: 25px 0;
  padding: 18px 22px;
  border-left: 4px solid #2563eb;
  background: #eff6ff;
  color: #334155;
  border-radius: 10px;
}

.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 14px;
  margin: 25px auto;
}

.article-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 25px 0;
}

.article-content th,
.article-content td {
  border: 1px solid #e2e8f0;
  padding: 12px;
  text-align: left;
}

.article-content th {
  background: #f8fafc;
  color: #0f172a;
}

.article-content code {
  background: #f1f5f9;
  color: #2563eb;
  padding: 3px 7px;
  border-radius: 5px;
}

.article-content pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 25px 0;
}
`;

/* =========================================================
   COMPONENT
========================================================= */

export default function CareerAdviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  /* =======================================================
     FETCH ARTICLE
  ======================================================= */

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(ARTICLES_API);

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const result = await response.json();

        console.log("Career Advice API:", result);

        const articles = Array.isArray(result?.articles)
          ? result.articles
          : Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : [];

        console.log("Articles:", articles);
        console.log("Requested ID:", id);

        setAllArticles(articles);

        const selectedArticle = articles.find((item) => {
          const articleId = getArticleId(item);

          return String(articleId) === String(id);
        });

        console.log("Selected Article:", selectedArticle);

        if (!selectedArticle) {
          setError("Article not found.");
          setArticle(null);
          return;
        }

        setArticle(selectedArticle);

        /* =================================================
           SAVED ARTICLES
        ================================================= */

        const savedArticles = JSON.parse(
          localStorage.getItem("savedCareerArticles") || "[]"
        );

        const isSaved = savedArticles.some(
          (savedId) => String(savedId) === String(getArticleId(selectedArticle))
        );

        setSaved(isSaved);
      } catch (err) {
        console.error("Career Advice Detail Error:", err);

        setError(
          err?.message || "Unable to load this article. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  /* =======================================================
     RELATED ARTICLES
  ======================================================= */

  const relatedArticles = useMemo(() => {
    if (!article) return [];

    const currentCategory = getArticleCategory(article);

    const sameCategory = allArticles.filter((item) => {
      return (
        String(getArticleId(item)) !== String(getArticleId(article)) &&
        getArticleCategory(item).toLowerCase() ===
          currentCategory.toLowerCase()
      );
    });

    if (sameCategory.length >= 3) {
      return sameCategory.slice(0, 3);
    }

    const others = allArticles.filter(
      (item) =>
        String(getArticleId(item)) !== String(getArticleId(article)) &&
        !sameCategory.includes(item)
    );

    return [...sameCategory, ...others].slice(0, 3);
  }, [article, allArticles]);

  /* =======================================================
     SAVE ARTICLE
  ======================================================= */

  const handleSave = () => {
    if (!article) return;

    const articleId = getArticleId(article);

    if (!articleId) {
      console.error("Article ID missing:", article);
      return;
    }

    const savedArticles = JSON.parse(
      localStorage.getItem("savedCareerArticles") || "[]"
    );

    if (saved) {
      const updated = savedArticles.filter(
        (savedId) => String(savedId) !== String(articleId)
      );

      localStorage.setItem(
        "savedCareerArticles",
        JSON.stringify(updated)
      );

      setSaved(false);
    } else {
      const updated = [...savedArticles, articleId];

      localStorage.setItem(
        "savedCareerArticles",
        JSON.stringify(updated)
      );

      setSaved(true);
    }
  };

  /* =======================================================
     SHARE
  ======================================================= */

  const handleShare = async () => {
    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: getArticleTitle(article),
          text: getPlainText(getArticleContent(article)).slice(0, 150),
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      setShareMessage("Article link copied!");

      setTimeout(() => {
        setShareMessage("");
      }, 2500);
    } catch (error) {
      console.log("Share cancelled:", error);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <Loader2
                size={28}
                className="text-blue-600 animate-spin"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Loading article...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we fetch the article.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">

            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <BookOpen
                size={30}
                className="text-blue-600"
              />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Article Not Found
            </h1>

            <p className="mt-2 text-slate-500">
              {error || "The requested career advice article could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/career-advice")}
              className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              <ArrowLeft size={18} />
              Back to Career Advice
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =======================================================
     ARTICLE DATA
  ======================================================= */

  const title = getArticleTitle(article);
  const content = getArticleContent(article);
  const category = getArticleCategory(article);
  const date = getArticleDate(article);
  const readTime = getReadTime(article);
  const author = getAuthor(article);
  const image = getImage(article);
  const imageUrl = getImageUrl(image);

  const articleId = getArticleId(article);

  const excerpt = getPlainText(content).slice(0, 180);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <style>{articleStyles}</style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header />

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-14 flex items-center gap-2 text-sm">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-slate-500 hover:text-blue-600 transition"
            >
              Home
            </button>

            <ChevronRight
              size={15}
              className="text-slate-400"
            />

            <button
              type="button"
              onClick={() => navigate("/career-advice")}
              className="text-slate-500 hover:text-blue-600 transition"
            >
              Career Advice
            </button>

            <ChevronRight
              size={15}
              className="text-slate-400"
            />

            <span className="text-slate-800 font-medium truncate max-w-[250px]">
              {title}
            </span>

          </div>
        </div>
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-20 w-80 h-80 bg-white/10 rounded-full blur-sm" />

        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-cyan-300/10 rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/career-advice")}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-8 text-sm font-medium transition"
          >
            <ArrowLeft size={18} />
            Back to Career Advice
          </button>

          <div className="max-w-4xl">

            {/* Category */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-sm font-semibold backdrop-blur-sm">
              <Sparkles size={15} />
              {category}
            </div>

            {/* Title */}
            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {title}
            </h1>

            {/* Excerpt */}
            {excerpt && (
              <p className="mt-5 text-base sm:text-lg text-white/85 leading-7 max-w-3xl">
                {excerpt}
                {getPlainText(content).length > 180 ? "..." : ""}
              </p>
            )}

            {/* Meta */}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/90 text-sm">

              <div className="flex items-center gap-2">
                <CalendarDays size={17} />
                <span>{formatDate(date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock3 size={17} />
                <span>{readTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <UserRound size={17} />
                <span>{author}</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 lg:gap-10">

          {/* =================================================
              ARTICLE
          ================================================= */}

          <article className="min-w-0">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Cover Image */}
              {imageUrl ? (
                <div className="w-full bg-slate-100">

                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full max-h-[520px] object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                </div>
              ) : (
                <div className="h-56 sm:h-72 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 flex items-center justify-center">

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto">
                      <BookOpen
                        size={38}
                        className="text-blue-600"
                      />
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Career Advice
                    </p>
                  </div>

                </div>
              )}

              {/* Article Header */}
              <div className="p-5 sm:p-8 border-b border-slate-100">

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      {category}
                    </span>

                    <h2 className="mt-3 text-xl sm:text-2xl font-bold text-slate-900">
                      {title}
                    </h2>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={handleSave}
                      title={saved ? "Remove bookmark" : "Save article"}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${
                        saved
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200"
                      }`}
                    >
                      {saved ? (
                        <BookmarkCheck size={19} />
                      ) : (
                        <Bookmark size={19} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      title="Share article"
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition"
                    >
                      <Share2 size={18} />
                    </button>

                  </div>

                </div>

                {shareMessage && (
                  <div className="mt-4 inline-flex px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                    {shareMessage}
                  </div>
                )}

              </div>

              {/* Content */}
              <div className="p-5 sm:p-8 lg:p-10">

                {content ? (
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(content),
                    }}
                  />
                ) : (
                  <div className="py-10 text-center text-slate-500">
                    Article content is not available.
                  </div>
                )}

              </div>

            </div>

          </article>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-5">

            {/* About Career Advice */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Career Advice
              </h3>

              <p className="mt-2 text-sm text-slate-500 leading-6">
                Get useful career tips, interview guidance, job search
                strategies and professional growth advice.
              </p>

              <button
                type="button"
                onClick={() => navigate("/career-advice")}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Explore All Articles
                <ArrowRight size={17} />
              </button>

            </div>

            {/* Article Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <h3 className="text-base font-bold text-slate-900">
                Article Information
              </h3>

              <div className="mt-5 space-y-4">

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <CalendarDays
                      size={17}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Published
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(date)}
                    </p>
                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                    <Clock3
                      size={17}
                      className="text-cyan-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Reading Time
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {readTime}
                    </p>
                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <UserRound
                      size={17}
                      className="text-indigo-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Author
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {author}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>
      </main>

      {/* =====================================================
          RELATED ARTICLES
      ===================================================== */}

      {relatedArticles.length > 0 && (
        <section className="bg-white border-t border-slate-200">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">

              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Keep Learning
                </p>

                <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
                  Related Articles
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  More career advice you may find useful.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/career-advice")}
                className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700"
              >
                View All
                <ArrowRight size={17} />
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {relatedArticles.map((item) => {
                const itemId = getArticleId(item);
                const itemImage = getImageUrl(getImage(item));

                return (
                  <div
                    key={itemId}
                    onClick={() => {
                      if (!itemId) {
                        console.error(
                          "Related article ID missing:",
                          item
                        );
                        return;
                      }

                      navigate(`/career-advice/${itemId}`);

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                  >

                    {/* Image */}
                    {itemImage ? (
                      <div className="h-48 overflow-hidden bg-slate-100">

                        <img
                          src={itemImage}
                          alt={getArticleTitle(item)}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />

                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 flex items-center justify-center">

                        <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <BookOpen
                            size={27}
                            className="text-blue-600"
                          />
                        </div>

                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-5">

                      <div className="flex items-center justify-between gap-3">

                        <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          {getArticleCategory(item)}
                        </span>

                        <span className="text-xs text-slate-400">
                          {getReadTime(item)}
                        </span>

                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                        {getArticleTitle(item)}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-6">
                        {getPlainText(
                          getArticleContent(item)
                        )}
                      </p>

                      <div className="mt-5 flex items-center justify-between">

                        <span className="text-xs text-slate-400">
                          {formatDate(getArticleDate(item))}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-2.5 transition-all">
                          Read More
                          <ArrowRight size={16} />
                        </span>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />
    </div>
  );
}