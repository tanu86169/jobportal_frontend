import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  UserRound,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import API_BASE from "../Config/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "job-seeker",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setRequestError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Please accept Terms & Conditions";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading || !validateForm()) return;

  try {
    setLoading(true);
    setRequestError("");
    const response = await axios.post(
      `${API_BASE}/auth/register.php`,
      {
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role === "job-seeker" ? "candidate" : "recruiter",
      }
    );

    if (response.data.success) {
      navigate("/login");
    } else {
      setRequestError(response.data.message || "Registration could not be completed.");
    }
  } catch (error) {
    setRequestError(
      error.response?.data?.message ||
        "Could not connect to the registration service. Check the API URL and try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* LEFT SECTION */}
        <div className="hidden lg:flex bg-blue-600 text-white p-12 flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                <BriefcaseBusiness className="w-6 h-6 text-blue-600" />
              </div>

              <span className="text-2xl font-bold">
                Job<span className="text-cyan-200">Portal</span>
              </span>
            </Link>

            <h1 className="text-4xl font-bold leading-tight mb-5">
              Build your career.
              <br />
              Find your next opportunity.
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed">
              Create your account and connect with thousands of companies and
              job opportunities.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-200" />
              <span>Find jobs matching your skills</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-200" />
              <span>Apply to jobs easily</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-200" />
              <span>Connect with top companies</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="p-6 sm:p-10 lg:p-12">
          {/* Mobile Logo */}
          <div className="flex justify-center lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <BriefcaseBusiness className="w-5 h-5 text-white" />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                Job<span className="text-blue-600">Portal</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>

            <p className="text-gray-500 mt-2">
              Join JobPortal and start your journey today.
            </p>
          </div>

          {requestError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {requestError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    errors.fullName ? "border-red-400" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    errors.email ? "border-red-400" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    errors.phone ? "border-red-400" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border ${
                    errors.password ? "border-red-400" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* ROLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I am:
              </label>

              <div className="grid grid-cols-2 gap-4">
                {/* JOB SEEKER */}
                <label
                  className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition ${
                    formData.role === "job-seeker"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="job-seeker"
                    checked={formData.role === "job-seeker"}
                    onChange={handleChange}
                    className="accent-blue-600"
                  />

                  <UserRound
                    className={`w-5 h-5 ${
                      formData.role === "job-seeker"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />

                  <span className="font-medium text-gray-700">Job Seeker</span>
                </label>

                {/* RECRUITER */}
                <label
                  className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition ${
                    formData.role === "recruiter"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={formData.role === "recruiter"}
                    onChange={handleChange}
                    className="accent-blue-600"
                  />

                  <BriefcaseBusiness
                    className={`w-5 h-5 ${
                      formData.role === "recruiter"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />

                  <span className="font-medium text-gray-700">Recruiter</span>
                </label>
              </div>
            </div>

            {/* TERMS */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 accent-blue-600"
                />

                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </span>
              </label>

              {errors.agreeTerms && (
                <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>
              )}
            </div>

            {/* CREATE ACCOUNT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* LOGIN */}
          <p className="text-center text-sm text-gray-500 mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
