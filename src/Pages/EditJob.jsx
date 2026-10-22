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
  X,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE from "../Config/api";

const GET_MY_JOBS_API = `${API_BASE}/jobs/get-my-jobs.php`;
const UPDATE_JOB_API = `${API_BASE}/jobs/update.php`;
const JOB_TYPES_API = `${API_BASE}/options/job-types.php`;
const WORKPLACE_TYPES_API = `${API_BASE}/options/workplace-types.php`;
const CATEGORIES_API = `${API_BASE}/options/categories.php`;

const initialFormData = {
  jobTitle: "",
  companyName: "",
  workplaceType: "",
  location: "",
  position: "",
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

const normalizeDate = (date) => {
  if (!date || String(date).startsWith("0000-00-00")) return "";
  const value = String(date).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
};

const normalizeSalaryType = (type) => {
  const value = String(type || "").toLowerCase().trim();
  if (value.includes("month")) return "Per Month";
  if (value.includes("day")) return "Per Day";
  return "Per Year";
};

// Supports legacy strings such as "₹300000 - ₹600000 Per Year",
// "₹3 LPA - ₹6 LPA", and "₹25000 - ₹50000 Per Month".
const parseSalary = (salary) => {
  if (salary === null || salary === undefined || salary === "") {
    return { min: "", max: "", type: "Per Year" };
  }

  const value = String(salary).trim();
  const type = normalizeSalaryType(value);
  const numbers = value.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
  const clean = (number) => {
    if (!number) return "";
    const parsed = Number(number.replace(/,/g, ""));
    if (!Number.isFinite(parsed)) return "";
    return String(
      Math.round(/\blpa\b/i.test(value) ? parsed * 100000 : parsed),
    );
  };

  return {
    min: clean(numbers[0]),
    max: clean(numbers[1]),
    type: /\blpa\b/i.test(value) ? "Per Year" : type,
  };
};

const formatLpa = (rupees) => {
  const value = Number(rupees) / 100000;
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
};

const formatSalary = (minValue, maxValue, salaryType) => {
  const min = minValue !== "" && minValue !== null ? Number(minValue) : null;
  const max = maxValue !== "" && maxValue !== null ? Number(maxValue) : null;

  if (
    (min === null || !Number.isFinite(min)) &&
    (max === null || !Number.isFinite(max))
  ) {
    return "Not specified";
  }

  const type = normalizeSalaryType(salaryType);
  const format = (value) => {
    if (value === null) return "";
    if (type === "Per Year") return `${formatLpa(value)} LPA`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const minText = format(min);
  const maxText = format(max);
  const range = minText && maxText ? `${minText} – ${maxText}` : minText || maxText;

  if (type === "Per Year") return range;
  return `${range}${type === "Per Month" ? " / month" : " / day"}`;
};

const getJobId = (job) => job?.id ?? job?.job_id ?? job?.jobId;

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [jobTypes, setJobTypes] = useState([]);
  const [workplaceTypes, setWorkplaceTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error("User Parse Error:", err);
      return null;
    }
  };

  const getAuthToken = () => {
    const direct =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");
    if (direct) return direct;

    const user = getUser();
    return user?.token || user?.accessToken || user?.authToken || "";
  };

  useEffect(() => {
    const user = getUser();
    if (!user?.id || String(user.role || "").toLowerCase().trim() !== "recruiter") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;

    const fetchOptions = async () => {
      try {
        setOptionsLoading(true);
        const [jobTypeResponse, workplaceResponse, categoryResponse] =
          await Promise.all([
            axios.get(JOB_TYPES_API),
            axios.get(WORKPLACE_TYPES_API),
            axios.get(CATEGORIES_API),
          ]);

        if (!active) return;
        if (jobTypeResponse.data?.success) {
          setJobTypes(jobTypeResponse.data.jobTypes || []);
        }
        if (workplaceResponse.data?.success) {
          setWorkplaceTypes(workplaceResponse.data.workplaceTypes || []);
        }
        if (categoryResponse.data?.success) {
          setCategories(categoryResponse.data.categories || []);
        }
      } catch (err) {
        console.error("Options Error:", err);
        if (active) {
          setError(err.response?.data?.message || "Unable to load job options.");
        }
      } finally {
        if (active) setOptionsLoading(false);
      }
    };

    fetchOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const user = getUser();
        if (!user?.id || String(user.role || "").toLowerCase().trim() !== "recruiter") {
          navigate("/login", { replace: true });
          return;
        }

        const response = await axios.get(
          `${GET_MY_JOBS_API}?recruiterId=${encodeURIComponent(Number(user.id))}`,
        );
        const data = response.data;

        if (!data?.success) {
          throw new Error(data?.message || "Failed to fetch jobs.");
        }

        const jobs = Array.isArray(data.jobs) ? data.jobs : [];
        const foundJob = jobs.find((job) => Number(getJobId(job)) === Number(id));

        if (!foundJob) {
          throw new Error("Job not found or you are not authorized to edit this job.");
        }

        const parsedSalary = parseSalary(foundJob.salary);
        const salaryType = normalizeSalaryType(
          foundJob.salary_type ?? foundJob.salaryType ?? parsedSalary.type,
        );

        const loadedSkills = Array.isArray(foundJob.skills)
          ? foundJob.skills
          : String(foundJob.skills || "")
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean);

        if (!active) return;

        setFormData({
          jobTitle: foundJob.job_title || foundJob.jobTitle || "",
          position: foundJob.position || "",
          companyName: foundJob.company_name || foundJob.companyName || "",
          workplaceType: foundJob.workplace_type || foundJob.workplaceType || "",
          location: foundJob.location || "",
          vacancies: String(foundJob.vacancies || foundJob.number_of_openings || 1),
          jobType: foundJob.job_type || foundJob.jobType || "",
          category: foundJob.category || "",
          experience: foundJob.experience || "",
          education: foundJob.education || "",
          salaryMin: String(foundJob.salary_min ?? foundJob.salaryMin ?? parsedSalary.min ?? ""),
          salaryMax: String(foundJob.salary_max ?? foundJob.salaryMax ?? parsedSalary.max ?? ""),
          salaryType,
          deadline: normalizeDate(foundJob.deadline),
          description: foundJob.description || "",
          responsibilities: foundJob.responsibilities || "",
          requirements: foundJob.requirements || "",
        });
        setSkills(loadedSkills);
      } catch (err) {
        console.error("Fetch Job Error:", err);
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load job.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) fetchJob();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccessMessage("");
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
    setError("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((previous) => previous.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const user = getUser();
      if (!user?.id) {
        navigate("/login", { replace: true });
        return;
      }
      if (String(user.role || "").toLowerCase().trim() !== "recruiter") {
        setError("Only recruiters can update jobs.");
        navigate("/login", { replace: true });
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setError("Authentication token missing. Please login again.");
        return;
      }

      if (!formData.jobTitle.trim()) return setError("Job title is required.");
      if (!formData.companyName.trim()) return setError("Company name is required.");
      if (!formData.category) return setError("Please select job category.");
      if (!formData.jobType) return setError("Please select job type.");
      if (!formData.location.trim()) return setError("Job location is required.");
      if (!formData.description.trim()) return setError("Job description is required.");

      const vacancies = Number(formData.vacancies);
      if (!Number.isInteger(vacancies) || vacancies < 1) {
        return setError("Number of openings must be at least 1.");
      }

      const minEntered = formData.salaryMin !== "";
      const maxEntered = formData.salaryMax !== "";
      const min = minEntered ? Number(formData.salaryMin) : null;
      const max = maxEntered ? Number(formData.salaryMax) : null;

      if ((minEntered && (!Number.isFinite(min) || min < 0)) ||
          (maxEntered && (!Number.isFinite(max) || max < 0))) {
        return setError("Salary must be a valid non-negative number.");
      }
      if (minEntered && maxEntered && min > max) {
        return setError("Minimum salary cannot be greater than maximum salary.");
      }
      if (skills.length === 0) {
        return setError("Please add at least one required skill.");
      }

      const salaryType = normalizeSalaryType(formData.salaryType);
      let salary = "";

      if (minEntered || maxEntered) {
        if (salaryType === "Per Year") {
          const minText = minEntered ? `₹${formatLpa(min)} LPA` : "";
          const maxText = maxEntered ? `₹${formatLpa(max)} LPA` : "";
          salary = minText && maxText ? `${minText} - ${maxText}` : minText || maxText;
        } else {
          const minText = minEntered ? `₹${min.toLocaleString("en-IN")}` : "";
          const maxText = maxEntered ? `₹${max.toLocaleString("en-IN")}` : "";
          const suffix = salaryType === "Per Month" ? "Per Month" : "Per Day";
          salary = minText && maxText
            ? `${minText} - ${maxText} ${suffix}`
            : `${minText || maxText} ${suffix}`;
        }
      }

      const updateData = new FormData();
      updateData.append("job_id", String(Number(id)));
      updateData.append("recruiter_id", String(Number(user.id)));
      updateData.append("job_title", formData.jobTitle.trim());
      updateData.append("position", formData.position.trim());
      updateData.append("company_name", formData.companyName.trim());
      updateData.append("workplace_type", formData.workplaceType || "");
      updateData.append("location", formData.location.trim());
      updateData.append("vacancies", String(vacancies));
      updateData.append("job_type", formData.jobType);
      updateData.append("category", formData.category);
      updateData.append("experience", formData.experience || "");
      updateData.append("education", formData.education.trim());
      updateData.append("salary_min", minEntered ? String(min) : "");
      updateData.append("salary_max", maxEntered ? String(max) : "");
      updateData.append("salary_type", salaryType);
      updateData.append("salary", salary);
      updateData.append("deadline", normalizeDate(formData.deadline));
      updateData.append("description", formData.description.trim());
      updateData.append("responsibilities", formData.responsibilities.trim());
      updateData.append("requirements", formData.requirements.trim());
      updateData.append("skills", skills.join(", "));

      const response = await axios.post(UPDATE_JOB_API, updateData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      if (response.data?.success === true) {
        setSuccessMessage(response.data.message || "Job updated successfully.");
        setTimeout(() => navigate("/recruiter/my-jobs"), 1000);
      } else {
        throw new Error(response.data?.message || response.data?.error || "Failed to update job.");
      }
    } catch (err) {
      console.error("Update Job Error:", err);
      console.error("Backend Response:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong while updating the job.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";
  const selectClass =
    "h-11 w-full min-w-0 appearance-none rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";
  const textareaClass =
    "w-full min-w-0 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";

  const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
          {icon}
        </div>
        <div className="min-w-0">
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

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 size={35} className="mx-auto animate-spin text-blue-600" />
          <p className="mt-4 text-sm font-semibold text-gray-700">Loading job details...</p>
          <p className="mt-1 text-xs text-gray-400">Please wait</p>
        </div>
      </div>
    );
  }

  if (error && !formData.jobTitle) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FileText size={25} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Unable to load job</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/recruiter/my-jobs")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to My Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-50 text-gray-900">
      <div className="mx-auto w-full max-w-[1500px] min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Recruiter</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Edit Job Posting</h1>
            <p className="mt-1 text-sm text-gray-500">Update all details of your job posting.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/recruiter/my-jobs")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-blue-600"
          >
            <ArrowLeft size={17} /> Back to My Jobs
          </button>
        </div>

        {successMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <SectionHeader
                icon={<BriefcaseBusiness size={19} />}
                title="Basic Information"
                subtitle="Update the core details about this position"
              />
              <div className="p-5 sm:p-6">
                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="min-w-0 md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Job Title <span className="text-red-500">*</span></label>
                    <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Senior Frontend Developer" className={inputClass} required />
                  </div>
                  <div className="min-w-0 md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Position</label>
                    <input name="position" value={formData.position} onChange={handleChange} placeholder="e.g. Junior MERN Stack Developer" className={inputClass} maxLength={150} />
                    <p className="mt-1.5 text-xs text-gray-400">Enter the specific role or designation for this job.</p>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Company Name</label>
                    <input name="companyName" value={formData.companyName} readOnly className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`} />
                    <p className="mt-1.5 text-xs text-gray-400">Company name comes from your company profile.</p>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Job Category <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select name="category" value={formData.category} onChange={handleChange} className={selectClass} disabled={optionsLoading} required>
                        <option value="">{optionsLoading ? "Loading categories..." : "Select category"}</option>
                        {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                      </select><SelectArrow />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Job Type <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select name="jobType" value={formData.jobType} onChange={handleChange} className={selectClass} disabled={optionsLoading} required>
                        <option value="">{optionsLoading ? "Loading..." : "Select job type"}</option>
                        {jobTypes.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                        <option value="Other">Other / Custom</option>
                      </select><SelectArrow />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Workplace Type</label>
                    <div className="relative">
                      <select name="workplaceType" value={formData.workplaceType} onChange={handleChange} className={selectClass} disabled={optionsLoading}>
                        <option value="">{optionsLoading ? "Loading..." : "Select workplace"}</option>
                        {workplaceTypes.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                      </select><SelectArrow />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Job Location <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Noida, Uttar Pradesh" className={`${inputClass} pl-11`} required />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Number of Openings</label>
                    <div className="relative">
                      <Users size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="number" name="vacancies" min="1" step="1" value={formData.vacancies} onChange={handleChange} placeholder="e.g. 4" className={`${inputClass} pl-11`} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <SectionHeader icon={<DollarSign size={19} />} title="Experience & Compensation" subtitle="Update eligibility and salary details" />
              <div className="p-5 sm:p-6">
                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Experience Required</label>
                    <div className="relative">
                      <Clock3 size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="experience" value={formData.experience} onChange={handleChange} className={`${selectClass} pl-11`}>
                        <option value="">Select experience</option>
                        <option value="Fresher">Fresher</option>
                        <option value="0-1 Years">0 - 1 Years</option>
                        <option value="1-2 Years">1 - 2 Years</option>
                        <option value="2-4 Years">2 - 4 Years</option>
                        <option value="4-6 Years">4 - 6 Years</option>
                        <option value="6+ Years">6+ Years</option>
                      </select><SelectArrow />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Education</label>
                    <div className="relative">
                      <GraduationCap size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="education" value={formData.education} onChange={handleChange} placeholder="e.g. B.Tech / BCA / MCA" className={`${inputClass} pl-11`} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Minimum Salary</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400">₹</span>
                      <input type="number" name="salaryMin" min="0" step="any" value={formData.salaryMin} onChange={handleChange} placeholder={formData.salaryType === "Per Year" ? "300000" : formData.salaryType === "Per Month" ? "25000" : "1000"} className={`${inputClass} pl-9`} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Maximum Salary</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400">₹</span>
                      <input type="number" name="salaryMax" min="0" step="any" value={formData.salaryMax} onChange={handleChange} placeholder={formData.salaryType === "Per Year" ? "600000" : formData.salaryType === "Per Month" ? "50000" : "2000"} className={`${inputClass} pl-9`} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Salary Period</label>
                    <div className="relative">
                      <select name="salaryType" value={formData.salaryType} onChange={handleChange} className={selectClass}>
                        <option value="Per Year">Per Year (LPA)</option>
                        <option value="Per Month">Per Month</option>
                        <option value="Per Day">Per Day</option>
                      </select><SelectArrow />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">
                      {formData.salaryType === "Per Year" ? "Enter annual salary in rupees. Example: 300000 = 3 LPA." : formData.salaryType === "Per Month" ? "Enter monthly salary in rupees." : "Enter daily salary in rupees."}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Application Deadline</label>
                    <div className="relative">
                      <CalendarDays size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className={`${inputClass} pl-11`} />
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-medium text-blue-800">Salary preview</p>
                  <p className="mt-1 text-sm font-bold text-blue-900">{formatSalary(formData.salaryMin, formData.salaryMax, formData.salaryType)}</p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <SectionHeader icon={<Code2 size={19} />} title="Required Skills" subtitle="Add or remove skills required for this job" />
              <div className="p-5 sm:p-6">
                <div className="flex min-w-0 gap-2">
                  <input type="text" value={skillInput} onChange={(event) => setSkillInput(event.target.value)} onKeyDown={handleSkillKeyDown} placeholder="Type a skill and press Enter" className={inputClass} />
                  <button type="button" onClick={addSkill} className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"><span className="text-lg">+</span><span className="hidden sm:inline">Add</span></button>
                </div>
                {skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span key={`${skill}-${index}`} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`} className="text-blue-400 hover:text-red-600"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <SectionHeader icon={<FileText size={19} />} title="Job Description & Requirements" subtitle="Update role information and candidate requirements" />
              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Job Description <span className="text-red-500">*</span></label>
                  <textarea rows="5" name="description" value={formData.description} onChange={handleChange} placeholder="Write a brief overview of the role..." className={textareaClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Key Responsibilities</label>
                  <textarea rows="5" name="responsibilities" value={formData.responsibilities} onChange={handleChange} placeholder="List responsibilities..." className={textareaClass} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Requirements & Qualifications</label>
                  <textarea rows="5" name="requirements" value={formData.requirements} onChange={handleChange} placeholder="List qualifications and requirements..." className={textareaClass} />
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-6">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                <h3 className="text-base font-bold text-gray-900">Update Job</h3>
                <p className="mt-0.5 text-xs text-gray-500">Review your changes and save them.</p>
              </div>
              <div className="space-y-3 p-5">
                <button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? <><Loader2 size={17} className="animate-spin" />Saving Changes...</> : <><Save size={17} />Save Changes</>}
                </button>
                <button type="button" disabled={saving} onClick={() => navigate("/recruiter/my-jobs")} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"><ArrowLeft size={16} />Cancel</button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900">Job Summary</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3"><span className="text-gray-500">Openings</span><span className="font-semibold text-gray-900">{formData.vacancies || 1}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-gray-500">Job Type</span><span className="text-right font-semibold text-gray-900">{formData.jobType || "Not selected"}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-gray-500">Workplace</span><span className="text-right font-semibold text-gray-900">{formData.workplaceType || "Not selected"}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-gray-500">Category</span><span className="text-right font-semibold text-gray-900">{formData.category || "Not selected"}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-gray-500">Experience</span><span className="text-right font-semibold text-gray-900">{formData.experience || "Not selected"}</span></div>
                <div className="flex items-start justify-between gap-3"><span className="text-gray-500">Salary</span><span className="max-w-[65%] text-right font-semibold text-gray-900">{formatSalary(formData.salaryMin, formData.salaryMax, formData.salaryType)}</span></div>
                <div className="flex items-center justify-between gap-3"><span className="text-gray-500">Skills</span><span className="font-semibold text-gray-900">{skills.length}</span></div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h4 className="text-sm font-bold text-blue-800">Editing Tip</h4>
              <p className="mt-2 text-xs leading-5 text-blue-700">Keep your job title, salary, skills, responsibilities and requirements updated so candidates always see accurate information.</p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default EditJob;

