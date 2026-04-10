import { useMemo, useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AddHardware, { type HardwareFormValues } from './components/AddHardware';
import EditHardware from './components/EditHardware';

const API_BASE = 'http://localhost:3001/api/infrastructure';

export default function Hardware() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [hardware, setHardware] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);

  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [hardwareEditId, setHardwareEditId] = useState<string | null>(null);
  const [editingHardware, setEditingHardware] = useState<any | null>(null);

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  const fetchData = async () => {
    if (!token) return;

    const [hwRes, depRes, storageRes] = await Promise.all([
      fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/deployments`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/storage`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    setHardware(await hwRes.json());
    setDeployments(await depRes.json());
    setStorageItems(await storageRes.json());
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const saveHardware = async (values: HardwareFormValues) => {
    if (!token) return;

    const isEdit = Boolean(hardwareEditId);
    const url = isEdit ? `${API_BASE}/hardware/${hardwareEditId}` : `${API_BASE}/hardware`;
    const method = isEdit ? 'PUT' : 'POST';

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save hardware'}`);
      return;
    }

    setIsHardwareModalOpen(false);
    setHardwareEditId(null);
    setEditingHardware(null);
    await fetchData();
  };

  const handleAddHardware = () => {
    setHardwareEditId(null);
    setEditingHardware(null);
    setIsHardwareModalOpen(true);
  };

  const handleEditHardware = (hw: any) => {
    setHardwareEditId(String(hw.id));
    setEditingHardware(hw);
    setIsHardwareModalOpen(true);
  };

  const deleteHardware = async () => {
    if (!token || !hardwareEditId) return;
    if (!window.confirm('Delete this hardware including its child entries?')) return;

    const response = await fetch(`${API_BASE}/hardware/${hardwareEditId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete hardware'}`);
      return;
    }

    setIsHardwareModalOpen(false);
    setHardwareEditId(null);
    setEditingHardware(null);
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
          <button onClick={handleAddHardware} className="text-sm text-primary hover:text-primary/80">+ Add hardware</button>
        </div>

        <div className="space-y-6 flex-1 min-h-0 overflow-y-auto pr-1">
        {hardware.length === 0 && (
          <Card className="rounded-xl p-4 bg-content border border-border text-text-secondary">
            No hardware entries available.
          </Card>
        )}

        {hardware.map(hw => (
          <Card key={hw.id} className="rounded-xl p-4 bg-content border border-border flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-primary">{hw.name} <span className="text-sm text-text-secondary">({hw.type})</span></h3>
              <button type="button" onClick={() => handleEditHardware(hw)} className="text-xs text-primary hover:text-primary/80">Edit</button>
            </div>
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

      {hardwareEditId ? (
        <EditHardware
          isOpen={isHardwareModalOpen}
          hardware={editingHardware}
          onClose={() => setIsHardwareModalOpen(false)}
          onSave={saveHardware}
          onDelete={deleteHardware}
        />
      ) : (
        <AddHardware
          isOpen={isHardwareModalOpen}
          onClose={() => setIsHardwareModalOpen(false)}
          onSave={saveHardware}
        />
      )}

    </div>
  );
}
