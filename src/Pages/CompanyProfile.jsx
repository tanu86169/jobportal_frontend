import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Ban,
  Building2,
  CheckCircle2,
  Clock3,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldAlert,
  XCircle,
} from "lucide-react";

// =========================================================
// API
// =========================================================

import API_BASE from "../Config/api";

const API_URL = `${API_BASE}/recruiter/company-profile.php`;

// =========================================================
// STATUS CONFIG
// =========================================================

const STATUS_CONFIG = {
  pending: {
    label: "Pending Approval",
    title: "Company Approval Pending",
    message:
      "Your company profile has been submitted and is waiting for admin approval. You cannot post jobs until admin approves your company.",
    icon: Clock3,
    container: "border-amber-200 bg-amber-50",
    iconContainer: "bg-amber-100 text-amber-700",
    titleClass: "text-amber-900",
    textClass: "text-amber-800",
    badge: "bg-amber-100 text-amber-700",
  },

  approved: {
    label: "Approved",
    title: "Company Approved",
    message:
      "Your company has been approved by admin. You can now post and manage jobs.",
    icon: CheckCircle2,
    container: "border-green-200 bg-green-50",
    iconContainer: "bg-green-100 text-green-700",
    titleClass: "text-green-900",
    textClass: "text-green-800",
    badge: "bg-green-100 text-green-700",
  },

  rejected: {
    label: "Rejected",
    title: "Company Rejected",
    message:
      "Your company application has been rejected by admin. Please contact the administrator for more information.",
    icon: XCircle,
    container: "border-red-200 bg-red-50",
    iconContainer: "bg-red-100 text-red-700",
    titleClass: "text-red-900",
    textClass: "text-red-800",
    badge: "bg-red-100 text-red-700",
  },

  suspended: {
    label: "Suspended",
    title: "Company Temporarily Suspended",
    message:
      "Your company has been temporarily suspended by admin. You cannot post jobs until the suspension is removed.",
    icon: ShieldAlert,
    container: "border-orange-200 bg-orange-50",
    iconContainer: "bg-orange-100 text-orange-700",
    titleClass: "text-orange-900",
    textClass: "text-orange-800",
    badge: "bg-orange-100 text-orange-700",
  },

  blocked: {
    label: "Blocked",
    title: "Company Blocked",
    message:
      "Your company has been blocked by admin. You cannot post jobs.",
    icon: Ban,
    container: "border-red-200 bg-red-50",
    iconContainer: "bg-red-100 text-red-700",
    titleClass: "text-red-900",
    textClass: "text-red-800",
    badge: "bg-red-100 text-red-700",
  },
};

// =========================================================
// INITIAL FORM
// =========================================================

const INITIAL_FORM = {
  company_name: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  industry: "",
  company_size: "",
  founded_year: "",
  description: "",
};

// =========================================================
// HELPERS
// =========================================================

const normalizeStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  return STATUS_CONFIG[value] ? value : "pending";
};

const getStatusMessage = (
  status,
  backendMessage = ""
) => {
  const customMessage = String(
    backendMessage || ""
  ).trim();

  if (customMessage) {
    return customMessage;
  }

  const normalizedStatus =
    normalizeStatus(status);

  return (
    STATUS_CONFIG[normalizedStatus]?.message ||
    STATUS_CONFIG.pending.message
  );
};

const getRecruiterIdFromUser = (
  currentUser
) => {
  if (!currentUser) {
    return 0;
  }

  const possibleId =
    currentUser.id ??
    currentUser.userId ??
    currentUser.user_id ??
    localStorage.getItem("userId") ??
    localStorage.getItem("user_id");

  const numericId = Number(possibleId);

  return Number.isInteger(numericId) &&
    numericId > 0
    ? numericId
    : 0;
};

// =========================================================
// WEBSITE HELPERS
// =========================================================

const normalizeWebsite = (website) => {
  const value = String(website || "").trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
};

const isValidWebsite = (website) => {
  if (!website) {
    return true;
  }

  try {
    const normalized =
      normalizeWebsite(website);

    const url = new URL(normalized);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
};

// =========================================================
// COMPONENT
// =========================================================

const CompanyProfile = () => {
  // =======================================================
  // STATE
  // =======================================================

  const [user, setUser] = useState(null);

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [companyStatus, setCompanyStatus] =
    useState("pending");

  const [
    companyStatusMessage,
    setCompanyStatusMessage,
  ] = useState("");

  const [companyId, setCompanyId] =
    useState(null);

  const [canPostJob, setCanPostJob] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =======================================================
  // UPDATE LOCAL STORAGE ONLY
  // IMPORTANT:
  // Do NOT call setUser() here.
  // This prevents fetch/useEffect loop.
  // =======================================================

  const updateLocalUser = useCallback(
    (companyData = {}) => {
      try {
        const storedUser =
          localStorage.getItem("user");

        if (!storedUser) {
          return;
        }

        const currentUser =
          JSON.parse(storedUser);

        const updatedUser = {
          ...currentUser,
          ...companyData,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );
      } catch (err) {
        console.error(
          "Local User Update Error:",
          err
        );
      }
    },
    []
  );

  // =======================================================
  // APPLY COMPANY DATA
  // =======================================================

  const applyCompanyData = useCallback(
    (data = {}) => {
      const latestStatus =
        normalizeStatus(
          data.status ||
            data.company_status ||
            "pending"
        );

      const backendStatusMessage =
        data.status_message ||
        data.company_message ||
        "";

      const latestStatusMessage =
        getStatusMessage(
          latestStatus,
          backendStatusMessage
        );

      const latestCompanyId =
        data.company_id ??
        data.id ??
        null;

      const backendCanPost =
        typeof data.can_post_job ===
        "boolean"
          ? data.can_post_job
          : latestStatus === "approved";

      // -----------------------------------------------
      // FORM DATA
      // -----------------------------------------------

      setFormData({
        company_name:
          data.company_name || "",

        email:
          data.email || "",

        phone:
          data.phone || "",

        location:
          data.location || "",

        website:
          data.website || "",

        industry: data.industry || data.company_industry || "",
        company_size: data.company_size || data.companySize || "",
        founded_year: data.founded_year || data.foundedYear || "",
        description: data.description || "",
      });

      // -----------------------------------------------
      // COMPANY STATE
      // -----------------------------------------------

      setCompanyId(
        latestCompanyId
      );

      setCompanyStatus(
        latestStatus
      );

      setCompanyStatusMessage(
        latestStatusMessage
      );

      setCanPostJob(
        backendCanPost
      );

      // -----------------------------------------------
      // LOCAL STORAGE
      // -----------------------------------------------

      updateLocalUser({
        company_id:
          latestCompanyId,

        company_name:
          data.company_name || "",

        company_status:
          latestStatus,

        company_message:
          latestStatusMessage,

        can_post_job:
          backendCanPost,

        ...(data.email !== undefined && {
          email: data.email,
        }),

        ...(data.phone !== undefined && {
          phone: data.phone,
        }),
      });
    },
    [updateLocalUser]
  );

  // =======================================================
  // FETCH COMPANY PROFILE
  //
  // IMPORTANT:
  // Only applyCompanyData is dependency.
  // user is NOT dependency.
  // =======================================================

  const fetchProfile = useCallback(
    async (
      recruiterId,
      showFullLoader = true
    ) => {
      try {
        if (showFullLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");
        setMessage("");

        const numericRecruiterId =
          Number(recruiterId);

        if (
          !numericRecruiterId ||
          numericRecruiterId <= 0
        ) {
          throw new Error(
            "Invalid recruiter ID."
          );
        }

        const response = await fetch(
          `${API_URL}?recruiterId=${encodeURIComponent(
            numericRecruiterId
          )}`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

        let result;

        try {
          result =
            await response.json();
        } catch {
          throw new Error(
            "Invalid response received from server."
          );
        }

        console.log(
          "Company Profile API Response:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Request failed with status ${response.status}`
          );
        }

        // =================================================
        // COMPANY FOUND
        // =================================================

        if (
          result?.success &&
          result?.data
        ) {
          applyCompanyData(
            result.data
          );

          return true;
        }

        // =================================================
        // COMPANY NOT FOUND
        // =================================================

        setFormData(
          (previous) => ({
            ...previous,

            email:
              previous.email ||
              "",

            phone:
              previous.phone ||
              "",
          })
        );

        setCompanyId(null);

        setCompanyStatus(
          "pending"
        );

        setCanPostJob(false);

        setCompanyStatusMessage(
          getStatusMessage(
            "pending"
          )
        );

        setError(
          result?.message ||
            "Company profile not found. Please create your company profile."
        );

        return false;
      } catch (err) {
        console.error(
          "Fetch Company Profile Error:",
          err
        );

        // =================================================
        // LOCAL STORAGE FALLBACK
        // =================================================

        try {
          const storedUser =
            localStorage.getItem(
              "user"
            );

          if (storedUser) {
            const localUser =
              JSON.parse(
                storedUser
              );

            const localStatus =
              normalizeStatus(
                localUser?.company_status ||
                  "pending"
              );

            const localCanPost =
              typeof localUser?.can_post_job ===
              "boolean"
                ? localUser.can_post_job
                : localStatus ===
                  "approved";

            setCompanyStatus(
              localStatus
            );

            setCompanyStatusMessage(
              getStatusMessage(
                localStatus,
                localUser?.company_message
              )
            );

            setCanPostJob(
              localCanPost
            );

            setCompanyId(
              localUser?.company_id ||
                null
            );
          }
        } catch (fallbackError) {
          console.error(
            "Local Fallback Error:",
            fallbackError
          );
        }

        setError(
          err?.message ||
            "Unable to load company profile."
        );

        return false;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyCompanyData]
  );

  // =======================================================
  // LOAD USER + INITIAL PROFILE
  //
  // This effect will NOT loop because fetchProfile
  // has stable dependencies.
  // =======================================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      setError(
        "Please login first."
      );

      setLoading(false);

      return;
    }

    try {
      const parsedUser =
        JSON.parse(storedUser);

      setUser(parsedUser);

      // -----------------------------------------------
      // ROLE CHECK
      // -----------------------------------------------

      const role = String(
        parsedUser?.role || ""
      )
        .trim()
        .toLowerCase();

      if (role !== "recruiter") {
        setError(
          "Only recruiters can access company profile."
        );

        setLoading(false);

        return;
      }

      // -----------------------------------------------
      // RECRUITER ID
      // -----------------------------------------------

      const recruiterId =
        getRecruiterIdFromUser(
          parsedUser
        );

      if (!recruiterId) {
        setError(
          "Recruiter ID not found. Please login again."
        );

        setLoading(false);

        return;
      }

      // -----------------------------------------------
      // LOCAL STATUS FIRST
      // -----------------------------------------------

      const localStatus =
        normalizeStatus(
          parsedUser?.company_status ||
            "pending"
        );

      const localCanPost =
        typeof parsedUser?.can_post_job ===
        "boolean"
          ? parsedUser.can_post_job
          : localStatus ===
            "approved";

      setCompanyStatus(
        localStatus
      );

      setCompanyStatusMessage(
        getStatusMessage(
          localStatus,
          parsedUser?.company_message
        )
      );

      setCanPostJob(
        localCanPost
      );

      setCompanyId(
        parsedUser?.company_id ||
          null
      );

      // -----------------------------------------------
      // FETCH FRESH DATA
      // -----------------------------------------------

      fetchProfile(
        recruiterId,
        true
      );
    } catch (err) {
      console.error(
        "User Parse Error:",
        err
      );

      setError(
        "Invalid user data. Please login again."
      );

      setLoading(false);
    }
  }, [fetchProfile]);

  // =======================================================
  // INPUT CHANGE
  // =======================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (error) {
      setError("");
    }

    if (message) {
      setMessage("");
    }
  };

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh =
    async () => {
      const recruiterId =
        getRecruiterIdFromUser(
          user
        );

      if (!recruiterId) {
        setError(
          "Recruiter ID not found."
        );

        return;
      }

      await fetchProfile(
        recruiterId,
        false
      );
    };

  // =======================================================
  // SAVE PROFILE
  // =======================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setMessage("");
      setError("");

      const recruiterId =
        getRecruiterIdFromUser(
          user
        );

      if (!recruiterId) {
        setError(
          "Recruiter ID not found. Please login again."
        );

        return;
      }

      // -----------------------------------------------
      // CLEAN VALUES
      // -----------------------------------------------

      const companyName =
        String(
          formData.company_name ||
            ""
        ).trim();

      const email =
        String(
          formData.email || ""
        ).trim();

      const phone =
        String(
          formData.phone || ""
        ).trim();

      const location =
        String(
          formData.location ||
            ""
        ).trim();

      const website =
        String(
          formData.website ||
            ""
        ).trim();

      const industry = String(formData.industry || "").trim();
      const companySize = String(formData.company_size || "").trim();
      const foundedYear = String(formData.founded_year || "").trim();

      const description =
        String(
          formData.description ||
            ""
        ).trim();

      // -----------------------------------------------
      // COMPANY NAME
      // -----------------------------------------------

      if (!companyName) {
        setError(
          "Company name is required."
        );

        return;
      }

      // -----------------------------------------------
      // EMAIL
      // -----------------------------------------------

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        setError(
          "Please enter a valid email address."
        );

        return;
      }

      // -----------------------------------------------
      // WEBSITE
      // -----------------------------------------------

      if (
        website &&
        !isValidWebsite(
          website
        )
      ) {
        setError(
          "Please enter a valid website URL."
        );

        return;
      }

      const normalizedWebsite =
        normalizeWebsite(
          website
        );

      if (foundedYear && !/^\d{4}$/.test(foundedYear)) {
        setError("Founded year must be a valid 4-digit year.");
        return;
      }

      const currentYear = new Date().getFullYear();
      if (foundedYear && Number(foundedYear) > currentYear) {
        setError(`Founded year cannot be greater than ${currentYear}.`);
        return;
      }

      try {
        setSaving(true);

        // ---------------------------------------------
        // API REQUEST
        // ---------------------------------------------

        const response =
          await fetch(
            API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                recruiter_id:
                  recruiterId,

                company_name:
                  companyName,

                email,

                phone,

                location,

                website: normalizedWebsite,
                industry,
                company_size: companySize,
                companySize,
                founded_year: foundedYear,
                foundedYear,
                description,
              }),
            }
          );

        let result;

        try {
          result =
            await response.json();
        } catch {
          throw new Error(
            "Invalid response received from server."
          );
        }

        console.log(
          "Save Company Response:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Request failed with status ${response.status}`
          );
        }

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Failed to save company profile."
          );
        }

        const savedData =
          result?.data || {};

        // ---------------------------------------------
        // STATUS
        // ---------------------------------------------

        const latestStatus =
          normalizeStatus(
            savedData.status ||
              savedData.company_status ||
              result?.status ||
              companyStatus ||
              "pending"
          );

        // ---------------------------------------------
        // COMPANY ID
        // ---------------------------------------------

        const latestCompanyId =
          savedData.company_id ??
          savedData.id ??
          result?.company_id ??
          companyId ??
          null;

        // ---------------------------------------------
        // POST JOB PERMISSION
        // ---------------------------------------------

        const latestCanPost =
          typeof savedData.can_post_job ===
          "boolean"
            ? savedData.can_post_job
            : latestStatus ===
              "approved";

        // ---------------------------------------------
        // STATUS MESSAGE
        // ---------------------------------------------

        const latestStatusMessage =
          getStatusMessage(
            latestStatus,

            savedData.status_message ||
              savedData.company_message ||
              result?.status_message ||
              result?.company_message ||
              ""
          );

        // ---------------------------------------------
        // UPDATE STATE
        // ---------------------------------------------

        setCompanyId(
          latestCompanyId
        );

        setCompanyStatus(
          latestStatus
        );

        setCompanyStatusMessage(
          latestStatusMessage
        );

        setCanPostJob(
          latestCanPost
        );

        // ---------------------------------------------
        // UPDATE FORM
        // ---------------------------------------------

        setFormData({
          company_name:
            savedData.company_name ??
            companyName,

          email:
            savedData.email ??
            email,

          phone:
            savedData.phone ??
            phone,

          location:
            savedData.location ??
            location,

          website:
            savedData.website ??
            normalizedWebsite,

          industry:
            savedData.industry ?? savedData.company_industry ?? industry,

          company_size:
            savedData.company_size ?? savedData.companySize ?? companySize,

          founded_year:
            savedData.founded_year ?? savedData.foundedYear ?? foundedYear,

          description:
            savedData.description ??
            description,
        });

        // ---------------------------------------------
        // UPDATE LOCAL STORAGE
        // ---------------------------------------------

        updateLocalUser({
          company_id:
            latestCompanyId,

          company_name:
            savedData.company_name ||
            companyName,

          company_status:
            latestStatus,

          company_message:
            latestStatusMessage,

          can_post_job:
            latestCanPost,

          email:
            savedData.email ??
            email,

          phone:
            savedData.phone ??
            phone,
        });

        // ---------------------------------------------
        // SUCCESS MESSAGE
        // ---------------------------------------------

        setMessage(
          result?.message ||
            (latestStatus ===
            "pending"
              ? "Company profile saved successfully. Your company is now waiting for admin approval."
              : "Company profile saved successfully.")
        );
      } catch (err) {
        console.error(
          "Save Company Error:",
          err
        );

        setError(
          err?.message ||
            "Server error. Please try again."
        );
      } finally {
        setSaving(false);
      }
    };

  // =======================================================
  // STATUS CONFIG
  // =======================================================

  const normalizedStatus =
    normalizeStatus(
      companyStatus
    );

  const statusConfig =
    STATUS_CONFIG[
      normalizedStatus
    ];

  const StatusIcon =
    statusConfig.icon;

  // =======================================================
  // PROFILE COMPLETION
  // =======================================================

  const completion =
    useMemo(() => {
      const fields = [
        formData.company_name,
        formData.email,
        formData.phone,
        formData.location,
        formData.website,
        formData.industry,
        formData.company_size,
        formData.founded_year,
        formData.description,
      ];

      const completed =
        fields.filter(
          (field) =>
            String(
              field || ""
            )
              .trim()
              .length > 0
        ).length;

      return Math.round(
        (completed /
          fields.length) *
          100
      );
    }, [formData]);

  // =======================================================
  // LOADING UI
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />
          </div>

          <p className="mt-5 text-sm font-black text-slate-800">
            Loading company profile...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait while we fetch your company information.
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <div className="w-full min-w-0">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner backdrop-blur">
                <Building2 size={28} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                  Recruiter Workspace
                </p>

                <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Company Profile
                </h1>

                <p className="mt-1 text-sm text-blue-100">
                  Manage your company information and approval status.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <span
                className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wide ${statusConfig.badge}`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* PROFILE COMPLETION */}

        <div className="px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Profile Completion
              </p>

              <p className="mt-1 text-sm font-bold text-slate-700">
                Complete your company profile
              </p>
            </div>

            <p className="text-lg font-black text-blue-600">
              {completion}%
            </p>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
              style={{
                width: `${completion}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            A complete profile helps candidates understand your company better.
          </p>
        </div>
      </div>

      {/* =================================================
          STATUS CARD
      ================================================= */}

      <div
        className={`mb-6 rounded-3xl border p-5 shadow-sm sm:p-6 ${statusConfig.container}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${statusConfig.iconContainer}`}
          >
            <StatusIcon size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={`text-base font-black ${statusConfig.titleClass}`}
              >
                {statusConfig.title}
              </h2>

              {companyId && (
                <span
                  className={`rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold ${statusConfig.textClass}`}
                >
                  Company ID: {companyId}
                </span>
              )}
            </div>

            <p
              className={`mt-1 text-sm leading-6 ${statusConfig.textClass}`}
            >
              {companyStatusMessage ||
                statusConfig.message}
            </p>

            {normalizedStatus ===
              "approved" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2.5 text-xs font-black text-green-700 shadow-sm">
                <CheckCircle2
                  size={16}
                />
                You can post jobs
              </div>
            )}

            {normalizedStatus ===
              "pending" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2.5 text-xs font-bold text-amber-700">
                <Clock3 size={16} />
                Waiting for admin approval
              </div>
            )}

            {normalizedStatus ===
              "rejected" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2.5 text-xs font-bold text-red-700">
                <XCircle size={16} />
                Contact admin for more information
              </div>
            )}

            {normalizedStatus ===
              "suspended" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2.5 text-xs font-bold text-orange-700">
                <ShieldAlert
                  size={16}
                />
                Job posting is temporarily disabled
              </div>
            )}

            {normalizedStatus ===
              "blocked" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2.5 text-xs font-bold text-red-700">
                <Ban size={16} />
                Job posting is blocked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {message && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 shadow-sm">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <div>
            <p className="font-black">
              Success
            </p>

            <p className="mt-1 leading-6">
              {message}
            </p>
          </div>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="min-w-0 flex-1">
            <p className="font-black">
              Something went wrong
            </p>

            <p className="mt-1 leading-6">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 text-red-500 transition hover:bg-red-100"
            aria-label="Close error"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        {/* FORM HEADER */}

        <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 size={19} />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Company Information
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Keep your company information accurate so candidates can understand your organization.
              </p>
            </div>
          </div>
        </div>

        {/* FORM BODY */}

        <div className="p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* COMPANY NAME */}

            <div>
              <label
                htmlFor="company_name"
                className="text-sm font-bold text-slate-700"
              >
                Company Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative mt-2">
                <Building2
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="company_name"
                  type="text"
                  name="company_name"
                  value={
                    formData.company_name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter company name"
                  required
                  maxLength={255}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-bold text-slate-700"
              >
                Company Email
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="company@example.com"
                  maxLength={255}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* PHONE */}

            <div>
              <label
                htmlFor="phone"
                className="text-sm font-bold text-slate-700"
              >
                Phone Number
              </label>

              <div className="relative mt-2">
                <Phone
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="+91 XXXXX XXXXX"
                  maxLength={30}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* LOCATION */}

            <div>
              <label
                htmlFor="location"
                className="text-sm font-bold text-slate-700"
              >
                Location
              </label>

              <div className="relative mt-2">
                <MapPin
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="location"
                  type="text"
                  name="location"
                  value={
                    formData.location
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Lucknow, India"
                  maxLength={255}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* INDUSTRY */}
            <div>
              <label htmlFor="industry" className="text-sm font-bold text-slate-700">Industry</label>
              <div className="relative mt-2">
                <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="industry" type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Information Technology" maxLength={150} className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </div>

            {/* COMPANY SIZE */}
            <div>
              <label htmlFor="company_size" className="text-sm font-bold text-slate-700">Company Size</label>
              <div className="relative mt-2">
                <select id="company_size" name="company_size" value={formData.company_size} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001-5000">1001-5000 employees</option>
                  <option value="5001-10000">5001-10000 employees</option>
                  <option value="10001+">10001+ employees</option>
                </select>
              </div>
            </div>

            {/* FOUNDED YEAR */}
            <div>
              <label htmlFor="founded_year" className="text-sm font-bold text-slate-700">Founded Year</label>
              <div className="relative mt-2">
                <input id="founded_year" type="number" name="founded_year" value={formData.founded_year} onChange={handleChange} placeholder="e.g. 2015" min="1800" max={new Date().getFullYear()} inputMode="numeric" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </div>

            {/* WEBSITE */}
            <div className="md:col-span-2">
              <label
                htmlFor="website"
                className="text-sm font-bold text-slate-700"
              >
                Company Website
              </label>

              <div className="relative mt-2">
                <Globe
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="website"
                  type="url"
                  name="website"
                  value={
                    formData.website
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://www.example.com"
                  maxLength={500}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Example:
                https://www.yourcompany.com
              </p>
            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="description"
                  className="text-sm font-bold text-slate-700"
                >
                  Company Description
                </label>

                <span
                  className={`text-xs font-bold ${
                    formData.description
                      .length >= 900
                      ? "text-amber-600"
                      : "text-slate-400"
                  }`}
                >
                  {
                    formData.description
                      .length
                  }
                  /1000
                </span>
              </div>

              <textarea
                id="description"
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                maxLength={1000}
                rows={6}
                placeholder="Tell candidates about your company, products, services, culture and what makes your organization a great place to work..."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <p className="mt-2 text-xs leading-5 text-slate-400">
                A clear company description helps candidates understand your organization before applying.
              </p>
            </div>
          </div>

          {/* SAVE AREA */}

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
              <ShieldAlert
                size={15}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <span>
                <strong className="text-slate-700">
                  Note:
                </strong>{" "}
                Company approval status can only be changed by an administrator.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* =================================================
          POST JOB PERMISSION
      ================================================= */}

      <div
        className={`mt-6 rounded-3xl border p-5 shadow-sm sm:p-6 ${
          canPostJob
            ? "border-green-200 bg-green-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              canPostJob
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {canPostJob ? (
              <CheckCircle2 size={22} />
            ) : (
              <AlertTriangle
                size={22}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-sm font-black ${
                  canPostJob
                    ? "text-green-900"
                    : "text-amber-900"
                }`}
              >
                Job Posting Permission
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                  canPostJob
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {canPostJob
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>

            <p
              className={`mt-2 text-sm leading-6 ${
                canPostJob
                  ? "text-green-800"
                  : "text-amber-800"
              }`}
            >
              {canPostJob
                ? "Your company is approved. You can now post new jobs and manage your existing job postings."
                : "Your company is not approved yet. You will be able to post jobs after an administrator approves your company."}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          COMPANY STATUS GUIDE
      ================================================= */}

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Approval Process
          </p>

          <h3 className="mt-1 text-lg font-black text-slate-900">
            How company approval works
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Your company status is controlled by the admin team.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              key: "pending",
              label: "Pending",
              description:
                "Waiting for admin review.",
            },
            {
              key: "approved",
              label: "Approved",
              description:
                "Job posting is enabled.",
            },
            {
              key: "rejected",
              label: "Rejected",
              description:
                "Company was not approved.",
            },
            {
              key: "suspended",
              label: "Suspended",
              description:
                "Temporarily restricted.",
            },
            {
              key: "blocked",
              label: "Blocked",
              description:
                "Access to job posting is blocked.",
            },
          ].map((item) => {
            const config =
              STATUS_CONFIG[item.key];

            const Icon =
              config.icon;

            const isCurrent =
              normalizedStatus ===
              item.key;

            return (
              <div
                key={item.key}
                className={`rounded-2xl border p-4 transition ${
                  isCurrent
                    ? `${config.container} ring-2 ring-blue-500/10`
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${config.iconContainer}`}
                >
                  <Icon size={17} />
                </div>

                <p className="mt-3 text-sm font-black text-slate-800">
                  {item.label}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>

                {isCurrent && (
                  <span className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600 shadow-sm">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;