import { useLanguage } from "@/context/LanguageContext";
import type { PageSettingsViewProps } from "../types";
import PageVisibilitySlider from "../components/PageVisibilitySlider";

export default function DocumentationPageSettings(
  props: PageSettingsViewProps,
) {
  const { t } = useLanguage();
  return (
    <PageVisibilitySlider
      title={t("nav.documentation")}
      helper={t("settings.groupToggleHint")}
      {...props}
    />
  );
}
