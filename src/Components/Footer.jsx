
import React, { useEffect, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

import axios from "axios";

// Main laptop ka IP address — localhost nahi
import API_BASE from "../Config/api";

const API_URL = `${API_BASE}/admin/settings.php`;
  
const DEFAULT_EMAIL = "admin@jobportal.com";

const Footer = () => {
  const [siteName, setSiteName] = useState("JobPortal");
  const [siteEmail, setSiteEmail] = useState(DEFAULT_EMAIL);
  const [sitePhone, setSitePhone] = useState("");

  // ==========================================
  // LOAD SETTINGS FROM DATABASE
  // ==========================================
  const loadSettings = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);

      if (!response.data?.success) {
        console.warn(
          "Footer settings API returned an unsuccessful response."
        );
        return;
      }

      const settings = Array.isArray(response.data.settings)
        ? response.data.settings
        : [];

      const getSetting = (key, defaultValue = "") => {
        const setting = settings.find(
          (item) => item.setting_key === key
        );

        return setting?.setting_value ?? defaultValue;
      };

      setSiteName(getSetting("site_name", "JobPortal"));
      setSiteEmail(getSetting("site_email", DEFAULT_EMAIL));
      setSitePhone(getSetting("site_phone", ""));
    } catch (error) {
      console.error(
        "FOOTER SETTINGS ERROR:",
        error.response?.status,
        error.message
      );

      // API fail hone par default values hi dikhengi
    }
  }, []);

  // ==========================================
  // LOAD SETTINGS WHEN FOOTER MOUNTS
  // ==========================================
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ==========================================
  // REFRESH WHEN ADMIN UPDATES SETTINGS
  // ==========================================
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
  }, [loadSettings]);

  // ==========================================
  // SOCIAL LINKS
  // Replace # with actual profile URLs
  // ==========================================
  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebookF,
      url: "#",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "#",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      url: "#",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      url: "#",
    },
  ];

  // ==========================================
  // FOOTER LINKS
  // ==========================================
  const candidateLinks = [
    { name: "Find Jobs", path: "/jobs" },
    { name: "Browse Companies", path: "/companies" },
    { name: "Saved Jobs", path: "/candidate/saved-jobs" },
    { name: "My Applications", path: "/candidate/applications" },
    { name: "My Profile", path: "/candidate/profile" },
  ];

  const employerLinks = [
    { name: "Post a Job", path: "/recruiter/post-job" },
    { name: "Recruiter Dashboard", path: "/recruiter/dashboard" },
    { name: "Manage Applicants", path: "/recruiter/applicants" },
    { name: "Hiring Analytics", path: "/recruiter/analytics" },
  ];

  const companyLinks = [
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms & Conditions", path: "/terms" },
    { name: "Help & Support", path: "/help" },
  ];

  // ==========================================
  // RENDER LINK GROUP
  // ==========================================
  const renderLinks = (links) =>
    links.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className="transition hover:text-blue-500"
      >
        {item.name}
      </Link>
    ));

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* BRAND AND CONTACT */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <BriefcaseBusiness size={20} />
              </div>

              <span className="text-xl font-bold text-white">
                {siteName}
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
              Find your dream job and connect with the right
              companies. Build your career with opportunities
              that match your skills.
            </p>

            {/* DYNAMIC CONTACT DETAILS */}
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              {siteEmail && (
                <p>
                  Email:{" "}
                  <a
                    href={`mailto:${siteEmail}`}
                    className="break-all transition hover:text-blue-500"
                  >
                    {siteEmail}
                  </a>
                </p>
              )}

              {sitePhone && (
                <p>
                  Phone:{" "}
                  <a
                    href={`tel:${sitePhone}`}
                    className="transition hover:text-blue-500"
                  >
                    {sitePhone}
                  </a>
                </p>
              )}
            </div>

            {/* SOCIAL LINKS */}
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.url}
                    aria-label={social.name}
                    onClick={(event) => {
                      if (social.url === "#") {
                        event.preventDefault();
                      }
                    }}
                    className="rounded-lg bg-gray-800 p-2 transition hover:bg-blue-600"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* FOR CANDIDATES */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              For Job Seekers
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              {renderLinks(candidateLinks)}
            </div>
          </div>

          {/* FOR EMPLOYERS */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              For Employers
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              {renderLinks(employerLinks)}
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              {renderLinks(companyLinks)}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteName}.
            {" "}All rights reserved.
          </p>

          <p>Built for candidates and recruiters.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;