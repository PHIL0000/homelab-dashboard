import { useEffect, useMemo, useState } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import AddHardware from './components/AddHardware';
import AddService from './components/AddService';
import AddStorage from './components/AddStorage';
import AddMarkdown from './components/AddMarkdown';
import EditHardware from './components/EditHardware';
import EditService from './components/EditService';
import EditStorage from './components/EditStorage';
import EditMarkdown from './components/EditMarkdown';
import DeleteWarning from './components/DeleteWarning';

const API_BASE = 'http://localhost:3001/api/infrastructure';
const DEFAULT_HARDWARE_TYPE = 'SERVER';
const DEFAULT_SOFTWARE_TYPE = 'DOCKER_CONTAINER';

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

export default function DocsOverview() {
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
  const [hostname, setHostname] = useState('');
  const [type, setType] = useState(DEFAULT_HARDWARE_TYPE);
  const [cpu, setCpu] = useState('');
  const [cpuCores, setCpuCores] = useState('');
  const [ram, setRam] = useState('');
  const [os, setOs] = useState('');
  const [ip, setIp] = useState('');
  const [mac, setMac] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [icon, setIcon] = useState('');
  const [notes, setNotes] = useState('');

  const [softwareUnitId, setSoftwareUnitId] = useState('');
  const [deploymentHardwareAssetId, setDeploymentHardwareAssetId] = useState('');
  const [internalIp, setInternalIp] = useState('');
  const [deploymentModalMode, setDeploymentModalMode] = useState<'create-service' | 'edit-deployment'>('create-service');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceType, setNewServiceType] = useState(DEFAULT_SOFTWARE_TYPE);
  const [newServiceImage, setNewServiceImage] = useState('');
  const [newServicePort, setNewServicePort] = useState('');
  const [newServiceUrl, setNewServiceUrl] = useState('');

  const [storageName, setStorageName] = useState('');
  const [storageType, setStorageType] = useState('SSD');
  const [storageMake, setStorageMake] = useState('');
  const [storageModel, setStorageModel] = useState('');
  const [storageSerialNumber, setStorageSerialNumber] = useState('');
  const [storageInterface, setStorageInterface] = useState('');
  const [usableSpace, setUsableSpace] = useState<number | ''>('');
  const [spaceUnit, setSpaceUnit] = useState<'GB' | 'TB'>('GB');

  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docHardwareAssetId, setDocHardwareAssetId] = useState('');
  const [docSoftwareUnitId, setDocSoftwareUnitId] = useState('');
  const [docParentDocId, setDocParentDocId] = useState('');
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
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
  const [pendingServiceDelete, setPendingServiceDelete] = useState<{
    id: string;
    name: string;
    deployments: number;
    storage: number;
    docs: number;
    deploymentPreview: string[];
    docPreview: string[];
    hardwareImpact: number;
  } | null>(null);
  const [pendingStorageDelete, setPendingStorageDelete] = useState<{
    id: string;
    name: string;
    hardwareName?: string;
    serviceName?: string;
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
  const rootVisibleDocs = visibleDocs
    .filter(doc => !doc.parentDocId || !visibleDocIds.has(doc.parentDocId))
    .sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));

  const getDocChildren = (docId: string) =>
    visibleDocs
      .filter(doc => doc.parentDocId === docId)
      .sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));

  const collectDocSubtreeIds = (rootDocIds: string[]) => {
    if (rootDocIds.length === 0) return new Set<string>();

    const childrenByParent = new Map<string, string[]>();
    for (const doc of docs) {
      if (!doc.parentDocId) continue;
      const children = childrenByParent.get(doc.parentDocId) || [];
      children.push(doc.id);
      childrenByParent.set(doc.parentDocId, children);
    }

    const visited = new Set<string>();
    const stack = [...rootDocIds];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const children = childrenByParent.get(current) || [];
      for (const childId of children) {
        if (!visited.has(childId)) stack.push(childId);
      }
    }

    return visited;
  };

  const handleAddHardware = () => {
    setHardwareEditId(null);
    setName('');
    setHostname('');
  setType(DEFAULT_HARDWARE_TYPE);
    setCpu('');
    setCpuCores('');
    setRam('');
    setOs('');
    setIp('');
    setMac('');
    setMake('');
    setModel('');
    setSerialNumber('');
    setLocation('');
    setIcon('');
    setNotes('');
    setIsHardwareModalOpen(true);
  };

  const handleEditHardware = (hw: any) => {
    setHardwareEditId(hw.id);
    setName(hw.name || '');
    setHostname(hw.hostname || '');
  setType(hw.type || DEFAULT_HARDWARE_TYPE);
    setCpu(hw.cpu || '');
    setCpuCores(hw.cpuCores ? String(hw.cpuCores) : '');
    setRam(hw.ram ? hw.ram.toString() : '');
    setOs(hw.os || '');
    setIp(hw.ip || '');
    setMac(hw.mac || '');
    setMake(hw.make || '');
    setModel(hw.model || '');
    setSerialNumber(hw.serialNumber || '');
    setLocation(hw.location || '');
    setIcon(hw.icon || '');
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
        hostname: hostname || null,
        type,
        cpu,
        cpuCores: cpuCores ? parseInt(cpuCores, 10) : null,
        ram: ram ? parseInt(ram, 10) : null,
        os,
        ip,
        mac,
        make: make || null,
        model: model || null,
        serialNumber: serialNumber || null,
        location: location || null,
        icon: icon || null,
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
    setDeploymentModalMode('create-service');
    setDeploymentEditId(null);
    setSoftwareUnitId('');
    setDeploymentHardwareAssetId(selectedHardwareId || '');
    setNewServiceName('');
  setNewServiceType(DEFAULT_SOFTWARE_TYPE);
    setNewServiceImage('');
    setNewServicePort('');
    setNewServiceUrl('');
    setInternalIp('');
    setIsDeploymentModalOpen(true);
  };

  const handleEditDeployment = (dep: any) => {
    setDeploymentModalMode('edit-deployment');
    setDeploymentEditId(dep.id);
    setSoftwareUnitId(dep.softwareUnitId || '');
    setDeploymentHardwareAssetId(dep.hardwareAssetId ? String(dep.hardwareAssetId) : (selectedHardwareId || ''));
    const linkedService = dep.softwareUnit || services.find((sw) => String(sw.id) === String(dep.softwareUnitId));
    setNewServiceName(linkedService?.name || '');
  setNewServiceType(linkedService?.type || DEFAULT_SOFTWARE_TYPE);
    setNewServiceImage(linkedService?.image || '');
    setNewServicePort(linkedService?.port ? String(linkedService.port) : '');
    setNewServiceUrl(linkedService?.url || '');
    setInternalIp(dep.internalIp || '');
    setIsDeploymentModalOpen(true);
  };

  const saveDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const targetHardwareId = deploymentHardwareAssetId || selectedHardwareId;
    if (!targetHardwareId) {
      alert('Hardware selection is required');
      return;
    }

    if (!newServiceName.trim()) {
      alert('Service name is required');
      return;
    }

    let targetSoftwareUnitId = softwareUnitId;

    if (deploymentModalMode === 'create-service') {
      const createServiceRes = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: newServiceName.trim(),
          type: newServiceType,
          image: newServiceImage.trim() || null,
          port: newServicePort ? Number(newServicePort) : null,
          url: newServiceUrl.trim() || null
        })
      });

      if (!createServiceRes.ok) {
        const createServiceError = await createServiceRes.json().catch(() => ({}));
        alert(`Error: ${createServiceError.error || 'Failed to create service'}`);
        return;
      }

      const createdService = await createServiceRes.json();
      targetSoftwareUnitId = String(createdService.id);
    } else {
      if (!targetSoftwareUnitId) {
        alert('Linked service is missing on this deployment');
        return;
      }

      const updateServiceRes = await fetch(`${API_BASE}/services/${targetSoftwareUnitId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: newServiceName.trim(),
          type: newServiceType,
          image: newServiceImage.trim() || null,
          port: newServicePort ? Number(newServicePort) : null,
          url: newServiceUrl.trim() || null
        })
      });

      if (!updateServiceRes.ok) {
        const updateServiceError = await updateServiceRes.json().catch(() => ({}));
        alert(`Error: ${updateServiceError.error || 'Failed to update service'}`);
        return;
      }
    }

    const url = deploymentEditId ? `${API_BASE}/deployments/${deploymentEditId}` : `${API_BASE}/deployments`;
    const method = deploymentEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        hardwareAssetId: targetHardwareId,
        softwareUnitId: targetSoftwareUnitId,
        internalIp
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
    if (!token || !softwareUnitId) return;

    const targetService = services.find((service) => String(service.id) === String(softwareUnitId));
    const relatedDeployments = deployments.filter((dep) => String(dep.softwareUnitId) === String(softwareUnitId));
    const relatedStorage = storageItems.filter((item) => String(item.softwareUnitId) === String(softwareUnitId));
    const rootServiceDocs = docs.filter((doc) => String(doc.softwareUnitId) === String(softwareUnitId));
    const docSubtreeIds = collectDocSubtreeIds(rootServiceDocs.map((doc) => doc.id));
    const impactedDocs = docs.filter((doc) => docSubtreeIds.has(doc.id));
    const hardwareImpact = new Set(relatedDeployments.map((dep) => String(dep.hardwareAssetId)).filter(Boolean)).size;

    setPendingServiceDelete({
      id: String(softwareUnitId),
      name: targetService?.name || newServiceName || 'Selected service',
      deployments: relatedDeployments.length,
      storage: relatedStorage.length,
      docs: impactedDocs.length,
      deploymentPreview: relatedDeployments
        .map((dep) => dep.hardwareAsset?.name)
        .filter(Boolean)
        .slice(0, 4),
      docPreview: impactedDocs.map((doc) => doc.title).slice(0, 4),
      hardwareImpact
    });
  };

  const confirmDeleteService = async () => {
    if (!token || !pendingServiceDelete) return;

    const response = await fetch(`${API_BASE}/services/${pendingServiceDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete service'}`);
      return;
    }

    setPendingServiceDelete(null);
    setIsDeploymentModalOpen(false);
    setDeploymentEditId(null);
    setSoftwareUnitId('');
    await fetchData();
  };

  const handleAddStorage = () => {
    setStorageEditId(null);
    setStorageName('');
    setStorageType('SSD');
    setStorageMake('');
    setStorageModel('');
    setStorageSerialNumber('');
    setStorageInterface('');
    setUsableSpace('');
    setSpaceUnit('GB');
    setIsStorageModalOpen(true);
  };

  const handleEditStorage = (item: any) => {
    setStorageEditId(item.id);
    setStorageName(item.name || '');
    setStorageType(item.storageType || 'SSD');
    setStorageMake(item.make || '');
    setStorageModel(item.model || '');
    setStorageSerialNumber(item.serialNumber || '');
    setStorageInterface(item.interface || '');

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
        make: storageMake || null,
        model: storageModel || null,
        serialNumber: storageSerialNumber || null,
        interface: storageInterface || null,
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
    if (!storageEditId) return;

    const storageItem = storageItems.find((item) => String(item.id) === String(storageEditId));
    setPendingStorageDelete({
      id: String(storageEditId),
      name: storageItem?.name || storageName || 'Selected storage',
      hardwareName: storageItem?.hardwareAsset?.name,
      serviceName: storageItem?.softwareUnit?.name
    });
  };

  const confirmDeleteStorage = async () => {
    if (!token || !pendingStorageDelete) return;

    const response = await fetch(`${API_BASE}/storage/${pendingStorageDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete storage'}`);
      return;
    }

    setPendingStorageDelete(null);
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

  // Keep advanced handlers referenced even when specific actions are not surfaced in UI.
  void [
    isHardwareModalOpen,
    isDeploymentModalOpen,
    isStorageModalOpen,
    isDocModalOpen,
    handleAddHardware,
    handleEditHardware,
    saveHardware,
    deleteHardware,
    confirmDeleteHardware,
    handleAddDeployment,
    handleEditDeployment,
    saveDeployment,
    deleteDeployment,
    handleAddStorage,
    handleEditStorage,
    saveStorage,
    deleteStorage,
    handleAddDoc,
    handleEditDoc,
    saveDoc,
    deleteDoc,
    confirmDeleteDoc,
    confirmDeleteService,
    confirmDeleteStorage
  ];

  const displaySpace = (gb: number | undefined | null) => {
    if (!gb) return '-';
    if (gb >= 1000 && gb % 1000 === 0) return `${gb / 1000} TB`;
    if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
    return `${gb} GB`;
  };

  const renderDocNode = (doc: any, depth = 0) => {
    const childCount = getDocChildren(doc.id).length;

    return (
      <div key={doc.id} className={`${depth > 0 ? 'ml-5 border-l border-border' : ''}`}>
        <div className="px-4 py-2.5 flex items-start justify-between gap-3 hover:bg-background/50 transition-colors">
          <button
            type="button"
            onClick={() => setPreviewDoc(doc)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="font-medium text-text truncate">{doc.title}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {doc.softwareUnit?.name && <span className="text-[11px] bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">Service</span>}
              {doc.hardwareAsset?.name && <span className="text-[11px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">Hardware</span>}
              {childCount > 0 && <span className="text-[11px] bg-background border border-border text-text-secondary px-2 py-0.5 rounded-full">{childCount} child</span>}
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleEditDoc(doc)}
            className="text-xs text-primary hover:text-primary/80"
          >
            Edit
          </button>
        </div>

        {getDocChildren(doc.id).map(child => renderDocNode(child, depth + 1))}
      </div>
    );
  };

  return (
  <div className="documentation-area page-shell">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">Overview</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
  <Card className="xl:col-span-4 rounded-xl border border-border bg-content p-0 overflow-hidden h-full min-h-0 flex flex-col">
          <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-text-secondary">Hardware Nodes</span>
            <button onClick={handleAddHardware} className="text-sm text-primary hover:text-primary/80">+ Add hardware</button>
          </div>
          <div className="divide-y divide-border overflow-y-auto min-h-0">
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
                  <button
                    type="button"
                    onClick={() => handleEditHardware(selectedHardware)}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Edit
                  </button>
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
                  <button onClick={handleAddDeployment} className="text-sm text-primary hover:text-primary/80">+ Add service</button>
                </div>
                <div className="divide-y divide-border">
                  {selectedDeployments.length === 0 && <p className="p-4 text-sm text-text-secondary">No services assigned.</p>}
                  {selectedDeployments.map(dep => (
                    <div key={dep.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-text">{dep.softwareUnit?.name || 'Unknown service'}</p>
                        <p className="text-xs text-text-secondary">{dep.softwareUnit?.type || '-'} • {dep.internalIp || '-'} • {dep.status || 'UNKNOWN'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEditDeployment(dep)}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-text">Disks / Storage</h4>
                  <button onClick={handleAddStorage} className="text-sm text-primary hover:text-primary/80">+ Add storage</button>
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
                      <button
                        type="button"
                        onClick={() => handleEditStorage(item)}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Edit
                      </button>
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
      </div>
      </div>

      {hardwareEditId ? (
        <EditHardware
          isOpen={isHardwareModalOpen}
          name={name}
          hostname={hostname}
          type={type}
          ip={ip}
          mac={mac}
          cpu={cpu}
          cpuCores={cpuCores}
          make={make}
          model={model}
          ram={ram}
          serialNumber={serialNumber}
          location={location}
          icon={icon}
          os={os}
          notes={notes}
          onClose={() => setIsHardwareModalOpen(false)}
          onSubmit={saveHardware}
          onDelete={deleteHardware}
          onNameChange={setName}
          onHostnameChange={setHostname}
          onTypeChange={setType}
          onIpChange={setIp}
          onMacChange={setMac}
          onCpuChange={setCpu}
          onCpuCoresChange={setCpuCores}
          onMakeChange={setMake}
          onModelChange={setModel}
          onRamChange={setRam}
          onSerialNumberChange={setSerialNumber}
          onLocationChange={setLocation}
          onIconChange={setIcon}
          onOsChange={setOs}
          onNotesChange={setNotes}
        />
      ) : (
        <AddHardware
          isOpen={isHardwareModalOpen}
          name={name}
          hostname={hostname}
          type={type}
          ip={ip}
          mac={mac}
          cpu={cpu}
          cpuCores={cpuCores}
          make={make}
          model={model}
          ram={ram}
          serialNumber={serialNumber}
          location={location}
          icon={icon}
          os={os}
          notes={notes}
          onClose={() => setIsHardwareModalOpen(false)}
          onSubmit={saveHardware}
          onNameChange={setName}
          onHostnameChange={setHostname}
          onTypeChange={setType}
          onIpChange={setIp}
          onMacChange={setMac}
          onCpuChange={setCpu}
          onCpuCoresChange={setCpuCores}
          onMakeChange={setMake}
          onModelChange={setModel}
          onRamChange={setRam}
          onSerialNumberChange={setSerialNumber}
          onLocationChange={setLocation}
          onIconChange={setIcon}
          onOsChange={setOs}
          onNotesChange={setNotes}
        />
      )}

      {deploymentEditId ? (
        <EditService
          isOpen={isDeploymentModalOpen}
          title="Edit Service & Deployment"
          submitLabel="Save Deployment"
          hardwareAssetId={deploymentHardwareAssetId}
          hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
          showHardwareSelector
          name={newServiceName}
          type={newServiceType}
          port={newServicePort}
          url={newServiceUrl}
          image={newServiceImage}
          internalIp={internalIp}
          showInternalIp
          onClose={() => setIsDeploymentModalOpen(false)}
          onSubmit={saveDeployment}
          onDelete={deleteDeployment}
          onNameChange={setNewServiceName}
          onTypeChange={setNewServiceType}
          onPortChange={setNewServicePort}
          onUrlChange={setNewServiceUrl}
          onImageChange={setNewServiceImage}
          onInternalIpChange={setInternalIp}
          onHardwareAssetIdChange={setDeploymentHardwareAssetId}
        />
      ) : (
        <AddService
          isOpen={isDeploymentModalOpen}
          title="Add service to hardware"
          submitLabel="Save Deployment"
          name={newServiceName}
          type={newServiceType}
          port={newServicePort}
          url={newServiceUrl}
          image={newServiceImage}
          internalIp={internalIp}
          showInternalIp
          createHint="The new service will be created and directly linked to this hardware."
          onClose={() => setIsDeploymentModalOpen(false)}
          onSubmit={saveDeployment}
          onNameChange={setNewServiceName}
          onTypeChange={setNewServiceType}
          onPortChange={setNewServicePort}
          onUrlChange={setNewServiceUrl}
          onImageChange={setNewServiceImage}
          onInternalIpChange={setInternalIp}
        />
      )}

      {storageEditId ? (
        <EditStorage
          isOpen={isStorageModalOpen}
          name={storageName}
          type={storageType}
          make={storageMake}
          model={storageModel}
          serialNumber={storageSerialNumber}
          interfaceType={storageInterface}
          usableSpace={usableSpace}
          spaceUnit={spaceUnit}
          onClose={() => setIsStorageModalOpen(false)}
          onSubmit={saveStorage}
          onDelete={deleteStorage}
          onNameChange={setStorageName}
          onTypeChange={setStorageType}
          onMakeChange={setStorageMake}
          onModelChange={setStorageModel}
          onSerialNumberChange={setStorageSerialNumber}
          onInterfaceChange={setStorageInterface}
          onUsableSpaceChange={setUsableSpace}
          onSpaceUnitChange={setSpaceUnit}
        />
      ) : (
        <AddStorage
          isOpen={isStorageModalOpen}
          name={storageName}
          type={storageType}
          make={storageMake}
          model={storageModel}
          serialNumber={storageSerialNumber}
          interfaceType={storageInterface}
          usableSpace={usableSpace}
          spaceUnit={spaceUnit}
          onClose={() => setIsStorageModalOpen(false)}
          onSubmit={saveStorage}
          onNameChange={setStorageName}
          onTypeChange={setStorageType}
          onMakeChange={setStorageMake}
          onModelChange={setStorageModel}
          onSerialNumberChange={setStorageSerialNumber}
          onInterfaceChange={setStorageInterface}
          onUsableSpaceChange={setUsableSpace}
          onSpaceUnitChange={setSpaceUnit}
        />
      )}

      {docEditId ? (
        <EditMarkdown
          isOpen={isDocModalOpen}
          title={docTitle}
          content={docContent}
          hardwareAssetId={docHardwareAssetId}
          softwareUnitId={docSoftwareUnitId}
          parentDocId={docParentDocId}
          hardwareOptions={hardware}
          serviceOptions={selectedServices}
          parentDocOptions={docs.filter((doc) => doc.id !== docEditId)}
          markdownComponents={markdownComponents}
          onClose={() => setIsDocModalOpen(false)}
          onSubmit={saveDoc}
          onDelete={deleteDoc}
          onTitleChange={setDocTitle}
          onContentChange={setDocContent}
          onHardwareAssetIdChange={setDocHardwareAssetId}
          onSoftwareUnitIdChange={setDocSoftwareUnitId}
          onParentDocIdChange={setDocParentDocId}
        />
      ) : (
        <AddMarkdown
          isOpen={isDocModalOpen}
          title={docTitle}
          content={docContent}
          hardwareAssetId={docHardwareAssetId}
          softwareUnitId={docSoftwareUnitId}
          parentDocId={docParentDocId}
          hardwareOptions={hardware}
          serviceOptions={selectedServices}
          parentDocOptions={docs.filter((doc) => doc.id !== docEditId)}
          markdownComponents={markdownComponents}
          onClose={() => setIsDocModalOpen(false)}
          onSubmit={saveDoc}
          onTitleChange={setDocTitle}
          onContentChange={setDocContent}
          onHardwareAssetIdChange={setDocHardwareAssetId}
          onSoftwareUnitIdChange={setDocSoftwareUnitId}
          onParentDocIdChange={setDocParentDocId}
        />
      )}

      <DeleteWarning
        isOpen={Boolean(pendingHardwareDelete)}
        title={`Delete ${pendingHardwareDelete?.name || 'hardware'}?`}
        description="Related child entries will be removed too."
        impacts={pendingHardwareDelete ? [
          { label: 'deployment(s)', count: pendingHardwareDelete.deployments },
          { label: 'service(s)', count: pendingHardwareDelete.services },
          { label: 'storage item(s)', count: pendingHardwareDelete.storage },
          { label: 'markdown doc(s)', count: pendingHardwareDelete.docs }
        ] : []}
        previewSections={pendingHardwareDelete ? [
          {
            label: 'Services',
            items: pendingHardwareDelete.servicePreview,
            hasMore: pendingHardwareDelete.services > pendingHardwareDelete.servicePreview.length
          },
          {
            label: 'Docs',
            items: pendingHardwareDelete.docPreview,
            hasMore: pendingHardwareDelete.docs > pendingHardwareDelete.docPreview.length
          }
        ] : []}
        warningText={pendingHardwareDelete && pendingHardwareDelete.externalImpact > 0
          ? `${pendingHardwareDelete.externalImpact} deployment(s) on other hardware are also affected.`
          : undefined}
        onCancel={() => setPendingHardwareDelete(null)}
        onConfirm={confirmDeleteHardware}
      />

      <DeleteWarning
        isOpen={Boolean(pendingServiceDelete)}
        title={`Delete ${pendingServiceDelete?.name || 'service'}?`}
        description="The service and all dependent child entries will be removed."
        impacts={pendingServiceDelete ? [
          { label: 'service', count: 1 },
          { label: 'deployment(s)', count: pendingServiceDelete.deployments },
          { label: 'storage item(s)', count: pendingServiceDelete.storage },
          { label: 'markdown doc(s)', count: pendingServiceDelete.docs }
        ] : []}
        previewSections={pendingServiceDelete ? [
          {
            label: 'Deployments on hardware',
            items: pendingServiceDelete.deploymentPreview,
            hasMore: pendingServiceDelete.deployments > pendingServiceDelete.deploymentPreview.length
          },
          {
            label: 'Docs',
            items: pendingServiceDelete.docPreview,
            hasMore: pendingServiceDelete.docs > pendingServiceDelete.docPreview.length
          }
        ] : []}
        warningText={pendingServiceDelete && pendingServiceDelete.hardwareImpact > 1
          ? `This service is deployed on ${pendingServiceDelete.hardwareImpact} hardware nodes.`
          : undefined}
        onCancel={() => setPendingServiceDelete(null)}
        onConfirm={confirmDeleteService}
      />

      <DeleteWarning
        isOpen={Boolean(pendingStorageDelete)}
        title={`Delete ${pendingStorageDelete?.name || 'storage item'}?`}
        description="Only this storage entry will be removed."
        impacts={[{ label: 'storage item', count: pendingStorageDelete ? 1 : 0 }]}
        previewSections={pendingStorageDelete ? [
          {
            label: 'Linked hardware',
            items: pendingStorageDelete.hardwareName ? [pendingStorageDelete.hardwareName] : []
          },
          {
            label: 'Linked service',
            items: pendingStorageDelete.serviceName ? [pendingStorageDelete.serviceName] : []
          }
        ] : []}
        onCancel={() => setPendingStorageDelete(null)}
        onConfirm={confirmDeleteStorage}
      />

      <DeleteWarning
        isOpen={Boolean(pendingDocDelete)}
        title={`Delete ${pendingDocDelete?.title || 'document'}?`}
        description="Child markdown files are removed too."
        impacts={pendingDocDelete ? [
          { label: 'selected document', count: 1 },
          { label: 'child document(s)', count: pendingDocDelete.childCount }
        ] : []}
        previewSections={pendingDocDelete ? [
          {
            label: 'Child docs',
            items: pendingDocDelete.childPreview,
            hasMore: pendingDocDelete.childCount > pendingDocDelete.childPreview.length
          }
        ] : []}
        onCancel={() => setPendingDocDelete(null)}
        onConfirm={confirmDeleteDoc}
      />

      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-border bg-content shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-text truncate">{previewDoc.title}</h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {previewDoc.hardwareAsset?.name && <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">HW: {previewDoc.hardwareAsset.name}</span>}
                  {previewDoc.softwareUnit?.name && <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">Service: {previewDoc.softwareUnit.name}</span>}
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-text-secondary hover:text-text">✕</button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              <ReactMarkdown components={markdownComponents}>{previewDoc.content || '*No content available*'}</ReactMarkdown>
            </div>

            <div className="border-t border-border p-3 bg-background flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
