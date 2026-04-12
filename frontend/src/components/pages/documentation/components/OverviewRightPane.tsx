import { Button, Card } from '@heroui/react';

type OverviewRightPaneProps = {
  selectedHardware: any | undefined;
  selectedDeployments: any[];
  selectedStorage: any[];
  visibleDocs: any[];
  rootVisibleDocs: any[];
  displaySpace: (gb: number | undefined | null) => string;
  getDocChildren: (docId: string) => any[];
  onEditHardware: (hardware: any) => void;
  onAddDeployment: () => void;
  onEditDeployment: (deployment: any) => void;
  onAddStorage: () => void;
  onEditStorage: (storageItem: any) => void;
  onAddDoc: () => void;
  onEditDoc: (doc: any) => void;
  onOpenDocPreview: (doc: any) => void;
};

export default function OverviewRightPane({
  selectedHardware,
  selectedDeployments,
  selectedStorage,
  visibleDocs,
  rootVisibleDocs,
  displaySpace,
  getDocChildren,
  onEditHardware,
  onAddDeployment,
  onEditDeployment,
  onAddStorage,
  onEditStorage,
  onAddDoc,
  onEditDoc,
  onOpenDocPreview
}: OverviewRightPaneProps) {
  const renderDocNode = (doc: any, depth = 0): React.ReactNode => {
    const childCount = getDocChildren(doc.id).length;

    return (
      <div key={doc.id} className={`${depth > 0 ? 'ml-5 border-l border-border' : ''}`}>
        <div className="px-4 py-2.5 flex items-start justify-between gap-3 hover:bg-background/50 transition-colors">
          <Button
            type="button"
            onClick={() => onOpenDocPreview(doc)}
            className="min-w-0 flex-1 text-left !border-0 !border-transparent !ring-0 !shadow-none"
            variant="ghost"
          >
            <p className="font-medium text-text truncate">{doc.title}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {doc.softwareUnit?.name && <span className="text-[11px] bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">Service</span>}
              {doc.hardwareAsset?.name && <span className="text-[11px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">Hardware</span>}
              {childCount > 0 && <span className="text-[11px] bg-background border border-border text-text-secondary px-2 py-0.5 rounded-full">{childCount} child</span>}
            </div>
          </Button>
          <Button
            type="button"
            onClick={() => onEditDoc(doc)}
            className="text-xs text-primary hover:text-primary/80 !border-0 !border-transparent !ring-0 !shadow-none"
            variant="ghost"
          >
            Edit
          </Button>
        </div>

        {getDocChildren(doc.id).map(child => renderDocNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="xl:col-span-8 min-h-0 overflow-y-auto pr-1">
      <div className="space-y-6">
        {!selectedHardware && (
          <Card className="rounded-xl border border-border bg-content p-6 text-text-secondary">
            Select hardware on the left or create a new one.
          </Card>
        )}

        {selectedHardware && (
          <>
            <Card className="rounded-xl border border-border bg-content p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-text">{selectedHardware.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">{selectedHardware.type} • {selectedHardware.status}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => onEditHardware(selectedHardware)}
                  className="text-xs text-primary hover:text-primary/80 !border-0 !border-transparent !ring-0 !shadow-none"
                  variant="ghost"
                >
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <p className="text-text-secondary">Hostname: <span className="text-text">{selectedHardware.hostname || '-'}</span></p>
                <p className="text-text-secondary">Make: <span className="text-text">{selectedHardware.make || '-'}</span></p>
                <p className="text-text-secondary">Model: <span className="text-text">{selectedHardware.model || '-'}</span></p>
                <p className="text-text-secondary">CPU: <span className="text-text">{selectedHardware.cpu || '-'}</span></p>
                <p className="text-text-secondary">CPU Cores: <span className="text-text">{selectedHardware.cpuCores ?? '-'}</span></p>
                <p className="text-text-secondary">IP: <span className="text-text">{selectedHardware.ip || '-'}</span></p>
                <p className="text-text-secondary">OS: <span className="text-text">{selectedHardware.os || '-'}</span></p>
                <p className="text-text-secondary">RAM: <span className="text-text">{selectedHardware.ram ? `${selectedHardware.ram} GB` : '-'}</span></p>
                <p className="text-text-secondary">Serial: <span className="text-text">{selectedHardware.serialNumber || '-'}</span></p>
                <p className="text-text-secondary">Location: <span className="text-text">{selectedHardware.location || '-'}</span></p>
              </div>
              {selectedHardware.notes && <p className="mt-4 text-sm text-text-secondary whitespace-pre-wrap">{selectedHardware.notes}</p>}
            </Card>

            <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
                <h4 className="font-semibold text-text">Services on this hardware</h4>
                <Button onClick={onAddDeployment} className="text-sm px-3 py-2 rounded-lg bg-primary text-white font-medium hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all" variant="primary">+ Add service</Button>
              </div>
              <div className="divide-y divide-border">
                {selectedDeployments.length === 0 && <p className="p-4 text-sm text-text-secondary">No services assigned.</p>}
                {selectedDeployments.map(dep => (
                  <div key={dep.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-text">{dep.softwareUnit?.name || 'Unknown service'}</p>
                      <p className="text-xs text-text-secondary">{dep.softwareUnit?.type || '-'} • {dep.internalIp || '-'} • {dep.status || 'UNKNOWN'}</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => onEditDeployment(dep)}
                      className="text-xs text-primary hover:text-primary/80 !border-0 !border-transparent !ring-0 !shadow-none"
                      variant="ghost"
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
                <h4 className="font-semibold text-text">Disks / Storage</h4>
                <Button onClick={onAddStorage} className="text-sm px-3 py-2 rounded-lg bg-primary text-white font-medium hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all" variant="primary">+ Add storage</Button>
              </div>
              <div className="divide-y divide-border">
                {selectedStorage.length === 0 && <p className="p-4 text-sm text-text-secondary">No storage assigned.</p>}
                {selectedStorage.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-text">{item.name}</p>
                      <p className="text-xs text-text-secondary">{item.storageType || '-'} • {displaySpace(item.usableSpaceGB)}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {[item.make, item.model].filter(Boolean).join(' ') || '-'}
                        {item.serialNumber ? ` • S/N ${item.serialNumber}` : ''}
                        {item.interface ? ` • ${item.interface}` : ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => onEditStorage(item)}
                      className="text-xs text-primary hover:text-primary/80 !border-0 !border-transparent !ring-0 !shadow-none"
                      variant="ghost"
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
                <h4 className="font-semibold text-text">Linked markdown documents (hardware + services)</h4>
                <Button onClick={onAddDoc} className="text-sm px-3 py-2 rounded-lg bg-primary text-white font-medium hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all" variant="primary">+ Add markdown</Button>
              </div>
              <div className="divide-y divide-border">
                {visibleDocs.length === 0 && <p className="p-4 text-sm text-text-secondary">No documents linked to this hardware or its services.</p>}
                {rootVisibleDocs.map(doc => renderDocNode(doc))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
