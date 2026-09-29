import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type ImportedApplication = {
  company: string;
  role: string;
  status: string;
  dateApplied: string;
  location: string;
  nextAction: string;
  nextActionDate: string;
  recruiterName: string;
  recruiterEmail: string;
  notes: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Application text is required" },
        { status: 400 }
      );
    }

    const prompt = `
You extract structured internship application information from recruiting
emails, application confirmations, recruiter messages, and job application
text.

Use ONLY information supported by the provided text.

Do not guess or invent missing information.

Return ONLY valid JSON. Do not include markdown, code fences, commentary,
or any text outside the JSON object.

Use exactly this structure:

{
  "company": "",
  "role": "",
  "status": "Applied",
  "dateApplied": "",
  "location": "",
  "nextAction": "",
  "nextActionDate": "",
  "recruiterName": "",
  "recruiterEmail": "",
  "notes": ""
}

Rules:

- company: company or organization name
- role: job or internship title
- status must be exactly one of:
  "Applied", "Assessment", "Interview", "Offer", "Rejected"
- If the text only confirms an application was submitted or received,
  use "Applied"
- If it contains an assessment invitation, use "Assessment"
- If it contains an interview invitation or scheduled interview,
  use "Interview"
- If it explicitly contains an offer, use "Offer"
- If it explicitly says the candidate was rejected or will not move forward,
  use "Rejected"
- dateApplied: use YYYY-MM-DD only when an application/submission date is
  supported by the text
- nextActionDate: use YYYY-MM-DD only when a future action or deadline date
  is supported by the text
- Do not treat an interview date or assessment deadline as dateApplied
- nextAction should be a short actionable description when supported
- recruiterName and recruiterEmail should only be populated if explicitly
  present
- notes should contain a short useful summary of relevant information that
  does not fit another field
- For any unsupported field, return an empty string
- Never invent dates, names, locations, emails, deadlines, or outcomes

Today's date is ${new Date().toISOString().split("T")[0]}.

TEXT TO ANALYZE:

${text}
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const responseText = response.text?.trim();

    if (!responseText) {
      return NextResponse.json(
        { error: "AI importer did not return a response" },
        { status: 502 }
      );
    }

    const cleanedResponse = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: ImportedApplication;

    try {
      parsed = JSON.parse(cleanedResponse);
    } catch {
      return NextResponse.json(
        { error: "AI importer returned invalid structured data" },
        { status: 502 }
      );
    }

    const allowedStatuses = [
      "Applied",
      "Assessment",
      "Interview",
      "Offer",
      "Rejected",
    ];

    const importedApplication: ImportedApplication = {
      company:
        typeof parsed.company === "string" ? parsed.company.trim() : "",

      role:
        typeof parsed.role === "string" ? parsed.role.trim() : "",

      status:
        typeof parsed.status === "string" &&
        allowedStatuses.includes(parsed.status)
          ? parsed.status
          : "Applied",

      dateApplied:
        typeof parsed.dateApplied === "string"
          ? parsed.dateApplied.trim()
          : "",

      location:
        typeof parsed.location === "string"
          ? parsed.location.trim()
          : "",

      nextAction:
        typeof parsed.nextAction === "string"
          ? parsed.nextAction.trim()
          : "",

      nextActionDate:
        typeof parsed.nextActionDate === "string"
          ? parsed.nextActionDate.trim()
          : "",

      recruiterName:
        typeof parsed.recruiterName === "string"
          ? parsed.recruiterName.trim()
          : "",

      recruiterEmail:
        typeof parsed.recruiterEmail === "string"
          ? parsed.recruiterEmail.trim()
          : "",

      notes:
        typeof parsed.notes === "string" ? parsed.notes.trim() : "",
    };

    return NextResponse.json({
      application: importedApplication,
    });
  } catch (error) {
    console.error("Failed to import application with AI:", error);

    return NextResponse.json(
      {
        error:
          "AI application importer is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }
}