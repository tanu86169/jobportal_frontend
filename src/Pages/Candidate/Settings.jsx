import React, { useEffect, useState } from "react";

import {
  UserRound,
  Bell,
  ShieldCheck,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  Eye,
  BriefcaseBusiness,
  MessageSquare,
  CalendarDays,
  Search,
  EyeOff,
  Loader2,
} from "lucide-react";

// =====================================================
// API
// =====================================================

import API_BASE from "../../Config/api";

const SETTINGS_API = `${API_BASE}/candidate/settings.php`;

// =====================================================
// COMPONENT
// =====================================================

const CandidateSettings = () => {
  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);

  // =====================================================
  // ACTIVE TAB
  // =====================================================

  const [activeTab, setActiveTab] = useState("account");

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // ALERTS
  // =====================================================

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // ACCOUNT
  // =====================================================

  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    interviewNotifications: true,
    recruiterMessages: true,
    emailNotifications: true,
  });

  // =====================================================
  // PRIVACY
  // =====================================================

  const [profileVisibility, setProfileVisibility] =
    useState(true);

  // =====================================================
  // PASSWORD
  // =====================================================

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (err) {
      console.error("User parse error:", err);
      return null;
    }
  };

  // =====================================================
  // GET CANDIDATE ID
  // =====================================================

  const getCandidateId = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return 0;
    }

    const id =
      currentUser.id ??
      currentUser.userId ??
      currentUser.user_id;

    return Number(id) || 0;
  };

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    loadSettings();
  }, []);

  // =====================================================
  // LOAD FROM API
  // =====================================================

  const loadSettings = async () => {
    setLoading(true);
    setError("");

    try {
      const currentUser = getCurrentUser();
      const candidateId = getCandidateId();

      if (!currentUser || !candidateId) {
        setError(
          "Candidate login information not found. Please login again."
        );

        setLoading(false);
        return;
      }

      // Candidate role check
      if (
        currentUser.role &&
        String(currentUser.role).toLowerCase() !==
          "candidate"
      ) {
        setError(
          "This settings page is only available for candidates."
        );

        setLoading(false);
        return;
      }

      const response = await fetch(
        `${SETTINGS_API}?candidateId=${candidateId}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load candidate settings."
        );
      }

      const candidate = result.data?.candidate || {};
      const settings = result.data?.settings || {};

      // -------------------------------------------------
      // USER
      // -------------------------------------------------

      const updatedUser = {
        ...currentUser,
        id: candidate.id || candidateId,
        name: candidate.name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        role: "candidate",
      };

      setUser(updatedUser);

      setAccountForm({
        name: candidate.name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
      });

      // -------------------------------------------------
      // SETTINGS
      // -------------------------------------------------

      setNotifications({
        jobAlerts:
          Number(settings.job_alerts) === 1,

        applicationUpdates:
          Number(settings.application_updates) === 1,

        interviewNotifications:
          Number(settings.interview_notifications) === 1,

        recruiterMessages:
          Number(settings.recruiter_messages) === 1,

        emailNotifications:
          Number(settings.email_notifications) === 1,
      });

      setProfileVisibility(
        Number(settings.profile_visibility) === 1
      );
    } catch (err) {
      console.error("Load settings error:", err);

      setError(
        err.message ||
          "Unable to load candidate settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR ALERT
  // =====================================================

  const clearAlerts = () => {
    setSuccess("");
    setError("");
  };

  // =====================================================
  // ACCOUNT CHANGE
  // =====================================================

  const handleAccountChange = (e) => {
    const { name, value } = e.target;

    setAccountForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearAlerts();
  };

  // =====================================================
  // PASSWORD CHANGE
  // =====================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearAlerts();
  };

  // =====================================================
  // TOGGLE
  // =====================================================

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    clearAlerts();
  };

  // =====================================================
  // COMMON PAYLOAD
  // =====================================================

  const getSettingsPayload = () => {
    const candidateId = getCandidateId();

    return {
      candidate_id: candidateId,

      name: accountForm.name.trim(),
      email: accountForm.email.trim(),
      phone: accountForm.phone.trim(),

      job_alerts: notifications.jobAlerts ? 1 : 0,

      application_updates:
        notifications.applicationUpdates ? 1 : 0,

      interview_notifications:
        notifications.interviewNotifications ? 1 : 0,

      recruiter_messages:
        notifications.recruiterMessages ? 1 : 0,

      email_notifications:
        notifications.emailNotifications ? 1 : 0,

      profile_visibility:
        profileVisibility ? 1 : 0,
    };
  };

  // =====================================================
  // SAVE ACCOUNT
  // =====================================================

  const saveAccount = async () => {
    clearAlerts();

    const candidateId = getCandidateId();

    if (!candidateId) {
      setError("Candidate ID not found. Please login again.");
      return;
    }

    if (!accountForm.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!accountForm.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(SETTINGS_API, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(
          getSettingsPayload()
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update account."
        );
      }

      const updatedCandidate =
        result.data?.candidate || {};

      // -------------------------------------------------
      // UPDATE LOCAL STORAGE
      // -------------------------------------------------

      const currentUser = getCurrentUser();

      const updatedUser = {
        ...currentUser,

        id:
          updatedCandidate.id ||
          candidateId,

        name:
          updatedCandidate.name ||
          accountForm.name,

        email:
          updatedCandidate.email ||
          accountForm.email,

        phone:
          updatedCandidate.phone ??
          accountForm.phone,

        role: "candidate",
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      // Some existing project pages may use these keys.
      localStorage.setItem(
        "userId",
        String(candidateId)
      );

      localStorage.setItem(
        "id",
        String(candidateId)
      );

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      setUser(updatedUser);

      setAccountForm({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });

      setSuccess(
        "Name, email and phone updated successfully."
      );
    } catch (err) {
      console.error("Save account error:", err);

      setError(
        err.message ||
          "Unable to update account information."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SAVE NOTIFICATIONS
  // =====================================================

  const saveNotifications = async () => {
    clearAlerts();

    const candidateId = getCandidateId();

    if (!candidateId) {
      setError(
        "Candidate ID not found. Please login again."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(SETTINGS_API, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(
          getSettingsPayload()
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save notification preferences."
        );
      }

      setSuccess(
        "Notification preferences saved successfully."
      );
    } catch (err) {
      console.error(
        "Notification save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save notification preferences."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SAVE PRIVACY
  // =====================================================

  const savePrivacy = async () => {
    clearAlerts();

    const candidateId = getCandidateId();

    if (!candidateId) {
      setError(
        "Candidate ID not found. Please login again."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(SETTINGS_API, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(
          getSettingsPayload()
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save privacy settings."
        );
      }

      setSuccess(
        "Privacy settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Privacy save error:",
        err
      );

      setError(
        err.message ||
          "Unable to save privacy settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const changePassword = async () => {
    clearAlerts();

    const candidateId = getCandidateId();

    if (!candidateId) {
      setError(
        "Candidate ID not found. Please login again."
      );
      return;
    }

    if (!passwordForm.currentPassword) {
      setError(
        "Please enter your current password."
      );
      return;
    }

    if (!passwordForm.newPassword) {
      setError(
        "Please enter your new password."
      );
      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      setError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...getSettingsPayload(),

        current_password:
          passwordForm.currentPassword,

        new_password:
          passwordForm.newPassword,

        confirm_password:
          passwordForm.confirmPassword,
      };

      const response = await fetch(SETTINGS_API, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to change password."
        );
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess(
        "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Password change error:",
        err
      );

      setError(
        err.message ||
          "Unable to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TABS
  // =====================================================

  const tabs = [
    {
      id: "account",
      label: "Account Settings",
      icon: UserRound,
    },

    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },

    {
      id: "privacy",
      label: "Privacy & Security",
      icon: ShieldCheck,
    },
  ];

  // =====================================================
  // TOGGLE
  // =====================================================

  const Toggle = ({
    enabled,
    onChange,
  }) => {
    return (
      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-200 ${
          enabled
            ? "bg-blue-600"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    );
  };

  // =====================================================
  // SETTING ROW
  // =====================================================

  const SettingRow = ({
    icon: Icon,
    title,
    description,
    enabled,
    onChange,
  }) => {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">

        <div className="flex min-w-0 items-center gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <Icon size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800">
              {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              {description}
            </p>
          </div>

        </div>

        <Toggle
          enabled={enabled}
          onChange={onChange}
        />
      </div>
    );
  };

  // =====================================================
  // PASSWORD INPUT
  // =====================================================

  const PasswordInput = ({
    name,
    value,
    placeholder,
    show,
    setShow,
  }) => {
    return (
      <div className="relative">

        <input
          type={
            show
              ? "text"
              : "password"
          }
          name={name}
          value={value}
          onChange={handlePasswordChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={() =>
            setShow(!show)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-blue-600"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#f6f8fc]">

        <div className="flex flex-col items-center gap-3">

          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm font-medium text-gray-500">
            Loading settings...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-5 sm:px-6 lg:px-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="relative mb-6 overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg shadow-blue-600/10 sm:px-8">

        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-blue-100">

              <ShieldCheck size={15} />

              <span className="text-xs font-semibold uppercase tracking-wider">
                Candidate Account
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Settings
            </h1>

            <p className="mt-1 text-sm text-blue-100">
              Manage your account, notifications and privacy preferences.
            </p>

          </div>

          <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md sm:flex">
            <UserRound size={30} />
          </div>

        </div>

      </section>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

          <CheckCircle2 size={19} />

          <span>{success}</span>

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          SETTINGS LAYOUT
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="h-fit rounded-[24px] border border-gray-200 bg-white p-3 shadow-sm">

          <div className="mb-3 px-3 pt-2">

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Settings
            </p>

          </div>

          <div className="space-y-1">

            {tabs.map((tab) => {

              const Icon = tab.icon;

              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearAlerts();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                >

                  <Icon size={18} />

                  <span>{tab.label}</span>

                </button>
              );

            })}

          </div>

        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="rounded-[24px] border border-gray-200 bg-white shadow-sm">

          {/* =================================================
              ACCOUNT
          ================================================= */}

          {activeTab === "account" && (
            <div className="p-5 sm:p-7">

              <div className="mb-7">

                <h2 className="text-xl font-bold text-gray-900">
                  Account Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your basic candidate account information.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>

                  <div className="relative">

                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={accountForm.name}
                      onChange={handleAccountChange}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      name="email"
                      value={accountForm.email}
                      onChange={handleAccountChange}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>

                  <div className="relative">

                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="phone"
                      value={accountForm.phone}
                      onChange={handleAccountChange}
                      placeholder="Enter your phone number"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

              </div>

              <div className="mt-7 flex justify-end border-t border-gray-100 pt-6">

                <button
                  type="button"
                  onClick={saveAccount}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  Save Changes

                </button>

              </div>

            </div>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeTab === "notifications" && (
            <div className="p-5 sm:p-7">

              <div className="mb-7">

                <h2 className="text-xl font-bold text-gray-900">
                  Notification Preferences
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose which updates you want to receive.
                </p>

              </div>

              <div className="space-y-3">

                <SettingRow
                  icon={Search}
                  title="Job Alerts"
                  description="Get notified about new jobs that match your interests."
                  enabled={
                    notifications.jobAlerts
                  }
                  onChange={() =>
                    toggleNotification(
                      "jobAlerts"
                    )
                  }
                />

                <SettingRow
                  icon={BriefcaseBusiness}
                  title="Application Status Updates"
                  description="Receive updates when a recruiter changes your application status."
                  enabled={
                    notifications.applicationUpdates
                  }
                  onChange={() =>
                    toggleNotification(
                      "applicationUpdates"
                    )
                  }
                />

                <SettingRow
                  icon={CalendarDays}
                  title="Interview Notifications"
                  description="Get notified about interview schedules and updates."
                  enabled={
                    notifications.interviewNotifications
                  }
                  onChange={() =>
                    toggleNotification(
                      "interviewNotifications"
                    )
                  }
                />

                <SettingRow
                  icon={MessageSquare}
                  title="Recruiter Messages"
                  description="Receive notifications when a recruiter sends you a message."
                  enabled={
                    notifications.recruiterMessages
                  }
                  onChange={() =>
                    toggleNotification(
                      "recruiterMessages"
                    )
                  }
                />

                <SettingRow
                  icon={Mail}
                  title="Email Notifications"
                  description="Receive important job and application updates through email."
                  enabled={
                    notifications.emailNotifications
                  }
                  onChange={() =>
                    toggleNotification(
                      "emailNotifications"
                    )
                  }
                />

              </div>

              <div className="mt-7 flex justify-end border-t border-gray-100 pt-6">

                <button
                  type="button"
                  onClick={saveNotifications}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  Save Preferences

                </button>

              </div>

            </div>
          )}

          {/* =================================================
              PRIVACY & SECURITY
          ================================================= */}

          {activeTab === "privacy" && (
            <div className="p-5 sm:p-7">

              <div className="mb-7">

                <h2 className="text-xl font-bold text-gray-900">
                  Privacy & Security
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your profile visibility and account password.
                </p>

              </div>

              {/* PROFILE VISIBILITY */}

              <div className="mb-7 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Eye size={20} />
                    </div>

                    <div>

                      <h3 className="text-sm font-semibold text-gray-800">
                        Profile Visibility
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Allow recruiters to discover and view your candidate profile.
                      </p>

                    </div>

                  </div>

                  <Toggle
                    enabled={
                      profileVisibility
                    }
                    onChange={() =>
                      setProfileVisibility(
                        (prev) => !prev
                      )
                    }
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <LockKeyhole size={20} />
                  </div>

                  <div>

                    <h3 className="text-base font-bold text-gray-800">
                      Change Password
                    </h3>

                    <p className="text-xs text-gray-500">
                      Keep your account secure with a strong password.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* CURRENT */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Current Password
                    </label>

                    <PasswordInput
                      name="currentPassword"
                      value={
                        passwordForm.currentPassword
                      }
                      placeholder="Enter current password"
                      show={
                        showCurrentPassword
                      }
                      setShow={
                        setShowCurrentPassword
                      }
                    />

                  </div>

                  {/* NEW */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      New Password
                    </label>

                    <PasswordInput
                      name="newPassword"
                      value={
                        passwordForm.newPassword
                      }
                      placeholder="Enter new password"
                      show={
                        showNewPassword
                      }
                      setShow={
                        setShowNewPassword
                      }
                    />

                  </div>

                  {/* CONFIRM */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Confirm Password
                    </label>

                    <PasswordInput
                      name="confirmPassword"
                      value={
                        passwordForm.confirmPassword
                      }
                      placeholder="Confirm new password"
                      show={
                        showConfirmPassword
                      }
                      setShow={
                        setShowConfirmPassword
                      }
                    />

                  </div>

                </div>

                <div className="mt-5 flex justify-end">

                  <button
                    type="button"
                    onClick={changePassword}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <LockKeyhole size={18} />
                    )}

                    Change Password

                  </button>

                </div>

              </div>

              {/* SAVE PRIVACY */}

              <div className="mt-6 flex justify-end border-t border-gray-100 pt-6">

                <button
                  type="button"
                  onClick={savePrivacy}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  Save Privacy Settings

                </button>

              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default CandidateSettings;