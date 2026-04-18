import { useMemo, useState } from 'react';
import { Button, Card } from '@heroui/react';
import { getStorageInterfaceLabel, getStorageTypeLabel } from './AddStorage';

const SOFTWARE_TYPE_LABELS: Record<string, string> = {
  DOCKER_CONTAINER: 'Docker Container',
  VM: 'VM',
  POD: 'Pod',
  BARE_METAL_SERVICE: 'Bare Metal',
  OTHER: 'Other'
};

const getSoftwareTypeLabel = (type: unknown) => {
  const normalized = String(type || 'OTHER').toUpperCase();
  return SOFTWARE_TYPE_LABELS[normalized] || 'Other';
};

const toNavigableUrl = (value: unknown) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `http://${raw}`;
};

const toIpPortUrl = (ip: unknown, port: unknown) => {
  const normalizedIp = String(ip || '').trim();
  if (!normalizedIp) return null;

  const portNumber = Number(port);
  if (Number.isFinite(portNumber) && portNumber > 0) {
    return `http://${normalizedIp}:${portNumber}`;
  }

  return `http://${normalizedIp}`;
};

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
  const [serviceSortDirection, setServiceSortDirection] = useState<'asc' | 'desc'>('asc');
  const [storageSortDirection, setStorageSortDirection] = useState<'asc' | 'desc'>('asc');
  const [markdownSortDirection, setMarkdownSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedDeployments = useMemo(() => {
    return [...selectedDeployments].sort((a, b) => {
      const nameA = String(a?.softwareUnit?.name || '').toLowerCase();
      const nameB = String(b?.softwareUnit?.name || '').toLowerCase();
      const result = nameA.localeCompare(nameB);
      return serviceSortDirection === 'asc' ? result : -result;
    });
  }, [selectedDeployments, serviceSortDirection]);

  const sortedStorage = useMemo(() => {
    return [...selectedStorage].sort((a, b) => {
      const nameA = String(a?.name || '').toLowerCase();
      const nameB = String(b?.name || '').toLowerCase();
      const result = nameA.localeCompare(nameB);
      return storageSortDirection === 'asc' ? result : -result;
    });
  }, [selectedStorage, storageSortDirection]);

  const sortedRootVisibleDocs = useMemo(() => {
    return [...rootVisibleDocs].sort((a, b) => {
      const titleA = String(a?.title || '').toLowerCase();
      const titleB = String(b?.title || '').toLowerCase();
      const result = titleA.localeCompare(titleB);
      return markdownSortDirection === 'asc' ? result : -result;
    });
  }, [rootVisibleDocs, markdownSortDirection]);

  const renderDocNode = (doc: any, depth = 0): React.ReactNode => {
    const children = getDocChildren(doc.id);
    const childCount = children.length;
    const orderedChildren = markdownSortDirection === 'asc' ? children : [...children].reverse();
    const docTags = [
      doc.softwareUnit?.name ? `Service: ${String(doc.softwareUnit.name)}` : null,
      doc.hardwareAsset?.name ? `Hardware: ${String(doc.hardwareAsset.name)}` : null,
      childCount > 0 ? `${childCount} ${childCount === 1 ? 'child' : 'children'}` : null
    ].filter(Boolean) as string[];

    return (
      <div key={doc.id} className={`${depth > 0 ? 'ml-5 border-l border-slate-700/50' : ''}`}>
  <div className="px-4 py-2.5 flex items-start justify-between gap-3 hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] transition-colors">
          <button
            type="button"
            onClick={() => onOpenDocPreview(doc)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="font-medium text-text truncate">{doc.title}</p>
            {docTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {docTags.map((tag) => (
                  <span key={`${doc.id}-${tag}`} className="text-[11px] border border-slate-700/60 bg-slate-800/70 text-slate-300 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
          <Button
            type="button"
            onClick={() => onEditDoc(doc)}
            className="text-xs text-purple-400 hover:text-purple-400/80 !border-0 !border-transparent !ring-0 !shadow-none"
            variant="ghost"
          >
            Edit
          </Button>
        </div>

        {orderedChildren.map(child => renderDocNode(child, depth + 1))}
      </div>
    );
  };

  return (
  <div className="theme-scrollbar xl:col-span-8 min-h-0 overflow-y-auto pr-2">
      <div className="space-y-6">
        {!selectedHardware && (
          <Card className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-slate-400">
            Select hardware on the left or create a new one.
          </Card>
        )}

        {selectedHardware && (
          <>
            <Card className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedHardware.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{selectedHardware.type} • {selectedHardware.status}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => onEditHardware(selectedHardware)}
                  className="text-xs text-purple-400 hover:text-purple-400/80 !border-0 !border-transparent !ring-0 !shadow-none"
                  variant="ghost"
                >
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <p className="text-slate-400">Hostname: <span className="text-slate-100">{selectedHardware.hostname || '-'}</span></p>
                <p className="text-slate-400">Make: <span className="text-slate-100">{selectedHardware.make || '-'}</span></p>
                <p className="text-slate-400">Model: <span className="text-slate-100">{selectedHardware.model || '-'}</span></p>
                <p className="text-slate-400">CPU: <span className="text-slate-100">{selectedHardware.cpu || '-'}</span></p>
                <p className="text-slate-400">CPU Cores: <span className="text-slate-100">{selectedHardware.cpuCores ?? '-'}</span></p>
                <p className="text-slate-400">IP: <span className="text-slate-100">{selectedHardware.ip || '-'}</span></p>
                <p className="text-slate-400">OS: <span className="text-slate-100">{selectedHardware.os || '-'}</span></p>
                <p className="text-slate-400">RAM: <span className="text-slate-100">{selectedHardware.ram ? `${selectedHardware.ram} GB` : '-'}</span></p>
                <p className="text-slate-400">Serial: <span className="text-slate-100">{selectedHardware.serialNumber || '-'}</span></p>
                <p className="text-slate-400">Location: <span className="text-slate-100">{selectedHardware.location || '-'}</span></p>
              </div>
              {selectedHardware.notes && <p className="mt-4 text-sm text-slate-400 whitespace-pre-wrap">{selectedHardware.notes}</p>}
            </Card>

            <Card className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-100">Services</h4>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setServiceSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="text-xs px-2.5 py-1.5"
                    variant="ghost"
                  >
                    {serviceSortDirection === 'asc' ? 'A-Z' : 'Z-A'}
                  </Button>
                  <Button onClick={onAddDeployment} className="text-sm px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)] transition-all" variant="primary">+ Add service</Button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {sortedDeployments.length === 0 && <p className="p-4 text-sm text-slate-400">No services assigned.</p>}
                {sortedDeployments.map(dep => (
                  <div key={dep.id} className="px-4 py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-100">{dep.softwareUnit?.name || 'Unknown service'}</p>
                      {(() => {
                        const domainDisplay = String(dep.softwareUnit?.url || '').trim();
                        const ipDisplay = String(dep.internalIp || '').trim();
                        const portDisplay = dep.softwareUnit?.port ? String(dep.softwareUnit.port) : '';
                        const serviceUrl = toNavigableUrl(dep.softwareUnit?.url);
                        const ipUrl = toIpPortUrl(dep.internalIp, dep.softwareUnit?.port);
                        const serviceMeta = [
                          dep.softwareUnit?.type ? getSoftwareTypeLabel(dep.softwareUnit?.type) : null
                        ].filter(Boolean) as string[];

                        const serviceLinks = [
                          serviceUrl
                            ? {
                                label: domainDisplay,
                                href: serviceUrl
                              }
                            : null,
                          ipUrl
                            ? {
                                label: portDisplay ? `${ipDisplay}:${portDisplay}` : ipDisplay,
                                href: ipUrl
                              }
                            : null
                        ].filter(Boolean) as Array<{ label: string; href: string }>;

                        if (serviceMeta.length === 0 && serviceLinks.length === 0) return null;

                        return (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {serviceMeta.map((meta) => (
                              <span key={`${dep.id}-${meta}`} className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/70 px-2 py-0.5 text-[11px] text-slate-300">
                                {meta}
                              </span>
                            ))}
                            {serviceLinks.map((link) => (
                              <a
                                key={`${dep.id}-${link.href}`}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/12 px-2 py-0.5 text-[11px] text-blue-300 hover:bg-blue-500/20"
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <Button
                      type="button"
                      onClick={() => onEditDeployment(dep)}
                      className="text-xs text-purple-400 hover:text-purple-400/80 !border-0 !border-transparent !ring-0 !shadow-none"
                      variant="ghost"
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-100">Storage</h4>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setStorageSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="text-xs px-2.5 py-1.5"
                    variant="ghost"
                  >
                    {storageSortDirection === 'asc' ? 'A-Z' : 'Z-A'}
                  </Button>
                  <Button onClick={onAddStorage} className="text-sm px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)] transition-all" variant="primary">+ Add storage</Button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {sortedStorage.length === 0 && <p className="p-4 text-sm text-slate-400">No storage assigned.</p>}
                {sortedStorage.map(item => (
                  <div key={item.id} className="px-4 py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-100">{item.name}</p>
                      {(() => {
                        const modelLabel = [item.make, item.model].filter(Boolean).join(' ');
                        const storageMeta = [
                          item.storageType ? getStorageTypeLabel(String(item.storageType)) : null,
                          item.usableSpaceGB != null ? displaySpace(item.usableSpaceGB) : null,
                          modelLabel || null,
                          item.interface ? getStorageInterfaceLabel(String(item.interface)) : null,
                          item.serialNumber ? `S/N ${String(item.serialNumber)}` : null
                        ].filter(Boolean) as string[];

                        if (storageMeta.length === 0) return null;

                        return (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {storageMeta.map((meta) => (
                              <span key={`${item.id}-${meta}`} className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/70 px-2 py-0.5 text-[11px] text-slate-300">
                                {meta}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <Button
                      type="button"
                      onClick={() => onEditStorage(item)}
                      className="text-xs text-purple-400 hover:text-purple-400/80 !border-0 !border-transparent !ring-0 !shadow-none"
                      variant="ghost"
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-100">Markdown Documents</h4>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setMarkdownSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="text-xs px-2.5 py-1.5"
                    variant="ghost"
                  >
                    {markdownSortDirection === 'asc' ? 'A-Z' : 'Z-A'}
                  </Button>
                  <Button onClick={onAddDoc} className="text-sm px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)] transition-all" variant="primary">+ Add markdown</Button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {visibleDocs.length === 0 && <p className="p-4 text-sm text-slate-400">No documents linked to this hardware or its services.</p>}
                {sortedRootVisibleDocs.map(doc => renderDocNode(doc))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
