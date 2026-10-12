import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  UserRound,
  Briefcase,
  UserPlus,
  MessageCircle,
  Info,
  Clock,
  Loader2,
  RefreshCw,
  ChevronRight,
  Mail,
  X,
  CalendarDays,
} from "lucide-react";

// =====================================================
// API URLS
// =====================================================

import API_BASE from "../../Config/api";

const GET_NOTIFICATIONS_API = `${API_BASE}/notifications/get.php`;

const MARK_READ_API = `${API_BASE}/notifications/mark-read.php`;

// =====================================================
// SKELETON PRIMITIVE
// =====================================================

const Skeleton = ({ className = "", style }) => (
  <div
    style={style}
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

// =====================================================
// NOTIFICATIONS SKELETON
// =====================================================

const NotificationsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* ===== HEADER SKELETON ===== */}
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-cyan-500 p-5 shadow-sm sm:p-7">
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 shrink-0 rounded-2xl !bg-white/20" />

              <div className="space-y-2">
                <Skeleton className="h-3 w-32 !bg-white/20" />
                <Skeleton className="h-7 w-48 !bg-white/25 sm:h-8 sm:w-56" />
                <Skeleton className="h-4 w-64 !bg-white/15" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-2.5">
                <Skeleton className="h-3 w-12 !bg-white/20" />
                <Skeleton className="mt-1 h-6 w-8 !bg-white/25" />
              </div>

              <Skeleton className="h-12 w-32 rounded-xl !bg-white/20" />
            </div>

          </div>
        </section>

        {/* ===== FILTERS SKELETON ===== */}
        <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-16 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-16 rounded-lg" />
          </div>
        </section>

        {/* ===== THREAD LIST SKELETON ===== */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
            >
              <div className="flex items-center gap-4">

                {/* Avatar */}
                <Skeleton className="h-12 w-12 shrink-0 rounded-full" />

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-2">

                  {/* Name + time */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 shrink-0 rounded" />
                    <Skeleton className="h-4 w-40" />
                  </div>

                  {/* Message preview */}
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-3 w-full max-w-xs" />
                    <Skeleton className="h-4 w-4 shrink-0 rounded" />
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// =====================================================
// HELPERS
// =====================================================

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getStoredUserId = (user) => {
  const id =
    user?.id ||
    user?.userId ||
    user?.user_id ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("user_id");

  return Number(id || 0);
};

const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(
    String(value).replace(" ", "T")
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const formatDate = (value) => {
  const date = normalizeDate(value);

  if (!date) return value || "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (value) => {
  const date = normalizeDate(value);

  if (!date) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSenderName = (notification) =>
  notification?.sender_name ||
  notification?.source ||
  notification?.sender ||
  notification?.from_name ||
  notification?.company_name ||
  "JobPortal";

// =====================================================
// COMPONENT
// =====================================================

const Notifications = () => {
  const user = useMemo(() => getStoredUser(), []);

  const userId = useMemo(
    () => getStoredUserId(user),
    [user]
  );

  const userRole = String(user?.role || "")
    .trim()
    .toLowerCase();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [openThread, setOpenThread] = useState(null);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (item) => Number(item.is_read) === 0
      ).length,
    [notifications]
  );

  // ===================================================
  // FETCH CANDIDATE NOTIFICATIONS
  // ===================================================

  const fetchNotifications = useCallback(
    async (showLoader = true) => {
      if (!userId) {
        setError("Please login to view your notifications.");
        setNotifications([]);
        setLoading(false);
        return;
      }

      if (userRole !== "candidate") {
        setError(
          "This notifications page is available for candidates only."
        );
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        if (showLoader) setLoading(true);
        setError("");

        const response = await fetch(
          `${GET_NOTIFICATIONS_API}?userId=${encodeURIComponent(
            userId
          )}&_t=${Date.now()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const raw = await response.text();
        let data;

        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(
            "Invalid response from notifications API. Check your PHP endpoint."
          );
        }

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Unable to load notifications."
          );
        }

        const list = Array.isArray(data.notifications)
          ? data.notifications
          : [];

        setNotifications(
          list.map((item) => ({
            ...item,
            is_read: Number(item.is_read) === 1 ? 1 : 0,
          }))
        );
      } catch (err) {
        console.error("Fetch notifications:", err);
        setError(
          err.message || "Unable to load notifications."
        );
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [userId, userRole]
  );

  // Initial load and automatic refresh every 15 seconds
  useEffect(() => {
    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ===================================================
  // MARK NOTIFICATION AS READ
  // ===================================================

  const markAsRead = useCallback(
    async (notificationId) => {
      const notification = notifications.find(
        (item) => Number(item.id) === Number(notificationId)
      );

      if (!userId || !notificationId) return false;

      if (Number(notification?.is_read) === 1) {
        return true;
      }

      try {
        setMarkingId(Number(notificationId));

        const response = await fetch(MARK_READ_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            notification_id: Number(notificationId),
          }),
        });

        const raw = await response.text();
        let data;

        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error("Invalid response from mark-read API.");
        }

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Unable to mark notification as read."
          );
        }

        setNotifications((previous) =>
          previous.map((item) =>
            Number(item.id) === Number(notificationId)
              ? { ...item, is_read: 1 }
              : item
          )
        );

        return true;
      } catch (err) {
        console.error("Mark as read:", err);
        setError(err.message || "Unable to mark as read.");
        return false;
      } finally {
        setMarkingId(null);
      }
    },
    [userId, notifications]
  );

  // ===================================================
  // GROUP NOTIFICATIONS BY SENDER
  // ===================================================

  const groupedThreads = useMemo(() => {
    const map = new Map();

    notifications.forEach((notification) => {
      const senderName = getSenderName(notification);
      const key = senderName.trim().toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          senderName,
          messages: [],
          unreadCount: 0,
          latestMessage: null,
          latestDate: null,
        });
      }

      const thread = map.get(key);

      thread.messages.push(notification);

      if (Number(notification.is_read) === 0) {
        thread.unreadCount += 1;
      }

      const currentDate = normalizeDate(
        notification.created_at
      );

      const latestDate = normalizeDate(thread.latestDate);

      if (
        !thread.latestMessage ||
        (currentDate &&
          (!latestDate || currentDate > latestDate))
      ) {
        thread.latestMessage = notification;
        thread.latestDate = notification.created_at;
      }
    });

    const threads = Array.from(map.values());

    threads.forEach((thread) => {
      thread.messages.sort((a, b) => {
        const dateA = normalizeDate(a.created_at)?.getTime() || 0;
        const dateB = normalizeDate(b.created_at)?.getTime() || 0;
        return dateA - dateB;
      });
    });

    return threads.sort((a, b) => {
      const dateA = normalizeDate(a.latestDate)?.getTime() || 0;
      const dateB = normalizeDate(b.latestDate)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [notifications]);

  // ===================================================
  // FILTER
  // ===================================================

  const filteredThreads = useMemo(() => {
    if (filter === "unread") {
      return groupedThreads.filter(
        (thread) => thread.unreadCount > 0
      );
    }

    if (filter === "read") {
      return groupedThreads.filter(
        (thread) => thread.unreadCount === 0
      );
    }

    return groupedThreads;
  }, [groupedThreads, filter]);

  // ===================================================
  // OPEN THREAD AND MARK UNREAD ITEMS AS READ
  // ===================================================

  const handleOpenThread = async (thread) => {
    setOpenThread(thread);

    const unreadMessages = thread.messages.filter(
      (message) => Number(message.is_read) === 0
    );

    for (const message of unreadMessages) {
      await markAsRead(message.id);
    }

    // Refresh from backend to keep the thread in sync.
    await fetchNotifications(false);
  };

  // Keep open thread synchronized with refreshed state.
  const activeThread = useMemo(() => {
    if (!openThread) return null;

    return (
      groupedThreads.find(
        (thread) => thread.id === openThread.id
      ) || openThread
    );
  }, [openThread, groupedThreads]);

  // ===================================================
  // ICON
  // ===================================================

  const getNotificationIcon = (type) => {
    switch (String(type || "").toLowerCase()) {
      case "application":
        return <UserPlus size={20} />;

      case "job":
        return <Briefcase size={20} />;

      case "message":
        return <MessageCircle size={20} />;

      case "interview":
        return <CalendarDays size={20} />;

      default:
        return <Info size={20} />;
    }
  };

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      await fetchNotifications(false);
    } finally {
      setRefreshing(false);
    }
  };

  // ===================================================
  // LOADING (SKELETON)
  // ===================================================

  if (loading) {
    return <NotificationsSkeleton />;
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}

        <section className="relative mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-white/10" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                <Bell size={27} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">
                  Candidate Portal
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  Application updates, messages and interview alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-2.5">
                <p className="text-xs text-blue-100">Unread</p>
                <p className="text-xl font-bold">{unreadCount}</p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => fetchNotifications(true)}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* FILTERS */}

        <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              Your updates
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {notifications.length} notification
              {notifications.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
              { value: "read", label: "Read" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === item.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* THREAD LIST */}

        {filteredThreads.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <Bell size={30} />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              {filter === "unread"
                ? "You're all caught up!"
                : filter === "read"
                ? "No read notifications"
                : "No notifications yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {filter === "unread"
                ? "You don't have any unread notifications."
                : "Application status changes, recruiter messages and interview updates will appear here when the backend creates them."}
            </p>
          </section>
        ) : (
          <div className="space-y-3">
            {filteredThreads.map((thread) => {
              const latest = thread.latestMessage;
              const isUnread = thread.unreadCount > 0;

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => handleOpenThread(thread)}
                  className={`w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
                    isUnread
                      ? "border-blue-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        isUnread
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Mail size={22} />

                      {isUnread && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3
                            className={`truncate text-sm ${
                              isUnread
                                ? "font-bold text-gray-900"
                                : "font-semibold text-gray-800"
                            }`}
                          >
                            {thread.senderName}
                          </h3>

                          {thread.messages.length > 1 && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                              {thread.messages.length}
                            </span>
                          )}
                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {formatShortDate(thread.latestDate)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">
                              {getNotificationIcon(latest?.type)}
                            </span>
                            <p
                              className={`truncate text-sm ${
                                isUnread
                                  ? "font-semibold text-gray-700"
                                  : "text-gray-600"
                              }`}
                            >
                              {latest?.title || "Notification"}
                            </p>
                          </div>

                          <p className="mt-1 truncate text-sm text-gray-400">
                            {latest?.message || ""}
                          </p>
                        </div>

                        <ChevronRight
                          size={18}
                          className="shrink-0 text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* THREAD MODAL */}

      {activeThread && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpenThread(null);
            }
          }}
        >
          <section className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <UserRound size={21} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-bold text-gray-900">
                    {activeThread.senderName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {activeThread.messages.length} notification
                    {activeThread.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenThread(null)}
                aria-label="Close notifications"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal messages */}

            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 sm:p-5">
              {activeThread.messages.map((message) => {
                const isUnread = Number(message.is_read) === 0;
                const isMarking =
                  Number(markingId) === Number(message.id);

                return (
                  <article
                    key={message.id}
                    className={`rounded-xl border p-4 ${
                      isUnread
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-blue-600">
                        {getNotificationIcon(message.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {message.title || "Notification"}
                          </h3>

                          {isUnread && (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              NEW
                            </span>
                          )}
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                          {message.message}
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={13} />
                          {formatDate(message.created_at)}
                        </div>
                      </div>

                      {isUnread ? (
                        <button
                          type="button"
                          disabled={isMarking}
                          onClick={() => markAsRead(message.id)}
                          title="Mark as read"
                          className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {isMarking ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={14} />
                          )}
                          <span className="hidden sm:inline">
                            Mark read
                          </span>
                        </button>
                      ) : (
                        <span
                          className="flex shrink-0 items-center gap-1 text-xs text-green-600"
                          title="Read"
                        >
                          <CheckCheck size={16} />
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Modal footer */}

            <div className="flex justify-end border-t border-gray-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => setOpenThread(null)}
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Notifications;