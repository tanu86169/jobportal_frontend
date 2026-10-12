import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

import API_BASE from "../../config/api";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  IndianRupee,
  Loader2,
  MapPin,
  Upload,
  Users,
  X,
} from "lucide-react";

// =========================================================
// API ENDPOINTS
// =========================================================

const JOBS_API = `${API_BASE}/jobs/get-all.php`;
const APPLY_API = `${API_BASE}/applications/apply.php`;
const CHECK_APPLICATION_API = `${API_BASE}/applications/check.php`;

// =========================================================
// SKELETON PRIMITIVE
// =========================================================

const Skeleton = ({ className = "", style }) => (
  <div
    style={style}
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

// =========================================================
// APPLY JOB SKELETON
// =========================================================

const ApplyJobSkeleton = () => {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">

        {/* ===== PAGE HEADER SKELETON ===== */}
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <Skeleton className="mb-8 h-5 w-20 !bg-white/15" />

            <div className="flex flex-col md:flex-row gap-6 md:items-center">

              {/* Company Logo */}
              <Skeleton className="h-20 w-20 shrink-0 rounded-2xl !bg-white/15" />

              {/* Job Header */}
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-3/4 !bg-white/20 md:h-10 md:w-2/3" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-5 w-32 !bg-white/15" />
                  <Skeleton className="h-5 w-4 !bg-white/15" />
                  <Skeleton className="h-5 w-28 !bg-white/15" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===== MAIN CONTENT SKELETON ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ===== APPLICATION FORM SKELETON ===== */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">

                {/* Form Header */}
                <div className="mb-8 space-y-2">
                  <Skeleton className="h-7 w-64 md:h-8 md:w-72" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>

                {/* Resume field */}
                <div className="mb-7">
                  <Skeleton className="mb-2 h-4 w-20" />

                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center">
                    <Skeleton className="mb-3 h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-3 w-52" />
                  </div>
                </div>

                {/* Cover letter field */}
                <div className="mb-7">
                  <Skeleton className="mb-2 h-4 w-28" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="mt-2 h-3 w-64" />
                </div>

                {/* Submit button */}
                <Skeleton className="h-12 w-full rounded-xl" />

              </div>
            </div>

            {/* ===== SIDEBAR SKELETON ===== */}
            <div className="space-y-6">

              {/* Job Details card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <Skeleton className="mb-5 h-6 w-32" />

                <div className="space-y-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-5 w-5 shrink-0 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidate info card */}
              <div className="bg-cyan-50 rounded-2xl border border-cyan-100 p-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="mt-3 h-5 w-40" />
                <Skeleton className="mt-1 h-4 w-48" />
              </div>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
};

// =========================================================
// Get logged-in user
// =========================================================

const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to read logged-in user:", error);
    return null;
  }
};

// =========================================================
// Get USER ID
//
// IMPORTANT:
// Current application architecture:
// applications.candidate_id = users.id
//
// So candidateId here means users.id.
// =========================================================

const getCandidateId = () => {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  const role = String(user.role || "")
    .toLowerCase()
    .trim();

  if (role !== "candidate") {
    return null;
  }

  const id =
    user.id ??
    user.userId ??
    user.user_id ??
    localStorage.getItem("userId") ??
    localStorage.getItem("user_id");

  const userId = Number(id);

  return Number.isInteger(userId) && userId > 0
    ? userId
    : null;
};

// =========================================================
// Get image/logo URL
// =========================================================

const getAssetUrl = (value) => {
  if (!value) {
    return "";
  }

  let asset = String(value).trim();

  if (!asset) {
    return "";
  }

  // -------------------------------------------------------
  // Full HTTP / HTTPS URL
  // -------------------------------------------------------

  if (/^https?:\/\//i.test(asset)) {
    // Backend may have stored localhost URL.
    // Convert it to API root based URL.
    const localhostApiPattern =
      /^https?:\/\/localhost\/job_portal\/job-portal-api\/?/i;

    if (localhostApiPattern.test(asset)) {
      asset = asset.replace(
        localhostApiPattern,
        ""
      );
    } else {
      return asset;
    }
  }

  // -------------------------------------------------------
  // Normalize slashes
  // -------------------------------------------------------

  asset = asset.replace(/\\/g, "/");

  asset = asset.replace(/^\/+/, "");

  // -------------------------------------------------------
  // If backend already returns a full /uploads path,
  // API_ROOT will be used as base.
  // -------------------------------------------------------

  return `${API_ROOT}/${asset}`;
};

// =========================================================
// Format salary
// =========================================================

const formatSalary = (salary) => {
  if (
    salary === null ||
    salary === undefined ||
    String(salary).trim() === ""
  ) {
    return "Not disclosed";
  }

  return String(salary);
};

// =========================================================
// Format date
// =========================================================

const formatDate = (date) => {
  if (!date) {
    return "Not specified";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =========================================================
// Apply Job Component
// =========================================================

const ApplyJob = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  // -------------------------------------------------------
  // User
  // -------------------------------------------------------

  const user = getCurrentUser();

  const candidateId = getCandidateId();

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------

  const [job, setJob] = useState(
    location.state?.job || null
  );

  const [loading, setLoading] = useState(
    !location.state?.job
  );

  const [submitting, setSubmitting] = useState(false);

  const [checkingApplication, setCheckingApplication] =
    useState(true);

  const [alreadyApplied, setAlreadyApplied] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    coverLetter: "",
    resume: null,
  });

  const [resumeError, setResumeError] = useState("");

  // =========================================================
  // Fetch Job Details
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchJob = async () => {
      // -----------------------------------------------------
      // If job came from navigation state
      // -----------------------------------------------------

      if (location.state?.job) {
        setJob(location.state.job);
        setLoading(false);
        return;
      }

      // -----------------------------------------------------
      // Fetch all jobs
      // -----------------------------------------------------

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(JOBS_API);

        console.log(
          "Jobs API response:",
          response.data
        );

        if (response.data?.success === false) {
          throw new Error(
            response.data?.message ||
              "Unable to load jobs."
          );
        }

        // ---------------------------------------------------
        // Support multiple response structures
        // ---------------------------------------------------

        const jobs = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.jobs)
          ? response.data.jobs
          : Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.data?.jobs)
          ? response.data.data.jobs
          : [];

        const foundJob = jobs.find(
          (item) =>
            String(item.id ?? item.job_id) ===
            String(id)
        );

        if (!foundJob) {
          throw new Error("Job not found.");
        }

        if (!cancelled) {
          setJob(foundJob);
        }
      } catch (err) {
        console.error(
          "Fetch job error:",
          err.response?.data || err
        );

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load job."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  // =========================================================
  // Check Already Applied
  // =========================================================
  //
  // IMPORTANT:
  // check.php should also use:
  //
  // candidateId = users.id
  //
  // because current applications table stores
  // users.id inside candidate_id.
  //
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const checkApplication = async () => {
      setCheckingApplication(true);

      if (!candidateId || !id) {
        setAlreadyApplied(false);
        setCheckingApplication(false);
        return;
      }

      try {
        const response = await axios.get(
          CHECK_APPLICATION_API,
          {
            params: {
              jobId: Number(id),
              candidateId: Number(candidateId),
            },
          }
        );

        console.log(
          "Check application response:",
          response.data
        );

        if (cancelled) {
          return;
        }

        if (response.data?.success === true) {
          setAlreadyApplied(
            response.data?.applied === true
          );
        } else {
          setAlreadyApplied(false);

          setError(
            response.data?.message ||
              "Unable to check application."
          );
        }
      } catch (err) {
        console.error(
          "Check application error:",
          err.response?.data || err
        );

        if (!cancelled) {
          setAlreadyApplied(false);

          setError(
            err.response?.data?.message ||
              "Application status check nahi ho saka. Please retry."
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingApplication(false);
        }
      }
    };

    checkApplication();

    return () => {
      cancelled = true;
    };
  }, [id, candidateId]);

  // =========================================================
  // Validate Resume
  // =========================================================

  const validateResume = (file) => {
    if (!file) {
      return "Please select your resume.";
    }

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
    ];

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return "Only PDF, DOC and DOCX files are allowed.";
    }

    if (file.size <= 0) {
      return "Selected resume is empty.";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Resume size must be less than or equal to 5 MB.";
    }

    return "";
  };

  // =========================================================
  // Resume Selection
  // =========================================================

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    setResumeError("");
    setSuccess("");
    setError("");

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        resume: null,
      }));

      return;
    }

    const validationError = validateResume(file);

    if (validationError) {
      setResumeError(validationError);

      setFormData((prev) => ({
        ...prev,
        resume: null,
      }));

      event.target.value = "";

      return;
    }

    setFormData((prev) => ({
      ...prev,
      resume: file,
    }));
  };

  // =========================================================
  // Cover Letter
  // =========================================================

  const handleCoverLetterChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      coverLetter: event.target.value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // Submit Application
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setResumeError("");

    // -------------------------------------------------------
    // Candidate Login Check
    // -------------------------------------------------------

    if (
      !user ||
      String(user.role || "")
        .toLowerCase()
        .trim() !== "candidate"
    ) {
      navigate("/login", {
        state: {
          redirectTo: `/jobs/${id}/apply`,
          message:
            "Please login as a candidate to apply.",
        },
      });

      return;
    }

    // -------------------------------------------------------
    // Candidate ID Check
    // -------------------------------------------------------

    if (!candidateId) {
      setError(
        "Candidate information not found. Please login again."
      );

      return;
    }

    // -------------------------------------------------------
    // Job Check
    // -------------------------------------------------------

    if (!job) {
      setError(
        "Job information is not available."
      );

      return;
    }

    // -------------------------------------------------------
    // Already Applied
    // -------------------------------------------------------

    if (alreadyApplied) {
      setError(
        "You have already applied for this job."
      );

      return;
    }

    // -------------------------------------------------------
    // Resume Validation
    // -------------------------------------------------------

    const resumeValidation =
      validateResume(formData.resume);

    if (resumeValidation) {
      setResumeError(resumeValidation);
      return;
    }

    // -------------------------------------------------------
    // Job ID
    // -------------------------------------------------------

    const jobId = Number(
      job.id ?? job.job_id
    );

    if (!jobId || jobId <= 0) {
      setError("Invalid job ID.");
      return;
    }

    try {
      setSubmitting(true);

      // -----------------------------------------------------
      // FormData
      // -----------------------------------------------------

      const data = new FormData();

      data.append(
        "job_id",
        String(jobId)
      );

      // IMPORTANT:
      // Current DB architecture:
      // applications.candidate_id = users.id
      //
      // Therefore send logged-in users.id here.
      data.append(
        "candidate_id",
        String(candidateId)
      );

      data.append(
        "cover_letter",
        formData.coverLetter.trim()
      );

      data.append(
        "resume",
        formData.resume
      );

      // -----------------------------------------------------
      // Submit
      // -----------------------------------------------------

      const response = await axios.post(
        APPLY_API,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(
        "Apply job response:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to submit application."
        );
      }

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setAlreadyApplied(true);

      setSuccess(
        response.data?.message ||
          "Application submitted successfully."
      );

      setFormData({
        coverLetter: "",
        resume: null,
      });

      setResumeError("");

    } catch (err) {
      console.error(
        "Apply job error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // Loading (SKELETON)
  // =========================================================

  if (loading) {
    return <ApplyJobSkeleton />;
  }

  // =========================================================
  // Job Not Found
  // =========================================================

  if (!job) {
    return (
      <>
        <Header />

        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center max-w-md w-full">
            <X
              className="mx-auto text-red-500 mb-4"
              size={40}
            />

            <h2 className="text-xl font-bold text-slate-800">
              Job Not Found
            </h2>

            <p className="text-slate-500 mt-2">
              {error ||
                "This job is no longer available."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="mt-6 px-5 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700"
            >
              Browse Jobs
            </button>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  // =========================================================
  // Company Logo
  // =========================================================

  const companyLogo = getAssetUrl(
    job.company_logo_url ||
      job.company_logo ||
      job.logo
  );

  // =========================================================
  // Render
  // =========================================================

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="flex flex-col md:flex-row gap-6 md:items-center">

              {/* Company Logo */}

              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shrink-0">

                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={
                      job.company_name ||
                      "Company"
                    }
                    className="w-full h-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <Building2
                    size={34}
                    className="text-cyan-600"
                  />
                )}

              </div>

              {/* Job Header */}

              <div>
                <h1 className="text-2xl md:text-4xl font-bold">
                  {job.job_title ||
                    job.title ||
                    "Job Position"}
                </h1>

                <p className="mt-2 text-slate-300 flex flex-wrap gap-3">

                  <span>
                    {job.company_name ||
                      "Company"}
                  </span>

                  {job.location && (
                    <>
                      <span>•</span>

                      <span>
                        {job.location}
                      </span>
                    </>
                  )}

                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="grid lg:grid-cols-3 gap-8">

            {/* =================================================
                APPLICATION AREA
            ================================================= */}

            <div className="lg:col-span-2">

              {/* =================================================
                  SUCCESS SCREEN
              ================================================= */}

              {success && alreadyApplied ? (

                <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-8 md:p-12 text-center">

                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2
                      size={44}
                      className="text-green-600"
                    />
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Application Submitted
                    Successfully!
                  </h2>

                  <p className="text-slate-600 mt-3">
                    Your application for{" "}
                    <span className="font-semibold">
                      {job.job_title ||
                        job.title}
                    </span>{" "}
                    at{" "}
                    <span className="font-semibold">
                      {job.company_name ||
                        "this company"}
                    </span>{" "}
                    has been submitted
                    successfully.
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    You can track your application
                    status from your applications
                    page.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/candidate/applications"
                      )
                    }
                    className="mt-7 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    View My Applications
                  </button>

                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/jobs")
                      }
                      className="mt-4 text-slate-600 hover:text-cyan-700 font-medium"
                    >
                      Browse More Jobs
                    </button>
                  </div>

                </div>

              ) : (

                /* =================================================
                   APPLICATION FORM
                ================================================= */

                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8"
                >

                  {/* Form Header */}

                  <div className="mb-8">

                    <h2 className="text-2xl font-bold text-slate-900">
                      Apply for this position
                    </h2>

                    <p className="text-slate-500 mt-2">
                      Upload your resume and submit
                      your application for this job.
                    </p>

                  </div>

                  {/* =================================================
                      ALREADY APPLIED
                  ================================================= */}

                  {alreadyApplied && !success && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 flex gap-3">

                      <CheckCircle2
                        className="text-green-600 shrink-0"
                        size={22}
                      />

                      <div>
                        <p className="font-semibold text-green-800">
                          Already Applied
                        </p>

                        <p className="text-sm text-green-700 mt-1">
                          You have already submitted
                          an application for this
                          job.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* =================================================
                      ERROR
                  ================================================= */}

                  {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                      {error}
                    </div>
                  )}

                  {/* =================================================
                      RESUME
                  ================================================= */}

                  <div className="mb-7">

                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Resume{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50/30 transition">

                      <Upload
                        size={32}
                        className="text-cyan-600 mb-3"
                      />

                      <span className="font-semibold text-slate-800">
                        {formData.resume
                          ? formData.resume.name
                          : "Upload your resume"}
                      </span>

                      <span className="text-sm text-slate-500 mt-1">
                        PDF, DOC or DOCX • Maximum
                        5 MB
                      </span>

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={
                          handleResumeChange
                        }
                        className="hidden"
                        disabled={
                          submitting ||
                          alreadyApplied
                        }
                      />

                    </label>

                    {resumeError && (
                      <p className="text-sm text-red-600 mt-2">
                        {resumeError}
                      </p>
                    )}

                    {/* Selected Resume */}

                    {formData.resume &&
                      !resumeError && (
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 border p-3">

                          <div className="flex items-center gap-3 min-w-0">

                            <FileText
                              size={20}
                              className="text-cyan-600 shrink-0"
                            />

                            <div className="min-w-0">

                              <p className="font-medium text-slate-800 truncate">
                                {
                                  formData
                                    .resume
                                    .name
                                }
                              </p>

                              <p className="text-xs text-slate-500">
                                {(
                                  formData
                                    .resume
                                    .size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>

                            </div>

                          </div>

                          {!alreadyApplied && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData(
                                  (prev) => ({
                                    ...prev,
                                    resume: null,
                                  })
                                )
                              }
                              className="text-red-500 hover:text-red-700"
                              aria-label="Remove resume"
                            >
                              <X size={20} />
                            </button>
                          )}

                        </div>
                      )}

                  </div>

                  {/* =================================================
                      COVER LETTER
                  ================================================= */}

                  <div className="mb-7">

                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Cover Letter
                    </label>

                    <textarea
                      value={
                        formData.coverLetter
                      }
                      onChange={
                        handleCoverLetterChange
                      }
                      disabled={
                        submitting ||
                        alreadyApplied
                      }
                      rows={8}
                      placeholder="Write a short cover letter explaining why you are suitable for this position..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none disabled:bg-slate-100"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                      Keep your cover letter clear
                      and relevant to this
                      position.
                    </p>

                  </div>

                  {/* =================================================
                      SUBMIT
                  ================================================= */}

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      alreadyApplied ||
                      checkingApplication
                    }
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-400 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                  >

                    {submitting ? (
                      <>
                        <Loader2
                          size={20}
                          className="animate-spin"
                        />
                        Submitting Application...
                      </>
                    ) : checkingApplication ? (
                      <>
                        <Loader2
                          size={20}
                          className="animate-spin"
                        />
                        Checking Application...
                      </>
                    ) : alreadyApplied ? (
                      <>
                        <CheckCircle2 size={20} />
                        Applied
                      </>
                    ) : (
                      <>
                        <BriefcaseBusiness
                          size={20}
                        />
                        Submit Application
                      </>
                    )}

                  </button>

                </form>
              )}

            </div>

            {/* =================================================
                JOB DETAILS
            ================================================= */}

            <div className="space-y-6">

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                <h3 className="text-lg font-bold text-slate-900 mb-5">
                  Job Details
                </h3>

                <div className="space-y-5">

                  {/* Job Type */}

                  <div className="flex gap-3">

                    <BriefcaseBusiness
                      size={20}
                      className="text-cyan-600 shrink-0"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Job Type
                      </p>

                      <p className="font-medium text-slate-800">
                        {job.job_type ||
                          "Not specified"}
                      </p>
                    </div>

                  </div>

                  {/* Location */}

                  <div className="flex gap-3">

                    <MapPin
                      size={20}
                      className="text-cyan-600 shrink-0"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Location
                      </p>

                      <p className="font-medium text-slate-800">
                        {job.location ||
                          "Not specified"}
                      </p>
                    </div>

                  </div>

                  {/* Salary */}

                  <div className="flex gap-3">

                    <IndianRupee
                      size={20}
                      className="text-cyan-600 shrink-0"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Salary
                      </p>

                      <p className="font-medium text-slate-800">
                        {formatSalary(
                          job.salary
                        )}
                      </p>
                    </div>

                  </div>

                  {/* Experience */}

                  <div className="flex gap-3">

                    <GraduationCap
                      size={20}
                      className="text-cyan-600 shrink-0"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Experience
                      </p>

                      <p className="font-medium text-slate-800">
                        {job.experience ||
                          "Not specified"}
                      </p>
                    </div>

                  </div>

                  {/* Vacancies */}

                  <div className="flex gap-3">

                    <Users
                      size={20}
                      className="text-cyan-600 shrink-0"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Vacancies
                      </p>

                      <p className="font-medium text-slate-800">
                        {job.vacancies ||
                          "Not specified"}
                      </p>
                    </div>

                  </div>

                  {/* Deadline */}

                  <div className="flex gap-3">

                    <CalendarDays
                      size={20}
                      className="text-cyan-600 shrink-0"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Application Deadline
                      </p>

                      <p className="font-medium text-slate-800">
                        {formatDate(
                          job.deadline
                        )}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  CANDIDATE INFO
              ================================================= */}

              <div className="bg-cyan-50 rounded-2xl border border-cyan-100 p-6">

                <h3 className="font-bold text-slate-900">
                  Applying as
                </h3>

                <p className="mt-3 font-semibold text-slate-800">
                  {user?.name || "Candidate"}
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  {user?.email || ""}
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
};

export default ApplyJob;