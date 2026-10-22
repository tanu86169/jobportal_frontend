import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  BriefcaseBusiness,
  Users,
  Search,
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

const RecruiterLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  // =====================================================
  // AUTH CHECK
  // =====================================================
  useEffect(() => {
    const checkRecruiter = () => {
      try {
        const storedUser = localStorage.getItem("user");

        const isLoggedIn =
          localStorage.getItem("isLoggedIn") === "true";

        // User login nahi hai
        if (!storedUser || !isLoggedIn) {
          setUser(null);

          navigate("/login", {
            state: {
              from: location.pathname,
            },
            replace: true,
          });

          return;
        }

        const parsedUser = JSON.parse(storedUser);

        const role = String(parsedUser?.role || "")
          .toLowerCase()
          .trim();

        /*
          User ID different keys me ho sakti hai.
          Main id ko priority de rahe hain.
        */
        const recruiterId =
          parsedUser?.id ||
          parsedUser?.userId ||
          parsedUser?.user_id;

        // Recruiter nahi hai
        if (!recruiterId || role !== "recruiter") {
          setUser(null);

          navigate("/login", {
            state: {
              from: location.pathname,
            },
            replace: true,
          });

          return;
        }

        // Normal recruiter
        setUser(parsedUser);
      } catch (error) {
        console.error(
          "Recruiter authentication error:",
          error
        );

        // Invalid localStorage data clear
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("id");
        localStorage.removeItem("userId");
        localStorage.removeItem("user_id");
        localStorage.removeItem("loginUpdated");

        sessionStorage.removeItem("recruiterSession");

        setUser(null);

        navigate("/login", {
          replace: true,
        });
      }
    };

    checkRecruiter();
  }, [navigate, location.pathname]);

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("id");
    localStorage.removeItem("userId");
    localStorage.removeItem("user_id");
    localStorage.removeItem("loginUpdated");

    sessionStorage.removeItem("recruiterSession");

    setUser(null);
    setMobileMenu(false);

    // Header ko login state immediately update karne ke liye
    window.dispatchEvent(new Event("loginUpdated"));

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // SIDEBAR ITEMS
  // =====================================================
  const sidebarItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/recruiter/dashboard",
    },

    {
      label: "Company Profile",
      icon: Building2,
      path: "/recruiter/company-profile",
    },

    {
      label: "Post a Job",
      icon: PlusCircle,
      path: "/recruiter/post-job",
    },

    {
      label: "Manage Jobs",
      icon: BriefcaseBusiness,
      path: "/recruiter/my-jobs",
    },

    {
      label: "Find Job Seekers",
      icon: Search,
      path: "/recruiter/find-candidates",
    },

    {
      label: "Applicants",
      icon: Users,
      path: "/recruiter/applicants",
    },

    {
      label: "Messages",
      icon: MessageSquare,
      path: "/recruiter/messages",
    },

    {
      label: "Notifications",
      icon: Bell,
      path: "/recruiter/notifications",
    },

    {
      label: "Settings",
      icon: Settings,
      path: "/recruiter/settings",
    },
  ];

  // =====================================================
  // ACTIVE SIDEBAR ITEM
  // =====================================================
  const isItemActive = (path) => {
    if (path === "/recruiter/dashboard") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  // =====================================================
  // SIDEBAR
  // =====================================================
  const Sidebar = () => (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-gray-700 shadow-sm">
      
      {/* =================================================
          LOGO
      ================================================== */}
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 px-5">
        
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5"
          onClick={() => setMobileMenu(false)}
        >
          {/* Logo */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-md shadow-blue-600/20">
            J
          </div>

          {/* Brand */}
          <div className="min-w-0">
            <span className="block truncate text-xl font-extrabold tracking-tight text-gray-900">
              Job
              <span className="text-blue-600">
                Portal
              </span>
            </span>

            <div className="truncate text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Recruiter Hub
            </div>
          </div>
        </Link>

        {/* Mobile Close */}
        <button
          type="button"
          onClick={() => setMobileMenu(false)}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* =================================================
          RECRUITER PROFILE
      ================================================== */}
      <div className="shrink-0 border-b border-gray-100 bg-gray-50/60 p-4">
        <div className="flex min-w-0 items-center gap-3">
          
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-600">
            {user?.name?.charAt(0)?.toUpperCase() || "R"}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.name || "Recruiter"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user?.email || "recruiter@jobportal.com"}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================== */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Management
        </p>

        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenu(false)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/20"
                  : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                
                <Icon
                  size={19}
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-600"
                  }`}
                />

                <span className="truncate">
                  {item.label}
                </span>
              </div>

              {isActive && (
                <span className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* =================================================
          LOGOUT
      ================================================== */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50"
        >
          <LogOut size={19} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  // =====================================================
  // LOADING
  // =====================================================
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-sm font-medium text-gray-600">
            Loading recruiter panel...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN LAYOUT
  // =====================================================
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      {/* =================================================
          WEBSITE HEADER
      ================================================== */}
      <Header />

      {/* =================================================
          BODY
      ================================================== */}
      <div className="relative flex min-w-0 flex-1">

        {/* =================================================
            DESKTOP SIDEBAR

            IMPORTANT:
            w-[288px] + min-w-[288px] + shrink-0
            = sidebar width stable rahegi.
        ================================================== */}
        <div className="sticky top-24 z-30 my-6 ml-6 hidden h-[calc(100vh-7.5rem)] w-[288px] min-w-[288px] shrink-0 lg:block">
          <Sidebar />
        </div>

        {/* =================================================
            MOBILE SIDEBAR OVERLAY
        ================================================== */}
        {mobileMenu && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
              onClick={() => setMobileMenu(false)}
            />

            {/* Sidebar */}
            <div className="fixed bottom-4 left-4 top-20 z-50 w-[288px] max-w-[calc(100vw-2rem)] lg:hidden">
              <Sidebar />
            </div>
          </>
        )}

        {/* =================================================
            MAIN CONTENT

            min-w-0 is important.
            Isse Manage Jobs ki table/sidebar ek dusre
            ko squeeze nahi karenge.
        ================================================== */}
        <main className="min-w-0 flex-1">
          
          <div className="min-w-0 p-4 sm:p-6 lg:p-8">

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              className="mb-4 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
              aria-label="Open Menu"
            >
              <Menu size={20} />
            </button>

            {/* Page Content */}
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>

      {/* =================================================
          FOOTER
      ================================================== */}
      <Footer />
    </div>
  );
};

export default RecruiterLayout;