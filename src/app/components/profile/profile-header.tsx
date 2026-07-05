import * as React from "react";
import { SportsAvatar } from "../ui/sports-avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Edit, Calendar } from "lucide-react";
import { Card } from "../ui/card";

export interface ProfileData {
  name: string;
  email: string;
  role: "athlete" | "coach" | "support";
  avatar?: string;
  isActive: boolean;
  sports: string[];
  joinDate: string;
}

interface ProfileHeaderProps {
  profile: ProfileData;
  onEdit?: () => void;
  canEdit?: boolean;
}

const roleLabels = {
  athlete: "Atlet",
  coach: "Pelatih",
  support: "Tenaga Pendukung"
};

const roleColors = {
  athlete: "primary" as const,
  coach: "accent-2" as const,
  support: "success" as const
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEdit,
  canEdit = true,
}) => {
  return (
    <Card glow className="bg-gradient-to-br from-primary/5 via-surface to-surface border-primary/20">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar */}
        <div className="relative">
          <SportsAvatar
            src={profile.avatar}
            fallback={profile.name.substring(0, 2).toUpperCase()}
            size="2xl"
            className="ring-4 ring-surface shadow-lg"
          />
          {profile.isActive && (
            <div className="absolute bottom-1 right-1 h-5 w-5 bg-success rounded-full border-4 border-surface" />
          )}
        </div>

        {/* Name & Role */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant={roleColors[profile.role]}>
              {roleLabels[profile.role]}
            </Badge>
            {profile.isActive && <Badge variant="success">Aktif</Badge>}
          </div>
        </div>

        {/* Sports */}
        {profile.sports.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {profile.sports.map((sport, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {sport}
              </Badge>
            ))}
          </div>
        )}

        {/* Join Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Bergabung {profile.joinDate}</span>
        </div>

        {/* Edit Button */}
        {canEdit && onEdit && (
          <Button onClick={onEdit} variant="outline" className="w-full">
            <Edit className="h-4 w-4" />
            Edit Profil
          </Button>
        )}
      </div>
    </Card>
  );
};
