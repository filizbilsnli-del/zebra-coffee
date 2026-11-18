import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, createHash } from "node:crypto";



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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !publishableKey || !secretKey) {
      return NextResponse.json(
        { error: "Server configuration missing." },
        { status: 500 }
      );
    }

    // Verify the customer's session.
    const authClient = createClient(url, publishableKey);

    const { data: userData, error: authError } =
      await authClient.auth.getUser(token);

    const user = userData.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: "Valid login required." },
        { status: 401 }
      );
    }

    // Server-side admin client. Never expose this key to the browser.
    const adminClient = createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate a cryptographically secure, opaque QR token.
    const rawToken = randomBytes(32).toString("hex");

    // Only the SHA-256 hash is stored in the database.
    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Deactivate previous QR tokens for this customer.
    const { error: revokeError } = await adminClient
      .from("customer_qr_tokens")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (revokeError) {
      console.error("QR TOKEN REVOCATION ERROR:", revokeError);

      return NextResponse.json(
        { error: "Could not refresh your QR code." },
        { status: 500 }
      );
    }

    // Save the new token hash.
    const { error: insertError } = await adminClient
      .from("customer_qr_tokens")
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        is_active: true,
      });

    if (insertError) {
      console.error("QR TOKEN INSERT ERROR:", insertError);

      return NextResponse.json(
        { error: "Could not create your QR code." },
        { status: 500 }
      );
    }

    // Return the raw token only once, for QR display.
    return NextResponse.json(
      { success: true, qrToken: rawToken },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("CUSTOMER QR ERROR:", error);

    return NextResponse.json(
      { error: "Could not generate your QR code." },
      { status: 500 }
    );
  }
}