import { Button, Card, Input, Select, ListBox } from '@heroui/react';
import { ChevronDown } from 'lucide-react';

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
