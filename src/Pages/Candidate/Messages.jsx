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
  Pencil,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";

// ======================================================
// API
// ======================================================

import API_BASE from "../../config/api";

const MESSAGES_BASE = `${API_BASE}/messages`;

const CONVERSATIONS_API = `${MESSAGES_BASE}/get-conversations.php`;
const MESSAGES_API = `${MESSAGES_BASE}/get-messages.php`;
const SEND_MESSAGE_API = `${MESSAGES_BASE}/send-message.php`;
const EDIT_MESSAGE_API = `${MESSAGES_BASE}/edit-message.php`;
const DELETE_MESSAGE_API = `${MESSAGES_BASE}/delete-message.php`;

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

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="grid h-[calc(100vh-190px)] min-h-[560px] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="flex min-w-0 flex-col border-r border-slate-200 bg-white">
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

              <div className="min-h-0 flex-1 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border-b border-slate-100 px-4 py-4">
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

            <section className="hidden min-w-0 flex-col bg-white md:flex">
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

              <div className="min-h-0 flex-1 overflow-hidden bg-slate-50/80 px-3 py-5 sm:px-6">
                <div className="mx-auto max-w-4xl space-y-4">
                  <div className="flex justify-start">
                    <div className="max-w-[88%] space-y-2 sm:max-w-[70%]">
                      <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-md" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[88%] space-y-2 sm:max-w-[70%]">
                      <Skeleton className="ml-auto h-12 w-56 rounded-2xl rounded-br-md" />
                      <Skeleton className="ml-auto h-3 w-16" />
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[88%] space-y-2 sm:max-w-[70%]">
                      <Skeleton className="h-12 w-48 rounded-2xl rounded-bl-md" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              </div>

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
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // EDIT / DELETE STATES
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ACTION MENU STATE (which message's menu is open)
  const [openMenuId, setOpenMenuId] = useState(null);

  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);
  const menuRef = useRef(null);
  const mountedRef = useRef(true);
  const skipPollRef = useRef(false);

  const currentUserId = Number(user?.id || 0);

  // ====================================================
  // MOUNT / UNMOUNT
  // ====================================================

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ====================================================
  // GET USER
  // ====================================================

  const getUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return null;
      return JSON.parse(storedUser);
    } catch (err) {
      console.error("User parse error:", err);
      return null;
    }
  }, []);

  const isCandidateRole = useCallback((value) => {
    const role = String(value ?? "")
      .trim()
      .toLowerCase();

    return role === "candidate" || role === "job-seeker";
  }, []);

  const isRecruiter = useCallback((chat) => {
    return (
      String(chat?.other_user_role || "")
        .trim()
        .toLowerCase() === "recruiter"
    );
  }, []);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // ====================================================
  // SKIP POLLING WHILE EDITING / DELETING
  // ====================================================

  useEffect(() => {
    skipPollRef.current = Boolean(editingMessageId || deleting);
  }, [editingMessageId, deleting]);

  // ====================================================
  // CLOSE ACTION MENU ON OUTSIDE CLICK / ESCAPE
  // ====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ====================================================
  // SCROLL TO BOTTOM
  // ====================================================

  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
      }
    });
  }, []);

  // ====================================================
  // AUTO SCROLL ON MESSAGE CHANGE (only when count or last ID changes)
  // ====================================================

  const lastMessageId = useMemo(() => {
    if (!messages.length) return null;
    const last = messages[messages.length - 1];
    return last?.id || last?.message_id || null;
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom("smooth");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages.length, lastMessageId, scrollToBottom]);

  // ====================================================
  // AUTO-RESIZE: send textarea
  // ====================================================

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [message]);

  // ====================================================
  // AUTO-RESIZE: edit textarea
  // ====================================================

  useEffect(() => {
    const el = editTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [editText, editingMessageId]);

  // ====================================================
  // DATE / TIME HELPERS
  // ====================================================

  const parseDate = useCallback((value) => {
    if (!value) return null;
    const stringValue = String(value);
    const normalized = stringValue.includes("T")
      ? stringValue
      : stringValue.replace(" ", "T");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }, []);

  const formatTime = useCallback(
    (value) => {
      const date = parseDate(value);
      if (!date) return "";
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [parseDate]
  );

  const formatDate = useCallback(
    (value) => {
      const date = parseDate(value);
      if (!date) return "";
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    },
    [parseDate]
  );

  const getInitial = useCallback((name) => {
    return String(name || "R").trim().charAt(0).toUpperCase();
  }, []);

  // ====================================================
  // MESSAGE ID / EDITED HELPERS
  // ====================================================

  const getMessageId = useCallback((msg) => {
    return msg?.id || msg?.message_id || null;
  }, []);

  const isMessageEdited = useCallback((msg) => {
    const flag = msg?.edited ?? msg?.is_edited ?? 0;
    return (
      flag === 1 ||
      flag === "1" ||
      flag === true ||
      flag === "true"
    );
  }, []);

  // ====================================================
  // FETCH CONVERSATIONS
  // ====================================================

  const fetchConversations = useCallback(
    async ({ showLoader = false, autoSelect = true } = {}) => {
      try {
        if (showLoader) setLoading(true);

        const loggedUser = getUser();

        if (!loggedUser?.id) {
          setError("Please login first to access messages.");
          setConversations([]);
          setSelectedChat(null);
          setMessages([]);
          return;
        }

        const loggedRole = String(loggedUser.role || "")
          .trim()
          .toLowerCase();

        if (!isCandidateRole(loggedRole)) {
          setError("This messages page is for candidates only.");
          setConversations([]);
          setSelectedChat(null);
          setMessages([]);
          return;
        }

        const userId = Number(loggedUser.id);
        if (!userId) {
          setError("Invalid candidate user ID.");
          return;
        }

        if (mountedRef.current) setUser(loggedUser);

        const response = await fetch(
          `${CONVERSATIONS_API}?userId=${encodeURIComponent(
            userId
          )}&_=${Date.now()}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }
        );

        const raw = await response.text();
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          console.error("Conversations response:", raw);
          throw new Error("Invalid conversations response from server.");
        }

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to load conversations.");
        }

        const actualConversations = (
          Array.isArray(data.conversations) ? data.conversations : []
        )
          .filter((chat) => {
            const otherUserId = Number(chat.other_user_id);
            return (
              isRecruiter(chat) &&
              otherUserId > 0 &&
              otherUserId !== userId
            );
          })
          .map((chat) => ({
            ...chat,
            other_user_id: Number(chat.other_user_id),
            other_user_name: chat.other_user_name || "Recruiter",
            other_user_email: chat.other_user_email || "",
            other_user_role: "recruiter",
            last_message: chat.last_message || "",
            last_message_time: chat.last_message_time || null,
            unread_count: Number(chat.unread_count || 0),
          }));

        if (mountedRef.current) {
          setConversations(actualConversations);
          setError("");
        }

        const currentChat = selectedChatRef.current;

        if (currentChat?.other_user_id) {
          const updatedChat = actualConversations.find(
            (chat) =>
              Number(chat.other_user_id) ===
              Number(currentChat.other_user_id)
          );

          if (updatedChat) {
            if (mountedRef.current) setSelectedChat(updatedChat);
            return;
          }

          if (mountedRef.current) {
            setSelectedChat(null);
            setMessages([]);
          }
          return;
        }

        if (autoSelect && actualConversations.length > 0) {
          if (mountedRef.current) {
            setSelectedChat(actualConversations[0]);
          }
          return;
        }

        if (actualConversations.length === 0) {
          if (mountedRef.current) {
            setSelectedChat(null);
            setMessages([]);
          }
        }
      } catch (err) {
        console.error("Conversation error:", err);
        if (mountedRef.current) {
          setError(err?.message || "Unable to load conversations.");
        }
      } finally {
        if (showLoader && mountedRef.current) setLoading(false);
      }
    },
    [getUser, isRecruiter, isCandidateRole]
  );

  // ====================================================
  // FETCH MESSAGES
  // ====================================================

  const fetchMessages = useCallback(
    async (conversation, { showLoader = true, scroll = false } = {}) => {
      if (!conversation?.other_user_id || !currentUserId) return;

      if (!isRecruiter(conversation)) {
        setMessages([]);
        return;
      }

      const otherUserId = Number(conversation.other_user_id);
      if (!otherUserId || otherUserId === currentUserId) return;

      try {
        if (showLoader) setMessagesLoading(true);

        const response = await fetch(
          `${MESSAGES_API}?userId=${encodeURIComponent(
            currentUserId
          )}&otherUserId=${encodeURIComponent(
            otherUserId
          )}&_=${Date.now()}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }
        );

        const raw = await response.text();
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          console.error("Messages response:", raw);
          throw new Error("Invalid messages response from server.");
        }

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to fetch messages.");
        }

        const receivedMessages = Array.isArray(data.messages)
          ? data.messages.map((m) => ({
              ...m,
              id: m.id ? Number(m.id) : m.id,
              sender_id: Number(m.sender_id),
              receiver_id: Number(m.receiver_id),
              edited:
                m.edited === 1 ||
                m.edited === "1" ||
                m.edited === true ||
                m.is_edited === 1 ||
                m.is_edited === "1" ||
                m.is_edited === true
                  ? 1
                  : 0,
            }))
          : [];

        if (mountedRef.current) {
          setMessages(receivedMessages);
        }

        if (scroll && receivedMessages.length > 0) {
          setTimeout(() => scrollToBottom("smooth"), 100);
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
      } finally {
        if (showLoader && mountedRef.current) setMessagesLoading(false);
      }
    },
    [currentUserId, isRecruiter, scrollToBottom]
  );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    const loggedUser = getUser();

    if (!loggedUser?.id) {
      setError("Please login first to access messages.");
      setLoading(false);
      return;
    }

    const loggedRole = String(loggedUser.role || "")
      .trim()
      .toLowerCase();

    if (!isCandidateRole(loggedRole)) {
      setError("This messages page is for candidates only.");
      setLoading(false);
      return;
    }

    setUser(loggedUser);
    fetchConversations({ showLoader: true, autoSelect: true });
  }, [getUser, fetchConversations]);

  // ====================================================
  // LOAD MESSAGES WHEN CHAT CHANGES
  // ====================================================

  useEffect(() => {
    if (!selectedChat?.other_user_id || !currentUserId) {
      setMessages([]);
      return;
    }

    const exists = conversations.some(
      (chat) =>
        Number(chat.other_user_id) ===
          Number(selectedChat.other_user_id) && isRecruiter(chat)
    );

    if (!exists) {
      setSelectedChat(null);
      setMessages([]);
      return;
    }

    fetchMessages(selectedChat, { showLoader: true, scroll: true });
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
    if (!currentUserId) return;

    const interval = setInterval(() => {
      // Skip polling refresh while editing/deleting
      if (skipPollRef.current) return;

      fetchConversations({ showLoader: false, autoSelect: false });

      const currentChat = selectedChatRef.current;

      if (currentChat?.other_user_id && isRecruiter(currentChat)) {
        fetchMessages(currentChat, {
          showLoader: false,
          scroll: false,
        });
      }
    }, POLLING_TIME);

    return () => clearInterval(interval);
  }, [currentUserId, fetchConversations, fetchMessages, isRecruiter]);

  // ====================================================
  // DISPLAY / FILTER
  // ====================================================

  const displayConversations = useMemo(() => {
    return conversations.filter((chat) => isRecruiter(chat));
  }, [conversations, isRecruiter]);

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return displayConversations;

    return displayConversations.filter((chat) => {
      const name = String(chat.other_user_name || "").toLowerCase();
      const email = String(chat.other_user_email || "").toLowerCase();
      const lastMessage = String(chat.last_message || "").toLowerCase();
      return (
        name.includes(value) ||
        email.includes(value) ||
        lastMessage.includes(value)
      );
    });
  }, [displayConversations, search]);

  const totalUnread = useMemo(() => {
    return displayConversations.reduce(
      (total, chat) => total + Number(chat.unread_count || 0),
      0
    );
  }, [displayConversations]);

  // ====================================================
  // SELECT CONVERSATION
  // ====================================================

  const handleSelectConversation = useCallback(
    (chat) => {
      if (!chat?.other_user_id || !isRecruiter(chat)) return;

      const exists = conversations.some(
        (item) =>
          Number(item.other_user_id) === Number(chat.other_user_id) &&
          isRecruiter(item)
      );

      if (!exists) return;

      // reset any edit/delete state
      setEditingMessageId(null);
      setEditText("");
      setDeleteTarget(null);
      setOpenMenuId(null);

      setSelectedChat(chat);
      setMessages([]);
    },
    [conversations, isRecruiter]
  );

  // ====================================================
  // SEND MESSAGE
  // ====================================================

  const sendMessage = useCallback(async () => {
    const text = message.trim();

    if (
      !text ||
      !selectedChat?.other_user_id ||
      !currentUserId ||
      sending
    ) {
      return;
    }

    const receiverId = Number(selectedChat.other_user_id);

    const exists = conversations.some(
      (chat) =>
        Number(chat.other_user_id) === receiverId && isRecruiter(chat)
    );

    if (!exists) {
      alert(
        "You can message recruiters with an existing conversation only."
      );
      return;
    }

    if (receiverId === currentUserId) {
      alert("You cannot send a message to yourself.");
      return;
    }

    if (text.length > 5000) {
      alert("Message cannot exceed 5000 characters.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch(SEND_MESSAGE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: receiverId,
          message: text,
        }),
      });

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Send message response:", raw);
        throw new Error("Invalid response from send-message API.");
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to send message.");
      }

      setMessage("");

      await fetchMessages(selectedChat, {
        showLoader: false,
        scroll: true,
      });

      await fetchConversations({
        showLoader: false,
        autoSelect: false,
      });

      textareaRef.current?.focus();
    } catch (err) {
      console.error("Send message error:", err);
      alert(err?.message || "Unable to send message.");
    } finally {
      if (mountedRef.current) setSending(false);
    }
  }, [
    message,
    selectedChat,
    currentUserId,
    sending,
    conversations,
    isRecruiter,
    fetchMessages,
    fetchConversations,
  ]);

  // ====================================================
  // KEY DOWN (main input)
  // ====================================================

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // ====================================================
  // START EDIT
  // ====================================================

  const handleStartEdit = useCallback(
    (msg) => {
      const id = getMessageId(msg);
      if (!id) return;

      setOpenMenuId(null);
      setEditingMessageId(id);
      setEditText(String(msg.message || ""));

      setTimeout(() => {
        editTextareaRef.current?.focus();
        const len = editTextareaRef.current?.value?.length || 0;
        editTextareaRef.current?.setSelectionRange(len, len);
      }, 50);
    },
    [getMessageId]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditText("");
  }, []);

  // ====================================================
  // SAVE EDIT
  // ====================================================

  const handleSaveEdit = useCallback(async () => {
    if (!editingMessageId || !currentUserId) return;

    const text = editText.trim();
    if (!text) {
      alert("Message cannot be empty.");
      return;
    }

    if (text.length > 5000) {
      alert("Message cannot exceed 5000 characters.");
      return;
    }

    const original = messages.find(
      (m) => getMessageId(m) === editingMessageId
    );
    if (original && String(original.message || "").trim() === text) {
      setEditingMessageId(null);
      setEditText("");
      return;
    }

    try {
      setSavingEdit(true);

      const response = await fetch(EDIT_MESSAGE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message_id: editingMessageId,
          user_id: currentUserId,
          message: text,
        }),
      });

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Edit message response:", raw);
        throw new Error("Invalid response from edit-message API.");
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to edit message.");
      }

      if (mountedRef.current) {
        setMessages((prev) =>
          prev.map((m) =>
            getMessageId(m) === editingMessageId
              ? {
                  ...m,
                  message: text,
                  edited: 1,
                  updated_at: new Date().toISOString(),
                }
              : m
          )
        );

        setEditingMessageId(null);
        setEditText("");
      }

      fetchConversations({
        showLoader: false,
        autoSelect: false,
      });
    } catch (err) {
      console.error("Edit message error:", err);
      alert(err?.message || "Unable to edit message.");
    } finally {
      if (mountedRef.current) setSavingEdit(false);
    }
  }, [
    editingMessageId,
    editText,
    currentUserId,
    messages,
    getMessageId,
    fetchConversations,
  ]);

  const handleEditKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSaveEdit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  // ====================================================
  // DELETE MESSAGE
  // ====================================================

  const handleRequestDelete = useCallback(
    (msg) => {
      const id = getMessageId(msg);
      if (!id) return;

      // Cancel any edit in progress
      setEditingMessageId(null);
      setEditText("");

      setOpenMenuId(null);
      setDeleteTarget({ id, message: msg });
    },
    [getMessageId]
  );

  const handleCancelDelete = useCallback(() => {
    if (deleting) return;
    setDeleteTarget(null);
  }, [deleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?.id || !currentUserId) return;

    try {
      setDeleting(true);

      const response = await fetch(DELETE_MESSAGE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message_id: deleteTarget.id,
          user_id: currentUserId,
        }),
      });

      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Delete message response:", raw);
        throw new Error("Invalid response from delete-message API.");
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to delete message.");
      }

      if (mountedRef.current) {
        setMessages((prev) =>
          prev.filter((m) => getMessageId(m) !== deleteTarget.id)
        );
        setDeleteTarget(null);
      }

      fetchConversations({
        showLoader: false,
        autoSelect: false,
      });
    } catch (err) {
      console.error("Delete message error:", err);
      alert(err?.message || "Unable to delete message.");
    } finally {
      if (mountedRef.current) setDeleting(false);
    }
  }, [
    deleteTarget,
    currentUserId,
    getMessageId,
    fetchConversations,
  ]);

  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await fetchConversations({
        showLoader: false,
        autoSelect: false,
      });

      const chat = selectedChatRef.current;

      if (chat?.other_user_id && isRecruiter(chat)) {
        await fetchMessages(chat, {
          showLoader: false,
          scroll: false,
        });
      }
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  }, [refreshing, fetchConversations, fetchMessages, isRecruiter]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return <MessagesSkeleton />;
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <MessageSquare size={32} className="mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to Load Messages
          </h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
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
        {/* PAGE HEADER */}
        <div className="mb-5 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
              <MessageSquare size={23} />
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
                Communicate with recruiters you have conversations with.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* CHAT CONTAINER */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="grid h-[calc(100vh-190px)] min-h-[560px] grid-cols-1 overflow-hidden md:grid-cols-[320px_minmax(0,1fr)]">
            {/* SIDEBAR */}
            <aside
              className={`${
                selectedChat ? "hidden md:flex" : "flex"
              } min-w-0 flex-col border-r border-slate-200 bg-white`}
            >
              <div className="shrink-0 border-b border-slate-100 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">Recruiters</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {displayConversations.length} conversation
                      {displayConversations.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {totalUnread > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      <Circle size={7} fill="currentColor" />
                      {totalUnread}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search recruiter..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <MessageSquare size={26} className="text-slate-400" />
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
                  filteredConversations.map((chat) => {
                    const chatId = Number(chat.other_user_id);
                    const isSelected =
                      Number(selectedChat?.other_user_id) === chatId;
                    const unread = Number(chat.unread_count || 0);

                    return (
                      <button
                        key={chatId}
                        type="button"
                        onClick={() => handleSelectConversation(chat)}
                        className={`relative w-full border-b border-slate-100 px-4 py-4 text-left transition ${
                          isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-blue-600" />
                        )}
                        <div className="flex gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {getInitial(chat.other_user_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3
                                className={`truncate text-sm ${
                                  unread > 0
                                    ? "font-bold text-slate-900"
                                    : "font-semibold text-slate-800"
                                }`}
                              >
                                {chat.other_user_name || "Recruiter"}
                              </h3>
                              <span className="shrink-0 text-[10px] text-slate-400">
                                {formatTime(chat.last_message_time)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-medium text-blue-600">
                              Recruiter
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <p
                                className={`truncate text-xs ${
                                  unread > 0
                                    ? "font-semibold text-slate-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {chat.last_message || "No messages yet"}
                              </p>
                              {unread > 0 && (
                                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                                  {unread > 99 ? "99+" : unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* CHAT WINDOW */}
            {selectedChat &&
            isRecruiter(selectedChat) &&
            conversations.some(
              (chat) =>
                Number(chat.other_user_id) ===
                Number(selectedChat.other_user_id)
            ) ? (
              <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
                {/* CHAT HEADER */}
                <div className="flex min-h-[76px] shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChat(null);
                        setMessages([]);
                        setEditingMessageId(null);
                        setEditText("");
                        setDeleteTarget(null);
                        setOpenMenuId(null);
                      }}
                      className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                      aria-label="Back"
                    >
                      <ArrowLeft size={20} />
                    </button>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                      {getInitial(selectedChat.other_user_name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                          {selectedChat.other_user_name || "Recruiter"}
                        </h2>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          Recruiter
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-400">
                        {selectedChat.other_user_email || "Recruiter"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    title="More"
                    aria-label="More options"
                    className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* MESSAGE HISTORY */}
                <div
                  ref={messagesContainerRef}
                  className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 px-3 py-5 sm:px-6"
                >
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
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                      <UserRound size={32} className="text-blue-600" />
                      <h3 className="mt-4 font-bold text-slate-800">
                        No Messages Yet
                      </h3>
                      <p className="mt-2 text-xs text-slate-400">
                        No messages found in this conversation.
                      </p>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-4xl space-y-4 pb-2">
                      {messages.map((msg, index) => {
                        const isMine =
                          Number(msg.sender_id) === currentUserId;
                        const msgId = getMessageId(msg);
                        const messageKey =
                          msgId || `${msg.created_at}-${index}`;
                        const currentDate = formatDate(msg.created_at);
                        const previousDate =
                          index > 0
                            ? formatDate(messages[index - 1]?.created_at)
                            : "";
                        const isEditing =
                          editingMessageId !== null &&
                          editingMessageId === msgId;
                        const isMenuOpen =
                          openMenuId !== null && openMenuId === msgId;
                        const isEdited = isMessageEdited(msg);

                        return (
                          <React.Fragment key={messageKey}>
                            {currentDate !== previousDate && (
                              <div className="flex justify-center py-2">
                                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-400 shadow-sm">
                                  {currentDate}
                                </span>
                              </div>
                            )}

                            <div
                              className={`group flex ${
                                isMine ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div className="relative flex max-w-[88%] items-start gap-1.5 sm:max-w-[70%]">
                                {/* Actions menu - only for own messages */}
                                {isMine && !isEditing && msgId && (
                                  <div
                                    className="relative z-30 mt-1 shrink-0"
                                    ref={isMenuOpen ? menuRef : null}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenMenuId(
                                          isMenuOpen ? null : msgId
                                        )
                                      }
                                      className={`flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 ${
                                        isMenuOpen
                                          ? "bg-slate-200 text-slate-700 opacity-100"
                                          : "opacity-0 group-hover:opacity-100"
                                      }`}
                                      title="Message options"
                                      aria-label="Message options"
                                    >
                                      <MoreVertical size={14} />
                                    </button>

                                    {isMenuOpen && (
                                      <div className="absolute right-0 top-8 z-40 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleStartEdit(msg)
                                          }
                                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                          <Pencil size={13} />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRequestDelete(msg)
                                          }
                                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                                        >
                                          <Trash2 size={13} />
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Bubble / Edit form */}
                                <div className="min-w-0 flex-1">
                                  {isEditing ? (
                                    <div className="rounded-2xl border border-blue-300 bg-white p-2 shadow-sm">
                                      <textarea
                                        ref={editTextareaRef}
                                        value={editText}
                                        onChange={(e) =>
                                          setEditText(e.target.value)
                                        }
                                        onKeyDown={handleEditKeyDown}
                                        rows={1}
                                        maxLength={5000}
                                        className="block max-h-32 min-h-[40px] w-full resize-none overflow-y-auto rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:bg-white"
                                      />

                                      <div className="mt-2 flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={handleCancelEdit}
                                          disabled={savingEdit}
                                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={handleSaveEdit}
                                          disabled={
                                            savingEdit || !editText.trim()
                                          }
                                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {savingEdit ? (
                                            <RefreshCw
                                              size={12}
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <Check size={12} />
                                          )}
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                        isMine
                                          ? "rounded-br-md bg-blue-600 text-white"
                                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                                      }`}
                                    >
                                      {msg.message}
                                    </div>
                                  )}

                                  {/* Meta */}
                                  {!isEditing && (
                                    <div
                                      className={`mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400 ${
                                        isMine
                                          ? "justify-end"
                                          : "justify-start"
                                      }`}
                                    >
                                      <span>
                                        {formatTime(msg.created_at)}
                                      </span>
                                      {isEdited && (
                                        <span className="italic">
                                          edited
                                        </span>
                                      )}
                                      {isMine && (
                                        <CheckCheck
                                          size={13}
                                          className="text-blue-400"
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* MESSAGE INPUT */}
                <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
                  <div className="mx-auto max-w-4xl">
                    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:bg-white">
                      <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        maxLength={5000}
                        placeholder="Message recruiter..."
                        className="block max-h-32 min-h-[44px] w-full resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={
                          sending ||
                          !message.trim() ||
                          !selectedChat?.other_user_id
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Send message"
                        aria-label="Send message"
                      >
                        {sending ? (
                          <RefreshCw size={19} className="animate-spin" />
                        ) : (
                          <Send size={19} />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 px-1 text-[10px] text-slate-400">
                      Press Enter to send • Shift + Enter for a new line
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              /* EMPTY CHAT */
              <section className="hidden min-w-0 flex-col items-center justify-center bg-slate-50 md:flex">
                <div className="px-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                    <MessageSquare size={36} className="text-blue-500" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-slate-800">
                    {displayConversations.length > 0
                      ? "Select a Conversation"
                      : "No Conversations Yet"}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    {displayConversations.length > 0
                      ? "Select a recruiter from the sidebar to view messages."
                      : "When a recruiter sends you a message, the conversation will appear here."}
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  Delete message?
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  This action cannot be undone.
                </p>
                {deleteTarget.message?.message && (
                  <p className="mt-2 line-clamp-3 rounded-lg bg-slate-50 px-3 py-2 text-xs italic text-slate-500">
                    "{String(deleteTarget.message.message).slice(0, 160)}"
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;