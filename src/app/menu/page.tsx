"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { addToCart } from "@/lib/cart";
import { products } from "@/data/products";
import { getProductDetails, ProductOption } from "@/data/product-options";
import {
  Search,
  ShoppingBag,
  Plus,
  Coffee,
  X,
  Check,
  Info,
} from "lucide-react";

export default function MenuPage() {
  const { language } = useLanguage();
  const isAZ = language === "AZ";

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<(typeof products)[number] | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    []
  );

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;

    const matchesSearch =
      product.en.toLowerCase().includes(search.toLowerCase()) ||
      product.az.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const details = selectedProduct
    ? getProductDetails(selectedProduct)
    : null;

  const currentSize = details?.sizes.find(
    (size) => size.id === selectedSize
  );

  const currentAddOns =
    details?.addOns.filter((addon) => selectedAddOns.includes(addon.id)) || [];

  const totalPrice = selectedProduct
    ? selectedProduct.price +
      (currentSize?.price || 0) +
      currentAddOns.reduce((sum, addon) => sum + addon.price, 0)
    : 0;

  function openProduct(product: (typeof products)[number]) {
    const productDetails = getProductDetails(product);

    setSelectedProduct(product);
    setSelectedSize(
      productDetails.sizes.length > 0 ? productDetails.sizes[0].id : ""
    );
    setSelectedAddOns([]);
  }

  function toggleAddOn(id: string) {
    setSelectedAddOns((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function handleAddToCart() {
    if (!selectedProduct || !details) return;

    const size = details.sizes.find((item) => item.id === selectedSize);

    addToCart({
      id: selectedProduct.id,
      en: selectedProduct.en,
      az: selectedProduct.az,
      price: totalPrice,
      basePrice: selectedProduct.price,
      image: selectedProduct.image,
      sizeId: size?.id || null,
      sizeEn: size?.en || null,
      sizeAz: size?.az || null,
      addOns: currentAddOns,
    });

    setSelectedProduct(null);
    setSelectedAddOns([]);

    alert(isAZ ? "Məhsul səbətə əlavə edildi!" : "Product added to cart!");
  }

  const categoryNames: Record<string, string> = {
    All: "Hamısı",
    "Hot Coffee": "İsti Qəhvələr",
    "Iced Coffee": "Soyuq Qəhvələr",
    "Matcha & Tea": "Matcha və Çay",
    Frappe: "Frappé",
    Chocolate: "Şokoladlı İçkilər",
    Refreshers: "Sərinləşdiricilər",
    Bakery: "Un məmulatları",
    Desserts: "Şirniyyatlar",
  };

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 pb-28 pt-8 text-[#30251f]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-[#98765b]">
              ZEBRA COFFEE
            </p>

            <h1 className="text-4xl font-bold">
              {isAZ ? "Menyumuz" : "Our Menu"}
            </h1>

            <p className="mt-2 text-sm text-[#806e62]">
              {isAZ
                ? "Sevdiyiniz dadları kəşf edin."
                : "Discover your favorite flavors."}
            </p>
          </div>
        </div>

        <div className="mb-7 flex items-center gap-3 rounded-2xl border border-[#eadfd3] bg-white px-4 py-3 shadow-sm">
          <Search size={20} className="text-[#98765b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAZ ? "Məhsul axtar..." : "Search products..."}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeCategory === category
                  ? "bg-[#4b3328] text-white"
                  : "border border-[#e7d9cb] bg-white text-[#654d3e] hover:bg-[#f0e7dc]"
              }`}
            >
              {isAZ ? categoryNames[category] || category : category}
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isAZ ? "Məhsullar" : "Products"}
          </h2>

          <span className="text-sm text-[#806e62]">
            {filteredProducts.length} {isAZ ? "məhsul" : "products"}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center">
            <Coffee className="mx-auto mb-3 text-[#98765b]" size={36} />
            <p className="font-semibold">
              {isAZ ? "Məhsul tapılmadı" : "No products found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-[#eee3d8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-52 overflow-hidden bg-[#eee6dc]">
                  <img
                    src={product.image}
                    alt={isAZ ? product.az : product.en}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold">
                      {isAZ ? product.az : product.en}
                    </h3>

                    <span className="whitespace-nowrap font-bold text-[#98704d]">
                      {product.price.toFixed(2)} ₼
                    </span>
                  </div>

                  <p className="mb-5 min-h-10 text-sm leading-5 text-[#806e62]">
                    {isAZ ? product.descAz : product.descEn}
                  </p>

                  <button
                    onClick={() => openProduct(product)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4b3328] py-3 font-semibold text-white transition hover:bg-[#674a3a]"
                  >
                    <Plus size={18} />
                    {isAZ ? "Seçim et" : "Customize"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && details && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-[#fffdf9] p-5 shadow-2xl sm:rounded-3xl sm:p-7">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#98765b]">
                  ZEBRA COFFEE
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {isAZ ? selectedProduct.az : selectedProduct.en}
                </h2>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-full bg-[#f0e7dc] p-2"
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.en}
              className="mb-5 h-44 w-full rounded-2xl object-cover"
            />

            <div className="mb-5 rounded-2xl bg-[#f8f2e9] p-4">
              <div className="flex justify-between">
                <span className="text-sm text-[#806e62]">
                  {isAZ ? "Əsas qiymət" : "Base price"}
                </span>
                <span className="font-bold">
                  {selectedProduct.price.toFixed(2)} ₼
                </span>
              </div>
            </div>

            {details.sizes.length > 0 && (
              <section className="mb-6">
                <h3 className="mb-3 font-bold">
                  {isAZ ? "Ölçü seçin" : "Choose size"}
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {details.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`rounded-xl border p-3 text-center text-sm transition ${
                        selectedSize === size.id
                          ? "border-[#4b3328] bg-[#4b3328] text-white"
                          : "border-[#e7d9cb] bg-white"
                      }`}
                    >
                      <span className="block font-semibold">
                        {isAZ
                          ? size.az.split(" · ")[0]
                          : size.en.split(" · ")[0]}
                      </span>
                      <span className="mt-1 block text-xs">
                        {size.id === "small"
                          ? "250 ml"
                          : size.id === "medium"
                            ? "350 ml"
                            : "450 ml"}
                      </span>
                      <span className="mt-1 block text-xs">
                        {size.price === 0
                          ? isAZ
                            ? "Daxildir"
                            : "Included"
                          : `+${size.price.toFixed(2)} ₼`}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {details.addOns.length > 0 && (
              <section className="mb-6">
                <h3 className="mb-3 font-bold">
                  {isAZ ? "Əlavələr" : "Add-ons"}
                </h3>

                <div className="space-y-2">
                  {details.addOns.map((addon: ProductOption) => {
                    const checked = selectedAddOns.includes(addon.id);

                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                          checked
                            ? "border-[#98765b] bg-[#f5ede3]"
                            : "border-[#eee3d8] bg-white"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              checked
                                ? "border-[#4b3328] bg-[#4b3328] text-white"
                                : "border-[#cdbbaa]"
                            }`}
                          >
                            {checked && <Check size={13} />}
                          </span>

                          <span className="text-sm font-medium">
                            {isAZ ? addon.az : addon.en}
                          </span>
                        </span>

                        <span className="text-sm font-bold text-[#98704d]">
                          +{addon.price.toFixed(2)} ₼
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mb-6 rounded-2xl border border-[#eee3d8] bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 font-bold">
                <Info size={18} className="text-[#98765b}" />
                {isAZ ? "Məhsulun tərkibi" : "Ingredients"}
              </h3>

              <p className="text-sm leading-6 text-[#806e62]">
                {(isAZ
                  ? details.ingredientsAz
                  : details.ingredientsEn
                ).join(", ")}
              </p>

              <div className="my-4 border-t border-[#eee3d8]" />

              <h3 className="mb-2 font-bold">
                {isAZ ? "Allergen məlumatı" : "Allergen information"}
              </h3>

              {details.allergensEn.length > 0 ? (
                <p className="text-sm leading-6 text-[#9a6348]">
                  {(isAZ
                    ? details.allergensAz
                    : details.allergensEn
                  ).join(", ")}
                </p>
              ) : (
                <p className="text-sm text-[#806e62]">
                  {isAZ
                    ? "İlkin resept məlumatında əsas allergen qeyd edilməyib."
                    : "No major allergens are listed in the preliminary recipe information."}
                </p>
              )}

              <p className="mt-3 text-xs leading-5 text-[#9a8170]">
                {isAZ
                  ? "Qeyd: Tərkib və allergen məlumatları ilkin məlumatlardır. Resept və istehsalçı məlumatları ilə təsdiqlənməlidir. Çarpaz təmas ehtimalı mövcuddur."
                  : "Note: Ingredient and allergen information is preliminary and must be verified against recipes and supplier information. Cross-contact may occur."}
              </p>
            </section>

            <div className="sticky bottom-0 border-t border-[#eee3d8] bg-[#fffdf9] pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold">
                  {isAZ ? "Yekun qiymət" : "Total price"}
                </span>
                <span className="text-2xl font-bold text-[#98704d]">
                  {totalPrice.toFixed(2)} ₼
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4b3328] py-4 font-bold text-white transition hover:bg-[#674a3a]"
              >
                <ShoppingBag size={19} />
                {isAZ ? "Səbətə əlavə et" : "Add to cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}