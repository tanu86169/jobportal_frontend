import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  User,
  Bell,
  Lock,
  ShieldCheck,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Settings as SettingsIcon,
  Loader2,
  RefreshCw,
  BriefcaseBusiness,
  MessageCircle,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import API_BASE from "../../Config/api";

const SETTINGS_API = `${API_BASE}/recruiter/settings.php`;

const PASSWORD_API = `${API_BASE}/recruiter/change-password.php`;

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");

  // =========================================================
  // Recruiter
  // =========================================================

  const [recruiterId, setRecruiterId] = useState(null);

  // =========================================================
  // Profile
  // =========================================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // =========================================================
  // Recruiter Preferences
  // =========================================================

  const [account, setAccount] = useState({
    emailNotifications: true,
    newApplicationAlerts: true,
    messageNotifications: true,
    interviewUpdates: true,
    profileVisibility: true,
  });

  // =========================================================
  // Password
  // =========================================================

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  // =========================================================
  // UI States
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // =========================================================
  // Message
  // =========================================================

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // =========================================================
  // Tabs
  // =========================================================

  const tabs = [
    {
      id: "account",
      label: "Account Settings",
      description: "Manage your account",
      icon: User,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Manage your alerts",
      icon: Bell,
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      description: "Password and visibility",
      icon: ShieldCheck,
    },
  ];

  // =========================================================
  // Get Recruiter ID
  // =========================================================

  const getRecruiterId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const id =
        user.id ||
        user.user_id ||
        user.userId ||
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id");

      if (!id) {
        return null;
      }

      return Number(id);
    } catch (error) {
      console.error(
        "Failed to read recruiter from localStorage:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // Show Message
  // =========================================================

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 4000);
  };

  // =========================================================
  // Load Settings
  // =========================================================

  const loadSettings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const id = getRecruiterId();

      if (!id) {
        showMessage(
          "error",
          "Recruiter login information not found."
        );

        return;
      }

      setRecruiterId(id);

      const response = await axios.get(SETTINGS_API, {
        params: {
          recruiterId: id,
        },
        timeout: 15000,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load recruiter settings."
        );
      }

      const profileData = response.data.profile || {};
      const settingsData = response.data.settings || {};

      // =====================================================
      // Profile
      // =====================================================

      setProfile({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
      });

      // =====================================================
      // Preferences
      // =====================================================

      setAccount({
        emailNotifications:
          settingsData.email_notifications === undefined
            ? true
            : Boolean(settingsData.email_notifications),

        newApplicationAlerts:
          settingsData.new_application_alerts === undefined
            ? true
            : Boolean(settingsData.new_application_alerts),

        messageNotifications:
          settingsData.message_notifications === undefined
            ? true
            : Boolean(settingsData.message_notifications),

        interviewUpdates:
          settingsData.interview_updates === undefined
            ? true
            : Boolean(settingsData.interview_updates),

        profileVisibility:
          settingsData.profile_visibility === undefined
            ? true
            : Boolean(settingsData.profile_visibility),
      });
    } catch (error) {
      console.error(
        "RECRUITER SETTINGS LOAD ERROR:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Unable to load recruiter settings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // Initial Load
  // =========================================================

  useEffect(() => {
    loadSettings();
  }, []);

  // =========================================================
  // Profile Change
  // =========================================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // Toggle
  // =========================================================

  const handleToggle = (field) => {
    setAccount((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // =========================================================
  // Password Change
  // =========================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // Save Profile
  // =========================================================

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!recruiterId) {
      showMessage("error", "Recruiter ID not found.");
      return;
    }

    const name = profile.name.trim();
    const email = profile.email.trim();
    const phone = profile.phone.trim();

    if (!name) {
      showMessage("error", "Name is required.");
      return;
    }

    if (!email) {
      showMessage("error", "Email is required.");
      return;
    }

    setSavingProfile(true);

    try {
      const payload = {
        recruiter_id: recruiterId,

        name,
        email,
        phone,

        email_notifications:
          account.emailNotifications,

        new_application_alerts:
          account.newApplicationAlerts,

        message_notifications:
          account.messageNotifications,

        interview_updates:
          account.interviewUpdates,

        profile_visibility:
          account.profileVisibility,
      };

      const response = await axios.put(
        SETTINGS_API,
        payload,
        {
          timeout: 15000,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to save profile."
        );
      }

      // =====================================================
      // Update LocalStorage
      // =====================================================

      try {
        const existingUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const updatedUser = {
          ...existingUser,
          id: recruiterId,
          name,
          email,
          phone,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        window.dispatchEvent(
          new Event("userUpdated")
        );
      } catch (storageError) {
        console.error(
          "LOCAL STORAGE UPDATE ERROR:",
          storageError
        );
      }

      setProfile({
        name,
        email,
        phone,
      });

      showMessage(
        "success",
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================================
  // Save Preferences
  // =========================================================

  const handleSavePreferences = async () => {
    if (!recruiterId) {
      showMessage(
        "error",
        "Recruiter ID not found."
      );
      return;
    }

    setSavingPreferences(true);

    try {
      const payload = {
        recruiter_id: recruiterId,

        name: profile.name.trim(),

        email: profile.email.trim(),

        phone: profile.phone.trim(),

        email_notifications:
          account.emailNotifications,

        new_application_alerts:
          account.newApplicationAlerts,

        message_notifications:
          account.messageNotifications,

        interview_updates:
          account.interviewUpdates,

        profile_visibility:
          account.profileVisibility,
      };

      const response = await axios.put(
        SETTINGS_API,
        payload,
        {
          timeout: 15000,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to save preferences."
        );
      }

      showMessage(
        "success",
        "Recruiter preferences saved successfully."
      );
    } catch (error) {
      console.error(
        "PREFERENCES UPDATE ERROR:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to save preferences."
      );
    } finally {
      setSavingPreferences(false);
    }
  };

  // =========================================================
  // Change Password
  // =========================================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!recruiterId) {
      showMessage(
        "error",
        "Recruiter ID not found."
      );
      return;
    }

    if (
      !password.current ||
      !password.newPassword ||
      !password.confirm
    ) {
      showMessage(
        "error",
        "Please fill all password fields."
      );
      return;
    }

    if (password.newPassword.length < 6) {
      showMessage(
        "error",
        "New password must be at least 6 characters."
      );
      return;
    }

    if (
      password.newPassword !==
      password.confirm
    ) {
      showMessage(
        "error",
        "New password and confirm password do not match."
      );
      return;
    }

    if (
      password.current ===
      password.newPassword
    ) {
      showMessage(
        "error",
        "New password must be different from current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await axios.put(
        PASSWORD_API,
        {
          recruiter_id: recruiterId,

          current_password:
            password.current,

          new_password:
            password.newPassword,

          confirm_password:
            password.confirm,
        },
        {
          timeout: 15000,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to change password."
        );
      }

      setPassword({
        current: "",
        newPassword: "",
        confirm: "",
      });

      setShowPassword(false);

      showMessage(
        "success",
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "PASSWORD UPDATE ERROR:",
        error
      );

      showMessage(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <Loader2
                size={28}
                className="animate-spin text-blue-600"
              />
            </div>

            <p className="text-sm font-medium text-gray-500">
              Loading recruiter settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // Main UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <header className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Decorative circles */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-indigo-100/50 blur-3xl" />
        </div>

        <div className="relative px-5 py-5 sm:px-6 lg:px-7">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Left */}

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
                <SettingsIcon
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2 text-[11px] font-medium">
                  <span className="text-gray-400">
                    Recruiter
                  </span>

                  <span className="text-gray-300">
                    /
                  </span>

                  <span className="text-blue-600">
                    Settings
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    Settings
                  </h1>

                  <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600 sm:inline-flex">
                    Account
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Manage your account, notifications and security.
                </p>
              </div>
            </div>

            {/* Refresh */}

            <button
              type="button"
              onClick={() => loadSettings(true)}
              disabled={refreshing}
              className="group flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md sm:self-auto"
              title="Refresh settings"
            >
              <RefreshCw
                size={16}
                className={`transition-transform ${
                  refreshing
                    ? "animate-spin"
                    : "group-hover:rotate-90"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MESSAGE
      ====================================================== */}

      {message.text && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <CheckCircle2 size={17} />

          <span>{message.text}</span>
        </div>
      )}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

        {/* ===================================================
            SIDEBAR
        ==================================================== */}

        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">

          <div className="mb-3 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Settings
            </p>
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;

            const isActive =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`mb-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-white/15"
                      : "bg-gray-100"
                  }`}
                >
                  <Icon size={17} />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {tab.label}
                  </span>

                  <span
                    className={`mt-0.5 block text-[11px] ${
                      isActive
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    {tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <div className="lg:col-span-3">

          {/* =================================================
              ACCOUNT SETTINGS
          ================================================== */}

          {activeTab === "account" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Account Settings
                  </h2>

                  <p className="text-xs text-gray-500">
                    Manage your recruiter account information.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="space-y-4"
              >

                {/* Name */}

                <div className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-200 hover:shadow-sm">

                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <User size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Full Name
                      </h3>

                      <p className="text-xs text-gray-400">
                        Your registered recruiter name
                      </p>
                    </div>
                  </div>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}

                <div className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-200 hover:shadow-sm">

                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Mail size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Email Address
                      </h3>

                      <p className="text-xs text-gray-400">
                        Your registered account email
                      </p>
                    </div>
                  </div>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Phone */}

                <div className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-200 hover:shadow-sm">

                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Smartphone size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Mobile Number
                      </h3>

                      <p className="text-xs text-gray-400">
                        Your registered contact number
                      </p>
                    </div>
                  </div>

                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter your mobile number"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Save */}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          {activeTab === "notifications" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Bell size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Notification Settings
                  </h2>

                  <p className="text-xs text-gray-500">
                    Choose which recruiter notifications you want to receive.
                  </p>
                </div>
              </div>

              <div className="space-y-3">

                {/* Email Notifications */}

                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/20">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Mail size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Email Notifications
                      </h3>

                      <p className="text-xs text-gray-500">
                        Receive important updates through email.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        "emailNotifications"
                      )
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      account.emailNotifications
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        account.emailNotifications
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* New Applications */}

                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/20">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <BriefcaseBusiness size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        New Application Alerts
                      </h3>

                      <p className="text-xs text-gray-500">
                        Get notified when candidates apply to your jobs.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        "newApplicationAlerts"
                      )
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      account.newApplicationAlerts
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        account.newApplicationAlerts
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Messages */}

                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/20">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <MessageCircle size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Message Notifications
                      </h3>

                      <p className="text-xs text-gray-500">
                        Get notified when candidates send you messages.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        "messageNotifications"
                      )
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      account.messageNotifications
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        account.messageNotifications
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

               
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPreferences ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              PRIVACY & SECURITY
          ================================================== */}

          {activeTab === "privacy" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Privacy & Security
                  </h2>

                  <p className="text-xs text-gray-500">
                    Manage your recruiter visibility and password.
                  </p>
                </div>
              </div>

              {/* Profile Visibility */}

              <div className="rounded-xl border border-gray-200 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Eye size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Profile Visibility
                      </h3>

                      <p className="text-xs text-gray-500">
                        Allow candidates to view your recruiter/company profile.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        "profileVisibility"
                      )
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      account.profileVisibility
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        account.profileVisibility
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>

                </div>

                <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
                  When enabled, candidates can view the recruiter/company information associated with your account.
                </div>
              </div>

              {/* Save Privacy */}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPreferences ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Privacy Settings
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}

              <div className="my-7 border-t border-gray-100" />

              {/* Change Password */}

              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Lock size={18} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      Change Password
                    </h3>

                    <p className="text-xs text-gray-500">
                      Update your recruiter account password.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >

                {/* Current */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Current Password
                  </label>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="current"
                    value={password.current}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* New */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    New Password
                  </label>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="newPassword"
                    value={password.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Confirm */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Confirm New Password
                  </label>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="confirm"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Show Password */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-blue-600"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}

                  {showPassword
                    ? "Hide Password"
                    : "Show Password"}
                </button>

                {/* Update */}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock size={17} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;