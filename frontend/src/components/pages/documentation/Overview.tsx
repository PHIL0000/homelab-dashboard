import { useMemo, useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function DocsOverview() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [hardware, setHardware] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const [hwRes, depRes, storageRes] = await Promise.all([
        fetch('http://localhost:3001/api/infrastructure/hardware', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/infrastructure/deployments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/infrastructure/storage', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setHardware(await hwRes.json());
      setDeployments(await depRes.json());
      setStorageItems(await storageRes.json());
    };

    fetchData();
  }, [token]);

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
    <div className="p-6 max-w-4xl h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-text">{t('nav.docs.hardware')}</h2>
      <div className="space-y-6">
        {hardware.length === 0 && (
          <Card className="p-4 bg-content border border-border text-text-secondary">
            Keine Hardware-Einträge vorhanden.
          </Card>
        )}

        {hardware.map(hw => (
          <Card key={hw.id} className="p-4 bg-content border border-border flex flex-col gap-2">
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
  );
}
