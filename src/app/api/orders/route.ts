import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { products } from "@/data/products";
import { getProductDetails } from "@/data/product-options";

type MonthlyRewardSelection = {
  rewardId: number;
  type:
    | "monthly_discount"
    | "free_addon"
    | "free_size_upgrade"
    | "free_drink";
  cartItemKey?: string;
  addOnId?: string;
  productId?: number;
};

const FREE_DRINK_NAMES = [
  "Espresso",
  "Americano",
  "Cappuccino",
  "Flat White",
  "Classic Latte",
  "Classic Iced Coffee",
  "Iced Americano",
  "Cold Brew",
];

const FREE_ADDON_IDS = [
  "extra-espresso",
  "vanilla-syrup",
  "caramel-syrup",
  "chocolate-syrup",
];

function getBakuMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baku",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}-01`;
}

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
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    const monthlyReward =
      body.monthlyReward as MonthlyRewardSelection | null;

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

    // --------------------------------------------------
    // PROFILE AND EXISTING DISCOUNTS
    // --------------------------------------------------

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

    const birthDate = profile.birth_date
      ? String(profile.birth_date).slice(0, 10)
      : "";

    const bakuDateParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Baku",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const todayMonth = Number(
      bakuDateParts.find((part) => part.type === "month")?.value
    );

    const todayDay = Number(
      bakuDateParts.find((part) => part.type === "day")?.value
    );

    const birthdayMonth = birthDate
      ? Number(birthDate.split("-")[1])
      : 0;

    const birthdayDay = birthDate
      ? Number(birthDate.split("-")[2])
      : 0;

    const isBirthday =
      birthdayMonth === todayMonth &&
      birthdayDay === todayDay;

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

    // --------------------------------------------------
    // MONTHLY REWARD VALIDATION
    // --------------------------------------------------

    let monthlyRewardId: number | null = null;
    let monthlyRewardDiscount = 0;

    if (monthlyReward !== null && monthlyReward !== undefined) {
      if (
        !Number.isInteger(monthlyReward.rewardId) ||
        monthlyReward.rewardId <= 0 ||
        ![
          "monthly_discount",
          "free_addon",
          "free_size_upgrade",
          "free_drink",
        ].includes(monthlyReward.type)
      ) {
        return NextResponse.json(
          { error: "Invalid monthly reward selection." },
          { status: 400 }
        );
      }

      // Refresh the user's current membership reward.
      const { error: syncError } = await supabase.rpc(
        "sync_monthly_member_reward"
      );

      if (syncError) {
        console.error("Monthly reward sync error:", syncError);

        return NextResponse.json(
          { error: "Could not verify your monthly reward." },
          { status: 500 }
        );
      }

      const { data: reward, error: rewardError } = await supabase
        .from("member_rewards")
        .select("id, reward_name, status, reward_month")
        .eq("id", monthlyReward.rewardId)
        .eq("user_id", user.id)
        .eq("reward_type", "monthly_level_reward")
        .eq("reward_month", getBakuMonth())
        .eq("status", "available")
        .maybeSingle();

      if (rewardError || !reward) {
        return NextResponse.json(
          {
            error:
              "This monthly reward is unavailable or has already been used.",
          },
          { status: 400 }
        );
      }

      const rewardName = reward.reward_name;

      const expectedTypes: Record<string, string> = {
        "5% monthly member discount": "monthly_discount",
        "One free espresso shot or syrup": "free_addon",
        "One free size upgrade": "free_size_upgrade",
        "One free standard drink": "free_drink",
      };

      if (expectedTypes[rewardName] !== monthlyReward.type) {
        return NextResponse.json(
          { error: "This reward does not match your membership level." },
          { status: 400 }
        );
      }

      if (
        monthlyReward.type === "monthly_discount" &&
        (isBirthday || isVerifiedStudent)
      ) {
        return NextResponse.json(
          {
            error:
              "The monthly 5% discount cannot be combined with birthday or student discounts.",
          },
          { status: 400 }
        );
      }

      monthlyRewardId = Number(reward.id);
    }

    // --------------------------------------------------
    // VALIDATE PRODUCTS AND BUILD ORDER ITEMS
    // --------------------------------------------------

    const orderItems: any[] = [];

    for (let index = 0; index < requestedItems.length; index++) {
      const requested = requestedItems[index];

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
          (addonId: unknown) => typeof addonId !== "string"
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

      const orderItem: any = {
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
      };

      // ------------------------------------------------
      // FREE ADD-ON REWARD
      // ------------------------------------------------

      if (
        monthlyReward?.type === "free_addon" &&
        requested.cartItemKey === monthlyReward.cartItemKey
      ) {
        if (
          !monthlyReward.addOnId ||
          !FREE_ADDON_IDS.includes(monthlyReward.addOnId)
        ) {
          return NextResponse.json(
            { error: "Please select a valid free add-on." },
            { status: 400 }
          );
        }

        if (
          product.category !== "Hot Coffee" &&
          product.category !== "Iced Coffee"
        ) {
          return NextResponse.json(
            {
              error:
                "The free espresso shot or syrup is available for hot and iced coffee.",
            },
            { status: 400 }
          );
        }

        const freeAddon = details.addOns.find(
          (addon) => addon.id === monthlyReward.addOnId
        );

        if (!freeAddon) {
          return NextResponse.json(
            { error: "This add-on is not available for this drink." },
            { status: 400 }
          );
        }

        if (
          orderItem.add_ons.some(
  (addon: { id: string }) => addon.id === freeAddon.id
)
        ) {
          return NextResponse.json(
            { error: "This add-on is already in your selection." },
            { status: 400 }
          );
        }

        orderItem.add_ons.push({
          id: freeAddon.id,
          name_en: freeAddon.en,
          name_az: freeAddon.az,
          price: 0,
          monthly_reward: true,
        });
      }

      // ------------------------------------------------
      // FREE SIZE UPGRADE REWARD
      // ------------------------------------------------

      if (
        monthlyReward?.type === "free_size_upgrade" &&
        requested.cartItemKey === monthlyReward.cartItemKey
      ) {
        if (!selectedSize || !["small", "medium"].includes(selectedSize.id)) {
          return NextResponse.json(
            {
              error:
                "A free size upgrade is available only for Small or Medium drinks.",
            },
            { status: 400 }
          );
        }

        const nextSizeId =
          selectedSize.id === "small" ? "medium" : "large";

        const upgradedSize = details.sizes.find(
          (size) => size.id === nextSizeId
        );

        if (!upgradedSize) {
          return NextResponse.json(
            { error: "This drink cannot be upgraded." },
            { status: 400 }
          );
        }

        const originalUnitPrice = unitPrice;

        const upgradedItem = {
          ...orderItem,
          quantity: 1,
          size: {
            id: upgradedSize.id,
            name_en: upgradedSize.en,
            name_az: upgradedSize.az,
            price: upgradedSize.price,
          },
          unit_price: originalUnitPrice,
          line_total: originalUnitPrice,
          monthly_reward: "free_size_upgrade",
          original_size: {
            id: selectedSize.id,
            name_en: selectedSize.en,
            name_az: selectedSize.az,
          },
        };

        orderItems.push(upgradedItem);

        if (quantity > 1) {
          orderItems.push({
            ...orderItem,
            quantity: quantity - 1,
            line_total: Number(
              (originalUnitPrice * (quantity - 1)).toFixed(2)
            ),
          });
        }

        continue;
      }

      orderItems.push(orderItem);
    }

    // --------------------------------------------------
    // FREE DRINK REWARD
    // --------------------------------------------------

    if (monthlyReward?.type === "free_drink") {
      const freeProduct = products.find(
        (product) =>
          product.id === Number(monthlyReward.productId) &&
          FREE_DRINK_NAMES.includes(product.en)
      );

      if (!freeProduct) {
        return NextResponse.json(
          { error: "Please select a valid free standard drink." },
          { status: 400 }
        );
      }

      const freeDetails = getProductDetails(freeProduct);
      const freeSize = freeDetails.sizes.find(
        (size) => size.id === "small"
      );

      orderItems.push({
        id: freeProduct.id,
        name_en: freeProduct.en,
        name_az: freeProduct.az,
        image: freeProduct.image,
        quantity: 1,
        base_price: freeProduct.price,
        size: freeSize
          ? {
              id: freeSize.id,
              name_en: freeSize.en,
              name_az: freeSize.az,
              price: freeSize.price,
            }
          : null,
        add_ons: [],
        ingredients_en: freeDetails.ingredientsEn,
        ingredients_az: freeDetails.ingredientsAz,
        allergens_en: freeDetails.allergensEn,
        allergens_az: freeDetails.allergensAz,
        unit_price: 0,
        line_total: 0,
        monthly_reward: "free_standard_drink",
      });
    }

    // --------------------------------------------------
    // CHECK THAT THE SELECTED REWARD WAS USED
    // --------------------------------------------------

    if (
      monthlyReward?.type === "free_addon" ||
      monthlyReward?.type === "free_size_upgrade"
    ) {
      const matchingItem = requestedItems.some(
        (item: any) =>
          item.cartItemKey === monthlyReward.cartItemKey
      );

      if (!monthlyReward.cartItemKey || !matchingItem) {
        return NextResponse.json(
          { error: "Please select a drink for your monthly reward." },
          { status: 400 }
        );
      }
    }

    // --------------------------------------------------
    // CALCULATE TOTALS
    // --------------------------------------------------

    const subtotal = Number(
      orderItems
        .reduce((sum, item) => sum + item.line_total, 0)
        .toFixed(2)
    );

    if (monthlyReward?.type === "monthly_discount") {
      monthlyRewardDiscount = Number(
        (subtotal * 0.05).toFixed(2)
      );

      discountRate = 0.05;
      discountType = "monthly_member";
    }

    const regularDiscountAmount = Number(
      (subtotal * discountRate).toFixed(2)
    );

    const discountAmount = regularDiscountAmount;

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

    // --------------------------------------------------
    // VERIFY POINT BALANCE
    // --------------------------------------------------

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

    // --------------------------------------------------
    // CREATE ORDER AND CONSUME MONTHLY REWARD
    // --------------------------------------------------

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
        p_monthly_reward_id: monthlyRewardId,
      }
    );

    if (orderError) {
      console.error("Order creation error:", orderError);

      return NextResponse.json(
        {
          error:
            orderError.message || "Could not place your order.",
        },
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
      monthlyRewardDiscount,
    });
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while placing your order.",
      },
      { status: 500 }
    );
  }
}