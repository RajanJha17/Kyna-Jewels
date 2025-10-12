import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import faqData from "@/data/faq.json";

interface FAQSectionProps {
  isOpen: boolean;
}

export default function FAQSection({ isOpen }: FAQSectionProps) {
  const [openFaqItems, setOpenFaqItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleFaqItem = (key: string) => {
    setOpenFaqItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>
        <div className="space-y-4">
          {faqData.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {category.category}
                </h2>
                <div className="space-y-2">
                  {category.questions.map((faq, faqIndex) => {
                    const faqKey = `${categoryIndex}-${faqIndex}`;
                    const isItemOpen = openFaqItems[faqKey];
                    return (
                      <div
                        key={faqIndex}
                        className="border border-border rounded-lg"
                      >
                        <button
                          onClick={() => toggleFaqItem(faqKey)}
                          className={`w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors ${
                            isItemOpen ? "text-white" : ""
                          }`}
                          style={
                            isItemOpen ? { backgroundColor: "#328F94" } : {}
                          }
                        >
                          <span className="font-medium pr-4">
                            {faq.question}
                          </span>
                          <Plus
                            className={`h-4 w-4 flex-shrink-0 transition-transform ${
                              isItemOpen ? "rotate-45" : ""
                            }`}
                          />
                        </button>
                        {isItemOpen && (
                          <div className="px-4 pb-4">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
