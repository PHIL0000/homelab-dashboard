import React, { useRef, useState, useEffect } from "react";
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

  isActive,
  getNavItemClass,
}) => {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const handleCollapsedClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setFlyoutTop(rect.top);
    }
    setFlyoutOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!flyoutOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setFlyoutOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [flyoutOpen]);

  useEffect(() => {
    if (!isCollapsed) setFlyoutOpen(false);
  }, [isCollapsed]);

  if (items.length === 0) return null;

  const hasActiveChild = items.some((i) => isActive(i.path));

  return (
    <div className={`relative ${containerClassName ?? ""}`}>
      {isCollapsed ? (
        <button
          ref={buttonRef}
          onClick={handleCollapsedClick}
          title={groupLabel}
          className={`relative flex items-center justify-center w-full px-3 py-2.5 rounded-lg mb-1.5 transition-all ${
            hasActiveChild
              ? "text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]"
              : "text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
          }`}
        >
          <GroupIcon size={20} className="shrink-0" />
          <span className="absolute top-1.5 right-1.5 text-[var(--color-textSecondary)]">
            <ChevronDown
              size={8}
              className={`transition-transform duration-200 ${
                flyoutOpen ? "rotate-180" : "-rotate-90"
              }`}
            />
          </span>
        </button>
      ) : (
        <Button
          onPress={onToggleOpen}
          variant="ghost"
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mb-1.5 justify-start transition-all ${
            hasActiveChild
              ? "text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]"
              : "text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
          }`}
        >
          <GroupIcon size={20} className="shrink-0" />
          <span className="font-medium text-sm flex-1 text-left whitespace-nowrap">
            {groupLabel}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      )}

      {/* Expanded Dropdown */}
      {isOpen && !isCollapsed && (
        <div className="ml-3 pl-3 border-l border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] mb-1.5">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all text-sm ${getNavItemClass(isActive(item.path))}`}
            >
              <item.icon size={16} className="shrink-0" />
              <span className="font-medium whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Collapsed Flyout */}
      {flyoutOpen && isCollapsed && (
        <div
          ref={flyoutRef}
          style={{
            top: flyoutTop,
            backgroundColor: "var(--color-background, #13111a)",
          }}
          className="fixed left-20 z-50 min-w-[180px] py-1 rounded-lg border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] shadow-xl"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-textSecondary)]">
            {groupLabel}
          </div>
          <div className="h-px bg-[color-mix(in_srgb,var(--color-border)_72%,transparent)] mx-2 mb-1" />
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setFlyoutOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 transition-all text-sm ${getNavItemClass(isActive(item.path))}`}
            >
              <item.icon size={16} className="shrink-0" />
              <span className="font-medium whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavGroupSection;
