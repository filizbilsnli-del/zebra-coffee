
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required." },
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

    if (authError || !user || user.app_metadata?.role !== "cashier") {
      return NextResponse.json(
        { error: "Cashier access required." },
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

    const { data: staff, error: staffError } = await adminClient
      .from("cashier_staff")
      .select("id")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: "Cashier account is inactive." },
        { status: 403 }
      );
    }

    const { data: transactions, error: transactionError } =
      await adminClient
        .from("cashier_transactions")
        .select(
          "id, user_id, amount, points_earned, points_redeemed, discount_amount, branch, transaction_type, created_at"
        )
        .eq("cashier_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (transactionError) {
      throw new Error("Could not load transaction history.");
    }

    const customerIds = [
      ...new Set((transactions || []).map((item) => item.user_id)),
    ];

    let profiles: { id: string; full_name: string | null }[] = [];

    if (customerIds.length > 0) {
      const { data, error } = await adminClient
        .from("profiles")
        .select("id, full_name")
        .in("id", customerIds);

      if (error) {
        throw new Error("Could not load customer names.");
      }

      profiles = data || [];
    }

    const history = (transactions || []).map((transaction) => {
      const profile = profiles.find(
        (item) => item.id === transaction.user_id
      );

      return {
        ...transaction,
        customer_name: profile?.full_name || "Customer",
      };
    });

    return NextResponse.json(
      { success: true, history },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Cashier history error:", error);

    return NextResponse.json(
      { error: "Unable to load transaction history." },
      { status: 500 }
    );
  }
}
