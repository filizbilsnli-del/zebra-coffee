"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck, FileText, CheckCircle, XCircle, RefreshCw,
  LogOut, Loader2, ExternalLink, ShoppingBag, Clock,
  MapPin, Phone, Package,
} from "lucide-react";

type Verification = {
  id: number;
  user_id: string;
  file_path: string;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  full_name: string;
  birth_date: string | null;
  document_url: string | null;
};

type AddOn = {
  id?: number;
  price?: number;
  name?: string;
  name_en?: string;
  name_az?: string;
};

type OrderItem = {
  name?: string;
  name_en?: string;
  name_az?: string;
  quantity?: number;
  size?: string | {
    name?: string;
    name_en?: string;
    name_az?: string;
  } | null;
  size_name?: string;
  size_name_en?: string;
  size_name_az?: string;
  add_ons?: AddOn[];
  line_total?: number;
  unit_price?: number;
};type Order = {
  id: number;
  user_id: string | null;
  customer_name: string | null;
  phone: string | null;
  items: OrderItem[] | null;
  subtotal: number;
  discount_amount: number;
  total: number;
  discount_type: string | null;
  status: string;
  created_at: string;
  order_type: string | null;
  branch: string | null;
  delivery_address: string | null;
  order_note: string | null;
  payment_method: string | null;
};

const orderStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];

export default function AdminPage() {
  const { isAZ } = useLanguage();

  const [items, setItems] = useState<Verification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);
  const [orderProcessing, setOrderProcessing] = useState<number | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const t = {
    title: isAZ ? "Admin paneli" : "Admin Panel",
    subtitle: isAZ ? "Tələbə müraciətlərini və sifarişləri idarə et" : "Manage student applications and orders",
    loading: isAZ ? "Yüklənir..." : "Loading...",
    noApplications: isAZ ? "Hələ tələbə müraciəti yoxdur." : "There are no student applications yet.",
    birth: isAZ ? "Doğum tarixi" : "Birth date",
    date: isAZ ? "Tarix" : "Date",
    document: isAZ ? "Sənədə bax" : "View document",
    approve: isAZ ? "Təsdiqlə" : "Approve",
    reject: isAZ ? "Rədd et" : "Reject",
    pending: isAZ ? "Gözləyir" : "Pending",
    verified: isAZ ? "Təsdiqlənib" : "Verified",
    rejected: isAZ ? "Rədd edilib" : "Rejected",
    unauthorized: isAZ ? "Bu səhifəyə giriş icazən yoxdur." : "You are not authorized to access this page.",
    error: isAZ ? "Xəta baş verdi." : "An error occurred.",
    success: isAZ ? "Status uğurla yeniləndi." : "Status updated successfully.",
    refresh: isAZ ? "Yenilə" : "Refresh",
    logout: isAZ ? "Çıxış" : "Log out",
    applications: isAZ ? "Tələbə müraciətləri" : "Student applications",
    orders: isAZ ? "Sifarişlərin idarə edilməsi" : "Order management",
    noOrders: isAZ ? "Hələ sifariş yoxdur." : "There are no orders yet.",
    customer: isAZ ? "Müştəri" : "Customer",
    phone: isAZ ? "Telefon" : "Phone",
    branch: isAZ ? "Filial" : "Branch",
    orderType: isAZ ? "Sifariş növü" : "Order type",
    delivery: isAZ ? "Çatdırılma" : "Delivery",
    pickup: isAZ ? "Gəlib götürmə" : "Pickup",
    address: isAZ ? "Ünvan" : "Address",
    payment: isAZ ? "Ödəniş" : "Payment",
    products: isAZ ? "Məhsullar" : "Products",
    subtotal: isAZ ? "Ara cəm" : "Subtotal",
    discount: isAZ ? "Endirim" : "Discount",
    total: isAZ ? "Yekun məbləğ" : "Total",
    note: isAZ ? "Qeyd" : "Note",
    updateStatus: isAZ ? "Statusu dəyiş" : "Update status",
    preparing: isAZ ? "Hazırlanır" : "Preparing",
    ready: isAZ ? "Hazırdır" : "Ready",
    completed: isAZ ? "Tamamlandı" : "Completed",
    cancelled: isAZ ? "Ləğv edildi" : "Cancelled",
    size: isAZ ? "Ölçü" : "Size",
    addons: isAZ ? "Əlavələr" : "Add-ons",
    unknown: isAZ ? "Naməlum" : "Unknown",
  };

  function getOrderStatusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: t.pending,
      preparing: t.preparing,
      ready: t.ready,
      completed: t.completed,
      cancelled: t.cancelled,
    };
    return labels[status] || status;
  }

  async function loadApplications() {
    setLoading(true);
    setMessage("");

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    if (session.user.app_metadata?.role !== "admin") {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setAuthorized(true);

    const [verificationResult, ordersResponse] = await Promise.all([
      supabase
        .from("student_verifications")
        .select("id, user_id, file_path, status, created_at")
        .order("created_at", { ascending: false }),
      fetch("/api/admin-orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }),
    ]);

    const { data: verifications, error } = verificationResult;

    if (error) {
      setMessage(error.message);
      setItems([]);
    } else if (!verifications || verifications.length === 0) {
      setItems([]);
    } else {
      const userIds = [...new Set(verifications.map((v) => v.user_id))];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, birth_date")
        .in("id", userIds);

      if (profileError) {
        setMessage(profileError.message);
      } else {
        const result: Verification[] = await Promise.all(
          verifications.map(async (verification) => {
            const profile = profiles?.find((p) => p.id === verification.user_id);
            const { data: signedData } = await supabase.storage
              .from("student-documents")
              .createSignedUrl(verification.file_path, 3600);

            return {
              ...verification,
              full_name: profile?.full_name || "Unknown student",
              birth_date: profile?.birth_date || null,
              document_url: signedData?.signedUrl || null,
            };
          })
        );
        setItems(result);
      }
    }

    try {
      const result = await ordersResponse.json();
      if (!ordersResponse.ok) {
        setMessage(result.error || t.error);
        setOrders([]);
      } else {
        setOrders(result.orders || []);
      }
    } catch {
      setMessage(t.error);
      setOrders([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, []);

       async function updateStatus(item: Verification, newStatus: "verified" | "rejected") {
    const confirmed = window.confirm(
      newStatus === "verified"
        ? (isAZ ? "Bu tələbəni təsdiqləmək istəyirsən?" : "Do you want to approve this student?")
        : (isAZ ? "Bu müraciəti rədd etmək istəyirsən?" : "Do you want to reject this application?")
    );

    if (!confirmed) return;

    setProcessing(item.id);
    setMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setMessage(t.error);
        return;
      }

      const response = await fetch("/api/admin-student-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          verificationId: item.id,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || t.error);
        return;
      }

      setMessage(t.success);
      await loadApplications();
    } catch {
      setMessage(t.error);
    } finally {
      setProcessing(null);
    }
  }
  async function updateOrderStatus(order: Order, newStatus: string) {
    const confirmed = window.confirm(
      isAZ
        ? `#${order.id} nömrəli sifarişin statusunu "${getOrderStatusLabel(newStatus)}" etmək istəyirsən?`
        : `Change order #${order.id} status to "${getOrderStatusLabel(newStatus)}"?`
    );

    if (!confirmed) return;

    setOrderProcessing(order.id);
    setMessage("");

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setMessage(t.error);
      setOrderProcessing(null);
      return;
    }

    try {
      const response = await fetch("/api/admin-orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || t.error);
      } else {
        setMessage(t.success);
        await loadApplications();
      }
    } catch {
      setMessage(t.error);
    }

    setOrderProcessing(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function statusLabel(status: string) {
    if (status === "verified") return t.verified;
    if (status === "rejected") return t.rejected;
    return t.pending;
  }

  function money(value: number | null | undefined) {
    return `${Number(value || 0).toFixed(2)} AZN`;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef]">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3">{t.loading}</span>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8f5ef] p-6 text-center">
        <ShieldCheck size={48} className="mb-4 text-red-700" />
        <h1 className="mb-3 text-2xl font-bold">{t.unauthorized}</h1>
        <a href="/login" className="rounded-xl bg-black px-6 py-3 text-white">
          {isAZ ? "Giriş səhifəsi" : "Login page"}
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-8 text-[#30251f]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#8b5e3c]">
              <ShieldCheck size={25} />
              <span className="font-semibold">ZEBRA COFFEE</span>
            </div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-1 text-gray-600">{t.subtitle}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={loadApplications} className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3">
              <RefreshCw size={17} /> {t.refresh}
            </button>
            <button onClick={logout} className="flex items-center gap-2 rounded-xl bg-[#30251f] px-4 py-3 text-white">
              <LogOut size={17} /> {t.logout}
            </button>
          </div>
        </header>

        {message && (
          <div className="mb-5 rounded-xl bg-white p-4 text-sm shadow-sm">
            {message}
          </div>
        )}

        {/* ORDERS */}
        <section className="mb-10">
          <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-[#8b5e3c]" size={25} />
              <h2 className="text-xl font-bold">{t.orders}</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {isAZ ? "Ümumi sifariş sayı:" : "Total orders:"} {orders.length}
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
              {t.noOrders}
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-[#eadfd2] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold">
                        {isAZ ? "Sifariş" : "Order"} #{order.id}
                      </h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={15} />
                        {new Date(order.created_at).toLocaleString(isAZ ? "az-AZ" : "en-US")}
                      </p>
                    </div>

                    <span className={`rounded-full px-3 py-2 text-sm font-semibold ${
                      order.status === "completed" ? "bg-green-100 text-green-800"
                      : order.status === "cancelled" ? "bg-red-100 text-red-800"
                      : order.status === "ready" ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-xl bg-[#faf7f2] p-4 sm:grid-cols-2">
                    <p className="flex items-center gap-2 text-sm">
                      <Package size={17} />
                      <strong>{t.customer}:</strong> {order.customer_name || t.unknown}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Phone size={17} />
                      <strong>{t.phone}:</strong> {order.phone || "—"}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <MapPin size={17} />
                      <strong>{t.branch}:</strong> {order.branch || "—"}
                    </p>
                    <p className="text-sm">
                      <strong>{t.orderType}:</strong>{" "}
                      {order.order_type === "delivery" ? t.delivery : t.pickup}
                    </p>
                    {order.delivery_address && (
                      <p className="text-sm sm:col-span-2">
                        <strong>{t.address}:</strong> {order.delivery_address}
                      </p>
                    )}
                    <p className="text-sm">
                      <strong>{t.payment}:</strong> {order.payment_method || "—"}
                    </p>
                  </div>

                  <div className="mt-5">
                    <h4 className="mb-3 font-bold">{t.products}</h4>
                    <div className="space-y-3">
                      {(order.items || []).map((product, index) => {
                        const productName = isAZ
                          ? product.name_az || product.name || product.name_en || t.unknown
                          : product.name_en || product.name || product.name_az || t.unknown;

                        const sizeName = typeof product.size === "object" && product.size !== null
  ? isAZ
    ? product.size.name_az || product.size.name_en || product.size.name || ""
    : product.size.name_en || product.size.name_az || product.size.name || ""
  : product.size_name_az || product.size_name_en || product.size_name || product.size || "";

                        const addOns = (product.add_ons || [])
                          .map((addon) =>
                            isAZ
                              ? addon.name_az || addon.name_en || addon.name || "Əlavə"
                              : addon.name_en || addon.name_az || addon.name || "Add-on"
                          )
                          .join(", ");

                        return (
                          <div key={`${order.id}-${index}`} className="rounded-xl border border-[#eee4da] p-3">
                            <div className="flex flex-wrap justify-between gap-2">
                              <span className="font-semibold">
                                {productName} × {product.quantity || 1}
                              </span>
                              <span className="font-semibold">
                                {money(product.line_total)}
                              </span>
                            </div>

                            {sizeName && (
                              <p className="mt-1 text-sm text-gray-500">
                                {t.size}: {sizeName}
                              </p>
                            )}

                            {addOns && (
                              <p className="mt-1 text-sm text-gray-500">
                                {t.addons}: {addOns}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-[#eee4da] pt-4 text-sm">
                    <div className="flex justify-between">
                      <span>{t.subtotal}</span>
                      <span>{money(order.subtotal)}</span>
                    </div>

                    {Number(order.discount_amount) > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>{t.discount}{order.discount_type ? ` (${order.discount_type})` : ""}</span>
                        <span>-{money(order.discount_amount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-bold">
                      <span>{t.total}</span>
                      <span>{money(order.total)}</span>
                    </div>
                  </div>

                  {order.order_note && (
                    <p className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm">
                      <strong>{t.note}:</strong> {order.order_note}
                    </p>
                  )}

                  {order.status !== "completed" && order.status !== "cancelled" && (
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#eee4da] pt-4">
                      <label htmlFor={`status-${order.id}`} className="text-sm font-semibold">
                        {t.updateStatus}:
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        disabled={orderProcessing === order.id}
                        onChange={(e) => updateOrderStatus(order, e.target.value)}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {getOrderStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                      {orderProcessing === order.id && (
                        <Loader2 size={20} className="animate-spin text-[#8b5e3c]" />
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* STUDENT APPLICATIONS */}
        <section>
          <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">{t.applications}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {isAZ ? "Ümumi müraciət sayı:" : "Total applications:"} {items.length}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
              {t.noApplications}
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#eadfd2] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{item.full_name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {t.birth}: {item.birth_date || "—"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t.date}: {new Date(item.created_at).toLocaleDateString(isAZ ? "az-AZ" : "en-US")}
                      </p>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      item.status === "verified" ? "bg-green-100 text-green-800"
                      : item.status === "rejected" ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {item.document_url ? (
                      <a href={item.document_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-[#d8c5b3] px-4 py-3 text-sm font-semibold">
                        <FileText size={18} />
                        {t.document}
                        <ExternalLink size={15} />
                      </a>
                    ) : (
                      <span className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                        {isAZ ? "Sənəd açıla bilmir" : "Document unavailable"}
                      </span>
                    )}

                    {item.status === "pending" && (
                      <>
                        <button
                          disabled={processing === item.id}
                          onClick={() => updateStatus(item, "verified")}
                          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {processing === item.id ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle size={17} />}
                          {t.approve}
                        </button>

                        <button
                          disabled={processing === item.id}
                          onClick={() => updateStatus(item, "rejected")}
                          className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <XCircle size={17} />
                          {t.reject}
                        </button>
                      </>
                    )}
                    {item.status === "verified" && (
                      <button
                        disabled={processing === item.id}
                        onClick={() => updateStatus(item, "verified")}
                        className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {processing === item.id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <RefreshCw size={17} />
                        )}
                        {isAZ ? "Endirimi sinxronlaşdır" : "Sync student discount"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}