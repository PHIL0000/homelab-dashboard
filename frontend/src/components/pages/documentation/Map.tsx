import { useEffect, useMemo, useState } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

const API_BASE = 'http://localhost:3001/api/infrastructure';

export default function DocumentationMap() {
  const { token } = useAuth();
  const [hardware, setHardware] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [hwRes, swRes, depRes] = await Promise.all([
          fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/deployments`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setHardware(await hwRes.json());
        setServices(await swRes.json());
        setDeployments(await depRes.json());
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [token]);

  const deploymentByHardware = useMemo(() => {
    const grouped = new Map<string, any[]>();
    for (const dep of deployments) {
      const key = dep.hardwareAssetId || 'unknown';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(dep);
    }
    return grouped;
  }, [deployments]);

  const deployedServiceIds = useMemo(() => {
    return new Set(deployments.map(dep => dep.softwareUnitId).filter(Boolean));
  }, [deployments]);

  const unassignedServices = useMemo(() => {
    return services.filter(sw => !deployedServiceIds.has(sw.id));
  }, [services, deployedServiceIds]);

  return (
  <div className="documentation-area page-shell">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">Infrastructure Map</h2>
        </div>

        <div className="page-content-scroll">
  <Card className="rounded-xl border border-border bg-content p-6 mb-6">
        <h3 className="text-lg font-semibold text-text mb-4">Hardware → Services Tree</h3>
        <div className="space-y-4">
          {hardware.length === 0 && <p className="text-text-secondary">No hardware available.</p>}

          {hardware.map(hw => {
            const deps = deploymentByHardware.get(hw.id) || [];
            return (
              <div key={hw.id} className="border border-border rounded-lg p-4 bg-background/40">
                <div className="font-semibold text-primary">🖥 {hw.name}</div>
                <div className="text-xs text-text-secondary mt-1">{hw.type || 'OTHER'} • {hw.ip || 'no ip'} • {hw.status || 'UNKNOWN'}</div>

                <div className="mt-3 pl-4 border-l border-border space-y-2">
                  {deps.length === 0 && <p className="text-sm text-text-secondary">└─ No deployed services</p>}

                  {deps.map(dep => (
                    <div key={dep.id} className="text-sm">
                      <p className="text-text">└─ ⚙️ {dep.softwareUnit?.name || 'Unknown service'}</p>
                      <p className="ml-6 text-xs text-text-secondary">{dep.softwareUnit?.type || 'OTHER'} • {dep.internalIp || 'no internal ip'} • {dep.status || 'UNKNOWN'}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

  <Card className="rounded-xl border border-border bg-content p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Services ohne Deployment</h3>
        {unassignedServices.length === 0 ? (
          <p className="text-text-secondary">All services are currently assigned to hardware.</p>
        ) : (
          <ul className="space-y-2">
            {unassignedServices.map(sw => (
              <li key={sw.id} className="text-sm text-text">
                ⚙️ {sw.name} <span className="text-text-secondary">({sw.type || 'OTHER'})</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
        </div>
      </div>
    </div>
  );
}