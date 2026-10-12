
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { API_BASE } from "../config/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // FORM DATA
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // PROTECTED ROUTE REDIRECT
  const redirectPath = location.state?.from || null;

  // LOGIN API
  const LOGIN_API = `${API_BASE}/auth/login.php`;

  // REMEMBERED EMAIL
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberStatus =
      localStorage.getItem("rememberMe") === "true";

    if (rememberStatus && rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));

      setRememberMe(true);
    }
  }, []);

  // TOAST
  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // CLEAR OLD SESSION
  const clearOldSession = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("id");
    localStorage.removeItem("userId");
    localStorage.removeItem("user_id");

    localStorage.removeItem("loginUpdated");

    sessionStorage.removeItem("recruiterSession");
  };

  // SAVE LOGIN SESSION
  // Token API response se separately receive hota hai.
  const saveLoginSession = (user, token) => {
    const role = String(user?.role || "")
      .toLowerCase()
      .trim();

    // PROFILE IMAGE
    const userData = {
      ...user,
      role,
      profile_image:
        user?.profile_image ||
        user?.profileImage ||
        user?.image ||
        user?.photo ||
        user?.avatar ||
        null,
    };

    // COMPLETE USER OBJECT
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    // LOGIN STATUS
    localStorage.setItem("isLoggedIn", "true");

    // USER IDS
    if (userData?.id) {
      localStorage.setItem("id", String(userData.id));
      localStorage.setItem("userId", String(userData.id));
      localStorage.setItem("user_id", String(userData.id));
    }

    // JWT TOKEN SETUP
    if (typeof token === "string" && token.trim() !== "") {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      throw new Error(
        "JWT token API response mein nahi mila."
      );
    }

    // RECRUITER SESSION
    if (role === "recruiter") {
      sessionStorage.setItem("recruiterSession", "true");
    } else {
      sessionStorage.removeItem("recruiterSession");
    }

    // REMEMBER ME
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem(
        "rememberedEmail",
        formData.email.trim()
      );
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberedEmail");
    }

    // LOGIN UPDATE
    localStorage.setItem(
      "loginUpdated",
      Date.now().toString()
    );

    // HEADER UPDATE
    window.dispatchEvent(new Event("loginUpdated"));

    // DEBUG: Actual token console mein expose nahi karte.
    console.log("Login session saved:", {
      userId: userData.id,
      role,
      tokenSaved: Boolean(localStorage.getItem("token")),
      profileImage: userData.profile_image,
    });
  };

  // REDIRECT USER
  const redirectUser = (user) => {
    const role = String(user?.role || "")
      .toLowerCase()
      .trim();

    // RECRUITER - ORIGINAL PROTECTED ROUTE
    if (
      redirectPath &&
      role === "recruiter" &&
      redirectPath.startsWith("/recruiter")
    ) {
      navigate(redirectPath, {
        replace: true,
      });
      return;
    }

    // CANDIDATE - ORIGINAL PROTECTED ROUTE
    if (
      redirectPath &&
      role === "candidate" &&
      redirectPath.startsWith("/candidate")
    ) {
      navigate(redirectPath, {
        replace: true,
      });
      return;
    }

    // RECRUITER DEFAULT
    if (role === "recruiter") {
      navigate("/recruiter/dashboard", {
        replace: true,
      });
      return;
    }

    // CANDIDATE DEFAULT
    if (role === "candidate") {
      navigate("/candidate/dashboard", {
        replace: true,
      });
      return;
    }

    // UNKNOWN ROLE
    navigate("/", {
      replace: true,
    });
  };

  // LOGIN SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    // VALIDATION
    if (!email || !password) {
      showToast(
        "warning",
        "Please enter email and password."
      );
      return;
    }

    try {
      setLoading(true);

      // CLEAR PREVIOUS SESSION
      clearOldSession();

      // LOGIN API
      console.log("Login API:", LOGIN_API);

      const response = await axios.post(
        LOGIN_API,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Do not print the actual JWT token in console.
      console.log("Login Response:", {
        ...response.data,
        token: response.data?.token
          ? "[TOKEN RECEIVED]"
          : undefined,
      });

      // LOGIN SUCCESS
      if (response.data?.success) {
        const user = response.data?.user;
        const token = response.data?.token;

        // USER INFORMATION MISSING
        if (!user) {
          showToast(
            "error",
            "User information was not returned by server."
          );
          return;
        }

        // TOKEN MISSING
        if (
          typeof token !== "string" ||
          token.trim() === ""
        ) {
          console.error(
            "JWT token missing from login API response."
          );

          showToast(
            "error",
            "JWT token missing. Please check PHP login.php."
          );
          return;
        }

        // NORMALIZE ROLE
        user.role = String(user.role || "")
          .toLowerCase()
          .trim();

        // USER INFORMATION LOG
        console.log("Logged in user:", user);
        console.log("User ID:", user.id);
        console.log("Candidate ID:", user.candidate_id);
        console.log("User role:", user.role);
        console.log("Profile Image:", user.profile_image);

        // SAVE USER AND TOKEN
        saveLoginSession(user, token);

        // SUCCESS MESSAGE
        showToast(
          "success",
          `Sign in successful! Welcome ${user?.name || ""}`
        );

        // REDIRECT
        setTimeout(() => {
          redirectUser(user);
        }, 800);

        return;
      }

      // LOGIN FAILED
      const message = String(
        response.data?.message || ""
      ).toLowerCase();

      // ACCOUNT NOT FOUND
      if (
        message.includes("account not found") ||
        message.includes("register first") ||
        message.includes("user not found") ||
        message.includes("email not registered")
      ) {
        showToast(
          "warning",
          "Account not found. Please register first."
        );

        setTimeout(() => {
          navigate("/register");
        }, 1000);

        return;
      }

      // OTHER LOGIN ERROR
      showToast(
        "error",
        response.data?.message ||
          "Invalid email or password."
      );
    } catch (error) {
      console.error("Login Error:", error);
      console.error(
        "Login Error Response:",
        error.response?.data
      );

      showToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Unable to connect with the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
            {/* TITLE */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Login to your Job Portal account
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  {/* EYE BUTTON */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER + FORGOT */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remember Me
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  disabled={loading}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* REGISTER */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/register")}
                disabled={loading}
                className="font-semibold text-blue-600 hover:underline"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;