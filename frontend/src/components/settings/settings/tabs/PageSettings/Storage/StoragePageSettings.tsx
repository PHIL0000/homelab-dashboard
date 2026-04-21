import { useLanguage } from "@/context/LanguageContext";
import type { PageSettingsViewProps } from "../types";
import PageVisibilitySlider from "../components/PageVisibilitySlider";

export default function StoragePageSettings(props: PageSettingsViewProps) {
  const { t } = useLanguage();
  return (
    <PageVisibilitySlider
      title={t("nav.storage")}
      helper={t("settings.groupToggleHint")}
      {...props}
    />
  );
}
