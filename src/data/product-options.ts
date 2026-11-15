import type { Product } from "./products";

export type ProductOption = {
  id: string;
  en: string;
  az: string;
  price: number;
};

export type ProductDetails = {
  ingredientsEn: string[];
  ingredientsAz: string[];
  allergensEn: string[];
  allergensAz: string[];
  sizes: ProductOption[];
  addOns: ProductOption[];
};

const sizes: ProductOption[] = [
  { id: "small", en: "Small · 250 ml", az: "Kiçik · 250 ml", price: 0 },
  { id: "medium", en: "Medium · 350 ml", az: "Orta · 350 ml", price: 1 },
  { id: "large", en: "Large · 450 ml", az: "Böyük · 450 ml", price: 2 },
];

const coffeeAddOns: ProductOption[] = [
  { id: "extra-espresso", en: "Extra espresso shot", az: "Əlavə espresso", price: 1.5 },
  { id: "vanilla-syrup", en: "Vanilla syrup", az: "Vanil siropu", price: 0.7 },
  { id: "caramel-syrup", en: "Caramel syrup", az: "Karamel siropu", price: 0.7 },
  { id: "chocolate-syrup", en: "Chocolate syrup", az: "Şokolad siropu", price: 0.7 },
  { id: "oat-milk", en: "Oat milk", az: "Yulaf südü", price: 1 },
  { id: "almond-milk", en: "Almond milk", az: "Badam südü", price: 1 },
  { id: "extra-cream", en: "Extra cream", az: "Əlavə qaymaq", price: 0.8 },
];

const matchaAddOns: ProductOption[] = [
  { id: "extra-matcha", en: "Extra matcha", az: "Əlavə matcha", price: 1.5 },
  { id: "vanilla-syrup", en: "Vanilla syrup", az: "Vanil siropu", price: 0.7 },
  { id: "strawberry-syrup", en: "Strawberry syrup", az: "Çiyələk siropu", price: 0.7 },
  { id: "oat-milk", en: "Oat milk", az: "Yulaf südü", price: 1 },
  { id: "almond-milk", en: "Almond milk", az: "Badam südü", price: 1 },
];

const frappeAddOns: ProductOption[] = [
  { id: "extra-espresso", en: "Extra espresso shot", az: "Əlavə espresso", price: 1.5 },
  { id: "chocolate-syrup", en: "Chocolate syrup", az: "Şokolad siropu", price: 0.7 },
  { id: "caramel-syrup", en: "Caramel syrup", az: "Karamel siropu", price: 0.7 },
  { id: "extra-cream", en: "Extra whipped cream", az: "Əlavə qaymaq", price: 0.8 },
  { id: "oat-milk", en: "Oat milk", az: "Yulaf südü", price: 1 },
];

const chocolateAddOns: ProductOption[] = [
  { id: "marshmallows", en: "Marshmallows", az: "Marşmellou", price: 0.8 },
  { id: "chocolate-syrup", en: "Extra chocolate syrup", az: "Əlavə şokolad siropu", price: 0.7 },
  { id: "extra-cream", en: "Whipped cream", az: "Qaymaq", price: 0.8 },
  { id: "oat-milk", en: "Oat milk", az: "Yulaf südü", price: 1 },
];

const refresherAddOns: ProductOption[] = [
  { id: "extra-fruit", en: "Extra fruit", az: "Əlavə meyvə", price: 1 },
  { id: "fruit-syrup", en: "Extra fruit syrup", az: "Əlavə meyvə siropu", price: 0.7 },
  { id: "sparkling-water", en: "Sparkling water", az: "Qazlı su", price: 0.5 },
];

const dessertAddOns: ProductOption[] = [
  { id: "ice-cream", en: "Vanilla ice cream", az: "Vanilli dondurma", price: 2.5 },
  { id: "chocolate-sauce", en: "Chocolate sauce", az: "Şokolad sousu", price: 0.8 },
];

const ingredientTemplates: Record<
  string,
  { en: string[]; az: string[]; allergensEn: string[]; allergensAz: string[] }
> = {
  "Hot Coffee": {
    en: ["Coffee beans", "Water"],
    az: ["Qəhvə dənələri", "Su"],
    allergensEn: [],
    allergensAz: [],
  },
  "Iced Coffee": {
    en: ["Coffee", "Water", "Ice"],
    az: ["Qəhvə", "Su", "Buz"],
    allergensEn: [],
    allergensAz: [],
  },
  "Matcha & Tea": {
    en: ["Tea or matcha powder", "Water"],
    az: ["Çay və ya matcha tozu", "Su"],
    allergensEn: [],
    allergensAz: [],
  },
  Frappe: {
    en: ["Blended coffee or flavour base", "Ice"],
    az: ["Qarışdırılmış qəhvə və ya dad qarışığı", "Buz"],
    allergensEn: ["May contain milk"],
    allergensAz: ["Süd ehtiva edə bilər"],
  },
  Chocolate: {
    en: ["Chocolate or cocoa", "Milk or water"],
    az: ["Şokolad və ya kakao", "Süd və ya su"],
    allergensEn: ["May contain milk", "Some recipes may contain soy"],
    allergensAz: ["Süd ehtiva edə bilər", "Bəzi reseptlərdə soya ola bilər"],
  },
  Refreshers: {
    en: ["Fruit or fruit flavour base", "Water", "Ice"],
    az: ["Meyvə və ya meyvə dadlı qarışıq", "Su", "Buz"],
    allergensEn: [],
    allergensAz: [],
  },
  Bakery: {
    en: ["Wheat flour", "Butter", "Sugar", "Eggs or milk depending on recipe"],
    az: ["Buğda unu", "Kərə yağı", "Şəkər", "Reseptdən asılı olaraq yumurta və ya süd"],
    allergensEn: ["Wheat (gluten)", "May contain milk and eggs"],
    allergensAz: ["Buğda (qlüten)", "Süd və yumurta ehtiva edə bilər"],
  },
  Desserts: {
    en: ["Sugar", "Flour or other dessert base", "Ingredients vary by recipe"],
    az: ["Şəkər", "Un və ya digər desert əsaslı qarışıq", "Tərkib reseptə görə dəyişir"],
    allergensEn: ["May contain milk, eggs, wheat (gluten) or nuts"],
    allergensAz: ["Süd, yumurta, buğda (qlüten) və ya çərəzlər ehtiva edə bilər"],
  },
};

function getIngredients(product: Product) {
  const details = ingredientTemplates[product.category];

  const ingredientsEn = [...details.en];
  const ingredientsAz = [...details.az];
  const allergensEn = [...details.allergensEn];
  const allergensAz = [...details.allergensAz];

  const name = product.en.toLowerCase();

  if (name.includes("milk") || name.includes("latte") ||
      name.includes("cappuccino") || name.includes("flat white") ||
      name.includes("cortado") || name.includes("mocha") ||
      name.includes("macchiato") || name.includes("frappe") ||
      name.includes("shake")) {
    if (!ingredientsEn.includes("Milk")) ingredientsEn.push("Milk");
    if (!ingredientsAz.includes("Süd")) ingredientsAz.push("Süd");
    if (!allergensEn.includes("Milk")) allergensEn.push("Milk");
    if (!allergensAz.includes("Süd")) allergensAz.push("Süd");
  }

  if (name.includes("chocolate") || name.includes("mocha") ||
      name.includes("oreo") || name.includes("nutella")) {
    ingredientsEn.push("Chocolate or cocoa");
    ingredientsAz.push("Şokolad və ya kakao");
  }

  if (name.includes("almond") || name.includes("macaron")) {
    ingredientsEn.push("Almond");
    ingredientsAz.push("Badam");
    allergensEn.push("Tree nuts (almond)");
    allergensAz.push("Ağac çərəzləri (badam)");
  }

  if (name.includes("hazelnut") || name.includes("nutella")) {
    ingredientsEn.push("Hazelnut");
    ingredientsAz.push("Fındıq");
    allergensEn.push("Tree nuts (hazelnut)");
    allergensAz.push("Ağac çərəzləri (fındıq)");
  }

  if (name.includes("oreo") || name.includes("cookie") ||
      name.includes("croissant") || name.includes("muffin") ||
      name.includes("cake") || name.includes("danish") ||
      name.includes("tiramisu") || name.includes("tart") ||
      name.includes("roll")) {
    if (!allergensEn.includes("Wheat (gluten)")) {
      allergensEn.push("Wheat (gluten)");
      allergensAz.push("Buğda (qlüten)");
    }
  }

  return {
    ingredientsEn,
    ingredientsAz,
    allergensEn: [...new Set(allergensEn)],
    allergensAz: [...new Set(allergensAz)],
  };
}

export function getProductDetails(product: Product): ProductDetails {
  const ingredients = getIngredients(product);

  const category = product.category;

  let addOns: ProductOption[] = [];

  if (category === "Hot Coffee" || category === "Iced Coffee") {
    addOns = coffeeAddOns;
  } else if (category === "Matcha & Tea") {
    addOns = matchaAddOns;
  } else if (category === "Frappe") {
    addOns = frappeAddOns;
  } else if (category === "Chocolate") {
    addOns = chocolateAddOns;
  } else if (category === "Refreshers") {
    addOns = refresherAddOns;
  } else if (category === "Desserts") {
    addOns = dessertAddOns;
  }

  const isDrink = [
    "Hot Coffee",
    "Iced Coffee",
    "Matcha & Tea",
    "Frappe",
    "Chocolate",
    "Refreshers",
  ].includes(category);

  return {
    ...ingredients,
    sizes: isDrink ? sizes : [],
    addOns,
  };
}