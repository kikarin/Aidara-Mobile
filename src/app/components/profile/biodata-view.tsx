import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";

interface BiodataField {
  label: string;
  value: string | string[];
}

interface BiodataSection {
  title: string;
  fields: BiodataField[];
}

interface BiodataViewProps {
  sections: BiodataSection[];
  onEdit?: () => void;
  canEdit?: boolean;
}

export const BiodataView: React.FC<BiodataViewProps> = ({
  sections,
  onEdit,
  canEdit = true,
}) => {
  return (
    <div className="space-y-4 pb-6">
      {sections.map((section, idx) => (
        <Card key={idx}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              {canEdit && onEdit && idx === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 px-3"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {section.fields.map((field, fieldIdx) => (
                <div key={fieldIdx} className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {field.label}
                  </label>
                  {Array.isArray(field.value) ? (
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((val, valIdx) => (
                        <Badge key={valIdx} variant="secondary">
                          {val}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground">
                      {field.value || "-"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
