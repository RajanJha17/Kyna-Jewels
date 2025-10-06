import { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import productsData from "@/data/products.json";
import {
  FilterGroup,
  DiamondShapeSelector,
  PriceRangeSlider,
} from "@/components/Engravings";

type ColorOption = "white" | "gold" | "rosegold";

interface Product {
  id: number;
  title: string;
  oldPrice: string;
  price: string;
  img: string;
  discount: string;
  availableColors: ColorOption[];
  category: "rings" | "earrings" | "pendants";
}

interface APIProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  mainImage: string;
  price: number;
}

const products: Product[] = productsData as unknown as Product[];

const COLOR_ICONS: Record<ColorOption, JSX.Element> = {
  white: <img src="/colors/white.png" className="h-7" alt="White color" />,
  gold: <img src="/colors/gold.png" className="h-7" alt="Gold color" />,
  rosegold: (
    <img src="/colors/rosegold.png" className="h-7" alt="Rose Gold color" />
  ),
};

// Comprehensive Filter Sidebar Component for Jewellery
const JewelleryFilterSidebar: React.FC<{
  minPrice: number;
  maxPrice: number;
  onMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ minPrice, maxPrice, onMinChange, onMaxChange }) => {
  const renderStyleOptions = (styles: string[]) => (
    <>
      {styles.map((style) => (
        <label key={style} className="eng-suboption">
          <input type="checkbox" />
          <span>{style}</span>
        </label>
      ))}
    </>
  );

  const renderEngagementRingStyles = () => (
    <>
      {[
        "Accents",
        "Halo",
        "Hidden Halo",
        "3 Stone",
        "5 Stone",
        "7 & 8 Stone",
      ].map((item) => (
        <label key={item} className="eng-suboption">
          <input type="checkbox" />
          <span>{item}</span>
        </label>
      ))}
    </>
  );

  const renderEarringLengths = () => (
    <>
      {["Small (10 to 19mm)", "Medium (20 to 35mm)", "Large (Above 35mm)"].map(
        (item) => (
          <label key={item} className="eng-suboption">
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        )
      )}
    </>
  );

  const renderDropEarringStyles = () => (
    <>
      {["Classic Solitaire", "Halo Drop Earrings"].map((item) => (
        <label key={item} className="eng-suboption">
          <input type="checkbox" />
          <span>{item}</span>
        </label>
      ))}
    </>
  );

  return (
    <>
      {/* Rings Section */}
      <FilterGroup title="Rings" defaultOpen={true}>
        {/* Solitaire Rings */}
        <FilterGroup
          title="Solitaire Rings"
          defaultOpen={true}
          isSubGroup={true}
        >
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>

        {/* Engagement Rings */}
        <FilterGroup title="Engagement Rings" isSubGroup={true}>
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector
            selectedShapes={["Round", "Oval"]}
            showImages={false}
          />
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
          <div className="eng-sublist pt-2">
            <p className="eng-label-muted">STYLE</p>
            {renderEngagementRingStyles()}
          </div>
        </FilterGroup>

        {/* Fashion Rings */}
        <FilterGroup title="Fashion Rings" isSubGroup={true}>
          <p className="eng-label-muted">STYLE</p>
          {renderStyleOptions(["Daily Wear Rings", "Designer Rings"])}
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>
      </FilterGroup>

      {/* Earrings Section */}
      <FilterGroup title="Earrings" defaultOpen={false}>
        {/* Studs */}
        <FilterGroup title="Studs" defaultOpen={false} isSubGroup={true}>
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>

        {/* Hoops / Huggies */}
        <FilterGroup
          title="Hoops / Huggies"
          defaultOpen={false}
          isSubGroup={true}
        >
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
          <div className="eng-sublist">
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">EARRINGS Length</p>
              {renderEarringLengths()}
            </div>
          </div>
        </FilterGroup>

        {/* Fashion Earrings */}
        <FilterGroup title="Fashion Earrings" isSubGroup={true}>
          <div className="eng-sublist pt-2">
            <p className="eng-label-muted">STYLE</p>
            {renderStyleOptions(["Daily Wear Earrings", "Designer Earrings"])}
          </div>
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>

        {/* Drop Earrings */}
        <FilterGroup title="Drop Earrings" isSubGroup={true}>
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector
            selectedShapes={["Round", "Oval"]}
            showImages={false}
          />
          <div className="eng-sublist pt-2">
            <p className="eng-label-muted">STYLE</p>
            {renderDropEarringStyles()}
          </div>
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>
      </FilterGroup>

      {/* Pendants Section */}
      <FilterGroup title="Pendants" defaultOpen={false}>
        {/* Solitaire Pendants */}
        <FilterGroup
          title="Solitaire Pendants"
          defaultOpen={false}
          isSubGroup={true}
        >
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>

        {/* Fashion Pendants */}
        <FilterGroup title="Fashion Pendants" isSubGroup={true}>
          <div className="eng-sublist pt-2">
            <p className="eng-label-muted">STYLE</p>
            {renderStyleOptions(["Daily Wear Pendants", "Designer Pendants"])}
          </div>
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>

        {/* Solitaire Halo */}
        <FilterGroup
          title="Solitaire Halo"
          defaultOpen={false}
          isSubGroup={true}
        >
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>
      </FilterGroup>

      {/* Bracelets Section */}
      <FilterGroup title="Bracelets" defaultOpen={false}>
        <FilterGroup
          title="Tennis Bracelets"
          defaultOpen={false}
          isSubGroup={true}
        >
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>

        <FilterGroup title="Fashion Bracelets" isSubGroup={true}>
          <div className="eng-sublist pt-2">
            <p className="eng-label-muted">STYLE</p>
            {renderStyleOptions(["Daily Wear Bracelets", "Designer Bracelets"])}
          </div>
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>
      </FilterGroup>
    </>
  );
};

export default function JewelleryPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(24000);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [apiProducts, setApiProducts] = useState<APIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          " https://api.kynajewels.com/ /api/products"
        );
        const data = await response.json();

        if (data.success) {
          setApiProducts(data.data.products);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to connect to API");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1000);
    setMinPrice(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(value);
  };

  // Combine static products with API products
  const allProducts = [
    ...products,
    ...apiProducts.map((p) => ({
      id: parseInt(p.id),
      title: p.name,
      oldPrice: `₹${Math.round(p.price * 1.2)}`,
      price: `₹${p.price}`,
      img: p.mainImage.startsWith("/")
        ? p.mainImage
        : "/product_detail/display.png",
      discount: "15% OFF",
      availableColors: ["white", "gold", "rosegold"] as ColorOption[],
      category: p.category.toLowerCase().includes("ring")
        ? "rings"
        : p.category.toLowerCase().includes("earring")
        ? "earrings"
        : ("pendants" as "rings" | "earrings" | "pendants"),
    })),
  ];

  // Filter products by price range
  const filteredProducts = allProducts.filter((p) => {
    const price = parseInt(p.price.replace(/[₹,]/g, ""));
    return price >= minPrice && price <= maxPrice;
  });

  return (
    <>
      <header aria-label="Site header" className="sr-only">
        <h1>Jewellery Collection — Premium Diamond Jewellery</h1>
      </header>

      <main aria-labelledby="jewellery-heading" className="eng-root">
        <style>{`
          /* Scoped Jewellery page styles */
          .eng-root { --teal: hsl(176 45% 40%); --teal-2: hsl(176 45% 55%); --muted: hsl(0 0% 96%); --border: hsl(0 0% 88%); --text: hsl(210 20% 15%); --subtle: hsl(210 12% 40%); color: var(--text); }
          .eng-wrap { max-width: 1200px; margin: 0 auto; padding: 1rem; }
          .eng-breadcrumb { font-size: 12px; color: var(--subtle); margin: 0.5rem 0 1rem; }
          .eng-breadcrumb a { color: inherit; text-decoration: none; }

          .eng-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
          .eng-title { font-size: 20px; font-weight: 600; }
          .eng-sub { margin: 1rem 0; color: var(--subtle); font-size: 14px; text-align: center; }
          .eng-actions { font-size: 13px; }
          .eng-sort { border: 1px solid var(--border); background: #fff; border-radius: 8px; padding: 6px 10px; color: var(--text); }

          /* Layout */
          .eng-layout { display: grid; grid-template-columns: 1fr; gap: 1rem; }
          .eng-filters { background: #fff; border: 1px solid var(--border); border-radius: 8px; }
          .eng-filters-header { display:flex; align-items:center; justify-content:space-between; padding: 10px 12px; border-bottom: 1px solid var(--border); font-weight: 600; font-size: 14px; }

          /* Hide static sidebar on small screens */
          @media (max-width: 1023px) { .eng-filters { display: none; } }

          /* Left rail width on desktop */
          @media (min-width: 1024px) {
            .eng-layout { grid-template-columns: 280px 1fr; align-items: start; }
          }

          /* Collapsible groups */
          details.eng-group { border-bottom: 1px solid var(--border); }
          details.eng-group > summary { list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; padding: 12px; font-weight: 600; font-size: 14px; }
          details.eng-group > summary::-webkit-details-marker { display:none; }
          details.eng-group > summary .chevron { transition: transform 0.2s ease; }
          details.eng-group[open] > summary .chevron { transform: rotate(180deg); }
          details.eng-group > summary .chevron-right { transition: transform 0.2s ease; }
          details.eng-group[open] > summary .chevron-right { transform: rotate(90deg); }
          .eng-group .eng-sublist { padding: 8px 12px 12px 12px; }
          .eng-suboption { display:flex; align-items:center; gap:.5rem; padding:6px 8px; border-radius:6px; cursor:pointer; }
          .eng-suboption:hover { background: var(--muted); }
          .eng-suboption input { accent-color: var(--teal); }
          .eng-label-muted { font-size: 12px; color: var(--subtle); margin: 10px 0 6px; }

          /* Price slider */
          .eng-price-range { display:flex; align-items:center; gap:.5rem; }
          .eng-price-range input[type="range"] { flex:1; accent-color: var(--teal); }
          .eng-price-input { width: 100px; border:1px solid var(--border); border-radius:6px; padding:6px 8px; font-size:12px; }

          /* Product grid */
          .eng-grid { display:grid; grid-template-columns: 1fr; gap: 16px; }
          @media (min-width: 640px) { .eng-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (min-width: 1024px) { .eng-grid { grid-template-columns: repeat(4, 1fr); } }

          .eng-card { background:#fff; border:1px solid var(--border); border-radius: 10px; overflow:hidden; position:relative; }
          .eng-card-img { width:100%; aspect-ratio: 1 / 1; object-fit: cover; display:block; background:#fafafa; }
          .eng-card-body { padding: 10px 12px 14px; }
          .eng-card-title { font-size: 13px; font-weight: 600; margin: 0 0 6px; }
          .eng-card-prices { display:flex; gap:.5rem; align-items:center; font-size: 13px; }
          .eng-old { color: var(--subtle); text-decoration: line-through; }
          .eng-new { font-weight: 600; }
          .eng-wishlist { position:absolute; top: 10px; right: 10px; background:#fff; border:1px solid var(--border); width:34px; height:34px; border-radius:50%; display:grid; place-items:center; }
          .eng-badge { position:absolute; top: 10px; left: 10px; background: var(--teal); color:#fff; font-size:11px; padding: 4px 6px; border-radius: 4px; font-weight:600; }
          .eng-color-row { display:flex; gap:0px; padding: 8px 12px 0; justify-content:center; align-items:center; }

          /* Mobile filters drawer */
          .eng-drawer { position: fixed; inset: 0; background: rgba(0,0,0,.36); display:none; z-index: 60; }
          .eng-drawer.active { display:block; }
          .eng-drawer-aside { position:absolute; top:0; left:0; height:100%; width:min(85%,320px); background:#fff; border-right:1px solid var(--border); transform: translateX(-100%); transition: transform .25s ease; }
          .eng-drawer.active .eng-drawer-aside { transform: translateX(0); }
          .eng-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border); font-weight:600; }
          .eng-close { border:none; background:#fff; border:1px solid var(--border); width:32px; height:32px; border-radius:8px; display:grid; place-items:center; cursor:pointer; }

          /* Loading and Error states */
          .eng-loading { text-align: center; padding: 2rem; color: var(--subtle); }
          .eng-error { text-align: center; padding: 2rem; color: #dc2626; }
        `}</style>

        <div className="eng-wrap">
          <nav aria-label="Breadcrumb" className="eng-breadcrumb">
            <Link to="/">Home</Link> <span> - </span> <span>Jewellery</span>
          </nav>

          <p className="eng-sub">
            Discover our complete collection of premium diamond jewellery. From
            elegant rings to stunning earrings, find the perfect piece that
            speaks to your style. Each piece is crafted with precision and
            attention to detail.
          </p>

          <div className="eng-header">
            <h2 id="jewellery-heading" className="eng-title">
              Jewellery Collection ({filteredProducts.length})
            </h2>
            <div className="eng-actions">
              <label>
                Sort by:{" "}
                <select className="eng-sort" aria-label="Sort products">
                  <option>Best Seller</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </label>
            </div>
          </div>

          {/* Mobile filter bar */}
          <div
            className="flex justify-between items-center my-3 lg:hidden"
            aria-hidden="false"
          >
            <button
              className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileFiltersOpen(true)}
              aria-label="Open filters"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M7 12h10" />
                <path d="M11 18h2" />
              </svg>
              Filters
            </button>
          </div>

          <section className="eng-layout mt-5">
            {/* Desktop sidebar */}
            <aside
              className="eng-filters"
              aria-label="Filters"
              role="complementary"
            >
              <div className="eng-filters-header">Filters</div>
              <JewelleryFilterSidebar
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinChange={handleMinChange}
                onMaxChange={handleMaxChange}
              />
            </aside>

            {/* Products */}
            <section aria-label="Products" className="eng-grid">
              {loading && (
                <div className="eng-loading col-span-full">
                  Loading products...
                </div>
              )}

              {error && (
                <div className="eng-error col-span-full">
                  {error}. Showing static products only.
                </div>
              )}

              {filteredProducts.map((p) => (
                <article
                  className="eng-card"
                  key={`jewellery-${p.id}`}
                  aria-label={p.title}
                >
                  {p.discount && (
                    <span
                      className="eng-badge"
                      aria-label={`${p.discount} badge`}
                    >
                      {p.discount}
                    </span>
                  )}
                  <button className="eng-wishlist" aria-label="Add to wishlist">
                    <Heart size={16} />
                  </button>
                  <Link to={`/product/${p.id}`}>
                    <img
                      src={p.img}
                      alt={`${p.title} product image`}
                      loading="lazy"
                      className="eng-card-img"
                    />
                  </Link>
                  {/* Available colors */}
                  {p.availableColors && p.availableColors.length > 0 && (
                    <div
                      className="eng-color-row"
                      aria-label="Available colors"
                    >
                      {p.availableColors.map((c) => (
                        <span key={`${p.id}-${c}`}>{COLOR_ICONS[c]}</span>
                      ))}
                    </div>
                  )}
                  <div className="eng-card-body">
                    <h3 className="eng-card-title">
                      <Link
                        to={`/product/${p.id}`}
                        className="hover:text-teal-600"
                      >
                        {p.title}
                      </Link>
                    </h3>
                    <div className="eng-card-prices">
                      <span className="eng-old">{p.oldPrice}</span>
                      <span className="eng-new">{p.price}</span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </section>
        </div>

        {/* Mobile Filters Drawer */}
        <div
          className={`eng-drawer ${mobileFiltersOpen ? "active" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Filters drawer"
        >
          <aside className="eng-drawer-aside">
            <div className="eng-drawer-head">
              <span>Filters</span>
              <button
                className="eng-close"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={16} />
              </button>
            </div>
            {/* Use same content as desktop sidebar for mobile */}
            <div style={{ padding: "8px 0" }}>
              <JewelleryFilterSidebar
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinChange={handleMinChange}
                onMaxChange={handleMaxChange}
              />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
