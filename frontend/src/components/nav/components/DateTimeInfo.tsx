import React, { useEffect, useMemo, useState } from "react";

interface DateTimeInfoProps {
  timezone?: string;
  timeFormat?: "12h" | "24h" | string;
  dateFormat?:
    | "DD-MM-YYYY"
    | "MM-DD-YYYY"
    | "YYYY-MM-DD"
    | "DD.MM.YYYY"
    | string;
}

const DateTimeInfo: React.FC<DateTimeInfoProps> = ({
  timezone,
  timeFormat,
  dateFormat,
}) => {
  const [now, setNow] = useState(() => new Date());

  const userTimezone = timezone || "Europe/Berlin";
  const userTimeFormat = timeFormat === "12h" ? "12h" : "24h";
  const userDateFormat = dateFormat || "DD-MM-YYYY";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: userTimezone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).formatToParts(date);

      const day = parts.find((part) => part.type === "day")?.value || "";
      const month = parts.find((part) => part.type === "month")?.value || "";
      const year = parts.find((part) => part.type === "year")?.value || "";

      switch (userDateFormat) {
        case "MM-DD-YYYY":
          return `${month}-${day}-${year}`;
        case "YYYY-MM-DD":
          return `${year}-${month}-${day}`;
        case "DD.MM.YYYY":
          return `${day}.${month}.${year}`;
        case "DD-MM-YYYY":
        default:
          return `${day}-${month}-${year}`;
      }
    } catch {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date) => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: userTimezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: userTimeFormat === "12h",
      }).format(date);
    } catch {
      return date.toLocaleTimeString();
    }
  };

  const currentTime = useMemo(() => `${formatTime(now)}`, [now]);

  const currentDate = useMemo(() => `${formatDate(now)}`, [now]);

  return (
  <div className="flex flex-col items-center w-full min-w-0">
    <p className="text-sm font-semibold text-[var(--color-text)] tabular-nums truncate w-full text-center">
      {currentTime}
    </p>
    <p className="text-[10px] text-[var(--color-textSecondary)] truncate w-full text-center">
      {currentDate}
    </p>
  </div>
);

};

export default DateTimeInfo;
