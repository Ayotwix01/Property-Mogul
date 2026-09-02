import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageSkeleton, usePreload } from "@/components/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  decidePropertyStatus,
  decideReport,
  decideUserStatus,
  decideVerification,
  getAdminPayments,
  getAdminProperties,
  getAdminQueues,
  getAdminUsers,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const sections = ["Overview", "Verifications", "Reports", "Properties", "Users", "Payments"];

function AdminPage() {
  const ready = usePreload(300);
  const auth = useAuth();
  const navigate = useNavigate();
  const loadQueues = useServerFn(getAdminQueues);
  const loadUsers = useServerFn(getAdminUsers);
  const loadProperties = useServerFn(getAdminProperties);
  const loadPayments = useServerFn(getAdminPayments);
  const approveVerification = useServerFn(decideVerification);
  const updateReport = useServerFn(decideReport);
  const updateProperty = useServerFn(decidePropertyStatus);
  const updateUser = useServerFn(decideUserStatus);
  const [section, setSection] = useState("Overview");
  const [queues, setQueues] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [reportStatus, setReportStatus] = useState("OPEN");
  const [propertyStatus, setPropertyStatus] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [userRole, setUserRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const run = async (operation, successMessage = "Updated successfully.") => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await operation();
      setNotice(successMessage);
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Unable to complete that action.",
      );
    } finally {
      setBusy(false);
    }
  };

  const refreshQueues = useCallback(
    () =>
      loadQueues({
        data: {
          verificationStatus,
          reportStatus,
          page: 1,
          pageSize: 50,
        },
      }).then(setQueues),
    [loadQueues, verificationStatus, reportStatus],
  );

  useEffect(() => {
    if (!auth.ready) return;
    if (!auth.authed) {
      navigate({ to: "/login" });
      return;
    }
    refreshQueues().catch((loadError) =>
      setError(loadError instanceof Error ? loadError.message : "Admin access denied."),
    );
  }, [auth.authed, auth.ready, navigate, refreshQueues, verificationStatus, reportStatus]);

  useEffect(() => {
    if (section === "Users") {
      loadUsers({
        data: {
          userStatus: userStatus || undefined,
          userRole: userRole || undefined,
          page: 1,
          pageSize: 50,
        },
      })
        .then(setUsers)
        .catch((loadError) =>
          setError(loadError instanceof Error ? loadError.message : "Unable to load users."),
        );
    }
    if (section === "Properties") {
      loadProperties({
        data: { propertyStatus: propertyStatus || undefined, page: 1, pageSize: 50 },
      })
        .then(setProperties)
        .catch((loadError) =>
          setError(loadError instanceof Error ? loadError.message : "Unable to load properties."),
        );
    }
    if (section === "Payments") {
      loadPayments({ data: { page: 1, pageSize: 50 } })
        .then(setPayments)
        .catch((loadError) =>
          setError(loadError instanceof Error ? loadError.message : "Unable to load payments."),
        );
    }
  }, [section, loadUsers, loadProperties, loadPayments, userStatus, userRole, propertyStatus]);

  const refreshCurrent = async () => {
    await refreshQueues();
    if (section === "Users")
      setUsers(
        await loadUsers({
          data: {
            page: 1,
            pageSize: 50,
            userStatus: userStatus || undefined,
            userRole: userRole || undefined,
          },
        }),
      );
    if (section === "Properties")
      setProperties(
        await loadProperties({
          data: { page: 1, pageSize: 50, propertyStatus: propertyStatus || undefined },
        }),
      );
  };

  if (!ready || !auth.ready || !queues) return <PageSkeleton />;

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-on-surface md:px-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="text-sm text-on-surface-variant hover:text-primary">
          Property Mogul
        </Link>
        <h1 className="mt-8 font-display text-4xl font-bold">Admin dashboard</h1>
        <p className="mt-2 text-on-surface-variant">
          Trust, moderation, account, and payment operations.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Admin sections">
          {sections.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSection(item);
                setError("");
                setNotice("");
              }}
              className={`rounded-full px-4 py-2 text-sm ${section === item ? "bg-primary-container text-on-primary-container" : "border border-border-muted text-on-surface-variant"}`}
            >
              {item}
            </button>
          ))}
        </nav>
        {notice && (
          <p className="mt-4 rounded-lg bg-success-cyan/10 p-3 text-sm text-success-cyan">
            {notice}
          </p>
        )}
        {error && <p className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</p>}
        {section === "Overview" && <Overview queues={queues} />}
        {section === "Verifications" && (
          <section className="mt-8">
            <FilterSelect
              label="Verification status"
              value={verificationStatus}
              onChange={setVerificationStatus}
              options={["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED", "EXPIRED"]}
            />
            <Queue
              title="Verification queue"
              items={queues.verifications}
              label={(item) => `${item.type} · ${item.user.displayName}`}
              detail={(item) => `${item.user.email} · ${item.provider || "Provider not recorded"}`}
              actions={(item) =>
                item.status === "PENDING" && (
                  <>
                    <ActionButton
                      disabled={busy}
                      className="text-success-cyan"
                      onClick={() =>
                        run(
                          () =>
                            approveVerification({
                              data: { requestId: item.id, status: "VERIFIED" },
                            }).then(refreshCurrent),
                          "Verification approved.",
                        )
                      }
                    >
                      Approve
                    </ActionButton>
                    <ActionButton
                      disabled={busy}
                      className="text-error"
                      onClick={() =>
                        run(
                          () =>
                            approveVerification({
                              data: { requestId: item.id, status: "REJECTED" },
                            }).then(refreshCurrent),
                          "Verification rejected.",
                        )
                      }
                    >
                      Reject
                    </ActionButton>
                  </>
                )
              }
            />
          </section>
        )}
        {section === "Reports" && (
          <section className="mt-8">
            <FilterSelect
              label="Report status"
              value={reportStatus}
              onChange={setReportStatus}
              options={["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]}
            />
            <Queue
              title="Reports"
              items={queues.reports}
              label={(item) => `${item.category} · ${item.targetType}`}
              detail={(item) =>
                `${item.description || "No description"} · Reported by ${item.reporter.displayName} · Target: ${item.target?.label || item.targetId}`
              }
              actions={
                <span className="text-xs text-on-surface-variant">
                  {queues.reports.length ? "Select a report to review its status." : ""}
                </span>
              }
            />
            {queues.reports.map((item) => (
              <div key={`actions-${item.id}`} className="sr-only">
                {item.id}
              </div>
            ))}
            <div className="mt-3 space-y-2">
              {queues.reports.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <span className="text-on-surface-variant">{item.category}</span>
                  <ActionButton
                    disabled={busy}
                    onClick={() =>
                      run(
                        () =>
                          updateReport({ data: { reportId: item.id, status: "REVIEWING" } }).then(
                            refreshCurrent,
                          ),
                        "Report moved to review.",
                      )
                    }
                  >
                    Review
                  </ActionButton>
                  <ActionButton
                    disabled={busy}
                    className="text-success-cyan"
                    onClick={() =>
                      run(
                        () =>
                          updateReport({ data: { reportId: item.id, status: "RESOLVED" } }).then(
                            refreshCurrent,
                          ),
                        "Report resolved.",
                      )
                    }
                  >
                    Resolve
                  </ActionButton>
                  <ActionButton
                    disabled={busy}
                    className="text-error"
                    onClick={() =>
                      run(
                        () =>
                          updateReport({ data: { reportId: item.id, status: "DISMISSED" } }).then(
                            refreshCurrent,
                          ),
                        "Report dismissed.",
                      )
                    }
                  >
                    Dismiss
                  </ActionButton>
                </div>
              ))}
            </div>
          </section>
        )}
        {section === "Properties" && (
          <PropertySection
            properties={properties}
            status={propertyStatus}
            setStatus={setPropertyStatus}
            busy={busy}
            onUpdate={(propertyId, status) =>
              run(
                () => updateProperty({ data: { propertyId, status } }).then(refreshCurrent),
                "Property status updated.",
              )
            }
          />
        )}
        {section === "Users" && (
          <UserSection
            users={users}
            currentUserId={auth.userId}
            status={userStatus}
            role={userRole}
            setStatus={setUserStatus}
            setRole={setUserRole}
            busy={busy}
            onUpdate={(userId, status) =>
              run(
                () => updateUser({ data: { userId, status } }).then(refreshCurrent),
                "User status updated.",
              )
            }
          />
        )}
        {section === "Payments" && <PaymentSection payments={payments} />}
      </div>
    </main>
  );
}

function Overview({ queues }) {
  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Users", queues.stats.users],
          ["Verified profiles", queues.stats.verifiedProfiles],
          ["Published listings", queues.stats.publishedListings],
          ["Open reports", queues.reports.filter((item) => item.status === "OPEN").length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border-muted bg-surface-container-lowest p-4"
          >
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-on-surface-variant">{label}</p>
          </div>
        ))}
      </div>
      <section className="mt-8 rounded-2xl border border-border-muted bg-surface-container-lowest p-6">
        <h2 className="font-display text-xl font-bold">Recent audit activity</h2>
        {queues.audit.length === 0 ? (
          <p className="mt-4 text-sm text-on-surface-variant">No audit activity yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {queues.audit.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap justify-between gap-2 border-b border-border-muted/60 py-2 text-sm last:border-0"
              >
                <span className="font-bold">{entry.action}</span>
                <span className="text-on-surface-variant">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="mb-4 inline-flex items-center gap-2 text-sm text-on-surface-variant">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-border-muted bg-surface-container-lowest px-3 py-2 text-on-surface"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function ActionButton({ children, className = "text-primary-container", ...props }) {
  return (
    <button
      type="button"
      className={`mr-3 hover:underline disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
function Queue({ title, items, label, detail, actions }) {
  return (
    <section className="rounded-2xl border border-border-muted bg-surface-container-lowest p-6">
      <h2 className="font-display text-xl font-bold">
        {title} ({items.length})
      </h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Nothing to show.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border-muted p-3 text-sm">
              <p className="font-bold">{label(item)}</p>
              <p className="text-on-surface-variant">{detail ? detail(item) : item.status}</p>
              <div className="mt-2 text-xs">
                {typeof actions === "function" ? actions(item) : actions}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function PropertySection({ properties, status, setStatus, busy, onUpdate }) {
  return (
    <section className="mt-8">
      <FilterSelect
        label="Property status"
        value={status}
        onChange={setStatus}
        options={["", "DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"]}
      />
      <div className="space-y-3">
        {properties.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No properties match this filter.</p>
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-border-muted bg-surface-container-lowest p-4"
            >
              <p className="font-bold">{property.title}</p>
              <p className="text-sm text-on-surface-variant">
                {property.city}, {property.state} · {property.status} · Owner:{" "}
                {property.owner.displayName} ({property.owner.email})
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["PUBLISHED", "UNPUBLISHED", "ARCHIVED"].map((nextStatus) => (
                  <ActionButton
                    key={nextStatus}
                    disabled={busy || nextStatus === property.status}
                    onClick={() => {
                      if (window.confirm(`Change this property to ${nextStatus.toLowerCase()}?`))
                        onUpdate(property.id, nextStatus);
                    }}
                  >
                    {nextStatus}
                  </ActionButton>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
function UserSection({ users, currentUserId, status, role, setStatus, setRole, busy, onUpdate }) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap gap-3">
        <FilterSelect
          label="User status"
          value={status}
          onChange={setStatus}
          options={["", "ACTIVE", "SUSPENDED", "DELETED"]}
        />
        <FilterSelect
          label="Role"
          value={role}
          onChange={setRole}
          options={["", "SEEKER", "LANDLORD", "ADMIN"]}
        />
      </div>
      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No users match these filters.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-border-muted bg-surface-container-lowest p-4"
            >
              <p className="font-bold">{user.profile?.displayName || "User"}</p>
              <p className="text-sm text-on-surface-variant">
                {user.email} · {user.status} · {user.roles.join(", ") || "No role"}
              </p>
              {user.id !== currentUserId && user.status !== "DELETED" && (
                <ActionButton
                  disabled={busy}
                  className={user.status === "ACTIVE" ? "text-error" : "text-success-cyan"}
                  onClick={() => {
                    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                    if (window.confirm(`Set this account to ${nextStatus.toLowerCase()}?`))
                      onUpdate(user.id, nextStatus);
                  }}
                >
                  {user.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                </ActionButton>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
function PaymentSection({ payments }) {
  return (
    <section className="mt-8">
      <div className="space-y-3">
        {payments.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No payments recorded.</p>
        ) : (
          payments.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border-muted bg-surface-container-lowest p-4 text-sm"
            >
              <p className="font-bold">
                {item.purpose} · {item.status}
              </p>
              <p className="text-on-surface-variant">
                {item.currency} {item.amount} · {item.provider} ·{" "}
                {item.providerReference || "No provider reference"}
              </p>
              <p className="text-on-surface-variant">
                {item.property.title} · {item.seeker.email} ·{" "}
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
