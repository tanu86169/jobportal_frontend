import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from "axios";
import {
  Building2,
  MapPin,
  Briefcase,
  Globe,
  Users,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Search,
} from "lucide-react";

import API_BASE from "../Config/api";


const getLogoUrl = (logo) => {
  if (!logo) return "";

  if (
    logo.startsWith("http://") ||
    logo.startsWith("https://")
  ) {
    return logo;
  }

  return `${API_BASE}/${logo.replace(/^\/+/, "")}`;
};

const getWebsiteUrl = (website) => {
  if (!website) return "";

  if (
    website.startsWith("http://") ||
    website.startsWith("https://")
  ) {
    return website;
  }

  return `https://${website}`;
};

const CompanyDetails = () => {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [openJobs, setOpenJobs] = useState([]);
  const [similarCompanies, setSimilarCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE}/companies/get-by-id.php?id=${id}`
      );

      if (response.data.success) {
        setCompany(response.data.company || null);
        setOpenJobs(response.data.open_jobs || []);
        setSimilarCompanies(
          response.data.similar_companies || []
        );
      } else {
        setError(
          response.data.message ||
            "Company details not found."
        );
      }
    } catch (err) {
      console.error("Company Details API Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load company details."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <Loader2
              size={42}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-gray-600">
              Loading company details...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------
  if (error || !company) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="max-w-md w-full bg-white border rounded-2xl p-8 text-center">
            <AlertCircle
              size={48}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Company Not Found
            </h2>

            <p className="mt-2 text-gray-500">
              {error || "Unable to find this company."}
            </p>

            <Link
              to="/companies"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft size={18} />
              Back to Companies
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const logoUrl = getLogoUrl(company.logo);
  const websiteUrl = getWebsiteUrl(company.website);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1">

      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Companies
        </Link>
      </div>

      {/* Company Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-start gap-6">

            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">

              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={company.company_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2
                  size={42}
                  className="text-blue-600"
                />
              )}

            </div>

            {/* Company Information */}
            <div className="flex-1">

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {company.company_name}
              </h1>

              {company.industry && (
                <p className="mt-2 text-gray-600">
                  {company.industry}
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-5">

                {company.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={18} />
                    <span>{company.location}</span>
                  </div>
                )}

                {company.company_size && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={18} />
                    <span>{company.company_size}</span>
                  </div>
                )}

                {company.founded_year && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={18} />
                    <span>
                      Founded {company.founded_year}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase size={18} />
                  <span>
                    {Number(company.open_jobs || 0)} Open Jobs
                  </span>
                </div>

              </div>

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Globe size={18} />
                  Visit Company Website
                  <ExternalLink size={15} />
                </a>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">

              <h2 className="text-2xl font-bold text-gray-900">
                About {company.company_name}
              </h2>

              <div className="mt-4 text-gray-600 leading-7 whitespace-pre-line">
                {company.description ||
                  "No company description available."}
              </div>

            </div>

            {/* Open Jobs */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Open Jobs
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {openJobs.length}{" "}
                    {openJobs.length === 1
                      ? "job"
                      : "jobs"}{" "}
                    available
                  </p>
                </div>

                <Briefcase
                  size={28}
                  className="text-blue-600"
                />

              </div>

              {openJobs.length === 0 ? (
                <div className="py-10 text-center">

                  <Search
                    size={42}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="mt-4 font-semibold text-gray-800">
                    No open jobs
                  </h3>

                  <p className="mt-2 text-gray-500">
                    This company currently has no active
                    job openings.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {openJobs.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                    >

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {job.job_title}
                          </h3>

                          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">

                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={15} />
                                {job.location}
                              </span>
                            )}

                            {job.job_type && (
                              <span>
                                {job.job_type}
                              </span>
                            )}

                            {job.experience && (
                              <span>
                                {job.experience}
                              </span>
                            )}

                            {job.salary && (
                              <span>
                                {job.salary}
                              </span>
                            )}

                          </div>

                          {Array.isArray(job.skills) &&
                            job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">

                                {job.skills.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}

                              </div>
                            )}

                        </div>

                        <Link
                          to={`/jobs/${job.id}`}
                          className="shrink-0 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700"
                        >
                          View Job
                        </Link>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Company Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">

              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Company Information
              </h2>

              <div className="space-y-5">

                {company.industry && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Industry
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {company.industry}
                    </p>
                  </div>
                )}

                {company.company_size && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Company Size
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {company.company_size}
                    </p>
                  </div>
                )}

                {company.founded_year && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Founded
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {company.founded_year}
                    </p>
                  </div>
                )}

                {company.location && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Location
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {company.location}
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Similar Companies */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">

              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Similar Companies
              </h2>

              {similarCompanies.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No similar companies available.
                </p>
              ) : (
                <div className="space-y-4">

                  {similarCompanies.map(
                    (similarCompany) => {

                      const similarLogo = getLogoUrl(
                        similarCompany.logo
                      );

                      return (
                        <Link
                          key={similarCompany.id}
                          to={`/companies/${similarCompany.id}`}
                          className="block border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                        >

                          <div className="flex items-center gap-3">

                            <div className="w-12 h-12 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">

                              {similarLogo ? (
                                <img
                                  src={similarLogo}
                                  alt={
                                    similarCompany.company_name
                                  }
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Building2
                                  size={24}
                                  className="text-blue-600"
                                />
                              )}

                            </div>

                            <div className="min-w-0">

                              <h3 className="font-semibold text-gray-900 truncate">
                                {
                                  similarCompany.company_name
                                }
                              </h3>

                              {similarCompany.location && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin size={13} />
                                  {
                                    similarCompany.location
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                            <Briefcase size={15} />

                            {Number(
                              similarCompany.open_jobs || 0
                            )}{" "}
                            Open Jobs
                          </div>

                        </Link>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyDetails;