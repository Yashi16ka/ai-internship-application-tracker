"use client";

import { useEffect, useState } from "react";

type ApplicationEvent = {
  id: number;
  applicationId: number;
  eventType: string;
  title: string;
  eventDate: string;
  notes: string | null;
  createdAt: string;
};

type ApplicationCardProps = {
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
  openSignal?: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function ApplicationCard({
  id,
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
  openSignal = 0,
  onEdit,
  onDelete,
}: ApplicationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventType, setEventType] = useState("Applied");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventNotes, setEventNotes] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    if (openSignal > 0) {
      setShowDetails(true);

      if (!eventsLoaded) {
        void fetchEvents();
      }
    }
  }, [openSignal]);

  function formatDate(date: string | null) {
    if (!date) {
      return "";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStatusStyles(status: string) {
    switch (status) {
      case "Applied":
        return "bg-blue-500/15 text-blue-300 border border-blue-500/20";

      case "Assessment":
        return "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20";

      case "Interview":
        return "bg-purple-500/15 text-purple-300 border border-purple-500/20";

      case "Offer":
        return "bg-green-500/15 text-green-300 border border-green-500/20";

      case "Rejected":
        return "bg-red-500/15 text-red-300 border border-red-500/20";

      default:
        return "bg-zinc-800 text-zinc-200 border border-zinc-700";
    }
  }

  function getEventStyles(type: string) {
    switch (type) {
      case "Applied":
        return "bg-blue-400";

      case "Assessment":
        return "bg-yellow-400";

      case "Interview":
        return "bg-purple-400";

      case "Follow-up":
        return "bg-orange-400";

      case "Offer":
        return "bg-green-400";

      case "Rejected":
        return "bg-red-400";

      default:
        return "bg-zinc-400";
    }
  }

  async function fetchEvents() {
    try {
      setEventsLoading(true);

      const response = await fetch(`/api/applications/${id}/events`);

      if (!response.ok) {
        throw new Error("Failed to fetch application events");
      }

      const data: ApplicationEvent[] = await response.json();

      setEvents(data);
      setEventsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch application events:", error);
    } finally {
      setEventsLoading(false);
    }
  }

  async function handleToggleDetails() {
    const openingDetails = !showDetails;

    setShowDetails(openingDetails);

    if (openingDetails && !eventsLoaded) {
      await fetchEvents();
    }
  }

  function resetEventForm() {
    setEventType("Applied");
    setEventTitle("");
    setEventDate("");
    setEventNotes("");
    setShowEventForm(false);
  }

  async function handleAddEvent() {
    if (!eventType || !eventTitle || !eventDate) {
      return;
    }

    try {
      setSavingEvent(true);

      const response = await fetch(`/api/applications/${id}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          title: eventTitle,
          eventDate,
          notes: eventNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create application event");
      }

      const newEvent: ApplicationEvent = await response.json();

      setEvents((currentEvents) =>
        [...currentEvents, newEvent].sort((a, b) => {
          const dateDifference =
            new Date(`${b.eventDate}T00:00:00`).getTime() -
            new Date(`${a.eventDate}T00:00:00`).getTime();

          if (dateDifference !== 0) {
            return dateDifference;
          }

          return b.id - a.id;
        })
      );

      resetEventForm();

      // The application context changed, so any previous AI analysis is stale.
      setAiAnalysis("");
      setAnalysisError("");
    } catch (error) {
      console.error("Failed to create application event:", error);
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleAnalyzeApplication() {
    try {
      setAnalyzing(true);
      setAnalysisError("");

      const response = await fetch(`/api/applications/${id}/analyze`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze application");
      }

      setAiAnalysis(data.analysis);
    } catch (error) {
  setAnalysisError(
    error instanceof Error
      ? error.message
      : "AI Advisor is temporarily unavailable. Please try again."
  );
} finally {
      setAnalyzing(false);
    }
  }

  return (
    <div
      id={`application-${id}`}
      className="group rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-purple-500/20"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {company}
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            {role}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
            status
          )}`}
        >
          {status}
        </span>
      </div>

      <p className="text-sm text-zinc-500">
        Applied {formatDate(dateApplied)}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleToggleDetails}
          className="text-sm text-zinc-300 transition-colors hover:text-white"
        >
          {showDetails ? "Hide details" : "View details"}
        </button>

        <button
          onClick={() => onEdit(id)}
          className="text-sm text-zinc-300 transition-colors hover:text-white"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(id)}
          className="text-sm text-red-400 transition-colors hover:text-red-300"
        >
          Delete
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          {location && (
            <div className="mb-3">
              <p className="text-sm text-zinc-500">
                Location
              </p>

              <p className="mt-1 text-sm text-zinc-200">
                {location}
              </p>
            </div>
          )}

          {nextAction && (
            <div className="mb-3">
              <p className="text-sm text-zinc-500">
                Next Action
              </p>

              <p className="mt-1 text-sm text-zinc-200">
                {nextAction}
              </p>
            </div>
          )}

          {nextActionDate && (
            <div className="mb-3">
              <p className="text-sm text-zinc-500">
                Next Action Date
              </p>

              <p className="mt-1 text-sm text-zinc-200">
                {formatDate(nextActionDate)}
              </p>
            </div>
          )}

          {recruiterName && (
            <div className="mb-3">
              <p className="text-sm text-zinc-500">
                Recruiter
              </p>

              <p className="mt-1 text-sm text-zinc-200">
                {recruiterName}
              </p>
            </div>
          )}

          {recruiterEmail && (
            <div className="mb-3">
              <p className="text-sm text-zinc-500">
                Recruiter Email
              </p>

              <a
                href={`mailto:${recruiterEmail}`}
                className="mt-1 block text-sm text-zinc-200 hover:text-white hover:underline"
              >
                {recruiterEmail}
              </a>
            </div>
          )}

          {notes && (
            <div className="mb-3">
              <p className="text-sm text-zinc-500">
                Notes
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
                {notes}
              </p>
            </div>
          )}

          {jobUrl && (
            <a
              href={jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white underline underline-offset-4 hover:text-zinc-300"
            >
              View Job Posting
            </a>
          )}

          <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-semibold text-white">
                  AI Application Advisor
                </h4>

                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Analyze your application details and recruiting activity to
                  identify the most useful next step.
                </p>
              </div>

              <button
                onClick={handleAnalyzeApplication}
                disabled={analyzing}
                className="shrink-0 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing
                  ? "Analyzing..."
                  : aiAnalysis
                  ? "Analyze Again"
                  : "✨ Analyze Application"}
              </button>
            </div>

            {analysisError && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">
                  {analysisError}
                </p>
              </div>
            )}

            {aiAnalysis && (
              <div className="mt-4 rounded-lg border border-violet-500/20 bg-black/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-200">
                  {aiAnalysis}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-white">
                  Activity Timeline
                </h4>

                <p className="mt-1 text-xs text-zinc-500">
                  Track updates throughout the recruiting process.
                </p>
              </div>

              {!showEventForm && (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                >
                  + Add Activity
                </button>
              )}
            </div>

            {showEventForm && (
              <div className="mt-4 rounded-lg border border-zinc-800 bg-black/40 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs text-zinc-500">
                      Event Type
                    </label>

                    <select
                      value={eventType}
                      onChange={(event) =>
                        setEventType(event.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Interview">Interview</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-zinc-500">
                      Date
                    </label>

                    <input
                      type="date"
                      value={eventDate}
                      onChange={(event) =>
                        setEventDate(event.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs text-zinc-500">
                      Title
                    </label>

                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(event) =>
                        setEventTitle(event.target.value)
                      }
                      placeholder="e.g. Technical interview scheduled"
                      className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs text-zinc-500">
                      Notes
                    </label>

                    <textarea
                      value={eventNotes}
                      onChange={(event) =>
                        setEventNotes(event.target.value)
                      }
                      placeholder="Optional notes..."
                      rows={2}
                      className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={resetEventForm}
                    disabled={savingEvent}
                    className="px-3 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAddEvent}
                    disabled={
                      savingEvent ||
                      !eventTitle ||
                      !eventDate
                    }
                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingEvent ? "Saving..." : "Add Activity"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5">
              {eventsLoading ? (
                <p className="text-sm text-zinc-500">
                  Loading activity...
                </p>
              ) : events.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-800 p-4">
                  <p className="text-sm text-zinc-500">
                    No activity recorded yet.
                  </p>
                </div>
              ) : (
                <div>
                  {events.map((applicationEvent, index) => (
                    <div
                      key={applicationEvent.id}
                      className="relative flex gap-4"
                    >
                      <div className="flex w-3 flex-col items-center">
                        <div
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getEventStyles(
                            applicationEvent.eventType
                          )}`}
                        />

                        {index < events.length - 1 && (
                          <div className="mt-1 h-full w-px bg-zinc-800" />
                        )}
                      </div>

                      <div
                        className={
                          index < events.length - 1
                            ? "pb-6"
                            : "pb-1"
                        }
                      >
                        <p className="text-xs text-zinc-500">
                          {formatDate(applicationEvent.eventDate)}
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {applicationEvent.title}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {applicationEvent.eventType}
                        </p>

                        {applicationEvent.notes && (
                          <p className="mt-2 text-sm leading-6 text-zinc-400">
                            {applicationEvent.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}