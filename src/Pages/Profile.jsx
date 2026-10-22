import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  User,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  FolderKanban,
  FileText,
  Download,
  Eye,
  Upload,
  Pencil,
  ExternalLink,
  X,
  Save,
  Link2,
  Globe,
  Code2,
  Plus,
  Trash2,
  CheckCircle2,
  CalendarDays,
  Building2,
  Tags,
  Award,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Target,
} from "lucide-react";

/* =========================================================
   API
========================================================= */
import API_BASE from "../Config/api";

const CATEGORIES_API = `${API_BASE}/admin/categories.php`;

const PROFILE_API = `${API_BASE}/profile`;

const UPLOAD_RESUME_API = `${PROFILE_API}/upload-resume.php`;

const UPLOAD_PROFILE_IMAGE_API = `${PROFILE_API}/upload-profile-image.php`;

/* =========================================================
   CONSTANTS
========================================================= */

const EXPERIENCE_LEVELS = [
  "Fresher",
  "Less than 1 year",
  "1-2 years",
  "2-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const ALLOWED_RESUME_EXT = [
  "pdf",
  "doc",
  "docx",
];

const ALLOWED_IMAGE_EXT = [
  "jpg",
  "jpeg",
  "png",
  "webp",
];

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/* =========================================================
   SKELETON PRIMITIVE
========================================================= */

const Skeleton = ({ className = "", style }) => (
  <div
    style={style}
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

/* =========================================================
   PROFILE SKELETON
========================================================= */

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">

          {/* ===== PAGE TITLE SKELETON ===== */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 sm:h-9 sm:w-56" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>

          {/* ===== PROFILE HEADER SKELETON ===== */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-28 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 sm:h-32" />

            <div className="px-5 pb-6 sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                  <div className="-mt-14 shrink-0 sm:-mt-16">
                    <Skeleton className="h-28 w-28 rounded-full border-4 border-white sm:h-32 sm:w-32" />
                  </div>
                  <div className="space-y-2 text-center sm:pb-1 sm:text-left">
                    <Skeleton className="mx-auto h-6 w-48 sm:mx-0 sm:h-7 sm:w-56" />
                    <Skeleton className="mx-auto h-4 w-40 sm:mx-0 sm:w-48" />
                    <Skeleton className="mx-auto h-3 w-32 sm:mx-0 sm:w-40" />
                  </div>
                </div>
                <div className="flex justify-center gap-2 sm:pb-1">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
              </div>

              {/* CONTACT GRID */}
              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* COMPLETION */}
              <div className="mt-5 border-t border-slate-100 pt-5">
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="mt-2 h-3 w-full max-w-lg" />
              </div>
            </div>
          </div>

          {/* ===== MATCH READINESS SKELETON ===== */}
          <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-2xl" />
                  <Skeleton className="h-4 w-full max-w-xl" />
                </div>
              </div>
              <div className="shrink-0 space-y-2">
                <Skeleton className="ml-auto h-8 w-20" />
                <Skeleton className="ml-auto h-3 w-24" />
                <Skeleton className="h-2 w-48 rounded-full" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 rounded-xl"
                />
              ))}
            </div>
          </div>

          {/* ===== VISIBILITY STATUS SKELETON ===== */}
          <div className="mb-6">
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>

          {/* ===== DETAILS SKELETON ===== */}
          <div className="space-y-6">

            {/* ABOUT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* SKILLS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[80, 64, 96, 72, 56, 88, 76, 64].map((w, i) => (
                  <Skeleton
                    key={i}
                    className="h-9 rounded-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>

            {/* EXPERIENCE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-7">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative border-l-2 border-blue-100 pl-7"
                  >
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-[3px] border-blue-200 bg-white" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="mt-2 h-4 w-36" />
                    <Skeleton className="mt-2 h-5 w-32 rounded-md" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </div>

            {/* EDUCATION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROJECTS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="mt-4 h-5 w-40" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16 rounded-md" />
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-14 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RESUME */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-20 rounded-lg" />
                    <Skeleton className="h-10 w-28 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const normalizeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const normalizeUrl = (value) => {
  if (!value) {
    return "";
  }

  const url = String(value).trim();

  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `http://localhost${url}`;
  }

  return url;
};

const getFileName = (filePath) => {
  if (!filePath) {
    return "";
  }

  const cleanPath = String(filePath).split("?")[0];

  const parts = cleanPath.split("/");

  return parts[parts.length - 1] || "Resume";
};

const cleanSkillsArray = (skills) => {
  return safeArray(skills)
    .map((skill) => {
      if (typeof skill === "string") {
        return skill.trim();
      }

      return "";
    })
    .filter(Boolean);
};

const cleanEducationArray = (education) => {
  return safeArray(education)
    .map((item) => ({
      degree: normalizeString(item?.degree).trim(),
      university: normalizeString(item?.university).trim(),
      duration: normalizeString(item?.duration).trim(),
    }))
    .filter(
      (item) =>
        item.degree ||
        item.university ||
        item.duration,
    );
};

const cleanExperienceArray = (experience) => {
  return safeArray(experience)
    .map((item) => ({
      designation: normalizeString(item?.designation).trim(),
      company: normalizeString(item?.company).trim(),
      duration: normalizeString(item?.duration).trim(),
      description: normalizeString(item?.description).trim(),
    }))
    .filter(
      (item) =>
        item.designation ||
        item.company ||
        item.duration ||
        item.description,
    );
};

const cleanProjectsArray = (projects) => {
  return safeArray(projects)
    .map((item) => ({
      name: normalizeString(item?.name).trim(),
      description: normalizeString(item?.description).trim(),

      technologies: safeArray(item?.technologies)
        .map((technology) =>
          normalizeString(technology).trim(),
        )
        .filter(Boolean),

      link: normalizeString(item?.link).trim(),
    }))
    .filter(
      (item) =>
        item.name ||
        item.description ||
        item.technologies.length > 0 ||
        item.link,
    )
}

/* =========================================================
   COMPONENT
========================================================= */

const Profile = () => {
  /* =========================================================
     PROFILE
  ========================================================= */

  const [profile, setProfile] = useState({
    name: "",
    designation: "",
    location: "",
    email: "",
    phone: "",
    about: "",
    profileImage: "",
    resume: "",
    linkedin: "",
    github: "",
    portfolio: "",
    careerField: "",
    careerFieldId: "",
    experienceLevel: "",
    profileVisibility: true,
  });

  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);

  /* =========================================================
     UI
  ========================================================= */

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  /* =========================================================
     FILE STATES
  ========================================================= */

  const [resumeFile, setResumeFile] = useState(null);

  const [profileImageFile, setProfileImageFile] =
    useState(null);

  const [profileImagePreview, setProfileImagePreview] =
    useState("");

  const [resumeInputKey, setResumeInputKey] = useState(0);

  const [profileImageInputKey, setProfileImageInputKey] =
    useState(0);

  /* =========================================================
     EDIT FORM
  ========================================================= */

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    designation: "",
    location: "",
    about: "",
    career_field_id: "",
    experience_level: "",

    skills: [],
    education: [],
    experience: [],
    projects: [],

    linkedin: "",
    github: "",
    portfolio: "",

    profile_visibility: 1,
  });

  /* =========================================================
     GET USER ID
  ========================================================= */

  const getUserId = () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null",
      );

      return (
        storedUser?.id ||
        storedUser?.user_id ||
        storedUser?.userId ||
        null
      );
    } catch (err) {
      console.error("User data error:", err);

      return null;
    }
  };

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        CATEGORIES_API,
        {
          timeout: 15000,
        },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to fetch categories.",
        );
      }

      const categoryList = Array.isArray(
        response.data?.data,
      )
        ? response.data.data
        : Array.isArray(
              response.data?.categories,
            )
          ? response.data.categories
          : [];

      setCategories(categoryList);

      return categoryList;
    } catch (err) {
      console.error(
        "Categories fetch error:",
        err.response?.data ||
          err.message,
      );

      setCategories([]);

      return [];
    }
  };

  /* =========================================================
     FETCH PROFILE
  ========================================================= */

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();

      if (!userId) {
        setError("User not logged in.");
        return;
      }

      const response = await axios.get(
        `${API_BASE}/profile/get.php`,
        {
          params: {
            user_id: userId,
          },

          timeout: 15000,
        },
      );

      if (!response.data?.success) {
        setError(
          response.data?.message ||
            "Failed to load profile.",
        );

        return;
      }

      const data =
        response.data?.profile || {};

      const profileResume = normalizeUrl(
        data.resume ||
          data.resume_url ||
          data.file_url ||
          "",
      );

      const profileImage = normalizeUrl(
        data.profile_image ||
          data.profileImage ||
          "",
      );

      setProfile({
        name: normalizeString(data.name),

        designation: normalizeString(
          data.headline ||
            data.designation,
        ),

        location: normalizeString(
          data.location,
        ),

        email: normalizeString(
          data.email,
        ),

        phone: normalizeString(
          data.phone,
        ),

        about: normalizeString(
          data.bio ||
            data.about,
        ),

        profileImage,

        resume: profileResume,

        linkedin: normalizeString(
          data.linkedin,
        ),

        github: normalizeString(
          data.github,
        ),

        portfolio: normalizeString(
          data.portfolio,
        ),

        careerField: normalizeString(
          data.career_field ||
            data.category_name ||
            data.category ||
            "",
        ),

        careerFieldId: normalizeString(
          data.category_id ||
            data.career_field_id ||
            "",
        ),

        experienceLevel:
          normalizeString(
            data.experience_level ||
              data.experienceLevel ||
              "",
          ),

        profileVisibility:
          Number(
            data.profile_visibility ?? 1,
          ) === 1,
      });

      setSkills(
        cleanSkillsArray(data.skills),
      );

      setExperiences(
        cleanExperienceArray(
          data.experience,
        ),
      );

      setEducation(
        cleanEducationArray(
          data.education,
        ),
      );

      setProjects(
        cleanProjectsArray(
          data.projects,
        ),
      );
    } catch (err) {
      console.error(
        "Profile fetch error:",
        err,
      );

      setError(
        err.response?.data?.message ||
          "Unable to connect with server.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  /* =========================================================
     CATEGORY OPTIONS
  ========================================================= */

  const careerFieldOptions = useMemo(() => {
    return categories
      .filter((category) => {
        const id =
          category?.id ??
          category?.category_id;

        const name =
          category?.name ??
          category?.category_name;

        return (
          id !== undefined &&
          id !== null &&
          String(name || "").trim()
        );
      })
      .map((category) => ({
        value: String(
          category.id ??
            category.category_id,
        ),

        label: String(
          category.name ??
            category.category_name,
        ).trim(),
      }));
  }, [categories]);

  /* =========================================================
     EXPERIENCE OPTIONS
  ========================================================= */

  const experienceOptions = useMemo(() => {
    const list = [
      ...EXPERIENCE_LEVELS,
    ];

    if (
      editForm.experience_level &&
      !list.includes(
        editForm.experience_level,
      )
    ) {
      list.push(
        editForm.experience_level,
      );
    }

    return list.map((level) => ({
      value: level,
      label: level,
    }));
  }, [
    editForm.experience_level,
  ]);

  /* =========================================================
     PROFILE COMPLETION
  ========================================================= */

  const completion = useMemo(() => {
    const fields = [
      Boolean(profile.name),
      Boolean(profile.email),
      Boolean(profile.phone),
      Boolean(profile.designation),
      Boolean(profile.location),
      Boolean(profile.about),
      Boolean(profile.profileImage),
      Boolean(profile.resume),
      Boolean(profile.careerField),
      Boolean(profile.experienceLevel),

      skills.length > 0,
      experiences.length > 0,
      education.length > 0,
      projects.length > 0,

      Boolean(profile.linkedin),
      Boolean(profile.github),
      Boolean(profile.portfolio),
    ];

    return Math.round(
      (fields.filter(Boolean).length /
        fields.length) *
        100,
    );
  }, [
    profile,
    skills,
    experiences,
    education,
    projects,
  ]);

  /* =========================================================
     MATCH READINESS
  ========================================================= */

  const matchReadiness = useMemo(() => {
    const checks = {
      skills: skills.length > 0,
      experience:
        Boolean(profile.experienceLevel) ||
        experiences.length > 0,
      location: Boolean(profile.location),
      education: education.length > 0,
      category: Boolean(profile.careerFieldId),
      resume: Boolean(profile.resume),
      headline: Boolean(profile.designation),
    };

    const total =
      Object.keys(checks).length;

    const completed =
      Object.values(checks).filter(
        Boolean,
      ).length;

    const percentage = Math.round(
      (completed / total) * 100,
    );

    return {
      ...checks,
      percentage,
    };
  }, [
    skills,
    experiences,
    education,
    profile,
  ]);

  const matchReady =
    matchReadiness.percentage >= 80;

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const handleEditProfile = async () => {
    setSaveMessage("");
    setSaveError("");

    setResumeFile(null);
    setProfileImageFile(null);

    setProfileImagePreview(
      profile.profileImage || "",
    );

    setResumeInputKey(
      (key) => key + 1,
    );

    setProfileImageInputKey(
      (key) => key + 1,
    );

    const freshCategories =
      await fetchCategories();

    let careerFieldId =
      profile.careerFieldId
        ? String(
            profile.careerFieldId,
          )
        : "";

    if (
      !careerFieldId &&
      profile.careerField
    ) {
      const found =
        freshCategories.find(
          (category) =>
            String(
              category.name || "",
            )
              .trim()
              .toLowerCase() ===
            String(
              profile.careerField,
            )
              .trim()
              .toLowerCase(),
        );

      if (found) {
        careerFieldId =
          String(found.id);
      }
    }

    setEditForm({
      name:
        profile.name || "",

      phone:
        profile.phone || "",

      designation:
        profile.designation || "",

      location:
        profile.location || "",

      about:
        profile.about || "",

      career_field_id:
        careerFieldId,

      experience_level:
        profile.experienceLevel ||
        "",

      skills: [...skills],

      education:
        education.map((item) => ({
          degree:
            item?.degree || "",

          university:
            item?.university || "",

          duration:
            item?.duration || "",
        })),

      experience:
        experiences.map((item) => ({
          designation:
            item?.designation || "",

          company:
            item?.company || "",

          duration:
            item?.duration || "",

          description:
            item?.description || "",
        })),

      projects:
        projects.map((item) => ({
          name:
            item?.name || "",

          description:
            item?.description || "",

          technologies:
            Array.isArray(
              item?.technologies,
            )
              ? [...item.technologies]
              : [],

          link:
            item?.link || "",
        })),

      linkedin:
        profile.linkedin || "",

      github:
        profile.github || "",

      portfolio:
        profile.portfolio || "",

      profile_visibility:
        profile.profileVisibility
          ? 1
          : 0,
    });

    setShowEditModal(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);

    setSaveMessage("");
    setSaveError("");

    setResumeFile(null);
    setProfileImageFile(null);
    setProfileImagePreview("");

    setResumeInputKey(
      (key) => key + 1,
    );

    setProfileImageInputKey(
      (key) => key + 1,
    );
  };

  /* =========================================================
     INPUT
  ========================================================= */

  const handleInputChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setEditForm(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );
  };

  /* =========================================================
     PROFILE VISIBILITY
  ========================================================= */

  const toggleProfileVisibility = () => {
    setEditForm(
      (previous) => ({
        ...previous,

        profile_visibility:
          Number(
            previous.profile_visibility,
          ) === 1
            ? 0
            : 1,
      }),
    );
  };

  /* =========================================================
     SKILLS
  ========================================================= */

  const addSkill = () => {
    setEditForm(
      (previous) => ({
        ...previous,

        skills: [
          ...previous.skills,
          "",
        ],
      }),
    );
  };

  const updateSkill = (
    index,
    value,
  ) => {
    setEditForm(
      (previous) => ({
        ...previous,

        skills:
          previous.skills.map(
            (
              skill,
              currentIndex,
            ) =>
              currentIndex ===
              index
                ? value
                : skill,
          ),
      }),
    );
  };

  const removeSkill = (index) => {
    setEditForm(
      (previous) => ({
        ...previous,

        skills:
          previous.skills.filter(
            (
              _,
              currentIndex,
            ) =>
              currentIndex !==
              index,
          ),
      }),
    );
  };

  /* =========================================================
     GENERIC LIST
  ========================================================= */

  const addItem = (
    key,
    template,
  ) => {
    setEditForm(
      (previous) => ({
        ...previous,

        [key]: [
          ...previous[key],
          template,
        ],
      }),
    );
  };

  const updateItem = (
    key,
    index,
    field,
    value,
  ) => {
    setEditForm(
      (previous) => ({
        ...previous,

        [key]:
          previous[key].map(
            (
              item,
              currentIndex,
            ) =>
              currentIndex ===
              index
                ? {
                    ...item,
                    [field]:
                      value,
                  }
                : item,
          ),
      }),
    );
  };

  const removeItem = (
    key,
    index,
  ) => {
    setEditForm(
      (previous) => ({
        ...previous,

        [key]:
          previous[key].filter(
            (
              _,
              currentIndex,
            ) =>
              currentIndex !==
              index,
          ),
      }),
    );
  };

  /* =========================================================
     PROJECT TECHNOLOGIES
  ========================================================= */

  const updateProjectTechnologies = (
    index,
    value,
  ) => {
    const technologies =
      value
        .split(",")
        .map((item) =>
          item.trim(),
        )
        .filter(Boolean);

    updateItem(
      "projects",
      index,
      "technologies",
      technologies,
    );
  };

  /* =========================================================
     RESUME SELECT
  ========================================================= */

  const handleResumeSelect = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      !ALLOWED_RESUME_EXT.includes(
        extension,
      )
    ) {
      setSaveError(
        "Resume must be a PDF, DOC or DOCX file.",
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      MAX_RESUME_SIZE
    ) {
      setSaveError(
        "Resume size must be under 5 MB.",
      );

      event.target.value = "";

      return;
    }

    setSaveError("");
    setResumeFile(file);
  };

  /* =========================================================
     PROFILE IMAGE SELECT
  ========================================================= */

  const handleProfileImageSelect = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      !ALLOWED_IMAGE_EXT.includes(
        extension,
      )
    ) {
      setSaveError(
        "Profile image must be JPG, JPEG, PNG or WEBP.",
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setSaveError(
        "Profile image must be under 2 MB.",
      );

      event.target.value = "";

      return;
    }

    setSaveError("");

    setProfileImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setProfileImagePreview(
      previewUrl,
    );
  };

  /* =========================================================
     CLEAR RESUME
  ========================================================= */

  const clearResumeFile = () => {
    setResumeFile(null);

    setResumeInputKey(
      (key) => key + 1,
    );
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveProfile = async (
    event,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSaveMessage("");
      setSaveError("");

      const userId =
        getUserId();

      if (!userId) {
        setSaveError(
          "User not logged in.",
        );

        return;
      }

      /* =====================================================
         1. PROFILE IMAGE
      ===================================================== */

      let profileImageUrl =
        profile.profileImage || "";

      if (profileImageFile) {
        const formData =
          new FormData();

        formData.append(
          "user_id",
          String(userId),
        );

        formData.append(
          "profile_image",
          profileImageFile,
        );

        const response =
          await axios.post(
            UPLOAD_PROFILE_IMAGE_API,
            formData,
            {
              timeout: 30000,
            },
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data?.message ||
              "Profile image upload failed.",
          );
        }

        profileImageUrl =
          response.data
            ?.profile_image ||
          response.data?.url ||
          "";

        profileImageUrl =
          normalizeUrl(
            profileImageUrl,
          );
      }

      /* =====================================================
         2. RESUME
      ===================================================== */

      let resumeUrl =
        profile.resume || "";

      if (resumeFile) {
        const formData =
          new FormData();

        formData.append(
          "user_id",
          String(userId),
        );

        formData.append(
          "resume",
          resumeFile,
        );

        const response =
          await axios.post(
            UPLOAD_RESUME_API,
            formData,
            {
              timeout: 30000,
            },
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data?.message ||
              "Resume upload failed.",
          );
        }

        resumeUrl =
          response.data?.resume ||
          response.data?.url ||
          response.data?.path ||
          response.data?.file_url ||
          resumeUrl;

        resumeUrl =
          normalizeUrl(
            resumeUrl,
          );
      }

      /* =====================================================         3. CLEAN DATA
      ===================================================== */

      const cleanedSkills =
        cleanSkillsArray(
          editForm.skills,
        );

      const cleanedEducation =
        cleanEducationArray(
          editForm.education,
        );

      const cleanedExperience =
        cleanExperienceArray(
          editForm.experience,
        );

      const cleanedProjects =
        cleanProjectsArray(
          editForm.projects,
        );

      /* =====================================================
         4. CATEGORY
      ===================================================== */

      const selectedCategory =
        categories.find(
          (category) =>
            String(
              category.id ??
                category.category_id,
            ) ===
            String(
              editForm.career_field_id,
            ),
        );

      const categoryId =
        editForm.career_field_id
          ? Number(
              editForm.career_field_id,
            )
          : null;

      /* =====================================================
         5. PROFILE MATCH DATA
      ===================================================== */

      const payload = {
        user_id: Number(userId),

        name:
          editForm.name?.trim() || "",

        phone:
          editForm.phone?.trim() || "",

        profile_image:
          profileImageUrl || null,

        headline:
          editForm.designation.trim(),

        bio:
          editForm.about.trim(),

        location:
          editForm.location.trim(),

        date_of_birth: null,

        category_id:
          categoryId,

        career_field:
          selectedCategory?.name ||
          "",

        experience_level:
          editForm.experience_level ||
          "",

        skills:
          cleanedSkills,

        education:
          cleanedEducation,

        experience:
          cleanedExperience,

        projects:
          cleanedProjects,

        resume:
          resumeUrl || null,

        linkedin:
          editForm.linkedin.trim(),

        github:
          editForm.github.trim(),

        portfolio:
          editForm.portfolio.trim(),

        /* IMPORTANT */
        profile_visibility:
          Number(
            editForm.profile_visibility,
          ) === 1
            ? 1
            : 0,
      };

      console.log(
        "PROFILE SAVE PAYLOAD:",
        payload,
      );

      /* =====================================================
         6. SAVE DATABASE
      ===================================================== */

      const response =
        await axios.post(
          `${PROFILE_API}/save.php`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
            },

            timeout: 30000,
          },
        );

      if (
        !response.data?.success
      ) {
        throw new Error(
          response.data?.message ||
            "Failed to save profile.",
        );
      }

      /* =====================================================
         7. SUCCESS
      ===================================================== */

      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );
        if (storedUser) {
          if (editForm.name?.trim()) {
            storedUser.name = editForm.name.trim();
          }
          if (editForm.phone !== undefined) {
            storedUser.phone = editForm.phone.trim();
          }
          localStorage.setItem("user", JSON.stringify(storedUser));
          window.dispatchEvent(new Event("loginUpdated"));
        }
      } catch (storageErr) {
        console.warn("Could not update stored user in localStorage:", storageErr);
      }

      setSaveMessage(
        "Profile updated successfully.",
      );

      setSaveError("");

      setResumeFile(null);
      setProfileImageFile(null);
      setProfileImagePreview("");

      setResumeInputKey(
        (key) => key + 1,
      );

      setProfileImageInputKey(
        (key) => key + 1,
      );

      await fetchProfile();

      setTimeout(() => {
        setShowEditModal(false);
        setSaveMessage("");
      }, 1000);
    } catch (err) {
      console.error(
        "Save profile error:",
        err,
      );

      const message =
        err.response?.data
          ?.message ||
        err.response?.data
          ?.error ||
        err.message;

      setSaveError(
        message ||
          "Failed to save profile. Please check the server.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING (SKELETON)
  ========================================================= */

  if (loading) {
    return <ProfileSkeleton />;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <X className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Unable to Load Profile
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchProfile}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">

          {/* PAGE TITLE */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your professional information and improve your recruiter match.
              </p>
            </div>

            <button
              type="button"
              onClick={handleEditProfile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          {/* PROFILE HEADER */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="relative h-28 overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 sm:h-32">
              <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-cyan-300/10" />
            </div>

            <div className="px-5 pb-6 sm:px-8">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">

                  <div className="relative -mt-14 shrink-0 sm:-mt-16">

                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={
                          profile.name ||
                          "Candidate"
                        }
                        className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg sm:h-32 sm:w-32"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-50 shadow-lg sm:h-32 sm:w-32">
                        <User className="h-14 w-14 text-blue-500" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
                      title="Edit profile"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-w-0 text-center sm:pb-1 sm:text-left">

                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {profile.name ||
                        "Name not available"}
                    </h2>

                    {profile.designation ? (
                      <p className="mt-1 font-medium text-blue-600">
                        {profile.designation}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400">
                        Professional headline not added
                      </p>
                    )}

                    {profile.location && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                </div>

                {(profile.linkedin ||
                  profile.github ||
                  profile.portfolio) && (
                  <div className="flex justify-center gap-2 sm:pb-1">

                    {profile.linkedin && (
                      <SocialLink
                        href={profile.linkedin}
                        title="LinkedIn"
                      >
                        <Link2 size={16} />
                      </SocialLink>
                    )}

                    {profile.github && (
                      <SocialLink
                        href={profile.github}
                        title="GitHub"
                      >
                        <Code2 size={16} />
                      </SocialLink>
                    )}

                    {profile.portfolio && (
                      <SocialLink
                        href={profile.portfolio}
                        title="Portfolio"
                      >
                        <Globe size={16} />
                      </SocialLink>
                    )}
                  </div>
                )}
              </div>

              {/* CONTACT */}
              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

                <ContactBox
                  icon={
                    <Mail className="h-4 w-4" />
                  }
                  label="Email"
                  value={
                    profile.email ||
                    "Not added"
                  }
                />

                <ContactBox
                  icon={
                    <Phone className="h-4 w-4" />
                  }
                  label="Phone"
                  value={
                    profile.phone ||
                    "Not added"
                  }
                />

                <ContactBox
                  icon={
                    <Tags className="h-4 w-4" />
                  }
                  label="Career Field"
                  value={
                    profile.careerField ||
                    "Not added"
                  }
                />

                <ContactBox
                  icon={
                    <Award className="h-4 w-4" />
                  }
                  label="Experience"
                  value={
                    profile.experienceLevel ||
                    "Not added"
                  }
                />
              </div>

              {/* PROFILE COMPLETION */}
              <div className="mt-5 border-t border-slate-100 pt-5">

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Profile Completion
                  </span>

                  <span className="text-sm font-bold text-blue-600">
                    {completion}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  A complete profile gives recruiters better information for job matching.
                </p>
              </div>
            </div>
          </div>

          {/* MATCH READINESS */}
          <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5 shadow-sm sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Target className="h-6 w-6" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Recruiter Match Readiness
                    </h2>

                    {matchReady ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Complete Profile
                      </span>
                    )}
                  </div>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                    Your actual Match Score is calculated against a specific job using skills, experience, location, education and career field.
                  </p>
                </div>
              </div>

              <div className="shrink-0">

                <div className="text-right">
                  <span className="text-3xl font-bold text-blue-600">
                    {matchReadiness.percentage}%
                  </span>

                  <p className="text-xs text-slate-500">
                    match readiness
                  </p>
                </div>

                <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${matchReadiness.percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">

              <MatchCheck
                label="Skills"
                done={
                  matchReadiness.skills
                }
              />

              <MatchCheck
                label="Experience"
                done={
                  matchReadiness.experience
                }
              />

              <MatchCheck
                label="Location"
                done={
                  matchReadiness.location
                }
              />

              <MatchCheck
                label="Education"
                done={
                  matchReadiness.education
                }
              />

              <MatchCheck
                label="Career Field"
                done={
                  matchReadiness.category
                }
              />

              <MatchCheck
                label="Resume"
                done={
                  matchReadiness.resume
                }
              />

              <MatchCheck
                label="Headline"
                done={
                  matchReadiness.headline
                }
              />
            </div>
          </div>

          {/* VISIBILITY STATUS */}
          <div className="mb-6">

            <div
              className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
                profile.profileVisibility
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex items-center gap-3">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    profile.profileVisibility
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {profile.profileVisibility ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <ShieldOff className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Recruiter Profile Visibility
                  </p>

                  <p className="text-xs text-slate-500">
                    {profile.profileVisibility
                      ? "Recruiters can find your profile when matching candidates."
                      : "Your profile is hidden from recruiter candidate search."}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  profile.profileVisibility
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {profile.profileVisibility
                  ? "Visible"
                  : "Hidden"}
              </span>
            </div>
          </div>

          {/* DETAILS */}
          <div className="space-y-6">

            {/* ABOUT */}
            <ProfileSection
              icon={
                <User className="h-5 w-5" />
              }
              title="About Me"
            >
              {profile.about ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {profile.about}
                </p>
              ) : (
                <EmptyState text="No about information added yet." />
              )}
            </ProfileSection>

            {/* SKILLS */}
            <ProfileSection
              icon={
                <BriefcaseBusiness className="h-5 w-5" />
              }
              title="Skills"
            >
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(
                    (
                      skill,
                      index,
                    ) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-100"
                      >
                        {skill}
                      </span>
                    ),
                  )}
                </div>
              ) : (
                <EmptyState text="No skills added yet." />
              )}
            </ProfileSection>

            {/* EXPERIENCE */}
            <ProfileSection
              icon={
                <BriefcaseBusiness className="h-5 w-5" />
              }
              title="Experience"
            >
              {experiences.length > 0 ? (
                <div className="space-y-7">
                  {experiences.map(
                    (
                      experience,
                      index,
                    ) => (
                      <div
                        key={index}
                        className="relative border-l-2 border-blue-100 pl-7"
                      >
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-[3px] border-blue-600 bg-white" />

                        {experience.designation && (
                          <h3 className="text-base font-bold text-slate-900">
                            {
                              experience.designation
                            }
                          </h3>
                        )}

                        {experience.company && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-blue-600">
                            <Building2 className="h-4 w-4" />
                            {
                              experience.company
                            }
                          </p>
                        )}

                        {experience.duration && (
                          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {
                              experience.duration
                            }
                          </p>
                        )}

                        {experience.description && (
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                            {
                              experience.description
                            }
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <EmptyState text="No experience added yet." />
              )}
            </ProfileSection>

            {/* EDUCATION */}
            <ProfileSection
              icon={
                <GraduationCap className="h-5 w-5" />
              }
              title="Education"
            >
              {education.length > 0 ? (
                <div className="space-y-3">
                  {education.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={index}
                        className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>

                        <div className="min-w-0">

                          {item.degree && (
                            <h3 className="font-bold text-slate-900">
                              {
                                item.degree
                              }
                            </h3>
                          )}

                          {item.university && (
                            <p className="mt-1 text-sm text-slate-600">
                              {
                                item.university
                              }
                            </p>
                          )}

                          {item.duration && (
                            <p className="mt-1 text-xs text-slate-400">
                              {
                                item.duration
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <EmptyState text="No education added yet." />
              )}
            </ProfileSection>

            {/* PROJECTS */}
            <ProfileSection
              icon={
                <FolderKanban className="h-5 w-5" />
              }
              title="Projects"
            >
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  {projects.map(
                    (
                      project,
                      index,
                    ) => (
                      <div
                        key={index}
                        className="group rounded-xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <FolderKanban className="h-5 w-5 text-blue-600" />
                          </div>

                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-blue-600"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        {project.name && (
                          <h3 className="mt-4 font-bold text-slate-900">
                            {
                              project.name
                            }
                          </h3>
                        )}

                        {project.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {
                              project.description
                            }
                          </p>
                        )}

                        {Array.isArray(
                          project.technologies,
                        ) &&
                          project
                            .technologies
                            .length >
                            0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {project.technologies.map(
                                (
                                  technology,
                                  technologyIndex,
                                ) => (
                                  <span
                                    key={
                                      technologyIndex
                                    }
                                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                                  >
                                    {
                                      technology
                                    }
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <EmptyState text="No projects added yet." />
              )}
            </ProfileSection>

            {/* RESUME */}
            <ProfileSection
              icon={
                <FileText className="h-5 w-5" />
              }
              title="Resume"
            >
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                      <FileText className="h-6 w-6 text-red-500" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">
                        {profile.resume
                          ? getFileName(
                              profile.resume,
                            )
                          : "No resume uploaded"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {profile.resume
                          ? "Resume document"
                          : "Upload your resume (PDF, DOC, DOCX)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={
                        handleEditProfile
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                    >
                      <Upload className="h-4 w-4" />

                      {profile.resume
                        ? "Replace"
                        : "Upload"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        !profile.resume
                      }
                      onClick={() => {
                        if (
                          profile.resume
                        ) {
                          window.open(
                            profile.resume,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>

                    <button
                      type="button"
                      disabled={
                        !profile.resume
                      }
                      onClick={() => {
                        if (
                          !profile.resume
                        ) {
                          return;
                        }

                        const link =
                          document.createElement(
                            "a",
                          );

                        link.href =
                          profile.resume;

                        link.target =
                          "_blank";

                        link.download =
                          getFileName(
                            profile.resume,
                          );

                        document.body.appendChild(
                          link,
                        );

                        link.click();

                        document.body.removeChild(
                          link,
                        );
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </ProfileSection>
          </div>
        </div>
      </main>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {showEditModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your professional information and recruiter matching data.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleSaveProfile
              }
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6">

                <div className="space-y-8">

                  {/* BASIC */}
                  <div>
                    <FormHeading title="Basic Information" />

                    {/* IMAGE */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                        <div className="shrink-0">

                          {profileImagePreview ? (
                            <img
                              src={
                                profileImagePreview
                              }
                              alt="Profile preview"
                              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                            />
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 shadow-md">
                              <User className="h-10 w-10 text-blue-500" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-sm font-semibold text-slate-800">
                            Profile Photo
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Upload a professional profile photo. JPG, JPEG, PNG or WEBP. Maximum 2 MB.
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">

                            <label
                              className={`${secondaryButtonClass} cursor-pointer`}
                            >
                              <ImageIcon className="h-4 w-4" />
                              Choose Image

                              <input
                                key={
                                  profileImageInputKey
                                }
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={
                                  handleProfileImageSelect
                                }
                                className="hidden"
                              />
                            </label>

                            {profileImageFile && (
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileImageFile(
                                    null,
                                  );

                                  setProfileImagePreview(
                                    profile.profileImage ||
                                      "",
                                  );

                                  setProfileImageInputKey(
                                    (key) =>
                                      key + 1,
                                  );
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <InputField
                        label="Full Name"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                      />

                      <ReadOnlyField
                        label="Email (Account ID)"
                        value={profile.email}
                      />

                      <InputField
                        label="Phone Number"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                      />

                      <SelectField
                        label="Career Field"
                        name="career_field_id"
                        value={
                          editForm.career_field_id
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder={
                          careerFieldOptions.length >
                          0
                            ? "Select career field"
                            : "No categories found"
                        }
                        options={
                          careerFieldOptions
                        }
                      />

                      <SelectField
                        label="Experience"
                        name="experience_level"
                        value={
                          editForm.experience_level
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Select experience"
                        options={
                          experienceOptions
                        }
                      />

                      <InputField
                        label="Location"
                        name="location"
                        value={
                          editForm.location
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Lucknow, Uttar Pradesh"
                      />

                      <div className="md:col-span-2">
                        <InputField
                          label="Professional Headline"
                          name="designation"
                          value={
                            editForm.designation
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="Frontend Developer | React.js Developer"
                        />
                      </div>
                    </div>

                    {/* VISIBILITY */}
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-3">

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              Number(
                                editForm.profile_visibility,
                              ) === 1
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {Number(
                              editForm.profile_visibility,
                            ) === 1 ? (
                              <ShieldCheck className="h-5 w-5" />
                            ) : (
                              <ShieldOff className="h-5 w-5" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Recruiter Profile Visibility
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Allow recruiters to find your profile in candidate search and matching.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={
                            toggleProfileVisibility
                          }
                          className={`relative h-7 w-14 shrink-0 rounded-full transition ${
                            Number(
                              editForm.profile_visibility,
                            ) === 1
                              ? "bg-green-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                              Number(
                                editForm.profile_visibility,
                              ) === 1
                                ? "left-8"
                                : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SKILLS */}
                  <div>
                    <SectionHeader
                      title="Skills"
                      buttonLabel="Add Skill"
                      onAdd={
                        addSkill
                      }
                    />

                    {editForm.skills
                      .length === 0 ? (
                      <EmptyEdit text="No skills added. Click Add Skill." />
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {editForm.skills.map(
                          (
                            skill,
                            index,
                          ) => (
                            <div
                              key={index}
                              className="flex gap-2"
                            >
                              <input
                                type="text"
                                value={
                                  skill
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateSkill(
                                    index,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="React.js"
                                className={
                                  inputClass
                                }
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeSkill(
                                    index,
                                  )
                                }
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* RESUME */}
                  <div>
                    <FormHeading title="Resume" />

                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                            <FileText className="h-5 w-5 text-red-500" />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-slate-800">
                              {resumeFile
                                ? resumeFile.name
                                : profile.resume
                                  ? getFileName(
                                      profile.resume,
                                    )
                                  : "No resume uploaded"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {resumeFile
                                ? "New file selected. It will upload when you save."
                                : "PDF, DOC or DOCX, max 5 MB"}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">

                          <label
                            className={`${secondaryButtonClass} cursor-pointer`}
                          >
                            <Upload className="h-4 w-4" />

                            {profile.resume ||
                            resumeFile
                              ? "Replace Resume"
                              : "Upload Resume"}

                            <input
                              key={
                                resumeInputKey
                              }
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={
                                handleResumeSelect
                              }
                              className="hidden"
                            />
                          </label>

                          {resumeFile && (
                            <button
                              type="button"
                              onClick={
                                clearResumeFile
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ABOUT */}
                  <div>
                    <InputLabel>
                      About Me
                    </InputLabel>

                    <textarea
                      name="about"
                      rows={5}
                      value={
                        editForm.about
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Tell recruiters about yourself..."
                      className={
                        textareaClass
                      }
                    />
                  </div>

                  {/* EXPERIENCE */}
                  <div>
                    <SectionHeader
                      title="Work Experience"
                      buttonLabel="Add Experience"
                      onAdd={() =>
                        addItem(
                          "experience",
                          {
                            designation:
                              "",
                            company:
                              "",
                            duration:
                              "",
                            description:
                              "",
                          },
                        )
                      }
                    />

                    {editForm.experience
                      .length === 0 ? (
                      <EmptyEdit text="No experience added yet." />
                    ) : (
                      <div className="space-y-4">

                        {editForm.experience.map(
                          (
                            experience,
                            index,
                          ) => (
                            <ListCard
                              key={
                                index
                              }
                              title={`Experience #${
                                index +
                                1
                              }`}
                              onRemove={() =>
                                removeItem(
                                  "experience",
                                  index,
                                )
                              }
                            >
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <InputField
                                  label="Designation"
                                  value={
                                    experience.designation
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateItem(
                                      "experience",
                                      index,
                                      "designation",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="MERN Stack Developer Intern"
                                />

                                <InputField
                                  label="Company"
                                  value={
                                    experience.company
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateItem(
                                      "experience",
                                      index,
                                      "company",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="Company name"
                                />

                                <InputField
                                  label="Duration"
                                  value={
                                    experience.duration
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateItem(
                                      "experience",
                                      index,
                                      "duration",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="Jan 2025 - Present"
                                />

                                <div className="md:col-span-2">

                                  <InputLabel>
                                    Description
                                  </InputLabel>

                                  <textarea
                                    rows={4}
                                    value={
                                      experience.description
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateItem(
                                        "experience",
                                        index,
                                        "description",
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    placeholder="Describe your responsibilities..."
                                    className={
                                      textareaClass
                                    }
                                  />
                                </div>
                              </div>
                            </ListCard>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* EDUCATION */}
                  <div>
                    <SectionHeader
                      title="Education"
                      buttonLabel="Add Education"
                      onAdd={() =>
                        addItem(
                          "education",
                          {
                            degree: "",
                            university:
                              "",
                            duration:
                              "",
                          },
                        )
                      }
                    />

                    {editForm.education
                      .length === 0 ? (
                      <EmptyEdit text="No education added yet." />
                    ) : (
                      <div className="space-y-4">

                        {editForm.education.map(
                          (
                            item,
                            index,
                          ) => (
                            <ListCard
                              key={
                                index
                              }
                              title={`Education #${
                                index +
                                1
                              }`}
                              onRemove={() =>
                                removeItem(
                                  "education",
                                  index,
                                )
                              }
                            >
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                <InputField
                                  label="Degree"
                                  value={
                                    item.degree
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateItem(
                                      "education",
                                      index,
                                      "degree",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="BCA / MCA / B.Tech"
                                />

                                <InputField
                                  label="University / Institute"
                                  value={
                                    item.university
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateItem(
                                      "education",
                                      index,
                                      "university",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="University"
                                />

                                <InputField
                                  label="Duration"
                                  value={
                                    item.duration
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateItem(
                                      "education",
                                      index,
                                      "duration",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="2022 - 2025"
                                />
                              </div>
                            </ListCard>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* PROJECTS */}
                  <div>
                    <SectionHeader
                      title="Projects"
                      buttonLabel="Add Project"
                      onAdd={() =>
                        addItem(
                          "projects",
                          {
                            name: "",
                            description:
                              "",
                            technologies:
                              [],
                            link: "",
                          },
                        )
                      }
                    />

                    {editForm.projects
                      .length === 0 ? (
                      <EmptyEdit text="No projects added yet." />
                    ) : (
                      <div className="space-y-4">

                        {editForm.projects.map(
                          (
                            project,
                            index,
                          ) => (
                            <ListCard
                              key={
                                index
                              }
                              title={`Project #${
                                index +
                                1
                              }`}
                              onRemove={() =>
                                removeItem(
                                  "projects",
                                  index,
                                )
                              }
                            >
                              <div className="grid grid-cols-1 gap-4">

                                <InputField
                                  label="Project Name"
                                  value={
                                    project.name
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateItem(
                                      "projects",
                                      index,
                                      "name",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="Job Portal"
                                />

                                <div>
                                  <InputLabel>
                                    Description
                                  </InputLabel>

                                  <textarea
                                    rows={4}
                                    value={
                                      project.description
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateItem(
                                        "projects",
                                        index,
                                        "description",
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    placeholder="Project description"
                                    className={
                                      textareaClass
                                    }
                                  />
                                </div>

                                <InputField
                                  label="Technologies"
                                  value={
                                    Array.isArray(
                                      project.technologies,
                                    )
                                      ? project.technologies.join(
                                          ", ",
                                        )
                                      : ""
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateProjectTechnologies(
                                      index,
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="React, Node.js, MongoDB, PHP, MySQL"
                                />

                                <InputField
                                  label="Project Link"
                                  value={
                                    project.link
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateItem(
                                      "projects",
                                      index,
                                      "link",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="https://..."
                                />
                              </div>
                            </ListCard>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* SOCIAL */}
                  <div>
                    <FormHeading title="Social Links" />

                    <div className="mt-4 space-y-4">

                      <InputWithIcon
                        icon={
                          <Link2 className="h-4 w-4" />
                        }
                        type="url"
                        name="linkedin"
                        value={
                          editForm.linkedin
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="LinkedIn URL"
                      />

                      <InputWithIcon
                        icon={
                          <Code2 className="h-4 w-4" />
                        }
                        type="url"
                        name="github"
                        value={
                          editForm.github
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="GitHub URL"
                      />

                      <InputWithIcon
                        icon={
                          <Globe className="h-4 w-4" />
                        }
                        type="url"
                        name="portfolio"
                        value={
                          editForm.portfolio
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Portfolio URL"
                      />
                    </div>
                  </div>

                  {/* MATCH INFORMATION */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          Improve your Match Score
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Keep your skills, experience, location, education, career field and resume updated. The recruiter-side Match Score will compare these details with the selected job.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                            Skills 50%
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                            Experience 20%
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                            Location 15%
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                            Education 10%
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                            Career Field 5%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MESSAGES */}
                  {saveMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {saveMessage}
                    </div>
                  )}

                  {saveError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {saveError}
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">

                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const SocialLink = ({
  href,
  title,
  children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
    title={title}
  >
    {children}
  </a>
);

const ContactBox = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">

    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  </div>
);

const MatchCheck = ({
  label,
  done,
}) => (
  <div
    className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
      done
        ? "border-green-200 bg-green-50"
        : "border-slate-200 bg-white"
    }`}
  >
    {done ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-slate-300" />
    )}

    <span
      className={`text-xs font-semibold ${
        done
          ? "text-green-700"
          : "text-slate-500"
      }`}
    >
      {label}
    </span>
  </div>
);

const ProfileSection = ({
  icon,
  title,
  children,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

    <div className="mb-5 flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
        {title}
      </h2>
    </div>

    {children}
  </section>
);

const EmptyState = ({
  text,
}) => (
  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
    <p className="text-sm text-slate-400">
      {text}
    </p>
  </div>
);

const EmptyEdit = ({
  text,
}) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center">
    <p className="text-sm text-slate-400">
      {text}
    </p>
  </div>
);

const FormHeading = ({
  title,
}) => (
  <h3 className="mb-4 text-base font-bold text-slate-900">
    {title}
  </h3>
);

const SectionHeader = ({
  title,
  buttonLabel,
  onAdd,
}) => (
  <div className="mb-4 flex items-center justify-between">

    <h3 className="text-base font-bold text-slate-900">
      {title}
    </h3>

    <button
      type="button"
      onClick={onAdd}
      className={secondaryButtonClass}
    >
      <Plus className="h-4 w-4" />
      {buttonLabel}
    </button>
  </div>
);

const ListCard = ({
  title,
  onRemove,
  children,
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

    <div className="mb-4 flex items-center justify-between">

      <span className="text-sm font-semibold text-slate-700">
        {title}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>

    {children}
  </div>
);

const InputLabel = ({
  children,
}) => (
  <label className="mb-1.5 block text-sm font-medium text-slate-700">
    {children}
  </label>
);

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div>

    <InputLabel>
      {label}
    </InputLabel>

    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={inputClass}
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}) => (
  <div>

    <InputLabel>
      {label}
    </InputLabel>

    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`${inputClass} bg-white`}
    >
      <option value="">
        {placeholder}
      </option>

      {options.map(
        (option) => (
          <option
            key={option.value}
            value={
              option.value
            }
          >
            {option.label}
          </option>
        ),
      )}
    </select>
  </div>
);

const ReadOnlyField = ({
  label,
  value,
}) => (
  <div>

    <InputLabel>
      {label}
    </InputLabel>

    <input
      type="text"
      value={value || ""}
      disabled
      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
    />
  </div>
);

const InputWithIcon = ({
  icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}) => (
  <div className="relative">

    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
      {icon}
    </div>

    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    />
  </div>
);

/* =========================================================
   STYLES
========================================================= */

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const textareaClass =
  "w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const secondaryButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100";

/* =========================================================
   EXPORT
========================================================= */

export default Profile;