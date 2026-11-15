export type CartItem = {
  key: string;
  id: number;
  en: string;
  az: string;
  price: number;
  basePrice: number;
  image: string;
  quantity: number;
  sizeId: string | null;
  sizeEn: string | null;
  sizeAz: string | null;
  addOns: {
    id: string;
    en: string;
    az: string;
    price: number;
  }[];
};

const CART_KEY = "zebra-coffee-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

    return saved.map((item: Partial<CartItem>) => ({
      ...item,
      key: item.key || `legacy-${item.id}`,
      basePrice: item.basePrice ?? item.price ?? 0,
      sizeId: item.sizeId ?? null,
      sizeEn: item.sizeEn ?? null,
      sizeAz: item.sizeAz ?? null,
      addOns: item.addOns ?? [],
    }));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(
  product: Omit<CartItem, "quantity" | "key">
) {
  const cart = getCart();

  const key = [
    product.id,
    product.sizeId || "default",
    product.addOns.map((item) => item.id).sort().join(","),
  ].join("-");

  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...product,
      key,
      quantity: 1,
    });
  }

  saveCart(cart);
  return cart;
}