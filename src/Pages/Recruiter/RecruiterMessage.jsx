import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  Search,
  Send,
  UserRound,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

// =====================================================
// API
// =====================================================
import API_BASE from "../../Config/api";

const MESSAGES_BASE = `${API_BASE}/messages`;

const CONVERSATIONS_API =
  `${MESSAGES_BASE}/get-conversations.php`;

const MESSAGES_API =
  `${MESSAGES_BASE}/get-messages.php`;

const SEND_MESSAGE_API =
  `${MESSAGES_BASE}/send-message.php`;

// =====================================================
// HELPERS
// =====================================================

const safeDate = (value) => {
  if (!value) return null;

  const stringValue = String(value);

  const date = new Date(
    stringValue.includes(" ")
      ? stringValue.replace(" ", "T")
      : stringValue
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const formatTime = (value) => {
  const date = safeDate(value);

  if (!date) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  const date = safeDate(value);

  if (!date) return "";

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitial = (name = "") => {
  return (
    String(name)
      .trim()
      .charAt(0)
      .toUpperCase() || "C"
  );
};

// =====================================================
// COMPONENT
// =====================================================

const RecruiterMessage = () => {
  const [searchParams] = useSearchParams();

  // ===================================================
  // URL CANDIDATE
  // ===================================================

  const urlCandidateId = Number(
    searchParams.get("candidateId") || 0
  );

  const urlCandidateName =
    searchParams.get("candidateName") || "";

  const urlCandidateEmail =
    searchParams.get("candidateEmail") || "";

  // ===================================================
  // LOGGED-IN USER
  // ===================================================

  const [user] = useState(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch (error) {
      console.error(
        "Unable to read user:",
        error
      );

      return null;
    }
  });

  const currentUserId = Number(
    user?.id || 0
  );

  const userRole = String(
    user?.role || ""
  )
    .trim()
    .toLowerCase();

  // ===================================================
  // STATES
  // ===================================================

  const [conversations, setConversations] =
    useState([]);

  const [selectedCandidateId, setSelectedCandidateId] =
    useState(urlCandidateId || null);

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mobileChatOpen, setMobileChatOpen] =
    useState(Boolean(urlCandidateId));

  // ===================================================
  // REFS
  // ===================================================

  const pollingRef = useRef(false);

  const messagesContainerRef =
    useRef(null);

  const messagesEndRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  // ===================================================
  // FETCH CONVERSATIONS
  // ===================================================

  const fetchConversations = useCallback(
    async ({ showLoader = false } = {}) => {
      if (!currentUserId) {
        setConversations([]);
        setLoading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      try {
        const url =
          `${CONVERSATIONS_API}` +
          `?userId=${currentUserId}` +
          `&_=${Date.now()}`;

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              "Unable to load conversations."
          );
        }

        const list =
          Array.isArray(
            data.conversations
          )
            ? data.conversations
            : [];

        // ---------------------------------------------
        // ONLY CANDIDATES
        // ---------------------------------------------

        const candidateConversations =
          list.filter((conversation) => {
            const role = String(
              conversation.other_user_role ||
                ""
            )
              .trim()
              .toLowerCase();

            return role === "candidate";
          });

        setConversations(
          candidateConversations
        );
      } catch (error) {
        console.error(
          "Conversation error:",
          error
        );

        if (showLoader) {
          setError(
            error.message ||
              "Unable to load conversations."
          );
        }
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [currentUserId]
  );

  // ===================================================
  // SELECTED CONVERSATION
  // ===================================================

  const selectedConversation = useMemo(() => {
    if (!selectedCandidateId) {
      return null;
    }

    return (
      conversations.find(
        (conversation) =>
          Number(
            conversation.other_user_id
          ) === Number(selectedCandidateId)
      ) || null
    );
  }, [
    conversations,
    selectedCandidateId,
  ]);

  // ===================================================
  // SELECTED CANDIDATE
  // ===================================================

  const selectedCandidate = useMemo(() => {
    if (selectedConversation) {
      return {
        id: Number(
          selectedConversation.other_user_id
        ),

        name:
          selectedConversation.other_user_name ||
          "Candidate",

        email:
          selectedConversation.other_user_email ||
          "",
      };
    }

    // Candidate opened directly from Applicants
    if (urlCandidateId) {
      return {
        id: urlCandidateId,

        name:
          urlCandidateName ||
          "Candidate",

        email:
          urlCandidateEmail ||
          "",
      };
    }

    return null;
  }, [
    selectedConversation,
    urlCandidateId,
    urlCandidateName,
    urlCandidateEmail,
  ]);

  // ===================================================
  // FETCH MESSAGES
  // ===================================================

  const fetchMessages = useCallback(
    async ({
      showLoader = false,
      markRead = true,
    } = {}) => {
      if (
        !currentUserId ||
        !selectedCandidateId
      ) {
        setMessages([]);
        return;
      }

      if (showLoader) {
        setMessagesLoading(true);
      }

      try {
        const url =
          `${MESSAGES_API}` +
          `?userId=${currentUserId}` +
          `&otherUserId=${Number(
            selectedCandidateId
          )}` +
          `&markRead=${markRead ? 1 : 0}` +
          `&_=${Date.now()}`;

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const data =
          await response.json();

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.message ||
              "Unable to load messages."
          );
        }

        const list =
          Array.isArray(data.messages)
            ? data.messages
            : [];

        setMessages(list);
      } catch (error) {
        console.error(
          "Message loading error:",
          error
        );

        if (showLoader) {
          setError(
            error.message ||
              "Unable to load messages."
          );
        }
      } finally {
        if (showLoader) {
          setMessagesLoading(false);
        }
      }
    },
    [
      currentUserId,
      selectedCandidateId,
    ]
  );

  // ===================================================
  // INITIAL CONVERSATIONS
  // ===================================================

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    fetchConversations({
      showLoader: true,
    });
  }, [
    currentUserId,
    fetchConversations,
  ]);

  // ===================================================
  // LOAD SELECTED CHAT
  // ===================================================

  useEffect(() => {
    if (
      !currentUserId ||
      !selectedCandidateId
    ) {
      setMessages([]);
      return;
    }

    fetchMessages({
      showLoader: true,
      markRead: true,
    });
  }, [
    currentUserId,
    selectedCandidateId,
    fetchMessages,
  ]);

  // ===================================================
  // SCROLL TO BOTTOM
  // ===================================================

  const scrollMessagesToBottom = useCallback(
    (behavior = "smooth") => {
      const container =
        messagesContainerRef.current;

      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    },
    []
  );

  // Scroll after messages change
  useEffect(() => {
    if (!messages.length) return;

    const timer = setTimeout(() => {
      scrollMessagesToBottom("smooth");
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [
    messages,
    scrollMessagesToBottom,
  ]);

  // ===================================================
  // POLLING
  // ===================================================

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const interval = setInterval(
      async () => {
        if (pollingRef.current) {
          return;
        }

        pollingRef.current = true;

        try {
          if (selectedCandidateId) {
            await fetchMessages({
              showLoader: false,
              markRead: true,
            });
          }

          await fetchConversations({
            showLoader: false,
          });
        } catch (error) {
          console.error(
            "Polling error:",
            error
          );
        } finally {
          pollingRef.current = false;
        }
      },
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    currentUserId,
    selectedCandidateId,
    fetchMessages,
    fetchConversations,
  ]);

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredConversations =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const name = String(
            conversation.other_user_name ||
              ""
          ).toLowerCase();

          const email = String(
            conversation.other_user_email ||
              ""
          ).toLowerCase();

          const lastMessage = String(
            conversation.last_message ||
              ""
          ).toLowerCase();

          return (
            name.includes(searchValue) ||
            email.includes(searchValue) ||
            lastMessage.includes(searchValue)
          );
        }
      );
    }, [
      conversations,
      search,
    ]);

  // ===================================================
  // SELECT CANDIDATE
  // ===================================================

  const handleSelectCandidate = (
    candidateId
  ) => {
    const id = Number(candidateId);

    if (!id) return;

    setSelectedCandidateId(id);

    setMobileChatOpen(true);

    setError("");

    setTimeout(() => {
      scrollMessagesToBottom("auto");
    }, 100);
  };

  // ===================================================
  // SEND MESSAGE
  // ===================================================

  const handleSendMessage = async (
    event
  ) => {
    event?.preventDefault();

    const messageText =
      text.trim();

    if (!messageText) {
      return;
    }

    if (!currentUserId) {
      setError(
        "Recruiter login required."
      );
      return;
    }

    if (!selectedCandidateId) {
      setError(
        "Please select a candidate."
      );
      return;
    }

    if (messageText.length > 5000) {
      setError(
        "Message cannot be longer than 5000 characters."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        SEND_MESSAGE_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            sender_id:
              currentUserId,

            receiver_id:
              Number(
                selectedCandidateId
              ),

            message:
              messageText,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ||
            "Unable to send message."
        );
      }

      setText("");

      // Refresh messages
      await fetchMessages({
        showLoader: false,
        markRead: true,
      });

      // Refresh sidebar
      await fetchConversations({
        showLoader: false,
      });

      // Focus textarea again
      setTimeout(() => {
        textareaRef.current?.focus();

        scrollMessagesToBottom(
          "smooth"
        );
      }, 100);
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      setError(
        error.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  // ===================================================
  // ENTER TO SEND
  // ===================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!sending && text.trim()) {
        handleSendMessage(event);
      }
    }
  };

  // ===================================================
  // LOGIN CHECK
  // ===================================================

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center max-w-md">
          <MessageCircle
            size={48}
            className="mx-auto mb-4 text-blue-600"
          />

          <h2 className="text-xl font-bold text-gray-900">
            Recruiter Login Required
          </h2>

          <p className="text-gray-500 mt-2">
            Please login as a recruiter to access messages.
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // ROLE CHECK
  // ===================================================

  if (userRole !== "recruiter") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center max-w-md">
          <MessageCircle
            size={48}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-xl font-bold text-gray-900">
            Recruiter Access Only
          </h2>

          <p className="text-gray-500 mt-2">
            This page is available only for recruiters.
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <div
      className="
        w-full
        h-[calc(100vh-145px)]
        min-h-[600px]
        bg-white
        rounded-2xl
        border
        border-gray-200
        shadow-sm
        overflow-hidden
      "
    >
      {/* =================================================
          MAIN CHAT WRAPPER
      ================================================= */}

      <div className="h-full min-h-0 flex overflow-hidden">

        {/* =================================================
            LEFT SIDEBAR
        ================================================= */}

        <aside
          className={`
            w-full
            md:w-[350px]
            lg:w-[390px]
            shrink-0
            border-r
            border-gray-200
            bg-white
            flex-col
            min-h-0
            overflow-hidden
            ${
              mobileChatOpen
                ? "hidden md:flex"
                : "flex"
            }
          `}
        >
          {/* Sidebar Header */}

          <div className="shrink-0 p-5 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <MessageCircle
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Messages
                </h2>

                <p className="text-xs text-gray-500">
                  Candidate conversations
                </p>
              </div>
            </div>

            {/* Search */}

            <div className="relative mt-4">
              <Search
                size={17}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search candidates..."
                className="
                  w-full
                  h-10
                  pl-10
                  pr-3
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  outline-none
                  text-sm
                  focus:border-blue-500
                  focus:bg-white
                "
              />
            </div>
          </div>

          {/* Conversation List */}

          <div
            className="
              flex-1
              min-h-0
              overflow-y-auto
              overscroll-contain
            "
          >
           
{loading ? (
  <div className="animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div
        key={item}
        className="flex gap-3 border-b border-gray-100 px-4 py-4"
      >
        {/* Avatar skeleton */}
        <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200" />

        {/* Candidate details skeleton */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-32 max-w-full rounded bg-gray-200" />
            <div className="h-3 w-10 rounded bg-gray-100" />
          </div>

          <div className="mt-2 h-3 w-40 max-w-full rounded bg-gray-100" />

          <div className="mt-3 h-3 w-48 max-w-full rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
) : filteredConversations.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <UserRound
                    size={26}
                    className="text-gray-400"
                  />
                </div>

                <h3 className="mt-4 font-semibold text-gray-800">
                  No conversations
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Candidate conversations will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map(
                (conversation) => {
                  const candidateId =
                    Number(
                      conversation.other_user_id
                    );

                  const active =
                    Number(
                      selectedCandidateId
                    ) === candidateId;

                  const unread =
                    Number(
                      conversation.unread_count ||
                        0
                    );

                  return (
                    <button
                      key={candidateId}
                      type="button"
                      onClick={() =>
                        handleSelectCandidate(
                          candidateId
                        )
                      }
                      className={`
                        w-full
                        text-left
                        px-4
                        py-4
                        border-b
                        border-gray-100
                        transition
                        ${
                          active
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex gap-3">
                        {/* Avatar */}

                        <div className="relative shrink-0">
                          <div
                            className={`
                              w-11
                              h-11
                              rounded-full
                              flex
                              items-center
                              justify-center
                              font-semibold
                              ${
                                active
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }
                            `}
                          >
                            {getInitial(
                              conversation.other_user_name
                            )}
                          </div>

                          {unread > 0 && (
                            <span className="
                              absolute
                              -top-1
                              -right-1
                              min-w-[18px]
                              h-[18px]
                              px-1
                              rounded-full
                              bg-red-500
                              text-white
                              text-[10px]
                              flex
                              items-center
                              justify-center
                            ">
                              {unread > 9
                                ? "9+"
                                : unread}
                            </span>
                          )}
                        </div>

                        {/* Candidate */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className={`
                                truncate
                                text-sm
                                ${
                                  unread > 0
                                    ? "font-bold text-gray-900"
                                    : "font-semibold text-gray-800"
                                }
                              `}
                            >
                              {conversation.other_user_name ||
                                "Candidate"}
                            </h3>

                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatTime(
                                conversation.last_message_time
                              )}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {conversation.other_user_email ||
                              ""}
                          </p>

                          <p
                            className={`
                              text-xs
                              truncate
                              mt-1
                              ${
                                unread > 0
                                  ? "font-medium text-gray-700"
                                  : "text-gray-500"
                              }
                            `}
                          >
                            {conversation.last_message ||
                              "No message"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </aside>

        {/* =================================================
            CHAT AREA
        ================================================= */}

        <main
          className={`
            flex-1
            min-w-0
            min-h-0
            flex-col
            bg-gray-50
            overflow-hidden
            ${
              mobileChatOpen
                ? "flex"
                : "hidden md:flex"
            }
          `}
        >
          {!selectedCandidate ? (
            <div className="flex-1 min-h-0 flex items-center justify-center p-6">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                  <MessageCircle
                    size={36}
                    className="text-blue-500"
                  />
                </div>

                <h2 className="mt-5 text-xl font-bold text-gray-900">
                  Select a Candidate
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Select a candidate to start or continue a conversation.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* =================================================
                  CHAT HEADER
              ================================================= */}

              <header
                className="
                  h-[72px]
                  shrink-0
                  px-4
                  md:px-6
                  bg-white
                  border-b
                  border-gray-200
                  flex
                  items-center
                  gap-3
                "
              >
                {/* Mobile Back */}

                <button
                  type="button"
                  onClick={() =>
                    setMobileChatOpen(false)
                  }
                  className="
                    md:hidden
                    w-9
                    h-9
                    rounded-lg
                    hover:bg-gray-100
                    flex
                    items-center
                    justify-center
                  "
                >
                  <ArrowLeft size={20} />
                </button>

                {/* Avatar */}

                <div className="
                  w-11
                  h-11
                  shrink-0
                  rounded-full
                  bg-blue-100
                  text-blue-700
                  flex
                  items-center
                  justify-center
                  font-bold
                ">
                  {getInitial(
                    selectedCandidate.name
                  )}
                </div>

                {/* Candidate */}

                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900 truncate">
                    {selectedCandidate.name}
                  </h2>

                  <p className="text-xs text-gray-500 truncate">
                    {selectedCandidate.email ||
                      "Candidate"}
                  </p>
                </div>

                {/* Live */}

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 shrink-0">
                  <span className="
                    w-2
                    h-2
                    rounded-full
                    bg-green-500
                    animate-pulse
                  " />

                  LIVE
                </div>
              </header>

              {/* =================================================
                  MESSAGES SCROLL AREA
              ================================================= */}

              <div
                ref={messagesContainerRef}
                className="
                  flex-1
                  min-h-0
                  overflow-y-auto
                  overscroll-contain
                  p-4
                  md:p-6
                "
              >
               
{messagesLoading ? (
  <div className="space-y-5 animate-pulse">
    {/* Received message skeleton */}
    <div className="flex justify-start">
      <div className="max-w-[75%] space-y-2 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3">
        <div className="h-3 w-40 max-w-full rounded bg-gray-200" />
        <div className="h-3 w-28 max-w-full rounded bg-gray-100" />
        <div className="h-2 w-12 rounded bg-gray-100 ml-auto" />
      </div>
    </div>

    {/* Sent message skeleton */}
    <div className="flex justify-end">
      <div className="max-w-[75%] space-y-2 rounded-2xl rounded-br-md bg-blue-100 px-4 py-3">
        <div className="h-3 w-48 max-w-full rounded bg-blue-200" />
        <div className="h-3 w-32 max-w-full rounded bg-blue-200" />
        <div className="h-2 w-12 rounded bg-blue-200 ml-auto" />
      </div>
    </div>

    {/* Another received message */}
    <div className="flex justify-start">
      <div className="max-w-[75%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3">
        <div className="h-3 w-36 max-w-full rounded bg-gray-200" />
        <div className="mt-2 h-3 w-24 max-w-full rounded bg-gray-100" />
      </div>
    </div>
  </div>
) : messages.length === 0 ? (
                  <div className="min-h-full flex items-center justify-center">
                    <div className="text-center max-w-sm">
                      <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto">
                        <MessageCircle
                          size={28}
                          className="text-gray-400"
                        />
                      </div>

                      <h3 className="mt-4 font-semibold text-gray-800">
                        Start Conversation
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Send your first message to this candidate.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map(
                      (message, index) => {
                        const senderId =
                          Number(
                            message.sender_id
                          );

                        const isMine =
                          senderId ===
                          currentUserId;

                        const messageDate =
                          safeDate(
                            message.created_at
                          );

                        const previousMessage =
                          messages[index - 1];

                        const previousDate =
                          previousMessage
                            ? safeDate(
                                previousMessage.created_at
                              )
                            : null;

                        const showDate =
                          !previousDate ||
                          !messageDate ||
                          previousDate.toDateString() !==
                            messageDate.toDateString();

                        const isRead =
                          Number(
                            message.is_read
                          ) === 1;

                        return (
                          <React.Fragment
                            key={
                              message.id ||
                              `${senderId}-${index}`
                            }
                          >
                            {/* Date */}

                            {showDate && (
                              <div className="flex justify-center py-2">
                                <span className="
                                  px-3
                                  py-1
                                  rounded-full
                                  bg-white
                                  border
                                  border-gray-200
                                  text-[10px]
                                  text-gray-500
                                ">
                                  {formatDate(
                                    message.created_at
                                  )}
                                </span>
                              </div>
                            )}

                            {/* Message */}

                            <div
                              className={`
                                flex
                                ${
                                  isMine
                                    ? "justify-end"
                                    : "justify-start"
                                }
                              `}
                            >
                              <div
                                className={`
                                  max-w-[75%]
                                  md:max-w-[65%]
                                  rounded-2xl
                                  px-4
                                  py-3
                                  shadow-sm
                                  ${
                                    isMine
                                      ? "bg-blue-600 text-white rounded-br-md"
                                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                                  }
                                `}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.message}
                                </p>

                                <div
                                  className={`
                                    mt-1.5
                                    flex
                                    items-center
                                    justify-end
                                    gap-1
                                    text-[10px]
                                    ${
                                      isMine
                                        ? "text-blue-100"
                                        : "text-gray-400"
                                    }
                                  `}
                                >
                                  <span>
                                    {formatTime(
                                      message.created_at
                                    )}
                                  </span>

                                  {isMine &&
                                    (isRead ? (
                                      <CheckCheck
                                        size={13}
                                      />
                                    ) : (
                                      <Check
                                        size={13}
                                      />
                                    ))}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      }
                    )}

                    <div
                      ref={messagesEndRef}
                      className="h-1"
                    />
                  </div>
                )}
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="shrink-0 px-4 py-2 bg-gray-50">
                  <div className="
                    bg-red-50
                    border
                    border-red-200
                    text-red-600
                    text-xs
                    rounded-lg
                    px-3
                    py-2
                  ">
                    {error}
                  </div>
                </div>
              )}

              {/* =================================================
                  SEND BOX
              ================================================= */}

              <form
                onSubmit={handleSendMessage}
                className="
                  shrink-0
                  bg-white
                  border-t
                  border-gray-200
                  p-3
                  md:p-4
                "
              >
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(event) =>
                      setText(
                        event.target.value
                      )
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    maxLength={5000}
                    className="
                      flex-1
                      resize-none
                      min-h-[44px]
                      max-h-[120px]
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:bg-white
                    "
                  />

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !text.trim()
                    }
                    className="
                      w-11
                      h-11
                      shrink-0
                      rounded-xl
                      bg-blue-600
                      text-white
                      flex
                      items-center
                      justify-center
                      transition
                      hover:bg-blue-700
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {sending ? (
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={19} />
                    )}
                  </button>
                </div>

                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[10px] text-gray-400">
                    Enter to send • Shift + Enter for new line
                  </span>

                  <span className="text-[10px] text-gray-400">
                    {text.length}/5000
                  </span>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecruiterMessage;