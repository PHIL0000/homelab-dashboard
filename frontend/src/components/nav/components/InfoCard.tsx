import React from "react";
import { Card } from "@heroui/react/card";
import DateTimeInfo from "./DateTimeInfo";
import WeatherInfo from "./WeatherInfo";

interface InfoCardProps {
  timezone?: string;
  timeFormat?: string;
  dateFormat?: string;
  token: string | null;
  isCollapsed?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  timezone,
  timeFormat,
  dateFormat,
  token,
  isCollapsed,
}) => {
  return (
<Card className="w-full px-2.5 py-2 overflow-hidden bg-[color-mix(in_srgb,var(--color-content1)_82%,transparent)] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] shadow-none">
  <div className={`flex ${isCollapsed ? "flex-col items-center gap-2" : "items-center gap-2"} w-full min-w-0`}>

    {/* DateTime — weniger Platz */}
    <div className="shrink-0">
      <DateTimeInfo timezone={timezone} timeFormat={timeFormat} dateFormat={dateFormat} />
    </div>

    {/* Trennlinie */}
    {!isCollapsed && (
      <div className="w-px h-6 bg-[color-mix(in_srgb,var(--color-border)_72%,transparent)] shrink-0" />
    )}

    {/* Weather — bekommt den restlichen Platz */}
    <div className="flex-1 min-w-0">
      <WeatherInfo token={token} />
    </div>

  </div>
</Card>


  );
};

export default InfoCard;
