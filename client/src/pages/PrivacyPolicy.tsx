import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { ChevronRight, Menu, X } from "lucide-react";

const sections = [
  {
    id: "product-information",
    title: "PRODUCT INFORMATION AND DESCRIPTIONS",
    subsections: [
      { id: "accuracy-information", title: "Accuracy of Information" },
      { id: "pricing-policy", title: "Pricing Policy" },
      { id: "product-availability", title: "Availability of Products" },
      { id: "product-policy", title: "Product Policy" },
      { id: "product-care", title: "Product Care and Maintenance Guidelines" },
      {
        id: "health-safety",
        title: "Health and Safety Precautions for Product Use",
      },
      {
        id: "product-safety",
        title: "Product Safety Information and Compliance with Regulations",
      },
    ],
  },
];

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }

        for (const subsection of section.subsections) {
          const element = document.getElementById(subsection.id);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (
              scrollPosition >= offsetTop &&
              scrollPosition < offsetTop + offsetHeight
            ) {
              setActiveSection(subsection.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setSidebarOpen(false);
    }
  };

  const SidebarContent = () => (
    <nav className="space-y-1">
      {sections.map((section) => (
        <div key={section.id}>
          <button
            onClick={() => scrollToSection(section.id)}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === section.id
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {section.title}
          </button>
          <div className="ml-4 space-y-1">
            {section.subsections.map((subsection) => (
              <button
                key={subsection.id}
                onClick={() => scrollToSection(subsection.id)}
                className={`w-full text-left px-3 py-1 text-sm rounded-md transition-colors ${
                  activeSection === subsection.id
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {subsection.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <SEO
        title="Privacy Policy | Kyna Jewellery"
        description="Read our privacy policy and learn how we handle your personal information."
        canonical="/privacy-policy"
      />

      {/* <Navbar /> */}

      <main className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row sm:gap-8 relative">
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden">
              <nav
                aria-label="Breadcrumb"
                className="text-sm text-muted-foreground py-4"
              >
                <a href="/" className="hover:text-foreground">
                  Home
                </a>
                <ChevronRight className="inline w-4 h-4 mx-2" />
                <span>Privacy Policy</span>
              </nav>
              <div className="sticky top-40">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex bg-white items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-md bg-background hover:bg-muted"
                >
                  <Menu className="w-4 h-4" />
                  Table of Contents
                </button>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-20 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <nav
                  aria-label="Breadcrumb"
                  className="text-sm text-muted-foreground py-4"
                >
                  <a href="/" className="hover:text-foreground">
                    Home
                  </a>
                  <ChevronRight className="inline w-4 h-4 mx-2" />
                  <span>Terms & Conditions</span>
                </nav>
                <div className="bg-card border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4">
                    Table of Contents
                  </h3>
                  <SidebarContent />
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden bg-[#ffff]">
                <div
                  className="fixed inset-0"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed top-0 left-0 h-full w-80 bg-card border-r border-border p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Table of Contents</h3>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-muted rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <SidebarContent />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 mt-8 sm:mt-12 max-w-4xl">
              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground mb-2">
                  Last Update: Feb 16, 2025
                </p>
                <h1 className="text-3xl font-bold">Terms & Conditions</h1>
              </div>
              {/* Product Information Section */}
              <section id="product-information" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-[#328F94] ">
                  02. PRODUCT INFORMATION AND DESCRIPTIONS
                </h2>

                <div id="accuracy-information" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1.Accuracy of Information
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      <span className="font-bold">
                        Product Colors and Sizes:
                      </span>{" "}
                      We strive to accurately display the colors and sizes of
                      our products on our website. However, actual colors may
                      vary depending on your monitor or display device. We
                      cannot guarantee that your monitor's display will
                      perfectly reflect the color of the product you receive.
                      Additionally, the packaging of the product may differ from
                      what is shown online.
                    </li>
                    <li>
                      <span className="font-bold">Weight Variations:</span>{" "}
                      During the crafting process of jewellery items such as
                      rings and bracelets, slight variations in metal weight may
                      naturally occur. These differences may lead to the final
                      product weighing slightly more or less than initially
                      estimated, reflecting the unique nature of handcrafted
                      jewellery. For example, if you purchase a gold ring
                      initially estimated to weigh 10 grams, the final weight
                      may be slightly different, such as 9.9 grams or 10.1
                      grams. Similarly, the total weight of diamonds or
                      gemstones may also vary. For instance, if the total weight
                      is estimated to be 2 carats, it could range from 1.99
                      carats to 2.1 carats.
                    </li>
                    <li>
                      <span className="font-bold">
                        Fixed Pricing Assurance:
                      </span>{" "}
                      Please rest assured that the price agreed upon at the time
                      of purchase remains fixed and unchanged. Our rates are
                      determined by considering various factors to ensure smooth
                      operations and fair pricing, regardless of any minor
                      fluctuations in weight due to production process.
                    </li>
                    <li>
                      <span className="font-bold">Consistent Pricing:</span> The
                      metal, diamond, or gemstone weights of jewellery items may
                      vary slightly after crafting (either go higher or lower),
                      but the price will remain unchanged from the amount agreed
                      upon at the time of purchase.{" "}
                      <span className="italic">(DISCLAIMER POP UP)</span>
                    </li>
                  </ul>
                </div>

                <div id="pricing-policy" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    2.Pricing Policy
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Prices are quoted in INR and does not include applicable
                    taxes unless otherwise stated. We reserve the right to
                    change prices at any time without prior notice, although
                    such changes will not affect orders that have already been
                    placed and confirmed. Prices may change due to market
                    fluctuations, changes in supply, promotional offers, or
                    other factors. We periodically review and adjust our pricing
                    to remain competitive. Discounts and promotional offers
                    apply only during the specified promotional period and
                    cannot be applied retrospectively or combined with other
                    offers unless explicitly stated. While we strive for
                    accuracy, occasionally errors may occur in the prices listed
                    on our website. We reserve the right to correct any errors
                    and update information without prior notice. If a pricing
                    error is discovered after you have placed an order, we will
                    contact you promptly to reconfirm your order at the correct
                    price or cancel it for a full refund. The prices listed
                    include the cost of the product itself. Additional charges
                    such as shipping fees, taxes, and duties will be calculated
                    and displayed during the checkout process. Depending on the
                    destination of the shipment, your order may be subject to
                    taxes, customs duties, and fees levied by the destination
                    state/country. The recipient of the shipment is responsible
                    for all import-related fees.
                  </p>
                </div>

                <div id="product-availability" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    3.Availability of Products
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We strive to maintain accurate and up-to-date information
                    regarding the availability of our products. However, due to
                    the nature of our business, product availability is subject
                    to change without notice. We cannot guarantee that all
                    products will be in stock at all times.
                  </p>
                </div>

                <div id="product-policy" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    4.Product Policy
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We strive for precision, commitment to providing accurate
                    and detailed descriptions of our jewellery items please note
                    that slight variations in color, size, weight, and design
                    may occur due to the handcrafted nature of our products.{" "}
                    <br />
                    <br />
                    The colors of our items as displayed on our website may
                    differ from the actual products you receive. This can be
                    attributed to various factors, including natural variations
                    in metals and gemstones, the lighting conditions during
                    viewing (such as artificial and indoor lighting). While we
                    make every effort to accurately represent our products
                    online, the colors you see on your monitor may not perfectly
                    match the actual items upon delivery. Therefore, some minor
                    distinctions in texture and color should be expected.
                  </p>
                </div>

                <div id="product-care" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    5.Product Care and Maintenance Guidelines
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Avoid contact with chemicals such as chlorine bleach or
                      harsh cleaning agents.
                    </li>
                    <li>
                      Clean your jewellery regularly with a soft brush and mild
                      soap solution, and have them inspected and professionally
                      cleaned annually if further required.
                    </li>
                    <li>
                      These precious metals can tarnish over time due to
                      exposure to air and moisture — store jewellery in a dry
                      place, or in a jewellery box or pouch.
                    </li>
                    <li>
                      Remove jewellery before engaging in activities that could
                      damage it, such as swimming, gardening, or exercising etc.
                    </li>
                    <li>
                      We cannot be held responsible for any damage resulting
                      from failure to follow our care and maintenance
                      guidelines.
                    </li>
                  </ul>
                </div>

                <div id="health-safety" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    6.Health and Safety Precautions for Product Use
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      <span className="font-bold">Allergies:</span> Some
                      individuals may be sensitive or allergic to certain
                      metals. Customers are advised to review product
                      descriptions for metal compositions and consult with a
                      healthcare professional if they have known metal
                      allergies.
                    </li>
                    <li>
                      <span className="font-bold">Choking Hazard:</span> Small
                      parts such as clasps or charms may pose a choking hazard,
                      especially to young children. Keep jewellery out of reach
                      of children and supervise them while wearing or handling
                      jewellery.
                    </li>
                    <li>
                      <span className="font-bold">
                        Health and Safety Disclaimer:
                      </span>{" "}
                      We cannot be held responsible for any damage resulting
                      from failure to follow Health and Safety Precautions for
                      Product Use.
                    </li>
                  </ul>
                </div>

                <div id="product-safety" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    7.Product Safety Information and Compliance with Regulations
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our jewellery complies with industry standards and
                    regulations for safety and quality. We source materials from
                    reputable suppliers and adhere to ethical and sustainable
                    practices. Certifications and guarantees of authenticity are
                    provided for natural diamonds and precious metals. Customers
                    can shop with confidence knowing that our products meet
                    stringent safety and compliance standards.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
