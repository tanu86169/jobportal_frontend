import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  Send,
  MoreVertical,
  ArrowLeft,
  MessageSquare,
  CheckCheck,
  RefreshCw,
  UserRound,
  Circle,
  X,
} from "lucide-react";

// ======================================================
// API
// ======================================================

import API_BASE from "../../config/api";

const MESSAGES_BASE = `${API_BASE}/messages`;

const CONVERSATIONS_API =
  `${MESSAGES_BASE}/get-conversations.php`;

const MESSAGES_API =
  `${MESSAGES_BASE}/get-messages.php`;

const SEND_MESSAGE_API =
  `${MESSAGES_BASE}/send-message.php`;

const POLLING_TIME = 5000;

// ======================================================
// SKELETON PRIMITIVE
// ======================================================

const Skeleton = ({ className = "", style }) => (
  <div
    style={style}
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

// ======================================================
// MESSAGES SKELETON
// ======================================================

const MessagesSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ===== PAGE HEADER SKELETON ===== */}
        <div className="mb-5 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-32 sm:h-8 sm:w-40" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>

        {/* ===== CHAT CONTAINER SKELETON ===== */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="grid h-[calc(100vh-190px)] min-h-[560px] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">

            {/* ===== SIDEBAR SKELETON ===== */}
            <aside className="flex min-w-0 flex-col border-r border-slate-200 bg-white">

              {/* Sidebar header */}
              <div className="border-b border-slate-100 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>

              {/* Conversation list */}
              <div className="min-h-0 flex-1 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-slate-100 px-4 py-4"
                  >
                    <div className="flex gap-3">
                      <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-3 w-16" />
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-3 flex-1" />
                          <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* ===== CHAT WINDOW SKELETON ===== */}
            <section className="hidden min-w-0 flex-col bg-white md:flex">

              {/* Chat header */}
              <div className="flex min-h-[76px] items-center justify-between border-b border-slate-200 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              </div>

              {/* Messages area */}
              <div className="min-h-0 flex-1 overflow-hidden bg-slate-50/80 px-3 py-5 sm:px-6">
                <div className="mx-auto max-w-4xl space-y-4">

                  {/* Incoming message */}
                  <div className="flex justify-start">
                    <div className="max-w-[88%] space-y-2 sm:max-w-[70%]">
                      <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-md" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>

                  {/* Outgoing message */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] space-y-2 sm:max-w-[70%]">
                      <Skeleton className="ml-auto h-12 w-56 rounded-2xl rounded-br-md" />
                      <Skeleton className="ml-auto h-3 w-16" />
                    </div>
                  </div>

                  {/* Incoming message */}
                  <div className="flex justify-start">
                    <div className="max-w-[88%] space-y-2 sm:max-w-[70%]">
                      <Skeleton className="h-12 w-48 rounded-2xl rounded-bl-md" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>

                  {/* Outgoing message */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] space-y-2 sm:max-w-[70%]">
                      <Skeleton className="ml-auto h-20 w-72 rounded-2xl rounded-br-md" />
                      <Skeleton className="ml-auto h-3 w-16" />
                    </div>
                  </div>

                  {/* Incoming message */}
                  <div className="flex justify-start">
                    <div className="max-w-[88%] space-y-2 sm:max-w-[70%]">
                      <Skeleton className="h-10 w-40 rounded-2xl rounded-bl-md" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Message input */}
              <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
                <div className="mx-auto max-w-4xl">
                  <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                    <Skeleton className="h-11 flex-1 rounded-xl" />
                    <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                  </div>
                  <Skeleton className="mt-2 h-3 w-64" />
                </div>
              </div>

            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// COMPONENT
// ======================================================

const Messages = () => {
  // ====================================================
  // USER
  // ====================================================

  const [user, setUser] = useState(null);

  // ====================================================
  // CONVERSATIONS
  // ====================================================

  const [conversations, setConversations] =
    useState([]);

  const [selectedChat, setSelectedChat] =
    useState(null);

  // ====================================================
  // MESSAGES
  // ====================================================

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  // ====================================================
  // SEARCH
  // ====================================================

  const [search, setSearch] =
    useState("");

  // ====================================================
  // LOADING
  // ====================================================

  const [loading, setLoading] =
    useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  // ====================================================
  // ERROR
  // ====================================================

  const [error, setError] =
    useState("");

  // ====================================================
  // REFS
  // ====================================================

  const selectedChatRef =
    useRef(null);

  const messagesEndRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  const mountedRef =
    useRef(true);

  // ====================================================
  // CURRENT USER ID
  // ====================================================

  const currentUserId =
    Number(user?.id || 0);

  // ====================================================
  // COMPONENT MOUNT / UNMOUNT
  // ====================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ====================================================
  // GET LOGGED-IN USER
  // ====================================================

  const getUser = useCallback(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const parsedUser =
        JSON.parse(storedUser);

      return parsedUser;
    } catch (err) {
      console.error(
        "User parse error:",
        err
      );

      return null;
    }
  }, []);

  // ====================================================
  // CHECK RECRUITER
  // ====================================================

  const isRecruiter = useCallback(
    (chat) => {
      return (
        String(
          chat?.other_user_role || ""
        )
          .trim()
          .toLowerCase() ===
        "recruiter"
      );
    },
    []
  );

  // ====================================================
  // UPDATE SELECTED CHAT REF
  // ====================================================

  useEffect(() => {
    selectedChatRef.current =
      selectedChat;
  }, [selectedChat]);

  // ====================================================
  // SCROLL TO BOTTOM
  // ====================================================

  const scrollToBottom =
    useCallback(
      (behavior = "smooth") => {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView(
            {
              behavior,
              block: "end",
            }
          );
        });
      },
      []
    );

  // ====================================================
  // SAFE DATE PARSER
  // ====================================================

  const parseDate = useCallback(
    (value) => {
      if (!value) {
        return null;
      }

      const stringValue =
        String(value);

      const normalized =
        stringValue.includes("T")
          ? stringValue
          : stringValue.replace(
              " ",
              "T"
            );

      const date =
        new Date(normalized);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return null;
      }

      return date;
    },
    []
  );

  // ====================================================
  // FORMAT TIME
  // ====================================================

  const formatTime = useCallback(
    (value) => {
      const date =
        parseDate(value);

      if (!date) {
        return "";
      }

      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    },
    [parseDate]
  );

  // ====================================================
  // FORMAT DATE
  // ====================================================

  const formatDate = useCallback(
    (value) => {
      const date =
        parseDate(value);

      if (!date) {
        return "";
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      );
    },
    [parseDate]
  );

  // ====================================================
  // GET INITIAL
  // ====================================================

  const getInitial = useCallback(
    (name) => {
      return String(
        name || "R"
      )
        .trim()
        .charAt(0)
        .toUpperCase();
    },
    []
  );

  // ====================================================
  // FETCH ACTUAL CONVERSATIONS
  // ====================================================

  const fetchConversations =
    useCallback(
      async ({
        showLoader = false,
        autoSelect = true,
      } = {}) => {
        try {
          if (showLoader) {
            setLoading(true);
          }

          const loggedUser =
            getUser();

          // --------------------------------------------
          // LOGIN CHECK
          // --------------------------------------------

          if (!loggedUser?.id) {
            setError(
              "Please login first to access messages."
            );

            setConversations([]);
            setSelectedChat(null);
            setMessages([]);

            return;
          }

          // --------------------------------------------
          // ROLE CHECK
          // --------------------------------------------

          const loggedRole =
            String(
              loggedUser.role || ""
            )
              .trim()
              .toLowerCase();

          if (
            loggedRole !==
            "candidate"
          ) {
            setError(
              "This messages page is for candidates only."
            );

            setConversations([]);
            setSelectedChat(null);
            setMessages([]);

            return;
          }

          // --------------------------------------------
          // USER ID
          // --------------------------------------------

          const userId =
            Number(loggedUser.id);

          if (!userId) {
            setError(
              "Invalid candidate user ID."
            );

            return;
          }

          // Keep latest user
          if (
            mountedRef.current
          ) {
            setUser(loggedUser);
          }

          // --------------------------------------------
          // API
          // --------------------------------------------

          const response =
            await fetch(
              `${CONVERSATIONS_API}?userId=${encodeURIComponent(
                userId
              )}&_=${Date.now()}`,
              {
                method: "GET",
                headers: {
                  Accept:
                    "application/json",
                },
                cache: "no-store",
              }
            );

          const raw =
            await response.text();

          let data;

          try {
            data =
              JSON.parse(raw);
          } catch {
            console.error(
              "Conversations response:",
              raw
            );

            throw new Error(
              "Invalid conversations response from server."
            );
          }

          if (
            !response.ok ||
            !data?.success
          ) {
            throw new Error(
              data?.message ||
                "Unable to load conversations."
            );
          }

          // --------------------------------------------
          // ONLY ACTUAL RECRUITER CONVERSATIONS
          // --------------------------------------------

          const actualConversations =
            (
              Array.isArray(
                data.conversations
              )
                ? data.conversations
                : []
            )
              .filter((chat) => {
                const otherUserId =
                  Number(
                    chat.other_user_id
                  );

                return (
                  isRecruiter(
                    chat
                  ) &&
                  otherUserId > 0 &&
                  otherUserId !==
                    userId
                );
              })
              .map((chat) => ({
                ...chat,

                other_user_id:
                  Number(
                    chat.other_user_id
                  ),

                other_user_name:
                  chat.other_user_name ||
                  "Recruiter",

                other_user_email:
                  chat.other_user_email ||
                  "",

                other_user_role:
                  "recruiter",

                last_message:
                  chat.last_message ||
                  "",

                last_message_time:
                  chat.last_message_time ||
                  null,

                unread_count:
                  Number(
                    chat.unread_count ||
                      0
                  ),
              }));

          if (
            mountedRef.current
          ) {
            setConversations(
              actualConversations
            );

            setError("");
          }

          // ==================================================
          // KEEP CURRENT CHAT
          // ==================================================

          const currentChat =
            selectedChatRef.current;

          if (
            currentChat?.other_user_id
          ) {
            const updatedChat =
              actualConversations.find(
                (chat) =>
                  Number(
                    chat.other_user_id
                  ) ===
                  Number(
                    currentChat.other_user_id
                  )
              );

            if (updatedChat) {
              if (
                mountedRef.current
              ) {
                setSelectedChat(
                  updatedChat
                );
              }

              return;
            }

            // Current conversation no longer exists
            if (
              mountedRef.current
            ) {
              setSelectedChat(
                null
              );

              setMessages([]);
            }

            return;
          }

          // ==================================================
          // AUTO SELECT
          // ==================================================

          if (
            autoSelect &&
            actualConversations.length >
              0
          ) {
            if (
              mountedRef.current
            ) {
              setSelectedChat(
                actualConversations[0]
              );
            }

            return;
          }

          // ==================================================
          // NO CONVERSATIONS
          // ==================================================

          if (
            actualConversations.length ===
            0
          ) {
            if (
              mountedRef.current
            ) {
              setSelectedChat(
                null
              );

              setMessages([]);
            }
          }
        } catch (err) {
          console.error(
            "Conversation error:",
            err
          );

          if (
            mountedRef.current
          ) {
            setError(
              err?.message ||
                "Unable to load conversations."
            );
          }
        } finally {
          if (
            showLoader &&
            mountedRef.current
          ) {
            setLoading(false);
          }
        }
      },
      [
        getUser,
        isRecruiter,
      ]
    );

  // ====================================================
  // FETCH MESSAGES
  // ====================================================

  const fetchMessages =
    useCallback(
      async (
        conversation,
        {
          showLoader = true,
          scroll = false,
        } = {}
      ) => {
        if (
          !conversation?.other_user_id ||
          !currentUserId
        ) {
          return;
        }

        // --------------------------------------------
        // ONLY RECRUITER
        // --------------------------------------------

        if (
          !isRecruiter(
            conversation
          )
        ) {
          setMessages([]);
          return;
        }

        const otherUserId =
          Number(
            conversation.other_user_id
          );

        if (
          !otherUserId ||
          otherUserId ===
            currentUserId
        ) {
          return;
        }

        try {
          if (showLoader) {
            setMessagesLoading(
              true
            );
          }

          const response =
            await fetch(
              `${MESSAGES_API}?userId=${encodeURIComponent(
                currentUserId
              )}&otherUserId=${encodeURIComponent(
                otherUserId
              )}&_=${Date.now()}`,
              {
                method: "GET",
                headers: {
                  Accept:
                    "application/json",
                },
                cache: "no-store",
              }
            );

          const raw =
            await response.text();

          let data;

          try {
            data =
              JSON.parse(raw);
          } catch {
            console.error(
              "Messages response:",
              raw
            );

            throw new Error(
              "Invalid messages response from server."
            );
          }

          if (
            !response.ok ||
            !data?.success
          ) {
            throw new Error(
              data?.message ||
                "Unable to fetch messages."
            );
          }

          const receivedMessages =
            Array.isArray(
              data.messages
            )
              ? data.messages
              : [];

          if (
            mountedRef.current
          ) {
            setMessages(
              receivedMessages
            );
          }

          if (
            scroll &&
            receivedMessages.length >
              0
          ) {
            scrollToBottom(
              "smooth"
            );
          }
        } catch (err) {
          console.error(
            "Fetch messages error:",
            err
          );
        } finally {
          if (
            showLoader &&
            mountedRef.current
          ) {
            setMessagesLoading(
              false
            );
          }
        }
      },
      [
        currentUserId,
        isRecruiter,
        scrollToBottom,
      ]
    );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    const loggedUser =
      getUser();

    if (!loggedUser?.id) {
      setError(
        "Please login first to access messages."
      );

      setLoading(false);

      return;
    }

    const loggedRole =
      String(
        loggedUser.role || ""
      )
        .trim()
        .toLowerCase();

    if (
      loggedRole !==
      "candidate"
    ) {
      setError(
        "This messages page is for candidates only."
      );

      setLoading(false);

      return;
    }

    setUser(loggedUser);

    fetchConversations({
      showLoader: true,
      autoSelect: true,
    });
  }, [
    getUser,
    fetchConversations,
  ]);

  // ====================================================
  // LOAD MESSAGES WHEN CHAT CHANGES
  // ====================================================

  useEffect(() => {
    if (
      !selectedChat?.other_user_id ||
      !currentUserId
    ) {
      setMessages([]);
      return;
    }

    // --------------------------------------------
    // Make sure selected chat is REAL
    // --------------------------------------------

    const exists =
      conversations.some(
        (chat) =>
          Number(
            chat.other_user_id
          ) ===
          Number(
            selectedChat.other_user_id
          ) &&
          isRecruiter(chat)
      );

    if (!exists) {
      setSelectedChat(null);
      setMessages([]);
      return;
    }

    fetchMessages(
      selectedChat,
      {
        showLoader: true,
        scroll: true,
      }
    );
  }, [
    selectedChat?.other_user_id,
    currentUserId,
    conversations,
    isRecruiter,
    fetchMessages,
  ]);

  // ====================================================
  // POLLING
  // ====================================================

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const interval =
      setInterval(() => {
        // --------------------------------------------
        // Refresh conversations
        // --------------------------------------------

        fetchConversations({
          showLoader: false,
          autoSelect: false,
        });

        // --------------------------------------------
        // Refresh current chat
        // --------------------------------------------

        const currentChat =
          selectedChatRef.current;

        if (
          currentChat?.other_user_id &&
          isRecruiter(
            currentChat
          )
        ) {
          fetchMessages(
            currentChat,
            {
              showLoader: false,
              scroll: false,
            }
          );
        }
      }, POLLING_TIME);

    return () =>
      clearInterval(
        interval
      );
  }, [
    currentUserId,
    fetchConversations,
    fetchMessages,
    isRecruiter,
  ]);

  // ====================================================
  // DISPLAY CONVERSATIONS
  // ====================================================

  const displayConversations =
    useMemo(() => {
      return conversations.filter(
        (chat) =>
          isRecruiter(chat)
      );
    }, [
      conversations,
      isRecruiter,
    ]);

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredConversations =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return displayConversations;
      }

      return displayConversations.filter(
        (chat) => {
          const name =
            String(
              chat.other_user_name ||
                ""
            ).toLowerCase();

          const email =
            String(
              chat.other_user_email ||
                ""
            ).toLowerCase();

          const lastMessage =
            String(
              chat.last_message ||
                ""
            ).toLowerCase();

          return (
            name.includes(value) ||
            email.includes(value) ||
            lastMessage.includes(value)
          );
        }
      );
    }, [
      displayConversations,
      search,
    ]);

  // ====================================================
  // TOTAL UNREAD
  // ====================================================

  const totalUnread =
    useMemo(() => {
      return displayConversations.reduce(
        (total, chat) =>
          total +
          Number(
            chat.unread_count || 0
          ),
        0
      );
    }, [
      displayConversations,
    ]);

  // ====================================================
  // SELECT CONVERSATION
  // ====================================================

  const handleSelectConversation =
    useCallback(
      (chat) => {
        if (
          !chat?.other_user_id ||
          !isRecruiter(chat)
        ) {
          return;
        }

        const exists =
          conversations.some(
            (item) =>
              Number(
                item.other_user_id
              ) ===
                Number(
                  chat.other_user_id
                ) &&
              isRecruiter(item)
          );

        if (!exists) {
          return;
        }

        setSelectedChat(chat);
        setMessages([]);
      },
      [
        conversations,
        isRecruiter,
      ]
    );

  // ====================================================
  // SEND MESSAGE
  // ====================================================

  const sendMessage =
    useCallback(
      async () => {
        const text =
          message.trim();

        if (
          !text ||
          !selectedChat?.other_user_id ||
          !currentUserId ||
          sending
        ) {
          return;
        }

        const receiverId =
          Number(
            selectedChat.other_user_id
          );

        // --------------------------------------------
        // Only actual conversation
        // --------------------------------------------

        const exists =
          conversations.some(
            (chat) =>
              Number(
                chat.other_user_id
              ) === receiverId &&
              isRecruiter(chat)
          );

        if (!exists) {
          alert(
            "You can message recruiters with an existing conversation only."
          );

          return;
        }

        // --------------------------------------------
        // Cannot message self
        // --------------------------------------------

        if (
          receiverId ===
          currentUserId
        ) {
          alert(
            "You cannot send a message to yourself."
          );

          return;
        }

        // --------------------------------------------
        // Max length
        // --------------------------------------------

        if (
          text.length >
          5000
        ) {
          alert(
            "Message cannot exceed 5000 characters."
          );

          return;
        }

        try {
          setSending(true);

          const response =
            await fetch(
              SEND_MESSAGE_API,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  Accept:
                    "application/json",
                },

                body: JSON.stringify({
                  sender_id:
                    currentUserId,

                  receiver_id:
                    receiverId,

                  message:
                    text,
                }),
              }
            );

          const raw =
            await response.text();

          let data;

          try {
            data =
              JSON.parse(raw);
          } catch {
            console.error(
              "Send message response:",
              raw
            );

            throw new Error(
              "Invalid response from send-message API."
            );
          }

          if (
            !response.ok ||
            !data?.success
          ) {
            throw new Error(
              data?.message ||
                "Unable to send message."
            );
          }

          // ------------------------------------------
          // Clear input
          // ------------------------------------------

          setMessage("");

          // ------------------------------------------
          // Refresh messages
          // ------------------------------------------

          await fetchMessages(
            selectedChat,
            {
              showLoader: false,
              scroll: true,
            }
          );

          // ------------------------------------------
          // Refresh conversations
          // ------------------------------------------

          await fetchConversations({
            showLoader: false,
            autoSelect: false,
          });

          // ------------------------------------------
          // Focus textarea
          // ------------------------------------------

          textareaRef.current?.focus();
        } catch (err) {
          console.error(
            "Send message error:",
            err
          );

          alert(
            err?.message ||
              "Unable to send message."
          );
        } finally {
          if (
            mountedRef.current
          ) {
            setSending(false);
          }
        }
      },
      [
        message,
        selectedChat,
        currentUserId,
        sending,
        conversations,
        isRecruiter,
        fetchMessages,
        fetchConversations,
      ]
    );

  // ====================================================
  // KEY DOWN
  // ====================================================

  const handleKeyDown =
    useCallback(
      (event) => {
        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {
          event.preventDefault();

          sendMessage();
        }
      },
      [sendMessage]
    );

  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh =
    useCallback(
      async () => {
        if (refreshing) {
          return;
        }

        setRefreshing(true);

        try {
          await fetchConversations({
            showLoader: false,
            autoSelect: false,
          });

          const chat =
            selectedChatRef.current;

          if (
            chat?.other_user_id &&
            isRecruiter(chat)
          ) {
            await fetchMessages(
              chat,
              {
                showLoader: false,
                scroll: false,
              }
            );
          }
        } finally {
          if (
            mountedRef.current
          ) {
            setRefreshing(false);
          }
        }
      },
      [
        refreshing,
        fetchConversations,
        fetchMessages,
        isRecruiter,
      ]
    );

  // ====================================================
  // LOADING (SKELETON)
  // ====================================================

  if (loading) {
    return <MessagesSkeleton />;
  }

  // ====================================================
  // ERROR SCREEN
  // ====================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <MessageSquare
            size={32}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to Load Messages
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              setError("");

              fetchConversations({
                showLoader: true,
                autoSelect: true,
              });
            }}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-5 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
              <MessageSquare
                size={23}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Messages
                </h1>

                {totalUnread > 0 && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {totalUnread} unread
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Communicate with recruiters you
                have conversations with.
              </p>
            </div>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            disabled={refreshing}
            onClick={
              handleRefresh
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ==================================================
            CHAT CONTAINER
        ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

          <div className="grid h-[calc(100vh-190px)] min-h-[560px] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
              className={`${
                selectedChat
                  ? "hidden md:flex"
                  : "flex"
              } min-w-0 flex-col border-r border-slate-200 bg-white`}
            >

              {/* SIDEBAR HEADER */}

              <div className="border-b border-slate-100 p-4">

                <div className="mb-4 flex items-center justify-between">

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Recruiters
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        displayConversations.length
                      }{" "}
                      conversation
                      {displayConversations.length !==
                      1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  {totalUnread > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      <Circle
                        size={7}
                        fill="currentColor"
                      />

                      {totalUnread}
                    </span>
                  )}
                </div>

                {/* SEARCH */}

                <div className="relative">

                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search recruiter..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                    >
                      <X
                        size={14}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* CONVERSATION LIST */}

              <div className="min-h-0 flex-1 overflow-y-auto">

                {filteredConversations.length ===
                0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <MessageSquare
                        size={26}
                        className="text-slate-400"
                      />
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-800">
                      No Conversations Yet
                    </h3>

                    <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
                      {search
                        ? "No recruiter matches your search."
                        : "When a recruiter and you exchange messages, the conversation will appear here."}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map(
                    (chat) => {
                      const chatId =
                        Number(
                          chat.other_user_id
                        );

                      const isSelected =
                        Number(
                          selectedChat?.other_user_id
                        ) ===
                        chatId;

                      const unread =
                        Number(
                          chat.unread_count ||
                            0
                        );

                      return (
                        <button
                          key={
                            chatId
                          }
                          type="button"
                          onClick={() =>
                            handleSelectConversation(
                              chat
                            )
                          }
                          className={`relative w-full border-b border-slate-100 px-4 py-4 text-left transition ${
                            isSelected
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                        >

                          {isSelected && (
                            <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-blue-600" />
                          )}

                          <div className="flex gap-3">

                            {/* AVATAR */}

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {getInitial(
                                chat.other_user_name
                              )}
                            </div>

                            {/* DETAILS */}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-center justify-between gap-2">

                                <h3
                                  className={`truncate text-sm ${
                                    unread >
                                    0
                                      ? "font-bold text-slate-900"
                                      : "font-semibold text-slate-800"
                                  }`}
                                >
                                  {chat.other_user_name ||
                                    "Recruiter"}
                                </h3>

                                <span className="shrink-0 text-[10px] text-slate-400">
                                  {formatTime(
                                    chat.last_message_time
                                  )}
                                </span>
                              </div>

                              <p className="mt-1 text-xs font-medium text-blue-600">
                                Recruiter
                              </p>

                              <div className="mt-1 flex items-center justify-between gap-2">

                                <p
                                  className={`truncate text-xs ${
                                    unread >
                                    0
                                      ? "font-semibold text-slate-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {chat.last_message ||
                                    "No messages yet"}
                                </p>

                                {unread >
                                  0 && (
                                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                                    {unread >
                                    99
                                      ? "99+"
                                      : unread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )
                )}
              </div>
            </aside>

            {/* ==================================================
                CHAT WINDOW
            ================================================== */}

            {selectedChat &&
            isRecruiter(
              selectedChat
            ) &&
            conversations.some(
              (chat) =>
                Number(
                  chat.other_user_id
                ) ===
                Number(
                  selectedChat.other_user_id
                )
            ) ? (
              <section className="flex min-w-0 flex-col bg-white">

                {/* ==================================================
                    CHAT HEADER
                ================================================== */}

                <div className="flex min-h-[76px] items-center justify-between border-b border-slate-200 px-4 sm:px-6">

                  <div className="flex min-w-0 items-center gap-3">

                    {/* MOBILE BACK */}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChat(
                          null
                        );

                        setMessages([]);
                      }}
                      className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                    >
                      <ArrowLeft
                        size={20}
                      />
                    </button>

                    {/* AVATAR */}

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                      {getInitial(
                        selectedChat.other_user_name
                      )}
                    </div>

                    {/* INFO */}

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                          {selectedChat.other_user_name ||
                            "Recruiter"}
                        </h2>

                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          Recruiter
                        </span>
                      </div>

                      <p className="truncate text-xs text-slate-400">
                        {selectedChat.other_user_email ||
                          "Recruiter"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    title="More"
                    className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100"
                  >
                    <MoreVertical
                      size={18}
                    />
                  </button>
                </div>

                {/* ==================================================
                    MESSAGE HISTORY
                ================================================== */}

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 px-3 py-5 sm:px-6">

                  {messagesLoading ? (
                    <div className="flex h-full items-center justify-center">

                      <div className="text-center">

                        <RefreshCw
                          size={24}
                          className="mx-auto animate-spin text-blue-600"
                        />

                        <p className="mt-3 text-xs text-slate-400">
                          Loading messages...
                        </p>
                      </div>
                    </div>
                  ) : messages.length ===
                    0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">

                      <UserRound
                        size={32}
                        className="text-blue-600"
                      />

                      <h3 className="mt-4 font-bold text-slate-800">
                        No Messages Yet
                      </h3>

                      <p className="mt-2 text-xs text-slate-400">
                        No messages found in
                        this conversation.
                      </p>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-4xl space-y-4">

                      {messages.map(
                        (
                          msg,
                          index
                        ) => {
                          const isMine =
                            Number(
                              msg.sender_id
                            ) ===
                            currentUserId;

                          const messageKey =
                            msg.id ||
                            msg.message_id ||
                            `${msg.created_at}-${index}`;

                          const currentDate =
                            formatDate(
                              msg.created_at
                            );

                          const previousDate =
                            index > 0
                              ? formatDate(
                                  messages[
                                    index -
                                      1
                                  ]
                                    ?.created_at
                                )
                              : "";

                          return (
                            <React.Fragment
                              key={
                                messageKey
                              }
                            >

                              {/* DATE */}

                              {currentDate !==
                                previousDate && (
                                <div className="flex justify-center py-2">

                                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-400 shadow-sm">
                                    {
                                      currentDate
                                    }
                                  </span>

                                </div>
                              )}

                              {/* MESSAGE */}

                              <div
                                className={`flex ${
                                  isMine
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >

                                <div className="max-w-[88%] sm:max-w-[70%]">

                                  {/* BUBBLE */}

                                  <div
                                    className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                      isMine
                                        ? "rounded-br-md bg-blue-600 text-white"
                                        : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                                    }`}
                                  >
                                    {
                                      msg.message
                                    }
                                  </div>

                                  {/* TIME */}

                                  <div
                                    className={`mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 ${
                                      isMine
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >

                                    <span>
                                      {formatTime(
                                        msg.created_at
                                      )}
                                    </span>

                                    {isMine && (
                                      <CheckCheck
                                        size={
                                          13
                                        }
                                        className="text-blue-400"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        }
                      )}

                      <div
                        ref={
                          messagesEndRef
                        }
                      />
                    </div>
                  )}
                </div>

                {/* ==================================================
                    MESSAGE INPUT
                ================================================== */}

                <div className="border-t border-slate-200 bg-white p-3 sm:p-4">

                  <div className="mx-auto max-w-4xl">

                    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:bg-white">

                      <textarea
                        ref={
                          textareaRef
                        }
                        value={
                          message
                        }
                        onChange={(
                          event
                        ) =>
                          setMessage(
                            event.target
                              .value
                          )
                        }
                        onKeyDown={
                          handleKeyDown
                        }
                        rows={1}
                        maxLength={
                          5000
                        }
                        placeholder="Message recruiter..."
                        className="max-h-32 min-h-[44px] w-full resize-y bg-transparent px-2 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        onClick={
                          sendMessage
                        }
                        disabled={
                          sending ||
                          !message.trim() ||
                          !selectedChat?.other_user_id
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Send message"
                      >
                        {sending ? (
                          <RefreshCw
                            size={19}
                            className="animate-spin"
                          />
                        ) : (
                          <Send
                            size={19}
                          />
                        )}
                      </button>
                    </div>

                    <p className="mt-2 px-1 text-[10px] text-slate-400">
                      Press Enter to send •
                      Shift + Enter for a new
                      line
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              // =================================================
              // EMPTY CHAT
              // =================================================

              <section className="hidden min-w-0 flex-col items-center justify-center bg-slate-50 md:flex">

                <div className="px-6 text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">

                    <MessageSquare
                      size={36}
                      className="text-blue-500"
                    />
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-800">
                    {displayConversations.length >
                    0
                      ? "Select a Conversation"
                      : "No Conversations Yet"}
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    {displayConversations.length >
                    0
                      ? "Select a recruiter from the sidebar to view messages."
                      : "When a recruiter sends you a message, the conversation will appear here."}
                  </p>

                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;