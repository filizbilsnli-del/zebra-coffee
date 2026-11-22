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
    <main className="min-h-screen bg-[#F8F5F0] px-4 pb-28 pt-10 text-[#34231D]">
      <div className="mx-auto max-w-6xl">

        {/* PAGE INTRO */}
        <section className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#A78A72]">
            ZEBRA COFFEE
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#34231D] sm:text-5xl">
            {isAZ ? "Menyumuz" : "Our Menu"}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#78675B] sm:text-base">
            {isAZ
              ? "Sevdiyiniz qəhvə və şirniyyatları kəşf edin. Hər fincanda kiçik bir xoşbəxtlik."
              : "Discover your favorite coffee and desserts. A little happiness in every cup."}
          </p>

          <div className="mt-5 h-1 w-16 rounded-full bg-[#C89B6D]" />
        </section>

        {/* SEARCH */}
        <div className="mb-7 flex items-center gap-3 rounded-2xl border border-[#E8DED2] bg-white px-4 py-4 shadow-sm transition focus-within:border-[#A78A72] focus-within:ring-2 focus-within:ring-[#C89B6D]/20">
          <Search size={21} className="shrink-0 text-[#A78A72]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAZ ? "Məhsul axtar..." : "Search products..."}
            className="w-full bg-transparent text-sm text-[#34231D] outline-none placeholder:text-[#A99A8D]"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="cursor-pointer rounded-full p-1 text-[#8E7461] transition hover:bg-[#F0E6DA]"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* CATEGORIES */}
        <section className="mb-9">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#78675B]">
              {isAZ ? "Kateqoriyalar" : "Categories"}
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`cursor-pointer whitespace-nowrap rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeCategory === category
                    ? "border-[#553B2C] bg-[#553B2C] text-white shadow-md"
                    : "border-[#E8DED2] bg-white text-[#654D3E] hover:border-[#A78A72] hover:bg-[#F0E6DA]"
                }`}
              >
                {isAZ ? categoryNames[category] || category : category}
              </button>
            ))}
          </div>
        </section>

        {/* PRODUCTS TITLE */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#34231D]">
            {isAZ ? "Məhsullar" : "Products"}
          </h2>

          <span className="rounded-full bg-[#F0E6DA] px-3 py-1.5 text-xs font-semibold text-[#78675B]">
            {filteredProducts.length} {isAZ ? "məhsul" : "products"}
          </span>
        </div>

        {/* PRODUCT LIST */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-[#E8DED2] bg-white px-6 py-14 text-center shadow-sm">
            <Coffee className="mx-auto mb-4 text-[#A78A72]" size={42} />

            <p className="font-bold text-[#34231D]">
              {isAZ ? "Məhsul tapılmadı" : "No products found"}
            </p>

            <p className="mt-2 text-sm text-[#78675B]">
              {isAZ
                ? "Axtarış sözünü və ya kateqoriyanı dəyişin."
                : "Try changing your search or category."}
            </p>

            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="mt-5 cursor-pointer rounded-full bg-[#553B2C] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#80563D]"
            >
              {isAZ ? "Bütün məhsullar" : "View all products"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-[#E8DED2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden bg-[#F0E6DA]">
  <button
    type="button"
    onClick={() => openProduct(product)}
    className="h-full w-full cursor-pointer"
    aria-label={isAZ ? `${product.az} seç` : `Select ${product.en}`}
  >
    <img
      src={product.image}
      alt={isAZ ? product.az : product.en}
      className="h-full w-full cursor-pointer object-cover transition-transform duration-500 hover:scale-105"
    />
  </button>

  <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-[#80624D] shadow-md">
    {product.price.toFixed(2)} ₼
  </div>
</div>
                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-[#34231D]">
                    {isAZ ? product.az : product.en}
                  </h3>

                  <p className="mb-5 mt-2 min-h-10 text-sm leading-5 text-[#78675B]">
                    {isAZ ? product.descAz : product.descEn}
                  </p>

                  <button
                    onClick={() => openProduct(product)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#553B2C] py-3.5 font-bold text-white transition-all duration-200 hover:bg-[#80563D] active:scale-[0.98]"
                  >
                    <Plus size={19} />
                    {isAZ ? "Seçim et" : "Customize"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT CUSTOMIZATION MODAL */}
      {selectedProduct && details && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211710]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[#E8DED2] bg-[#FFFDF9] p-5 shadow-2xl sm:rounded-3xl sm:p-7">

            {/* MODAL HEADER */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78A72]">
                  ZEBRA COFFEE
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-[#34231D]">
                  {isAZ ? selectedProduct.az : selectedProduct.en}
                </h2>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="cursor-pointer rounded-full bg-[#F0E6DA] p-2.5 text-[#553B2C] transition hover:bg-[#E8DED2]"
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <img
              src={selectedProduct.image}
              alt={isAZ ? selectedProduct.az : selectedProduct.en}
              className="mb-5 h-48 w-full rounded-2xl object-cover"
            />

            {/* BASE PRICE */}
            <div className="mb-5 rounded-2xl border border-[#E8DED2] bg-[#F8F5F0] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#78675B]">
                  {isAZ ? "Əsas qiymət" : "Base price"}
                </span>

                <span className="font-extrabold text-[#553B2C]">
                  {selectedProduct.price.toFixed(2)} ₼
                </span>
              </div>
            </div>

            {/* SIZES */}
            {details.sizes.length > 0 && (
              <section className="mb-6">
                <h3 className="mb-3 font-extrabold text-[#34231D]">
                  {isAZ ? "Ölçü seçin" : "Choose size"}
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {details.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                        selectedSize === size.id
                          ? "border-[#553B2C] bg-[#553B2C] text-white shadow-md"
                          : "border-[#E8DED2] bg-white text-[#654D3E] hover:border-[#A78A72] hover:bg-[#F8F5F0]"
                      }`}
                    >
                      <span className="block text-sm font-bold">
                        {isAZ
                          ? size.az.split(" · ")[0]
                          : size.en.split(" · ")[0]}
                      </span>

                      <span className="mt-1 block text-xs opacity-80">
                        {size.id === "small"
                          ? "250 ml"
                          : size.id === "medium"
                            ? "350 ml"
                            : "450 ml"}
                      </span>

                      <span className="mt-1 block text-xs font-semibold">
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

            {/* ADD-ONS */}
            {details.addOns.length > 0 && (
              <section className="mb-6">
                <h3 className="mb-3 font-extrabold text-[#34231D]">
                  {isAZ ? "Əlavələr" : "Add-ons"}
                </h3>

                <div className="space-y-2">
                  {details.addOns.map((addon: ProductOption) => {
                    const checked = selectedAddOns.includes(addon.id);

                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-all ${
                          checked
                            ? "border-[#A78A72] bg-[#F0E6DA]"
                            : "border-[#E8DED2] bg-white hover:bg-[#F8F5F0]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              checked
                                ? "border-[#553B2C] bg-[#553B2C] text-white"
                                : "border-[#CDBBAA] bg-white"
                            }`}
                          >
                            {checked && <Check size={13} />}
                          </span>

                          <span className="text-sm font-medium text-[#553B2C]">
                            {isAZ ? addon.az : addon.en}
                          </span>
                        </span>

                        <span className="text-sm font-bold text-[#98704D]">
                          +{addon.price.toFixed(2)} ₼
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* INGREDIENTS AND ALLERGENS */}
            <section className="mb-6 rounded-2xl border border-[#E8DED2] bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 font-extrabold text-[#34231D]">
                <Info size={18} className="text-[#A78A72]" />
                {isAZ ? "Məhsulun tərkibi" : "Ingredients"}
              </h3>

              <p className="text-sm leading-6 text-[#78675B]">
                {(isAZ
                  ? details.ingredientsAz
                  : details.ingredientsEn
                ).join(", ")}
              </p>

              <div className="my-4 border-t border-[#E8DED2]" />

              <h3 className="mb-2 font-extrabold text-[#34231D]">
                {isAZ ? "Allergen məlumatı" : "Allergen information"}
              </h3>

              {details.allergensEn.length > 0 ? (
                <p className="text-sm leading-6 text-[#9A6348]">
                  {(isAZ
                    ? details.allergensAz
                    : details.allergensEn
                  ).join(", ")}
                </p>
              ) : (
                <p className="text-sm text-[#78675B]">
                  {isAZ
                    ? "İlkin resept məlumatında əsas allergen qeyd edilməyib."
                    : "No major allergens are listed in the preliminary recipe information."}
                </p>
              )}

              <p className="mt-3 text-xs leading-5 text-[#9A8170]">
                {isAZ
                  ? "Qeyd: Tərkib və allergen məlumatları ilkin məlumatlardır. Resept və istehsalçı məlumatları ilə təsdiqlənməlidir. Çarpaz təmas ehtimalı mövcuddur."
                  : "Note: Ingredient and allergen information is preliminary and must be verified against recipes and supplier information. Cross-contact may occur."}
              </p>
            </section>

            {/* TOTAL AND ADD TO CART */}
            <div className="sticky bottom-0 border-t border-[#E8DED2] bg-[#FFFDF9] pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold text-[#34231D]">
                  {isAZ ? "Yekun qiymət" : "Total price"}
                </span>

                <span className="text-2xl font-extrabold text-[#80563D]">
                  {totalPrice.toFixed(2)} ₼
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#553B2C] py-4 font-extrabold text-white transition-all hover:bg-[#80563D] active:scale-[0.98]"
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