import { useState, useEffect, useMemo } from 'react';
import { Button, Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import AddStorage, { type StorageFormValues } from './components/AddStorage';
import EditStorage from './components/EditStorage';

const API_BASE = 'http://localhost:3001/api/infrastructure';
const DEFAULT_STORAGE_TYPE = 'SSD';

export default function StorageItems() {
  const { token } = useAuth();
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [storageEditId, setStorageEditId] = useState<string | null>(null);
  const [editingStorage, setEditingStorage] = useState<any | null>(null);

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [storageRes, hardwareRes] = await Promise.all([
        fetch(`${API_BASE}/storage`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStorageItems(await storageRes.json());
      setHardware(await hardwareRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const displaySpace = (gb: number | undefined | null) => {
    if (!gb) return '-';
    if (gb >= 1000 && gb % 1000 === 0) return `${gb / 1000} TB`;
    if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
    return `${gb} GB`;
  };

  const handleAddStorage = () => {
    setStorageEditId(null);
    setEditingStorage(null);
    setIsStorageModalOpen(true);
  };

  const handleEditStorage = (item: any) => {
    setStorageEditId(String(item.id));
    setEditingStorage(item);
    setIsStorageModalOpen(true);
  };

  const saveStorage = async (values: StorageFormValues) => {
    if (!token || !values.hardwareAssetId) {
      alert('Please select a hardware node.');
      return;
    }

    const url = storageEditId
      ? `${API_BASE}/storage/${storageEditId}`
      : `${API_BASE}/storage`;
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
        hardwareAssetId: values.hardwareAssetId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save storage'}`);
      return;
    }

    setIsStorageModalOpen(false);
    setStorageEditId(null);
    setEditingStorage(null);
    await fetchData();
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
    setEditingStorage(null);
    await fetchData();
  };

  return (
  <div className="documentation-area page-shell relative">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">Storage</h2>
          <Button onClick={handleAddStorage} className="text-sm px-3 py-2 rounded-lg bg-primary text-white font-medium hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all" variant="primary">+ Add storage</Button>
        </div>
        <div className="page-content-scroll">
  <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Make / Model</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Serial</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Size</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Hardware Node</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Service</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {storageItems.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-text-secondary">No storage items found.</td></tr>
            )}
            {storageItems.map(item => (
              <tr key={item.id} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 font-medium text-text">{item.name}</td>
                <td className="px-4 py-3 text-text-secondary">{item.storageType}</td>
                <td className="px-4 py-3 text-text-secondary">{[item.make, item.model].filter(Boolean).join(' ') || '-'}</td>
                <td className="px-4 py-3 text-text-secondary">{item.serialNumber || '-'}</td>
                <td className="px-4 py-3 text-text-secondary">{displaySpace(item.usableSpaceGB)}</td>
                <td className="px-4 py-3 text-text-secondary">{item.hardwareAsset?.name || 'Unassigned'}</td>
                <td className="px-4 py-3 text-text-secondary">{item.softwareUnit?.name || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <Button type="button" onClick={() => handleEditStorage(item)} className="text-xs text-primary hover:text-primary/80 !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
        </div>
      </div>

      {storageEditId ? (
        <EditStorage
          isOpen={isStorageModalOpen}
          storage={editingStorage}
          hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
          onClose={() => setIsStorageModalOpen(false)}
          onSave={saveStorage}
          onDelete={deleteStorage}
        />
      ) : (
        <AddStorage
          isOpen={isStorageModalOpen}
          initialValues={{ type: DEFAULT_STORAGE_TYPE }}
          hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
          onClose={() => setIsStorageModalOpen(false)}
          onSave={saveStorage}
        />
      )}
    </div>
  );
}
