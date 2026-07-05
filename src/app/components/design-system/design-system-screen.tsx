import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { SportsAvatar } from "../ui/sports-avatar";
import { StatCard } from "../dashboard/stat-card";
import { ThemeToggle } from "../ui/theme-toggle";
import { ThemeComparison } from "./theme-comparison";
import { useTheme } from "../../lib/theme-context";
import { Activity, Heart, Trophy, TrendingUp, Award, ArrowLeft, MapPin, ListFilter } from "lucide-react";
import { OptionsMasterDataPicker } from "../ui/options-master-data-picker";
import { KecamatanKelurahanPicker } from "../ui/kecamatan-kelurahan-picker";
import type { MasterDataOption } from "../ui/master-data-picker";
import type { CascadeLevel } from "../ui/cascade-picker";

interface DesignSystemScreenProps {
  onBack?: () => void;
}

export const DesignSystemScreen: React.FC<DesignSystemScreenProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [tingkatPickerOpen, setTingkatPickerOpen] = React.useState(false);
  const [wilayahPickerOpen, setWilayahPickerOpen] = React.useState(false);
  const [selectedTingkat, setSelectedTingkat] = React.useState<MasterDataOption | null>(null);
  const [selectedWilayah, setSelectedWilayah] = React.useState<{
    kecamatan?: CascadeLevel;
    kelurahan?: CascadeLevel;
  }>({});

  return (
    <div className="min-h-screen bg-background pb-8 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="px-6 py-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Kembali</span>
            </button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Design System</h2>
              <p className="text-sm text-muted-foreground">Aidara Mobile PWA - Dual Theme</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Theme Info */}
        <Card className={theme === "dark"
          ? "bg-gradient-to-br from-primary/20 via-surface to-surface border-primary/30"
          : "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
        }>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </h3>
              <Badge variant={theme === "dark" ? "physical" : "success"}>
                {theme === "dark" ? "Dark" : "Light"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {theme === "dark"
                ? "Premium dark sports dashboard dengan bold colors, soft glow effects, dan high contrast. Optimized untuk immersive experience."
                : "Clean, modern sports performance dashboard dengan subtle elevation, thin borders, dan soft shadows. Optimized untuk readability dan premium feel."
              }
            </p>
          </div>
        </Card>
        {/* Theme Comparison */}
        <section className="space-y-4">
          <ThemeComparison />
        </section>

        {/* Colors */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Color Palette</h3>

          <Card>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Background:</span>
                <span className="font-mono text-foreground">{theme === "dark" ? "#09090B" : "#F8FAFC"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Surface:</span>
                <span className="font-mono text-foreground">{theme === "dark" ? "#111827" : "#FFFFFF"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Text Primary:</span>
                <span className="font-mono text-foreground">{theme === "dark" ? "#FFFFFF" : "#0F172A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Text Secondary:</span>
                <span className="font-mono text-muted-foreground">{theme === "dark" ? "#A1A1AA" : "#64748B"}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground">Current Theme:</span>
                <ThemeToggle variant="button" />
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Primary & Accent</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="h-16 w-full rounded-xl bg-primary border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full rounded-xl bg-accent border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 w-full rounded-xl bg-accent-2 border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Accent 2</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Status Colors</p>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-success border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-warning border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Warning</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-error border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Error</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-surface-2 border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Surface</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Sport Categories</p>
            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-sport-physical border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Physical</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-sport-strategy border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Strategy</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-sport-technique border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Technique</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-sport-mental border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Mental</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-sport-recovery border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground">Recovery</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Typography</h3>
          <Card>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Heading 1 - 30px Bold</h1>
              <h2 className="text-2xl font-semibold">Heading 2 - 24px Semibold</h2>
              <h3 className="text-lg font-semibold">Heading 3 - 18px Semibold</h3>
              <p className="text-base">Body Text - 16px Regular</p>
              <p className="text-sm text-muted-foreground">Caption - 14px Regular</p>
              <p className="text-4xl font-bold">Metric - 40px Bold</p>
            </div>
          </Card>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Buttons</h3>
          <Card>
            <div className="space-y-3">
              <Button variant="primary" className="w-full">Primary Button</Button>
              <Button variant="secondary" className="w-full">Secondary Button</Button>
              <Button variant="outline" className="w-full">Outline Button</Button>
              <Button variant="destructive" className="w-full">Destructive Button</Button>
              <Button variant="ghost" className="w-full">Ghost Button</Button>
              <div className="flex gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
              <Button loading className="w-full">Loading State</Button>
            </div>
          </Card>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Inputs</h3>
          <Card>
            <div className="space-y-3">
              <Input placeholder="Default Input" />
              <Input placeholder="With Label" type="email" label="Email" />
              <Input placeholder="Disabled" disabled />
              <Input placeholder="Error State" error />
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Badges</h3>
          <Card>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="physical">Physical</Badge>
              <Badge variant="strategy">Strategy</Badge>
              <Badge variant="technique">Technique</Badge>
              <Badge variant="mental">Mental</Badge>
              <Badge variant="recovery">Recovery</Badge>
              <Badge variant="gold">Gold</Badge>
              <Badge variant="silver">Silver</Badge>
              <Badge variant="bronze">Bronze</Badge>
            </div>
          </Card>
        </section>

        {/* Avatars */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Avatars</h3>
          <Card>
            <div className="flex items-center gap-4">
              <SportsAvatar fallback="XS" size="sm" />
              <SportsAvatar fallback="SM" size="md" />
              <SportsAvatar fallback="MD" size="lg" />
              <SportsAvatar fallback="LG" size="xl" />
            </div>
          </Card>
        </section>

        {/* Stat Cards */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Stat Cards</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Performance"
              value="95"
              trend="up"
              trendValue="+12%"
              icon={<Activity className="h-8 w-8 text-primary" />}
              variant="primary"
            />
            <StatCard
              label="Recovery"
              value="8.5"
              trend="stable"
              icon={<Heart className="h-8 w-8 text-success" />}
              variant="success"
            />
            <StatCard
              label="Training"
              value="24"
              trend="up"
              trendValue="+3"
              icon={<Trophy className="h-8 w-8 text-accent" />}
              variant="accent"
            />
            <StatCard
              label="Readiness"
              value="88%"
              trend="down"
              trendValue="-2%"
              icon={<Award className="h-8 w-8" />}
            />
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Cards</h3>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a card with header, title, and content.
              </p>
            </CardContent>
          </Card>
          <Card glow>
            <CardContent>
              <p className="text-sm text-foreground">Card with glow effect</p>
            </CardContent>
          </Card>
          <Card variant="surface-2">
            <CardContent>
              <p className="text-sm text-foreground">Card with surface-2 variant</p>
            </CardContent>
          </Card>
        </section>

        {/* Spacing */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Spacing System (8pt)</h3>
          <Card>
            <div className="space-y-2">
              <div className="h-1 w-8 bg-primary rounded" />
              <p className="text-xs text-muted-foreground">4px (0.5 unit)</p>
              <div className="h-2 w-16 bg-primary rounded" />
              <p className="text-xs text-muted-foreground">8px (1 unit)</p>
              <div className="h-3 w-24 bg-primary rounded" />
              <p className="text-xs text-muted-foreground">12px (1.5 units)</p>
              <div className="h-4 w-32 bg-primary rounded" />
              <p className="text-xs text-muted-foreground">16px (2 units)</p>
              <div className="h-5 w-40 bg-primary rounded" />
              <p className="text-xs text-muted-foreground">20px (2.5 units)</p>
              <div className="h-6 w-48 bg-primary rounded" />
              <p className="text-xs text-muted-foreground">24px (3 units)</p>
              <div className="h-8 w-56 bg-primary rounded" />
              <p className="text-xs text-muted-foreground">32px (4 units)</p>
            </div>
          </Card>
        </section>

        {/* Border Radius */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Border Radius</h3>
          <Card>
            <div className="space-y-4">
              <div>
                <div className="h-16 w-full rounded-lg bg-surface-2 border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground mt-2">Button (16px)</p>
              </div>
              <div>
                <div className="h-16 w-full rounded-card bg-surface-2 border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground mt-2">Card (28px)</p>
              </div>
              <div>
                <div className="h-16 w-16 rounded-full bg-surface-2 border border-border shadow-sm" />
                <p className="text-xs text-center text-muted-foreground mt-2">Pill (full)</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Options Pickers (API) */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Options Pickers (API)</h3>
          <Card>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setTingkatPickerOpen(true)}
              >
                <ListFilter className="h-4 w-4 mr-2" />
                {selectedTingkat ? selectedTingkat.label : "Pilih Tingkat Prestasi"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setWilayahPickerOpen(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {selectedWilayah.kecamatan && selectedWilayah.kelurahan
                  ? `${selectedWilayah.kecamatan.label}, ${selectedWilayah.kelurahan.label}`
                  : "Pilih Kecamatan & Kelurahan"}
              </Button>
            </div>
          </Card>
        </section>
      </div>

      <OptionsMasterDataPicker
        open={tingkatPickerOpen}
        onOpenChange={setTingkatPickerOpen}
        optionKey="tingkat"
        selectedId={selectedTingkat?.id}
        onSelect={setSelectedTingkat}
      />

      <KecamatanKelurahanPicker
        open={wilayahPickerOpen}
        onOpenChange={setWilayahPickerOpen}
        selected={selectedWilayah}
        onSelect={(kecamatan, kelurahan) => setSelectedWilayah({ kecamatan, kelurahan })}
      />
    </div>
  );
};
