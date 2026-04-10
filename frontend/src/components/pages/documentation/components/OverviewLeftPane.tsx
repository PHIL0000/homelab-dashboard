import { Card } from '@heroui/react';

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
    <Card className="xl:col-span-4 rounded-xl border border-border bg-content p-0 overflow-hidden h-full min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text-secondary">Hardware Nodes</span>
        <button onClick={onAddHardware} className="text-sm text-primary hover:text-primary/80">+ Add hardware</button>
      </div>
      <div className="divide-y divide-border overflow-y-auto min-h-0">
        {hardware.length === 0 && <p className="p-4 text-text-secondary">No hardware found.</p>}
        {hardware.map(hw => (
          <button
            key={hw.id}
            onClick={() => onSelectHardware(String(hw.id))}
            className={`relative w-full text-left pl-5 pr-4 py-3 transition-all ${isSelectedHardware(hw.id) ? 'bg-primary/20 shadow-md' : 'hover:bg-background/60'}`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 h-full w-1 ${isSelectedHardware(hw.id) ? 'bg-primary' : 'bg-border'}`}
            />
            <div>
              <div>
                <p className={`font-medium ${isSelectedHardware(hw.id) ? 'text-primary' : 'text-text'}`}>{hw.name}</p>
                <p className="text-xs text-text-secondary">{hw.type} • {hw.status}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
