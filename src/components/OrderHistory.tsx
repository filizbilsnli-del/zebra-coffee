"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Coffee,
} from "lucide-react";

type OrderItem = {
  id: number;
  name_en?: string;
  name_az?: string;
  quantity: number;
  base_price?: number;
  unit_price?: number;
  line_total?: number;
  size?: {
    id: string;
    name_en: string;
    name_az: string;
    price: number;
  } | null;
  add_ons?: {
    id: string;
    name_en: string;
    name_az: string;
    price: number;
  }[];
};

type Order = {
  id: number;
  total: number;
  status: string;
  created_at: string;
  order_type: string | null;
  branch: string | null;
  items: OrderItem[] | null;
};

export default function OrderHistory() {
  const { isAZ } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = (en: string, az: string) => (isAZ ? az : en);

  useEffect(() => {
    async function loadOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, total, status, created_at, order_type, branch, items"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(
          t(
            "Could not load orders.",
            "Sifarişləri yükləmək mümkün olmadı."
          )
        );
      } else {
        setOrders((data ?? []) as Order[]);
      }

      setLoading(false);
    }

    loadOrders();
  }, [isAZ]);

  function statusInfo(status: string) {
    const statuses: Record<string, { en: string; az: string }> = {
      pending: { en: "Pending", az: "Gözləyir" },
      preparing: { en: "Preparing", az: "Hazırlanır" },
      ready: { en: "Ready", az: "Hazırdır" },
      completed: { en: "Completed", az: "Tamamlanıb" },
      cancelled: { en: "Cancelled", az: "Ləğv edilib" },
    };

    return statuses[status] ?? { en: status, az: status };
  }

  function StatusIcon({ status }: { status: string }) {
    if (status === "completed" || status === "ready") {
      return <CheckCircle size={19} className="text-green-700" />;
    }

    if (status === "cancelled") {
      return <XCircle size={19} className="text-red-600" />;
    }

    return <Clock size={19} className="text-amber-700" />;
  }

  return (
    <section className="rounded-[2rem] border border-[#eadfd1] bg-white p-7 shadow-sm sm:p-9">
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBag size={25} className="text-[#987253]" />

        <h2 className="text-xl font-black">
          {t("My Orders", "Sifarişlərim")}
        </h2>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-[#987b65]">
          {t("Loading orders...", "Sifarişlər yüklənir...")}
        </p>
      ) : error ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : orders.length === 0 ? (
        <div className="py-8 text-center">
          <ShoppingBag
            size={35}
            className="mx-auto mb-3 text-[#c5ad98]"
          />

          <p className="font-bold">
            {t("No orders yet", "Hələ sifarişin yoxdur")}
          </p>

          <p className="mt-2 text-sm text-[#987b65]">
            {t(
              "Your orders will appear here.",
              "Sifarişlərin burada görünəcək."
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusInfo(order.status);

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[#eadfd1] bg-[#faf7f1] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-black">
                    {t("Order", "Sifariş")} #{order.id}
                  </p>

                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold">
                    <StatusIcon status={order.status} />
                    {isAZ ? status.az : status.en}
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#987b65]">
                  {new Date(order.created_at).toLocaleString(
                    isAZ ? "az-AZ" : "en-US"
                  )}
                </p>

                {/* Ordered products */}
                <div className="mt-4 space-y-3 border-t border-[#eadfd1] pt-4">
                  <p className="text-sm font-black">
                    {t("Products", "Məhsullar")}
                  </p>

                  {(order.items ?? []).map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="rounded-xl bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Coffee
                            size={17}
                            className="shrink-0 text-[#987253]"
                          />

                          <p className="text-sm font-bold">
                            {isAZ
                              ? item.name_az ?? item.name_en
                              : item.name_en ?? item.name_az}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-bold">
                          × {item.quantity}
                        </span>
                      </div>

                      {item.size && (
                        <p className="mt-2 text-xs text-[#806e62]">
                          {t("Size", "Ölçü")}:{" "}
                          {isAZ
                            ? item.size.name_az
                            : item.size.name_en}
                        </p>
                      )}

                      {item.add_ons && item.add_ons.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-[#806e62]">
                            {t("Add-ons", "Əlavələr")}:
                          </p>

                          {item.add_ons.map((addon) => (
                            <p
                              key={addon.id}
                              className="mt-1 text-xs text-[#806e62]"
                            >
                              +{" "}
                              {isAZ
                                ? addon.name_az
                                : addon.name_en}{" "}
                              · {Number(addon.price).toFixed(2)} AZN
                            </p>
                          ))}
                        </div>
                      )}

                      <p className="mt-2 text-sm font-black text-[#987253]">
                        {Number(
                          item.line_total ??
                            (item.unit_price ?? item.base_price ?? 0) *
                              item.quantity
                        ).toFixed(2)}{" "}
                        AZN
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-[#eadfd1] pt-4">
                  <div>
                    <p className="text-xs text-[#987b65]">
                      {t("Order type", "Sifariş növü")}
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {order.order_type === "delivery"
                        ? t("Delivery", "Çatdırılma")
                        : t("Pickup", "Filialdan götürmə")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#987b65]">
                      {t("Branch", "Filial")}
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {order.branch ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#987b65]">
                      {t("Total", "Ümumi məbləğ")}
                    </p>

                    <p className="mt-1 text-lg font-black">
                      {Number(order.total).toFixed(2)} AZN
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}