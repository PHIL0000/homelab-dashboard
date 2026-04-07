import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function DocsOverview() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [hardware, setHardware] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3001/api/infrastructure/hardware', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setHardware(data));
  }, [token]);

  return (
    <div className="p-6 max-w-4xl h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-text">{t('nav.docs.overview')}</h2>
      <div className="space-y-6">
        {hardware.map(hw => (
          <Card key={hw.id} className="p-4 bg-content border border-border flex flex-col gap-2">
            <h3 className="text-xl font-bold text-primary">{hw.name} <span className="text-sm text-text-secondary">({hw.type})</span></h3>
            <p className="text-sm text-text-secondary mb-4">{hw.ip} - {hw.os}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hw.deployments?.map((dep: any) => (
                <div key={dep.id} className="p-3 border border-border rounded-lg bg-background">
                  <p className="font-semibold text-text">{dep.softwareUnit?.name}</p>
                  <p className="text-xs text-text-secondary">Type: {dep.softwareUnit?.type}</p>
                </div>
              ))}
              {!hw.deployments?.length && <p className="text-sm text-text-secondary">No services deployed.</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
