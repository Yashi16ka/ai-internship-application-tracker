import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
        SELECT
          id,
          application_id AS "applicationId",
          event_type AS "eventType",
          title,
          TO_CHAR(event_date, 'YYYY-MM-DD') AS "eventDate",
          notes,
          created_at AS "createdAt"
        FROM application_events
        WHERE application_id = $1
        ORDER BY event_date DESC, id DESC
      `,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch application events:", error);

    return NextResponse.json(
      { error: "Failed to fetch application events" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { eventType, title, eventDate, notes } = body;

    if (!eventType || !title || !eventDate) {
      return NextResponse.json(
        {
          error: "Event type, title, and event date are required",
        },
        { status: 400 }
      );
    }

    const applicationResult = await pool.query(
      `
        SELECT id
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

    const result = await pool.query(
      `
        INSERT INTO application_events (
          application_id,
          event_type,
          title,
          event_date,
          notes
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          application_id AS "applicationId",
          event_type AS "eventType",
          title,
          TO_CHAR(event_date, 'YYYY-MM-DD') AS "eventDate",
          notes,
          created_at AS "createdAt"
      `,
      [
        id,
        eventType,
        title,
        eventDate,
        notes || null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create application event:", error);

    return NextResponse.json(
      { error: "Failed to create application event" },
      { status: 500 }
    );
  }
}