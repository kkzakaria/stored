import { Badge } from "@/components/ui/badge";
import { getUserStatusInfo } from "@/lib/utils/user";

interface UserStatusBadgeProps {
  active: boolean;
}

export function UserStatusBadge({ active }: UserStatusBadgeProps) {
  const statusInfo = getUserStatusInfo(active);

  return (
    <Badge variant={statusInfo.variant} className={statusInfo.color}>
      {statusInfo.label}
    </Badge>
  );
}
