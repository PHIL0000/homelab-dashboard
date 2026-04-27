import React from "react";
import { Button } from "@heroui/react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface NavGroupItem {
  label: string;
  path: string;
  icon: IconComponent;
}

interface NavGroupSectionProps {
  containerClassName?: string;
  items: NavGroupItem[];
  groupLabel: string;
  groupIcon: IconComponent;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onExpandFromCollapsed: () => void;
  isActive: (path: string) => boolean;
  getNavItemClass: (active: boolean) => string;
}

const NavGroupSection: React.FC<NavGroupSectionProps> = ({
  containerClassName,
  items,
  groupLabel,
  groupIcon: GroupIcon,
  isCollapsed,
  isOpen,
  onToggleOpen,
  onExpandFromCollapsed,
  isActive,
  getNavItemClass,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName || "mb-1.5"}>
      {isCollapsed ? (
        <Button
          onClick={onExpandFromCollapsed}
          aria-label={groupLabel}
          isIconOnly
          variant="ghost"
          className="w-full rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
        >
          <GroupIcon size={20} />
        </Button>
      ) : (
        <Button
          onClick={onToggleOpen}
          className="w-full justify-between rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
          variant="ghost"
        >
          <div className="flex items-center gap-3">
            <GroupIcon size={20} />
            <span className="font-medium">{groupLabel}</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      )}

      {isOpen && !isCollapsed && (
        <div className="ml-4 mt-2 space-y-1 border-l border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] pl-3">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${getNavItemClass(isActive(item.path))}`}
            >
              <item.icon size={16} className="shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavGroupSection;
