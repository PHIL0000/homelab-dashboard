import React from "react";
import { Button } from "@heroui/react";
import { Settings } from "lucide-react";

interface SidebarFooterProps {
  isCollapsed: boolean;
  username?: string;
  role?: string;
  avatarUrl?: string;
  accountLabel: string;
  settingsLabel: string;
  onOpenModal: (modal: "settings" | "account") => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isCollapsed,
  username,
  role,
  avatarUrl,
  accountLabel,
  settingsLabel,
  onOpenModal,
}) => {
  const avatarLetter = username ? username.substring(0, 1).toUpperCase() : "U";

  const AvatarDisplay = ({ size }: { size: "sm" | "md" }) => {
    const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-8 h-8 text-xs";
    return avatarUrl ? (
      <img
        src={avatarUrl}
        alt={username}
        className={`${dim} rounded-full object-cover flex-shrink-0`}
      />
    ) : (
      <div
        className={`${dim} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {avatarLetter}
      </div>
    );
  };

  return (
    <div
      className={`sidebar-theme-surface p-3 flex ${isCollapsed ? "flex-col" : "items-center"} gap-2 border-t border-[color-mix(in_srgb,var(--color-border)_72%,transparent)]`}
    >
      <Button
        onClick={() => onOpenModal("account")}
        isIconOnly={isCollapsed}
        variant="ghost"
        className={`${isCollapsed ? "w-full h-10 justify-center" : "flex-1 justify-start"} rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover`}
        aria-label={accountLabel}
      >
        {isCollapsed ? (
          <AvatarDisplay size="sm" />
        ) : (
          <>
            <AvatarDisplay size="sm" />
            <div className="flex-1 min-w-0 text-left pl-2">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">
                {username || "User"}
              </p>
              <p className="text-xs text-[var(--color-textSecondary)] truncate">
                {role === "ADMIN" ? "Administrator" : "User"}
              </p>
            </div>
          </>
        )}
      </Button>

      <Button
        onClick={() => onOpenModal("settings")}
        isIconOnly
        variant="ghost"
        className={`${isCollapsed ? "w-full" : "w-10"} h-10 rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover`}
        aria-label={settingsLabel}
      >
        <Settings size={20} />
      </Button>
    </div>
  );
};

export default SidebarFooter;
