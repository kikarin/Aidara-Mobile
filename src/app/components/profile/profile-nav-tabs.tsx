import * as React from "react";
import { User, Award, Trophy, FileText } from "lucide-react";

type Tab = "biodata" | "sertifikat" | "prestasi" | "dokumen";

interface ProfileNavTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
  { id: "biodata", label: "Biodata", icon: User },
  { id: "sertifikat", label: "Sertifikat", icon: Award },
  { id: "prestasi", label: "Prestasi", icon: Trophy },
  { id: "dokumen", label: "Dokumen", icon: FileText }
];

export const ProfileNavTabs: React.FC<ProfileNavTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide px-6 py-3"
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export type { Tab };
