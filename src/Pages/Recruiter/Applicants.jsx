import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  CalendarDays,
  Eye,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react";

// =====================================================
// API BASE
// =====================================================

import API_BASE from "../../Config/api";
// =====================================================
// COMPONENT
// =====================================================

const Applicants = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  // =====================================================
  // GET LOGGED-IN RECRUITER ID
  // =====================================================

  const getRecruiterId = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      console.log(
        "===================================="
      );

      console.log(
        "Logged in recruiter:",
        user
      );

      console.log(
        "User ID:",
        user?.id
      );

      console.log(
        "User userId:",
        user?.userId
      );

      console.log(
        "User user_id:",
        user?.user_id
      );

      console.log(
        "Local recruiterId:",
        localStorage.getItem(
          "recruiterId"
        )
      );

      console.log(
        "===================================="
      );

      const recruiterId =
        user?.id ||
        user?.userId ||
        user?.user_id ||
        localStorage.getItem(
          "recruiterId"
        );

      return recruiterId
        ? Number(recruiterId)
        : null;
    } catch (error) {
      console.error(
        "User parse error:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // FETCH RECRUITER APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    try {
      setLoading(true);

      setError("");

      const recruiterId =
        getRecruiterId();

      console.log(
        "Fetching applications for recruiter:",
        recruiterId
      );

      // -----------------------------------------------
      // Recruiter ID check
      // -----------------------------------------------

      if (!recruiterId) {
        setError(
          "Recruiter ID not found. Please login again."
        );

        return;
      }

      // -----------------------------------------------
      // API
      // -----------------------------------------------

      const response =
        await axios.get(
          `${API_BASE}/applications/get-recruiter-applications.php`,
          {
            params: {
              recruiterId:
                recruiterId,
            },
          }
        );

      console.log(
        "Applications API Response:",
        response.data
      );

      if (response.data?.success) {
        const list =
          Array.isArray(
            response.data.applications
          )
            ? response.data.applications
            : [];

        setApplications(list);
      } else {
        setError(
          response.data?.message ||
            "Failed to fetch applications."
        );
      }
    } catch (err) {
      console.error(
        "Applications Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to fetch applications."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD APPLICATIONS
  // =====================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredApplications =
    applications.filter(
      (application) => {
        const searchText =
          search
            .toLowerCase()
            .trim();

        if (!searchText) {
          return true;
        }

        const candidateName =
          String(
            application.candidate_name ||
              ""
          ).toLowerCase();

        const candidateEmail =
          String(
            application.candidate_email ||
              ""
          ).toLowerCase();

        const jobTitle =
          String(
            application.job_title ||
              ""
          ).toLowerCase();

        const companyName =
          String(
            application.company_name ||
              ""
          ).toLowerCase();

        return (
          candidateName.includes(
            searchText
          ) ||
          candidateEmail.includes(
            searchText
          ) ||
          jobTitle.includes(
            searchText
          ) ||
          companyName.includes(
            searchText
          )
        );
      }
    );

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================

  const updateApplicationStatus =
    async (
      applicationId,
      status
    ) => {
      try {
        setUpdatingId(
          applicationId
        );

        const response =
          await fetch(
            `${API_BASE}/applications/update-status.php`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                application_id:
                  Number(
                    applicationId
                  ),

                status:
                  status,
              }),
            }
          );

        const rawResponse =
          await response.text();

        console.log(
          "Status Update RAW Response:",
          rawResponse
        );

        let data;

        try {
          data =
            JSON.parse(
              rawResponse
            );
        } catch (parseError) {
          console.error(
            "Status JSON Parse Error:",
            parseError
          );

          alert(
            "Server returned an invalid response. Please check PHP."
          );

          return;
        }

        console.log(
          "Status Update Response:",
          data
        );

        if (!data?.success) {
          alert(
            data?.message ||
              "Failed to update application status."
          );

          return;
        }

        // ---------------------------------------------
        // Update UI immediately
        // ---------------------------------------------

        setApplications(
          (previousApplications) =>
            previousApplications.map(
              (application) =>
                Number(
                  application.application_id
                ) ===
                Number(
                  applicationId
                )
                  ? {
                      ...application,
                      status:
                        status,
                    }
                  : application
            )
        );

        alert(
          `Application ${status} successfully!`
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
        setUpdatingId(null);
      }
    };

  // =====================================================
  // MESSAGE CANDIDATE
  // =====================================================

  const messageCandidate = (
    application
  ) => {
    // -----------------------------------------------
    // Get candidate ID
    // -----------------------------------------------

    const candidateId =
      Number(
        application?.candidate_id
      );

    console.log(
      "===================================="
    );

    console.log(
      "Message Candidate Application:",
      application
    );

    console.log(
      "Candidate ID:",
      candidateId
    );

    console.log(
      "Candidate Name:",
      application?.candidate_name
    );

    console.log(
      "Candidate Email:",
      application?.candidate_email
    );

    console.log(
      "===================================="
    );

    // -----------------------------------------------
    // Candidate ID validation
    // -----------------------------------------------

    if (!candidateId) {
      alert(
        "Candidate ID not found for this application."
      );

      console.error(
        "Candidate ID missing from application:",
        application
      );

      return;
    }

    // -----------------------------------------------
    // Candidate information
    // -----------------------------------------------

    const candidateName =
      application?.candidate_name ||
      "Candidate";

    const candidateEmail =
      application?.candidate_email ||
      "";

    // -----------------------------------------------
    // Encode values safely
    // -----------------------------------------------

    const encodedName =
      encodeURIComponent(
        candidateName
      );

    const encodedEmail =
      encodeURIComponent(
        candidateEmail
      );

    // -----------------------------------------------
    // IMPORTANT
    //
    // RecruiterMessage.jsx reads:
    //
    // candidateId
    // candidateName
    // candidateEmail
    //
    // from URL query parameters.
    // -----------------------------------------------

    const messageUrl =
      `/recruiter/messages` +
      `?candidateId=${candidateId}` +
      `&candidateName=${encodedName}` +
      `&candidateEmail=${encodedEmail}`;

    console.log(
      "Opening recruiter message URL:",
      messageUrl
    );

    // -----------------------------------------------
    // Open exact candidate chat
    // -----------------------------------------------

    navigate(messageUrl);
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "Shortlisted":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Hired":
        return "bg-purple-100 text-purple-700";

      case "Interview":
        return "bg-yellow-100 text-yellow-700";

      case "Screening":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

 
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-40 rounded-lg bg-gray-200" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-gray-100" />
      </div>

      {/* Total applications + search skeleton */}
      <div className="mb-6 animate-pulse rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="mt-3 h-9 w-16 rounded bg-gray-200" />
          </div>

          <div className="h-12 w-full rounded-lg bg-gray-100 md:w-80" />
        </div>
      </div>

      {/* Applicant cards skeleton */}
      <div className="space-y-5">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
          >
            {/* Candidate information */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="h-14 w-14 shrink-0 rounded-full bg-gray-200" />

                <div className="min-w-0 flex-1">
                  <div className="h-5 w-44 max-w-full rounded bg-gray-200" />

                  <div className="mt-3 h-3 w-56 max-w-full rounded bg-gray-100" />

                  <div className="mt-2 h-3 w-36 max-w-full rounded bg-gray-100" />
                </div>
              </div>

              <div className="h-7 w-24 rounded-full bg-gray-100" />
            </div>

            {/* Job details */}
            <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((detail) => (
                <div key={detail}>
                  <div className="h-3 w-20 rounded bg-gray-100" />
                  <div className="mt-3 h-4 w-32 max-w-full rounded bg-gray-200" />
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mt-6">
              <div className="h-3 w-16 rounded bg-gray-100" />

              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((skill) => (
                  <div
                    key={skill}
                    className="h-7 w-20 rounded-full bg-gray-100"
                  />
                ))}
              </div>
            </div>

            {/* Footer and action buttons */}
            <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-4 w-36 rounded bg-gray-100" />

              <div className="flex flex-wrap gap-2">
                <div className="h-10 w-24 rounded-lg bg-gray-200" />
                <div className="h-10 w-20 rounded-lg bg-gray-100" />
                <div className="h-10 w-24 rounded-lg bg-gray-200" />
                <div className="h-10 w-28 rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-900">
          Applicants
        </h1>

        <p className="text-gray-500 mt-1">
          Manage candidates who have applied
          for your jobs.
        </p>

      </div>

      {/* =================================================
          TOP SECTION
      ================================================= */}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* TOTAL APPLICATIONS */}

          <div>

            <p className="text-sm text-gray-500">
              Total Applications
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-1">
              {applications.length}
            </h2>

          </div>

          {/* SEARCH */}

          <div className="relative w-full md:w-80">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />

            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="
                w-full
                pl-10
                pr-4
                py-3
                border
                border-gray-300
                rounded-lg
                outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
              "
            />

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">

          <AlertCircle size={20} />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!error &&
        filteredApplications.length ===
          0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">

            <User
              size={45}
              className="mx-auto text-gray-300 mb-4"
            />

            <h3 className="text-lg font-semibold text-gray-800">
              No applicants found
            </h3>

            <p className="text-gray-500 mt-1">
              {search
                ? "No applications match your search."
                : "No applications have been received yet."}
            </p>

          </div>
        )}

      {/* =================================================
          APPLICATIONS
      ================================================= */}

      <div className="space-y-5">

        {filteredApplications.map(
          (application) => {

            const isUpdating =
              Number(
                updatingId
              ) ===
              Number(
                application.application_id
              );

            const applicationStatus =
              application.status ||
              "Applied";

            return (
              <div
                key={
                  application.application_id
                }
                className="
                  bg-white
                  rounded-xl
                  border
                  border-gray-200
                  p-6
                  hover:shadow-md
                  transition
                "
              >

                {/* =================================================
                    TOP
                ================================================= */}

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                  {/* CANDIDATE */}

                  <div className="flex items-start gap-4">

                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">

                      <User
                        size={26}
                        className="text-blue-600"
                      />

                    </div>

                    <div className="min-w-0">

                      <h2 className="text-lg font-bold text-gray-900">

                        {application.candidate_name ||
                          "Unknown Candidate"}

                      </h2>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">

                        {/* EMAIL */}

                        <span className="flex items-center gap-1 break-all">

                          <Mail size={15} />

                          {application.candidate_email ||
                            "No email"}

                        </span>

                        {/* PHONE */}

                        <span className="flex items-center gap-1">

                          <Phone size={15} />

                          {application.candidate_phone ||
                            "No phone"}

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* STATUS */}

                  <span
                    className={`
                      inline-flex
                      w-fit
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-medium
                      ${getStatusClass(
                        applicationStatus
                      )}
                    `}
                  >
                    {applicationStatus}
                  </span>

                </div>

                {/* =================================================
                    JOB INFO
                ================================================= */}

                <div className="border-t border-gray-100 mt-5 pt-5">

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* JOB */}

                    <div>

                      <p className="text-xs text-gray-400 mb-1">
                        Applied For
                      </p>

                      <div className="flex items-center gap-2 text-gray-800 font-medium">

                        <Briefcase
                          size={17}
                          className="text-gray-400"
                        />

                        <span>
                          {application.job_title ||
                            "N/A"}
                        </span>

                      </div>

                    </div>

                    {/* LOCATION */}

                    <div>

                      <p className="text-xs text-gray-400 mb-1">
                        Location
                      </p>

                      <div className="flex items-center gap-2 text-gray-800">

                        <MapPin
                          size={17}
                          className="text-gray-400"
                        />

                        <span>
                          {application.location ||
                            "N/A"}
                        </span>

                      </div>

                    </div>

                    {/* EXPERIENCE */}

                    <div>

                      <p className="text-xs text-gray-400 mb-1">
                        Experience
                      </p>

                      <div className="text-gray-800">

                        {application.experience ||
                          "Not specified"}

                      </div>

                    </div>

                    {/* APPLIED DATE */}

                    <div>

                      <p className="text-xs text-gray-400 mb-1">
                        Applied Date
                      </p>

                      <div className="flex items-center gap-2 text-gray-800">

                        <CalendarDays
                          size={17}
                          className="text-gray-400"
                        />

                        <span>
                          {application.applied_at ||
                            "N/A"}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    SKILLS
                ================================================= */}

                <div className="mt-5">

                  <p className="text-xs text-gray-400 mb-2">
                    Skills
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {Array.isArray(
                      application.skills
                    ) &&
                    application.skills.length >
                      0 ? (
                      application.skills.map(
                        (
                          skill,
                          index
                        ) => (
                          <span
                            key={
                              `${application.application_id}-${index}`
                            }
                            className="
                              px-3
                              py-1
                              bg-gray-100
                              text-gray-700
                              rounded-full
                              text-sm
                            "
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-gray-400">
                        No skills added
                      </span>
                    )}

                  </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="border-t border-gray-100 mt-5 pt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  {/* APPLICATION ID */}

                  <div className="text-sm text-gray-500">

                    Application ID:{" "}

                    <span className="font-medium text-gray-700">

                      #
                      {
                        application.application_id
                      }

                    </span>

                  </div>

                  {/* ACTION BUTTONS */}

                  <div className="flex flex-wrap items-center gap-2">

                    {/* =================================================
                        SHORTLIST
                    ================================================= */}

                    {applicationStatus !==
                      "Shortlisted" &&
                      applicationStatus !==
                        "Rejected" &&
                      applicationStatus !==
                        "Hired" && (

                        <button
                          type="button"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            updateApplicationStatus(
                              application.application_id,
                              "Shortlisted"
                            )
                          }
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-2.5
                            bg-green-600
                            text-white
                            rounded-lg
                            hover:bg-green-700
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                            transition
                          "
                        >

                          {isUpdating ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle
                              size={17}
                            />
                          )}

                          Shortlist

                        </button>
                      )}

                    {/* =================================================
                        REJECT
                    ================================================= */}

                    {applicationStatus !==
                      "Rejected" &&
                      applicationStatus !==
                        "Hired" && (

                        <button
                          type="button"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            updateApplicationStatus(
                              application.application_id,
                              "Rejected"
                            )
                          }
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-2.5
                            bg-red-600
                            text-white
                            rounded-lg
                            hover:bg-red-700
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                            transition
                          "
                        >

                          {isUpdating ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <XCircle
                              size={17}
                            />
                          )}

                          Reject

                        </button>
                      )}

                    {/* =================================================
                        MESSAGE CANDIDATE
                    ================================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        messageCandidate(
                          application
                        )
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        bg-blue-600
                        text-white
                        rounded-lg
                        hover:bg-blue-700
                        transition
                      "
                    >

                      <MessageCircle
                        size={17}
                      />

                      Message

                    </button>

                    {/* =================================================
                        VIEW DETAILS
                    ================================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/recruiter/applicant/${application.application_id}`,
                          {
                            state: {
                              application:
                                application,
                            },
                          }
                        )
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        bg-gray-900
                        text-white
                        rounded-lg
                        hover:bg-gray-800
                        transition
                      "
                    >

                      <Eye
                        size={17}
                      />

                      View Details

                    </button>

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
};

export default Applicants;