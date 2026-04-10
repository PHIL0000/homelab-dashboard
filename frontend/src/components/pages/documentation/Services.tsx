import { useMemo, useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import AddService from './components/AddService';
import EditService from './components/EditService';

const API_BASE = 'http://localhost:3001/api/infrastructure';
const DEFAULT_SOFTWARE_TYPE = 'DOCKER_CONTAINER';

export default function Services() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceEditId, setServiceEditId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [editingDeployment, setEditingDeployment] = useState<any | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceType, setNewServiceType] = useState(DEFAULT_SOFTWARE_TYPE);
  const [newServicePort, setNewServicePort] = useState('');
  const [newServiceUrl, setNewServiceUrl] = useState('');
  const [newServiceImage, setNewServiceImage] = useState('');

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const fetchServices = async () => {
    if (!token) return;
    try {
      const [servicesRes, deploymentsRes, hardwareRes] = await Promise.all([
        fetch(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/deployments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setServices(await servicesRes.json());
      setDeployments(await deploymentsRes.json());
      setHardware(await hardwareRes.json());
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
        url: newServiceUrl.trim() || null
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
        url: values.url || null
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

  const deploymentCountByService = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dep of deployments) {
      const key = dep.softwareUnitId ? String(dep.softwareUnitId) : '';
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [deployments]);

  return (
    <div className="documentation-area page-shell relative">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">Software/Services</h2>
          <button onClick={handleAddService} className="text-sm text-primary hover:text-primary/80">+ Add service</button>
        </div>
        <div className="page-content-scroll">
          <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-secondary">Port</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-secondary">URL</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-secondary">Deployments</th>
                  <th className="px-4 py-3 text-sm font-medium text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-text-secondary">No services available.</td>
                  </tr>
                )}
                {services.map(sw => (
                  <tr key={sw.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-text">{sw.name}</td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{sw.type}</td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-sm">{sw.port || '-'}</td>
                    <td className="px-4 py-3 text-primary text-sm">
                      {sw.url
                        ? (
                          <a
                            href={String(sw.url).startsWith('http://') || String(sw.url).startsWith('https://') ? sw.url : `https://${sw.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {sw.url}
                          </a>
                        )
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{deploymentCountByService.get(String(sw.id)) || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => handleEditService(sw)} className="text-xs text-primary hover:text-primary/80">Edit</button>
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
