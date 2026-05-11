import { useMemo, useState } from "react";
import { Button, Card, Input, Select, ListBox } from "@heroui/react";
import { ChevronDown } from "lucide-react";

type OverviewLeftPaneProps = {
  hardware: any[];
  hardwareTypes: string[];
  selectedHardwareId: string;
  onSelectHardware: (hardwareId: string) => void;
  onAddHardware: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
};

export default function OverviewLeftPane({
  hardware,
  hardwareTypes,
  selectedHardwareId,
  onSelectHardware,
  onAddHardware,
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange
}: OverviewLeftPaneProps) {
  const [nameSortDirection, setNameSortDirection] = useState<'asc' | 'desc'>('asc');
  const isSelectedHardware = (hardwareId: unknown) => String(hardwareId) === selectedHardwareId;

  const sortedHardware = useMemo(() => {
    return [...hardware].sort((a, b) => {
      const aName = String(a?.name || '').toLowerCase();
      const bName = String(b?.name || '').toLowerCase();
      const result = aName.localeCompare(bName);
      return nameSortDirection === 'asc' ? result : -result;
    });
  }, [hardware, nameSortDirection]);

  const getStatusBadgeClass = (status: unknown) => {
    const normalized = String(status || 'UNKNOWN').toUpperCase();
    if (normalized === 'ONLINE' || normalized === 'ACTIVE' || normalized === 'RUNNING') {
      return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300';
    }
    if (normalized === 'OFFLINE' || normalized === 'INACTIVE' || normalized === 'STOPPED') {
      return 'border-rose-500/30 bg-rose-500/15 text-rose-300';
    }
    if (normalized === 'MAINTENANCE') {
      return 'border-amber-500/30 bg-amber-500/15 text-amber-300';
    }
    return 'border-slate-600/60 bg-slate-800/70 text-slate-300';
  };

  return (
    <Card className="xl:col-span-4 rounded-xl border border-slate-700/50 bg-slate-900/50 p-0 overflow-hidden h-full min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-sm font-semibold text-slate-400">Hardware Nodes</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{sortedHardware.length} visible</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setNameSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="text-xs px-2.5 py-1.5"
              variant="ghost"
            >
              {nameSortDirection === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
            <Button onClick={onAddHardware} className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all" variant="primary">+ Add hardware</Button>
          </div>
        </div>
        <div className="doc-theme-form grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-2">
          <label className="space-y-1 block">
            <span className="text-xs text-slate-400">Search</span>
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, host, IP"
              className="w-full"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs text-slate-400">Type</span>
            <Select selectedKey={typeFilter} onChange={(key) => { if (key != null) onTypeFilterChange(String(key)); }} className="w-full">
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-slate-400" />
              </Select.Trigger>
              <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox>
                  <ListBox.Item id="ALL" className="pl-2">All types</ListBox.Item>
                  {hardwareTypes.map((type) => (
                    <ListBox.Item key={type} id={type} className="pl-2">{type}</ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </label>
        </div>
      </div>
  <div className="theme-scrollbar divide-y divide-border overflow-y-auto min-h-0 pr-1">
        {sortedHardware.length === 0 && <p className="p-4 text-slate-400">No hardware found.</p>}
        {sortedHardware.map(hw => (
          <Button
            key={hw.id}
            onClick={() => onSelectHardware(String(hw.id))}
            className={`relative w-full !h-auto !min-h-0 !justify-start !items-stretch whitespace-normal text-left pl-4 pr-4 py-2.5 transition-all !border-0 !border-transparent !ring-0 ${isSelectedHardware(hw.id)
              ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,var(--color-content))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary)_46%,transparent)]'
              : 'hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] !shadow-none'}`}
            variant="ghost"
          >
            <div className="space-y-1.5 w-full">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-text truncate">{hw.name}</p>
                <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClass(hw.status)}`}>
                  {String(hw.status || 'UNKNOWN')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/70 px-2 py-0.5 text-slate-300">
                  {String(hw.type || 'OTHER')}
                </span>
                {hw.os && (
                  <span className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/50 px-2 py-0.5 text-slate-400">
                    {String(hw.os)}
                  </span>
                )}
              </div>

              {hw.ip && (
                <p className="text-[11px] text-slate-400 truncate">IP: <span className="text-slate-300 font-mono">{hw.ip}</span></p>
              )}
            </div>

            {isSelectedHardware(hw.id) && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[var(--color-primary)]" />
            )}
          </Button>
        ))}
      </div>
    </Card>
  );
}
