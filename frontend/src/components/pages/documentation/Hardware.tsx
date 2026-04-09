import { useEffect, useMemo, useState } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';

const API_BASE = 'http://localhost:3001/api/infrastructure';

const markdownComponents = {
  h1: ({ children }: any) => <h1 className="text-lg font-bold text-text mt-3 mb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold text-text mt-3 mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-semibold text-text mt-2 mb-1">{children}</h3>,
  p: ({ children }: any) => <p className="text-sm text-text-secondary leading-relaxed mb-2">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside pl-2 space-y-1 text-sm text-text-secondary">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside pl-2 space-y-1 text-sm text-text-secondary">{children}</ol>,
  li: ({ children }: any) => <li>{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-text">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-text">{children}</em>,
  code: ({ children }: any) => <code className="px-1.5 py-0.5 rounded bg-background border border-border text-xs text-primary">{children}</code>,
  blockquote: ({ children }: any) => <blockquote className="border-l-2 border-primary pl-3 text-sm text-text-secondary italic my-2">{children}</blockquote>
};

const ensureMarkdownFilename = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return '';
  return normalized.toLowerCase().endsWith('.md') ? normalized : `${normalized}.md`;
};

export default function Hardware() {
  const { token } = useAuth();

  const [hardware, setHardware] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>('');
  const normalizedSelectedHardwareId = selectedHardwareId ? String(selectedHardwareId) : '';

  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [hardwareEditId, setHardwareEditId] = useState<string | null>(null);
  const [deploymentEditId, setDeploymentEditId] = useState<string | null>(null);
  const [storageEditId, setStorageEditId] = useState<string | null>(null);
  const [docEditId, setDocEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('SERVER');
  const [status, setStatus] = useState('ONLINE');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [os, setOs] = useState('');
  const [ip, setIp] = useState('');
  const [mac, setMac] = useState('');
  const [notes, setNotes] = useState('');

  const [softwareUnitId, setSoftwareUnitId] = useState('');
  const [internalIp, setInternalIp] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState('RUNNING');

  const [storageName, setStorageName] = useState('');
  const [storageType, setStorageType] = useState('SSD');
  const [usableSpace, setUsableSpace] = useState<number | ''>('');
  const [spaceUnit, setSpaceUnit] = useState<'GB' | 'TB'>('GB');

  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docHardwareAssetId, setDocHardwareAssetId] = useState('');
  const [docSoftwareUnitId, setDocSoftwareUnitId] = useState('');
  const [docParentDocId, setDocParentDocId] = useState('');
  const [pendingHardwareDelete, setPendingHardwareDelete] = useState<{
    id: string;
    name: string;
    deployments: number;
    services: number;
    storage: number;
    docs: number;
    servicePreview: string[];
    docPreview: string[];
    externalImpact: number;
  } | null>(null);
  const [pendingDocDelete, setPendingDocDelete] = useState<{
    id: string;
    title: string;
    childCount: number;
    childPreview: string[];
  } | null>(null);

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const isSelectedHardware = (hardwareId: unknown) => String(hardwareId) === normalizedSelectedHardwareId;

  const fetchData = async () => {
    if (!token) return;
    try {
      const [hwRes, swRes, depRes, storageRes, docsRes] = await Promise.all([
        fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/deployments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/storage`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/docs`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const hwData = await hwRes.json();
      setHardware(hwData);
      setServices(await swRes.json());
      setDeployments(await depRes.json());
      setStorageItems(await storageRes.json());
      setDocs(await docsRes.json());

      if (!selectedHardwareId && hwData.length > 0) {
        setSelectedHardwareId(String(hwData[0].id));
      }
      if (selectedHardwareId && !hwData.some((hw: any) => isSelectedHardware(hw.id))) {
        setSelectedHardwareId(hwData[0]?.id ? String(hwData[0].id) : '');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const selectedHardware = hardware.find(hw => isSelectedHardware(hw.id));
  const selectedDeployments = deployments.filter(dep => String(dep.hardwareAssetId) === normalizedSelectedHardwareId);
  const selectedStorage = storageItems.filter(item => String(item.hardwareAssetId) === normalizedSelectedHardwareId);
  const selectedDocs = docs.filter(doc => String(doc.hardwareAssetId) === normalizedSelectedHardwareId);
  const selectedServiceIds = new Set(selectedDeployments.map(dep => dep.softwareUnitId).filter(Boolean));
  const selectedServices = services.filter(sw => selectedServiceIds.has(sw.id));
  const selectedServiceDocs = docs.filter(doc => doc.softwareUnitId && selectedServiceIds.has(doc.softwareUnitId));
  const visibleDocs = Array.from(new Map([...selectedDocs, ...selectedServiceDocs].map(doc => [doc.id, doc])).values());
  const visibleDocIds = new Set(visibleDocs.map(doc => doc.id));
  const rootVisibleDocs = visibleDocs.filter(doc => !doc.parentDocId || !visibleDocIds.has(doc.parentDocId));

  const getDocChildren = (docId: string) => visibleDocs.filter(doc => doc.parentDocId === docId);

  const handleAddHardware = () => {
    setHardwareEditId(null);
    setName('');
    setType('SERVER');
    setStatus('ONLINE');
    setCpu('');
    setRam('');
    setOs('');
    setIp('');
    setMac('');
    setNotes('');
    setIsHardwareModalOpen(true);
  };

  const handleEditHardware = (hw: any) => {
    setHardwareEditId(hw.id);
    setName(hw.name || '');
    setType(hw.type || 'SERVER');
    setStatus(hw.status || 'ONLINE');
    setCpu(hw.cpu || '');
    setRam(hw.ram ? hw.ram.toString() : '');
    setOs(hw.os || '');
    setIp(hw.ip || '');
    setMac(hw.mac || '');
    setNotes(hw.notes || '');
    setIsHardwareModalOpen(true);
  };

  const saveHardware = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = hardwareEditId ? `${API_BASE}/hardware/${hardwareEditId}` : `${API_BASE}/hardware`;
    const method = hardwareEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        name,
        type,
        status,
        cpu,
        ram: ram ? parseInt(ram, 10) : null,
        os,
        ip,
        mac,
        notes
      })
    });

    if (response.ok) {
      const saved = await response.json();
      setIsHardwareModalOpen(false);
      await fetchData();
      if (!hardwareEditId) {
        setSelectedHardwareId(String(saved.id));
      }
      return;
    }

    const errorData = await response.json();
    alert(`Error: ${errorData.error || 'Failed to save hardware'}`);
  };

  const deleteHardware = async () => {
    if (!token || !hardwareEditId) return;

    const impactedServices = selectedServices;
    const impactedServiceIds = new Set(impactedServices.map((service) => service.id));
    const impactedDocs = Array.from(
      new Map(
        [...selectedDocs, ...selectedServiceDocs].map((doc) => [doc.id, doc])
      ).values()
    );

    const relatedDeployments = deployments.filter((dep) => String(dep.hardwareAssetId) === String(hardwareEditId));
    const relatedStorageByHardware = storageItems.filter((item) => String(item.hardwareAssetId) === String(hardwareEditId));
    const relatedStorageByService = storageItems.filter(
      (item) => item.softwareUnitId && impactedServiceIds.has(String(item.softwareUnitId))
    );
    const totalRelatedStorage = Array.from(
      new Set([
        ...relatedStorageByHardware.map((item) => item.id),
        ...relatedStorageByService.map((item) => item.id)
      ])
    ).length;

    const externalDeploymentsImpacted = deployments.filter(
      (dep) =>
        dep.softwareUnitId &&
        impactedServiceIds.has(String(dep.softwareUnitId)) &&
        String(dep.hardwareAssetId) !== String(hardwareEditId)
    );

    setPendingHardwareDelete({
      id: String(hardwareEditId),
      name: selectedHardware?.name || 'Selected hardware',
      deployments: relatedDeployments.length,
      services: impactedServices.length,
      storage: totalRelatedStorage,
      docs: impactedDocs.length,
      servicePreview: impactedServices.map((service) => service.name).slice(0, 4),
      docPreview: impactedDocs.map((doc) => doc.title).slice(0, 4),
      externalImpact: externalDeploymentsImpacted.length
    });
  };

  const confirmDeleteHardware = async () => {
    if (!token || !pendingHardwareDelete) return;

    const response = await fetch(`${API_BASE}/hardware/${pendingHardwareDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete hardware'}`);
      return;
    }

    setPendingHardwareDelete(null);
    setIsHardwareModalOpen(false);
    setHardwareEditId(null);
    await fetchData();
  };

  const handleAddDeployment = () => {
    setDeploymentEditId(null);
    setSoftwareUnitId('');
    setInternalIp('');
    setDeploymentStatus('RUNNING');
    setIsDeploymentModalOpen(true);
  };

  const handleEditDeployment = (dep: any) => {
    setDeploymentEditId(dep.id);
    setSoftwareUnitId(dep.softwareUnitId || '');
    setInternalIp(dep.internalIp || '');
    setDeploymentStatus(dep.status || 'RUNNING');
    setIsDeploymentModalOpen(true);
  };

  const saveDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedHardwareId) return;

    const url = deploymentEditId ? `${API_BASE}/deployments/${deploymentEditId}` : `${API_BASE}/deployments`;
    const method = deploymentEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        hardwareAssetId: selectedHardwareId,
        softwareUnitId,
        internalIp,
        status: deploymentStatus
      })
    });

    if (response.ok) {
      setIsDeploymentModalOpen(false);
      await fetchData();
      return;
    }

    const errorData = await response.json();
    alert(`Error: ${errorData.error || 'Failed to save deployment'}`);
  };

  const deleteDeployment = async () => {
    if (!token || !deploymentEditId) return;
    if (!window.confirm('Delete this deployment?')) return;

    const response = await fetch(`${API_BASE}/deployments/${deploymentEditId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete deployment'}`);
      return;
    }

    setIsDeploymentModalOpen(false);
    setDeploymentEditId(null);
    await fetchData();
  };

  const handleAddStorage = () => {
    setStorageEditId(null);
    setStorageName('');
    setStorageType('SSD');
    setUsableSpace('');
    setSpaceUnit('GB');
    setIsStorageModalOpen(true);
  };

  const handleEditStorage = (item: any) => {
    setStorageEditId(item.id);
    setStorageName(item.name || '');
    setStorageType(item.storageType || 'SSD');

    if (item.usableSpaceGB && item.usableSpaceGB >= 1000 && item.usableSpaceGB % 1000 === 0) {
      setUsableSpace(item.usableSpaceGB / 1000);
      setSpaceUnit('TB');
    } else {
      setUsableSpace(item.usableSpaceGB || '');
      setSpaceUnit('GB');
    }

    setIsStorageModalOpen(true);
  };

  const saveStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedHardwareId) return;

    const url = storageEditId ? `${API_BASE}/storage/${storageEditId}` : `${API_BASE}/storage`;
    const method = storageEditId ? 'PUT' : 'POST';

    const usableSpaceGB = spaceUnit === 'TB' ? Number(usableSpace) * 1000 : Number(usableSpace);

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        name: storageName,
        storageType,
        usableSpaceGB,
        hardwareAssetId: selectedHardwareId
      })
    });

    if (response.ok) {
      setIsStorageModalOpen(false);
      await fetchData();
      return;
    }

    const errorData = await response.json();
    alert(`Error: ${errorData.error || 'Failed to save storage'}`);
  };

  const deleteStorage = async () => {
    if (!token || !storageEditId) return;
    if (!window.confirm('Delete this storage item?')) return;

    const response = await fetch(`${API_BASE}/storage/${storageEditId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete storage'}`);
      return;
    }

    setIsStorageModalOpen(false);
    setStorageEditId(null);
    await fetchData();
  };

  const handleAddDoc = () => {
    setDocEditId(null);
    setDocTitle('');
    setDocContent('');
    setDocHardwareAssetId(selectedHardwareId || '');
    setDocSoftwareUnitId('');
    setDocParentDocId('');
    setIsDocModalOpen(true);
  };

  const handleEditDoc = (doc: any) => {
    setDocEditId(doc.id);
    setDocTitle(doc.title || '');
    setDocContent(doc.content || '');
    setDocHardwareAssetId(doc.hardwareAssetId || selectedHardwareId || '');
    setDocSoftwareUnitId(doc.softwareUnitId || '');
    setDocParentDocId(doc.parentDocId || '');
    setIsDocModalOpen(true);
  };

  const saveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const normalizedTitle = ensureMarkdownFilename(docTitle);
    if (!normalizedTitle) {
      alert('Title is required');
      return;
    }

    const url = docEditId ? `${API_BASE}/docs/${docEditId}` : `${API_BASE}/docs`;
    const method = docEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        title: normalizedTitle,
        content: docContent,
        hardwareAssetId: docHardwareAssetId || undefined,
        softwareUnitId: docSoftwareUnitId || undefined,
        parentDocId: docParentDocId || undefined
      })
    });

    if (response.ok) {
      setIsDocModalOpen(false);
      await fetchData();
      return;
    }

    const errorData = await response.json();
    alert(`Error: ${errorData.error || 'Failed to save document'}`);
  };

  const deleteDoc = async () => {
    if (!token || !docEditId) return;

    const targetDoc = docs.find((doc) => doc.id === docEditId);

    const childrenByParent = new Map<string, string[]>();
    for (const doc of docs) {
      if (!doc.parentDocId) continue;
      const existing = childrenByParent.get(doc.parentDocId) || [];
      existing.push(doc.id);
      childrenByParent.set(doc.parentDocId, existing);
    }

    const subtreeIds = new Set<string>();
    const stack = [docEditId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (subtreeIds.has(current)) continue;
      subtreeIds.add(current);

      const children = childrenByParent.get(current) || [];
      for (const childId of children) {
        if (!subtreeIds.has(childId)) stack.push(childId);
      }
    }

    const subtreeDocs = docs.filter((doc) => subtreeIds.has(doc.id));
    const childCount = Math.max(0, subtreeDocs.length - 1);
    const childTitles = subtreeDocs
      .filter((doc) => doc.id !== docEditId)
      .map((doc) => doc.title)
      .slice(0, 8);

    setPendingDocDelete({
      id: docEditId,
      title: targetDoc?.title || 'Selected document',
      childCount,
      childPreview: childTitles
    });
  };

  const confirmDeleteDoc = async () => {
    if (!token || !pendingDocDelete) return;

    const response = await fetch(`${API_BASE}/docs/${pendingDocDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete document'}`);
      return;
    }

    setPendingDocDelete(null);
    setIsDocModalOpen(false);
    setDocEditId(null);
    await fetchData();
  };

  const displaySpace = (gb: number | undefined | null) => {
    if (!gb) return '-';
    if (gb >= 1000 && gb % 1000 === 0) return `${gb / 1000} TB`;
    if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
    return `${gb} GB`;
  };

  const renderDocNode = (doc: any, depth = 0) => (
    <div key={doc.id} className={`px-4 py-3 ${depth > 0 ? 'ml-5 border-l border-border' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text">{doc.title}</p>
          <div className="flex flex-wrap gap-2 my-2">
            {doc.hardwareAsset?.name && <span className="text-xs bg-primary/15 text-primary px-2 py-1 rounded-full">HW: {doc.hardwareAsset.name}</span>}
            {doc.softwareUnit?.name && <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-1 rounded-full">Service: {doc.softwareUnit.name}</span>}
            {doc.parentDoc?.title && <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-1 rounded-full">Parent: {doc.parentDoc.title}</span>}
          </div>
          <div className="max-h-32 overflow-auto">
            <ReactMarkdown components={markdownComponents}>{doc.content || ''}</ReactMarkdown>
          </div>
        </div>
        <button onClick={() => handleEditDoc(doc)} className="text-sm text-primary hover:text-primary/80 shrink-0">Edit</button>
      </div>

      {getDocChildren(doc.id).map(child => renderDocNode(child, depth + 1))}
    </div>
  );

  return (
  <div className="documentation-area p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Hardware Documentation</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
  <Card className="xl:col-span-4 rounded-xl border border-border bg-content p-0 overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-text-secondary">Hardware Nodes</span>
            <button onClick={handleAddHardware} className="bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors">+ Add Hardware</button>
          </div>
          <div className="divide-y divide-border">
            {hardware.length === 0 && <p className="p-4 text-text-secondary">No hardware found.</p>}
            {hardware.map(hw => (
              <button
                key={hw.id}
                onClick={() => setSelectedHardwareId(String(hw.id))}
                className={`relative w-full text-left pl-5 pr-4 py-3 transition-all ${isSelectedHardware(hw.id) ? 'bg-primary/20 shadow-md' : 'hover:bg-background/60'}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-full w-1 ${isSelectedHardware(hw.id) ? 'bg-primary' : 'bg-border'}`}
                />
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className={`font-medium ${isSelectedHardware(hw.id) ? 'text-primary' : 'text-text'}`}>{hw.name}</p>
                    <p className="text-xs text-text-secondary">{hw.type} • {hw.status}</p>
                  </div>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditHardware(hw);
                    }}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Edit
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="xl:col-span-8 space-y-6">
          {!selectedHardware && (
            <Card className="rounded-xl border border-border bg-content p-6 text-text-secondary">
              Select hardware on the left or create a new one.
            </Card>
          )}

          {selectedHardware && (
            <>
              <Card className="rounded-xl border border-border bg-content p-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-text">{selectedHardware.name}</h3>
                    <p className="text-sm text-text-secondary mt-1">{selectedHardware.type} • {selectedHardware.status}</p>
                  </div>
                  <button onClick={() => handleEditHardware(selectedHardware)} className="text-sm text-primary hover:text-primary/80">Edit Hardware</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                  <p className="text-text-secondary">IP: <span className="text-text">{selectedHardware.ip || '-'}</span></p>
                  <p className="text-text-secondary">OS: <span className="text-text">{selectedHardware.os || '-'}</span></p>
                  <p className="text-text-secondary">RAM: <span className="text-text">{selectedHardware.ram ? `${selectedHardware.ram} GB` : '-'}</span></p>
                </div>
                {selectedHardware.notes && <p className="mt-4 text-sm text-text-secondary whitespace-pre-wrap">{selectedHardware.notes}</p>}
              </Card>

              <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
                  <h4 className="font-semibold text-text">Services on this hardware</h4>
                  <button onClick={handleAddDeployment} className="text-sm text-primary hover:text-primary/80">+ Add service</button>
                </div>
                <div className="divide-y divide-border">
                  {selectedDeployments.length === 0 && <p className="p-4 text-sm text-text-secondary">No services assigned.</p>}
                  {selectedDeployments.map(dep => (
                    <div key={dep.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-text">{dep.softwareUnit?.name || 'Unknown service'}</p>
                        <p className="text-xs text-text-secondary">{dep.softwareUnit?.type || '-'} • {dep.internalIp || '-'} • {dep.status || 'UNKNOWN'}</p>
                      </div>
                      <button onClick={() => handleEditDeployment(dep)} className="text-sm text-primary hover:text-primary/80">Edit</button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
                  <h4 className="font-semibold text-text">Disks / Storage</h4>
                  <button onClick={handleAddStorage} className="text-sm text-primary hover:text-primary/80">+ Add storage</button>
                </div>
                <div className="divide-y divide-border">
                  {selectedStorage.length === 0 && <p className="p-4 text-sm text-text-secondary">No storage assigned.</p>}
                  {selectedStorage.map(item => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-text">{item.name}</p>
                        <p className="text-xs text-text-secondary">{item.storageType || '-'} • {displaySpace(item.usableSpaceGB)}</p>
                      </div>
                      <button onClick={() => handleEditStorage(item)} className="text-sm text-primary hover:text-primary/80">Edit</button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-text">Linked markdown documents (hardware + services)</h4>
                  <button onClick={handleAddDoc} className="text-sm text-primary hover:text-primary/80">+ Add markdown</button>
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

      {isHardwareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">{hardwareEditId ? 'Edit Hardware' : 'Add New Hardware'}</h3>
              <button onClick={() => setIsHardwareModalOpen(false)} className="text-text-secondary hover:text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={saveHardware} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Name *</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                    <option value="SERVER">Server</option>
                    <option value="PI">Raspberry Pi</option>
                    <option value="NAS">NAS</option>
                    <option value="ROUTER">Router/Switch</option>
                    <option value="VM_HOST">VM Host</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">IP Address</label>
                  <input type="text" value={ip} onChange={e => setIp(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">MAC Address</label>
                  <input type="text" value={mac} onChange={e => setMac(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">CPU</label>
                  <input type="text" value={cpu} onChange={e => setCpu(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">RAM (GB)</label>
                  <input type="number" value={ram} onChange={e => setRam(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Operating System</label>
                  <input type="text" value={os} onChange={e => setOs(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary min-h-[80px]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                {hardwareEditId && (
                  <button
                    type="button"
                    onClick={deleteHardware}
                    className="mr-auto px-4 py-2 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button type="button" onClick={() => setIsHardwareModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Save Hardware</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeploymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">{deploymentEditId ? 'Edit Deployment' : 'Add service to hardware'}</h3>
              <button onClick={() => setIsDeploymentModalOpen(false)} className="text-text-secondary hover:text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={saveDeployment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Service *</label>
                <select required value={softwareUnitId} onChange={e => setSoftwareUnitId(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="" disabled>Select a service</option>
                  {services.map(sw => <option key={sw.id} value={sw.id}>{sw.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Internal IP / Address</label>
                <input type="text" value={internalIp} onChange={e => setInternalIp(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <select value={deploymentStatus} onChange={e => setDeploymentStatus(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="RUNNING">Running</option>
                  <option value="STOPPED">Stopped</option>
                  <option value="ERROR">Error</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                {deploymentEditId && (
                  <button
                    type="button"
                    onClick={deleteDeployment}
                    className="mr-auto px-4 py-2 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button type="button" onClick={() => setIsDeploymentModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary flex-1 hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Save Deployment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStorageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">{storageEditId ? 'Edit Storage' : 'Add storage to hardware'}</h3>
              <button onClick={() => setIsStorageModalOpen(false)} className="text-text-secondary hover:text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={saveStorage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Name *</label>
                <input required type="text" value={storageName} onChange={e => setStorageName(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Type *</label>
                <select required value={storageType} onChange={e => setStorageType(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="SSD">SSD</option>
                  <option value="HDD">HDD</option>
                  <option value="NVME">NVMe</option>
                  <option value="NAS">NAS / Network</option>
                  <option value="USB">USB Drive</option>
                </select>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Usable Space *</label>
                  <input required type="number" step="0.1" value={usableSpace} onChange={e => setUsableSpace(e.target.value ? Number(e.target.value) : '')} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div className="w-24">
                  <select value={spaceUnit} onChange={e => setSpaceUnit(e.target.value as 'GB' | 'TB')} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                {storageEditId && (
                  <button
                    type="button"
                    onClick={deleteStorage}
                    className="mr-auto px-4 py-2 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button type="button" onClick={() => setIsStorageModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary flex-1 hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Save Storage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-6xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">{docEditId ? 'Edit Markdown Document' : 'New Markdown Document'}</h3>
              <button onClick={() => setIsDocModalOpen(false)} className="text-text-secondary hover:text-text">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={saveDoc} className="space-y-4 flex flex-col flex-1 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
                  <input required type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Hardware Link</label>
                  <select value={docHardwareAssetId} onChange={e => setDocHardwareAssetId(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                    <option value="">None</option>
                    {hardware.map(hw => <option key={hw.id} value={hw.id}>{hw.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Service Link</label>
                <select value={docSoftwareUnitId} onChange={e => setDocSoftwareUnitId(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="">None</option>
                  {selectedServices.map(sw => <option key={sw.id} value={sw.id}>{sw.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Parent Document</label>
                <select value={docParentDocId} onChange={e => setDocParentDocId(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="">None (Root)</option>
                  {docs.filter(doc => doc.id !== docEditId).map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 mb-4">
                <div className="flex flex-col min-h-0">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Markdown Content *</label>
                  <textarea required value={docContent} onChange={e => setDocContent(e.target.value)} className="w-full flex-1 min-h-[260px] bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary font-mono text-sm resize-none" />
                </div>
                <div className="flex flex-col min-h-0">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Live Preview</label>
                  <div className="w-full flex-1 min-h-[260px] overflow-auto bg-content border border-border rounded-lg px-4 py-3">
                    <ReactMarkdown components={markdownComponents}>{docContent || '*No content available*'}</ReactMarkdown>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border shrink-0">
                {docEditId && (
                  <button
                    type="button"
                    onClick={deleteDoc}
                    className="mr-auto px-4 py-2 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button type="button" onClick={() => setIsDocModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary flex-1 hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingHardwareDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-content p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-text">Delete {pendingHardwareDelete.name}?</h3>
            <p className="mt-1 text-sm text-text-secondary">Related child entries will be removed too.</p>

            <ul className="mt-4 space-y-1.5 text-sm text-text-secondary">
              <li>• {pendingHardwareDelete.deployments} deployment(s)</li>
              <li>• {pendingHardwareDelete.services} service(s)</li>
              <li>• {pendingHardwareDelete.storage} storage entry/entries</li>
              <li>• {pendingHardwareDelete.docs} markdown doc(s)</li>
            </ul>

            {pendingHardwareDelete.servicePreview.length > 0 && (
              <p className="mt-3 text-xs text-text-secondary/90">
                Services: {pendingHardwareDelete.servicePreview.join(', ')}{pendingHardwareDelete.services > pendingHardwareDelete.servicePreview.length ? ' …' : ''}
              </p>
            )}
            {pendingHardwareDelete.docPreview.length > 0 && (
              <p className="mt-1 text-xs text-text-secondary/90">
                Docs: {pendingHardwareDelete.docPreview.join(', ')}{pendingHardwareDelete.docs > pendingHardwareDelete.docPreview.length ? ' …' : ''}
              </p>
            )}
            {pendingHardwareDelete.externalImpact > 0 && (
              <p className="mt-2 text-xs text-amber-300">
                Warning: {pendingHardwareDelete.externalImpact} deployment(s) on other hardware are also affected.
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setPendingHardwareDelete(null)}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteHardware}
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDocDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-content p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-text">Delete {pendingDocDelete.title}?</h3>
            <p className="mt-1 text-sm text-text-secondary">Child markdown files are removed too.</p>

            <ul className="mt-4 space-y-1.5 text-sm text-text-secondary">
              <li>• 1 selected document</li>
              <li>• {pendingDocDelete.childCount} child document(s)</li>
            </ul>

            {pendingDocDelete.childPreview.length > 0 && (
              <p className="mt-3 text-xs text-text-secondary/90">
                Child docs: {pendingDocDelete.childPreview.join(', ')}{pendingDocDelete.childCount > pendingDocDelete.childPreview.length ? ' …' : ''}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setPendingDocDelete(null)}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDoc}
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
