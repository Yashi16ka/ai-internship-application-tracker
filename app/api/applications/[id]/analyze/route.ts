import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import pool from "@/lib/db";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const applicationResult = await pool.query(
      `
        SELECT
          id,
          company,
          role,
          status,
          TO_CHAR(date_applied, 'YYYY-MM-DD') AS "dateApplied",
          job_url AS "jobUrl",
          location,
          TO_CHAR(next_action_date, 'YYYY-MM-DD') AS "nextActionDate",
          next_action AS "nextAction",
          recruiter_name AS "recruiterName",
          recruiter_email AS "recruiterEmail",
          notes
        FROM applications
        WHERE id = $1
      `,
      [id]
    );

    if (applicationResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = applicationResult.rows[0];

    const eventsResult = await pool.query(
      `
        SELECT
          event_type AS "eventType",
          title,
          TO_CHAR(event_date, 'YYYY-MM-DD') AS "eventDate",
          notes
        FROM application_events
        WHERE application_id = $1
        ORDER BY event_date ASC, id ASC
      `,
      [id]
    );

    const applicationContext = {
      company: application.company,
      role: application.role,
      status: application.status,
      dateApplied: application.dateApplied,
      location: application.location,
      nextAction: application.nextAction,
      nextActionDate: application.nextActionDate,
      recruiterName: application.recruiterName,
      notes: application.notes,
      timeline: eventsResult.rows,
    };

    const prompt = `
You are an internship application advisor.

Analyze only the application information provided below.

Identify the most useful next step for the candidate based on the current
application status, dates, next action, notes, and recruiting timeline.

Do not invent recruiter responses, deadlines, interviews, company policies,
or application outcomes that are not present in the provided data.

If the stored information appears inconsistent or outdated, point that out.

Keep the response concise and practical.

Return exactly these three sections:

RECOMMENDED NEXT STEP:
One short actionable recommendation.

WHY:
One or two sentences explaining which application facts led to the recommendation.

SUGGESTED ACTION:
One concrete thing the candidate should do next.

Today's date is ${new Date().toISOString().split("T")[0]}.

APPLICATION DATA:
${JSON.stringify(applicationContext, null, 2)}
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const analysis = response.text?.trim();

    if (!analysis) {
      return NextResponse.json(
        {
          error:
            "AI Advisor did not return a response. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      applicationId: application.id,
      company: application.company,
      role: application.role,
      analysis,
    });
  } catch (error) {
    console.error("Failed to analyze application:", error);

    return NextResponse.json(
      {
        error:
          "AI Advisor is temporarily unavailable. Please try again in a moment.",
      },
      { status: 503 }
    );
  }
}