import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // If Supabase is not configured, fall back gracefully during development
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("[waitlist] Supabase env vars not set — logging sign-up locally:", email);
      return NextResponse.json(
        {
          message:
            "You're on the list! We'll be in touch soon.",
        },
        { status: 200 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { error } = await supabase.from("waitlist_signups").insert({
      email,
      source: req.headers.get("referer") ?? "direct",
      user_agent: req.headers.get("user-agent") ?? null,
    });

    if (error) {
      // Unique constraint violation — already on the list
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "You're already on the waitlist — we'll be in touch!" },
          { status: 200 }
        );
      }

      console.error("[waitlist] Supabase insert error:", error);
      return NextResponse.json(
        { error: "Something went wrong on our end. Please try again shortly." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "You're on the list! We'll be in touch soon." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[waitlist] Unhandled error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
