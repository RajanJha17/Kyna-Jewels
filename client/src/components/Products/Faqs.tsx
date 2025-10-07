import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function Faqs() {
  return (
    <div className="mt-16">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger className="text-lg text-[#328F94] font-semibold">
            Details
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div>
              <h4 className="font-medium mb-2">Product Specifications</h4>
              <p className="text-muted-foreground text-sm">
                This exquisite piece features premium lab-grown diamonds with
                exceptional clarity and brilliance. Crafted with precision in
                your choice of metals, ensuring durability and timeless
                elegance.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Care Instructions</h4>
              <p className="text-muted-foreground text-sm">
                Clean gently with a soft brush and mild soap solution. Store in
                a dry place away from other jewelry to prevent scratching. Avoid
                exposure to harsh chemicals and extreme temperatures.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Warranty & Returns</h4>
              <p className="text-muted-foreground text-sm">
                Comes with a lifetime warranty against manufacturing defects.
                15-day hassle-free returns policy. Free resizing within the
                first 30 days of purchase.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
