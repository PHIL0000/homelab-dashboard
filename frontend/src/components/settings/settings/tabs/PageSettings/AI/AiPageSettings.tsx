import { useLanguage } from "@/context/LanguageContext";
import type { PageSettingsViewProps } from "../types";
import PageVisibilitySlider from "../components/PageVisibilitySlider";

export default function AiPageSettings(props: PageSettingsViewProps) {
  const { t } = useLanguage();
  return (
    <PageVisibilitySlider
      title={t("nav.ai")}
      helper={t("settings.groupToggleHint")}
      {...props}
    />
  );
}
