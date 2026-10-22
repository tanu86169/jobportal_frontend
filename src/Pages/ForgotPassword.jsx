import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import API_BASE from "../Config/api";

const RESET_PASSWORD_API = `${API_BASE}/auth/reset-password.php`;

const initialFormData = {
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [step, setStep] = useState("email");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setCooldown((remaining) => Math.max(remaining - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value,
    }));
    setError("");
    setMessage("");
  };

  const postAction = async (action, payload) => {
    const response = await axios.post(RESET_PASSWORD_API, {
      action,
      ...payload,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Request could not be completed.");
    }

    return response.data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (loading) return;

    if (step === "email" && !formData.email.trim()) {
      setError("Enter your registered email address.");
      return;
    }

    if (step === "otp" && !/^\d{6}$/.test(formData.otp)) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }

    if (step === "reset") {
      if (formData.newPassword.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (new TextEncoder().encode(formData.newPassword).length > 72) {
        setError("Password must not exceed 72 bytes.");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      if (step === "email") {
        const result = await postAction("send_otp", {
          email: formData.email.trim(),
        });
        setStep("otp");
        setCooldown(Number(result.retry_after) || 60);
        setMessage(
          result.message ||
            "If an account exists for that email, a verification code has been sent."
        );
        return;
      }

      if (step === "otp") {
        const result = await postAction("verify_otp", {
          email: formData.email.trim(),
          otp: formData.otp,
        });

        if (!result.reset_token) {
          throw new Error("Reset authorization was not returned. Request a new code.");
        }

        setResetToken(result.reset_token);
        setFormData((previous) => ({
          ...previous,
          otp: "",
        }));
        setStep("reset");
        setMessage("Email verified. You can now choose a new password.");
        return;
      }

      await postAction("reset_password", {
        reset_token: resetToken,
        new_password: formData.newPassword,
      });

      setMessage("Password reset successfully. Redirecting to login…");
      setResetToken("");
      setFormData(initialFormData);
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to complete this request. Please try again."
      );

      if (requestError.response?.status === 429) {
        setCooldown(
          Math.max(
            Number(requestError.response?.data?.retry_after) || 60,
            1
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (loading || cooldown > 0) return;

    setError("");
    setMessage("");

    try {
      setLoading(true);
      const result = await postAction("send_otp", {
        email: formData.email.trim(),
      });
      setFormData((previous) => ({
        ...previous,
        otp: "",
      }));
      setCooldown(Number(result.retry_after) || 60);
      setMessage(
        result.message ||
          "If an account exists for that email, a new verification code has been sent."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to resend the code. Please try again."
      );

      if (requestError.response?.status === 429) {
        setCooldown(
          Math.max(
            Number(requestError.response?.data?.retry_after) || 60,
            1
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const editEmail = () => {
    setStep("email");
    setResetToken("");
    setCooldown(0);
    setFormData((previous) => ({
      ...previous,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setError("");
    setMessage("");
  };

  const stepTitle = {
    email: "Reset password",
    otp: "Verify your email",
    reset: "Choose a new password",
  }[step];

  const stepDescription = {
    email: "Enter your registered email and we’ll send a one-time verification code.",
    otp: "Enter the 6-digit code sent to your email. The code expires in 10 minutes.",
    reset: "Your email is verified. Create a new password for your account.",
  }[step];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl lg:grid-cols-2">
          <div className="hidden flex-col justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-10 text-white lg:flex">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <ShieldCheck size={34} />
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Secure your account
            </h1>

            <p className="mt-5 text-base leading-7 text-blue-100">
              Verify your email with a one-time code, then securely choose a
              new password.
            </p>

            <div className="mt-8 space-y-4 text-sm text-blue-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                <span>Request a code at your registered email</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                <span>Verify the code before changing your password</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} />
                <span>Use a one-time reset authorization</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <Link
              to="/login"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to login
            </Link>

            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                {step === "email" ? (
                  <LockKeyhole size={27} />
                ) : step === "otp" ? (
                  <Mail size={27} />
                ) : (
                  <ShieldCheck size={27} />
                )}
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {stepTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {stepDescription}
              </p>
            </div>

            {message && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoComplete="email"
                    required
                    maxLength={254}
                    readOnly={step !== "email"}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 read-only:text-slate-500"
                  />
                </div>
              </div>

              {step === "otp" && (
                <>
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      6-digit verification code
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter code"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-lg tracking-[0.5em] text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={loading || cooldown > 0}
                      className="font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {loading
                        ? "Sending..."
                        : cooldown > 0
                          ? `Resend code in ${cooldown}s`
                          : "Resend code"}
                    </button>
                    <button
                      type="button"
                      onClick={editEmail}
                      disabled={loading}
                      className="font-medium text-slate-500 hover:text-blue-600 disabled:opacity-50"
                    >
                      Change email
                    </button>
                  </div>
                </>
              )}

              {step === "reset" && (
                <>
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
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        required
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="shrink-0 text-slate-400 transition hover:text-blue-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

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
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
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
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? step === "email"
                    ? "Sending code..."
                    : step === "otp"
                      ? "Verifying code..."
                      : "Resetting password..."
                  : step === "email"
                    ? "Send verification code"
                    : step === "otp"
                      ? "Verify code"
                      : "Reset password"}
              </button>
            </form>

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
