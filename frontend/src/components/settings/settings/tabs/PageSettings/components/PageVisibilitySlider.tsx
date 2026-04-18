import type { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";

type PageVisibilitySliderProps = {
  title: string;
  visible: boolean;
  disabled: boolean;
  onToggle: () => void;
  helper?: ReactNode;
};

export default function PageVisibilitySlider({
  title,
  visible,
  disabled,
  onToggle,
  helper,
}: PageVisibilitySliderProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
      <span className="sr-only">{title}</span>
      <h3 className="text-base font-semibold text-slate-100">{t("settings.visibility")}</h3>
      <p className="mt-0.5 text-sm text-slate-300">{visible ? t("settings.pageVisible") : t("settings.pageHidden")}</p>
      {helper && <div className="mt-0.5 text-xs text-slate-400">{helper}</div>}
      <label className="mt-2 inline-flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={visible} onChange={onToggle} disabled={disabled} className="sr-only" />
        <span
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            visible ? "bg-[var(--color-primary)]" : "bg-slate-600"
          } ${disabled ? "opacity-60" : ""}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              visible ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
        <span className="text-sm text-slate-200">{visible ? t("settings.hidePage") : t("settings.showPage")}</span>
      </label>
    </div>
  );
}
