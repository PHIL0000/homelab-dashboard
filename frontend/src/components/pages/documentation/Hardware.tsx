import { useMemo, useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AddHardware from './components/AddHardware';
import AddService from './components/AddService';
import AddStorage from './components/AddStorage';
import AddMarkdown from './components/AddMarkdown';

const API_BASE = 'http://localhost:3001/api/infrastructure';

const ensureMarkdownFilename = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return '';
  return normalized.toLowerCase().endsWith('.md') ? normalized : `${normalized}.md`;
};

export default function Hardware() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [hardware, setHardware] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);

  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [hostname, setHostname] = useState('');
  const [type, setType] = useState('SERVER');
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

  const [serviceName, setServiceName] = useState('');
  const [serviceType, setServiceType] = useState('DOCKER_CONTAINER');
  const [serviceImage, setServiceImage] = useState('');
  const [servicePort, setServicePort] = useState('');
  const [serviceUrl, setServiceUrl] = useState('');

  const [storageName, setStorageName] = useState('');
  const [storageType, setStorageType] = useState('SSD');
  const [storageMake, setStorageMake] = useState('');
  const [storageModel, setStorageModel] = useState('');
  const [storageSerialNumber, setStorageSerialNumber] = useState('');
  const [storageInterface, setStorageInterface] = useState('');
  const [usableSpace, setUsableSpace] = useState<number | ''>('');
  const [spaceUnit, setSpaceUnit] = useState<'GB' | 'TB'>('GB');
  const [storageHardwareAssetId, setStorageHardwareAssetId] = useState('');

  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docHardwareAssetId, setDocHardwareAssetId] = useState('');
  const [docSoftwareUnitId, setDocSoftwareUnitId] = useState('');
  const [docParentDocId, setDocParentDocId] = useState('');

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const fetchData = async () => {
    if (!token) return;

    const [hwRes, depRes, storageRes, servicesRes, docsRes] = await Promise.all([
      fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/deployments`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/storage`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/docs`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    setHardware(await hwRes.json());
    setDeployments(await depRes.json());
    setStorageItems(await storageRes.json());
    setServices(await servicesRes.json());
    setDocs(await docsRes.json());
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const saveHardware = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const response = await fetch(`${API_BASE}/hardware`, {
      method: 'POST',
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save hardware'}`);
      return;
    }

    setIsHardwareModalOpen(false);
    await fetchData();
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const response = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: serviceName.trim(),
        type: serviceType,
        image: serviceImage.trim() || null,
        port: servicePort ? Number(servicePort) : null,
        url: serviceUrl.trim() || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save service'}`);
      return;
    }

    setIsServiceModalOpen(false);
    await fetchData();
  };

  const saveStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !storageHardwareAssetId) {
      alert('Please select a hardware node.');
      return;
    }

    const usableSpaceGB = spaceUnit === 'TB' ? Number(usableSpace) * 1000 : Number(usableSpace);
    const response = await fetch(`${API_BASE}/storage`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: storageName,
        storageType,
        make: storageMake || null,
        model: storageModel || null,
        serialNumber: storageSerialNumber || null,
        interface: storageInterface || null,
        usableSpaceGB,
        hardwareAssetId: storageHardwareAssetId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save storage'}`);
      return;
    }

    setIsStorageModalOpen(false);
    await fetchData();
  };

  const saveMarkdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const normalizedTitle = ensureMarkdownFilename(docTitle);
    if (!normalizedTitle) {
      alert('Title is required');
      return;
    }

    const response = await fetch(`${API_BASE}/docs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: normalizedTitle,
        content: docContent,
        hardwareAssetId: docHardwareAssetId || undefined,
        softwareUnitId: docSoftwareUnitId || undefined,
        parentDocId: docParentDocId || undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save document'}`);
      return;
    }

    setIsDocModalOpen(false);
    await fetchData();
  };

  const deploymentCountByHardware = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dep of deployments) {
      const key = dep.hardwareAssetId;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [deployments]);

  const storageCountByHardware = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of storageItems) {
      const key = item.hardwareAssetId;
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [storageItems]);

  return (
  <div className="documentation-area page-shell">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">{t('nav.docs.hardware')}</h2>
        </div>

        <div className="space-y-6 flex-1 min-h-0 overflow-y-auto pr-1">
        {hardware.length === 0 && (
          <Card className="rounded-xl p-4 bg-content border border-border text-text-secondary">
            No hardware entries available.
          </Card>
        )}

        {hardware.map(hw => (
          <Card key={hw.id} className="rounded-xl p-4 bg-content border border-border flex flex-col gap-2">
            <h3 className="text-xl font-bold text-primary">{hw.name} <span className="text-sm text-text-secondary">({hw.type})</span></h3>
            <p className="text-sm text-text-secondary">{hw.ip || '-'} • {hw.os || '-'}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="p-3 border border-border rounded-lg bg-background">
                <p className="text-xs text-text-secondary">RAM</p>
                <p className="font-semibold text-text">{hw.ram ? `${hw.ram} GB` : '-'}</p>
              </div>
              <div className="p-3 border border-border rounded-lg bg-background">
                <p className="text-xs text-text-secondary">Services (deployed)</p>
                <p className="font-semibold text-text">{deploymentCountByHardware.get(hw.id) || 0}</p>
              </div>
              <div className="p-3 border border-border rounded-lg bg-background">
                <p className="text-xs text-text-secondary">Storage Items</p>
                <p className="font-semibold text-text">{storageCountByHardware.get(hw.id) || 0}</p>
              </div>
            </div>
          </Card>
        ))}
        </div>
      </div>

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

      <AddService
        isOpen={isServiceModalOpen}
        title="Add Service"
        submitLabel="Save Service"
        name={serviceName}
        type={serviceType}
        port={servicePort}
        url={serviceUrl}
        image={serviceImage}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={saveService}
        onNameChange={setServiceName}
        onTypeChange={setServiceType}
        onPortChange={setServicePort}
        onUrlChange={setServiceUrl}
        onImageChange={setServiceImage}
      />

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
        hardwareAssetId={storageHardwareAssetId}
        hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
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
        onHardwareAssetIdChange={setStorageHardwareAssetId}
      />

      <AddMarkdown
        isOpen={isDocModalOpen}
        title={docTitle}
        content={docContent}
        hardwareAssetId={docHardwareAssetId}
        softwareUnitId={docSoftwareUnitId}
        parentDocId={docParentDocId}
        hardwareOptions={hardware}
        serviceOptions={services}
        parentDocOptions={docs}
        onClose={() => setIsDocModalOpen(false)}
        onSubmit={saveMarkdown}
        onTitleChange={setDocTitle}
        onContentChange={setDocContent}
        onHardwareAssetIdChange={setDocHardwareAssetId}
        onSoftwareUnitIdChange={setDocSoftwareUnitId}
        onParentDocIdChange={setDocParentDocId}
      />
    </div>
  );
}
