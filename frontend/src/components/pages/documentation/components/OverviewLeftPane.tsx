import { Button, Card, Input } from '@heroui/react';

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
  const isSelectedHardware = (hardwareId: unknown) => String(hardwareId) === selectedHardwareId;

  return (
    <Card className="xl:col-span-4 rounded-xl border border-slate-700/50 bg-slate-900/50 p-0 overflow-hidden h-full min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-400">Hardware Nodes</span>
          <Button onClick={onAddHardware} className="text-sm px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)] transition-all" variant="primary">+ Add hardware</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, host, IP"
            className="w-full"
          />
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700/50 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          >
            <option value="ALL">All types</option>
            {hardwareTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="divide-y divide-border overflow-y-auto min-h-0">
        {hardware.length === 0 && <p className="p-4 text-slate-400">No hardware found.</p>}
        {hardware.map(hw => (
          <Button
            key={hw.id}
            onClick={() => onSelectHardware(String(hw.id))}
            className={`relative w-full text-left pl-5 pr-4 py-3 transition-all !border-0 !border-transparent !ring-0 ${isSelectedHardware(hw.id)
              ? 'bg-[color-mix(in_srgb,var(--color-primary)_24%,var(--color-content))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary)_46%,transparent)]'
              : 'hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] !shadow-none'}`}
            variant="ghost"
          >
            <div>
              <div>
                <p className={`font-medium ${isSelectedHardware(hw.id) ? 'text-text' : 'text-text'}`}>{hw.name}</p>
                <p className="text-xs text-slate-400">{hw.type} • {hw.status}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}
