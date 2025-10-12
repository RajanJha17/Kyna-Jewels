import { Card, CardContent } from "@/components/ui/card";

export default function FAQsSection() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">What is your return policy?</h3>
            <p className="text-muted-foreground text-sm">
              We offer a 30-day return policy for all unworn jewellery items.
              Items must be in original condition with certificates and
              packaging.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">How long does shipping take?</h3>
            <p className="text-muted-foreground text-sm">
              Standard shipping takes 5-7 business days. Express shipping is
              available for 2-3 business days delivery.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              Do you provide certificates for diamonds?
            </h3>
            <p className="text-muted-foreground text-sm">
              Yes, all our diamond jewellery comes with certified diamonds and
              authenticity certificates.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Can I resize my ring?</h3>
            <p className="text-muted-foreground text-sm">
              Yes, we offer complimentary ring resizing within the first 30 days
              of purchase.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
