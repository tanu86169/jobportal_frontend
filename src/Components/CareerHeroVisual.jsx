import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  BriefcaseBusiness,
  TrendingUp,
  Users,
  Code2,
  MapPin,
  Building2,
  ArrowUpRight,
  Sparkles,
  Loader2,
  Search,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

// =====================================================
// API CONFIG
// =====================================================

import { API_BASE } from "../Config/api";

const JOBS_API = `${API_BASE}/jobs/get-all.php`;

// =====================================================
// HELPERS
// =====================================================

const getJobId = (job) => {
  return (
    job?.id ??
    job?.job_id ??
    job?.jobId ??
    job?._id ??
    null
  );
};

const getJobTitle = (job) => {
  return (
    job?.title ||
    job?.job_title ||
    job?.jobTitle ||
    job?.position ||
    "Job Opportunity"
  );
};

const getCompanyName = (job) => {
  return (
    job?.company_name ||
    job?.companyName ||
    job?.company ||
    job?.employer_name ||
    job?.recruiter_name ||
    "Top Company"
  );
};

const getLocation = (job) => {
  return (
    job?.location ||
    job?.job_location ||
    job?.city ||
    "India"
  );
};

const getSkills = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.name ||
          item?.skill ||
          item?.title ||
          ""
        );
      })
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getJobSkills = (job) => {
  const possibleSkills = [
    job?.skills,
    job?.required_skills,
    job?.requiredSkills,
    job?.job_skills,
    job?.technology,
    job?.technologies,
    job?.tech_stack,
    job?.techStack,
  ];

  for (const value of possibleSkills) {
    const skills = getSkills(value);

    if (skills.length > 0) {
      return skills;
    }
  }

  return [];
};

const getUserFromStorage = () => {
  try {
    const keys = [
      "user",
      "candidate",
      "profile",
      "candidateProfile",
    ];

    for (const key of keys) {
      const stored = localStorage.getItem(key);

      if (!stored) continue;

      const parsed = JSON.parse(stored);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.error(
      "User storage error:",
      error
    );

    return null;
  }
};

const getUserSkills = (user) => {
  if (!user) return [];

  const values = [
    user.skills,
    user.skill,
    user.profile?.skills,
    user.candidate?.skills,
    user.candidate_profile?.skills,
    user.resume?.skills,
  ];

  for (const value of values) {
    const skills = getSkills(value);

    if (skills.length > 0) {
      return skills;
    }
  }

  return [];
};

const getProfileProgress = (user) => {
  if (!user) return 0;

  const fields = [
    user.name ||
      user.full_name ||
      user.fullName,

    user.email,

    user.phone ||
      user.mobile,

    user.skills,

    user.experience,

    user.education,

    user.location,

    user.resume ||
      user.resume_url ||
      user.resumeUrl,

    user.profile_image ||
      user.profileImage ||
      user.avatar,
  ];

  const completed = fields.filter(
    (field) => {
      if (Array.isArray(field)) {
        return field.length > 0;
      }

      return (
        field !== null &&
        field !== undefined &&
        String(field).trim() !== ""
      );
    }
  ).length;

  return Math.min(
    100,
    Math.round(
      (completed / fields.length) * 100
    )
  );
};

const getCategory = (job) => {
  return (
    job?.category_name ||
    job?.category ||
    job?.job_category ||
    job?.job_type ||
    "Career"
  );
};

// =====================================================
// COMPONENT
// =====================================================

const CareerHeroVisual = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(() =>
    getUserFromStorage()
  );

  // =====================================================
  // FETCH JOBS
  // =====================================================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          JOBS_API,
          {
            timeout: 10000,
          }
        );

        const data = response.data;

        const rawJobs = Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
          ? data.jobs
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const formattedJobs = rawJobs
          .map((job) => ({
            ...job,

            id: getJobId(job),

            title: getJobTitle(job),

            company:
              getCompanyName(job),

            location:
              getLocation(job),

            category:
              getCategory(job),

            skills:
              getJobSkills(job),
          }))
          .filter(
            (job) => job.id !== null
          );

        setJobs(formattedJobs);
      } catch (error) {
        console.error(
          "Career Hero Jobs API Error:",
          error
        );

        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // =====================================================
  // LOGIN UPDATE
  // =====================================================

  useEffect(() => {
    const refreshUser = () => {
      setUser(
        getUserFromStorage()
      );
    };

    window.addEventListener(
      "storage",
      refreshUser
    );

    window.addEventListener(
      "loginUpdated",
      refreshUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        refreshUser
      );

      window.removeEventListener(
        "loginUpdated",
        refreshUser
      );
    };
  }, []);

  // =====================================================
  // TOTAL JOBS
  // =====================================================

  const totalJobs = jobs.length;

  // =====================================================
  // TOTAL COMPANIES
  // =====================================================

  const totalCompanies = useMemo(() => {
    const companies = jobs
      .map((job) =>
        String(job.company || "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

    return new Set(companies).size;
  }, [jobs]);

  // =====================================================
  // FEATURED JOB
  // =====================================================

  const featuredJob = useMemo(() => {
    if (!jobs.length) {
      return null;
    }

    const featured = jobs.find(
      (job) =>
        job.featured === true ||
        job.featured === 1 ||
        job.featured === "1" ||
        job.is_featured === true ||
        job.is_featured === 1
    );

    return featured || jobs[0];
  }, [jobs]);

  // =====================================================
  // USER SKILLS
  // =====================================================

  const userSkills = useMemo(() => {
    return getUserSkills(user);
  }, [user]);

  // =====================================================
  // POPULAR SKILLS
  // =====================================================

  const popularSkills = useMemo(() => {
    const counter = {};

    jobs.forEach((job) => {
      job.skills.forEach((skill) => {
        const cleanSkill = String(skill)
          .trim()
          .toLowerCase();

        if (!cleanSkill) return;

        if (!counter[cleanSkill]) {
          counter[cleanSkill] = {
            name: skill,
            count: 0,
          };
        }

        counter[cleanSkill].count += 1;
      });
    });

    return Object.values(counter)
      .sort(
        (a, b) => b.count - a.count
      )
      .slice(0, 4)
      .map((item) => item.name);
  }, [jobs]);

  // =====================================================
  // DISPLAY SKILLS
  // =====================================================

  const displaySkills = useMemo(() => {
    if (userSkills.length > 0) {
      return userSkills.slice(0, 4);
    }

    if (popularSkills.length > 0) {
      return popularSkills;
    }

    return [
      "React",
      "Node.js",
      "JavaScript",
    ];
  }, [
    userSkills,
    popularSkills,
  ]);

  // =====================================================
  // CAREER PROGRESS
  // =====================================================

  const careerProgress = useMemo(() => {
    if (user) {
      return getProfileProgress(user);
    }

    if (totalJobs === 0) {
      return 0;
    }

    return Math.min(
      95,
      Math.max(
        35,
        Math.round(
          (totalJobs /
            Math.max(
              totalJobs,
              20
            )) *
            100
        )
      )
    );
  }, [user, totalJobs]);

  // =====================================================
  // SKILL MATCH
  // =====================================================

  const skillMatch = useMemo(() => {
    if (!featuredJob) {
      return 0;
    }

    const jobSkills =
      featuredJob.skills;

    if (
      !jobSkills.length ||
      !userSkills.length
    ) {
      return Math.min(
        95,
        Math.max(
          40,
          careerProgress
        )
      );
    }

    const userSkillNames =
      userSkills.map((skill) =>
        String(skill).toLowerCase()
      );

    const matched =
      jobSkills.filter((skill) => {
        const jobSkill =
          String(skill).toLowerCase();

        return userSkillNames.some(
          (userSkill) =>
            userSkill.includes(
              jobSkill
            ) ||
            jobSkill.includes(
              userSkill
            )
        );
      }).length;

    return Math.round(
      (matched /
        jobSkills.length) *
        100
    );
  }, [
    featuredJob,
    userSkills,
    careerProgress,
  ]);

  // =====================================================
  // POPULAR CATEGORY
  // =====================================================

  const popularCategory = useMemo(() => {
    const counter = {};

    jobs.forEach((job) => {
      const category =
        job.category || "Career";

      counter[category] =
        (counter[category] || 0) + 1;
    });

    const sorted =
      Object.entries(counter).sort(
        (a, b) => b[1] - a[1]
      );

    return (
      sorted[0]?.[0] ||
      "Career Growth"
    );
  }, [jobs]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const openJobs = () => {
    navigate("/jobs");
  };

  const openCompanies = () => {
    navigate("/companies");
  };

  const openProfile = () => {
    if (user) {
      navigate(
        "/candidate/profile"
      );
    } else {
      navigate("/login");
    }
  };

  const openFeaturedJob = () => {
    if (!featuredJob?.id) {
      navigate("/jobs");
      return;
    }

    navigate(
      `/jobs/${featuredJob.id}`
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[560px]">

      {/* ============================================
          SOFT BACKGROUND GLOW
      ============================================ */}

      <div className="pointer-events-none absolute right-0 top-5 h-[360px] w-[360px] rounded-full bg-blue-100/70 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-10 h-52 w-52 rounded-full bg-cyan-100/70 blur-3xl" />

      {/* ============================================
          MAIN CIRCLE
      ============================================ */}

      <div className="absolute left-1/2 top-[55px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-50 via-white to-cyan-100 shadow-inner" />

      <div className="absolute left-1/2 top-[80px] h-[305px] w-[305px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-300/50" />

      {/* ============================================
          DOTS
      ============================================ */}

      <div className="absolute left-[65px] top-[125px] grid grid-cols-3 gap-2 opacity-60">
        {Array.from({
          length: 9,
        }).map((_, index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-blue-400"
          />
        ))}
      </div>

      <div className="absolute bottom-[80px] right-[75px] grid grid-cols-3 gap-2 opacity-60">
        {Array.from({
          length: 9,
        }).map((_, index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-cyan-300"
          />
        ))}
      </div>

      {/* ============================================
          CENTER CAREER VISUAL
      ============================================ */}

      <button
        type="button"
        onClick={openFeaturedJob}
        className="absolute left-1/2 top-[100px] z-20 flex h-[285px] w-[215px] -translate-x-1/2 flex-col items-center justify-center text-center"
      >

        {/* Sparkle */}

        <div className="absolute right-[-5px] top-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-xl">
          <Sparkles size={17} />
        </div>

        {/* Graduation icon */}

        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-8 border-white/80 bg-gradient-to-br from-cyan-300 to-blue-400 shadow-xl">
          <GraduationCap
            size={46}
            className="text-white"
            strokeWidth={1.5}
          />
        </div>

        {/* Laptop */}

        <div className="relative mt-[-2px]">

          <div className="flex h-[88px] w-[150px] items-center justify-center rounded-t-2xl border-[4px] border-slate-800 bg-white shadow-2xl">

            <div className="h-[66px] w-[120px] rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-2">

              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              </div>

              <p className="mt-1.5 truncate text-left text-[8px] font-bold text-blue-700">
                {loading
                  ? "Finding jobs..."
                  : featuredJob?.title ||
                    "Find your dream job"}
              </p>

              <div className="mt-1.5 h-1 w-16 rounded-full bg-blue-400" />

              <div className="mt-1.5 h-1 w-20 rounded-full bg-blue-100" />

              <div className="mt-2 grid grid-cols-3 gap-1">
                <div className="h-5 rounded bg-blue-100" />
                <div className="h-5 rounded bg-cyan-100" />
                <div className="h-5 rounded bg-indigo-100" />
              </div>

            </div>
          </div>

          <div className="mx-auto h-3 w-[175px] rounded-b-full bg-slate-700 shadow-lg" />

        </div>

        {/* Job information */}

        <div className="mt-3 max-w-[200px]">

          <p className="text-[9px] font-bold uppercase tracking-wider text-blue-100">
            {featuredJob?.category ||
              popularCategory}
          </p>

          <p className="mt-1 line-clamp-1 text-xs font-extrabold text-white">
            {featuredJob?.title ||
              "Find Your Dream Job"}
          </p>

          {featuredJob && (
            <p className="mt-1 flex items-center justify-center gap-1 text-[9px] text-blue-100">
              <MapPin size={9} />
              {featuredJob.location}
            </p>
          )}

        </div>

      </button>

      {/* ============================================
          JOB OPPORTUNITIES CARD
      ============================================ */}

      <button
        type="button"
        onClick={openJobs}
        className="absolute left-0 top-[120px] z-30 w-[190px] rounded-2xl border border-white bg-white/95 p-3.5 text-left shadow-xl shadow-blue-100 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >

        <div className="flex items-center gap-2.5">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BriefcaseBusiness
              size={19}
            />
          </div>

          <div className="min-w-0">

            <p className="text-[10px] font-medium text-gray-400">
              Job Opportunities
            </p>

            <p className="mt-1 truncate text-xs font-extrabold text-gray-900">
              {loading
                ? "Loading..."
                : `${totalJobs} Jobs Available`}
            </p>

          </div>

          <ArrowUpRight
            size={15}
            className="ml-auto shrink-0 text-gray-300"
          />

        </div>

        <div className="mt-3 flex items-center justify-between">

          <div className="flex -space-x-2">

            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white">
              <BriefcaseBusiness
                size={9}
              />
            </div>

            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-cyan-500 text-white">
              <Users size={9} />
            </div>

            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-white">
              <Building2 size={9} />
            </div>

          </div>

          <span className="text-[9px] font-semibold text-gray-500">
            Explore jobs
          </span>

        </div>

      </button>

      {/* ============================================
          CAREER GROWTH
      ============================================ */}

      <button
        type="button"
        onClick={openJobs}
        className="absolute right-0 top-[45px] z-30 w-[175px] rounded-2xl border border-white bg-white/95 p-3.5 text-left shadow-xl shadow-blue-100 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >

        <div className="flex items-center justify-between">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp size={18} />
          </div>

          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
            {careerProgress}%
          </span>

        </div>

        <p className="mt-2 text-[10px] font-medium text-gray-400">
          Career Growth
        </p>

        <p className="mt-1 truncate text-xs font-extrabold text-gray-900">
          {popularCategory}
        </p>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-700"
            style={{
              width: `${careerProgress}%`,
            }}
          />
        </div>

        <p className="mt-1.5 text-[9px] font-medium text-gray-400">
          {user
            ? "Profile progress"
            : "Explore & grow"}
        </p>

      </button>

      {/* ============================================
          SKILLS CARD
      ============================================ */}

      <button
        type="button"
        onClick={openProfile}
        className="absolute bottom-[42px] right-[5px] z-30 w-[180px] rounded-2xl border border-white bg-white/95 p-3.5 text-left shadow-xl shadow-blue-100 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >

        <div className="flex items-center gap-2.5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Code2 size={18} />
          </div>

          <div className="min-w-0">

            <p className="text-[9px] text-gray-400">
              {user
                ? "Your Skills"
                : "Popular Skills"}
            </p>

            <p className="truncate text-xs font-extrabold text-gray-900">
              Grow & Learn
            </p>

          </div>

        </div>

        <div className="mt-2.5 flex flex-wrap gap-1">

          {displaySkills
            .slice(0, 4)
            .map(
              (skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold text-blue-600"
                >
                  {skill}
                </span>
              )
            )}

        </div>

      </button>

      {/* ============================================
          COMPANIES
      ============================================ */}

      <button
        type="button"
        onClick={openCompanies}
        className="absolute bottom-[35px] left-[10px] z-30 flex items-center gap-2.5 rounded-2xl border border-white bg-white/95 px-3.5 py-2.5 text-left shadow-xl shadow-blue-100 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
          <Building2 size={18} />
        </div>

        <div>

          <p className="text-[9px] font-medium text-gray-400">
            Companies
          </p>

          <p className="text-xs font-extrabold text-gray-900">
            {loading
              ? "Loading..."
              : `${totalCompanies}+ Companies`}
          </p>

        </div>

      </button>

      {/* ============================================
          SKILL MATCH
      ============================================ */}

      <div className="absolute left-[95px] top-[18px] z-40 flex items-center gap-1.5 rounded-full border border-white bg-white/95 px-2.5 py-1.5 shadow-lg">

        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2
            size={12}
          />
        </div>

        <span className="text-[9px] font-bold text-gray-700">
          {skillMatch}% Match
        </span>

      </div>

      {/* ============================================
          SEARCH BADGE
      ============================================ */}

      <button
        type="button"
        onClick={openJobs}
        className="absolute bottom-[145px] left-[-5px] z-40 flex items-center gap-1.5 rounded-xl border border-blue-100 bg-white px-2.5 py-2 shadow-lg transition hover:-translate-y-1"
      >

        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Search size={12} />
        </div>

        <div className="text-left">

          <p className="text-[8px] text-gray-400">
            Search
          </p>

          <p className="text-[9px] font-bold text-gray-800">
            Find next role
          </p>

        </div>

      </button>

      {/* ============================================
          LOADING
      ============================================ */}

      {loading && (
        <div className="absolute bottom-2 right-[185px] z-40 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-semibold text-gray-500 shadow-lg">

          <Loader2
            size={12}
            className="animate-spin text-blue-600"
          />

          Loading jobs...

        </div>
      )}

    </div>
  );
};

export default CareerHeroVisual;