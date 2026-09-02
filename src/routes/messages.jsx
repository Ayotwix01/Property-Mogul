import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageSkeleton, usePreload } from "@/components/skeleton";
import { useAuth, useRole } from "@/hooks/use-auth";
import {
  getInquiryMessages,
  blockUser,
  createReport,
  listBlockedUsers,
  listMyInquiries,
  listReceivedInquiries,
  unblockUser,
  sendMessage,
} from "@/lib/communication.functions";

export const Route = createFileRoute("/messages")({ component: MessagesPage });

function MessagesPage() {
  const ready = usePreload(250);
  const auth = useAuth();
  const roles = useRole();
  const [mode, setMode] = useState("seeker");
  const list = useServerFn(mode === "owner" ? listReceivedInquiries : listMyInquiries);
  const loadMessages = useServerFn(getInquiryMessages);
  const postMessage = useServerFn(sendMessage);
  const block = useServerFn(blockUser);
  const unblock = useServerFn(unblockUser);
  const report = useServerFn(createReport);
  const getBlockedUsers = useServerFn(listBlockedUsers);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (roles.isOwner && !roles.isSeeker) setMode("owner");
  }, [roles.isOwner, roles.isSeeker]);

  useEffect(() => {
    if (!auth.ready || !auth.authed || !roles.ready) return;
    Promise.all([list(), getBlockedUsers()])
      .then(([rows, blockedRows]) => {
        setItems(rows);
        setBlockedUsers(blockedRows);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Unable to load messages."),
      )
      .finally(() => setLoading(false));
  }, [auth.authed, auth.ready, getBlockedUsers, list, mode, roles.ready]);

  const counterpartId = selected?.counterpart?.userId;
  const isBlocked =
    counterpartId && blockedUsers.some((item) => item.block?.blockedId === counterpartId);

  const handleBlockToggle = async () => {
    if (!counterpartId) return;
    if (
      !isBlocked &&
      !window.confirm("Block this user? You will not be able to message each other.")
    )
      return;
    setActionLoading(true);
    try {
      if (isBlocked) {
        await unblock({ data: { userId: counterpartId } });
        setBlockedUsers((current) =>
          current.filter((item) => item.block?.blockedId !== counterpartId),
        );
      } else {
        await block({ data: { userId: counterpartId } });
        setBlockedUsers((current) => [...current, { block: { blockedId: counterpartId } }]);
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Unable to update block status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!counterpartId || !window.confirm("Report this user for review?")) return;
    setActionLoading(true);
    try {
      await report({
        data: {
          targetType: "USER",
          targetId: counterpartId,
          category: "OTHER",
          description: "Reported from a Property Mogul conversation.",
        },
      });
      setError("Report submitted to the moderation team.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to submit report.");
    } finally {
      setActionLoading(false);
    }
  };

  const openConversation = async (item) => {
    const inquiry = item.inquiry || item;
    setSelected(item);
    setError("");
    try {
      setMessages(await loadMessages({ data: { inquiryId: inquiry.id } }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load conversation.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !selected) return;
    try {
      const message = await postMessage({
        data: { inquiryId: (selected.inquiry || selected).id, body: draft },
      });
      setMessages((current) => [...current, message]);
      setDraft("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.");
    }
  };

  if (!ready || !auth.ready || !roles.ready || loading) return <PageSkeleton />;
  if (!auth.authed)
    return (
      <main className="p-10">
        Please{" "}
        <Link to="/login" className="text-primary">
          log in
        </Link>
        .
      </main>
    );
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-on-surface md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-primary">
          Property Mogul
        </Link>
        <h1 className="mt-8 font-display text-4xl font-bold">Messages</h1>
        {roles.isBoth && (
          <div className="mt-4 flex gap-2">
            {["seeker", "owner"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  setSelected(null);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === value ? "bg-primary-container text-on-primary-container" : "border border-border-muted"}`}
              >
                {value === "seeker" ? "Seeker inbox" : "Owner inbox"}
              </button>
            ))}
          </div>
        )}
        {error && <p className="mt-4 text-sm text-error">{error}</p>}
        <div className="mt-8 grid gap-5 md:grid-cols-[300px_1fr]">
          <section className="space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No conversations yet.</p>
            ) : (
              items.map((item) => {
                const inquiry = item.inquiry || item;
                return (
                  <button
                    type="button"
                    key={inquiry.id}
                    onClick={() => openConversation(item)}
                    className="w-full rounded-xl border border-border-muted p-4 text-left hover:border-primary-container"
                  >
                    <p className="font-bold">{item.property?.title || "Property inquiry"}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
                      {inquiry.message}
                    </p>
                    <span className="mt-2 block text-xs text-primary-container">
                      {inquiry.status}
                    </span>
                  </button>
                );
              })
            )}
          </section>
          <section className="flex min-h-[420px] flex-col rounded-2xl border border-border-muted bg-surface-container-lowest p-5">
            {!selected ? (
              <p className="m-auto text-sm text-on-surface-variant">Select a conversation.</p>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border-muted pb-4">
                  <div>
                    <p className="font-bold">
                      {selected.counterpart?.displayName || "Property Mogul member"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {selected.counterpart?.trustStatus || "Trust status unavailable"}
                    </p>
                  </div>
                  {counterpartId && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleReport}
                        className="text-xs font-bold text-warning"
                      >
                        Report
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleBlockToggle}
                        className="text-xs font-bold text-error"
                      >
                        {isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-xl bg-surface-container p-3 text-sm">
                      <p className="mb-1 text-xs font-bold text-on-surface-variant">
                        {message.senderProfile?.displayName ||
                          (message.senderId === auth.userId ? "You" : "Member")}
                      </p>
                      <p>{message.body}</p>
                      <time className="mt-1 block text-xs text-on-surface-variant">
                        {new Date(message.createdAt).toLocaleString()}
                      </time>
                    </div>
                  ))}
                </div>
                <form onSubmit={submit} className="mt-5 flex gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-border-muted bg-background px-3 py-3"
                    placeholder="Write a message"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-primary-container px-4 font-bold text-on-primary-container"
                  >
                    Send
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
