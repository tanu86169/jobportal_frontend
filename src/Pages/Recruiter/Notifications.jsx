
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
  BriefcaseBusiness,
  UserPlus,
  MessageCircle,
  Info,
  Clock,
  Loader2,
  RefreshCw,
  ChevronDown,
  Mail,
  CalendarDays,
  X,
  ShieldAlert,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// =====================================================
// API
// =====================================================
import API_BASE from "../../Config/api";

const GET_NOTIFICATIONS_API = `${API_BASE}/notifications/get.php`;

const MARK_READ_API = `${API_BASE}/notifications/mark-read.php`;

// =====================================================
// HELPERS
// =====================================================

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(String(value).replace(" ", "T"));

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);

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
  const date = parseDate(value);

  if (!date) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNotificationIcon = (type) => {
  switch (String(type || "").trim().toLowerCase()) {
    case "application":
      return <UserPlus size={20} />;

    case "job":
      return <BriefcaseBusiness size={20} />;

    case "message":
      return <MessageCircle size={20} />;

    case "interview":
      return <CalendarDays size={20} />;

    default:
      return <Info size={20} />;
  }
};

const getNotificationColor = (type) => {
  switch (String(type || "").trim().toLowerCase()) {
    case "application":
      return "bg-blue-100 text-blue-700";

    case "message":
      return "bg-violet-100 text-violet-700";

    case "interview":
      return "bg-amber-100 text-amber-700";

    case "job":
      return "bg-emerald-100 text-emerald-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

// =====================================================
// COMPONENT
// =====================================================

const Notifications = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [error, setError] = useState("");
  const [openThread, setOpenThread] = useState(null);
  const [filter, setFilter] = useState("all");

  // ---------------------------------------------------
  // Get logged-in recruiter
  // ---------------------------------------------------

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("Please login to view your notifications.");
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const role = String(parsedUser?.role || "")
        .trim()
        .toLowerCase();

      const recruiterId = Number(
        parsedUser?.id ||
        parsedUser?.userId ||
        parsedUser?.user_id ||
        localStorage.getItem("id") ||
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        0
      );

      if (role !== "recruiter" || !recruiterId) {
        setError("Recruiter account not found. Please login as a recruiter.");
        setLoading(false);
        return;
      }

      setUser({
        ...parsedUser,
        id: recruiterId,
        role,
      });
    } catch (err) {
      console.error("Recruiter session error:", err);
      setError("Unable to read your login details. Please login again.");
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------
  // Fetch notifications
  // ---------------------------------------------------

  const fetchNotifications = useCallback(
    async ({ showLoader = true } = {}) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        if (showLoader) setLoading(true);

        setError("");

        const response = await fetch(
          `${GET_NOTIFICATIONS_API}?userId=${user.id}&_t=${Date.now()}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }
        );

        const raw = await response.text();

        let data;

        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          console.error("Notifications API response:", raw);
          throw new Error(
            "Notifications API returned invalid JSON. Check the PHP API."
          );
        }

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || `Unable to fetch notifications (${response.status}).`
          );
        }

        const list = Array.isArray(data.notifications)
          ? data.notifications
          : [];

        setNotifications(list);
      } catch (err) {
        console.error("Fetch notifications error:", err);
        setError(err.message || "Unable to load notifications.");
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [user?.id]
  );

  // Initial fetch + poll every 15 seconds
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications({ showLoader: true });

    const timer = setInterval(() => {
      fetchNotifications({ showLoader: false });
    }, 15000);

    return () => clearInterval(timer);
  }, [user?.id, fetchNotifications]);

  // ---------------------------------------------------
  // Unread count
  // ---------------------------------------------------

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (item) => Number(item.is_read) === 0
      ).length,
    [notifications]
  );

  // ---------------------------------------------------
  // Mark one notification as read
  // ---------------------------------------------------

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!user?.id || !notificationId) return false;

      const current = notifications.find(
        (item) => Number(item.id) === Number(notificationId)
      );

      if (current && Number(current.is_read) === 1) {
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
            user_id: Number(user.id),
            notification_id: Number(notificationId),
          }),
        });

        const raw = await response.text();
        let data;

        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          throw new Error("Mark-read API returned invalid JSON.");
        }

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Could not mark notification as read."
          );
        }

        setNotifications((previous) =>
          previous.map((item) =>
            Number(item.id) === Number(notificationId)
              ? { ...item, is_read: 1 }
              : item
          )
        );

        setOpenThread((previous) => {
          if (!previous) return null;

          return {
            ...previous,
            messages: previous.messages.map((item) =>
              Number(item.id) === Number(notificationId)
                ? { ...item, is_read: 1 }
                : item
            ),
          };
        });

        return true;
      } catch (err) {
        console.error("Mark notification read error:", err);
        setError(err.message || "Unable to update notification.");
        return false;
      } finally {
        setMarkingId(null);
      }
    },
    [user?.id, notifications]
  );

  // ---------------------------------------------------
  // Group notifications by sender/source
  // ---------------------------------------------------

  const groupedThreads = useMemo(() => {
    const map = new Map();

    notifications.forEach((notification) => {
      const senderName =
        notification.sender_name ||
        notification.source ||
        notification.sender ||
        notification.from_name ||
        notification.company_name ||
        "JobPortal";

      const key = String(senderName).trim().toLowerCase();

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

      const currentDate = parseDate(notification.created_at);
      const latestDate = parseDate(thread.latestDate);

      if (
        !thread.latestDate ||
        (currentDate &&
          (!latestDate || currentDate > latestDate))
      ) {
        thread.latestMessage = notification;
        thread.latestDate = notification.created_at;
      }
    });

    const threads = Array.from(map.values());

    threads.forEach((thread) => {
      thread.messages.sort(
        (a, b) =>
          (parseDate(a.created_at)?.getTime() || 0) -
          (parseDate(b.created_at)?.getTime() || 0)
      );
    });

    threads.sort(
      (a, b) =>
        (parseDate(b.latestDate)?.getTime() || 0) -
        (parseDate(a.latestDate)?.getTime() || 0)
    );

    return threads;
  }, [notifications]);

  // ---------------------------------------------------
  // Filter notifications
  // ---------------------------------------------------

  const visibleThreads = useMemo(() => {
    if (filter === "unread") {
      return groupedThreads.filter(
        (thread) => thread.unreadCount > 0
      );
    }

    if (filter === "read") {
      return groupedThreads.filter(
        (thread) =>
          thread.messages.length > thread.unreadCount
      );
    }

    return groupedThreads;
  }, [groupedThreads, filter]);

  // ---------------------------------------------------
  // Open thread and mark unread items as read
  // ---------------------------------------------------

  const handleOpenThread = async (thread) => {
    setOpenThread(thread);

    const unreadMessages = thread.messages.filter(
      (item) => Number(item.is_read) === 0
    );

    for (const item of unreadMessages) {
      await markAsRead(item.id);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      await fetchNotifications({ showLoader: false });
    } finally {
      setRefreshing(false);
    }
  };

  // ---------------------------------------------------
  // Loading
  // ---------------------------------------------------

  
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl animate-pulse">

        {/* Header Skeleton */}
        <section className="mb-6 rounded-[26px] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-5 shadow-lg sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-white/20" />

              <div className="flex-1">
                <div className="h-3 w-28 rounded bg-white/30" />
                <div className="mt-3 h-8 w-44 max-w-full rounded-lg bg-white/30" />
                <div className="mt-3 h-4 w-72 max-w-full rounded bg-white/20" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="h-16 w-36 rounded-xl bg-white/20" />
              <div className="h-11 w-28 rounded-xl bg-white/30" />
            </div>
          </div>
        </section>

        {/* Section Heading and Filters */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 w-32 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 max-w-full rounded bg-gray-100" />
          </div>

          <div className="flex gap-2 rounded-xl border border-gray-200 bg-white p-2">
            <div className="h-9 w-14 rounded-lg bg-blue-100" />
            <div className="h-9 w-20 rounded-lg bg-gray-100" />
            <div className="h-9 w-16 rounded-lg bg-gray-100" />
          </div>
        </div>

        {/* Notification Card Skeletons */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
            >
              <div className="flex items-center gap-4">

                {/* Notification Icon */}
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-100" />

                {/* Notification Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="h-4 w-36 max-w-full rounded bg-gray-200" />
                    <div className="h-3 w-28 rounded bg-gray-100" />
                  </div>

                  <div className="mt-3 h-4 w-48 max-w-full rounded bg-gray-200" />

                  <div className="mt-2 h-3 w-full max-w-lg rounded bg-gray-100" />
                </div>

                {/* Chevron Placeholder */}
                <div className="h-5 w-5 shrink-0 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
  // ---------------------------------------------------
  // Main UI
  // ---------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <section className="relative mb-6 overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-5 text-white shadow-lg shadow-blue-600/10 sm:p-7">
          <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-200/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur">
                <Bell size={27} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                  Recruiter Panel
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  Applications, candidate messages and interview updates.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 backdrop-blur">
                <p className="text-xs text-blue-100">Unread notifications</p>
                <p className="text-xl font-bold">{unreadCount}</p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <ShieldAlert size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => fetchNotifications({ showLoader: false })}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Your updates
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              New notifications appear automatically.
            </p>
          </div>

          <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
              { value: "read", label: "Read" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  filter === item.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {!error && visibleThreads.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Bell size={30} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {filter === "unread"
                ? "You're all caught up!"
                : filter === "read"
                ? "No read notifications"
                : "No notifications yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Recruiter updates will appear here when they are generated.
            </p>
          </div>
        )}

        {/* Notification threads */}
        <div className="space-y-3">
          {visibleThreads.map((thread) => {
            const latest = thread.latestMessage;
            const isUnread = thread.unreadCount > 0;

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => handleOpenThread(thread)}
                className={`w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
                  isUnread
                    ? "border-blue-200 shadow-sm"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getNotificationColor(
                      latest?.type
                    )}`}
                  >
                    {getNotificationIcon(latest?.type)}

                    {isUnread && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3
                          className={`truncate text-base ${
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
                        <p className="truncate text-sm font-medium text-gray-700">
                          {latest?.title || "Notification"}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          {latest?.message || ""}
                        </p>
                      </div>
                      <ChevronDown
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
      </div>

      {/* Notification detail modal */}
      {openThread && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpenThread(null);
            }
          }}
        >
          <section className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Mail size={21} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-gray-900">
                    {openThread.senderName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {openThread.messages.length} notification
                    {openThread.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenThread(null)}
                aria-label="Close notification details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 sm:p-5">
              {openThread.messages.map((notification) => {
                const unread = Number(notification.is_read) === 0;
                const marking =
                  Number(markingId) === Number(notification.id);

                return (
                  <article
                    key={notification.id}
                    className={`rounded-xl border p-4 ${
                      unread
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title || "Notification"}
                          </h3>

                          {unread ? (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              NEW
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                              <CheckCheck size={14} />
                              Read
                            </span>
                          )}
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                          {notification.message}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={13} />
                          {formatDate(notification.created_at)}
                        </div>
                      </div>

                      {unread && (
                        <button
                          type="button"
                          disabled={marking}
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {marking ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Mark read
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="flex justify-end border-t border-gray-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => setOpenThread(null)}
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default Notifications;