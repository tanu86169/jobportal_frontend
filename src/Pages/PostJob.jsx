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
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ban,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import API_BASE from "../Config/api";

const API_URL = `${API_BASE}/jobs/create.php`;

const JOB_TYPES_API = `${API_BASE}/options/job-types.php`;

const WORKPLACE_TYPES_API = `${API_BASE}/options/workplace-types.php`;

const COMPANY_PROFILE_API = `${API_BASE}/recruiter/company-profile.php`;

const CATEGORIES_API = `${API_BASE}/options/categories.php`;

/* =========================================================
   Initial Form
========================================================= */

const initialFormData = {
  jobTitle: "",
  companyName: "",
  jobType: "",
  workplaceType: "",
  location: "",
  vacancies: "1",
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

/* =========================================================
   Logo URL Helper
========================================================= */

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

/* =========================================================
   Company Status Configuration
========================================================= */

const COMPANY_STATUS_CONFIG = {
  pending: {
    title: "Company Approval Pending",
    message:
      "Your company is waiting for admin approval. You cannot post jobs until your company is approved.",
    shortMessage: "Waiting for admin approval.",
    icon: Clock3,
    wrapper:
      "border-amber-200 bg-amber-50",
    iconWrapper:
      "bg-amber-100 text-amber-700",
    titleClass:
      "text-amber-900",
    textClass:
      "text-amber-800",
  },

  approved: {
    title: "Company Approved",
    message:
      "Your company has been approved by admin. You can now post jobs.",
    shortMessage: "You can post jobs.",
    icon: CheckCircle2,
    wrapper:
      "border-emerald-200 bg-emerald-50",
    iconWrapper:
      "bg-emerald-100 text-emerald-700",
    titleClass:
      "text-emerald-900",
    textClass:
      "text-emerald-800",
  },

  rejected: {
    title: "Company Rejected",
    message:
      "Your company application has been rejected by admin. You cannot post jobs.",
    shortMessage: "Company approval was rejected.",
    icon: XCircle,
    wrapper:
      "border-red-200 bg-red-50",
    iconWrapper:
      "bg-red-100 text-red-700",
    titleClass:
      "text-red-900",
    textClass:
      "text-red-800",
  },

  suspended: {
    title: "Company Suspended",
    message:
      "Your company is temporarily suspended by admin. You cannot post jobs until the suspension is removed.",
    shortMessage: "Company is temporarily suspended.",
    icon: ShieldAlert,
    wrapper:
      "border-orange-200 bg-orange-50",
    iconWrapper:
      "bg-orange-100 text-orange-700",
    titleClass:
      "text-orange-900",
    textClass:
      "text-orange-800",
  },

  blocked: {
    title: "Company Blocked",
    message:
      "Your company has been blocked by admin. You cannot post jobs.",
    shortMessage: "Company is blocked.",
    icon: Ban,
    wrapper:
      "border-red-200 bg-red-50",
    iconWrapper:
      "bg-red-100 text-red-700",
    titleClass:
      "text-red-900",
    textClass:
      "text-red-800",
  },
};

/* =========================================================
   Component
========================================================= */

const PostJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [jobTypes, setJobTypes] = useState([]);
  const [workplaceTypes, setWorkplaceTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState("");

  const [companyStatus, setCompanyStatus] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [companyMessage, setCompanyMessage] = useState("");
  const [canPostJob, setCanPostJob] = useState(false);

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     Recruiter Session + Company Status From LocalStorage
  ========================================================= */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    const token = localStorage.getItem("token");

if (!token) {
  alert("Your session has expired. Please login again.");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  navigate("/login", { replace: true });
  return;
}

   

    try {
      const user = JSON.parse(storedUser);

      if (!user?.id) {
        alert("Recruiter ID not found.");
        navigate("/login", { replace: true });
        return;
      }

      if (user?.role?.toLowerCase() !== "recruiter") {
        alert("Only recruiters can post jobs.");
        navigate("/", { replace: true });
        return;
      }

      /*
        Login API se company status aata hai.
      */

      const status = String(
        user?.company_status || ""
      )
        .trim()
        .toLowerCase();

      const allowed =
        user?.can_post_job === true ||
        user?.can_post_job === 1 ||
        user?.can_post_job === "1" ||
        status === "approved";

      setCompanyStatus(status);
      setCompanyId(user?.company_id || null);
      setCompanyMessage(
        user?.company_message || ""
      );
      setCanPostJob(allowed && status === "approved");
    } catch (error) {
      console.error("Session Error:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");

      alert("Your session is invalid. Please login again.");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* =========================================================
     Load Dropdown Options
  ========================================================= */

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [
          jobResponse,
          workplaceResponse,
          categoryResponse,
        ] = await Promise.all([
          axios.get(JOB_TYPES_API),
          axios.get(WORKPLACE_TYPES_API),
          axios.get(CATEGORIES_API),
        ]);

        if (jobResponse.data?.success) {
          setJobTypes(
            jobResponse.data.jobTypes || []
          );
        }

        if (workplaceResponse.data?.success) {
          setWorkplaceTypes(
            workplaceResponse.data.workplaceTypes || []
          );
        }

        if (categoryResponse.data?.success) {
          setCategories(
            categoryResponse.data.categories || []
          );
        }
      } catch (error) {
        console.error("Options Error:", error);

        alert(
          error.response?.data?.message ||
            "Unable to load job options."
        );
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  /* =========================================================
     Load Company Profile + Latest Status
  ========================================================= */

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setCompanyLoading(false);
        return;
      }

      try {
        const user = JSON.parse(storedUser);

        if (!user?.id) {
          setCompanyError("Recruiter ID not found.");
          setCompanyLoading(false);
          return;
        }

        const recruiterId = Number(user.id);

        const response = await axios.get(
          `${COMPANY_PROFILE_API}?recruiterId=${recruiterId}`
        );

        console.log(
          "Company Profile Response:",
          response.data
        );

        const result = response.data;

        if (result?.success && result?.data) {
          const companyData = result.data;

          const companyName =
            companyData.company_name || "";

          const companyLogo =
            companyData.company_logo ||
            companyData.logo ||
            "";

          /*
            Backend company profile ke different possible
            status field names ko support kar rahe hain.
          */

          const latestStatus = String(
            companyData.status ||
              companyData.company_status ||
              user?.company_status ||
              ""
          )
            .trim()
            .toLowerCase();

          const latestCompanyId =
            companyData.id ||
            companyData.company_id ||
            user?.company_id ||
            null;

          let latestCanPost =
            latestStatus === "approved";

          /*
            Local user object ko latest company status ke saath
            update kar do.
          */

          const updatedUser = {
            ...user,
            company_id: latestCompanyId,
            company_name: companyName,
            company_status: latestStatus,
            company_message:
              getStatusMessage(latestStatus),
            can_post_job: latestCanPost,
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );

          setCompanyId(latestCompanyId);
          setCompanyStatus(latestStatus);
          setCanPostJob(latestCanPost);

          setCompanyMessage(
            getStatusMessage(latestStatus)
          );

          setFormData((previous) => ({
            ...previous,
            companyName,
          }));

          if (companyLogo) {
            setLogoPreview(
              getLogoUrl(companyLogo)
            );
          }

          if (!companyName) {
            setCompanyError(
              "Please complete your Company Profile."
            );
          }
        } else {
          /*
            Agar profile API status return nahi karta,
            localStorage status preserve karenge.
          */

          setCompanyError(
            result?.message ||
              "Company profile not found."
          );
        }
      } catch (error) {
        console.error(
          "Company Profile Error:",
          error
        );

        /*
          Agar company profile API fail ho jaye,
          login ke time mila status use hoga.
        */

        const storedUserAgain =
          localStorage.getItem("user");

        try {
          if (storedUserAgain) {
            const userAgain =
              JSON.parse(storedUserAgain);

            const status = String(
              userAgain?.company_status || ""
            )
              .trim()
              .toLowerCase();

            setCompanyStatus(status);
            setCompanyMessage(
              userAgain?.company_message ||
                getStatusMessage(status)
            );
            setCanPostJob(
              status === "approved"
            );
          }
        } catch (parseError) {
          console.error(
            "Fallback User Parse Error:",
            parseError
          );
        }

        setCompanyError(
          error.response?.data?.message ||
            "Unable to load company profile."
        );
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  /* =========================================================
     Status Message Helper
  ========================================================= */

  const getStatusMessage = (status) => {
    const normalizedStatus = String(
      status || ""
    )
      .trim()
      .toLowerCase();

    if (
      COMPANY_STATUS_CONFIG[
        normalizedStatus
      ]
    ) {
      return COMPANY_STATUS_CONFIG[
        normalizedStatus
      ].message;
    }

    if (!normalizedStatus) {
      return "Please add your company and wait for admin approval before posting jobs.";
    }

    return "Your company is not approved. You cannot post jobs.";
  };

  /* =========================================================
     Input Change
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     Logo Upload
  ========================================================= */

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Company logo must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setLogoFile(file);
    setLogoPreview(previewUrl);
  };

  /* =========================================================
     Remove Logo
  ========================================================= */

  const removeLogo = () => {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview("");
  };

  /* =========================================================
     Skills
  ========================================================= */

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const exists = skills.some(
      (item) =>
        item.toLowerCase() ===
        skill.toLowerCase()
    );

    if (exists) {
      alert("This skill is already added.");
      return;
    }

    setSkills((previous) => [
      ...previous,
      skill,
    ]);

    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((previous) =>
      previous.filter(
        (skill) =>
          skill !== skillToRemove
      )
    );
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  /* =========================================================
     Reset
  ========================================================= */

  const resetForm = () => {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setFormData({
      ...initialFormData,
      companyName:
        formData.companyName,
    });

    setSkills([]);
    setSkillInput("");
    setLogoFile(null);
    setLogoPreview("");
  };

  /* =========================================================
     Salary
  ========================================================= */

  const getSalary = () => {
    if (
      !formData.salaryMin &&
      !formData.salaryMax
    ) {
      return "";
    }

    const min =
      formData.salaryMin || "0";

    const max =
      formData.salaryMax || "0";

    return `₹${min} - ₹${max} ${formData.salaryType}`;
  };

  /* =========================================================
     Refresh Local Company Status
  ========================================================= */

  const refreshLocalCompanyStatus = (
    status,
    message,
    companyData = {}
  ) => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);

      const normalizedStatus = String(
        status || ""
      )
        .trim()
        .toLowerCase();

      const updatedUser = {
        ...user,
        company_id:
          companyData.company_id ||
          companyData.id ||
          user.company_id ||
          null,
        company_name:
          companyData.company_name ||
          user.company_name ||
          formData.companyName ||
          "",
        company_status:
          normalizedStatus,
        company_message:
          message ||
          getStatusMessage(
            normalizedStatus
          ),
        can_post_job:
          normalizedStatus === "approved",
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setCompanyId(
        updatedUser.company_id
      );

      setCompanyStatus(
        normalizedStatus
      );

      setCompanyMessage(
        updatedUser.company_message
      );

      setCanPostJob(
        normalizedStatus === "approved"
      );

      if (
        updatedUser.company_name
      ) {
        setFormData((previous) => ({
          ...previous,
          companyName:
            updatedUser.company_name,
        }));
      }
    } catch (error) {
      console.error(
        "Status Refresh Error:",
        error
      );
    }
  };

  /* =========================================================
     Submit Job
  ========================================================= */

  
const handleSubmit = async (event) => {
  event.preventDefault();

  if (loading) return;

  /* -------------------------------------------------------
     SESSION + JWT TOKEN
  ------------------------------------------------------- */

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
  } catch (error) {
    console.error("User Parse Error:", error);

    alert("Invalid session. Please login again.");

    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");

    navigate("/login", { replace: true });
    return;
  }

  /* -------------------------------------------------------
     USER VALIDATION
  ------------------------------------------------------- */

  if (!user?.id) {
    alert("Recruiter ID not found. Please login again.");
    return;
  }

  if (String(user?.role || "").toLowerCase() !== "recruiter") {
    alert("Only recruiters can post jobs.");
    return;
  }

  /* -------------------------------------------------------
     COMPANY APPROVAL CHECK
  ------------------------------------------------------- */

  const currentCompanyStatus = String(
    user?.company_status || companyStatus || ""
  )
    .trim()
    .toLowerCase();

  if (currentCompanyStatus !== "approved") {
    const message =
      user?.company_message ||
      companyMessage ||
      getStatusMessage(currentCompanyStatus);

    alert(message);
    return;
  }

  if (!canPostJob) {
    alert("Your company is not approved. You cannot post jobs.");
    return;
  }

  /* -------------------------------------------------------
     FORM VALIDATION
  ------------------------------------------------------- */

  if (!formData.jobTitle.trim()) {
    alert("Please enter job title.");
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

  if (
    formData.salaryMin &&
    formData.salaryMax &&
    Number(formData.salaryMin) > Number(formData.salaryMax)
  ) {
    alert("Minimum salary cannot be greater than maximum salary.");
    return;
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    alert("Please add at least one required skill.");
    return;
  }

  /* -------------------------------------------------------
     PREPARE FORMDATA
  ------------------------------------------------------- */

  const postData = new FormData();

  // Backend JWT se recruiter ID verify karega.
  // Ye field backward compatibility ke liye bheji ja rahi hai.
  postData.append("recruiter_id", String(Number(user.id)));

  postData.append("job_title", formData.jobTitle.trim());
  postData.append("company_name", formData.companyName.trim());
  postData.append("location", formData.location.trim());
  postData.append("vacancies", String(vacancies));
  postData.append("job_type", formData.jobType);
  postData.append("workplace_type", formData.workplaceType || "");
  postData.append("category", formData.category);
  postData.append("experience", formData.experience || "Fresher");
  postData.append("education", formData.education.trim());
  postData.append("salary", getSalary());
  postData.append("description", formData.description.trim());
  postData.append(
    "responsibilities",
    formData.responsibilities.trim()
  );
  postData.append("requirements", formData.requirements.trim());
  postData.append("skills", skills.join(", "));
  postData.append("deadline", formData.deadline || "");

  if (logoFile) {
    postData.append("company_logo", logoFile);
  }

  /* -------------------------------------------------------
     DEBUG
  ------------------------------------------------------- */

  console.log("========== POST JOB DATA ==========");

  for (const [key, value] of postData.entries()) {
    if (value instanceof File) {
      console.log(key, value.name, value.type, value.size);
    } else {
      console.log(key, value);
    }
  }

  console.log("JWT token available:", Boolean(token));
  console.log("===================================");

  setLoading(true);

  /* -------------------------------------------------------
     API REQUEST
  ------------------------------------------------------- */

  try {
    const response = await axios.post(API_URL, postData, {
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;

    console.log("========== JOB POST RESPONSE ==========");
    console.log("HTTP Status:", response.status);
    console.log("Response Data:", data);
    console.log("=======================================");

    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */

    if (data?.success === true) {
      alert(data.message || "Job posted successfully!");

      resetForm();
      navigate("/recruiter/my-jobs");

      return;
    }

    /* -----------------------------------------------------
       BACKEND REPORTED FAILURE
    ----------------------------------------------------- */

    if (data?.company_status) {
      refreshLocalCompanyStatus(
        data.company_status,
        data.message,
        {
          company_id: data.company_id,
          company_name: data.company_name,
        }
      );
    }

    if (data?.code === "JOB_POSTING_DISABLED") {
      alert(
        data.message ||
          "Job posting is currently disabled by admin."
      );
      return;
    }

    if (
      data?.code === "COMPANY_NOT_APPROVED" ||
      data?.code === "NO_COMPANY" ||
      data?.code === "COMPANY_NOT_FOUND"
    ) {
      alert(
        data.message ||
          "Please complete your company profile and get admin approval."
      );
      return;
    }

    alert(
      data?.message ||
        data?.error ||
        "Unable to post job. Please try again."
    );
  } catch (error) {
    console.error("========== CREATE JOB ERROR ==========");
    console.error("Error:", error);
    console.error("Response:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("======================================");

    const backendData = error.response?.data;
    const backendMessage =
      backendData?.message || backendData?.error;

    /* -----------------------------------------------------
       TOKEN INVALID / EXPIRED
    ----------------------------------------------------- */

    if (
      error.response?.status === 401
    ) {
      alert(
        backendMessage ||
          "Your session has expired. Please login again."
      );

      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");

      navigate("/login", { replace: true });
      return;
    }

    /* -----------------------------------------------------
       ACCESS DENIED
    ----------------------------------------------------- */

    if (error.response?.status === 403) {
      if (
        backendData?.code === "COMPANY_NOT_APPROVED"
      ) {
        const rejectedStatus = String(
          backendData?.company_status || "pending"
        )
          .trim()
          .toLowerCase();

        refreshLocalCompanyStatus(
          rejectedStatus,
          backendMessage,
          {
            company_id: backendData?.company_id || null,
            company_name: backendData?.company_name || "",
          }
        );

        alert(
          backendMessage ||
            getStatusMessage(rejectedStatus)
        );

        return;
      }

      if (
        backendData?.code === "JOB_POSTING_DISABLED"
      ) {
        alert(
          backendMessage ||
            "Job posting is currently disabled by admin."
        );
        return;
      }

      if (
        backendData?.code === "NO_COMPANY" ||
        backendData?.code === "COMPANY_NOT_FOUND"
      ) {
        refreshLocalCompanyStatus(
          "pending",
          backendMessage ||
            "Please add your company and wait for admin approval before posting jobs."
        );

        alert(
          backendMessage ||
            "Please add your company and wait for admin approval before posting jobs."
        );

        return;
      }

      alert(
        backendMessage ||
          "Access denied. Please check your account permissions."
      );
      return;
    }

    /* -----------------------------------------------------
       OTHER ERRORS
    ----------------------------------------------------- */

    alert(
      backendMessage ||
        "Unable to post job. Please check your connection and try again."
    );
  } finally {
    setLoading(false);
  }
};
  /* =========================================================
     Company Status UI
  ========================================================= */

  const normalizedCompanyStatus =
    String(
      companyStatus || ""
    )
      .trim()
      .toLowerCase();

  const statusConfig =
    COMPANY_STATUS_CONFIG[
      normalizedCompanyStatus
    ];

  const StatusIcon =
    statusConfig?.icon ||
    AlertTriangle;

  const isApproved =
    normalizedCompanyStatus ===
    "approved" &&
    canPostJob;

  /* =========================================================
     Classes
  ========================================================= */

  const inputClass =
    "h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";

  const selectClass =
    "h-11 w-full min-w-0 appearance-none rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";

  const textareaClass =
    "w-full min-w-0 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:border-gray-300";

  /* =========================================================
     Section Header
  ========================================================= */

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

  /* =========================================================
     Select Arrow
  ========================================================= */

  const SelectArrow = () => (
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
    />
  );

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-50 text-gray-900">
      <div className="mx-auto w-full max-w-[1500px] min-w-0 p-4 sm:p-6 lg:p-8">

        {/* =================================================
            COMPANY APPROVAL STATUS
        ================================================= */}

       

        <form
          id="post-job-form"
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

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:shadow-md">

              <SectionHeader
                icon={
                  <BriefcaseBusiness size={19} />
                }
                title="Basic Information"
                subtitle="Add the core details about this position"
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
                      onChange={handleChange}
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
                            alt="Company Logo Preview"
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
                            title="Remove logo"
                          >
                            <X size={12} />
                          </button>

                        </div>

                      ) : (

                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                          <ImageIcon size={26} />
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
                      placeholder={
                        companyLoading
                          ? "Loading company name..."
                          : "Complete company profile first"
                      }
                      className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
                    />

                    {companyError && (
                      <p className="mt-1 text-xs text-red-500">
                        {companyError}
                      </p>
                    )}

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
                              key={item.id}
                              value={
                                item.name
                              }
                            >
                              {item.name}
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
                              key={item.id}
                              value={
                                item.name
                              }
                            >
                              {item.name}
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

                  {/* WORKPLACE */}

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
                              key={item.id}
                              value={
                                item.name
                              }
                            >
                              {item.name}
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

                    <p className="mt-1.5 text-xs text-gray-400">
                      Example: Enter 4 if you want to
                      hire 4 candidates.
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                EXPERIENCE & SALARY
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:shadow-md">

              <SectionHeader
                icon={
                  <DollarSign size={19} />
                }
                title="Experience & Compensation"
                subtitle="Define eligibility requirements and salary expectations"
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

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:shadow-md">

              <SectionHeader
                icon={
                  <Code2 size={19} />
                }
                title="Required Skills"
                subtitle="Add key technical or soft skills required for this job"
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
                    placeholder="Type a skill, e.g. React.js and press Enter"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >

                    <Plus size={16} />

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
                            className="text-blue-400 hover:text-blue-700"
                          >
                            <X size={14} />
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

            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:shadow-md">

              <SectionHeader
                icon={
                  <FileText size={19} />
                }
                title="Job Description & Requirements"
                subtitle="Provide detailed information about roles, responsibilities, and criteria"
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
                    rows="4"
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
                    rows="4"
                    name="responsibilities"
                    value={
                      formData.responsibilities
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="List responsibilities (bullet points or text)..."
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
                    rows="4"
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

            <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

              <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">

                <h3 className="text-base font-bold text-gray-900">
                  Actions
                </h3>

                <p className="mt-0.5 text-xs text-gray-500">
                  Review and publish your job
                </p>

              </div>

              <div className="space-y-4 p-5">

                {/* STATUS MESSAGE */}

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

                      <div className="min-w-0">

                        <p
                          className={`text-xs font-bold ${
                            isApproved
                              ? "text-emerald-900"
                              : "text-amber-900"
                          }`}
                        >
                          {isApproved
                            ? "Ready to publish"
                            : "Publishing unavailable"}
                        </p>

                        <p
                          className={`mt-1 text-xs leading-5 ${
                            isApproved
                              ? "text-emerald-800"
                              : "text-amber-800"
                          }`}
                        >
                          {isApproved
                            ? "Your company is approved by admin."
                            : companyMessage ||
                              getStatusMessage(
                                normalizedCompanyStatus
                              )}
                        </p>

                      </div>

                    </div>
                  </div>
                )}

                {/* PUBLISH BUTTON */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    companyLoading ||
                    !isApproved
                  }
                  title={
                    !isApproved
                      ? "Your company must be approved by admin before posting a job."
                      : "Publish Job"
                  }
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <Send size={16} />

                  <span>
                    {loading
                      ? "Posting Job..."
                      : !isApproved
                      ? "Approval Required"
                      : "Publish Job"}
                  </span>

                </button>

                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Reset Form
                </button>

                {!isApproved && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/recruiter/company-profile"
                      )
                    }
                    className="flex h-11 w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    View Company Profile
                  </button>
                )}

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
                    Skills
                  </span>

                  <span className="font-semibold text-gray-900">
                    {skills.length}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">

                  <span className="text-gray-500">
                    Company Status
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      normalizedCompanyStatus ===
                      "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : normalizedCompanyStatus ===
                          "rejected"
                        ? "bg-red-100 text-red-700"
                        : normalizedCompanyStatus ===
                          "blocked"
                        ? "bg-red-100 text-red-700"
                        : normalizedCompanyStatus ===
                          "suspended"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {normalizedCompanyStatus ||
                      "Pending"}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default PostJob;