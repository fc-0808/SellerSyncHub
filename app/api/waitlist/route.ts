import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import {
  APPLICATION_TERMS_VERSION,
  PRIVACY_POLICY_VERSION,
} from "@/lib/legal/constants";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isTrue(v: unknown): v is true {
  return v === true;
}

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

    if (
      !isTrue(body?.accept_privacy) ||
      !isTrue(body?.accept_application_terms)
    ) {
      return NextResponse.json(
        {
          error:
            "You must accept the Privacy Policy and Seller Application Terms to join the waitlist.",
        },
        { status: 400 }
      );
    }

    const consentedAt = new Date().toISOString();

    if (
      !process.env.SUPABASE_URL ||
      (!process.env.SUPABASE_SERVICE_ROLE_KEY &&
        !process.env.SUPABASE_SECRET_KEY)
    ) {
      console.warn(
        "[waitlist] Supabase env vars not set — logging sign-up locally:",
        email,
        {
          privacy_policy_version: PRIVACY_POLICY_VERSION,
          application_terms_version: APPLICATION_TERMS_VERSION,
          consented_at: consentedAt,
        }
      );
      return NextResponse.json(
        {
          message: "You're on the list! We'll be in touch soon.",
        },
        { status: 200 }
      );
    }

    const supabase = createSupabaseServerClient();

    const row = {
      email,
      source: req.headers.get("referer") ?? "direct",
      user_agent: req.headers.get("user-agent") ?? null,
      privacy_policy_version: PRIVACY_POLICY_VERSION,
      application_terms_version: APPLICATION_TERMS_VERSION,
      consented_at: consentedAt,
    };

    const { error } = await supabase.from("waitlist_signups").insert(row);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "You're already on the waitlist — we'll be in touch!" },
          { status: 200 }
        );
      }

      if (
        error.message?.includes("column") ||
        error.code === "PGRST204" ||
        error.code === "42703"
      ) {
        console.error(
          "[waitlist] Database schema may be outdated. Run supabase/migrations/002_waitlist_consents.sql:",
          error
        );
        return NextResponse.json(
          {
            error:
              "Server configuration is being updated. Please try again in a few minutes.",
          },
          { status: 503 }
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
