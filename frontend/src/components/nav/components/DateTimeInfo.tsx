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
  isCollapsed?: boolean;
}

const DateTimeInfo: React.FC<DateTimeInfoProps> = ({
  timezone,
  timeFormat,
  dateFormat,
  isCollapsed,
}) => {
  const [now, setNow] = useState(() => new Date());

  const userTimezone = timezone || "Europe/Berlin";
  const userTimeFormat = timeFormat === "12h" ? "12h" : "24h";
  const userDateFormat = dateFormat || "DD-MM-YYYY";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatDate = (date: Date, short = false) => {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: userTimezone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).formatToParts(date);

      const day = parts.find((p) => p.type === "day")?.value || "";
      const month = parts.find((p) => p.type === "month")?.value || "";
      const year = parts.find((p) => p.type === "year")?.value || "";

      if (short) {
        switch (userDateFormat) {
          case "MM-DD-YYYY":
            return `${month}-${day}`;
          case "YYYY-MM-DD":
            return `${month}-${day}`;
          case "DD.MM.YYYY":
            return `${day}.${month}`;
          default:
            return `${day}-${month}`;
        }
      }

      switch (userDateFormat) {
        case "MM-DD-YYYY":
          return `${month}-${day}-${year}`;
        case "YYYY-MM-DD":
          return `${year}-${month}-${day}`;
        case "DD.MM.YYYY":
          return `${day}.${month}.${year}`;
        default:
          return `${day}-${month}-${year}`;
      }
    } catch {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date, short = false) => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: userTimezone,
        hour: "2-digit",
        minute: "2-digit",
        ...(short ? {} : { second: "2-digit" }),
        hour12: userTimeFormat === "12h",
      }).format(date);
    } catch {
      return date.toLocaleTimeString();
    }
  };

  const currentTime = useMemo(
    () => formatTime(now, isCollapsed),
    [now, isCollapsed],
  );
  const currentDate = useMemo(
    () => formatDate(now, isCollapsed),
    [now, isCollapsed],
  );

  return (
    <div className="flex flex-col items-center w-full min-w-0">
      <p className="text-sm font-semibold text-[var(--color-text)] tabular-nums break-words w-full text-center">
        {currentTime}
      </p>
      <p className="text-[10px] text-[var(--color-textSecondary)] break-words w-full text-center">
        {currentDate}
      </p>
    </div>
  );
};

export default DateTimeInfo;
