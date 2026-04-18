import { useState, useEffect, useMemo } from 'react';
import { Button, Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import AddStorage, { getStorageTypeLabel, type StorageFormValues } from './components/AddStorage';
import EditStorage from './components/EditStorage';

const API_BASE = 'http://localhost:3001/api/infrastructure';
const DEFAULT_STORAGE_TYPE = 'SSD';

type StorageSortKey = 'name' | 'type' | 'makeModel' | 'size' | 'hardwareNode' | 'service';

function sortIndicator(active: boolean, direction: 'asc' | 'desc') {
  if (!active) return '↕';
  return direction === 'asc' ? '↑' : '↓';
}

const getAssignedServiceNames = (item: any): string[] => {
  if (!Array.isArray(item?.serviceAssignments)) return [];
  return item.serviceAssignments
    .map((assignment: any) => String(assignment.softwareUnit?.name || ''))
    .filter(Boolean)
    .sort((a: string, b: string) => a.localeCompare(b));
};

export default function StorageItems() {
  const { token } = useAuth();
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [storageEditId, setStorageEditId] = useState<string | null>(null);
  const [editingStorage, setEditingStorage] = useState<any | null>(null);
  const [sortKey, setSortKey] = useState<StorageSortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [storageRes, hardwareRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE}/storage`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStorageItems(await storageRes.json());
      setHardware(await hardwareRes.json());
      setServices(await servicesRes.json());
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

  const sortedStorageItems = useMemo(() => {
    const sorted = [...storageItems].sort((a, b) => {
      let result = 0;

      if (sortKey === 'size') {
        const aSize = Number(a.usableSpaceGB || 0);
        const bSize = Number(b.usableSpaceGB || 0);
        result = aSize - bSize;
      } else {
        const aValue = (() => {
          switch (sortKey) {
            case 'name':
              return String(a.name || '').toLowerCase();
            case 'type':
              return getStorageTypeLabel(String(a.storageType || 'OTHER')).toLowerCase();
            case 'makeModel':
              return String([a.make, a.model].filter(Boolean).join(' ') || '').toLowerCase();
            case 'hardwareNode':
              return String(a.hardwareAsset?.name || '').toLowerCase();
            case 'service':
              return getAssignedServiceNames(a).join(', ').toLowerCase();
            default:
              return '';
          }
        })();

        const bValue = (() => {
          switch (sortKey) {
            case 'name':
              return String(b.name || '').toLowerCase();
            case 'type':
              return getStorageTypeLabel(String(b.storageType || 'OTHER')).toLowerCase();
            case 'makeModel':
              return String([b.make, b.model].filter(Boolean).join(' ') || '').toLowerCase();
            case 'hardwareNode':
              return String(b.hardwareAsset?.name || '').toLowerCase();
            case 'service':
              return getAssignedServiceNames(b).join(', ').toLowerCase();
            default:
              return '';
          }
        })();

        result = aValue.localeCompare(bValue);
      }

      return sortDirection === 'asc' ? result : -result;
    });

    return sorted;
  }, [storageItems, sortKey, sortDirection]);

  const handleSort = (key: StorageSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
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
        hardwareAssetId: values.hardwareAssetId,
        serviceIds: values.softwareUnitIds || []
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
          <Button onClick={handleAddStorage} className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168, 85, 247, 0.5)] transition-all" variant="primary">+ Add storage</Button>
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
                <button type="button" onClick={() => handleSort('makeModel')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                  Make / Model <span>{sortIndicator(sortKey === 'makeModel', sortDirection)}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">
                <button type="button" onClick={() => handleSort('size')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                  Size <span>{sortIndicator(sortKey === 'size', sortDirection)}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">
                <button type="button" onClick={() => handleSort('hardwareNode')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                  Hardware <span>{sortIndicator(sortKey === 'hardwareNode', sortDirection)}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">
                <button type="button" onClick={() => handleSort('service')} className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors">
                  Service <span>{sortIndicator(sortKey === 'service', sortDirection)}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedStorageItems.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-400">No storage items found.</td></tr>
            )}
            {sortedStorageItems.map(item => {
              const assignedServiceNames = getAssignedServiceNames(item);

              return (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-100">{item.name}</td>
                  <td className="px-4 py-3 text-slate-400">{getStorageTypeLabel(item.storageType)}</td>
                  <td className="px-4 py-3 text-slate-400">{[item.make, item.model].filter(Boolean).join(' ') || '-'}</td>
                  <td className="px-4 py-3 text-slate-400">{displaySpace(item.usableSpaceGB)}</td>
                  <td className="px-4 py-3 text-slate-400">{item.hardwareAsset?.name || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {assignedServiceNames.length === 0 ? (
                      '-'
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedServiceNames.map((serviceName) => (
                          <span
                            key={`${item.id}-${serviceName}`}
                            className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/70 px-2 py-0.5 text-xs text-slate-100"
                          >
                            {serviceName}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" onClick={() => handleEditStorage(item)} className="text-xs text-purple-400 hover:text-purple-400/80 !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Edit</Button>
                  </td>
                </tr>
              );
            })}
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
          serviceOptions={services.map((sw) => ({ id: String(sw.id), name: sw.name }))}
          onClose={() => setIsStorageModalOpen(false)}
          onSave={saveStorage}
          onDelete={deleteStorage}
        />
      ) : (
        <AddStorage
          isOpen={isStorageModalOpen}
          initialValues={{ type: DEFAULT_STORAGE_TYPE }}
          hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
          serviceOptions={services.map((sw) => ({ id: String(sw.id), name: sw.name }))}
          onClose={() => setIsStorageModalOpen(false)}
          onSave={saveStorage}
        />
      )}
    </div>
  );
}
