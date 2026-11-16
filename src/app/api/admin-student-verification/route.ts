import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Login required." },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !publishableKey || !secretKey) {
      return NextResponse.json(
        { error: "Server configuration missing." },
        { status: 500 }
      );
    }

    // Verify the signed-in user.
    const authClient = createClient(url, publishableKey);

    const { data: userData, error: authError } =
      await authClient.auth.getUser(token);

    const user = userData.user;

    if (authError || !user || user.app_metadata?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const verificationId = Number(body.verificationId);
    const status = body.status;

    if (
      !Number.isInteger(verificationId) ||
      verificationId <= 0 ||
      !["verified", "rejected"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid verification ID or status." },
        { status: 400 }
      );
    }

    // This client is server-side only.
    const adminClient = createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: application, error: findError } = await adminClient
      .from("student_verifications")
      .select("id, user_id")
      .eq("id", verificationId)
      .single();

    if (findError || !application) {
      return NextResponse.json(
        { error: "Student application not found." },
        { status: 404 }
      );
    }

    const reviewedAt = new Date().toISOString();

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        student_status: status,
        updated_at: reviewedAt,
      })
      .eq("id", application.user_id);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const { error: verificationError } = await adminClient
      .from("student_verifications")
      .update({
        status,
        reviewed_at: reviewedAt,
        reviewed_by: user.id,
      })
      .eq("id", verificationId);

    if (verificationError) {
      return NextResponse.json(
        { error: verificationError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("STUDENT VERIFICATION ERROR:", error);

    return NextResponse.json(
      { error: "Could not update student verification." },
      { status: 500 }
    );
  }
}