
import React, { useEffect, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  Menu,
  X,
  User,
  Heart,
  BriefcaseBusiness,
  ChevronDown,
  LogOut,
  Building2,
  FileText,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";

import API_BASE from "../Config/api";

// BACKEND ROOT - FIXED
const API_ROOT = String(API_BASE || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

// ADMIN SETTINGS API
const API_URL = `${String(API_BASE || "").replace(/\/+$/, "")}/admin/settings.php`;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // STATES
  // =====================================================

  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [siteName, setSiteName] = useState("JobPortal");

  // =====================================================
  // GET SITE SETTINGS
  // =====================================================

  const loadSiteSettings = async () => {
    try {
      const response = await axios.get(API_URL);

      if (response.data?.success) {
        const fetchedSettings = Array.isArray(
          response.data.settings
        )
          ? response.data.settings
          : [];

        const siteNameSetting = fetchedSettings.find(
          (item) => item.setting_key === "site_name"
        );

        if (siteNameSetting?.setting_value) {
          setSiteName(siteNameSetting.setting_value);
        }
      }
    } catch (error) {
      console.error("HEADER SETTINGS ERROR:", error);
      setSiteName("JobPortal");
    }
  };

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const loadUser = () => {
    try {
      const loggedIn =
        localStorage.getItem("isLoggedIn") === "true";

      const storedUser = localStorage.getItem("user");

      console.log("HEADER LOGIN STATUS:", loggedIn);
      console.log("HEADER STORED USER:", storedUser);

      if (!loggedIn || !storedUser) {
        setUser(null);
        setIsLoggedIn(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      console.log("HEADER USER OBJECT:", parsedUser);
      console.log(
        "HEADER PROFILE IMAGE:",
        parsedUser?.profile_image
      );

      setUser(parsedUser);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("HEADER USER ERROR:", error);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // =====================================================
  // LOAD HEADER DATA
  // =====================================================

  useEffect(() => {
    loadUser();
    loadSiteSettings();

    // Login ke baad same tab me update
    const handleLoginUpdate = () => {
      console.log("HEADER: loginUpdated event received");
      loadUser();
    };

    // Other tab se localStorage update
    const handleStorage = () => {
      console.log("HEADER: storage event received");
      loadUser();
    };

    window.addEventListener("loginUpdated", handleLoginUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "loginUpdated",
        handleLoginUpdate
      );

      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // =====================================================
  // CLOSE MENUS WHEN ROUTE CHANGES
  // =====================================================

  useEffect(() => {
    setProfileMenu(false);
    setMobileMenu(false);
  }, [location.pathname]);

  // =====================================================
  // GET FIRST LETTER
  // =====================================================

  const getInitial = (name = "") => {
    return String(name).trim().charAt(0).toUpperCase() || "U";
  };

  // =====================================================
  // GET PROFILE IMAGE
  // =====================================================

  const getProfileImage = () => {
    if (!user) {
      return "";
    }

    const image =
      user?.profile_image ||
      user?.profileImage ||
      user?.image ||
      user?.photo ||
      user?.avatar ||
      user?.profile_photo ||
      "";

    console.log("HEADER getProfileImage():", image);

    return String(image).trim();
  };

  // =====================================================
  // GET CURRENT BACKEND ROOT - FIXED
  // =====================================================

  const getCurrentApiRoot = () => {
    return API_ROOT;
  };

  // =====================================================
  // CREATE IMAGE URL - FIXED
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    let imagePath = String(image).trim();

    if (!imagePath) {
      return "";
    }

    // DATA URL
    if (imagePath.startsWith("data:")) {
      return imagePath;
    }

    // BACKEND PATH
    const backendMarker = "/job_portal/job-portal-api/";

    if (imagePath.includes(backendMarker)) {
      const parts = imagePath.split(backendMarker);
      const relativePath = parts[1];

      if (relativePath) {
        const finalUrl = `${getCurrentApiRoot()}/${relativePath
          .replace(/^\/+/, "")
          .replace(/\\/g, "/")}`;

        console.log("HEADER FINAL IMAGE URL:", finalUrl);

        return finalUrl;
      }
    }

    // HTTP / HTTPS URL
    if (/^https?:\/\//i.test(imagePath)) {
      console.log("HEADER EXTERNAL IMAGE URL:", imagePath);
      return imagePath;
    }

    // RELATIVE PATH
    imagePath = imagePath
      .replace(/^\/+/, "")
      .replace(/\\/g, "/");

    const finalUrl = `${getCurrentApiRoot()}/${imagePath}`;

    console.log("HEADER RELATIVE IMAGE URL:", finalUrl);

    return finalUrl;
  };

  // =====================================================
  // PROFILE AVATAR
  // =====================================================

  const ProfileAvatar = ({
    size = "small",
    className = "",
  }) => {
    const image = getProfileImage();
    const imageUrl = getImageUrl(image);

    const sizeClasses =
      size === "large" ? "h-12 w-12" : "h-10 w-10";

    return (
      <div
        className={`
          ${sizeClasses}
          flex
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-full
          bg-blue-600
          font-bold
          text-white
          shadow-sm
          ${className}
        `}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={user?.name || "User"}
            className="h-full w-full object-cover"
            onLoad={() => {
              console.log(
                "HEADER PROFILE IMAGE LOADED:",
                imageUrl
              );
            }}
            onError={(event) => {
              console.error(
                "HEADER PROFILE IMAGE FAILED:",
                imageUrl
              );

              event.currentTarget.style.display = "none";

              const fallback =
                event.currentTarget.nextElementSibling;

              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
          />
        ) : null}

        <span
          className="items-center justify-center"
          style={{
            display: imageUrl ? "none" : "flex",
          }}
        >
          {getInitial(user?.name)}
        </span>
      </div>
    );
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileMenu(false);
    setProfileMenu(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    [
      "user",
      "token",
      "isLoggedIn",
      "userId",
      "user_id",
      "id",
      "recruiterSession",
      "rememberMe",
    ].forEach((key) => {
      localStorage.removeItem(key);
    });

    setUser(null);
    setIsLoggedIn(false);
    setProfileMenu(false);
    setMobileMenu(false);

    window.dispatchEvent(new Event("loginUpdated"));

    navigate("/login");
  };

  // =====================================================
  // POST A JOB
  // =====================================================

  const handlePostJob = () => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: "/recruiter/post-job",
        },
      });

      return;
    }

    if (user?.role !== "recruiter") {
      alert("Only recruiters can post a job.");
      return;
    }

    navigate("/recruiter/post-job");
  };

  // =====================================================
  // NAVIGATION LINKS
  // =====================================================

  const navLinks = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Find Jobs",
      path: "/jobs",
    },
    {
      name: "Companies",
      path: "/companies",
    },
    {
      name: "About",
      path: "/about",
    },
  ];

  // =====================================================
  // ACTIVE LINK
  // =====================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  // =====================================================
  // USER MENU LINKS
  // =====================================================

  const userMenuLinks =
    user?.role === "recruiter"
      ? [
          {
            name: "Dashboard",
            path: "/recruiter/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Company Profile",
            path: "/recruiter/company-profile",
            icon: Building2,
          },
          {
            name: "My Jobs",
            path: "/recruiter/my-jobs",
            icon: BriefcaseBusiness,
          },
        ]
      : user?.role === "candidate"
      ? [
          {
            name: "My Profile",
            path: "/candidate/profile",
            icon: UserCircle,
          },
          {
            name: "Saved Jobs",
            path: "/candidate/saved-jobs",
            icon: Heart,
          },
          {
            name: "My Applications",
            path: "/candidate/applications",
            icon: FileText,
          },
        ]
      : [];

  // =====================================================
  // USER INFO
  // =====================================================

  const UserInfo = () => (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
      <ProfileAvatar size="large" />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {user?.name || "User"}
        </p>

        <p className="truncate text-xs text-gray-500">
          {user?.email || ""}
        </p>

        <p className="mt-0.5 text-xs font-medium capitalize text-blue-600">
          {user?.role || "User"}
        </p>
      </div>
    </div>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LOGO */}

          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-none text-gray-900">
                {siteName}
              </h1>

              <p className="mt-1 hidden text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:block">
                Find your next opportunity
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  relative py-5 text-sm font-medium transition
                  ${
                    isActive(link.path)
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }
                `}
              >
                {link.name}

                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
                )}
              </Link>
            ))}
          </nav>

          {/* DESKTOP RIGHT */}

          <div className="hidden items-center gap-3 lg:flex">
            {/* SAVED / MY JOBS */}

            <Link
              to={
                user?.role === "recruiter"
                  ? "/recruiter/my-jobs"
                  : "/candidate/saved-jobs"
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
              title={
                user?.role === "recruiter"
                  ? "My Jobs"
                  : "Saved Jobs"
              }
            >
              <Heart size={19} />
            </Link>

            <div className="h-7 w-px bg-gray-200" />

            {/* LOGIN / PROFILE */}

            {!isLoggedIn ? (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <User size={17} />
                Login
              </Link>
            ) : (
              <div className="relative">
                {/* PROFILE BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    setProfileMenu((previous) => !previous)
                  }
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
                  aria-expanded={profileMenu}
                >
                  <ProfileAvatar size="small" />

                  <div className="hidden min-w-0 text-left xl:block">
                    <p className="max-w-[130px] truncate text-sm font-semibold text-gray-800">
                      {user?.name || "User"}
                    </p>

                    <p className="text-xs capitalize text-gray-500">
                      {user?.role || "User"}
                    </p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`
                      text-gray-500 transition-transform
                      ${profileMenu ? "rotate-180" : ""}
                    `}
                  />
                </button>

                {/* PROFILE DROPDOWN */}

                {profileMenu && (
                  <div className="absolute right-0 top-[52px] w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 bg-gray-50 px-4 py-4">
                      <UserInfo />
                    </div>

                    <div className="p-2">
                      {userMenuLinks.map((item) => {
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setProfileMenu(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Icon size={18} />
                            {item.name}
                          </Link>
                        );
                      })}

                      <div className="my-2 border-t border-gray-100" />

                      {/* LOGOUT */}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* POST JOB */}

            <button
              type="button"
              onClick={handlePostJob}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <BriefcaseBusiness size={17} />
              Post a Job
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() => {
              setMobileMenu((previous) => !previous);
              setProfileMenu(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <div className="border-t border-gray-200 bg-white lg:hidden">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              {/* MOBILE NAV */}

              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={`
                      flex items-center rounded-xl px-4 py-3 text-sm font-medium transition
                      ${
                        isActive(link.path)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="my-4 border-t border-gray-200" />

              {/* MOBILE LOGGED IN */}

              {isLoggedIn ? (
                <div className="space-y-2">
                  <UserInfo />

                  {userMenuLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Icon size={18} />
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* POST JOB */}

                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      handlePostJob();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <BriefcaseBusiness size={17} />
                    Post a Job
                  </button>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              ) : (
                /* MOBILE LOGGED OUT */

                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <User size={17} />
                    Login
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      handlePostJob();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <BriefcaseBusiness size={17} />
                    Post a Job
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;