import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function StorageItems() {
  const { token } = useAuth();
  const [storageItems, setStorageItems] = useState<any[]>([]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const storageRes = await fetch('http://localhost:3001/api/infrastructure/storage', { headers: { Authorization: `Bearer ${token}` } });
      setStorageItems(await storageRes.json());
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

  return (
    <div className="p-6 max-w-5xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Storage (Overview)</h2>
      </div>
      <Card className="border border-border bg-content p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Size</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Hardware Node</th>
              <th className="px-4 py-3 text-sm font-medium text-text-secondary">Service</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {storageItems.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-text-secondary">No storage items found.</td></tr>
            )}
            {storageItems.map(item => (
              <tr key={item.id} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 font-medium text-text">{item.name}</td>
                <td className="px-4 py-3 text-text-secondary">{item.storageType}</td>
                <td className="px-4 py-3 text-text-secondary">{displaySpace(item.usableSpaceGB)}</td>
                <td className="px-4 py-3 text-text-secondary">{item.hardwareAsset?.name || 'Unassigned'}</td>
                <td className="px-4 py-3 text-text-secondary">{item.softwareUnit?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
