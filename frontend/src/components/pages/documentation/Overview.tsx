import { useEffect, useMemo, useState } from "react";
import { showError } from "../../../toast";
import { useAuth } from "@/context/AuthContext";
import { type HardwareFormValues } from "./components/AddHardware";
import { type StorageFormValues } from "./components/AddStorage";
import { type MarkdownFormValues } from "./components/AddMarkdown";
import OverviewLeftPane from "./components/OverviewLeftPane";
import OverviewRightPane from "./components/OverviewRightPane";
import OverviewModals from "./components/OverviewModals";
import OverviewOverlays from "./components/OverviewOverlays";
import { API_BASE as _apiBase } from "@/lib/api";
const API_BASE = `${_apiBase}/infrastructure`;
const DEFAULT_HARDWARE_TYPE = 'SERVER';
const DEFAULT_SOFTWARE_TYPE = 'DOCKER_CONTAINER';

const markdownComponents = {
  h1: ({ children }: any) => <h1 className="text-lg font-bold text-text mt-3 mb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold text-text mt-3 mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-semibold text-text mt-2 mb-1">{children}</h3>,
  p: ({ children }: any) => <p className="text-sm text-slate-400 leading-relaxed mb-2">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside pl-2 space-y-1 text-sm text-slate-400">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside pl-2 space-y-1 text-sm text-slate-400">{children}</ol>,
  li: ({ children }: any) => <li>{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-slate-100">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-slate-100">{children}</em>,
  code: ({ children }: any) => <code className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/50 text-xs text-text">{children}</code>,
  blockquote: ({ children }: any) => <blockquote className="border-l-2 border-primary pl-3 text-sm text-slate-400 italic my-2">{children}</blockquote>
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
  const [storageEditId, setStorageEditId] = useState<string | null>(null);
  const [docEditId, setDocEditId] = useState<string | null>(null);
  const [editingHardware, setEditingHardware] = useState<any | null>(null);
  const [editingStorage, setEditingStorage] = useState<any | null>(null);
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [editingDeployment, setEditingDeployment] = useState<any | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceType, setNewServiceType] = useState(DEFAULT_SOFTWARE_TYPE);
  const [newServiceImage, setNewServiceImage] = useState('');
  const [newServicePort, setNewServicePort] = useState('');
  const [newServiceUrl, setNewServiceUrl] = useState('');
  const [newServiceStorageIds, setNewServiceStorageIds] = useState<string[]>([]);
  const [editingServiceStorageIds, setEditingServiceStorageIds] = useState<string[]>([]);
  const [newDeploymentInternalIp, setNewDeploymentInternalIp] = useState('');

  const [overviewSearchTerm, setOverviewSearchTerm] = useState('');
  const [overviewTypeFilter, setOverviewTypeFilter] = useState('ALL');

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

  const overviewHardwareTypes = useMemo(
    () => Array.from(new Set(hardware.map((hw) => String(hw.type || 'OTHER')))).sort(),
    [hardware]
  );

  const filteredOverviewHardware = useMemo(() => {
    const query = overviewSearchTerm.trim().toLowerCase();
    return hardware.filter((hw) => {
      const matchesSearch =
        query.length === 0 ||
        String(hw.name || '').toLowerCase().includes(query) ||
        String(hw.hostname || '').toLowerCase().includes(query) ||
        String(hw.ip || '').toLowerCase().includes(query);
      const matchesType = overviewTypeFilter === 'ALL' || String(hw.type || 'OTHER') === overviewTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [hardware, overviewSearchTerm, overviewTypeFilter]);

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
    setEditingHardware(null);
    setIsHardwareModalOpen(true);
  };

  const handleEditHardware = (hw: any) => {
    setHardwareEditId(hw.id);
    setEditingHardware(hw);
    setIsHardwareModalOpen(true);
  };

  const saveHardware = async (values: HardwareFormValues) => {
    if (!token) return;

    const url = hardwareEditId ? `${API_BASE}/hardware/${hardwareEditId}` : `${API_BASE}/hardware`;
    const method = hardwareEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        name: values.name,
        hostname: values.hostname || null,
        type: values.type,
        cpu: values.cpu,
        cpuCores: values.cpuCores ? parseInt(values.cpuCores, 10) : null,
        ram: values.ram ? parseInt(values.ram, 10) : null,
        os: values.os,
        ip: values.ip,
        mac: values.mac,
        make: values.make || null,
        model: values.model || null,
        serialNumber: values.serialNumber || null,
        location: values.location || null,
        icon: values.icon || null,
        notes: values.notes
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
  showError(`Error: ${errorData.error || 'Failed to save hardware'}`);
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
  showError(`Error: ${errorData.error || 'Failed to delete hardware'}`);
      return;
    }

    setPendingHardwareDelete(null);
    setIsHardwareModalOpen(false);
    setHardwareEditId(null);
    await fetchData();
  };

  const handleAddDeployment = () => {
    setEditingDeployment(null);
    setEditingService(null);
    setNewServiceName('');
    setNewServiceType(DEFAULT_SOFTWARE_TYPE);
    setNewServiceImage('');
    setNewServicePort('');
    setNewServiceUrl('');
    setNewServiceStorageIds([]);
    setEditingServiceStorageIds([]);
    setNewDeploymentInternalIp('');
    setIsDeploymentModalOpen(true);
  };

  const handleEditDeployment = (dep: any) => {
    const linkedService = dep.softwareUnit || services.find((sw) => String(sw.id) === String(dep.softwareUnitId));
    setEditingDeployment(dep);
    setEditingService(linkedService || null);
    setEditingServiceStorageIds(
      Array.isArray(linkedService?.storageAssignments)
        ? linkedService.storageAssignments
            .map((assignment: any) => String(assignment.storageId || assignment.storage?.id || ''))
            .filter(Boolean)
        : []
    );
    setIsDeploymentModalOpen(true);
  };

  const saveNewDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const targetHardwareId = selectedHardwareId;
    if (!targetHardwareId) {
  showError('Hardware selection is required');
      return;
    }

    if (!newServiceName.trim()) {
  showError('Service name is required');
      return;
    }

    const createServiceRes = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: newServiceName.trim(),
        type: newServiceType,
        image: newServiceImage.trim() || null,
        port: newServicePort ? Number(newServicePort) : null,
        url: newServiceUrl.trim() || null,
        storageIds: newServiceStorageIds
      })
    });

    if (!createServiceRes.ok) {
      const createServiceError = await createServiceRes.json().catch(() => ({}));
  showError(`Error: ${createServiceError.error || 'Failed to create service'}`);
      return;
    }

    const createdService = await createServiceRes.json();

    const response = await fetch(`${API_BASE}/deployments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        hardwareAssetId: targetHardwareId,
        softwareUnitId: String(createdService.id),
        internalIp: newDeploymentInternalIp
      })
    });

    if (response.ok) {
      setIsDeploymentModalOpen(false);
      await fetchData();
      return;
    }

    const errorData = await response.json();
  showError(`Error: ${errorData.error || 'Failed to save deployment'}`);
  };

  const saveEditedService = async (values: {
    serviceId: string;
    name: string;
    type: string;
    port: string;
    url: string;
    image: string;
  storageIds: string[];
    deploymentId?: string;
    hardwareAssetId: string;
    internalIp: string;
  }) => {
    if (!token) return;

    const updateServiceRes = await fetch(`${API_BASE}/services/${values.serviceId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: values.name,
        type: values.type,
        image: values.image || null,
        port: values.port ? Number(values.port) : null,
        url: values.url || null,
        storageIds: values.storageIds
      })
    });

    if (!updateServiceRes.ok) {
      const updateServiceError = await updateServiceRes.json().catch(() => ({}));
  showError(`Error: ${updateServiceError.error || 'Failed to update service'}`);
      return;
    }

    if (values.deploymentId) {
      if (!values.hardwareAssetId) {
  showError('Hardware selection is required');
        return;
      }

      const updateDeploymentRes = await fetch(`${API_BASE}/deployments/${values.deploymentId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          hardwareAssetId: values.hardwareAssetId,
          softwareUnitId: values.serviceId,
          internalIp: values.internalIp
        })
      });

      if (!updateDeploymentRes.ok) {
        const updateDeploymentError = await updateDeploymentRes.json().catch(() => ({}));
  showError(`Error: ${updateDeploymentError.error || 'Failed to update deployment'}`);
        return;
      }
    }

    setIsDeploymentModalOpen(false);
    setEditingDeployment(null);
    setEditingService(null);
    await fetchData();
  };

  const deleteDeployment = async () => {
    if (!token || !editingService?.id) return;

    const editingServiceId = String(editingService.id);

    const targetService = services.find((service) => String(service.id) === editingServiceId);
    const relatedDeployments = deployments.filter((dep) => String(dep.softwareUnitId) === editingServiceId);
    const relatedStorage = storageItems.filter((item) =>
      Array.isArray(item.serviceAssignments)
        ? item.serviceAssignments.some((assignment: any) => String(assignment.softwareUnitId) === editingServiceId)
        : false
    );
    const rootServiceDocs = docs.filter((doc) => String(doc.softwareUnitId) === editingServiceId);
    const docSubtreeIds = collectDocSubtreeIds(rootServiceDocs.map((doc) => doc.id));
    const impactedDocs = docs.filter((doc) => docSubtreeIds.has(doc.id));
    const hardwareImpact = new Set(relatedDeployments.map((dep) => String(dep.hardwareAssetId)).filter(Boolean)).size;

    setPendingServiceDelete({
      id: editingServiceId,
      name: targetService?.name || 'Selected service',
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
  showError(`Error: ${errorData.error || 'Failed to delete service'}`);
      return;
    }

    setPendingServiceDelete(null);
    setIsDeploymentModalOpen(false);
    setEditingDeployment(null);
    setEditingService(null);
    await fetchData();
  };

  const handleAddStorage = () => {
    setStorageEditId(null);
    setEditingStorage(null);
    setIsStorageModalOpen(true);
  };

  const handleEditStorage = (item: any) => {
    setStorageEditId(item.id);
    setEditingStorage(item);
    setIsStorageModalOpen(true);
  };

  const saveStorage = async (values: StorageFormValues) => {
    if (!token) return;

    const targetHardwareId = values.hardwareAssetId || selectedHardwareId;
    if (!targetHardwareId) return;

    const url = storageEditId ? `${API_BASE}/storage/${storageEditId}` : `${API_BASE}/storage`;
    const method = storageEditId ? 'PUT' : 'POST';

    const usableSpaceGB = values.spaceUnit === 'TB' ? Number(values.usableSpace) * 1000 : Number(values.usableSpace);

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        name: values.name,
        storageType: values.type,
        make: values.make || null,
        model: values.model || null,
        serialNumber: values.serialNumber || null,
        interface: values.interfaceType || null,
        usableSpaceGB,
        hardwareAssetId: targetHardwareId,
        serviceIds: values.softwareUnitIds || []
      })
    });

    if (response.ok) {
      setIsStorageModalOpen(false);
      await fetchData();
      return;
    }

    const errorData = await response.json();
  showError(`Error: ${errorData.error || 'Failed to save storage'}`);
  };

  const deleteStorage = async () => {
    if (!storageEditId) return;

    const storageItem = storageItems.find((item) => String(item.id) === String(storageEditId));
    const assignedServiceNames = Array.isArray(storageItem?.serviceAssignments)
      ? storageItem.serviceAssignments
          .map((assignment: any) => assignment.softwareUnit?.name)
          .filter(Boolean)
          .join(', ')
      : undefined;
    setPendingStorageDelete({
      id: String(storageEditId),
      name: storageItem?.name || editingStorage?.name || 'Selected storage',
      hardwareName: storageItem?.hardwareAsset?.name,
      serviceName: assignedServiceNames
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
  showError(`Error: ${errorData.error || 'Failed to delete storage'}`);
      return;
    }

    setPendingStorageDelete(null);
    setIsStorageModalOpen(false);
    setStorageEditId(null);
    await fetchData();
  };

  const handleAddDoc = () => {
    setDocEditId(null);
    setEditingDoc(null);
    setIsDocModalOpen(true);
  };

  const handleEditDoc = (doc: any) => {
    setDocEditId(doc.id);
    setEditingDoc(doc);
    setIsDocModalOpen(true);
  };

  const saveDoc = async (values: MarkdownFormValues) => {
    if (!token) return;

    const normalizedTitle = ensureMarkdownFilename(values.title);
    if (!normalizedTitle) {
  showError('Title is required');
      return;
    }

    const url = docEditId ? `${API_BASE}/docs/${docEditId}` : `${API_BASE}/docs`;
    const method = docEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        title: normalizedTitle,
        content: values.content,
        hardwareAssetId: values.hardwareAssetId || selectedHardwareId || undefined,
        softwareUnitId: values.softwareUnitId || undefined,
        parentDocId: values.parentDocId || undefined
      })
    });

    if (response.ok) {
      setIsDocModalOpen(false);
      await fetchData();
      return;
    }

    const errorData = await response.json();
  showError(`Error: ${errorData.error || 'Failed to save document'}`);
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
  showError(`Error: ${errorData.error || 'Failed to delete document'}`);
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

  return (
  <div className="documentation-area page-shell">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">Overview</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
          <OverviewLeftPane
            hardware={filteredOverviewHardware}
            hardwareTypes={overviewHardwareTypes}
            selectedHardwareId={normalizedSelectedHardwareId}
            onSelectHardware={setSelectedHardwareId}
            onAddHardware={handleAddHardware}
            searchTerm={overviewSearchTerm}
            onSearchChange={setOverviewSearchTerm}
            typeFilter={overviewTypeFilter}
            onTypeFilterChange={setOverviewTypeFilter}
          />

          <OverviewRightPane
            selectedHardware={selectedHardware}
            selectedDeployments={selectedDeployments}
            selectedStorage={selectedStorage}
            visibleDocs={visibleDocs}
            rootVisibleDocs={rootVisibleDocs}
            displaySpace={displaySpace}
            getDocChildren={getDocChildren}
            onEditHardware={handleEditHardware}
            onAddDeployment={handleAddDeployment}
            onEditDeployment={handleEditDeployment}
            onAddStorage={handleAddStorage}
            onEditStorage={handleEditStorage}
            onAddDoc={handleAddDoc}
            onEditDoc={handleEditDoc}
            onOpenDocPreview={setPreviewDoc}
          />
      </div>
      </div>

      <OverviewModals
        hardwareEditId={hardwareEditId}
        isHardwareModalOpen={isHardwareModalOpen}
        editingHardware={editingHardware}
        onCloseHardwareModal={() => setIsHardwareModalOpen(false)}
        onSaveHardware={saveHardware}
        onDeleteHardware={deleteHardware}
        defaultHardwareType={DEFAULT_HARDWARE_TYPE}
        editingService={editingService}
        editingDeployment={editingDeployment}
        isDeploymentModalOpen={isDeploymentModalOpen}
        hardware={hardware}
        onCloseDeploymentModal={() => setIsDeploymentModalOpen(false)}
        onSaveEditedService={saveEditedService}
        onDeleteDeployment={deleteDeployment}
        newServiceName={newServiceName}
        newServiceType={newServiceType}
        newServicePort={newServicePort}
        newServiceUrl={newServiceUrl}
        newServiceImage={newServiceImage}
  newServiceStorageIds={newServiceStorageIds}
        newDeploymentInternalIp={newDeploymentInternalIp}
        onSaveNewDeployment={saveNewDeployment}
        onNewServiceNameChange={setNewServiceName}
        onNewServiceTypeChange={setNewServiceType}
        onNewServicePortChange={setNewServicePort}
        onNewServiceUrlChange={setNewServiceUrl}
        onNewServiceImageChange={setNewServiceImage}
  onNewServiceStorageIdsChange={setNewServiceStorageIds}
        onNewDeploymentInternalIpChange={setNewDeploymentInternalIp}
  editingServiceStorageIds={editingServiceStorageIds}
  services={services}
  storageItems={storageItems}
        storageEditId={storageEditId}
        isStorageModalOpen={isStorageModalOpen}
        editingStorage={editingStorage}
        selectedHardwareId={selectedHardwareId}
        onCloseStorageModal={() => setIsStorageModalOpen(false)}
        onSaveStorage={saveStorage}
        onDeleteStorage={deleteStorage}
        docEditId={docEditId}
        isDocModalOpen={isDocModalOpen}
        editingDoc={editingDoc}
        selectedServices={selectedServices}
        docs={docs}
        markdownComponents={markdownComponents}
        onCloseDocModal={() => setIsDocModalOpen(false)}
        onSaveDoc={saveDoc}
        onDeleteDoc={deleteDoc}
      />

      <OverviewOverlays
        pendingHardwareDelete={pendingHardwareDelete}
        pendingServiceDelete={pendingServiceDelete}
        pendingStorageDelete={pendingStorageDelete}
        pendingDocDelete={pendingDocDelete}
        previewDoc={previewDoc}
        markdownComponents={markdownComponents}
        onCancelHardwareDelete={() => setPendingHardwareDelete(null)}
        onConfirmHardwareDelete={confirmDeleteHardware}
        onCancelServiceDelete={() => setPendingServiceDelete(null)}
        onConfirmServiceDelete={confirmDeleteService}
        onCancelStorageDelete={() => setPendingStorageDelete(null)}
        onConfirmStorageDelete={confirmDeleteStorage}
        onCancelDocDelete={() => setPendingDocDelete(null)}
        onConfirmDocDelete={confirmDeleteDoc}
        onCloseDocPreview={() => setPreviewDoc(null)}
      />
    </div>
  );
}
