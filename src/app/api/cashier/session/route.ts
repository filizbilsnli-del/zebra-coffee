import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { authorized: false },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { authorized: false },
        { status: 401 }
      );
    }

    if (user.app_metadata?.role !== "cashier") {
      return NextResponse.json(
        { authorized: false },
        { status: 403 }
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      throw new Error("Server configuration error.");
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: staff, error } = await adminClient
      .from("cashier_staff")
      .select("id, full_name")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !staff) {
      return NextResponse.json(
        { authorized: false },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        authorized: true,
        cashier: {
          fullName: staff.full_name,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Cashier session error:", error);

    return NextResponse.json(
      { authorized: false },
      { status: 500 }
    );
  }
}