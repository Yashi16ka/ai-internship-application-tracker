import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        {
          error: "Company, role, and date applied are required",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        UPDATE applications
        SET
          company = $1,
          role = $2,
          status = $3,
          date_applied = $4,
          job_url = $5,
          location = $6,
          next_action_date = $7,
          next_action = $8,
          recruiter_name = $9,
          recruiter_email = $10,
          notes = $11
        WHERE id = $12
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
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update application:", error);

    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
        DELETE FROM applications
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Application deleted",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Failed to delete application:", error);

    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}