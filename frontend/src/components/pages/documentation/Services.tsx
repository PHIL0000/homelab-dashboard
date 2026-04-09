import { useMemo, useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

type DocItem = {
  id: string;
  title: string;
  parentDocId?: string | null;
  softwareUnitId?: string | null;
};

export default function Services() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);

  const fetchServices = () => {
    if (!token) return;
    Promise.all([
      fetch('http://localhost:3001/api/infrastructure/services', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3001/api/infrastructure/deployments', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3001/api/infrastructure/storage', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3001/api/infrastructure/docs', { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([servicesRes, deploymentsRes, storageRes, docsRes]) => {
        setServices(await servicesRes.json());
        setDeployments(await deploymentsRes.json());
        setStorageItems(await storageRes.json());
        setDocs(await docsRes.json());
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

  const collectDocSubtreeIds = (rootIds: string[]) => {
    const childrenByParent = new Map<string, string[]>();
    for (const doc of docs) {
      if (!doc.parentDocId) continue;
      const existing = childrenByParent.get(doc.parentDocId) || [];
      existing.push(doc.id);
      childrenByParent.set(doc.parentDocId, existing);
    }

    const seen = new Set<string>();
    const stack = [...rootIds];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (seen.has(current)) continue;
      seen.add(current);

      const children = childrenByParent.get(current) || [];
      for (const childId of children) {
        if (!seen.has(childId)) stack.push(childId);
      }
    }

    return Array.from(seen);
  };

  const deleteService = async (service: any) => {
    if (!token) return;

    const relatedDeployments = deployments.filter((dep) => String(dep.softwareUnitId) === String(service.id));
    const relatedStorage = storageItems.filter((item) => String(item.softwareUnitId) === String(service.id));
    const serviceRootDocs = docs.filter((doc) => String(doc.softwareUnitId) === String(service.id));
    const docsToDeleteIds = collectDocSubtreeIds(serviceRootDocs.map((doc) => doc.id));
    const docsToDelete = docs.filter((doc) => docsToDeleteIds.includes(doc.id));

    const summaryLines = [
      `• Service: ${service.name}`,
      `• Deployments: ${relatedDeployments.length}`,
      `• Storage entries: ${relatedStorage.length}`,
      `• Markdown documents (incl. childs): ${docsToDelete.length}`
    ];

    if (docsToDelete.length > 0) {
      const docTitles = docsToDelete.map((doc) => doc.title).slice(0, 6);
      summaryLines.push(`• Markdown list: ${docTitles.join(', ')}${docsToDelete.length > 6 ? ' …' : ''}`);
    }

    const confirmationText = [
      'Delete service and related data?',
      '',
      'The following will be removed:',
      ...summaryLines,
      '',
      'This action cannot be undone.'
    ].join('\n');

    if (!window.confirm(confirmationText)) return;

    const response = await fetch(`http://localhost:3001/api/infrastructure/services/${service.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete service'}`);
      return;
    }

    fetchServices();
  };

  return (
  <div className="documentation-area p-6 max-w-5xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Software/Services</h2>
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
                 <td className="px-4 py-3 text-primary text-sm">{sw.domain ? <a href={`https://${sw.domain}`} target="_blank" rel="noreferrer" className="hover:underline">{sw.domain}</a> : '-'}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{deploymentCountByService.get(sw.id) || 0}</td>
                 <td className="px-4 py-3 text-right">
                   <button
                     onClick={() => deleteService(sw)}
                     className="text-red-300 hover:text-red-200 text-sm font-medium"
                   >
                     Delete
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </Card>
    </div>
  );
}
