import * as React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Sun, Moon } from "lucide-react";

export const ThemeComparison: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Theme Comparison</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Light Mode Preview */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-foreground">Light Mode</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-[#F8FAFC]" />
              <div className="h-2 w-full rounded bg-[#FFFFFF]" />
              <div className="h-2 w-full rounded bg-[#F1F5F9]" />
              <div className="h-2 w-3/4 rounded bg-[#DC2626]" />
            </div>
            <p className="text-xs text-muted-foreground">
              Clean, bright, professional
            </p>
          </div>
        </Card>

        {/* Dark Mode Preview */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-accent-2" />
              <span className="text-sm font-semibold text-foreground">Dark Mode</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-[#09090B]" />
              <div className="h-2 w-full rounded bg-[#111827]" />
              <div className="h-2 w-full rounded bg-[#18181B]" />
              <div className="h-2 w-3/4 rounded bg-[#DC2626]" />
            </div>
            <p className="text-xs text-muted-foreground">
              Bold, immersive, premium
            </p>
          </div>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/20 dark:to-accent/10 border-primary/20">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Design Principles</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Shared brand identity across both themes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Consistent layout and hierarchy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Optimized contrast and readability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Smooth theme transitions (300ms)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>LocalStorage persistence</span>
            </li>
          </ul>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Theme Tokens</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Semantic</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Background</span>
                  <Badge variant="outline" className="text-xs">var</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Surface</span>
                  <Badge variant="outline" className="text-xs">var</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Foreground</span>
                  <Badge variant="outline" className="text-xs">var</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Brand</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary</span>
                  <Badge variant="default" className="text-xs">#DC2626</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accent</span>
                  <Badge className="text-xs bg-accent text-accent-foreground">#EAB308</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success</span>
                  <Badge variant="success" className="text-xs">#16A34A</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
