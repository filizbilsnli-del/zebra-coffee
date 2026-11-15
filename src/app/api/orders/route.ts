import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { products } from "@/data/products";
import { getProductDetails } from "@/data/product-options";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid login session." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      items: requestedItems,
      orderType,
      branch,
      customerName,
      phone,
      deliveryAddress,
      orderNote,
      paymentMethod,
    } = body;

    const redeemPoints = body.redeemPoints ?? 0;

    if (
      !Number.isInteger(redeemPoints) ||
      redeemPoints < 0 ||
      redeemPoints % 100 !== 0
    ) {
      return NextResponse.json(
        { error: "Invalid reward points." },
        { status: 400 }
      );
    }

    if (!["delivery", "pickup"].includes(orderType)) {
      return NextResponse.json(
        { error: "Please select delivery or pickup." },
        { status: 400 }
      );
    }

    if (!["Gənclik", "28 May"].includes(branch)) {
      return NextResponse.json(
        { error: "Please select a valid branch." },
        { status: 400 }
      );
    }

    if (
      typeof customerName !== "string" ||
      customerName.trim().length < 2 ||
      customerName.trim().length > 100
    ) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    if (
      typeof phone !== "string" ||
      !/^[+0-9()\-\s]{7,20}$/.test(phone.trim())
    ) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    if (
      orderType === "delivery" &&
      (typeof deliveryAddress !== "string" ||
        deliveryAddress.trim().length < 5)
    ) {
      return NextResponse.json(
        { error: "Please enter your delivery address." },
        { status: 400 }
      );
    }

    const validPayments =
      orderType === "delivery"
        ? ["cash_on_delivery", "demo_card"]
        : ["cash_at_branch", "card_at_branch", "demo_card"];

    if (!validPayments.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Please select a valid payment method." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(requestedItems) ||
      requestedItems.length === 0 ||
      requestedItems.length > 30
    ) {
      return NextResponse.json(
        { error: "Your cart is empty or invalid." },
        { status: 400 }
      );
    }

    const orderItems: any[] = [];

    for (const requested of requestedItems) {
      const id = Number(requested.id);
      const quantity = Number(requested.quantity);

      if (
        !Number.isInteger(id) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 50
      ) {
        return NextResponse.json(
          { error: "Invalid product or quantity." },
          { status: 400 }
        );
      }

      const product = products.find((item) => item.id === id);

      if (!product) {
        return NextResponse.json(
          { error: "A product in your cart was not found." },
          { status: 400 }
        );
      }

      const details = getProductDetails(product);
      const requestedSizeId = requested.sizeId ?? null;

      let selectedSize = null;

      if (requestedSizeId !== null) {
        selectedSize = details.sizes.find(
          (size) => size.id === requestedSizeId
        );

        if (!selectedSize) {
          return NextResponse.json(
            { error: "Invalid product size." },
            { status: 400 }
          );
        }
      }

      if (details.sizes.length > 0 && !selectedSize) {
        return NextResponse.json(
          { error: "Please select a size for this drink." },
          { status: 400 }
        );
      }

      if (details.sizes.length === 0 && requestedSizeId !== null) {
        return NextResponse.json(
          { error: "This product does not have size options." },
          { status: 400 }
        );
      }

      const requestedAddOnIds = requested.addOnIds ?? [];

      if (
        !Array.isArray(requestedAddOnIds) ||
        requestedAddOnIds.length > details.addOns.length ||
        requestedAddOnIds.some(
          (id: unknown) => typeof id !== "string"
        )
      ) {
        return NextResponse.json(
          { error: "Invalid product add-ons." },
          { status: 400 }
        );
      }

      const uniqueAddOnIds = [...new Set(requestedAddOnIds)];

      if (uniqueAddOnIds.length !== requestedAddOnIds.length) {
        return NextResponse.json(
          { error: "Duplicate add-ons are not allowed." },
          { status: 400 }
        );
      }

      const selectedAddOns = details.addOns.filter((addon) =>
        uniqueAddOnIds.includes(addon.id)
      );

      if (selectedAddOns.length !== uniqueAddOnIds.length) {
        return NextResponse.json(
          { error: "One or more add-ons are not available." },
          { status: 400 }
        );
      }

      const basePrice = product.price;
      const sizePrice = selectedSize?.price ?? 0;

      const addOnPrice = selectedAddOns.reduce(
        (sum, addon) => sum + addon.price,
        0
      );

      const unitPrice = Number(
        (basePrice + sizePrice + addOnPrice).toFixed(2)
      );

      const lineTotal = Number(
        (unitPrice * quantity).toFixed(2)
      );

      orderItems.push({
        id: product.id,
        name_en: product.en,
        name_az: product.az,
        image: product.image,
        quantity,
        base_price: basePrice,
        size: selectedSize
          ? {
              id: selectedSize.id,
              name_en: selectedSize.en,
              name_az: selectedSize.az,
              price: selectedSize.price,
            }
          : null,
        add_ons: selectedAddOns.map((addon) => ({
          id: addon.id,
          name_en: addon.en,
          name_az: addon.az,
          price: addon.price,
        })),
        ingredients_en: details.ingredientsEn,
        ingredients_az: details.ingredientsAz,
        allergens_en: details.allergensEn,
        allergens_az: details.allergensAz,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    const subtotal = Number(
      orderItems
        .reduce((sum, item) => sum + item.line_total, 0)
        .toFixed(2)
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("birth_date, student_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Could not find your profile." },
        { status: 400 }
      );
    }

    const today = new Date();

    const birthDate = profile.birth_date
      ? String(profile.birth_date).slice(0, 10)
      : "";

    const birthdayMonth = birthDate
      ? Number(birthDate.split("-")[1])
      : 0;

    const birthdayDay = birthDate
      ? Number(birthDate.split("-")[2])
      : 0;

    const isBirthday =
      birthdayMonth === today.getMonth() + 1 &&
      birthdayDay === today.getDate();

    const isVerifiedStudent =
      profile.student_status === "verified";

    let discountRate = 0;
    let discountType = "none";

    if (isBirthday) {
      discountRate = 0.15;
      discountType = "birthday";
    } else if (isVerifiedStudent) {
      discountRate = 0.10;
      discountType = "student";
    }

    const discountAmount = Number(
      (subtotal * discountRate).toFixed(2)
    );

    const rewardDiscount = Number(
      (redeemPoints / 100).toFixed(2)
    );

    if (rewardDiscount > subtotal - discountAmount) {
      return NextResponse.json(
        { error: "Reward discount cannot exceed your order total." },
        { status: 400 }
      );
    }

    const finalTotal = Number(
      (subtotal - discountAmount - rewardDiscount).toFixed(2)
    );

    const { data: transactions, error: pointsError } = await supabase
      .from("loyalty_transactions")
      .select("points")
      .eq("user_id", user.id);

    if (pointsError) {
      return NextResponse.json(
        { error: "Could not verify your reward balance." },
        { status: 500 }
      );
    }

    const availablePoints = (transactions || []).reduce(
      (sum, transaction) => sum + Number(transaction.points),
      0
    );

    if (redeemPoints > availablePoints) {
      return NextResponse.json(
        { error: "You do not have enough reward points." },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabase.rpc(
      "create_order_with_rewards",
      {
        p_items: orderItems,
        p_subtotal: subtotal,
        p_discount_amount: discountAmount,
        p_total: finalTotal,
        p_discount_type: discountType,
        p_order_type: orderType,
        p_branch: branch,
        p_customer_name: customerName.trim(),
        p_phone: phone.trim(),
        p_delivery_address:
          orderType === "delivery"
            ? deliveryAddress.trim()
            : null,
        p_order_note:
          typeof orderNote === "string"
            ? orderNote.trim().slice(0, 500)
            : null,
        p_payment_method: paymentMethod,
        p_redeem_points: redeemPoints,
      }
    );

    if (orderError) {
      console.error("Order creation error:", orderError);

      return NextResponse.json(
        { error: orderError.message || "Could not place your order." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your order has been placed successfully!",
      paymentMode:
        paymentMethod === "demo_card" ? "DEMO" : "NORMAL",
      order,
      rewardPointsUsed: redeemPoints,
      rewardDiscount,
    });
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while placing your order." },
      { status: 500 }
    );
  }
}