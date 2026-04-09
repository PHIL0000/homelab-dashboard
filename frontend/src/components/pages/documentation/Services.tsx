import { useMemo, useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function Services() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);

  const fetchServices = () => {
    if (!token) return;
    Promise.all([
      fetch('http://localhost:3001/api/infrastructure/services', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3001/api/infrastructure/deployments', { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([servicesRes, deploymentsRes]) => {
        setServices(await servicesRes.json());
        setDeployments(await deploymentsRes.json());
      });
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const deploymentCountByService = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dep of deployments) {
      const key = dep.softwareUnitId;
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [deployments]);

  return (
  <div className="documentation-area p-6 max-w-5xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Software Services (Overview)</h2>
      </div>
  <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-background border-b border-border">
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Port</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Domain</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Deployments</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {services.length === 0 && (
               <tr>
                 <td colSpan={5} className="px-4 py-6 text-center text-text-secondary">No services available.</td>
               </tr>
             )}
             {services.map(sw => (
               <tr key={sw.id} className="hover:bg-background/50 transition-colors">
                 <td className="px-4 py-3 font-medium text-text">{sw.name}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{sw.type}</td>
                 <td className="px-4 py-3 text-text-secondary font-mono text-sm">{sw.port || '-'}</td>
                 <td className="px-4 py-3 text-primary text-sm">{sw.domain ? <a href={`https://${sw.domain}`} target="_blank" rel="noreferrer" className="hover:underline">{sw.domain}</a> : '-'}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{deploymentCountByService.get(sw.id) || 0}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </Card>
    </div>
  );
}
