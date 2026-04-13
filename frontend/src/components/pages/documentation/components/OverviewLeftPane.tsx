import { Button, Card } from '@heroui/react';

type OverviewLeftPaneProps = {
  hardware: any[];
  selectedHardwareId: string;
  onSelectHardware: (hardwareId: string) => void;
  onAddHardware: () => void;
};

export default function OverviewLeftPane({
  hardware,
  selectedHardwareId,
  onSelectHardware,
  onAddHardware
}: OverviewLeftPaneProps) {
  const isSelectedHardware = (hardwareId: unknown) => String(hardwareId) === selectedHardwareId;

  return (
    <Card className="xl:col-span-4 rounded-xl border border-slate-700/50 bg-slate-900/50 p-0 overflow-hidden h-full min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-400">Hardware Nodes</span>
        <Button onClick={onAddHardware} className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168, 85, 247, 0.5)] transition-all" variant="primary">+ Add hardware</Button>
      </div>
      <div className="divide-y divide-border overflow-y-auto min-h-0">
        {hardware.length === 0 && <p className="p-4 text-slate-400">No hardware found.</p>}
        {hardware.map(hw => (
          <Button
            key={hw.id}
            onClick={() => onSelectHardware(String(hw.id))}
            className={`relative w-full text-left pl-5 pr-4 py-3 transition-all !border-0 !border-transparent !ring-0 ${isSelectedHardware(hw.id) ? 'bg-purple-600/20 shadow-md' : 'hover:bg-slate-800/60 !shadow-none'}`}
            variant="ghost"
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 h-full w-1 ${isSelectedHardware(hw.id) ? 'bg-purple-600' : 'bg-border'}`}
            />
            <div>
              <div>
                <p className={`font-medium ${isSelectedHardware(hw.id) ? 'text-purple-400' : 'text-text'}`}>{hw.name}</p>
                <p className="text-xs text-slate-400">{hw.type} • {hw.status}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}
