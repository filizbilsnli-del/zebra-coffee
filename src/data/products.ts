export type Product = {
  id: number;
  en: string;
  az: string;
  category: string;
  price: number;
  image: string;
  descEn: string;
  descAz: string;
};
const rawProducts: Omit<Product, "id">[] = [
  { en: "Espresso", az: "Espresso", category: "Hot Coffee", price: 4.50, image: "espresso.jpg", descEn: "A rich and intense shot of freshly brewed coffee.", descAz: "Zəngin dadlı, tünd və təzə dəmlənmiş qəhvə." },
  { en: "Americano", az: "Amerikano", category: "Hot Coffee", price: 5.00, image: "americano.jpg", descEn: "Espresso balanced with hot water.", descAz: "İsti su ilə balanslaşdırılmış espresso." },
  { en: "Cappuccino", az: "Kapuçino", category: "Hot Coffee", price: 6.50, image: "cappuccino.jpg", descEn: "Espresso topped with steamed milk and foam.", descAz: "Buxarda isidilmiş süd və köpüklə hazırlanmış espresso." },
  { en: "Flat White", az: "Flat White", category: "Hot Coffee", price: 7.00, image: "flat-white.jpg", descEn: "Smooth espresso with velvety microfoam.", descAz: "Məxməri süd köpüyü ilə hazırlanmış espresso." },
  { en: "Mocha", az: "Moka", category: "Hot Coffee", price: 8.00, image: "mocha.jpg", descEn: "Espresso combined with rich chocolate and milk.", descAz: "Şokolad və südlə birləşdirilmiş espresso." },
  { en: "Macchiato", az: "Makiato", category: "Hot Coffee", price: 5.50, image: "macchiato.jpg", descEn: "Espresso finished with a touch of milk foam.", descAz: "Az miqdarda süd köpüyü ilə təqdim olunan espresso." },
  { en: "Cortado", az: "Kortado", category: "Hot Coffee", price: 6.00, image: "cortado.jpg", descEn: "Equal parts espresso and warm milk.", descAz: "Bərabər miqdarda espresso və isti süd." },
  { en: "Caramel Latte", az: "Karamelli Latte", category: "Hot Coffee", price: 8.50, image: "caramel-latte.jpg", descEn: "Creamy latte with sweet caramel flavour.", descAz: "Şirin karamel dadlı kremli latte." },
  { en: "Vanilla Latte", az: "Vanilli Latte", category: "Hot Coffee", price: 8.50, image: "vanilla-latte.jpg", descEn: "Classic latte with smooth vanilla notes.", descAz: "Zərif vanil dadı ilə klassik latte." },
  { en: "Spanish Latte", az: "İspan Latte", category: "Hot Coffee", price: 9.00, image: "spanish-latte.jpg", descEn: "Espresso blended with creamy sweet milk.", descAz: "Kremli və şirin südlə hazırlanmış espresso." },
  { en: "Affogato", az: "Affoqato", category: "Hot Coffee", price: 8.00, image: "affogato.jpg", descEn: "Vanilla ice cream topped with fresh espresso.", descAz: "Təzə espresso ilə təqdim olunan vanilli dondurma." },
  { en: "Classic Latte", az: "Klassik Latte", category: "Hot Coffee", price: 7.50, image: "latte.jpg", descEn: "Espresso blended with creamy steamed milk.", descAz: "Kremli buxarda isidilmiş südlə hazırlanmış espresso." },

  { en: "Classic Iced Coffee", az: "Klassik Soyuq Qəhvə", category: "Iced Coffee", price: 7.00, image: "iced-coffee-1.jpg", descEn: "Refreshing chilled coffee served over ice.", descAz: "Buzla təqdim olunan sərinləşdirici qəhvə." },
  { en: "Iced Latte", az: "Soyuq Latte", category: "Iced Coffee", price: 8.00, image: "iced-coffee-2.jpg", descEn: "Espresso and cold milk served over ice.", descAz: "Buz üzərində espresso və soyuq süd." },
  { en: "Iced Americano", az: "Soyuq Amerikano", category: "Iced Coffee", price: 6.00, image: "iced-americano.jpg", descEn: "Bold espresso chilled with cold water and ice.", descAz: "Soyuq su və buzla hazırlanan tünd espresso." },
  { en: "Iced Cappuccino", az: "Soyuq Kapuçino", category: "Iced Coffee", price: 7.50, image: "iced-cappuccino.jpg", descEn: "Chilled cappuccino with a creamy foam.", descAz: "Kremli köpüklə təqdim olunan soyuq kapuçino." },
  { en: "Iced Caramel Latte", az: "Soyuq Karamelli Latte", category: "Iced Coffee", price: 9.00, image: "iced-caramel-latte.jpg", descEn: "Cold latte with a delicious caramel flavour.", descAz: "Ləzzətli karamel dadlı soyuq latte." },
  { en: "Iced Mocha", az: "Soyuq Moka", category: "Iced Coffee", price: 9.00, image: "iced-mocha.jpg", descEn: "Cold espresso with chocolate and milk.", descAz: "Şokolad və südlə hazırlanan soyuq espresso." },
  { en: "Cold Brew", az: "Soyuq Dəmləmə Qəhvə", category: "Iced Coffee", price: 8.00, image: "cold-brew.jpg", descEn: "Slow-steeped coffee with a smooth taste.", descAz: "Yavaş dəmlənmiş, yumşaq dadlı soyuq qəhvə." },
  { en: "Iced Spanish Latte", az: "Soyuq İspan Latte", category: "Iced Coffee", price: 9.50, image: "iced-spanish-latte.jpg", descEn: "Sweet Spanish latte served chilled.", descAz: "Soyuq təqdim olunan şirin İspan latte." },
  { en: "Iced Hazelnut Latte", az: "Soyuq Fındıqlı Latte", category: "Iced Coffee", price: 9.00, image: "iced-hazelnut-latte.jpg", descEn: "Iced latte with a nutty hazelnut flavour.", descAz: "Fındıq dadlı buzlu latte." },

  { en: "Classic Matcha Latte", az: "Klassik Matcha Latte", category: "Matcha & Tea", price: 10.00, image: "matcha.jpg", descEn: "Japanese matcha blended with smooth milk.", descAz: "Yumşaq südlə qarışdırılmış yapon matchası." },
  { en: "Strawberry Matcha", az: "Çiyələkli Matcha", category: "Matcha & Tea", price: 11.00, image: "strawberry-matcha.jpg", descEn: "Matcha with a sweet strawberry twist.", descAz: "Şirin çiyələk dadı ilə matcha." },
  { en: "Iced Matcha Latte", az: "Soyuq Matcha Latte", category: "Matcha & Tea", price: 10.50, image: "iced-matcha-latte.jpg", descEn: "Refreshing matcha and cold milk over ice.", descAz: "Buz üzərində sərin matcha və soyuq süd." },
  { en: "Hot Matcha Latte", az: "İsti Matcha Latte", category: "Matcha & Tea", price: 10.00, image: "hot-matcha-latte.jpg", descEn: "Warm and creamy Japanese matcha drink.", descAz: "İsti və kremli yapon matcha içkisi." },
  { en: "Mango Matcha", az: "Manqolu Matcha", category: "Matcha & Tea", price: 11.00, image: "mango-matcha.jpg", descEn: "Tropical mango paired with earthy matcha.", descAz: "Tropik manqo və matchanın xüsusi birləşməsi." },
  { en: "Chai Latte", az: "Çay Latte", category: "Matcha & Tea", price: 8.00, image: "chai-latte.jpg", descEn: "Black tea with milk and warming spices.", descAz: "Süd və ətirli ədviyyatlarla qara çay." },
  { en: "Hibiscus Tea", az: "Hibiskus Çayı", category: "Matcha & Tea", price: 6.00, image: "hibiscus-tea.jpg", descEn: "Floral herbal tea with a refreshing taste.", descAz: "Təravətli dadı olan çiçəkli bitki çayı." },

  { en: "Classic Frappe", az: "Klassik Frappé", category: "Frappe", price: 9.00, image: "classic-frappe.jpg", descEn: "A cool and creamy blended coffee drink.", descAz: "Sərin və kremli qarışdırılmış qəhvə içkisi." },
  { en: "Caramel Frappe", az: "Karamelli Frappé", category: "Frappe", price: 10.00, image: "caramel-frappe.jpg", descEn: "Blended coffee with sweet caramel.", descAz: "Şirin karamellə qarışdırılmış soyuq qəhvə." },
  { en: "Mocha Frappe", az: "Mokalı Frappé", category: "Frappe", price: 10.00, image: "mocha-frappe.jpg", descEn: "Chocolate and coffee blended until creamy.", descAz: "Kremli teksturaya qədər qarışdırılmış şokoladlı qəhvə." },
  { en: "Vanilla Frappe", az: "Vanilli Frappé", category: "Frappe", price: 9.50, image: "vanilla-frappe.jpg", descEn: "A smooth vanilla-flavoured blended drink.", descAz: "Yumşaq vanil dadlı qarışdırılmış içki." },
  { en: "Oreo Frappe", az: "Oreo Frappé", category: "Frappe", price: 10.50, image: "oreo-frappe.jpg", descEn: "Creamy frappe blended with chocolate cookies.", descAz: "Şokoladlı peçenyelərlə qarışdırılmış kremli frappé." },
  { en: "Chocolate Frappe", az: "Şokoladlı Frappé", category: "Frappe", price: 10.00, image: "chocolate-frappe.jpg", descEn: "A rich and chilled chocolate frappe.", descAz: "Zəngin dadlı soyuq şokoladlı frappé." },
  { en: "Coffee Frappe", az: "Qəhvəli Frappé", category: "Frappe", price: 9.50, image: "coffee-frappe.jpg", descEn: "Chilled blended coffee with a creamy finish.", descAz: "Kremli dadla tamamlanan soyuq qarışdırılmış qəhvə." },

  { en: "Classic Hot Chocolate", az: "Klassik İsti Şokolad", category: "Chocolate", price: 7.00, image: "classic-hot-chocolate.jpg", descEn: "Warm chocolate drink with a smooth texture.", descAz: "Yumşaq teksturalı isti şokoladlı içki." },
  { en: "White Hot Chocolate", az: "Ağ İsti Şokolad", category: "Chocolate", price: 7.50, image: "white-hot-chocolate.jpg", descEn: "Creamy warm drink made with white chocolate.", descAz: "Ağ şokoladla hazırlanan kremli isti içki." },
  { en: "Dark Chocolate", az: "Tünd Şokolad", category: "Chocolate", price: 8.00, image: "dark-chocolate.jpg", descEn: "Deep cocoa flavour for chocolate lovers.", descAz: "Şokolad sevənlər üçün tünd kakao dadı." },
  { en: "Chocolate Milkshake", az: "Şokoladlı Milkshake", category: "Chocolate", price: 9.00, image: "chocolate-milkshake.jpg", descEn: "A thick and creamy chocolate milkshake.", descAz: "Qatı və kremli şokoladlı milkshake." },
  { en: "Nutella Chocolate", az: "Nutellalı Şokolad", category: "Chocolate", price: 9.00, image: "nutella-chocolate.jpg", descEn: "A rich chocolate drink with hazelnut spread.", descAz: "Fındıq kremi ilə zənginləşdirilmiş şokoladlı içki." },
  { en: "Iced Chocolate", az: "Soyuq Şokolad", category: "Chocolate", price: 8.00, image: "iced-chocolate.jpg", descEn: "Chilled chocolate drink served over ice.", descAz: "Buzla təqdim olunan soyuq şokoladlı içki." },

  { en: "Strawberry Refresher", az: "Çiyələkli Sərinləşdirici", category: "Refreshers", price: 8.00, image: "strawberry-refresher.jpg", descEn: "A bright and fruity strawberry drink.", descAz: "Təravətli və meyvəli çiyələk içkisi." },
  { en: "Mango Refresher", az: "Manqolu Sərinləşdirici", category: "Refreshers", price: 8.50, image: "mango-refresher.jpg", descEn: "A tropical mango drink served chilled.", descAz: "Soyuq təqdim olunan tropik manqo içkisi." },
  { en: "Passion Fruit Refresher", az: "Marakuya Sərinləşdiricisi", category: "Refreshers", price: 8.50, image: "passion-fruit-refresher.jpg", descEn: "A tropical and refreshing passion fruit drink.", descAz: "Tropik və təravətləndirici marakuya içkisi." },
  { en: "Watermelon Refresher", az: "Qarpızlı Sərinləşdirici", category: "Refreshers", price: 8.00, image: "watermelon-refresher.jpg", descEn: "Light watermelon drink for a refreshing break.", descAz: "Təravətli fasilə üçün yüngül qarpız içkisi." },
  { en: "Citrus Refresher", az: "Sitrus Sərinləşdiricisi", category: "Refreshers", price: 7.50, image: "citrus-refresher.jpg", descEn: "A refreshing mix of citrus flavours.", descAz: "Sitrus dadlarının təravətli qarışığı." },
  { en: "Raspberry Lemonade", az: "Moruqlu Limonad", category: "Refreshers", price: 7.50, image: "raspberry-lemonade.jpg", descEn: "Classic lemonade with a raspberry twist.", descAz: "Moruq dadı ilə klassik limonad." },

  { en: "Butter Croissant", az: "Kərə Yağlı Kruassan", category: "Bakery", price: 5.00, image: "butter-croissant.jpg", descEn: "A flaky and buttery freshly baked pastry.", descAz: "Xırtıldayan və kərə yağlı təzə kruassan." },
  { en: "Chocolate Croissant", az: "Şokoladlı Kruassan", category: "Bakery", price: 6.00, image: "chocolate-croissant.jpg", descEn: "A golden croissant filled with chocolate.", descAz: "Şokolad içlikli qızılı rəngli kruassan." },
  { en: "Cinnamon Roll", az: "Darçınlı Bulka", category: "Bakery", price: 6.00, image: "cinnamon-roll.jpg", descEn: "Soft pastry with cinnamon and sweet glaze.", descAz: "Darçın və şirin qlazurla yumşaq xəmir məmulatı." },
  { en: "Blueberry Muffin", az: "Qaragiləli Muffin", category: "Bakery", price: 5.50, image: "blueberry-muffin.jpg", descEn: "A soft muffin filled with blueberries.", descAz: "Qaragilə ilə hazırlanmış yumşaq muffin." },
  { en: "Chocolate Muffin", az: "Şokoladlı Muffin", category: "Bakery", price: 5.50, image: "chocolate-muffin.jpg", descEn: "A rich and soft chocolate muffin.", descAz: "Zəngin şokolad dadlı yumşaq muffin." },
  { en: "Almond Croissant", az: "Badamlı Kruassan", category: "Bakery", price: 6.50, image: "almond-croissant.jpg", descEn: "A buttery croissant topped with almonds.", descAz: "Badamla bəzədilmiş kərə yağlı kruassan." },
  { en: "Cheese Danish", az: "Pendirli Danimarka bulkası", category: "Bakery", price: 6.00, image: "cheese-danish.jpg", descEn: "A flaky pastry with creamy cheese filling.", descAz: "Kremli pendir içlikli qat-qat xəmir məmulatı." },

  { en: "Tiramisu", az: "Tiramisu", category: "Desserts", price: 9.00, image: "tiramisu.jpg", descEn: "A classic Italian dessert with coffee flavour.", descAz: "Qəhvə dadlı klassik İtalyan deserti." },
  { en: "Red Velvet Cake", az: "Qırmızı Məxmər Tort", category: "Desserts", price: 9.00, image: "red-velvet-cake.jpg", descEn: "Soft red velvet cake with creamy frosting.", descAz: "Kremli örtüklə yumşaq qırmızı məxmər tort." },
  { en: "Carrot Cake", az: "Kök Tortu", category: "Desserts", price: 8.50, image: "carrot-cake.jpg", descEn: "A soft cake with carrot and warm spices.", descAz: "Kök və ətirli ədviyyatlarla hazırlanmış yumşaq tort." },
  { en: "Chocolate Lava Cake", az: "Şokoladlı Lava Keks", category: "Desserts", price: 9.50, image: "chocolate-lava-cake.jpg", descEn: "A warm chocolate cake with a soft centre.", descAz: "İçi yumşaq isti şokoladlı keks." },
  { en: "Macarons", az: "Makaronlar", category: "Desserts", price: 7.00, image: "macarons.jpg", descEn: "Delicate French almond-based sweet treats.", descAz: "Zərif fransız badamlı şirniyyatları." },
  { en: "Strawberry Tart", az: "Çiyələkli Tart", category: "Desserts", price: 8.50, image: "strawberry-tart.jpg", descEn: "A delicate tart topped with fresh strawberries.", descAz: "Təzə çiyələklərlə bəzədilmiş zərif tart." },
  { en: "Oreo Cheesecake", az: "Oreo Çizkeyk", category: "Desserts", price: 9.00, image: "oreo-cheesecake.jpg", descEn: "Creamy cheesecake with chocolate cookie pieces.", descAz: "Şokoladlı peçenye parçaları ilə kremli çizkeyk." },
  { en: "Chocolate Chip Cookies", az: "Şokolad Parçalı Peçenye", category: "Desserts", price: 4.50, image: "chocolate-chip-cookies.jpg", descEn: "Fresh cookies filled with chocolate chips.", descAz: "Şokolad parçaları ilə hazırlanmış təzə peçenye." },
];
export const products: Product[] = rawProducts.map((product, index) => ({
  ...product,
  id: index + 1,
  image: `/images/${product.image}`,
}));
