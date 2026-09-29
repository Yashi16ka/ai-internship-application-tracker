"use client";

import { useEffect, useState } from "react";
import ApplicationCard from "@/components/ApplicationCard";

type Application = {
  id: number;
  company: string;
  role: string;
  status: string;
  dateApplied: string;
  jobUrl: string | null;
  location: string | null;
  nextActionDate: string | null;
  nextAction: string | null;
  recruiterName: string | null;
  recruiterEmail: string | null;
  notes: string | null;
};

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [dateApplied, setDateApplied] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showImport, setShowImport] = useState(false);
const [importText, setImportText] = useState("");
const [importing, setImporting] = useState(false);
const [importError, setImportError] = useState("");
const [wasImportedWithAI, setWasImportedWithAI] = useState(false);

  const [focusedApplicationId, setFocusedApplicationId] = useState<number | null>(null);
  const [openSignal, setOpenSignal] = useState(0);
  const [missingFollowUpsOnly, setMissingFollowUpsOnly] = useState(false);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("/api/applications");

        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    }

    fetchApplications();
  }, []);

  function handleInsightAction(applicationId: number) {
    setSearchQuery("");
    setStatusFilter("All");
    setMissingFollowUpsOnly(false);
    setFocusedApplicationId(applicationId);
    setOpenSignal((current) => current + 1);

    window.setTimeout(() => {
      document
        .getElementById(`application-${applicationId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  }

  function handleReviewMissingFollowUps() {
    setSearchQuery("");
    setStatusFilter("All");
    setMissingFollowUpsOnly(true);

    window.setTimeout(() => {
      document
        .getElementById("applications-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function resetForm() {
    setCompany("");
    setRole("");
    setStatus("Applied");
    setDateApplied("");
    setJobUrl("");
    setLocation("");
    setNextActionDate("");
    setNextAction("");
    setRecruiterName("");
    setRecruiterEmail("");
    setNotes("");
setEditingId(null);
setWasImportedWithAI(false);
setShowForm(false);
  }

  function handleOpenAddForm() {
    setCompany("");
    setRole("");
    setStatus("Applied");
    setDateApplied("");
    setJobUrl("");
    setLocation("");
    setNextActionDate("");
    setNextAction("");
    setRecruiterName("");
    setRecruiterEmail("");
    setNotes("");
    setEditingId(null);
    setWasImportedWithAI(false);
    setShowForm(true);
  }
  async function handleImportApplication() {
  if (!importText.trim()) {
    setImportError("Paste an application email or recruiting message first.");
    return;
  }

  try {
    setImporting(true);
    setImportError("");

    const response = await fetch("/api/applications/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: importText,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to analyze application text"
      );
    }

    const importedApplication = data.application;

    setCompany(importedApplication.company || "");
    setRole(importedApplication.role || "");
    setStatus(importedApplication.status || "Applied");
    setDateApplied(importedApplication.dateApplied || "");
    setJobUrl("");
    setLocation(importedApplication.location || "");
    setNextActionDate(importedApplication.nextActionDate || "");
    setNextAction(importedApplication.nextAction || "");
    setRecruiterName(importedApplication.recruiterName || "");
    setRecruiterEmail(importedApplication.recruiterEmail || "");
    setNotes(importedApplication.notes || "");

    setEditingId(null);
setWasImportedWithAI(true);
setShowImport(false);
setShowForm(true);
    setImportText("");

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  } catch (error) {
    setImportError(
      error instanceof Error
        ? error.message
        : "AI importer is temporarily unavailable. Please try again."
    );
  } finally {
    setImporting(false);
  }
}

  function handleEdit(id: number) {
    const application = applications.find(
      (application) => application.id === id
    );

    if (!application) {
      return;
    }

    setCompany(application.company);
    setRole(application.role);
    setStatus(application.status);
    setDateApplied(application.dateApplied);
    setJobUrl(application.jobUrl || "");
    setLocation(application.location || "");
    setNextActionDate(application.nextActionDate || "");
    setNextAction(application.nextAction || "");
    setRecruiterName(application.recruiterName || "");
    setRecruiterEmail(application.recruiterEmail || "");
    setNotes(application.notes || "");

    setEditingId(id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmitApplication() {
    if (!company || !role || !dateApplied) {
      return;
    }

    const applicationData = {
      company,
      role,
      status,
      dateApplied,
      jobUrl,
      location,
      nextActionDate,
      nextAction,
      recruiterName,
      recruiterEmail,
      notes,
    };

    try {
      if (editingId !== null) {
        const response = await fetch(`/api/applications/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        });

        if (!response.ok) {
          throw new Error("Failed to update application");
        }

        const updatedApplication: Application = await response.json();

        setApplications((currentApplications) =>
          currentApplications.map((application) =>
            application.id === editingId
              ? updatedApplication
              : application
          )
        );
      } else {
        const response = await fetch("/api/applications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        });

        if (!response.ok) {
          throw new Error("Failed to add application");
        }

        const newApplication: Application = await response.json();

        setApplications((currentApplications) => [
          ...currentApplications,
          newApplication,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save application:", error);
    }
  }

  async function handleDelete(id: number) {
    const application = applications.find(
      (application) => application.id === id
    );

    if (!application) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the ${application.role} application at ${application.company}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) => application.id !== id
        )
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  }

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStatusBadgeClasses(status: string) {
    switch (status) {
      case "Applied":
        return "border border-blue-500/30 bg-blue-500/15 text-blue-300";

      case "Assessment":
        return "border border-yellow-500/30 bg-yellow-500/15 text-yellow-300";

      case "Interview":
        return "border border-purple-500/30 bg-purple-500/15 text-purple-300";

      case "Offer":
        return "border border-green-500/30 bg-green-500/15 text-green-300";

      case "Rejected":
        return "border border-red-500/30 bg-red-500/15 text-red-300";

      default:
        return "border border-zinc-700 bg-zinc-800 text-zinc-300";
    }
  }

const appliedCount = applications.filter(
  (application) => application.status === "Applied"
).length;

const assessmentCount = applications.filter(
  (application) => application.status === "Assessment"
).length;

const interviewCount = applications.filter(
  (application) => application.status === "Interview"
).length;

const offerCount = applications.filter(
  (application) => application.status === "Offer"
).length;

const rejectedCount = applications.filter(
  (application) => application.status === "Rejected"
).length;

const activeApplicationCount =
  appliedCount + assessmentCount + interviewCount + offerCount;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingApplications = applications
    .filter((application) => {
      if (!application.nextActionDate) {
        return false;
      }

      const actionDate = new Date(
        `${application.nextActionDate}T00:00:00`
      );

      return actionDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(
        `${a.nextActionDate}T00:00:00`
      ).getTime();

      const dateB = new Date(
        `${b.nextActionDate}T00:00:00`
      ).getTime();

      return dateA - dateB;
    });

  const nextPriorityApplication = upcomingApplications[0] ?? null;

  const furthestStageApplication =
    applications.find((application) => application.status === "Offer") ??
    applications.find((application) => application.status === "Interview") ??
    applications.find((application) => application.status === "Assessment") ??
    applications.find((application) => application.status === "Applied") ??
    null;

  const applicationsWithScheduledActions = applications.filter(
    (application) =>
      application.status !== "Rejected" &&
      application.nextActionDate !== null
  ).length;

  const followUpCoverage =
    activeApplicationCount > 0
      ? Math.round(
          (applicationsWithScheduledActions / activeApplicationCount) * 100
        )
      : 0;

  const filteredApplications = applications
    .filter((application) => {
      const matchesSearch =
        application.company
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        application.role
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        application.status === statusFilter;

      const matchesFollowUpFilter =
        !missingFollowUpsOnly ||
        (application.status !== "Rejected" &&
          application.nextActionDate === null);

      return matchesSearch && matchesStatus && matchesFollowUpFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(`${b.dateApplied}T00:00:00`).getTime() -
          new Date(`${a.dateApplied}T00:00:00`).getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(`${a.dateApplied}T00:00:00`).getTime() -
          new Date(`${b.dateApplied}T00:00:00`).getTime()
        );
      }

      if (sortBy === "nextAction") {
        if (!a.nextActionDate && !b.nextActionDate) {
          return 0;
        }

        if (!a.nextActionDate) {
          return 1;
        }

        if (!b.nextActionDate) {
          return -1;
        }

        return (
          new Date(`${a.nextActionDate}T00:00:00`).getTime() -
          new Date(`${b.nextActionDate}T00:00:00`).getTime()
        );
      }

      if (sortBy === "company") {
        return a.company.localeCompare(b.company);
      }

      return 0;
    });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#181127_0%,_#09090b_38%,_#000000_72%)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            AI Internship Application Tracker
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white">
            Recruiting Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Track applications, recruiting progress, interviews, and upcoming deadlines in one place.
          </p>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
  <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-700">
    <p className="text-sm text-zinc-400">
      Total Applications
    </p>
    <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
      {applications.length}
    </p>
  </div>

  <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-yellow-500/30">
    <p className="text-sm text-zinc-400">
      Assessments
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {assessmentCount}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">
              Interviews
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {interviewCount}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">
              Offers
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {offerCount}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">
              Upcoming Actions
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {upcomingApplications.length}
            </p>
          </div>
        </section>
                <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Application Pipeline
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                See how your active applications are distributed across recruiting stages.
              </p>
            </div>

            <p className="text-xs text-zinc-500">
              {rejectedCount} rejected
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Applied",
                count: appliedCount,
                barClass: "bg-blue-400",
              },
              {
                label: "Assessment",
                count: assessmentCount,
                barClass: "bg-yellow-400",
              },
              {
                label: "Interview",
                count: interviewCount,
                barClass: "bg-purple-400",
              },
              {
                label: "Offer",
                count: offerCount,
                barClass: "bg-green-400",
              },
            ].map((stage) => {
              const percentage =
                activeApplicationCount > 0
                  ? (stage.count / activeApplicationCount) * 100
                  : 0;

              return (
                <div
                  key={stage.label}
                  className="rounded-xl border border-zinc-800/70 bg-black/20 p-4 transition duration-200 hover:border-zinc-700/80 hover:bg-zinc-900/50"
                >
                 <div className="mb-3 flex items-center justify-between">
  <p className="text-sm font-medium text-zinc-300">
    {stage.label}
  </p>

  <span className="ml-4 min-w-6 rounded-md bg-zinc-800 px-2 py-0.5 text-center text-xs font-semibold text-zinc-200">
    {stage.count}
  </span>
</div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${stage.barClass}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-2.5 text-xs text-zinc-500">
                    {activeApplicationCount > 0
                      ? `${Math.round(percentage)}% of active applications`
                      : "No active applications"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {applications.length > 0 && (
          <section className="mb-10 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-5 shadow-lg shadow-purple-950/10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-purple-300">
                  <span>✨</span>
                  Smart Insights
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Recruiting Intelligence
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Actionable signals calculated from your current recruiting pipeline.
                </p>
              </div>

              <span className="w-fit rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                Real-time insights
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-zinc-800/80 bg-black/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Next Priority
                </p>

                {nextPriorityApplication ? (
                  <>
                    <p className="mt-2 font-semibold text-white">
                      {nextPriorityApplication.company}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {nextPriorityApplication.nextAction ||
                        "Upcoming recruiting action"}
                    </p>

                    <p className="mt-3 text-xs text-purple-300">
                      Due {formatDate(nextPriorityApplication.nextActionDate!)}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleInsightAction(nextPriorityApplication.id)
                      }
                      className="mt-4 text-sm font-medium text-purple-300 transition-colors hover:text-purple-200"
                    >
                      Take action →
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-zinc-400">
                    No upcoming actions scheduled.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-black/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Pipeline Momentum
                </p>

                {furthestStageApplication ? (
                  <>
                    <p className="mt-2 font-semibold text-white">
                      {furthestStageApplication.company}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {furthestStageApplication.role}
                    </p>

                    <p className="mt-3 text-xs text-purple-300">
                      Furthest active stage: {furthestStageApplication.status}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleInsightAction(furthestStageApplication.id)
                      }
                      className="mt-4 text-sm font-medium text-purple-300 transition-colors hover:text-purple-200"
                    >
                      View application →
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-zinc-400">
                    No active applications yet.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-black/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Follow-up Coverage
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {followUpCoverage}%
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  of active applications have a next action scheduled.
                </p>

                <p className="mt-3 text-xs text-purple-300">
                  {applicationsWithScheduledActions} of {activeApplicationCount} covered
                </p>

                {applicationsWithScheduledActions < activeApplicationCount && (
                  <button
                    type="button"
                    onClick={handleReviewMissingFollowUps}
                    className="mt-4 text-sm font-medium text-purple-300 transition-colors hover:text-purple-200"
                  >
                    Review missing follow-ups →
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {upcomingApplications.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold">
              Upcoming Actions
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Your next recruiting deadlines and follow-ups.
            </p>

            <div className="mt-5 space-y-3">
              {upcomingApplications.map((application) => (
                <div
                  key={application.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleInsightAction(application.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleInsightAction(application.id);
                    }
                  }}
                  className="group cursor-pointer rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-zinc-900"
                >
                  <div className="grid gap-5 md:grid-cols-[1.1fr_1.4fr_auto] md:items-center">
                    <div>
                      <h3 className="font-semibold text-white">
                        {application.company}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        {application.role}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Next Action
                      </p>

                      {application.nextAction && (
                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {application.nextAction}
                        </p>
                      )}
                    </div>

                    <div className="md:text-right">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>

                      <p className="mt-2 text-sm text-zinc-400">
                        {formatDate(application.nextActionDate!)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Applications
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Your current internship pipeline.
              </p>
            </div>

            <div className="flex items-center gap-3">
  <button
    onClick={() => {
      setShowImport((current) => !current);
      setImportError("");
    }}
    className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
  >
    ✨ Import with AI
  </button>

  <button
    onClick={handleOpenAddForm}
    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
  >
    + Add Application
  </button>
</div>
          </div>
{showImport && (
  <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-white">
          ✨ Import Application with AI
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          Paste an application confirmation, recruiter email, or hiring
          message. AI will extract the application details for you to review.
        </p>
      </div>

      <button
        onClick={() => {
          setShowImport(false);
          setImportError("");
        }}
        className="text-sm text-zinc-400 hover:text-white"
      >
        Cancel
      </button>
    </div>

    <textarea
      value={importText}
      onChange={(event) => setImportText(event.target.value)}
      placeholder="Paste your recruiting email or application confirmation here..."
      rows={7}
      className="mt-5 w-full rounded-lg border border-zinc-700 bg-black px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-500/60"
    />

    {importError && (
      <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        {importError}
      </div>
    )}

    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-xs text-zinc-500">
        AI-generated fields should be reviewed before saving.
      </p>

      <button
        onClick={handleImportApplication}
        disabled={importing}
        className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {importing ? "Analyzing..." : "Analyze & Fill Form"}
      </button>
    </div>
  </div>
)}
          {showForm && (
            <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingId !== null
                    ? "Edit Application"
                    : "Add Application"}
                </h3>

                <button
                  onClick={resetForm}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
{wasImportedWithAI && (
  <div className="mt-4 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3">
    <p className="text-sm font-medium text-purple-300">
      ✨ Filled with AI
    </p>
    <p className="mt-1 text-xs text-zinc-400">
      Review the extracted details before saving this application.
    </p>
  </div>
)}
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Company
                  </label>

                  <input
                    type="text"
                    value={company}
                    onChange={(event) =>
                      setCompany(event.target.value)
                    }
                    placeholder="e.g. Google"
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Role
                  </label>

                  <input
                    type="text"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Date Applied
                  </label>

                  <input
                    type="date"
                    value={dateApplied}
                    onChange={(event) =>
                      setDateApplied(event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Job URL
                  </label>

                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(event) =>
                      setJobUrl(event.target.value)
                    }
                    placeholder="https://company.com/jobs/..."
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="e.g. Seattle, WA"
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Next Action
                  </label>

                  <input
                    type="text"
                    value={nextAction}
                    onChange={(event) =>
                      setNextAction(event.target.value)
                    }
                    placeholder="e.g. Follow up with recruiter"
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Next Action Date
                  </label>

                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(event) =>
                      setNextActionDate(event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Recruiter Name
                  </label>

                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(event) =>
                      setRecruiterName(event.target.value)
                    }
                    placeholder="e.g. Alex Johnson"
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Recruiter Email
                  </label>

                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={(event) =>
                      setRecruiterEmail(event.target.value)
                    }
                    placeholder="recruiter@company.com"
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-400">
                    Notes
                  </label>

                  <textarea
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value)
                    }
                    placeholder="Add notes about this application..."
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={handleSubmitApplication}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
                >
                  {editingId !== null
                    ? "Save Changes"
                    : "Add Application"}
                </button>
              </div>
            </div>
          )}

          <div id="applications-section">
            {missingFollowUpsOnly && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setMissingFollowUpsOnly(false)}
                  className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/15"
                >
                  Missing follow-ups only ×
                </button>
              </div>
            )}

          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setMissingFollowUpsOnly(false);
              }}
              placeholder="Search by company or role..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-600"
            />

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setMissingFollowUpsOnly(false);
              }}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Assessment">Assessment</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
            >
              <option value="newest">Newest Applied</option>
              <option value="oldest">Oldest Applied</option>
              <option value="nextAction">
                Next Action Soonest
              </option>
              <option value="company">Company A–Z</option>
            </select>
          </div>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  id={application.id}
                  company={application.company}
                  role={application.role}
                  status={application.status}
                  dateApplied={application.dateApplied}
                  jobUrl={application.jobUrl}
                  location={application.location}
                  nextActionDate={application.nextActionDate}
                  nextAction={application.nextAction}
                  recruiterName={application.recruiterName}
                  recruiterEmail={application.recruiterEmail}
                  notes={application.notes}
                  openSignal={
                    focusedApplicationId === application.id ? openSignal : 0
                  }
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-400">
                No applications match your search.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}