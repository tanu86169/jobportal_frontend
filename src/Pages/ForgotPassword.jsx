import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import API_BASE from "../Config/api";

const RESET_PASSWORD_API = `${API_BASE}/auth/reset-password.php`;


const ForgotPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Enter a valid registered 10-digit phone number.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(RESET_PASSWORD_API, {
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        new_password: formData.newPassword,
      });

      if (!response.data.success) {
        setError(response.data.message || "Unable to reset password.");
        return;
      }

      setMessage(response.data.message || "Password reset successfully!");

      setFormData({
        email: "",
        phone: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl lg:grid-cols-2">

          {/* Left Information Panel */}
          <div className="hidden flex-col justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-10 text-white lg:flex">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <ShieldCheck size={34} />
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Secure your account
            </h1>

            <p className="mt-5 text-base leading-7 text-blue-100">
              Forgot your password? No worries. Reset your password securely
              and get back to your job search journey.
            </p>

            <div className="mt-8 space-y-4 text-sm text-blue-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                <span>Use your registered email</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                <span>Verify your registered phone number</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                <span>Create a new secure password</span>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-6 sm:p-10 lg:p-12">

            {/* Back Link */}
            <Link
              to="/login"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to login
            </Link>

            {/* Heading */}
            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <LockKeyhole size={27} />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Reset password
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your registered details to create a new password.
              </p>
            </div>

            {/* Success Message */}
            {message && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                <span>{message}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Mail size={19} className="shrink-0 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Registered phone number
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <Phone size={19} className="shrink-0 text-slate-400" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <LockKeyhole size={19} className="shrink-0 text-slate-400" />

                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    required
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="shrink-0 text-slate-400 transition hover:text-blue-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm new password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <LockKeyhole size={19} className="shrink-0 text-slate-400" />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={6}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="shrink-0 text-slate-400 transition hover:text-blue-600"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting password..." : "Reset password"}
              </button>
            </form>

            {/* Bottom Link */}
            <p className="mt-7 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;