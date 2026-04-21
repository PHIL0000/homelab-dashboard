import { Card } from "@heroui/react";

export default function Calendar() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calender</h1>
          <p className="page-subtitle">Manage your appointments and events</p>
        </div>
      </div>

      <div className="page-content-scroll">
        <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100">Calendar</h2>
          <p className="text-slate-400 mt-2">
            Calendar content will appear here
          </p>
        </Card>
      </div>
    </div>
  );
}
