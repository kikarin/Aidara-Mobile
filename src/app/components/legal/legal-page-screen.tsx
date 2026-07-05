import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { LEGAL_PAGES, type LegalPageSlug } from "@/app/lib/legal-content";

interface LegalPageScreenProps {
  slug: LegalPageSlug;
  onBack: () => void;
}

export const LegalPageScreen: React.FC<LegalPageScreenProps> = ({ slug, onBack }) => {
  const content = LEGAL_PAGES[slug];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">{content.title}</h1>
            <p className="text-xs text-muted-foreground truncate">{content.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        <p className="text-xs text-muted-foreground">Diperbarui: {content.updatedAt}</p>

        {content.sections.map((section) => (
          <Card key={section.title} className="p-4 border border-border space-y-2">
            <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
};
