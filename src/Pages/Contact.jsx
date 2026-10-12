import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Mail,
  MapPin,
  Phone,
  Send,
  Loader2,
  MessageSquare,
  User,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";

// ======================================================
// API
// ======================================================

import API_BASE from "../Config/api";

const SETTINGS_API = `${API_BASE}/admin/settings.php`;

const CONTACT_API = `${API_BASE}/contact/create.php`;

// ======================================================
// DEFAULT SETTINGS
// ======================================================

const DEFAULT_SETTINGS = {
  site_name: "JobPortal",
  site_email: "support@jobportal.com",
  site_phone: "+91 98765 43210",
  site_location: "Lucknow, India",
};

// ======================================================
// CONTACT INFO CARD
// ======================================================

const ContactInfoCard = ({
  icon: Icon,
  title,
  description,
  value,
  href,
  iconClass,
}) => {
  const content = (
    <div className="group flex items-start gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass} transition duration-300 group-hover:scale-105`}
      >
        <Icon size={20} strokeWidth={2} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
          {description}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-slate-900 transition group-hover:text-blue-600 sm:text-base">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </div>
  );
};

// ======================================================
// FIELD LABEL
// ======================================================

const FieldLabel = ({ children, required = false }) => (
  <label className="mb-2.5 block text-sm font-bold text-slate-700">
    {children}

    {required && <span className="ml-1 text-rose-500">*</span>}
  </label>
);

// ======================================================
// INPUT CLASS
// ======================================================

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60";

// ======================================================
// MAIN COMPONENT
// ======================================================

const Contact = () => {
  // ====================================================
  // FORM
  // ====================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // ====================================================
  // SETTINGS
  // ====================================================

  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);

  // ====================================================
  // UI STATES
  // ====================================================

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD SETTINGS
  // ====================================================

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);

      const response = await axios.get(SETTINGS_API, {
        timeout: 15000,
      });

      if (response.data?.success) {
        const settings = response.data.settings || [];

        const getSetting = (key, defaultValue = "") => {
          const setting = settings.find(
            (item) => item.setting_key === key
          );

          return setting?.setting_value ?? defaultValue;
        };

        setSiteSettings({
          site_name: getSetting(
            "site_name",
            DEFAULT_SETTINGS.site_name
          ),

          site_email: getSetting(
            "site_email",
            DEFAULT_SETTINGS.site_email
          ),

          site_phone: getSetting(
            "site_phone",
            DEFAULT_SETTINGS.site_phone
          ),

          site_location:
            getSetting("site_location") ||
            DEFAULT_SETTINGS.site_location,
        });
      }
    } catch (err) {
      console.error("CONTACT SETTINGS ERROR:", err);
      setSiteSettings(DEFAULT_SETTINGS);
    } finally {
      setLoadingSettings(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadSettings();
  }, []);

  // ====================================================
  // LISTEN SETTINGS UPDATE
  // ====================================================

  useEffect(() => {
    const handleSettingsUpdated = () => {
      loadSettings();
    };

    window.addEventListener(
      "settingsUpdated",
      handleSettingsUpdated
    );

    return () => {
      window.removeEventListener(
        "settingsUpdated",
        handleSettingsUpdated
      );
    };
  }, []);

  // ====================================================
  // INPUT CHANGE
  // ====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (submitted) {
      setSubmitted(false);
    }

    if (error) {
      setError("");
    }
  };

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitted(false);
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    // -----------------------------------------------
    // REQUIRED VALIDATION
    // -----------------------------------------------

    if (!name || !email || !subject || !message) {
      setError("Please fill all required fields.");
      return;
    }

    // -----------------------------------------------
    // EMAIL VALIDATION
    // -----------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // -----------------------------------------------
    // MESSAGE LENGTH
    // -----------------------------------------------

    if (message.length < 10) {
      setError(
        "Please enter at least 10 characters in your message."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        CONTACT_API,
        {
          name,
          email,
          subject,
          message,
        },
        {
          timeout: 30000,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to send your message."
        );
      }

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("CONTACT SUBMIT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // DYNAMIC VALUES
  // ====================================================

  const siteName =
    siteSettings.site_name || DEFAULT_SETTINGS.site_name;

  const emailValue =
    siteSettings.site_email || DEFAULT_SETTINGS.site_email;

  const phoneValue =
    siteSettings.site_phone || DEFAULT_SETTINGS.site_phone;

  const locationValue =
    siteSettings.site_location ||
    DEFAULT_SETTINGS.site_location;

  // ====================================================
  // CONTACT ITEMS
  // ====================================================

  const contactItems = [
    {
      icon: Mail,
      title: "Email us",
      description: "Send us your questions anytime",
      value: emailValue,
      href: `mailto:${emailValue}`,
      iconClass: "bg-blue-50 text-blue-600",
    },

    {
      icon: Phone,
      title: "Call us",
      description: "Talk to our support team",
      value: phoneValue,
      href: `tel:${String(phoneValue).replace(/\s+/g, "")}`,
      iconClass: "bg-emerald-50 text-emerald-600",
    },

    {
      icon: MapPin,
      title: "Our location",
      description: "We're based in",
      value: locationValue,
      href: null,
      iconClass: "bg-orange-50 text-orange-600",
    },
  ];

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1">
        {/* ==================================================
            HERO
        ================================================== */}

        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          {/* Background decorations */}

          <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />

          <div className="pointer-events-none absolute right-[20%] top-16 h-32 w-32 rounded-full bg-cyan-100/50 blur-2xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm">
                <Sparkles size={14} />
                We're here to help
              </div>

              {/* Heading */}

              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Let's{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  talk.
                </span>
              </h1>

              {/* Description */}

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                Have a question about jobs, hiring, or your
                account? Our{" "}
                <span className="font-bold text-slate-900">
                  {loadingSettings ? "JobPortal" : siteName}
                </span>{" "}
                support team is here to help you.
              </p>

              {/* Trust points */}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500 sm:text-sm">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500"
                  />
                  Quick response
                </span>

                <span className="inline-flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className="text-blue-500"
                  />
                  Secure communication
                </span>

                <span className="inline-flex items-center gap-2">
                  <Headphones
                    size={16}
                    className="text-indigo-500"
                  />
                  Human support
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            MAIN CONTACT AREA
        ================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
            {/* ==================================================
                LEFT SIDE
            ================================================== */}

            <div className="space-y-5">
              {/* Intro card */}

              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <MessageSquare size={22} />
                </div>

                <h2 className="mt-6 text-2xl font-extrabold sm:text-3xl">
                  How can we help?
                </h2>

                <p className="mt-3 text-sm leading-7 text-blue-100 sm:text-base">
                  Whether you're looking for a job, hiring
                  candidates, or facing an issue with your
                  account, send us a message and we'll help you
                  find the right solution.
                </p>

                <div className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">
                  Contact our support team
                  <ArrowRight size={17} />
                </div>
              </div>

              {/* Contact cards */}

              <div className="space-y-3">
                {contactItems.map((item) => (
                  <ContactInfoCard
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    value={item.value}
                    href={item.href}
                    iconClass={item.iconClass}
                  />
                ))}
              </div>
            </div>

            {/* ==================================================
                RIGHT SIDE — FORM
            ================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7 lg:p-9">
              {/* Form heading */}

              <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MessageSquare size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
                    Send us a message
                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Tell us what you need help with and our
                    support team will get back to you.
                  </p>
                </div>
              </div>

              {/* SUCCESS */}

              {submitted && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-bold">
                      Message sent successfully!
                    </p>

                    <p className="mt-1 leading-6">
                      Thanks for contacting us. Our team will
                      get back to you soon.
                    </p>
                  </div>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-bold">
                      Unable to send message
                    </p>

                    <p className="mt-1 leading-6">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-7"
              >
                {/* Name + Email */}

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}

                  <div>
                    <FieldLabel required>
                      Your name
                    </FieldLabel>

                    <div className="relative">
                      <User
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={submitting}
                        required
                        autoComplete="name"
                        placeholder="Enter your name"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Email */}

                  <div>
                    <FieldLabel required>
                      Email address
                    </FieldLabel>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={submitting}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}

                <div className="mt-5">
                  <FieldLabel required>
                    Subject
                  </FieldLabel>

                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                    placeholder="What can we help you with?"
                    className={inputClass}
                  />
                </div>

                {/* Message */}

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <FieldLabel required>
                      Your message
                    </FieldLabel>

                    <span className="mb-2.5 text-xs text-slate-400">
                      {formData.message.length}/1000
                    </span>
                  </div>

                  <textarea
                    id="contact-message"
                    name="message"
                    rows={7}
                    maxLength={1000}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                    placeholder="Write your message here..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Bottom */}

                <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                    <ShieldCheck
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <span>
                      Your information is secure and will only
                      be used to respond to your request.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ==================================================
            BOTTOM HELP SECTION
        ================================================== */}

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="flex flex-col gap-5 rounded-3xl bg-slate-50 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <HelpCircle size={20} />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                    Looking for a job or hiring candidates?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    You can also explore jobs or manage your
                    hiring directly from {siteName}.
                  </p>
                </div>
              </div>

              <div className="text-sm font-bold text-blue-600">
                We're happy to help.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;