import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Loader2,
  BriefcaseBusiness,
  MapPin,
  DollarSign,
  Clock3,
  CalendarDays,
  GraduationCap,
  Code2,
  FileText,
  Users,
  Upload,
  Image as ImageIcon,
  X,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// =========================================================
// API URLs
// =========================================================

import API_BASE from "../Config/api";

const GET_MY_JOBS_API = `${API_BASE}/jobs/get-my-jobs.php`;

const UPDATE_JOB_API = `${API_BASE}/jobs/update.php`;

const JOB_TYPES_API = `${API_BASE}/options/job-types.php`;

const WORKPLACE_TYPES_API = `${API_BASE}/options/workplace-types.php`;

const CATEGORIES_API = `${API_BASE}/options/categories.php`;

// =========================================================
// INITIAL FORM
// =========================================================

const initialFormData = {
  jobTitle: "",
  companyName: "",
  workplaceType: "",
  location: "",
  vacancies: "1",
  jobType: "",
  category: "",
  experience: "",
  education: "",
  salaryMin: "",
  salaryMax: "",
  salaryType: "Per Year",
  deadline: "",
  description: "",
  responsibilities: "",
  requirements: "",
};

// =========================================================
// LOGO URL HELPER
// =========================================================

const getLogoUrl = (logo) => {
  if (!logo) return "";

  const value = String(logo).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `http://localhost${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `import.meta.env.VITE_API_URL/${value}`;
  }

  return `import.meta.env.VITE_API_URL/uploads/${value}`;
};

// =========================================================
// PARSE SALARY
// Example:
// ₹300000 - ₹600000 Per Year
// ₹25000 - ₹50000 Per Month
// =========================================================

const parseSalary = (salary) => {
  if (!salary) {
    return {
      min: "",
      max: "",
      type: "Per Year",
    };
  }

  const value = String(salary).trim();

  let type = "Per Year";

  if (value.toLowerCase().includes("per month")) {
    type = "Per Month";
  } else if (value.toLowerCase().includes("per day")) {
    type = "Per Day";
  }

  const numbers = value.match(/[\d,]+/g);

  if (!numbers || numbers.length === 0) {
    return {
      min: "",
      max: "",
      type,
    };
  }

  const cleanNumber = (number) =>
    String(number).replace(/,/g, "");

  return {
    min: cleanNumber(numbers[0] || ""),
    max: cleanNumber(numbers[1] || ""),
    type,
  };
};

// =========================================================
// COMPONENT
// =========================================================

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // =======================================================
  // STATES
  // =======================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState(initialFormData);

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [removeExistingLogo, setRemoveExistingLogo] =
    useState(false);

  const [jobTypes, setJobTypes] = useState([]);
  const [workplaceTypes, setWorkplaceTypes] =
    useState([]);
  const [categories, setCategories] = useState([]);

  const [optionsLoading, setOptionsLoading] =
    useState(true);

  // =======================================================
  // GET USER
  // =======================================================

  const getUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "User Parse Error:",
        error
      );

      return null;
    }
  };

  // =======================================================
  // SESSION CHECK
  // =======================================================

  useEffect(() => {
    const user = getUser();

    if (!user || !user.id) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const role = String(
      user.role || ""
    )
      .toLowerCase()
      .trim();

    if (role !== "recruiter") {
      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // =======================================================
  // LOAD OPTIONS
  // =======================================================

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptionsLoading(true);

        const [
          jobTypeResponse,
          workplaceResponse,
          categoryResponse,
        ] = await Promise.all([
          axios.get(JOB_TYPES_API),
          axios.get(WORKPLACE_TYPES_API),
          axios.get(CATEGORIES_API),
        ]);

        if (jobTypeResponse.data?.success) {
          setJobTypes(
            jobTypeResponse.data.jobTypes || []
          );
        }

        if (workplaceResponse.data?.success) {
          setWorkplaceTypes(
            workplaceResponse.data.workplaceTypes ||
              []
          );
        }

        if (categoryResponse.data?.success) {
          setCategories(
            categoryResponse.data.categories || []
          );
        }
      } catch (error) {
        console.error(
          "Options Error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load job options."
        );
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // =======================================================
  // LOAD JOB
  // =======================================================

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const user = getUser();

        if (!user || !user.id) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const role = String(
          user.role || ""
        )
          .toLowerCase()
          .trim();

        if (role !== "recruiter") {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const response = await axios.get(
          `${GET_MY_JOBS_API}?recruiterId=${Number(
            user.id
          )}`
        );

        console.log(
          "My Jobs Response:",
          response.data
        );

        const data = response.data;

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Failed to fetch jobs."
          );
        }

        const jobs = data.jobs || [];

        const foundJob = jobs.find(
          (job) =>
            Number(job.id) === Number(id)
        );

        if (!foundJob) {
          throw new Error(
            "Job not found or you are not authorized to edit this job."
          );
        }

        console.log(
          "Found Job:",
          foundJob
        );

        // =================================================
        // SALARY
        // =================================================

        const salary = parseSalary(
          foundJob.salary
        );

        // =================================================
        // SKILLS
        // =================================================

        let loadedSkills = [];

        if (Array.isArray(foundJob.skills)) {
          loadedSkills =
            foundJob.skills;
        } else if (foundJob.skills) {
          loadedSkills = String(
            foundJob.skills
          )
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
        }

        // =================================================
        // FORM DATA
        // =================================================

        setFormData({
          jobTitle:
            foundJob.job_title ||
            foundJob.jobTitle ||
            "",

          companyName:
            foundJob.company_name ||
            foundJob.companyName ||
            "",

          workplaceType:
            foundJob.workplace_type ||
            foundJob.workplaceType ||
            "",

          location:
            foundJob.location || "",

          vacancies: String(
            foundJob.vacancies ||
              foundJob.number_of_openings ||
              1
          ),

          jobType:
            foundJob.job_type ||
            foundJob.jobType ||
            "",

          category:
            foundJob.category || "",

          experience:
            foundJob.experience || "",

          education:
            foundJob.education || "",

          salaryMin:
            foundJob.salary_min ||
            foundJob.salaryMin ||
            salary.min ||
            "",

          salaryMax:
            foundJob.salary_max ||
            foundJob.salaryMax ||
            salary.max ||
            "",

          salaryType:
            foundJob.salary_type ||
            foundJob.salaryType ||
            salary.type ||
            "Per Year",

          deadline:
            foundJob.deadline || "",

          description:
            foundJob.description || "",

          responsibilities:
            foundJob.responsibilities || "",

          requirements:
            foundJob.requirements || "",
        });

        setSkills(loadedSkills);

        // =================================================
        // COMPANY LOGO
        // =================================================

        const companyLogo =
          foundJob.company_logo ||
          foundJob.logo ||
          foundJob.companyLogo ||
          "";

        if (companyLogo) {
          setLogoPreview(
            getLogoUrl(companyLogo)
          );
        }
      } catch (error) {
        console.error(
          "Fetch Job Error:",
          error
        );

        setError(
          error.message ||
            "Failed to load job."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, navigate]);

  // =======================================================
  // INPUT CHANGE
  // =======================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  // =======================================================
  // LOGO CHANGE
  // =======================================================

  const handleLogoChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image file."
      );

      event.target.value = "";

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(
        "Company logo must be less than 2 MB."
      );

      event.target.value = "";

      return;
    }

    if (
      logoPreview?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setLogoFile(file);
    setLogoPreview(previewUrl);
    setRemoveExistingLogo(false);
  };

  // =======================================================
  // REMOVE LOGO
  // =======================================================

  const removeLogo = () => {
    if (
      logoPreview?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    setLogoFile(null);
    setLogoPreview("");
    setRemoveExistingLogo(true);
  };

  // =======================================================
  // ADD SKILL
  // =======================================================

  const addSkill = () => {
    const skill =
      skillInput.trim();

    if (!skill) return;

    const exists = skills.some(
      (item) =>
        item.toLowerCase() ===
        skill.toLowerCase()
    );

    if (exists) {
      alert(
        "This skill is already added."
      );

      return;
    }

    setSkills((previous) => [
      ...previous,
      skill,
    ]);

    setSkillInput("");
  };

  // =======================================================
  // REMOVE SKILL
  // =======================================================

  const removeSkill = (
    skillToRemove
  ) => {
    setSkills((previous) =>
      previous.filter(
        (skill) =>
          skill !== skillToRemove
      )
    );
  };

  // =======================================================
  // SKILL ENTER
  // =======================================================

  const handleSkillKeyDown = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      addSkill();
    }
  };

  // =======================================================
  // UPDATE JOB
  // =======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const user = getUser();

      // =================================================
      // USER CHECK
      // =================================================

      if (!user || !user.id) {
        alert(
          "Please login as recruiter."
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const role = String(
        user.role || ""
      )
        .toLowerCase()
        .trim();

      if (role !== "recruiter") {
        alert(
          "Only recruiter can update jobs."
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // =================================================
      // VALIDATION
      // =================================================

      if (!formData.jobTitle.trim()) {
        setError(
          "Job title is required."
        );

        return;
      }

      if (!formData.companyName.trim()) {
        setError(
          "Company name is required."
        );

        return;
      }

      if (!formData.category) {
        setError(
          "Please select job category."
        );

        return;
      }

      if (!formData.jobType) {
        setError(
          "Please select job type."
        );

        return;
      }

      if (!formData.location.trim()) {
        setError(
          "Job location is required."
        );

        return;
      }

      const vacancies = Number(
        formData.vacancies
      );

      if (
        !Number.isInteger(vacancies) ||
        vacancies < 1
      ) {
        setError(
          "Number of openings must be at least 1."
        );

        return;
      }

      if (!formData.description.trim()) {
        setError(
          "Job description is required."
        );

        return;
      }

      if (
        formData.salaryMin &&
        formData.salaryMax &&
        Number(formData.salaryMin) >
          Number(formData.salaryMax)
      ) {
        setError(
          "Minimum salary cannot be greater than maximum salary."
        );

        return;
      }

      if (skills.length === 0) {
        setError(
          "Please add at least one required skill."
        );

        return;
      }

      // =================================================
      // SALARY
      // =================================================

      let salary = "";

      if (
        formData.salaryMin ||
        formData.salaryMax
      ) {
        const min =
          formData.salaryMin || "0";

        const max =
          formData.salaryMax || "0";

        salary = `₹${min} - ₹${max} ${formData.salaryType}`;
      }

      // =================================================
      // FORM DATA
      // =================================================

      const updateData =
        new FormData();

      updateData.append(
        "job_id",
        String(Number(id))
      );

      updateData.append(
        "recruiter_id",
        String(Number(user.id))
      );

      updateData.append(
        "job_title",
        formData.jobTitle.trim()
      );

      updateData.append(
        "company_name",
        formData.companyName.trim()
      );

      updateData.append(
        "workplace_type",
        formData.workplaceType || ""
      );

      updateData.append(
        "location",
        formData.location.trim()
      );

      updateData.append(
        "vacancies",
        String(vacancies)
      );

      updateData.append(
        "job_type",
        formData.jobType
      );

      updateData.append(
        "category",
        formData.category
      );

      updateData.append(
        "experience",
        formData.experience || ""
      );

      updateData.append(
        "education",
        formData.education.trim()
      );

      updateData.append(
        "salary_min",
        formData.salaryMin || ""
      );

      updateData.append(
        "salary_max",
        formData.salaryMax || ""
      );

      updateData.append(
        "salary_type",
        formData.salaryType || "Per Year"
      );

      // Complete salary string
      updateData.append(
        "salary",
        salary
      );

      updateData.append(
        "deadline",
        formData.deadline || ""
      );

      updateData.append(
        "description",
        formData.description.trim()
      );

      updateData.append(
        "responsibilities",
        formData.responsibilities.trim()
      );

      updateData.append(
        "requirements",
        formData.requirements.trim()
      );

      updateData.append(
        "skills",
        skills.join(", ")
      );

      // =================================================
      // LOGO
      // =================================================

      if (logoFile) {
        updateData.append(
          "company_logo",
          logoFile
        );
      }

      updateData.append(
        "remove_company_logo",
        removeExistingLogo
          ? "1"
          : "0"
      );

      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "========== UPDATE JOB DATA =========="
      );

      for (const [
        key,
        value,
      ] of updateData.entries()) {
        if (value instanceof File) {
          console.log(
            key,
            value.name,
            value.type,
            value.size
          );
        } else {
          console.log(
            key,
            value
          );
        }
      }

      console.log(
        "====================================="
      );

      // =================================================
      // API
      // =================================================

      const response =
        await axios.post(
          UPDATE_JOB_API,
          updateData,
          {
            timeout: 30000,
          }
        );

      console.log(
        "Update Job Response:",
        response.data
      );

      const data =
        response.data;

      if (
        data?.success === true
      ) {
        setSuccessMessage(
          data.message ||
            "Job updated successfully."
        );

        // Short delay so user can see success
        setTimeout(() => {
          navigate(
            "/recruiter/my-jobs"
          );
        }, 1000);

        return;
      }

      throw new Error(
        data?.message ||
          data?.error ||
          "Failed to update job."
      );
    } catch (error) {
      console.error(
        "Update Job Error:",
        error
      );

      console.error(
        "Backend Response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Something went wrong while updating the job."
      );
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // CLASSES
  // =======================================================

  const inputClass =
    "h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";

  const selectClass =
    "h-11 w-full min-w-0 appearance-none rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";

  const textareaClass =
    "w-full min-w-0 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";

  // =======================================================
  // SECTION HEADER
  // =======================================================

  const SectionHeader = ({
    icon,
    title,
    subtitle,
  }) => (
    <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  // =======================================================
  // SELECT ARROW
  // =======================================================

  const SelectArrow = () => (
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
    />
  );

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm font-semibold text-gray-700">
            Loading job details...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // ERROR PAGE
  // =======================================================

  if (
    error &&
    !formData.jobTitle
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FileText size={25} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Unable to load job
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/recruiter/my-jobs"
              )
            }
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to My Jobs
          </button>

        </div>
      </div>
    );
  }

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-50 text-gray-900">

      <div className="mx-auto w-full max-w-[1500px] min-w-0 p-4 sm:p-6 lg:p-8">

        {/* PAGE TOP */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Recruiter
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Edit Job Posting
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update all details of your job posting.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/recruiter/my-jobs"
              )
            }
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-blue-600"
          >
            <ArrowLeft size={17} />

            Back to My Jobs
          </button>

        </div>

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
        >

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="min-w-0 space-y-6">

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <BriefcaseBusiness size={19} />
                }
                title="Basic Information"
                subtitle="Update the core details about this position"
              />

              <div className="p-5 sm:p-6">

                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">

                  {/* JOB TITLE */}

                  <div className="min-w-0 md:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Job Title{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="jobTitle"
                      value={
                        formData.jobTitle
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Senior Frontend Developer"
                      className={inputClass}
                      required
                    />

                  </div>

                  {/* COMPANY LOGO */}

                  <div className="min-w-0 md:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Company Logo
                    </label>

                    <div className="flex flex-wrap items-center gap-4">

                      {logoPreview ? (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                          <img
                            src={logoPreview}
                            alt="Company Logo"
                            className="h-full w-full object-contain p-1"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                          <button
                            type="button"
                            onClick={
                              removeLogo
                            }
                            className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                          >
                            <X size={12} />
                          </button>

                        </div>
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                          <ImageIcon
                            size={26}
                          />
                        </div>
                      )}

                      <div>

                        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">

                          <Upload size={16} />

                          <span>
                            {logoPreview
                              ? "Change Logo"
                              : "Upload Logo"}
                          </span>

                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={
                              handleLogoChange
                            }
                            className="hidden"
                          />

                        </label>

                        <p className="mt-1.5 text-xs text-gray-400">
                          PNG, JPG or WEBP • Max 2 MB
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* COMPANY NAME */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Company Name
                    </label>

                    <input
                      type="text"
                      name="companyName"
                      value={
                        formData.companyName
                      }
                      readOnly
                      className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
                    />

                    <p className="mt-1.5 text-xs text-gray-400">
                      Company name comes from your company profile.
                    </p>

                  </div>

                  {/* CATEGORY */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Job Category{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <select
                        name="category"
                        value={
                          formData.category
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          selectClass
                        }
                        disabled={
                          optionsLoading
                        }
                        required
                      >

                        <option value="">
                          {optionsLoading
                            ? "Loading categories..."
                            : "Select category"}
                        </option>

                        {categories.map(
                          (item) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.name
                              }
                            >
                              {
                                item.name
                              }
                            </option>
                          )
                        )}

                      </select>

                      <SelectArrow />

                    </div>

                  </div>

                  {/* JOB TYPE */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Job Type{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <select
                        name="jobType"
                        value={
                          formData.jobType
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          selectClass
                        }
                        disabled={
                          optionsLoading
                        }
                        required
                      >

                        <option value="">
                          {optionsLoading
                            ? "Loading..."
                            : "Select job type"}
                        </option>

                        {jobTypes.map(
                          (item) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.name
                              }
                            >
                              {
                                item.name
                              }
                            </option>
                          )
                        )}

                        <option value="Other">
                          Other / Custom
                        </option>

                      </select>

                      <SelectArrow />

                    </div>

                  </div>

                  {/* WORKPLACE TYPE */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Workplace Type
                    </label>

                    <div className="relative">

                      <select
                        name="workplaceType"
                        value={
                          formData.workplaceType
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          selectClass
                        }
                        disabled={
                          optionsLoading
                        }
                      >

                        <option value="">
                          {optionsLoading
                            ? "Loading..."
                            : "Select workplace"}
                        </option>

                        {workplaceTypes.map(
                          (item) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.name
                              }
                            >
                              {
                                item.name
                              }
                            </option>
                          )
                        )}

                      </select>

                      <SelectArrow />

                    </div>

                  </div>

                  {/* LOCATION */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Job Location{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <MapPin
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        name="location"
                        value={
                          formData.location
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. Noida, Uttar Pradesh"
                        className={`${inputClass} pl-11`}
                        required
                      />

                    </div>

                  </div>

                  {/* VACANCIES */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Number of Openings
                    </label>

                    <div className="relative">

                      <Users
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="number"
                        name="vacancies"
                        min="1"
                        step="1"
                        value={
                          formData.vacancies
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. 4"
                        className={`${inputClass} pl-11`}
                      />

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                EXPERIENCE & SALARY
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <DollarSign size={19} />
                }
                title="Experience & Compensation"
                subtitle="Update eligibility and salary details"
              />

              <div className="p-5 sm:p-6">

                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">

                  {/* EXPERIENCE */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Experience Required
                    </label>

                    <div className="relative">

                      <Clock3
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <select
                        name="experience"
                        value={
                          formData.experience
                        }
                        onChange={
                          handleChange
                        }
                        className={`${selectClass} pl-11`}
                      >

                        <option value="">
                          Select experience
                        </option>

                        <option value="Fresher">
                          Fresher
                        </option>

                        <option value="0-1 Years">
                          0 - 1 Years
                        </option>

                        <option value="1-2 Years">
                          1 - 2 Years
                        </option>

                        <option value="2-4 Years">
                          2 - 4 Years
                        </option>

                        <option value="4-6 Years">
                          4 - 6 Years
                        </option>

                        <option value="6+ Years">
                          6+ Years
                        </option>

                      </select>

                      <SelectArrow />

                    </div>

                  </div>

                  {/* EDUCATION */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Education
                    </label>

                    <div className="relative">

                      <GraduationCap
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        name="education"
                        value={
                          formData.education
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. B.Tech / BCA / MCA"
                        className={`${inputClass} pl-11`}
                      />

                    </div>

                  </div>

                  {/* MIN SALARY */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Minimum Salary
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="salaryMin"
                        min="0"
                        value={
                          formData.salaryMin
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="300000"
                        className={`${inputClass} pl-9`}
                      />

                    </div>

                  </div>

                  {/* MAX SALARY */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Maximum Salary
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="salaryMax"
                        min="0"
                        value={
                          formData.salaryMax
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="600000"
                        className={`${inputClass} pl-9`}
                      />

                    </div>

                  </div>

                  {/* SALARY PERIOD */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Salary Period
                    </label>

                    <div className="relative">

                      <select
                        name="salaryType"
                        value={
                          formData.salaryType
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          selectClass
                        }
                      >

                        <option value="Per Year">
                          Per Year
                        </option>

                        <option value="Per Month">
                          Per Month
                        </option>

                        <option value="Per Day">
                          Per Day
                        </option>

                      </select>

                      <SelectArrow />

                    </div>

                  </div>

                  {/* DEADLINE */}

                  <div className="min-w-0">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Application Deadline
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="date"
                        name="deadline"
                        value={
                          formData.deadline
                        }
                        onChange={
                          handleChange
                        }
                        className={`${inputClass} pl-11`}
                      />

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SKILLS
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <Code2 size={19} />
                }
                title="Required Skills"
                subtitle="Add or remove skills required for this job"
              />

              <div className="p-5 sm:p-6">

                <div className="flex min-w-0 gap-2">

                  <input
                    type="text"
                    value={skillInput}
                    onChange={(event) =>
                      setSkillInput(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleSkillKeyDown
                    }
                    placeholder="Type a skill and press Enter"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <span className="text-lg">
                      +
                    </span>

                    <span className="hidden sm:inline">
                      Add
                    </span>
                  </button>

                </div>

                {skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">

                    {skills.map(
                      (
                        skill,
                        index
                      ) => (
                        <span
                          key={`${skill}-${index}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                        >

                          {skill}

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(
                                skill
                              )
                            }
                            className="text-blue-400 hover:text-red-600"
                          >
                            <X
                              size={14}
                            />
                          </button>

                        </span>
                      )
                    )}

                  </div>
                )}

              </div>

            </section>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <FileText size={19} />
                }
                title="Job Description & Requirements"
                subtitle="Update role information and candidate requirements"
              />

              <div className="space-y-5 p-5 sm:p-6">

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Job Description{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    rows="5"
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Write a brief overview of the role..."
                    className={
                      textareaClass
                    }
                    required
                  />

                </div>

                {/* RESPONSIBILITIES */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Key Responsibilities
                  </label>

                  <textarea
                    rows="5"
                    name="responsibilities"
                    value={
                      formData.responsibilities
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="List responsibilities..."
                    className={
                      textareaClass
                    }
                  />

                </div>

                {/* REQUIREMENTS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Requirements & Qualifications
                  </label>

                  <textarea
                    rows="5"
                    name="requirements"
                    value={
                      formData.requirements
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="List qualifications and requirements..."
                    className={
                      textareaClass
                    }
                  />

                </div>

              </div>

            </section>

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <div className="min-w-0 space-y-6">

            {/* ACTIONS */}

            <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

              <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">

                <h3 className="text-base font-bold text-gray-900">
                  Update Job
                </h3>

                <p className="mt-0.5 text-xs text-gray-500">
                  Review your changes and save them.
                </p>

              </div>

              <div className="space-y-3 p-5">

                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      Save Changes
                    </>
                  )}

                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    navigate(
                      "/recruiter/my-jobs"
                    )
                  }
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <ArrowLeft size={16} />

                  Cancel
                </button>

              </div>

            </div>

            {/* JOB SUMMARY */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <h3 className="text-sm font-bold text-gray-900">
                Job Summary
              </h3>

              <div className="mt-4 space-y-3 text-sm">

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">
                    Openings
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formData.vacancies ||
                      1}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">
                    Job Type
                  </span>

                  <span className="text-right font-semibold text-gray-900">
                    {formData.jobType ||
                      "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">
                    Workplace
                  </span>

                  <span className="text-right font-semibold text-gray-900">
                    {formData.workplaceType ||
                      "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">
                    Category
                  </span>

                  <span className="text-right font-semibold text-gray-900">
                    {formData.category ||
                      "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">
                    Experience
                  </span>

                  <span className="text-right font-semibold text-gray-900">
                    {formData.experience ||
                      "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">
                    Skills
                  </span>

                  <span className="font-semibold text-gray-900">
                    {skills.length}
                  </span>
                </div>

              </div>

            </div>

            {/* TIP */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <h4 className="text-sm font-bold text-blue-800">
                Editing Tip
              </h4>

              <p className="mt-2 text-xs leading-5 text-blue-700">
                Keep your job title, salary,
                skills, responsibilities and
                requirements updated so
                candidates always see accurate
                information.
              </p>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditJob;