import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify cashier session
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

    // 2. Admin client
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

    // 3. Check active cashier
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

    // 4. Validate QR token
    const body = await request.json();
    const { qrToken } = body;

    if (
      typeof qrToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(qrToken)
    ) {
      return NextResponse.json(
        { error: "Invalid QR code." },
        { status: 400 }
      );
    }

    // 5. Hash QR token
    const tokenHash = createHash("sha256")
      .update(qrToken)
      .digest("hex");

    // 6. Find customer QR
    const { data: qrRecord, error: qrError } = await adminClient
      .from("customer_qr_tokens")
      .select("id, user_id")
      .eq("token_hash", tokenHash)
      .eq("is_active", true)
      .maybeSingle();

    if (qrError || !qrRecord) {
      return NextResponse.json(
        { error: "Invalid or expired customer QR." },
        { status: 404 }
      );
    }

    const customerId = qrRecord.user_id;

    // 7. Load customer profile
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("full_name, birth_date, student_status")
      .eq("id", customerId)
      .maybeSingle();

    if (profileError) {
      throw new Error("Could not load customer profile.");
    }

    // 8. Load loyalty transactions
    const { data: transactions, error: transactionError } =
      await adminClient
        .from("loyalty_transactions")
        .select("points, transaction_type")
        .eq("user_id", customerId);

    if (transactionError) {
      throw new Error("Could not load loyalty balance.");
    }

    let balance = 0;
    let lifetimeEarned = 0;

    for (const transaction of transactions || []) {
      const points = Number(transaction.points);

      if (transaction.transaction_type === "earned") {
        balance += points;
        lifetimeEarned += points;
      }

      if (transaction.transaction_type === "redeemed") {
        balance -= Math.abs(points);
      }
    }

    balance = Math.max(0, balance);

    // 9. Calculate membership level
    let level = "Coffee Beginner";

    if (lifetimeEarned >= 1000) {
      level = "Zebra Legend";
    } else if (lifetimeEarned >= 600) {
      level = "Gold Member";
    } else if (lifetimeEarned >= 300) {
      level = "Coffee Lover";
    } else if (lifetimeEarned >= 100) {
      level = "Zebra Friend";
    }

    // 10. Check birthday using Baku date
    const bakuParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Baku",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const bakuMonth = bakuParts.find(
      (part) => part.type === "month"
    )?.value;

    const bakuDay = bakuParts.find(
      (part) => part.type === "day"
    )?.value;

    const birthDate = profile?.birth_date
      ? String(profile.birth_date).slice(0, 10)
      : null;

    const birthParts = birthDate?.split("-");

    const isBirthday =
      !!birthParts &&
      birthParts.length === 3 &&
      birthParts[1] === bakuMonth &&
      birthParts[2] === bakuDay;

    // 11. Check verified student status
    const isVerifiedStudent =
      profile?.student_status === "verified";

    // Same priority as the customer app
    let discountType = "none";
    let discountRate = 0;

    if (isBirthday) {
      discountType = "birthday";
      discountRate = 0.15;
    } else if (isVerifiedStudent) {
      discountType = "student";
      discountRate = 0.10;
    }

    // 12. Get current Baku month
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Baku",
      year: "numeric",
      month: "2-digit",
    }).formatToParts(new Date());

    const year = dateParts.find(
      (part) => part.type === "year"
    )?.value;

    const month = dateParts.find(
      (part) => part.type === "month"
    )?.value;

    const currentMonth = `${year}-${month}-01`;

    // 13. Find customer's personal monthly reward
    const { data: monthlyReward, error: rewardError } =
      await adminClient
        .from("member_rewards")
        .select("id, reward_name, reward_month, status")
        .eq("user_id", customerId)
        .eq("reward_type", "monthly_level_reward")
        .eq("reward_month", currentMonth)
        .eq("status", "available")
        .maybeSingle();

    if (rewardError) {
      throw new Error("Could not load monthly member reward.");
    }

    // 14. Update QR last used time
    const { error: updateError } = await adminClient
      .from("customer_qr_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", qrRecord.id);

    if (updateError) {
      throw new Error("Could not update QR usage.");
    }

    // 15. Return customer information
    return NextResponse.json(
      {
        success: true,
        customer: {
          id: customerId,
          fullName: profile?.full_name || "Customer",
          level,
          balance,
          lifetimeEarned,
          discountValue: (balance / 100).toFixed(2),

          isBirthday,
          isVerifiedStudent,

          discountType,
          discountRate,

          monthlyReward: monthlyReward
            ? {
                id: monthlyReward.id,
                name: monthlyReward.reward_name,
                status: monthlyReward.status,
              }
            : null,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Cashier scan error:", error);

    return NextResponse.json(
      { error: "Unable to scan customer QR code." },
      { status: 500 }
    );
  }
}