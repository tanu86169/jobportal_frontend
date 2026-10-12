import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  CalendarDays,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  UserCheck,
} from "lucide-react";

import API_BASE from "../../Config/api";

const ApplicantDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [application, setApplication] = useState(
    location.state?.application || null
  );

  const [status, setStatus] = useState(
    location.state?.application?.status || "Applied"
  );

  const [loading, setLoading] = useState(
    !location.state?.application
  );

  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH APPLICATION BY ID
  // =====================================================

  useEffect(() => {
    const fetchApplication = async () => {
      // If application already came from Applicants page,
      // no need to fetch again.
      if (location.state?.application) {
        setApplication(location.state.application);
        setStatus(
          location.state.application.status || "Applied"
        );
        setLoading(false);
        return;
      }

      // Application ID from URL
      if (!id) {
        setError("Application ID not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log(
          "Fetching Application ID:",
          id
        );

        const response = await fetch(
          `${API_BASE}/applications/get-by-id.php?applicationId=${id}`
        );

        const rawResponse = await response.text();

        console.log(
          "Applicant Details RAW Response:",
          rawResponse
        );

        let data;

        try {
          data = JSON.parse(rawResponse);
        } catch (parseError) {
          console.error(
            "JSON Parse Error:",
            parseError
          );

          setError(
            "Server returned an invalid response."
          );

          return;
        }

        console.log(
          "Applicant Details Response:",
          data
        );

        if (!data.success || !data.application) {
          setError(
            data.message ||
              "Application not found."
          );

          return;
        }

        // Save application
        setApplication(data.application);

        // Set status
        setStatus(
          data.application.status || "Applied"
        );

      } catch (fetchError) {
        console.error(
          "Fetch Application Error:",
          fetchError
        );

        setError(
          "Something went wrong while loading applicant details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, location.state]);

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================

  const updateApplicationStatus = async (
    newStatus
  ) => {
    if (!application?.application_id) {
      alert("Application ID not found.");
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `${API_BASE}/applications/update-status.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_id: Number(
              application.application_id
            ),
            status: newStatus,
          }),
        }
      );

      const rawResponse = await response.text();

      console.log(
        "Status Update RAW Response:",
        rawResponse
      );

      let data;

      try {
        data = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error(
          "JSON Parse Error:",
          parseError
        );

        alert(
          "Server returned an invalid response."
        );

        return;
      }

      console.log(
        "Status Update Response:",
        data
      );

      if (!data.success) {
        alert(
          data.message ||
            "Failed to update application status."
        );

        return;
      }

      // Update status state
      setStatus(newStatus);

      // Update application object also
      setApplication((previous) => ({
        ...previous,
        status: newStatus,
      }));

      alert(
        `Application ${newStatus} successfully!`
      );

    } catch (error) {
      console.error(
        "Status Update Error:",
        error
      );

      alert(
        "Something went wrong while updating status."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = () => {
    switch (status) {
      case "Shortlisted":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Hired":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">

          <button
            type="button"
            onClick={() =>
              navigate("/recruiter/applicants")
            }
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={18} />
            Back to Applicants
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">

            <Loader2
              size={42}
              className="mx-auto text-blue-600 animate-spin mb-4"
            />

            <h2 className="text-xl font-bold text-gray-800">
              Loading Applicant Details...
            </h2>

            <p className="text-gray-500 mt-2">
              Please wait while we fetch the application.
            </p>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR / APPLICATION NOT FOUND
  // =====================================================

  if (!application || error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">

        <div className="max-w-4xl mx-auto">

          <button
            type="button"
            onClick={() =>
              navigate("/recruiter/applicants")
            }
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={18} />
            Back to Applicants
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">

            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-5">

              <User
                size={42}
                className="text-gray-300"
              />

            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Applicant not found
            </h2>

            <p className="text-gray-500 mt-2">
              {error ||
                "Please go back to the Applicants page and select an applicant."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/recruiter/applicants")
              }
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeft size={18} />
              Go to Applicants
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-6xl mx-auto">

        {/* ================================================= */}
        {/* BACK BUTTON */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate("/recruiter/applicants")
          }
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Applicants
        </button>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">

                <User
                  size={36}
                  className="text-blue-600"
                />

              </div>

              <div>

                <h1 className="text-2xl font-bold text-gray-900">
                  {application.candidate_name ||
                    "Candidate"}
                </h1>

                <p className="text-gray-500 mt-1">
                  Candidate Application
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Application ID #
                  {application.application_id}
                </p>

              </div>

            </div>

            {/* STATUS */}

            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass()}`}
            >
              <Clock size={16} />
              {status}
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* ================================================= */}
            {/* CANDIDATE INFORMATION */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Candidate Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* EMAIL */}

                <div className="flex items-start gap-3">

                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail
                      size={18}
                      className="text-gray-600"
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs text-gray-400">
                      Email
                    </p>

                    <p className="text-gray-800 font-medium break-all">
                      {application.candidate_email ||
                        "N/A"}
                    </p>

                  </div>

                </div>

                {/* PHONE */}

                <div className="flex items-start gap-3">

                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone
                      size={18}
                      className="text-gray-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-gray-400">
                      Phone
                    </p>

                    <p className="text-gray-800 font-medium">
                      {application.candidate_phone ||
                        "N/A"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* JOB INFORMATION */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Job Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* JOB */}

                <div className="flex items-start gap-3">

                  <Briefcase
                    size={20}
                    className="text-blue-600 mt-1"
                  />

                  <div>

                    <p className="text-xs text-gray-400">
                      Applied For
                    </p>

                    <p className="font-semibold text-gray-800">
                      {application.job_title ||
                        "N/A"}
                    </p>

                  </div>

                </div>

                {/* COMPANY */}

                <div className="flex items-start gap-3">

                  <Building2
                    size={20}
                    className="text-blue-600 mt-1"
                  />

                  <div>

                    <p className="text-xs text-gray-400">
                      Company
                    </p>

                    <p className="font-semibold text-gray-800">
                      {application.company_name ||
                        "N/A"}
                    </p>

                  </div>

                </div>

                {/* LOCATION */}

                <div className="flex items-start gap-3">

                  <MapPin
                    size={20}
                    className="text-blue-600 mt-1"
                  />

                  <div>

                    <p className="text-xs text-gray-400">
                      Location
                    </p>

                    <p className="font-semibold text-gray-800">
                      {application.location ||
                        "N/A"}
                    </p>

                  </div>

                </div>

                {/* APPLIED DATE */}

                <div className="flex items-start gap-3">

                  <CalendarDays
                    size={20}
                    className="text-blue-600 mt-1"
                  />

                  <div>

                    <p className="text-xs text-gray-400">
                      Applied On
                    </p>

                    <p className="font-semibold text-gray-800">
                      {application.applied_at ||
                        "N/A"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* SKILLS */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Skills
              </h2>

              <div className="flex flex-wrap gap-2">

                {Array.isArray(
                  application.skills
                ) &&
                application.skills.length > 0 ? (

                  application.skills.map(
                    (skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>

                    )
                  )

                ) : (

                  <p className="text-gray-500">
                    No skills provided
                  </p>

                )}

              </div>

            </div>

            {/* ================================================= */}
            {/* COVER LETTER */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <div className="flex items-center gap-2 mb-4">

                <FileText
                  size={20}
                  className="text-blue-600"
                />

                <h2 className="text-lg font-bold text-gray-900">
                  Cover Letter
                </h2>

              </div>

              {application.cover_letter ? (

                <p className="text-gray-600 leading-7 whitespace-pre-line">
                  {application.cover_letter}
                </p>

              ) : (

                <p className="text-gray-400">
                  No cover letter provided.
                </p>

              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* RIGHT SIDEBAR */}
          {/* ================================================= */}

          <div className="space-y-6">

            {/* ================================================= */}
            {/* APPLICATION SUMMARY */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Application Summary
              </h2>

              <div className="space-y-4">

                {/* JOB TYPE */}

                <div>

                  <p className="text-xs text-gray-400">
                    Job Type
                  </p>

                  <p className="font-medium text-gray-800">
                    {application.job_type ||
                      "N/A"}
                  </p>

                </div>

                {/* EXPERIENCE */}

                <div>

                  <p className="text-xs text-gray-400">
                    Experience
                  </p>

                  <p className="font-medium text-gray-800">
                    {application.experience ||
                      "N/A"}
                  </p>

                </div>

                {/* SALARY */}

                <div>

                  <p className="text-xs text-gray-400">
                    Salary
                  </p>

                  <p className="font-medium text-gray-800">
                    {application.salary ||
                      "N/A"}
                  </p>

                </div>

                {/* DEADLINE */}

                <div>

                  <p className="text-xs text-gray-400">
                    Deadline
                  </p>

                  <p className="font-medium text-gray-800">
                    {application.deadline ||
                      "N/A"}
                  </p>

                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* RESUME */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Resume
              </h2>

              {application.resume ? (

                <a
                  href={application.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <FileText size={18} />
                  View Resume
                </a>

              ) : (

                <p className="text-gray-400 text-sm">
                  No resume uploaded.
                </p>

              )}

            </div>

            {/* ================================================= */}
            {/* APPLICATION ACTIONS */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Application Actions
              </h2>

              <div className="space-y-3">

                {/* ================================================= */}
                {/* SHORTLIST */}
                {/* ================================================= */}

                {status !== "Shortlisted" &&
                  status !== "Rejected" &&
                  status !== "Hired" && (

                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        updateApplicationStatus(
                          "Shortlisted"
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >

                      {updating ? (

                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                      ) : (

                        <CheckCircle size={18} />

                      )}

                      Shortlist Candidate

                    </button>

                  )}

                {/* ================================================= */}
                {/* HIRE */}
                {/* ================================================= */}

                {status === "Shortlisted" && (

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() =>
                      updateApplicationStatus(
                        "Hired"
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >

                    {updating ? (

                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                    ) : (

                      <UserCheck size={18} />

                    )}

                    Hire Candidate

                  </button>

                )}

                {/* ================================================= */}
                {/* REJECT */}
                {/* ================================================= */}

                {status !== "Rejected" &&
                  status !== "Hired" && (

                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        updateApplicationStatus(
                          "Rejected"
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >

                      {updating ? (

                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                      ) : (

                        <XCircle size={18} />

                      )}

                      Reject Candidate

                    </button>

                  )}

                {/* ================================================= */}
                {/* HIRED MESSAGE */}
                {/* ================================================= */}

                {status === "Hired" && (

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">

                    <UserCheck
                      size={28}
                      className="mx-auto text-purple-600 mb-2"
                    />

                    <p className="font-semibold text-purple-700">
                      Candidate Hired
                    </p>

                    <p className="text-sm text-purple-600 mt-1">
                      This candidate has been hired.
                    </p>

                  </div>

                )}

                {/* ================================================= */}
                {/* REJECTED MESSAGE */}
                {/* ================================================= */}

                {status === "Rejected" && (

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">

                    <XCircle
                      size={28}
                      className="mx-auto text-red-600 mb-2"
                    />

                    <p className="font-semibold text-red-700">
                      Application Rejected
                    </p>

                    <p className="text-sm text-red-600 mt-1">
                      This application has been rejected.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ApplicantDetails;