
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BriefcaseBusiness,
  MapPin,
  DollarSign,
  Clock3,
  CalendarDays,
  GraduationCap,
  Code2,
  FileText,
  Send,
  Plus,
  X,
  ChevronDown,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../Config/api";

const API_URL = `${API_BASE}/jobs/create.php`;
const JOB_TYPES_API = `${API_BASE}/options/job-types.php`;
const WORKPLACE_TYPES_API = `${API_BASE}/options/workplace-types.php`;
const COMPANY_PROFILE_API = `${API_BASE}/recruiter/company-profile.php`;
const CATEGORIES_API = `${API_BASE}/options/categories.php`;

const initialFormData = {
  jobTitle: "",
  companyName: "",
  jobType: "",
  workplaceType: "",
  location: "",
  vacancies: "1",
  position: "",
  experience: "",
  salaryMin: "",
  salaryMax: "",
  salaryType: "Per Year",
  category: "",
  education: "",
  deadline: "",
  description: "",
  responsibilities: "",
  requirements: "",
};

const COMPANY_STATUS_CONFIG = {
  pending: {
    title: "Company Approval Pending",
    message:
      "Your company is waiting for admin approval. You cannot post jobs until your company is approved.",
  },
  approved: {
    title: "Company Approved",
    message: "Your company has been approved. You can now post jobs.",
  },
  rejected: {
    title: "Company Rejected",
    message: "Your company application was rejected by admin.",
  },
  suspended: {
    title: "Company Suspended",
    message: "Your company is suspended. Please contact admin.",
  },
  blocked: {
    title: "Company Blocked",
    message: "Your company is blocked. Please contact admin.",
  },
};

const getStatusMessage = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  return (
    COMPANY_STATUS_CONFIG[normalized]?.message ||
    "Please complete your company profile and wait for admin approval."
  );
};

// Salary ko readable format mein display karta hai.
// Backend ko original numeric salary values hi bheji jayengi.
const formatMoney = (amount) => {
  const number = Number(amount);

  if (!Number.isFinite(number)) return "";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number);
};

const formatSalary = (minValue, maxValue, salaryType) => {
  const hasMin = minValue !== "" && minValue !== null;
  const hasMax = maxValue !== "" && maxValue !== null;

  if (!hasMin && !hasMax) return "Not specified";

  const min = hasMin ? Number(minValue) : null;
  const max = hasMax ? Number(maxValue) : null;

  if (
    (hasMin && (!Number.isFinite(min) || min < 0)) ||
    (hasMax && (!Number.isFinite(max) || max < 0))
  ) {
    return "Invalid salary";
  }

  const formatAmount = (value) => {
    if (value === null) return null;

    if (salaryType === "Per Year") {
      const lakhs = value / 100000;

      return `${Number.isInteger(lakhs) ? lakhs : Number(lakhs.toFixed(2))} LPA`;
    }

    return `₹${formatMoney(value)}`;
  };

  const minText = formatAmount(min);
  const maxText = formatAmount(max);

  if (minText && maxText) {
    return `${minText} – ${maxText}${
      salaryType === "Per Month"
        ? " / month"
        : salaryType === "Per Day"
          ? " / day"
          : ""
    }`;
  }

  const value = minText || maxText;

  return `${value}${
    salaryType === "Per Month"
      ? " / month"
      : salaryType === "Per Day"
        ? " / day"
        : ""
  }`;
};

const PostJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState([]);

  const [jobTypes, setJobTypes] = useState([]);
  const [workplaceTypes, setWorkplaceTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState("");
  const [companyStatus, setCompanyStatus] = useState("");
  const [companyMessage, setCompanyMessage] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [canPostJob, setCanPostJob] = useState(false);

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

  const selectClass =
    "h-11 w-full min-w-0 appearance-none rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

  const textareaClass =
    "w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

  const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  const SelectArrow = () => (
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
    />
  );

  // Load company profile only once.
  useEffect(() => {
    let cancelled = false;

    const fetchCompanyProfile = async () => {
      setCompanyLoading(true);
      setCompanyError("");

      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          if (!cancelled) {
            setCompanyError("Please login again.");
            setCompanyStatus("");
            setCanPostJob(false);
          }
          return;
        }

        const user = JSON.parse(storedUser);
        const recruiterId = Number(user?.id);

        if (!recruiterId) {
          if (!cancelled) {
            setCompanyError("Recruiter ID not found. Please login again.");
          }
          return;
        }

        const response = await axios.get(
          `${COMPANY_PROFILE_API}?recruiterId=${recruiterId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          }
        );

        const result = response.data;

        if (!result?.success || !result?.data) {
          if (!cancelled) {
            setCompanyError(result?.message || "Company profile not found.");
          }
          return;
        }

        const companyData = result.data;
        const companyName = companyData.company_name || "";
        const status = String(
          companyData.status ||
            companyData.company_status ||
            user.company_status ||
            ""
        )
          .trim()
          .toLowerCase();

        const latestCompanyId =
          companyData.company_id ||
          companyData.id ||
          user.company_id ||
          null;

        const updatedUser = {
          ...user,
          company_id: latestCompanyId,
          company_name: companyName,
          company_status: status,
          company_message: getStatusMessage(status),
          can_post_job: status === "approved",
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (!cancelled) {
          setCompanyId(latestCompanyId);
          setCompanyStatus(status);
          setCompanyMessage(getStatusMessage(status));
          setCanPostJob(status === "approved");

          setFormData((previous) => ({
            ...previous,
            companyName,
          }));

          if (!companyName) {
            setCompanyError("Please complete your Company Profile.");
          }
        }
      } catch (error) {
        console.error(
          "Company Profile Error:",
          error.response?.data || error.message
        );

        if (!cancelled) {
          setCompanyError(
            error.response?.data?.message ||
              (error.response?.status === 401
                ? "Session expired. Please login again."
                : "Unable to load company profile. Please try again.")
          );

          // If the API fails, do not trust stale local approval
          // to authorize posting. The backend must also verify status.
          setCanPostJob(false);
        }
      } finally {
        if (!cancelled) setCompanyLoading(false);
      }
    };

    fetchCompanyProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load dropdown options.
  useEffect(() => {
    let cancelled = false;

    const fetchOptions = async () => {
      try {
        const [jobResponse, workplaceResponse, categoryResponse] =
          await Promise.all([
            axios.get(JOB_TYPES_API),
            axios.get(WORKPLACE_TYPES_API),
            axios.get(CATEGORIES_API),
          ]);

        if (cancelled) return;

        if (jobResponse.data?.success) {
          setJobTypes(jobResponse.data.jobTypes || []);
        }

        if (workplaceResponse.data?.success) {
          setWorkplaceTypes(workplaceResponse.data.workplaceTypes || []);
        }

        if (categoryResponse.data?.success) {
          setCategories(categoryResponse.data.categories || []);
        }
      } catch (error) {
        console.error("Job Options Error:", error);
        if (!cancelled) {
          alert(error.response?.data?.message || "Unable to load job options.");
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    };

    fetchOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    if (skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      alert("This skill is already added.");
      return;
    }

    setSkills((previous) => [...previous, skill]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      companyName: formData.companyName,
    });
    setSkills([]);
    setSkillInput("");
  };

  const salaryPreview = formatSalary(
    formData.salaryMin,
    formData.salaryMax,
    formData.salaryType
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      alert("Your session has expired. Please login again.");

      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");

      navigate("/login", { replace: true });
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch {
      alert("Invalid session. Please login again.");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    if (!user?.id) {
      alert("Recruiter ID not found. Please login again.");
      return;
    }

    if (String(user.role || "").toLowerCase() !== "recruiter") {
      alert("Only recruiters can post jobs.");
      return;
    }

    if (companyLoading) {
      alert("Please wait while your company profile is loading.");
      return;
    }

    if (!canPostJob || companyStatus !== "approved") {
      alert(companyMessage || getStatusMessage(companyStatus));
      return;
    }

    if (!formData.jobTitle.trim()) {
      alert("Please enter job title.");
      return;
    }

    if (!formData.position.trim()) {
      alert("Please enter position/designation.");
      return;
    }

    if (!formData.companyName.trim()) {
      alert("Please complete your Company Profile first.");
      return;
    }

    if (!formData.category) {
      alert("Please select job category.");
      return;
    }

    if (!formData.jobType) {
      alert("Please select job type.");
      return;
    }

    if (!formData.location.trim()) {
      alert("Please enter job location.");
      return;
    }

    const vacancies = Number(formData.vacancies);

    if (!Number.isInteger(vacancies) || vacancies < 1) {
      alert("Number of openings must be at least 1.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter job description.");
      return;
    }

    const minEntered = formData.salaryMin !== "";
    const maxEntered = formData.salaryMax !== "";

    const minSalary = minEntered ? Number(formData.salaryMin) : null;
    const maxSalary = maxEntered ? Number(formData.salaryMax) : null;

    if (
      (minEntered && (!Number.isFinite(minSalary) || minSalary < 0)) ||
      (maxEntered && (!Number.isFinite(maxSalary) || maxSalary < 0))
    ) {
      alert("Please enter valid, non-negative salary amounts.");
      return;
    }

    if (
      minEntered &&
      maxEntered &&
      minSalary > maxSalary
    ) {
      alert("Minimum salary cannot be greater than maximum salary.");
      return;
    }

    if (!skills.length) {
      alert("Please add at least one required skill.");
      return;
    }

    const postData = new FormData();

    // The PHP API must verify recruiter identity from the JWT.
    postData.append("recruiter_id", String(Number(user.id)));
    postData.append("job_title", formData.jobTitle.trim());
    postData.append("position", formData.position.trim());
    postData.append("company_name", formData.companyName.trim());
    postData.append("location", formData.location.trim());
    postData.append("vacancies", String(vacancies));
    postData.append("job_type", formData.jobType);
    postData.append("workplace_type", formData.workplaceType || "");
    postData.append("category", formData.category);
    postData.append("experience", formData.experience || "Fresher");
    postData.append("education", formData.education.trim());
    postData.append("salary_min", formData.salaryMin);
    postData.append("salary_max", formData.salaryMax);
    postData.append("salary_type", formData.salaryType);
    postData.append("description", formData.description.trim());
    postData.append("responsibilities", formData.responsibilities.trim());
    postData.append("requirements", formData.requirements.trim());
    postData.append("skills", skills.join(", "));
    postData.append("deadline", formData.deadline || "");

    setLoading(true);

    try {
      const response = await axios.post(API_URL, postData, {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      if (data?.success === true) {
        alert(data.message || "Job posted successfully!");
        resetForm();
        navigate("/recruiter/my-jobs");
        return;
      }

      if (data?.company_status) {
        const status = String(data.company_status).toLowerCase();
        setCompanyStatus(status);
        setCompanyMessage(data.message || getStatusMessage(status));
        setCanPostJob(status === "approved");
      }

      alert(data?.message || data?.error || "Unable to post job.");
    } catch (error) {
      console.error(
        "Create Job Error:",
        error.response?.status,
        error.response?.data || error.message
      );

      const backendData = error.response?.data;
      const backendMessage = backendData?.message || backendData?.error;

      if (error.response?.status === 401) {
        alert(backendMessage || "Session expired. Please login again.");

        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");

        navigate("/login", { replace: true });
        return;
      }

      if (
        error.response?.status === 403 &&
        backendData?.company_status
      ) {
        const status = String(backendData.company_status).toLowerCase();

        setCompanyStatus(status);
        setCompanyMessage(backendMessage || getStatusMessage(status));
        setCanPostJob(status === "approved");
      }

      alert(
        backendMessage ||
          "Unable to post job. Please check the connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizedCompanyStatus = String(companyStatus || "")
    .trim()
    .toLowerCase();

  const isApproved =
    normalizedCompanyStatus === "approved" && canPostJob;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 text-gray-900">
      <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <form
          onSubmit={handleSubmit}
          className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<BriefcaseBusiness size={19} />}
                title="Basic Information"
                subtitle="Add the core details about this position"
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Job Title *
                  </label>
                  <input
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Position / Designation *
                  </label>
                  <input
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g. Junior MERN Stack Developer"
                    className={inputClass}
                    maxLength={150}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Company Name
                  </label>
                  <input
                    name="companyName"
                    value={formData.companyName}
                    readOnly
                    placeholder={
                      companyLoading
                        ? "Loading company name..."
                        : "Complete company profile first"
                    }
                    className={`${inputClass} cursor-not-allowed bg-gray-50`}
                  />
                  {companyError && (
                    <p className="mt-1 text-xs text-red-600">{companyError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Job Category *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={selectClass}
                      disabled={optionsLoading}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Job Type *
                  </label>
                  <div className="relative">
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className={selectClass}
                      disabled={optionsLoading}
                      required
                    >
                      <option value="">Select job type</option>
                      {jobTypes.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                      <option value="Other">Other / Custom</option>
                    </select>
                    <SelectArrow />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Workplace Type
                  </label>
                  <div className="relative">
                    <select
                      name="workplaceType"
                      value={formData.workplaceType}
                      onChange={handleChange}
                      className={selectClass}
                      disabled={optionsLoading}
                    >
                      <option value="">Select workplace</option>
                      {workplaceTypes.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Job Location *
                  </label>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Noida, Uttar Pradesh"
                      className={`${inputClass} pl-11`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                      value={formData.vacancies}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<DollarSign size={19} />}
                title="Experience & Compensation"
                subtitle="Set eligibility requirements and salary expectations"
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Experience Required
                  </label>
                  <div className="relative">
                    <Clock3
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`${selectClass} pl-11`}
                    >
                      <option value="">Select experience</option>
                      <option value="Fresher">Fresher</option>
                      <option value="0-1 Years">0 - 1 Years</option>
                      <option value="1-2 Years">1 - 2 Years</option>
                      <option value="2-4 Years">2 - 4 Years</option>
                      <option value="4-6 Years">4 - 6 Years</option>
                      <option value="6+ Years">6+ Years</option>
                    </select>
                    <SelectArrow />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Education
                  </label>
                  <div className="relative">
                    <GraduationCap
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech / BCA / MCA"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                      step="any"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      placeholder={
                        formData.salaryType === "Per Year" ? "300000" : "25000"
                      }
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                      step="any"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      placeholder={
                        formData.salaryType === "Per Year" ? "600000" : "50000"
                      }
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Salary Period
                  </label>
                  <div className="relative">
                    <select
                      name="salaryType"
                      value={formData.salaryType}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="Per Year">Per Year (LPA)</option>
                      <option value="Per Month">Per Month</option>
                      <option value="Per Day">Per Day</option>
                    </select>
                    <SelectArrow />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    {formData.salaryType === "Per Year"
                      ? "Enter annual amounts. Example: 300000 = 3 LPA."
                      : formData.salaryType === "Per Month"
                        ? "Enter the monthly salary amount in rupees."
                        : "Enter the daily salary amount in rupees."}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                      value={formData.deadline}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Salary Preview
                  </p>
                  <p className="mt-1 text-lg font-bold text-blue-900">
                    {salaryPreview}
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<Code2 size={19} />}
                title="Required Skills"
                subtitle="Add technical and soft skills required for this job"
              />
              <div className="p-5 sm:p-6">
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type a skill and press Enter"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>

                {skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          aria-label={`Remove ${skill}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<FileText size={19} />}
                title="Job Description & Requirements"
                subtitle="Explain the role, responsibilities, and qualifications"
              />
              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Job Description *
                  </label>
                  <textarea
                    rows="4"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write a brief overview of the role..."
                    className={textareaClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Key Responsibilities
                  </label>
                  <textarea
                    rows="4"
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    placeholder="List the main responsibilities..."
                    className={textareaClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Requirements & Qualifications
                  </label>
                  <textarea
                    rows="4"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="List qualifications and requirements..."
                    className={textareaClass}
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-6">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                <h3 className="text-base font-bold">Actions</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Review and publish your job
                </p>
              </div>

              <div className="space-y-4 p-5">
                {!companyLoading && (
                  <div
                    className={`rounded-xl border p-3 ${
                      isApproved
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isApproved ? (
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />
                      ) : (
                        <AlertTriangle
                          size={17}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold">
                          {isApproved
                            ? "Ready to publish"
                            : "Publishing unavailable"}
                        </p>
                        <p className="mt-1 text-xs leading-5">
                          {isApproved
                            ? "Your company is approved by admin."
                            : companyMessage || getStatusMessage(companyStatus)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || companyLoading || !isApproved}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} />
                  {loading
                    ? "Posting Job..."
                    : !isApproved
                      ? "Approval Required"
                      : "Publish Job"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Reset Form
                </button>

                {!isApproved && (
                  <button
                    type="button"
                    onClick={() => navigate("/recruiter/company-profile")}
                    className="h-11 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    View Company Profile
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold">Job Summary</h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Openings</span>
                  <span className="font-semibold">
                    {formData.vacancies || "1"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Job Type</span>
                  <span className="text-right font-semibold">
                    {formData.jobType || "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Workplace</span>
                  <span className="text-right font-semibold">
                    {formData.workplaceType || "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Salary</span>
                  <span className="max-w-[65%] text-right font-semibold text-blue-700">
                    {salaryPreview}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Skills</span>
                  <span className="font-semibold">{skills.length}</span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                  <span className="text-gray-500">Company Status</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      normalizedCompanyStatus === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : normalizedCompanyStatus === "rejected" ||
                            normalizedCompanyStatus === "blocked"
                          ? "bg-red-100 text-red-700"
                          : normalizedCompanyStatus === "suspended"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {normalizedCompanyStatus || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
