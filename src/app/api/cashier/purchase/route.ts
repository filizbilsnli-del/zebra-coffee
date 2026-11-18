import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { qrToken, amount, branch, idempotencyKey } = body;

    if (
      typeof qrToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(qrToken)
    ) {
      return NextResponse.json(
        { error: "Invalid QR code." },
        { status: 400 }
      );
    }

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 10000 ||
      Math.round(amount * 100) !== amount * 100
    ) {
      return NextResponse.json(
        { error: "Invalid purchase amount." },
        { status: 400 }
      );
    }

    if (!["Gənclik", "28 May"].includes(branch)) {
      return NextResponse.json(
        { error: "Invalid branch." },
        { status: 400 }
      );
    }

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      typeof idempotencyKey !== "string" ||
      !uuidPattern.test(idempotencyKey)
    ) {
      return NextResponse.json(
        { error: "Invalid transaction key." },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(qrToken)
      .digest("hex");

    const { data, error } = await adminClient.rpc(
      "cashier_record_purchase",
      {
        p_cashier_id: user.id,
        p_token_hash: tokenHash,
        p_amount: amount,
        p_branch: branch,
        p_idempotency_key: idempotencyKey,
      }
    );

    if (error) {
      console.error("Cashier purchase RPC error:", error);

      return NextResponse.json(
        { error: "Purchase could not be recorded." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        duplicate: data.duplicate,
        pointsEarned: data.pointsEarned,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Cashier purchase error:", error);

    return NextResponse.json(
      { error: "Unable to process purchase." },
      { status: 500 }
    );
  }
}