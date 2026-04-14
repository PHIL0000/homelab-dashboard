import { useMemo, useState, useEffect } from 'react';
import { Button, Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import AddService from './components/AddService';
import EditService from './components/EditService';

const API_BASE = 'http://localhost:3001/api/infrastructure';
const DEFAULT_SOFTWARE_TYPE = 'DOCKER_CONTAINER';

type ServiceSortKey = 'name' | 'type' | 'port' | 'ipPort' | 'url' | 'storage';

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

const getServiceStorageNames = (service: any): string[] => {
  if (!Array.isArray(service?.storageAssignments)) return [];
  return service.storageAssignments
    .map((assignment: any) => String(assignment.storage?.name || assignment.storageId || ''))
    .filter(Boolean)
    .sort((a: string, b: string) => a.localeCompare(b));
};

function sortIndicator(active: boolean, direction: 'asc' | 'desc') {
  if (!active) return '↕';
  return direction === 'asc' ? '↑' : '↓';
}

export default function Services() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceEditId, setServiceEditId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [editingDeployment, setEditingDeployment] = useState<any | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceType, setNewServiceType] = useState(DEFAULT_SOFTWARE_TYPE);
  const [newServicePort, setNewServicePort] = useState('');
  const [newServiceUrl, setNewServiceUrl] = useState('');
  const [newServiceImage, setNewServiceImage] = useState('');
  const [newServiceStorageIds, setNewServiceStorageIds] = useState<string[]>([]);
  const [editingServiceStorageIds, setEditingServiceStorageIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<ServiceSortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const fetchServices = async () => {
    if (!token) return;
    try {
      const [servicesRes, deploymentsRes, hardwareRes, storageRes] = await Promise.all([
        fetch(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/deployments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/storage`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setServices(await servicesRes.json());
      setDeployments(await deploymentsRes.json());
      setHardware(await hardwareRes.json());
      setStorageItems(await storageRes.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const resetServiceForm = () => {
    setNewServiceName('');
    setNewServiceType(DEFAULT_SOFTWARE_TYPE);
    setNewServicePort('');
    setNewServiceUrl('');
    setNewServiceImage('');
    setNewServiceStorageIds([]);
  };

  const handleAddService = () => {
    setServiceEditId(null);
    setEditingService(null);
    setEditingDeployment(null);
    resetServiceForm();
    setIsServiceModalOpen(true);
  };

  const handleEditService = (service: any) => {
    const linkedDeployments = deployments.filter(
      (dep) => String(dep.softwareUnitId) === String(service.id)
    );
    const editableDeployment = linkedDeployments[0] || null;

    setServiceEditId(String(service.id));
    setEditingService(service);
    setEditingDeployment(editableDeployment);
    setEditingServiceStorageIds(
      Array.isArray(service.storageAssignments)
        ? service.storageAssignments
            .map((assignment: any) => String(assignment.storageId || assignment.storage?.id || ''))
            .filter(Boolean)
        : []
    );
    setIsServiceModalOpen(true);
  };

  const saveNewService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const response = await fetch(`${API_BASE}/services`, {
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save service'}`);
      return;
    }

    setIsServiceModalOpen(false);
    setServiceEditId(null);
    setEditingService(null);
    setEditingDeployment(null);
    await fetchServices();
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

    const serviceRes = await fetch(`${API_BASE}/services/${values.serviceId}`, {
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

    if (!serviceRes.ok) {
      const errorData = await serviceRes.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save service'}`);
      return;
    }

    if (values.deploymentId) {
      if (!values.hardwareAssetId) {
        alert('Hardware selection is required for deployment updates');
        return;
      }

      const deploymentRes = await fetch(`${API_BASE}/deployments/${values.deploymentId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          hardwareAssetId: values.hardwareAssetId,
          softwareUnitId: values.serviceId,
          internalIp: values.internalIp
        })
      });

      if (!deploymentRes.ok) {
        const deploymentError = await deploymentRes.json().catch(() => ({}));
        alert(`Error: ${deploymentError.error || 'Failed to update deployment'}`);
        return;
      }
    }

    setIsServiceModalOpen(false);
    setServiceEditId(null);
    setEditingService(null);
    setEditingDeployment(null);
    await fetchServices();
  };

  const deleteService = async () => {
    if (!token || !editingService?.id) return;
    if (!window.confirm('Delete this service including linked child entries?')) return;

    const response = await fetch(`${API_BASE}/services/${String(editingService.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete service'}`);
      return;
    }

    setIsServiceModalOpen(false);
    setServiceEditId(null);
    setEditingService(null);
    setEditingDeployment(null);
    await fetchServices();
  };

  const deploymentEndpointsByService = useMemo(() => {
    const endpoints = new Map<string, Array<{ label: string; href: string }>>();

    const portByService = new Map<string, string>();
    for (const service of services) {
      const serviceId = String(service.id || '');
      if (!serviceId) continue;
      const portNumber = Number(service.port);
      const portLabel = Number.isFinite(portNumber) && portNumber > 0 ? String(portNumber) : '';
      portByService.set(serviceId, portLabel);
    }

    for (const dep of deployments) {
      const serviceId = dep.softwareUnitId ? String(dep.softwareUnitId) : '';
      const ip = String(dep.internalIp || '').trim();
      if (!serviceId || !ip) continue;

      const port = portByService.get(serviceId) || '';
      const label = port ? `${ip}:${port}` : ip;
      const href = port ? `http://${ip}:${port}` : `http://${ip}`;

      const list = endpoints.get(serviceId) || [];
      if (!list.some((entry) => entry.label === label)) {
        list.push({ label, href });
      }
      endpoints.set(serviceId, list);
    }

    for (const [serviceId, list] of endpoints.entries()) {
      list.sort((a, b) => a.label.localeCompare(b.label));
      endpoints.set(serviceId, list);
    }

    return endpoints;
  }, [deployments, services]);

  const sortedServices = useMemo(() => {
    const sorted = [...services].sort((a, b) => {
      let result = 0;
      if (sortKey === 'port') {
        const aPort = Number(a.port || 0);
        const bPort = Number(b.port || 0);
        result = aPort - bPort;
      } else {
        const aValue = (() => {
          switch (sortKey) {
            case 'type':
              return getSoftwareTypeLabel(a.type).toLowerCase();
            case 'ipPort':
              return (deploymentEndpointsByService.get(String(a.id)) || [])
                .map((entry) => entry.label)
                .join(', ')
                .toLowerCase();
            case 'storage':
              return getServiceStorageNames(a).join(', ').toLowerCase();
            default:
              return String(a[sortKey] || '').toLowerCase();
          }
        })();

        const bValue = (() => {
          switch (sortKey) {
            case 'type':
              return getSoftwareTypeLabel(b.type).toLowerCase();
            case 'ipPort':
              return (deploymentEndpointsByService.get(String(b.id)) || [])
                .map((entry) => entry.label)
                .join(', ')
                .toLowerCase();
            case 'storage':
              return getServiceStorageNames(b).join(', ').toLowerCase();
            default:
              return String(b[sortKey] || '').toLowerCase();
          }
        })();

        result = aValue.localeCompare(bValue);
      }

      return sortDirection === 'asc' ? result : -result;
    });

    return sorted;
  }, [services, deploymentEndpointsByService, sortKey, sortDirection]);

  const handleSort = (key: ServiceSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  return (
    <div className="documentation-area page-shell relative">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">Software/Services</h2>
          <Button onClick={handleAddService} className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168, 85, 247, 0.5)] transition-all" variant="primary">+ Add service</Button>
        </div>
        <div className="page-content-scroll">
          <Card className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700/50">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">
                    <button type="button" onClick={() => handleSort('name')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                      Name <span>{sortIndicator(sortKey === 'name', sortDirection)}</span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">
                    <button type="button" onClick={() => handleSort('type')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                      Type <span>{sortIndicator(sortKey === 'type', sortDirection)}</span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">
                    <button type="button" onClick={() => handleSort('port')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                      Port <span>{sortIndicator(sortKey === 'port', sortDirection)}</span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">
                    <button type="button" onClick={() => handleSort('ipPort')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                      IP+Port <span>{sortIndicator(sortKey === 'ipPort', sortDirection)}</span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">
                    <button type="button" onClick={() => handleSort('url')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                      URL <span>{sortIndicator(sortKey === 'url', sortDirection)}</span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">
                    <button type="button" onClick={() => handleSort('storage')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                      Disks <span>{sortIndicator(sortKey === 'storage', sortDirection)}</span>
                    </button>
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedServices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">No services available.</td>
                  </tr>
                )}
                {sortedServices.map(sw => (
                  <tr key={sw.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-100">{sw.name}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{getSoftwareTypeLabel(sw.type)}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-sm">{sw.port || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {(() => {
                        const endpoints = deploymentEndpointsByService.get(String(sw.id)) || [];
                        if (endpoints.length === 0) return <span className="text-slate-400">-</span>;

                        return (
                          <div className="flex flex-wrap gap-1.5">
                            {endpoints.map((endpoint) => (
                              <a
                                key={`${sw.id}-${endpoint.href}`}
                                href={endpoint.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/12 px-2 py-0.5 text-[11px] text-blue-300 hover:bg-blue-500/20"
                              >
                                {endpoint.label}
                              </a>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-purple-400 text-sm">
                      {sw.url
                        ? (
                          <a
                            href={toNavigableUrl(sw.url) || undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {sw.url}
                          </a>
                        )
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {(() => {
                        const storageNames = getServiceStorageNames(sw);
                        if (storageNames.length === 0) return '-';

                        return (
                          <div className="flex flex-wrap gap-1.5">
                            {storageNames.map((name) => (
                              <span
                                key={`${sw.id}-${name}`}
                                className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/70 px-2 py-0.5 text-[11px] text-slate-100"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" onClick={() => handleEditService(sw)} className="text-xs text-purple-400 hover:text-purple-400/80 !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {serviceEditId ? (
        <EditService
          isOpen={isServiceModalOpen}
          service={editingService}
          deployment={editingDeployment}
          hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
          storageOptions={storageItems.map((item) => ({ id: String(item.id), name: item.name }))}
          initialStorageIds={editingServiceStorageIds}
          deploymentContextHint={editingDeployment ? undefined : 'No deployment found for this service. Service fields can still be edited.'}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={saveEditedService}
          onDelete={deleteService}
        />
      ) : (
        <AddService
          isOpen={isServiceModalOpen}
          title="Add Service"
          submitLabel="Save Service"
          name={newServiceName}
          type={newServiceType}
          port={newServicePort}
          url={newServiceUrl}
          image={newServiceImage}
          storageOptions={storageItems.map((item) => ({ id: String(item.id), name: item.name }))}
          selectedStorageIds={newServiceStorageIds}
          onSelectedStorageIdsChange={setNewServiceStorageIds}
          onClose={() => setIsServiceModalOpen(false)}
          onSubmit={saveNewService}
          onNameChange={setNewServiceName}
          onTypeChange={setNewServiceType}
          onPortChange={setNewServicePort}
          onUrlChange={setNewServiceUrl}
          onImageChange={setNewServiceImage}
        />
      )}
    </div>
  );
}
