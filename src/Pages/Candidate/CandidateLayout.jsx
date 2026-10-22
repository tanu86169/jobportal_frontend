import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UserRound,
  Search,
  Bookmark,
  BriefcaseBusiness,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

const isCandidateRole = (value) => {
  const role = String(value ?? "")
    .trim()
    .toLowerCase();

  return role === "candidate" || role === "job-seeker";
};

const CandidateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  /* =========================================================
     GET LOGGED-IN USER
  ========================================================= */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser?.id || !isCandidateRole(parsedUser?.role)) {
        navigate("/login");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("User Error:", error);
      navigate("/login");
    }
  }, [navigate]);

  /* =========================================================
     LOGOUT
  ========================================================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("id");
    localStorage.removeItem("userId");
    localStorage.removeItem("user_id");

    navigate("/login");
  };

  /* =========================================================
     SIDEBAR ITEMS
  ========================================================= */
  const sidebarItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/candidate/dashboard",
    },
    {
      label: "My Profile",
      icon: UserRound,
      path: "/candidate/profile",
    },
    {
      label: "Find Jobs",
      icon: Search,
      path: "/jobs",
    },
    {
      label: "Saved Jobs",
      icon: Bookmark,
      path: "/candidate/saved-jobs",
    },
    {
      label: "My Applications",
      icon: BriefcaseBusiness,
      path: "/candidate/applications",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/candidate/messages",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/candidate/notifications",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/candidate/settings",
    },
  ];

  /* =========================================================
     SIDEBAR
  ========================================================= */
  const Sidebar = () => (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl bg-white">
      {/* =====================================================
          USER PROFILE
      ===================================================== */}
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-base font-bold text-white shadow-md shadow-blue-100">
            {user?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name || "Candidate"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Candidate account
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MENU TITLE
      ===================================================== */}
      <div className="px-5 pb-2 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Candidate Menu
        </p>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            location.pathname === item.path ||
            (item.path === "/jobs" &&
              location.pathname.startsWith("/jobs"));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenu(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
              )}

              {/* Icon */}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
              </span>

              {/* Label */}
              <span className="truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* =====================================================
          LOGOUT
      ===================================================== */}
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all duration-200 group-hover:bg-red-100">
            <LogOut size={17} />
          </span>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  /* =========================================================
     LOADING
  ========================================================= */
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-600">
            Loading candidate panel...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN LAYOUT
  ========================================================= */
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* =====================================================
          TOP HEADER
      ===================================================== */}
      <Header />

      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}
      <div className="border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenu(true)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-blue-600"
        >
          <Menu size={20} />

          <span>Menu</span>
        </button>
      </div>

      {/* =====================================================
          SIDEBAR + CONTENT
      ===================================================== */}
      <div className="flex flex-1">
        {/* ===================================================
            DESKTOP SIDEBAR
        =================================================== */}
        <div className="hidden w-[300px] shrink-0 px-4 py-5 lg:block">
          <div className="sticky top-[92px] h-[calc(100vh-112px)]">
            <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
              <Sidebar />
            </div>
          </div>
        </div>

        {/* ===================================================
            MOBILE SIDEBAR
        =================================================== */}
        {mobileMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
              onClick={() => setMobileMenu(false)}
            />

            {/* Drawer */}
            <div className="fixed bottom-4 left-4 top-4 z-50 w-[calc(100%-2rem)] max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl lg:hidden">
              {/* Mobile Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenu(false)}
                  className="text-xl font-extrabold text-blue-600"
                >
                  Job
                  <span className="text-slate-900">
                    Portal
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenu(false)}
                  className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Sidebar */}
              <div className="h-[calc(100%-73px)]">
                <Sidebar />
              </div>
            </div>
          </>
        )}

        {/* ===================================================
            MAIN CONTENT
        =================================================== */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="w-full flex-1 p-4 sm:p-6 lg:p-7 xl:p-8">
            <Outlet context={{ user }} />
          </main>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <Footer />
    </div>
  );
};

export default CandidateLayout;