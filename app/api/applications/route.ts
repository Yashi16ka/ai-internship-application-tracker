import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
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
      ORDER BY id ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch applications:", error);

    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
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
    } = body;

    if (!company || !role || !dateApplied) {
      return NextResponse.json(
        { error: "Company, role, and date applied are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        INSERT INTO applications (
          company,
          role,
          status,
          date_applied,
          job_url,
          location,
          next_action_date,
          next_action,
          recruiter_name,
          recruiter_email,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING
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
      `,
      [
        company,
        role,
        status || "Applied",
        dateApplied,
        jobUrl || null,
        location || null,
        nextActionDate || null,
        nextAction || null,
        recruiterName || null,
        recruiterEmail || null,
        notes || null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create application:", error);

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}