import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function getAdminClient(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return { error: "Login required.", status: 401 };
  }

  const token = authorization.replace("Bearer ", "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return { error: "Supabase configuration missing.", status: 500 };
  }

  const supabase = createClient(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user || user.app_metadata?.role !== "admin") {
    return { error: "Admin access required.", status: 403 };
  }

  return { supabase };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAdminClient(request);

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { data: orders, error } = await auth.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

   if (error) {
  console.error("ORDER UPDATE ERROR:", error.message);

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load orders." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAdminClient(request);

    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const id = Number(body.id);
    const status = body.status;

    const allowedStatuses = [
      "pending",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid order ID or status." },
        { status: 400 }
      );
    }

    const { data: order, error } = await auth.supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

   if (error) {
  console.error("ORDER UPDATE ERROR:", error);
  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}

    return NextResponse.json({
      success: true,
      order,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not update order." },
      { status: 500 }
    );
  }
}